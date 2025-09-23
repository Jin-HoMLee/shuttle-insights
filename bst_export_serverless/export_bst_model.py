#!/usr/bin/env python3
"""
BST Model Export Script

This script exports BST (Badminton Stroke-type Transformer) models to TorchScript and ONNX formats
for optimized cloud inference deployment.

Usage:
    python export_bst_model.py --model_type BST_CG_AP --weights_path weights/bst_model.pt --output_dir models/bst/weights/exported/

Supported model types:
    - BST_0: Base BST backbone
    - BST: BST with Pose Position Fusion (PPF)  
    - BST_CG: BST with Clean Gate
    - BST_AP: BST with Aim Player
    - BST_CG_AP: BST with Clean Gate and Aim Player (most advanced)

Author: Jin-Ho M. Lee
Created for Issue #65: Export and Optimize BST PyTorch Model for Cloud Inference
"""

import argparse
import os
import sys
import time
from pathlib import Path
from typing import Dict, Any, Tuple

import torch
import torch.jit
from torch import nn, Tensor

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from models.bst.bst import BST_0, BST, BST_CG, BST_AP, BST_CG_AP


class BST_ModelExporter:
    """
    Handles export of BST models to optimized formats for cloud deployment.
    """
    
    # Model type mapping
    MODEL_CLASSES = {
        'BST_0': BST_0,
        'BST': BST,
        'BST_CG': BST_CG,
        'BST_AP': BST_AP,
        'BST_CG_AP': BST_CG_AP,
    }
    
    # Default model parameters based on the original implementation
    DEFAULT_PARAMS = {
        'in_dim': 72,  # (17 + 19 * 1) * 2 = 72 features for 2 people
        'seq_len': 100,  # Typical sequence length for badminton shots
        'n_class': 25,   # Default number of badminton shot classes (adjust based on your dataset)
        'n_people': 2,   # Two players
        'd_model': 100,  # Model dimension
        'd_head': 128,   # Attention head dimension
        'n_head': 6,     # Number of attention heads
        'depth_tem': 2,  # Temporal transformer depth
        'depth_inter': 1, # Interaction transformer depth
        'drop_p': 0.3,   # Dropout probability
        'mlp_d_scale': 4, # MLP dimension scaling
        'tcn_kernel_size': 5  # TCN kernel size
    }
    
    def __init__(self, model_type: str, model_params: Dict[str, Any] = None):
        """
        Initialize the BST model exporter.
        
        Args:
            model_type: Type of BST model to export
            model_params: Model parameters (uses defaults if not provided)
        """
        if model_type not in self.MODEL_CLASSES:
            raise ValueError(f"Unknown model type: {model_type}. Available: {list(self.MODEL_CLASSES.keys())}")
            
        self.model_type = model_type
        self.model_class = self.MODEL_CLASSES[model_type]
        self.model_params = model_params or self.DEFAULT_PARAMS.copy()
        self.model = None
        
    def create_model(self) -> nn.Module:
        """Create and initialize the BST model."""
        print(f"Creating {self.model_type} model with parameters:")
        for key, value in self.model_params.items():
            print(f"  {key}: {value}")
            
        # Filter parameters based on model type
        if self.model_type == 'BST_0':
            # BST_0 doesn't use pos parameter in forward
            filtered_params = {k: v for k, v in self.model_params.items() 
                             if k not in ['depth_inter']}
            filtered_params['depth_inter'] = 1  # BST_0 uses depth_inter=1
        else:
            filtered_params = self.model_params.copy()
            
        self.model = self.model_class(**filtered_params)
        self.model.eval()
        return self.model
        
    def load_weights(self, weights_path: str) -> nn.Module:
        """Load pre-trained weights into the model."""
        if not os.path.exists(weights_path):
            raise FileNotFoundError(f"Weights file not found: {weights_path}")
            
        print(f"Loading weights from: {weights_path}")
        
        # Load weights
        checkpoint = torch.load(weights_path, map_location='cpu')
        
        # Handle different checkpoint formats
        if isinstance(checkpoint, dict):
            if 'model_state_dict' in checkpoint:
                state_dict = checkpoint['model_state_dict']
            elif 'state_dict' in checkpoint:
                state_dict = checkpoint['state_dict']
            else:
                state_dict = checkpoint
        else:
            state_dict = checkpoint
            
        self.model.load_state_dict(state_dict)
        print("Weights loaded successfully")
        return self.model
        
    def create_dummy_inputs(self) -> Tuple[Tensor, ...]:
        """Create dummy inputs for model tracing/scripting."""
        b = 1  # batch size
        t = self.model_params['seq_len']
        n = self.model_params['n_people']
        in_dim = self.model_params['in_dim']
        
        # Create dummy inputs based on model type
        JnB = torch.randn(b, t, n, in_dim, dtype=torch.float)
        shuttle = torch.randn(b, t, 2, dtype=torch.float)
        video_len = torch.tensor([t], dtype=torch.long).repeat(b)
        
        if self.model_type in ['BST', 'BST_CG', 'BST_AP', 'BST_CG_AP']:
            # These models also need pos (position) input
            pos = torch.randn(b, t, n, 2, dtype=torch.float)
            return JnB, shuttle, pos, video_len
        else:
            # BST_0 only needs JnB, shuttle, video_len
            return JnB, shuttle, video_len
            
    def export_to_torchscript(self, output_path: str, method: str = 'script') -> str:
        """
        Export model to TorchScript format.
        
        Args:
            output_path: Path to save the TorchScript model
            method: 'script' or 'trace' for TorchScript conversion
            
        Returns:
            Path to the exported model
        """
        if self.model is None:
            raise ValueError("Model not created. Call create_model() first.")
            
        print(f"Exporting to TorchScript using {method} method...")
        
        if method == 'script':
            try:
                scripted_model = torch.jit.script(self.model)
            except Exception as e:
                print(f"Scripting failed: {e}")
                print("Falling back to tracing method...")
                method = 'trace'
        
        if method == 'trace':
            dummy_inputs = self.create_dummy_inputs()
            print(f"Using dummy inputs with shapes:")
            for i, inp in enumerate(dummy_inputs):
                print(f"  Input {i}: {inp.shape}")
            scripted_model = torch.jit.trace(self.model, dummy_inputs)
            
        # Save the model
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        scripted_model.save(output_path)
        
        print(f"TorchScript model saved to: {output_path}")
        
        # Test the scripted model
        self._test_torchscript_model(output_path)
        
        return output_path
        
    def export_to_onnx(self, output_path: str, opset_version: int = 13) -> str:
        """
        Export model to ONNX format.
        
        Args:
            output_path: Path to save the ONNX model
            opset_version: ONNX opset version
            
        Returns:
            Path to the exported model
        """
        if self.model is None:
            raise ValueError("Model not created. Call create_model() first.")
            
        try:
            import onnx
            import onnxruntime
        except ImportError:
            raise ImportError("ONNX export requires 'onnx' and 'onnxruntime' packages. Install with: pip install onnx onnxruntime")
            
        print(f"Exporting to ONNX format (opset version {opset_version})...")
        
        dummy_inputs = self.create_dummy_inputs()
        
        # Define input names
        if len(dummy_inputs) == 4:
            input_names = ['JnB', 'shuttle', 'pos', 'video_len']
        else:
            input_names = ['JnB', 'shuttle', 'video_len']
            
        output_names = ['shot_predictions']
        
        # Dynamic axes for variable sequence length
        dynamic_axes = {
            'JnB': {1: 'seq_len'},
            'shuttle': {1: 'seq_len'},
            'video_len': {0: 'batch_size'}
        }
        
        if 'pos' in input_names:
            dynamic_axes['pos'] = {1: 'seq_len'}
            
        # Export to ONNX
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        torch.onnx.export(
            self.model,
            dummy_inputs,
            output_path,
            export_params=True,
            opset_version=opset_version,
            do_constant_folding=True,
            input_names=input_names,
            output_names=output_names,
            dynamic_axes=dynamic_axes
        )
        
        print(f"ONNX model saved to: {output_path}")
        
        # Validate the ONNX model
        self._validate_onnx_model(output_path)
        
        return output_path
        
    def _test_torchscript_model(self, model_path: str):
        """Test the exported TorchScript model."""
        print("Testing TorchScript model...")
        
        try:
            # Load and test the model
            loaded_model = torch.jit.load(model_path)
            loaded_model.eval()
            
            dummy_inputs = self.create_dummy_inputs()
            
            with torch.no_grad():
                start_time = time.time()
                output = loaded_model(*dummy_inputs)
                inference_time = time.time() - start_time
                
            print(f"✓ TorchScript model test passed")
            print(f"  Output shape: {output.shape}")
            print(f"  Inference time: {inference_time:.4f}s")
            
        except Exception as e:
            print(f"✗ TorchScript model test failed: {e}")
            
    def _validate_onnx_model(self, model_path: str):
        """Validate the exported ONNX model."""
        print("Validating ONNX model...")
        
        try:
            import onnx
            import onnxruntime as ort
            
            # Load and check the model
            onnx_model = onnx.load(model_path)
            onnx.checker.check_model(onnx_model)
            
            # Test with ONNX Runtime
            ort_session = ort.InferenceSession(model_path)
            
            dummy_inputs = self.create_dummy_inputs()
            
            # Prepare inputs for ONNX Runtime
            if len(dummy_inputs) == 4:
                ort_inputs = {
                    'JnB': dummy_inputs[0].numpy(),
                    'shuttle': dummy_inputs[1].numpy(),
                    'pos': dummy_inputs[2].numpy(),
                    'video_len': dummy_inputs[3].numpy()
                }
            else:
                ort_inputs = {
                    'JnB': dummy_inputs[0].numpy(),
                    'shuttle': dummy_inputs[1].numpy(),
                    'video_len': dummy_inputs[2].numpy()
                }
                
            start_time = time.time()
            ort_outputs = ort_session.run(None, ort_inputs)
            inference_time = time.time() - start_time
            
            print(f"✓ ONNX model validation passed")
            print(f"  Output shape: {ort_outputs[0].shape}")
            print(f"  Inference time: {inference_time:.4f}s")
            
        except ImportError:
            print("⚠ ONNX validation skipped (onnx/onnxruntime not available)")
        except Exception as e:
            print(f"✗ ONNX model validation failed: {e}")
            
    def benchmark_model(self, num_runs: int = 100):
        """Benchmark model inference speed."""
        if self.model is None:
            raise ValueError("Model not created. Call create_model() first.")
            
        print(f"Benchmarking model with {num_runs} runs...")
        
        dummy_inputs = self.create_dummy_inputs()
        
        # Warm up
        for _ in range(10):
            with torch.no_grad():
                _ = self.model(*dummy_inputs)
                
        # Benchmark
        times = []
        for _ in range(num_runs):
            start_time = time.time()
            with torch.no_grad():
                _ = self.model(*dummy_inputs)
            times.append(time.time() - start_time)
            
        avg_time = sum(times) / len(times)
        min_time = min(times)
        max_time = max(times)
        
        print(f"Benchmark results:")
        print(f"  Average time: {avg_time:.4f}s")
        print(f"  Min time: {min_time:.4f}s")
        print(f"  Max time: {max_time:.4f}s")
        print(f"  Throughput: {1/avg_time:.2f} inferences/second")


def main():
    """Main function for command-line usage."""
    parser = argparse.ArgumentParser(description='Export BST models to optimized formats')
    
    parser.add_argument('--model_type', type=str, default='BST_CG_AP',
                       choices=['BST_0', 'BST', 'BST_CG', 'BST_AP', 'BST_CG_AP'],
                       help='Type of BST model to export')
    
    parser.add_argument('--weights_path', type=str, default=None,
                       help='Path to pre-trained weights file (.pt or .pth)')
    
    parser.add_argument('--output_dir', type=str, default='models/bst/weights/exported/',
                       help='Directory to save exported models')
    
    parser.add_argument('--formats', nargs='+', default=['torchscript', 'onnx'],
                       choices=['torchscript', 'onnx'],
                       help='Export formats to generate')
    
    parser.add_argument('--opset_version', type=int, default=13,
                       help='ONNX opset version')
    
    parser.add_argument('--benchmark', action='store_true',
                       help='Run benchmark on the model')
    
    parser.add_argument('--seq_len', type=int, default=100,
                       help='Sequence length for the model')
    
    parser.add_argument('--in_dim', type=int, default=72,
                       help='Input dimension (features per person * n_people)')
    
    args = parser.parse_args()
    
    print("=" * 60)
    print(f"BST Model Exporter")
    print("=" * 60)
    
    # Create custom model parameters if provided
    model_params = BST_ModelExporter.DEFAULT_PARAMS.copy()
    if args.seq_len != 100:
        model_params['seq_len'] = args.seq_len
    if args.in_dim != 72:
        model_params['in_dim'] = args.in_dim
    
    # Initialize exporter
    exporter = BST_ModelExporter(args.model_type, model_params)
    
    # Create model
    model = exporter.create_model()
    
    # Load weights if provided
    if args.weights_path:
        exporter.load_weights(args.weights_path)
    else:
        print("⚠ No weights provided - using random initialization")
        print("  For production use, provide --weights_path with trained weights")
    
    # Run benchmark if requested
    if args.benchmark:
        exporter.benchmark_model()
    
    # Export to requested formats
    base_name = f"{args.model_type.lower()}_seq{args.seq_len}"
    
    if 'torchscript' in args.formats:
        torchscript_path = os.path.join(args.output_dir, f"{base_name}_scripted.pt")
        exporter.export_to_torchscript(torchscript_path)
        print()
        
    if 'onnx' in args.formats:
        onnx_path = os.path.join(args.output_dir, f"{base_name}.onnx")
        exporter.export_to_onnx(onnx_path, args.opset_version)
        print()
    
    print("=" * 60)
    print("Export completed successfully!")
    print(f"Exported models saved in: {args.output_dir}")
    print("=" * 60)


if __name__ == '__main__':
    main()