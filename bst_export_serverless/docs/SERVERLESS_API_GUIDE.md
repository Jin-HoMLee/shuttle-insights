# BST Serverless API Guide

This guide provides comprehensive instructions for deploying and using the BST (Badminton Stroke-type Transformer) serverless API for cloud-based badminton shot classification.

## Overview

The BST Serverless API provides:
- **FastAPI-based RESTful API** for badminton shot classification
- **Support for both TorchScript and ONNX models** with automatic fallback
- **Optimized for serverless deployment** with efficient cold start handling
- **Google Cloud Functions and AWS Lambda compatibility**
- **Comprehensive input validation** and error handling
- **Production-ready performance monitoring** and health checks

## Quick Start

### 1. Local Development

```bash
# Install dependencies
pip install -r requirements_serverless.txt

# Start development server
python serverless_api.py
# or
uvicorn serverless_api:app --reload --port 8000

# Test the API
python api_client_example.py --api-url http://localhost:8000
```

### 2. Google Cloud Functions Deployment

```bash
# Deploy to Google Cloud Functions
./deploy_gcf.sh

# Or manually:
gcloud functions deploy predict-badminton-shot \
    --runtime python39 \
    --trigger-http \
    --allow-unauthenticated \
    --memory 2GB \
    --timeout 60s \
    --source .
```

### 3. Test Deployment

```bash
# Test API structure and functionality
python test_structure.py

# Test full API (if dependencies available)
python test_serverless_api.py --api-url YOUR_FUNCTION_URL
```

## API Endpoints

### Health Check Endpoints

#### `GET /`
Basic health check with API information.

**Response:**
```json
{
  "message": "BST Serverless API",
  "status": "ready",
  "version": "1.0.0",
  "available_endpoints": ["/predict", "/predict/torchscript", "/predict/onnx"]
}
```

#### `GET /health`
Detailed health check with model status.

**Response:**
```json
{
  "status": "healthy",
  "models": {
    "torchscript": {
      "available": true,
      "path": "models/bst/weights/exported/bst_cg_ap_seq100_scripted.pt",
      "loaded": false
    },
    "onnx": {
      "available": true,
      "path": "models/bst/weights/exported/bst_cg_ap_seq100.onnx",
      "loaded": false
    }
  },
  "config": {
    "seq_len": 100,
    "n_people": 2,
    "pose_features": 72,
    "n_classes": 66
  }
}
```

### Prediction Endpoints

#### `POST /predict`
Main prediction endpoint with automatic model selection (TorchScript → ONNX fallback).

#### `POST /predict/torchscript`
TorchScript-specific prediction endpoint.

#### `POST /predict/onnx`
ONNX-specific prediction endpoint.

### Request Format

All prediction endpoints accept the same input format:

```json
{
  "JnB": [[[[ ... ]]]], 
  "shuttle": [[[ ... ]]], 
  "pos": [[[[ ... ]]]], 
  "video_len": [100]
}
```

**Input Specifications:**
- `JnB`: Pose features `[batch, seq_len, n_people, 72]`
- `shuttle`: Shuttle trajectory `[batch, seq_len, 2]`
- `pos`: Player positions `[batch, seq_len, n_people, 2]`
- `video_len`: Video lengths `[batch]`

**Constraints:**
- `batch`: Typically 1 for single video inference
- `seq_len`: Sequence length (default: 100 frames)
- `n_people`: Number of players (fixed: 2)
- `pose_features`: Joint and bone features (fixed: 72)

### Response Format

**Success Response:**
```json
{
  "success": true,
  "inference_time": 0.045,
  "predictions": [[ ... ]], 
  "probabilities": [[ ... ]], 
  "top_predictions": {
    "indices": [[0, 5, 12, 8, 23]],
    "probabilities": [[0.45, 0.23, 0.15, 0.10, 0.07]]
  },
  "metadata": {
    "model_type": "torchscript",
    "batch_size": 1,
    "seq_len": 100,
    "n_classes": 66
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Input validation failed: JnB shape mismatch"
}
```

## Usage Examples

### Python Client

```python
import requests
import numpy as np

# Create sample data
def create_sample_data():
    return {
        "JnB": np.random.randn(1, 100, 2, 72).tolist(),
        "shuttle": np.random.randn(1, 100, 2).tolist(),
        "pos": np.random.randn(1, 100, 2, 2).tolist(),
        "video_len": [100]
    }

# Make prediction
response = requests.post(
    "YOUR_API_URL/predict",
    json=create_sample_data()
)

result = response.json()
print(f"Top prediction: {result['top_predictions']['indices'][0][0]}")
```

### cURL

```bash
curl -X POST "YOUR_API_URL/predict" \
  -H "Content-Type: application/json" \
  -d @sample_input.json
```

### JavaScript/Node.js

```javascript
const fetch = require('node-fetch');

const sampleData = {
  JnB: Array(1).fill(Array(100).fill(Array(2).fill(Array(72).fill(0.1)))),
  shuttle: Array(1).fill(Array(100).fill([0.1, 0.1])),
  pos: Array(1).fill(Array(100).fill(Array(2).fill([0.1, 0.1]))),
  video_len: [100]
};

fetch('YOUR_API_URL/predict', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(sampleData)
})
.then(response => response.json())
.then(data => console.log('Prediction:', data.top_predictions));
```

## Deployment Configuration

### Requirements

The API has minimal dependencies for optimal cold start performance:

```
fastapi>=0.100.0
uvicorn>=0.23.0
pydantic>=2.0.0
numpy>=1.24.0
torch>=2.0.0  # For TorchScript models
onnxruntime>=1.15.0  # For ONNX models
functions-framework>=3.0.0  # For Google Cloud Functions
```

### Google Cloud Functions

**Memory Requirements:**
- Minimum: 1GB (ONNX only)
- Recommended: 2GB (TorchScript + ONNX)

**Timeout:**
- Recommended: 60s (allows for cold start + inference)

**Environment Variables:**
```bash
TORCHSCRIPT_MODEL_PATH=models/bst/weights/exported/bst_cg_ap_seq100_scripted.pt
ONNX_MODEL_PATH=models/bst/weights/exported/bst_cg_ap_seq100.onnx
```

### AWS Lambda

For AWS Lambda deployment, use the following configuration:

```yaml
# serverless.yml example
service: bst-serverless-api

provider:
  name: aws
  runtime: python3.9
  memorySize: 2048
  timeout: 60

functions:
  predict:
    handler: serverless_api.predict_badminton_shot
    events:
      - http:
          path: predict
          method: post
          cors: true
```

## Performance Optimization

### Cold Start Optimization

1. **Model Caching**: Models are loaded once per container instance and cached
2. **Minimal Dependencies**: Only essential packages are included
3. **Lazy Loading**: Models are loaded on first request, not at import
4. **ONNX Fallback**: Faster loading ONNX models as backup

### Inference Performance

- **TorchScript**: ~40-60ms inference time
- **ONNX**: ~30-50ms inference time
- **Cold Start**: ~2-5s (depending on memory allocation)
- **Warm Requests**: <100ms total response time

### Memory Usage

- **Base Runtime**: ~200MB
- **TorchScript Model**: ~300MB
- **ONNX Model**: ~250MB
- **Total (both models)**: ~750MB

## Troubleshooting

### Common Issues

#### 1. Model Not Found
```
Error: TorchScript model not found: models/bst/weights/exported/bst_cg_ap_seq100_scripted.pt
```
**Solution**: Ensure model files are included in deployment package or accessible at runtime.

#### 2. Memory Limit Exceeded
```
Error: Exceeded memory limit
```
**Solution**: Increase function memory allocation to 2GB or use ONNX-only deployment.

#### 3. Input Validation Errors
```
Error: JnB shape mismatch. Expected (1, 100, 2, 72), got (1, 50, 2, 72)
```
**Solution**: Ensure input data matches expected dimensions.

#### 4. Cold Start Timeouts
```
Error: Function timeout
```
**Solution**: Increase timeout to 60s or implement warming strategies.

### Debug Mode

Enable debug logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Health Monitoring

Monitor API health using the `/health` endpoint:

```bash
# Check model availability
curl YOUR_API_URL/health

# Monitor response times
curl -w "@curl-format.txt" -s -o /dev/null YOUR_API_URL/predict
```

## Integration Guide

### With Pose Estimation Pipeline

```python
# Example integration with MediaPipe pose estimation
def process_badminton_video(video_path):
    # 1. Extract pose data
    pose_data = extract_poses_mediapipe(video_path)
    
    # 2. Track shuttlecock
    shuttle_trajectory = track_shuttlecock(video_path)
    
    # 3. Detect player positions
    player_positions = detect_players(video_path)
    
    # 4. Prepare API input
    api_input = {
        "JnB": pose_data,
        "shuttle": shuttle_trajectory,
        "pos": player_positions,
        "video_len": [len(pose_data)]
    }
    
    # 5. Call BST API
    response = requests.post(API_URL, json=api_input)
    return response.json()
```

### Real-time Processing

For real-time applications:

```python
# Buffer frames for sequence processing
frame_buffer = deque(maxlen=100)

def process_frame(frame):
    # Add frame to buffer
    frame_buffer.append(extract_features(frame))
    
    # Process when buffer is full
    if len(frame_buffer) == 100:
        api_input = prepare_input(frame_buffer)
        prediction = call_api(api_input)
        return prediction
```

## Security Considerations

### Authentication

For production deployments, implement authentication:

```python
# Google Cloud Functions with IAM
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

def verify_token(request):
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    return id_token.verify_oauth2_token(token, google_requests.Request())
```

### Input Sanitization

The API includes comprehensive input validation, but additional checks may be needed:

```python
def validate_business_logic(data):
    # Check sequence length limits
    if data['video_len'][0] > 300:  # Max 10 seconds at 30 FPS
        raise ValueError("Sequence too long")
    
    # Check for reasonable values
    if np.any(np.abs(data['JnB']) > 10):
        raise ValueError("Pose values out of range")
```

## Contributing

To extend the API:

1. **Add new endpoints**: Follow existing patterns in `serverless_api.py`
2. **Add model support**: Implement new model loading functions
3. **Add validation**: Extend the `PoseData` model
4. **Add tests**: Update `test_serverless_api.py`

## License

This BST Serverless API is part of the Shuttle Insights project. See the main repository license for details.