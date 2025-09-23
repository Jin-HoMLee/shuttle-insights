#!/usr/bin/env python3
"""
Cloud Deployment Example for BST Model

This script demonstrates how to use exported BST models in a cloud environment.
It includes examples for both TorchScript and ONNX formats.

Usage:
    python cloud_deployment_example.py --model_path weights/exported/bst_cg_ap_seq100_scripted.pt
"""

import argparse
import json
import time
import numpy as np
from typing import Dict, List, Any, Tuple

def create_dummy_data(seq_len: int = 100, batch_size: int = 1, seed: int = 42) -> Dict[str, Any]:
    """
    Create dummy input data for testing BST model inference.
    
    Args:
        seq_len: Sequence length for the video
        batch_size: Batch size for inference
        seed: Optional random seed for reproducibility. Default is 42. Set to None for non-deterministic data.
        
    Returns:
        Dictionary containing input tensors
    
    Note:
        Using a fixed seed makes dummy data generation reproducible, which is useful for debugging and regression testing.
        For more comprehensive testing, set seed=None to allow random data generation.
    """
    n_people = 2
    pose_features = 72  # (17 + 19 * 1) * 2
    
    # Generate realistic-looking dummy data
    if seed is not None:
        rng = np.random.default_rng(seed)  # Local random generator for reproducible results
    else:
        rng = np.random.default_rng()
    
    # Joint and bone features (pose estimation output)
    JnB = rng.randn(batch_size, seq_len, n_people, pose_features).astype(np.float32)
    JnB = np.clip(JnB * 0.5 + 0.5, 0, 1)  # Normalize to [0, 1] range
    
    # Shuttlecock trajectory (x, y coordinates)
    shuttle = np.zeros((batch_size, seq_len, 2), dtype=np.float32)
    for b in range(batch_size):
        # Simulate shuttlecock trajectory with some physics
        t = np.linspace(0, 1, seq_len)
        shuttle[b, :, 0] = 0.5 + 0.3 * np.sin(4 * np.pi * t)  # X oscillation
        shuttle[b, :, 1] = 0.8 - 0.6 * t + 0.2 * np.sin(8 * np.pi * t)  # Y with gravity
    
    # Player positions (x, y coordinates for each player)
    pos = np.zeros((batch_size, seq_len, n_people, 2), dtype=np.float32)
    for b in range(batch_size):
        # Player 1: moving back and forth
        pos[b, :, 0, 0] = 0.3 + 0.1 * np.sin(2 * np.pi * np.linspace(0, 1, seq_len))
        pos[b, :, 0, 1] = 0.2 + 0.05 * np.cos(2 * np.pi * np.linspace(0, 1, seq_len))
        
        # Player 2: different movement pattern
        pos[b, :, 1, 0] = 0.7 + 0.1 * np.cos(2 * np.pi * np.linspace(0, 1, seq_len))
        pos[b, :, 1, 1] = 0.8 + 0.05 * np.sin(2 * np.pi * np.linspace(0, 1, seq_len))
    
    # Video lengths (all sequences use full length for this example)
    video_len = np.array([seq_len] * batch_size, dtype=np.int64)
    
    return {
        'JnB': JnB.tolist(),
        'shuttle': shuttle.tolist(),
        'pos': pos.tolist(),
        'video_len': video_len.tolist()
    }

def predict_with_torchscript(model_path: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Run inference using TorchScript model.
    
    Args:
        model_path: Path to TorchScript model (.pt file)
        input_data: Input data dictionary
        
    Returns:
        Prediction results
    """
    try:
        import torch
        
        print(f"Loading TorchScript model: {model_path}")
        model = torch.jit.load(model_path, map_location='cpu')
        model.eval()
        
        # Convert inputs to tensors
        JnB = torch.tensor(input_data['JnB'], dtype=torch.float)
        shuttle = torch.tensor(input_data['shuttle'], dtype=torch.float)
        pos = torch.tensor(input_data['pos'], dtype=torch.float)
        video_len = torch.tensor(input_data['video_len'], dtype=torch.long)
        
        print(f"Input shapes:")
        print(f"  JnB: {JnB.shape}")
        print(f"  shuttle: {shuttle.shape}")
        print(f"  pos: {pos.shape}")
        print(f"  video_len: {video_len.shape}")
        
        # Run inference
        start_time = time.time()
        with torch.no_grad():
            predictions = model(JnB, shuttle, pos, video_len)
        inference_time = time.time() - start_time
        
        # Convert to probabilities
        probabilities = torch.softmax(predictions, dim=-1)
        
        # Get top 5 predictions
        top_probs, top_indices = torch.topk(probabilities, k=5, dim=-1)
        
        print(f"Inference completed in {inference_time:.4f}s")
        print(f"Output shape: {predictions.shape}")
        
        return {
            'success': True,
            'inference_time': inference_time,
            'predictions': predictions.tolist(),
            'probabilities': probabilities.tolist(),
            'top_predictions': {
                'indices': top_indices.tolist(),
                'probabilities': top_probs.tolist()
            }
        }
        
    except ImportError:
        return {'success': False, 'error': 'PyTorch not available'}
    except Exception as e:
        return {'success': False, 'error': str(e)}

def predict_with_onnx(model_path: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Run inference using ONNX model.
    
    Args:
        model_path: Path to ONNX model (.onnx file)
        input_data: Input data dictionary
        
    Returns:
        Prediction results
    """
    try:
        import onnxruntime as ort
        
        print(f"Loading ONNX model: {model_path}")
        session = ort.InferenceSession(model_path)
        
        # Prepare inputs for ONNX Runtime
        ort_inputs = {
            'JnB': np.array(input_data['JnB'], dtype=np.float32),
            'shuttle': np.array(input_data['shuttle'], dtype=np.float32),
            'pos': np.array(input_data['pos'], dtype=np.float32),
            'video_len': np.array(input_data['video_len'], dtype=np.int64)
        }
        
        print(f"Input shapes:")
        for name, tensor in ort_inputs.items():
            print(f"  {name}: {tensor.shape}")
        
        # Run inference
        start_time = time.time()
        ort_outputs = session.run(None, ort_inputs)
        inference_time = time.time() - start_time
        
        predictions = ort_outputs[0]
        
        # Convert to probabilities using numpy
        exp_preds = np.exp(predictions - np.max(predictions, axis=-1, keepdims=True))
        probabilities = exp_preds / np.sum(exp_preds, axis=-1, keepdims=True)
        
        # Get top 5 predictions
        top_indices = np.argsort(probabilities, axis=-1)[:, -5:][:, ::-1]
        top_probs = np.take_along_axis(probabilities, top_indices, axis=-1)
        
        print(f"Inference completed in {inference_time:.4f}s")
        print(f"Output shape: {predictions.shape}")
        
        return {
            'success': True,
            'inference_time': inference_time,
            'predictions': predictions.tolist(),
            'probabilities': probabilities.tolist(),
            'top_predictions': {
                'indices': top_indices.tolist(),
                'probabilities': top_probs.tolist()
            }
        }
        
    except ImportError:
        return {'success': False, 'error': 'ONNX Runtime not available'}
    except Exception as e:
        return {'success': False, 'error': str(e)}

def simulate_cloud_function(model_path: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Simulate a cloud function deployment with the given model and data.
    
    Args:
        model_path: Path to the model file
        input_data: Input data for inference
        
    Returns:
        Cloud function response simulation
    """
    print("=" * 60)
    print("Simulating Cloud Function Deployment")
    print("=" * 60)
    
    # Determine model format
    if model_path.endswith('.pt'):
        print("Detected TorchScript model")
        result = predict_with_torchscript(model_path, input_data)
    elif model_path.endswith('.onnx'):
        print("Detected ONNX model")
        result = predict_with_onnx(model_path, input_data)
    else:
        return {'success': False, 'error': 'Unsupported model format'}
    
    if result['success']:
        print("\n📊 Prediction Results:")
        batch_size = len(result['predictions'])
        n_classes = len(result['predictions'][0])
        
        for b in range(batch_size):
            print(f"\nBatch {b}:")
            top_indices = result['top_predictions']['indices'][b]
            top_probs = result['top_predictions']['probabilities'][b]
            
            print("  Top 5 Predictions:")
            for i, (idx, prob) in enumerate(zip(top_indices, top_probs)):
                print(f"    {i+1}. Class {idx:2d}: {prob:.4f} ({prob*100:.1f}%)")
        
        # Simulate cloud function response
        cloud_response = {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': {
                'predictions': result['top_predictions'],
                'inference_time': result['inference_time'],
                'model_info': {
                    'format': 'TorchScript' if model_path.endswith('.pt') else 'ONNX',
                    'batch_size': batch_size,
                    'n_classes': n_classes
                }
            }
        }
        
        print(f"\n⚡ Performance:")
        print(f"  Inference time: {result['inference_time']:.4f}s")
        print(f"  Throughput: {1/result['inference_time']:.2f} inferences/second")
        
        return cloud_response
    else:
        print(f"\n❌ Prediction failed: {result['error']}")
        return {
            'statusCode': 500,
            'body': {'error': result['error']}
        }

def benchmark_model(model_path: str, num_runs: int = 20, seq_len: int = 100):
    """
    Benchmark model performance for cloud deployment planning.
    
    Args:
        model_path: Path to the model file
        num_runs: Number of benchmark runs
        seq_len: Sequence length for testing
    """
    print("=" * 60)
    print(f"Benchmarking Model Performance ({num_runs} runs)")
    print("=" * 60)
    
    input_data = create_dummy_data(seq_len=seq_len, batch_size=1)
    times = []
    
    print("Running benchmark...")
    for i in range(num_runs):
        if model_path.endswith('.pt'):
            result = predict_with_torchscript(model_path, input_data)
        elif model_path.endswith('.onnx'):
            result = predict_with_onnx(model_path, input_data)
        else:
            print("Unsupported model format for benchmarking")
            return
        
        if result['success']:
            times.append(result['inference_time'])
        else:
            print(f"Run {i+1} failed: {result['error']}")
    
    if times:
        avg_time = np.mean(times)
        std_time = np.std(times)
        min_time = np.min(times)
        max_time = np.max(times)
        
        print(f"\n📈 Benchmark Results:")
        print(f"  Runs completed: {len(times)}/{num_runs}")
        print(f"  Average time: {avg_time:.4f}s ± {std_time:.4f}s")
        print(f"  Min time: {min_time:.4f}s")
        print(f"  Max time: {max_time:.4f}s")
        print(f"  Throughput: {1/avg_time:.2f} inferences/second")
        
        # Cloud deployment recommendations
        print(f"\n☁️ Cloud Deployment Recommendations:")
        print(f"  Memory requirement: ~{max(512, int(avg_time * 1000))}MB")
        print(f"  Timeout setting: ~{max(30, int(max_time * 3))}s")
        
        if avg_time < 0.1:
            print(f"  ✅ Excellent for real-time inference")
        elif avg_time < 0.5:
            print(f"  ✅ Good for near real-time inference")
        elif avg_time < 2.0:
            print(f"  ⚠️ Acceptable for batch processing")
        else:
            print(f"  ❌ May be too slow for real-time use")

def main():
    """Main function for command-line usage."""
    parser = argparse.ArgumentParser(description='Test BST model deployment in cloud environment')
    
    parser.add_argument('--model_path', type=str, required=True,
                       help='Path to exported model (.pt or .onnx)')
    
    parser.add_argument('--seq_len', type=int, default=100,
                       help='Sequence length for test data')
    
    parser.add_argument('--batch_size', type=int, default=1,
                       help='Batch size for test data')
    
    parser.add_argument('--benchmark', action='store_true',
                       help='Run performance benchmark')
    
    parser.add_argument('--output_file', type=str, default=None,
                       help='Save test results to JSON file')
    
    args = parser.parse_args()
    
    print("🚀 BST Model Cloud Deployment Test")
    print("=" * 60)
    
    # Check if model exists
    import os
    if not os.path.exists(args.model_path):
        print(f"❌ Model file not found: {args.model_path}")
        print("Please run export_bst_model.py first to create exported models.")
        return
    
    # Create test data
    print(f"Creating test data (seq_len={args.seq_len}, batch_size={args.batch_size})...")
    input_data = create_dummy_data(seq_len=args.seq_len, batch_size=args.batch_size)
    
    # Run cloud function simulation
    cloud_result = simulate_cloud_function(args.model_path, input_data)
    
    # Run benchmark if requested
    if args.benchmark:
        print()
        benchmark_model(args.model_path, seq_len=args.seq_len)
    
    # Save results if requested
    if args.output_file:
        output_data = {
            'model_path': args.model_path,
            'test_parameters': {
                'seq_len': args.seq_len,
                'batch_size': args.batch_size
            },
            'cloud_result': cloud_result,
            'input_data_sample': {
                'JnB_shape': [len(input_data['JnB']), len(input_data['JnB'][0]), 
                            len(input_data['JnB'][0][0]), len(input_data['JnB'][0][0][0])],
                'shuttle_shape': [len(input_data['shuttle']), len(input_data['shuttle'][0]), 
                                len(input_data['shuttle'][0][0])],
                'pos_shape': [len(input_data['pos']), len(input_data['pos'][0]), 
                            len(input_data['pos'][0][0]), len(input_data['pos'][0][0][0])],
                'video_len_shape': [len(input_data['video_len'])]
            }
        }
        
        with open(args.output_file, 'w') as f:
            json.dump(output_data, f, indent=2)
        
        print(f"\n💾 Results saved to: {args.output_file}")
    
    print("\n✅ Cloud deployment test completed!")

if __name__ == '__main__':
    main()