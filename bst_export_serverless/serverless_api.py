#!/usr/bin/env python3
"""
BST Serverless API

FastAPI-based serverless API for BST (Badminton Stroke-type Transformer) model inference.
Supports both TorchScript and ONNX model formats with optimized cold starts.

Usage:
    # Local development
    uvicorn serverless_api:app --reload --port 8000
    
    # Google Cloud Functions deployment
    functions-framework --target=predict_badminton_shot --port=8080

Author: Jin-Ho M. Lee
Created for Issue #66: Implement Python-Based Serverless API for BST Inference
"""

import json
import os
import time
from typing import Dict, List, Any, Optional, Union
from pathlib import Path

# Import validation and response models
from pydantic import BaseModel, Field, validator
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
import numpy as np

# Global model variables for reuse across invocations
torchscript_model = None
onnx_session = None

# Model configuration
from production_config import ModelConfig # Importing from production_config.py
MODEL_CONFIG = ModelConfig().dict()

# Input validation models
class PoseData(BaseModel):
    """Input data model for BST inference."""
    JnB: List[List[List[List[float]]]] = Field(
        ..., 
        description="Pose features [batch, seq_len, n_people, 72]"
    )
    shuttle: List[List[List[float]]] = Field(
        ..., 
        description="Shuttle trajectory [batch, seq_len, 2]"
    )
    pos: List[List[List[List[float]]]] = Field(
        ..., 
        description="Player positions [batch, seq_len, n_people, 2]"
    )
    video_len: List[int] = Field(
        ..., 
        description="Video lengths [batch]"
    )
    
    @validator('JnB')
    def validate_jnb_shape(cls, v):
        """Validate JnB tensor dimensions."""
        if not v:
            raise ValueError("JnB cannot be empty")
        
        batch_size = len(v)
        if batch_size == 0:
            raise ValueError("Batch size must be > 0")
            
        seq_len = len(v[0]) if v[0] else 0
        if seq_len == 0:
            raise ValueError("Sequence length must be > 0")
            
        # Basic shape validation - detailed validation in preprocessing
        return v
    
    @validator('video_len')
    def validate_video_len(cls, v, values):
        """Validate video_len matches batch size."""
        if 'JnB' in values and len(v) != len(values['JnB']):
            raise ValueError("video_len length must match batch size")
        return v

class PredictionResponse(BaseModel):
    """Response model for BST predictions."""
    success: bool
    inference_time: float
    predictions: List[List[float]]
    probabilities: List[List[float]]
    top_predictions: Dict[str, List[List[int]]]
    metadata: Dict[str, Any]

class ErrorResponse(BaseModel):
    """Error response model."""
    success: bool = False
    error: str
    details: Optional[str] = None

# FastAPI app initialization
app = FastAPI(
    title="BST Serverless API",
    description="Serverless API for Badminton Stroke-type Transformer model inference",
    version="1.0.0"
)

def load_torchscript_model(model_path: str = None):
    """
    Load TorchScript model with caching for serverless reuse.
    
    Args:
        model_path: Path to TorchScript model file
        
    Returns:
        Loaded TorchScript model
    """
    global torchscript_model
    
    if torchscript_model is None:
        try:
            import torch
            
            # Use provided path or default
            path = model_path or MODEL_CONFIG['torchscript_path']
            
            # Check if model file exists
            if not os.path.exists(path):
                raise FileNotFoundError(f"TorchScript model not found: {path}")
            
            print(f"Loading TorchScript model from: {path}")
            torchscript_model = torch.jit.load(path, map_location='cpu')
            torchscript_model.eval()
            print("TorchScript model loaded successfully")
            
        except ImportError:
            raise ImportError("PyTorch not available for TorchScript inference")
        except Exception as e:
            raise RuntimeError(f"Failed to load TorchScript model: {str(e)}")
    
    return torchscript_model

def load_onnx_model(model_path: str = None):
    """
    Load ONNX model with caching for serverless reuse.
    
    Args:
        model_path: Path to ONNX model file
        
    Returns:
        ONNX Runtime inference session
    """
    global onnx_session
    
    if onnx_session is None:
        try:
            import onnxruntime as ort
            
            # Use provided path or default
            path = model_path or MODEL_CONFIG['onnx_path']
            
            # Check if model file exists
            if not os.path.exists(path):
                raise FileNotFoundError(f"ONNX model not found: {path}")
            
            print(f"Loading ONNX model from: {path}")
            onnx_session = ort.InferenceSession(path)
            print("ONNX model loaded successfully")
            
        except ImportError:
            raise ImportError("ONNX Runtime not available for ONNX inference")
        except Exception as e:
            raise RuntimeError(f"Failed to load ONNX model: {str(e)}")
    
    return onnx_session

def preprocess_input(data: PoseData) -> Dict[str, Any]:
    """
    Preprocess and validate input data for BST model inference.
    
    Args:
        data: Input pose data
        
    Returns:
        Preprocessed tensors/arrays ready for model inference
    """
    try:
        # Convert to numpy arrays
        JnB = np.array(data.JnB, dtype=np.float32)
        shuttle = np.array(data.shuttle, dtype=np.float32)
        pos = np.array(data.pos, dtype=np.float32)
        video_len = np.array(data.video_len, dtype=np.int64)
        
        # Validate shapes
        batch_size = JnB.shape[0]
        seq_len = JnB.shape[1]
        
        expected_shapes = {
            'JnB': (batch_size, seq_len, MODEL_CONFIG['n_people'], MODEL_CONFIG['pose_features']),
            'shuttle': (batch_size, seq_len, 2),
            'pos': (batch_size, seq_len, MODEL_CONFIG['n_people'], 2),
            'video_len': (batch_size,)
        }
        
        # Check shapes
        if JnB.shape != expected_shapes['JnB']:
            raise ValueError(f"JnB shape mismatch. Expected {expected_shapes['JnB']}, got {JnB.shape}")
        if shuttle.shape != expected_shapes['shuttle']:
            raise ValueError(f"shuttle shape mismatch. Expected {expected_shapes['shuttle']}, got {shuttle.shape}")
        if pos.shape != expected_shapes['pos']:
            raise ValueError(f"pos shape mismatch. Expected {expected_shapes['pos']}, got {pos.shape}")
        if video_len.shape != expected_shapes['video_len']:
            raise ValueError(f"video_len shape mismatch. Expected {expected_shapes['video_len']}, got {video_len.shape}")
        
        return {
            'JnB': JnB,
            'shuttle': shuttle,
            'pos': pos,
            'video_len': video_len,
            'batch_size': batch_size,
            'seq_len': seq_len
        }
        
    except Exception as e:
        raise ValueError(f"Input preprocessing failed: {str(e)}")

def predict_with_torchscript(preprocessed_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Run inference using TorchScript model.
    
    Args:
        preprocessed_data: Preprocessed input tensors
        
    Returns:
        Prediction results
    """
    try:
        import torch
        
        # Load model
        model = load_torchscript_model()
        
        # Convert numpy arrays to torch tensors (zero-copy)
        JnB = torch.from_numpy(preprocessed_data['JnB']).float()
        shuttle = torch.from_numpy(preprocessed_data['shuttle']).float()
        pos = torch.from_numpy(preprocessed_data['pos']).float()
        video_len = torch.from_numpy(preprocessed_data['video_len']).long()
        
        # Run inference
        start_time = time.time()
        with torch.no_grad():
            predictions = model(JnB, shuttle, pos, video_len)
        inference_time = time.time() - start_time
        
        # Convert to probabilities
        probabilities = torch.softmax(predictions, dim=-1)
        
        # Get top 5 predictions
        top_probs, top_indices = torch.topk(probabilities, k=5, dim=-1)
        
        return {
            'success': True,
            'inference_time': inference_time,
            'predictions': predictions.tolist(),
            'probabilities': probabilities.tolist(),
            'top_predictions': {
                'indices': top_indices.tolist(),
                'probabilities': top_probs.tolist()
            },
            'model_type': 'torchscript'
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': f"TorchScript inference failed: {str(e)}"
        }

def predict_with_onnx(preprocessed_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Run inference using ONNX model.
    
    Args:
        preprocessed_data: Preprocessed input arrays
        
    Returns:
        Prediction results
    """
    try:
        # Load model
        session = load_onnx_model()
        
        # Prepare ONNX inputs
        ort_inputs = {
            'JnB': preprocessed_data['JnB'],
            'shuttle': preprocessed_data['shuttle'],
            'pos': preprocessed_data['pos'],
            'video_len': preprocessed_data['video_len']
        }
        
        # Run inference
        start_time = time.time()
        ort_outputs = session.run(None, ort_inputs)
        inference_time = time.time() - start_time
        
        # Extract predictions (assuming single output)
        predictions = ort_outputs[0]
        
        # Convert to probabilities using scipy's softmax
        try:
            from scipy.special import softmax
            probabilities = softmax(predictions, axis=-1)
        except ImportError:
            # Fallback to manual softmax if scipy is not available
            exp_predictions = np.exp(predictions - np.max(predictions, axis=-1, keepdims=True))
            probabilities = exp_predictions / np.sum(exp_predictions, axis=-1, keepdims=True)
        
        # Get top 5 predictions efficiently using argpartition
        top_k = 5
        # Get indices of top 5 probabilities (unsorted)
        partitioned_indices = np.argpartition(probabilities, -top_k, axis=-1)[..., -top_k:]
        # Gather the top 5 probabilities
        top_probs_unsorted = np.take_along_axis(probabilities, partitioned_indices, axis=-1)
        # Now sort these top 5 in descending order
        sorted_order = np.argsort(top_probs_unsorted, axis=-1)[:, ::-1]
        top_indices = np.take_along_axis(partitioned_indices, sorted_order, axis=-1)
        top_probs = np.take_along_axis(top_probs_unsorted, sorted_order, axis=-1)
        
        return {
            'success': True,
            'inference_time': inference_time,
            'predictions': predictions.tolist(),
            'probabilities': probabilities.tolist(),
            'top_predictions': {
                'indices': top_indices.tolist(),
                'probabilities': top_probs.tolist()
            },
            'model_type': 'onnx'
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': f"ONNX inference failed: {str(e)}"
        }

@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "message": "BST Serverless API",
        "status": "ready",
        "version": "1.0.0",
        "available_endpoints": ["/predict", "/predict/torchscript", "/predict/onnx"]
    }

@app.get("/health")
async def health_check():
    """Detailed health check with model status."""
    model_status = {}
    
    # Check TorchScript model availability
    try:
        torch_path = MODEL_CONFIG['torchscript_path']
        model_status['torchscript'] = {
            'available': os.path.exists(torch_path),
            'path': torch_path,
            'loaded': torchscript_model is not None
        }
    except Exception as e:
        model_status['torchscript'] = {'error': str(e)}
    
    # Check ONNX model availability
    try:
        onnx_path = MODEL_CONFIG['onnx_path']
        model_status['onnx'] = {
            'available': os.path.exists(onnx_path),
            'path': onnx_path,
            'loaded': onnx_session is not None
        }
    except Exception as e:
        model_status['onnx'] = {'error': str(e)}
    
    return {
        "status": "healthy",
        "models": model_status,
        "config": MODEL_CONFIG
    }

@app.post("/predict", response_model=Union[PredictionResponse, ErrorResponse])
async def predict(data: PoseData):
    """
    Main prediction endpoint. Tries TorchScript first, falls back to ONNX.
    """
    try:
        # Preprocess input
        preprocessed_data = preprocess_input(data)
        
        # Try TorchScript first
        result = predict_with_torchscript(preprocessed_data)
        
        if not result['success']:
            # Fallback to ONNX
            print("TorchScript failed, trying ONNX...")
            result = predict_with_onnx(preprocessed_data)
        
        if result['success']:
            return PredictionResponse(
                success=True,
                inference_time=result['inference_time'],
                predictions=result['predictions'],
                probabilities=result['probabilities'],
                top_predictions=result['top_predictions'],
                metadata={
                    'model_type': result['model_type'],
                    'batch_size': preprocessed_data['batch_size'],
                    'seq_len': preprocessed_data['seq_len'],
                    'n_classes': MODEL_CONFIG['n_classes']
                }
            )
        else:
            raise HTTPException(status_code=500, detail=result['error'])
            
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.post("/predict/torchscript", response_model=Union[PredictionResponse, ErrorResponse])
async def predict_torchscript(data: PoseData):
    """
    TorchScript-specific prediction endpoint.
    """
    try:
        preprocessed_data = preprocess_input(data)
        result = predict_with_torchscript(preprocessed_data)
        
        if result['success']:
            return PredictionResponse(
                success=True,
                inference_time=result['inference_time'],
                predictions=result['predictions'],
                probabilities=result['probabilities'],
                top_predictions=result['top_predictions'],
                metadata={
                    'model_type': 'torchscript',
                    'batch_size': preprocessed_data['batch_size'],
                    'seq_len': preprocessed_data['seq_len'],
                    'n_classes': MODEL_CONFIG['n_classes']
                }
            )
        else:
            raise HTTPException(status_code=500, detail=result['error'])
            
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TorchScript prediction failed: {str(e)}")

@app.post("/predict/onnx", response_model=Union[PredictionResponse, ErrorResponse])
async def predict_onnx(data: PoseData):
    """
    ONNX-specific prediction endpoint.
    """
    try:
        preprocessed_data = preprocess_input(data)
        result = predict_with_onnx(preprocessed_data)
        
        if result['success']:
            return PredictionResponse(
                success=True,
                inference_time=result['inference_time'],
                predictions=result['predictions'],
                probabilities=result['probabilities'],
                top_predictions=result['top_predictions'],
                metadata={
                    'model_type': 'onnx',
                    'batch_size': preprocessed_data['batch_size'],
                    'seq_len': preprocessed_data['seq_len'],
                    'n_classes': MODEL_CONFIG['n_classes']
                }
            )
        else:
            raise HTTPException(status_code=500, detail=result['error'])
            
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ONNX prediction failed: {str(e)}")

# Google Cloud Functions entry point
def predict_badminton_shot(request):
    """
    Google Cloud Functions entry point for BST model inference.
    
    Compatible with functions-framework for local testing:
    functions-framework --target=predict_badminton_shot --port=8080
    """
    try:
        # Parse request
        if request.method == 'GET':
            return {
                "message": "BST Serverless API - Cloud Functions",
                "status": "ready",
                "usage": "Send POST request with pose data to /predict"
            }
        
        if request.method != 'POST':
            return {'error': 'Only POST requests are supported'}, 405
        
        # Get JSON data
        request_json = request.get_json()
        if not request_json:
            return {'error': 'Invalid JSON input'}, 400
        
        # Validate input using Pydantic model
        try:
            pose_data = PoseData(**request_json)
        except Exception as e:
            return {'error': f'Input validation failed: {str(e)}'}, 400
        
        # Preprocess input
        preprocessed_data = preprocess_input(pose_data)
        
        # Try TorchScript first, fallback to ONNX
        result = predict_with_torchscript(preprocessed_data)
        
        if not result['success']:
            result = predict_with_onnx(preprocessed_data)
        
        if result['success']:
            return {
                'success': True,
                'inference_time': result['inference_time'],
                'predictions': result['predictions'],
                'probabilities': result['probabilities'],
                'top_predictions': result['top_predictions'],
                'metadata': {
                    'model_type': result['model_type'],
                    'batch_size': preprocessed_data['batch_size'],
                    'seq_len': preprocessed_data['seq_len'],
                    'n_classes': MODEL_CONFIG['n_classes']
                }
            }
        else:
            return {'error': result['error']}, 500
            
    except Exception as e:
        return {'error': f'Cloud Function error: {str(e)}'}, 500

if __name__ == "__main__":
    # For local development
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)