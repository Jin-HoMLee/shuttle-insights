# BST Model Export and Cloud Deployment Guide

This document provides step-by-step instructions for exporting BST (Badminton Stroke-type Transformer) models and deploying them for cloud inference.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Model Export](#model-export)
- [Cloud Deployment](#cloud-deployment)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Dependencies

Install the required packages for model export:

```bash
# Core PyTorch dependencies
pip install torch==2.4.0
pip install positional_encodings>=6.0.4
pip install torchinfo>=1.8.0

# For ONNX export (optional)
pip install onnx onnxruntime
```

### Model Weights

Before exporting, ensure you have trained BST model weights. These should be obtained from Issue #71 or trained using the modeling pipeline. Place weight files in the `weights/` directory.

Expected file structure:
```
weights/
├── bst_CG_AP_*.pt      # BST with Clean Gate and Aim Player
├── bst_CG_*.pt         # BST with Clean Gate
├── bst_AP_*.pt         # BST with Aim Player
└── bst_*.pt            # Base BST models
```

## Model Export

### Basic Export

Export a BST model with default settings:

```bash
python export_bst_model.py \
    --model_type BST_CG_AP \
    --weights_path weights/bst_model.pt \
    --output_dir weights/exported
```

### Advanced Export Options

```bash
python export_bst_model.py \
    --model_type BST_CG_AP \
    --weights_path weights/bst_CG_AP_seq100.pt \
    --output_dir weights/exported \
    --formats torchscript onnx \
    --seq_len 100 \
    --in_dim 72 \
    --opset_version 11 \
    --benchmark
```

### Export Parameters

| Parameter | Description | Default | Options |
|-----------|-------------|---------|---------|
| `--model_type` | BST model variant | `BST_CG_AP` | `BST_0`, `BST`, `BST_CG`, `BST_AP`, `BST_CG_AP` |
| `--weights_path` | Path to trained weights | None | Path to `.pt` file |
| `--output_dir` | Export directory | `weights/exported` | Any directory path |
| `--formats` | Export formats | `torchscript onnx` | `torchscript`, `onnx` |
| `--seq_len` | Sequence length | `100` | Positive integer |
| `--in_dim` | Input dimension | `72` | Features per person × n_people |
| `--opset_version` | ONNX opset version | `13` | 9, 10, 11, 12, 13+ |
| `--benchmark` | Run performance benchmark | False | Flag |

### Model Variants

#### BST_CG_AP (Recommended)
- **Full Name**: BST with Clean Gate and Aim Player
- **Use Case**: Production deployment with highest accuracy
- **Inputs**: JnB (pose), shuttle (trajectory), pos (positions), video_len
- **Features**: Advanced player interaction modeling and noise reduction

#### BST_CG
- **Full Name**: BST with Clean Gate
- **Use Case**: Balanced accuracy and performance
- **Inputs**: JnB (pose), shuttle (trajectory), pos (positions), video_len
- **Features**: Noise reduction without player-specific modeling

#### BST_AP
- **Full Name**: BST with Aim Player  
- **Use Case**: Player-focused analysis
- **Inputs**: JnB (pose), shuttle (trajectory), pos (positions), video_len
- **Features**: Enhanced player interaction modeling

#### BST_0
- **Full Name**: BST Backbone
- **Use Case**: Lightweight deployment, baseline model
- **Inputs**: JnB (pose), shuttle (trajectory), video_len
- **Features**: Core transformer architecture without extensions

## Cloud Deployment

### Google Cloud Functions

#### TorchScript Deployment

Create a `main.py` for Cloud Functions:

```python
import torch
import numpy as np
from typing import Dict, List, Any
import json

# Global model variable for reuse across invocations
model = None

def load_model():
    """Load the TorchScript model (called once per instance)."""
    global model
    if model is None:
        model = torch.jit.load('bst_cg_ap_seq100_scripted.pt', map_location='cpu')
        model.eval()
    return model

def predict_badminton_shot(request):
    """
    Cloud Function entry point for BST model inference.
    
    Expected JSON input:
    {
        "JnB": [...],      # Pose features [batch, seq_len, n_people, 72]
        "shuttle": [...],   # Shuttle trajectory [batch, seq_len, 2]
        "pos": [...],      # Player positions [batch, seq_len, n_people, 2]
        "video_len": [...]  # Video lengths [batch]
    }
    """
    try:
        # Load model
        model = load_model()
        
        # Parse request
        request_json = request.get_json()
        if not request_json:
            return {'error': 'Invalid JSON input'}, 400
        
        # Convert inputs to tensors
        JnB = torch.tensor(request_json['JnB'], dtype=torch.float)
        shuttle = torch.tensor(request_json['shuttle'], dtype=torch.float)
        pos = torch.tensor(request_json['pos'], dtype=torch.float)
        video_len = torch.tensor(request_json['video_len'], dtype=torch.long)
        
        # Validate input shapes
        batch_size = JnB.shape[0]
        seq_len = JnB.shape[1]
        
        expected_shapes = {
            'JnB': (batch_size, seq_len, 2, 72),
            'shuttle': (batch_size, seq_len, 2),
            'pos': (batch_size, seq_len, 2, 2),
            'video_len': (batch_size,)
        }
        
        for name, tensor in [('JnB', JnB), ('shuttle', shuttle), ('pos', pos), ('video_len', video_len)]:
            if tensor.shape != expected_shapes[name]:
                return {
                    'error': f'Invalid shape for {name}: expected {expected_shapes[name]}, got {tensor.shape}'
                }, 400
        
        # Run inference
        with torch.no_grad():
            predictions = model(JnB, shuttle, pos, video_len)
        
        # Convert to probabilities
        probabilities = torch.softmax(predictions, dim=-1)
        
        # Get top predictions
        top_probs, top_indices = torch.topk(probabilities, k=5, dim=-1)
        
        # Format response
        response = {
            'predictions': predictions.tolist(),
            'probabilities': probabilities.tolist(),
            'top_predictions': {
                'indices': top_indices.tolist(),
                'probabilities': top_probs.tolist()
            },
            'batch_size': batch_size,
            'sequence_length': seq_len
        }
        
        return response
        
    except Exception as e:
        return {'error': str(e)}, 500

# For local testing
if __name__ == '__main__':
    # Test with dummy data
    dummy_request = {
        'JnB': [[[[[0.0] * 72] * 2] * 100]],
        'shuttle': [[[0.0, 0.0]] * 100],
        'pos': [[[[[0.0, 0.0]] * 2]] * 100],
        'video_len': [100]
    }
    
    class MockRequest:
        def get_json(self):
            return dummy_request
    
    result = predict_badminton_shot(MockRequest())
    print(json.dumps(result, indent=2))
```

#### Requirements for Cloud Functions (`requirements.txt`):

```txt
torch==2.4.0
numpy>=1.24.0
```

#### Deployment Commands:

```bash
# Deploy to Google Cloud Functions
gcloud functions deploy predict-badminton-shot \
    --runtime python39 \
    --trigger-http \
    --allow-unauthenticated \
    --memory 2GB \
    --timeout 60s \
    --source .
```

### ONNX Runtime Deployment

#### ONNX Cloud Function

```python
import onnxruntime as ort
import numpy as np
import json

# Global session variable
session = None

def load_model():
    """Load the ONNX model."""
    global session
    if session is None:
        session = ort.InferenceSession('bst_cg_ap_seq100.onnx')
    return session

def predict_badminton_shot_onnx(request):
    """ONNX-based prediction function."""
    try:
        # Load model
        session = load_model()
        
        # Parse request
        request_json = request.get_json()
        if not request_json:
            return {'error': 'Invalid JSON input'}, 400
        
        # Prepare inputs for ONNX Runtime
        ort_inputs = {
            'JnB': np.array(request_json['JnB'], dtype=np.float32),
            'shuttle': np.array(request_json['shuttle'], dtype=np.float32),
            'pos': np.array(request_json['pos'], dtype=np.float32),
            'video_len': np.array(request_json['video_len'], dtype=np.int64)
        }
        
        # Run inference
        ort_outputs = session.run(None, ort_inputs)
        predictions = ort_outputs[0]
        
        # Convert to probabilities
        exp_preds = np.exp(predictions - np.max(predictions, axis=-1, keepdims=True))
        probabilities = exp_preds / np.sum(exp_preds, axis=-1, keepdims=True)
        
        # Get top predictions
        top_indices = np.argsort(probabilities, axis=-1)[:, -5:][:, ::-1]
        top_probs = np.take_along_axis(probabilities, top_indices, axis=-1)
        
        # Format response
        response = {
            'predictions': predictions.tolist(),
            'probabilities': probabilities.tolist(),
            'top_predictions': {
                'indices': top_indices.tolist(),
                'probabilities': top_probs.tolist()
            }
        }
        
        return response
        
    except Exception as e:
        return {'error': str(e)}, 500
```

#### ONNX Requirements (`requirements.txt`):

```txt
onnxruntime>=1.15.0
numpy>=1.24.0
```

### AWS Lambda Deployment

#### Using TorchScript on Lambda

```python
import json
import torch
import boto3

def lambda_handler(event, context):
    """AWS Lambda function for BST model inference."""
    
    try:
        # Load model from S3 or local storage
        model = torch.jit.load('/opt/ml/model/bst_cg_ap_seq100_scripted.pt')
        model.eval()
        
        # Parse input
        body = json.loads(event['body']) if 'body' in event else event
        
        # Convert to tensors
        JnB = torch.tensor(body['JnB'], dtype=torch.float)
        shuttle = torch.tensor(body['shuttle'], dtype=torch.float)
        pos = torch.tensor(body['pos'], dtype=torch.float)
        video_len = torch.tensor(body['video_len'], dtype=torch.long)
        
        # Run inference
        with torch.no_grad():
            predictions = model(JnB, shuttle, pos, video_len)
        
        # Format response
        response = {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'predictions': predictions.tolist()
            })
        }
        
        return response
        
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
```

## Performance Optimization

### Model Size Optimization

1. **Quantization** (Post-training):
```python
# In export_bst_model.py, add quantization option
quantized_model = torch.quantization.quantize_dynamic(
    model, {torch.nn.Linear}, dtype=torch.qint8
)
```

2. **Pruning** (Training-time):
```python
import torch.nn.utils.prune as prune

# Prune 20% of weights in linear layers
for module in model.modules():
    if isinstance(module, torch.nn.Linear):
        prune.l1_unstructured(module, name='weight', amount=0.2)
```

### Memory Optimization

1. **Sequence Length**: Use shorter sequences (50-75) for real-time inference
2. **Batch Size**: Use batch_size=1 for single-shot inference
3. **Model Dimension**: Consider smaller `d_model` (64-80) for faster inference

### Cold Start Optimization

1. **Model Caching**: Keep models loaded in global variables
2. **Lighter Models**: Use BST_CG instead of BST_CG_AP for faster loading
3. **Container Reuse**: Configure cloud functions for minimum instances

## Troubleshooting

### Common Issues

#### 1. Import Errors
```
ModuleNotFoundError: No module named 'positional_encodings'
```
**Solution**: Install the package or use an alternative implementation

#### 2. Model Loading Errors
```
RuntimeError: No such operator aten::...
```
**Solution**: Use compatible PyTorch versions for export and deployment

#### 3. Shape Mismatches
```
RuntimeError: Expected input shape [...] but got [...]
```
**Solution**: Verify input preprocessing matches training data format

#### 4. ONNX Export Errors
```
TracerWarning: Converting a tensor to a Python boolean
```
**Solution**: Avoid dynamic control flow, use static shapes where possible

### Performance Issues

#### Slow Inference
1. Check model size and complexity
2. Verify efficient input preprocessing
3. Consider model quantization
4. Use appropriate hardware (GPU vs CPU)

#### High Memory Usage
1. Reduce sequence length
2. Use smaller model variants
3. Implement input batching limits
4. Monitor memory usage in deployment

### Debugging Tips

1. **Test Locally**: Always test exported models locally before deployment
2. **Validate Inputs**: Ensure input shapes and types match expectations
3. **Monitor Performance**: Track inference time and memory usage
4. **Version Control**: Keep track of model versions and parameters

## Example Usage

### Complete Workflow

```bash
# 1. Export model
python export_bst_model.py \
    --model_type BST_CG_AP \
    --weights_path weights/bst_trained_model.pt \
    --output_dir weights/exported \
    --benchmark

# 2. Test exported model
python test_export_basic.py

# 3. Deploy to cloud
gcloud functions deploy predict-badminton-shot \
    --runtime python39 \
    --trigger-http \
    --memory 2GB

# 4. Test deployment
curl -X POST https://your-function-url.cloudfunctions.net/predict-badminton-shot \
    -H "Content-Type: application/json" \
    -d @test_input.json
```

This completes the comprehensive guide for BST model export and cloud deployment.