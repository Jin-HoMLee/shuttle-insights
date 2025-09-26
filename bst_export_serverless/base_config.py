#!/usr/bin/env python3
"""
Base Configuration for BST API

Lightweight configuration containing only essential model parameters.
Shared between serverless and production APIs to maintain separation of concerns.

Author: Jin-Ho M. Lee
"""

import os
from typing import Dict, Any


class BaseModelConfig:
    """Basic model configuration without external dependencies."""
    
    def __init__(self):
        # Model paths (can be overridden by environment variables)
        self.torchscript_path = os.getenv(
            'TORCHSCRIPT_MODEL_PATH', 
            '../models/bst/exported/bst_cg_ap_seq100_scripted.pt'
        )
        self.onnx_path = os.getenv(
            'ONNX_MODEL_PATH',
            '../models/bst/exported/bst_cg_ap_seq100.onnx'
        )
        
        # Model parameters
        self.seq_len = int(os.getenv('MODEL_SEQ_LEN', '100'))
        self.n_people = int(os.getenv('MODEL_N_PEOPLE', '2'))
        self.pose_features = int(os.getenv('MODEL_POSE_FEATURES', '72'))
        self.n_classes = int(os.getenv('MODEL_N_CLASSES', '66'))
        
        # Model loading preferences
        self.prefer_torchscript = os.getenv('PREFER_TORCHSCRIPT', 'true').lower() == 'true'
    
    def dict(self) -> Dict[str, Any]:
        """Convert configuration to dictionary."""
        return {
            'torchscript_path': self.torchscript_path,
            'onnx_path': self.onnx_path,
            'seq_len': self.seq_len,
            'n_people': self.n_people,
            'pose_features': self.pose_features,
            'n_classes': self.n_classes,
            'prefer_torchscript': self.prefer_torchscript
        }
    
    def __repr__(self):
        return f"BaseModelConfig({self.dict()})"


# Default configuration instance
DEFAULT_MODEL_CONFIG = BaseModelConfig()


def get_model_config() -> BaseModelConfig:
    """Get model configuration instance."""
    return BaseModelConfig()


if __name__ == "__main__":
    """Configuration display script."""
    print("BST Base Model Configuration")
    print("=" * 40)
    
    config = get_model_config()
    print(f"TorchScript Path: {config.torchscript_path}")
    print(f"ONNX Path: {config.onnx_path}")
    print(f"Sequence Length: {config.seq_len}")
    print(f"Number of People: {config.n_people}")
    print(f"Pose Features: {config.pose_features}")
    print(f"Number of Classes: {config.n_classes}")
    print(f"Prefer TorchScript: {config.prefer_torchscript}")
    
    # Check if model files exist
    print(f"\nModel File Status:")
    print(f"TorchScript exists: {os.path.exists(config.torchscript_path)}")
    print(f"ONNX exists: {os.path.exists(config.onnx_path)}")