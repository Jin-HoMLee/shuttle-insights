# BST API Endpoint Documentation

This document provides comprehensive documentation for the production-ready BST (Badminton Stroke-type Transformer) inference API, implementing secure authentication, rate limiting, and robust error handling.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [API Endpoints](#api-endpoints)
- [Request/Response Format](#requestresponse-format)
- [Error Handling](#error-handling)
- [Code Examples](#code-examples)
- [Security Configuration](#security-configuration)
- [Deployment Guide](#deployment-guide)
- [Integration Testing](#integration-testing)

## Overview

The BST Production API extends the serverless API from Issue #66 with enterprise-grade security features:

- **API Key Authentication**: Secure token-based access control
- **OAuth Support**: Integration with OAuth providers (Google, Auth0, etc.)
- **Rate Limiting**: Configurable per-API-key request limits
- **CORS Support**: Browser integration for web applications
- **Admin Management**: API key creation and management
- **Comprehensive Logging**: Request tracking and audit trails

### Architecture

```
Browser Extension/Client
        ↓
    HTTPS Request
        ↓
    Production API
        ↓
[Auth] → [Rate Limit] → [Validation] → [Model Inference] → [Response]
```

## Authentication

### API Key Authentication (Recommended)

API keys provide the primary authentication method for production deployments.

#### Header Format
```http
X-API-Key: your-api-key-here
```

#### Example Request
```bash
curl -X POST "https://your-api.com/predict" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: bst_demo-api-key-12345" \
  -d @pose_data.json
```

#### API Key Management

**Creating API Keys (Admin Only):**
```bash
curl -X POST "https://your-api.com/admin/api-keys" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: admin-key" \
  -d '{
    "name": "Client App Key", 
    "rate_limit": 500,
    "permissions": ["predict"]
  }'
```

**Listing API Keys:**
```bash
curl -X GET "https://your-api.com/admin/api-keys" \
  -H "X-API-Key: admin-key"
```

### OAuth Authentication (Optional)

OAuth provides user-based authentication for browser integrations.

#### Supported Providers
- Google OAuth 2.0
- Auth0
- Custom OAuth providers

#### Header Format
```http
Authorization: Bearer oauth-token-here
```

#### Example Request
```bash
curl -X POST "https://your-api.com/predict/oauth" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d @pose_data.json
```

#### OAuth Integration Example
```javascript
// Browser integration with Google OAuth
async function callBSTAPI(poseData) {
  const token = await google.auth.getAccessToken();
  
  const response = await fetch('/predict/oauth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(poseData)
  });
  
  return response.json();
}
```

## Rate Limiting

Rate limiting prevents API abuse and ensures fair usage across clients.

### Default Limits
- **API Key**: 100 requests/hour
- **Admin Key**: 1000 requests/hour
- **OAuth User**: 50 requests/hour

### Configuration
Rate limits are configurable via environment variables:

```bash
export RATE_LIMIT_REQUESTS=200    # requests per window
export RATE_LIMIT_WINDOW=3600     # window in seconds (1 hour)
```

### Rate Limit Headers
All responses include rate limiting information:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2024-01-15T10:00:00Z
```

### Rate Limit Exceeded Response
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "rate_limit_info": {
    "requests_made": 101,
    "requests_limit": 100,
    "window_seconds": 3600,
    "reset_time": "2024-01-15T10:00:00Z"
  }
}
```

## API Endpoints

### Health Check Endpoints

#### `GET /`
Basic API information and status.

**Response:**
```json
{
  "message": "BST Production API",
  "status": "ready",
  "version": "2.0.0",
  "authentication_required": true,
  "oauth_enabled": false,
  "available_endpoints": ["/predict", "/predict/torchscript", "/predict/onnx"],
  "documentation": "/docs"
}
```

#### `GET /health`
Detailed health check with model and security status.

**Response:**
```json
{
  "status": "healthy",
  "models": {
    "torchscript": {
      "available": true,
      "path": "models/bst/weights/exported/bst_cg_ap_seq100_scripted.pt",
      "loaded": true
    },
    "onnx": {
      "available": true,
      "path": "models/bst/weights/exported/bst_cg_ap_seq100.onnx",
      "loaded": false
    }
  },
  "security": {
    "authentication_required": true,
    "oauth_enabled": false,
    "rate_limiting": {
      "requests_per_window": 100,
      "window_seconds": 3600
    },
    "active_api_keys": 3
  }
}
```

### Prediction Endpoints

#### `POST /predict` (Recommended)
Main prediction endpoint with automatic model selection (TorchScript → ONNX fallback).

#### `POST /predict/torchscript`
TorchScript-specific prediction endpoint.

#### `POST /predict/onnx`
ONNX-specific prediction endpoint.

#### `POST /predict/oauth`
OAuth-authenticated prediction endpoint.

### Admin Endpoints

#### `POST /admin/api-keys`
Create new API key (admin permissions required).

#### `GET /admin/api-keys`
List all API keys (admin permissions required).

## Request/Response Format

### Request Format

All prediction endpoints accept the same input format:

```json
{
  "JnB": [[[[ ... ]]]],       // Pose features [batch, seq_len, n_people, 72]
  "shuttle": [[[ ... ]]],     // Shuttle trajectory [batch, seq_len, 2]  
  "pos": [[[[ ... ]]]],       // Player positions [batch, seq_len, n_people, 2]
  "video_len": [100]          // Video lengths [batch]
}
```

**Input Specifications:**
- `batch`: Typically 1 for single video inference
- `seq_len`: Sequence length (default: 100 frames)
- `n_people`: Number of players (fixed: 2)
- `pose_features`: Joint and bone features (fixed: 72)

### Success Response Format

```json
{
  "success": true,
  "inference_time": 0.045,
  "predictions": [[ ... ]],           // Raw model outputs [batch, n_classes]
  "probabilities": [[ ... ]],         // Softmax probabilities [batch, n_classes]
  "top_predictions": {
    "indices": [[0, 5, 12, 8, 23]],   // Top 5 class indices
    "probabilities": [[0.45, 0.23, 0.15, 0.10, 0.07]]  // Top 5 probabilities
  },
  "metadata": {
    "model_type": "torchscript",
    "batch_size": 1,
    "seq_len": 100,
    "n_classes": 66
  },
  "auth_info": {
    "api_key_name": "Client App Key",
    "rate_limit_remaining": 95
  }
}
```

### Error Response Format

```json
{
  "success": false,
  "error": "Input validation failed: JnB shape mismatch",
  "details": "Expected shape (1, 100, 2, 72), got (1, 50, 2, 72)"
}
```

## Error Handling

### HTTP Status Codes

| Status | Description | Common Causes |
|--------|-------------|---------------|
| 200 | Success | Request processed successfully |
| 400 | Bad Request | Invalid input data, malformed JSON |
| 401 | Unauthorized | Missing/invalid API key or OAuth token |
| 403 | Forbidden | Insufficient permissions |
| 422 | Validation Error | Pydantic validation failed |
| 429 | Rate Limited | Too many requests |
| 500 | Server Error | Model inference error, server issues |

### Common Error Scenarios

#### Authentication Errors

```json
// Missing API key
{
  "success": false,
  "error": "API key required. Provide via X-API-Key header."
}

// Invalid API key  
{
  "success": false,
  "error": "Invalid or disabled API key"
}

// Invalid OAuth token
{
  "success": false, 
  "error": "Invalid OAuth token"
}
```

#### Input Validation Errors

```json
// Shape mismatch
{
  "success": false,
  "error": "Input validation failed: JnB shape mismatch",
  "details": "Expected shape (1, 100, 2, 72), got (1, 50, 2, 72)"
}

// Missing required fields
{
  "success": false,
  "error": "Field required",
  "details": "shuttle field is required"
}
```

#### Permission Errors

```json
// Insufficient permissions
{
  "success": false,
  "error": "Insufficient permissions for prediction"
}

// Admin required
{
  "success": false,
  "error": "Admin permissions required"
}
```

## Code Examples

### Python Client

```python
import requests
import numpy as np

class BSTClient:
    def __init__(self, api_url: str, api_key: str):
        self.api_url = api_url.rstrip('/')
        self.headers = {
            'Content-Type': 'application/json',
            'X-API-Key': api_key
        }
    
    def predict(self, pose_data: dict, endpoint: str = '/predict') -> dict:
        """Make prediction request."""
        response = requests.post(
            f"{self.api_url}{endpoint}",
            json=pose_data,
            headers=self.headers,
            timeout=30
        )
        
        if response.status_code == 429:
            raise Exception(f"Rate limit exceeded: {response.json()}")
        elif response.status_code != 200:
            raise Exception(f"API error: {response.json()}")
        
        return response.json()
    
    def create_sample_data(self, seq_len: int = 100) -> dict:
        """Create sample pose data for testing."""
        np.random.seed(42)
        
        return {
            "JnB": np.random.randn(1, seq_len, 2, 72).tolist(),
            "shuttle": np.random.randn(1, seq_len, 2).tolist(), 
            "pos": np.random.randn(1, seq_len, 2, 2).tolist(),
            "video_len": [seq_len]
        }

# Usage example
client = BSTClient("https://your-api.com", "your-api-key")
pose_data = client.create_sample_data()
result = client.predict(pose_data)

print(f"Prediction: {result['top_predictions']['indices'][0][0]}")
print(f"Confidence: {result['top_predictions']['probabilities'][0][0]:.3f}")
```

### JavaScript/Browser Client

```javascript
class BSTClient {
    constructor(apiUrl, apiKey) {
        this.apiUrl = apiUrl.replace(/\/$/, '');
        this.headers = {
            'Content-Type': 'application/json',
            'X-API-Key': apiKey
        };
    }
    
    async predict(poseData, endpoint = '/predict') {
        try {
            const response = await fetch(`${this.apiUrl}${endpoint}`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(poseData)
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(`API error: ${result.error || 'Unknown error'}`);
            }
            
            return result;
        } catch (error) {
            console.error('BST API Error:', error);
            throw error;
        }
    }
    
    createSampleData(seqLen = 100) {
        // Generate sample data (simplified)
        const JnB = Array(1).fill().map(() => 
            Array(seqLen).fill().map(() =>
                Array(2).fill().map(() => 
                    Array(72).fill().map(() => Math.random() - 0.5)
                )
            )
        );
        
        const shuttle = Array(1).fill().map(() =>
            Array(seqLen).fill().map(() => [Math.random() - 0.5, Math.random() - 0.5])
        );
        
        const pos = Array(1).fill().map(() =>
            Array(seqLen).fill().map(() =>
                Array(2).fill().map(() => [Math.random() - 0.5, Math.random() - 0.5])
            )
        );
        
        return {
            JnB,
            shuttle, 
            pos,
            video_len: [seqLen]
        };
    }
}

// Usage example
const client = new BSTClient('https://your-api.com', 'your-api-key');

async function analyzeBadmintonShot() {
    try {
        const poseData = client.createSampleData();
        const result = await client.predict(poseData);
        
        console.log('Top prediction:', result.top_predictions.indices[0][0]);
        console.log('Confidence:', result.top_predictions.probabilities[0][0]);
        console.log('Rate limit remaining:', result.auth_info.rate_limit_remaining);
        
    } catch (error) {
        console.error('Prediction failed:', error.message);
    }
}
```

### cURL Examples

```bash
# Basic prediction with API key
curl -X POST "https://your-api.com/predict" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "JnB": [[[[0.1, 0.2, ...rest of 72 values...]]]],
    "shuttle": [[[0.5, 0.3]]],
    "pos": [[[[0.1, 0.2], [0.3, 0.4]]]],
    "video_len": [100]
  }'

# Health check
curl -X GET "https://your-api.com/health"

# OAuth prediction
curl -X POST "https://your-api.com/predict/oauth" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer oauth-token" \
  -d @pose_data.json

# Create API key (admin)
curl -X POST "https://your-api.com/admin/api-keys" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: admin-key" \
  -d '{
    "name": "New Client Key",
    "rate_limit": 200,
    "permissions": ["predict"]
  }'
```

## Security Configuration

### Environment Variables

```bash
# Authentication
export REQUIRE_AUTH=true                    # Enable/disable authentication
export OAUTH_ENABLED=false                 # Enable OAuth support
export ADMIN_API_KEY=secure-admin-key      # Admin API key

# Rate Limiting  
export RATE_LIMIT_REQUESTS=100             # Requests per window
export RATE_LIMIT_WINDOW=3600              # Window in seconds

# CORS
export CORS_ORIGINS=https://yourdomain.com # Allowed origins

# Documentation
export ENABLE_DOCS=true                    # Enable API documentation
```

### Production Security Checklist

- [ ] **Change default API keys** - Replace demo keys with secure, randomly generated keys
- [ ] **Enable HTTPS** - Use TLS encryption for all API communication
- [ ] **Configure CORS** - Restrict origins to trusted domains
- [ ] **Set up monitoring** - Monitor API usage and security events
- [ ] **Implement logging** - Log authentication attempts and API usage
- [ ] **Use environment secrets** - Store sensitive configuration in secure environment variables
- [ ] **Regular key rotation** - Implement API key rotation policies
- [ ] **Rate limit tuning** - Adjust rate limits based on usage patterns

## Deployment Guide

### Local Development

```bash
# Install dependencies
pip install -r requirements_serverless.txt

# Set environment variables
export REQUIRE_AUTH=true
export ADMIN_API_KEY=local-admin-key

# Start development server
python production_api.py
# or
uvicorn production_api:app --reload --port 8000
```

### Google Cloud Functions

```bash
# Deploy with authentication
gcloud functions deploy bst-production-api \
  --runtime python39 \
  --trigger-http \
  --memory 2GB \
  --timeout 60s \
  --set-env-vars REQUIRE_AUTH=true,RATE_LIMIT_REQUESTS=500 \
  --source .
```

### Docker Deployment

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements_serverless.txt .
RUN pip install -r requirements_serverless.txt

COPY . .

# Set environment variables
ENV REQUIRE_AUTH=true
ENV RATE_LIMIT_REQUESTS=100

EXPOSE 8000
CMD ["python", "production_api.py"]
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bst-production-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: bst-api
  template:
    metadata:
      labels:
        app: bst-api
    spec:
      containers:
      - name: api
        image: your-registry/bst-api:latest
        ports:
        - containerPort: 8000
        env:
        - name: REQUIRE_AUTH
          value: "true"
        - name: ADMIN_API_KEY
          valueFrom:
            secretKeyRef:
              name: bst-secrets
              key: admin-api-key
```

## Integration Testing

### Test Suite

Run the comprehensive test suite:

```bash
# Full test suite
python test_production_api.py --api-url http://localhost:8000

# Skip specific test categories
python test_production_api.py --skip-oauth --skip-admin

# Test against deployed API
python test_production_api.py --api-url https://your-api.com
```

### Test Categories

1. **Authentication Tests**
   - API key validation
   - OAuth token verification
   - Unauthorized request handling

2. **Rate Limiting Tests**
   - Single client rate limits
   - Concurrent request handling
   - Rate limit reset behavior

3. **Error Handling Tests**
   - Invalid input data
   - Missing required fields
   - Server error scenarios

4. **Admin Tests**
   - API key creation
   - API key listing
   - Permission validation

### Browser Extension Integration

For browser extension integration, ensure:

1. **CORS Configuration**: Set appropriate origins
2. **Content Security Policy**: Allow API requests
3. **Error Handling**: Handle authentication and rate limit errors
4. **Token Management**: Secure storage of API keys

```javascript
// Extension integration example
chrome.storage.sync.get(['bstApiKey'], function(result) {
    const client = new BSTClient('https://your-api.com', result.bstApiKey);
    
    client.predict(poseData)
        .then(result => {
            // Handle successful prediction
            displayPrediction(result);
        })
        .catch(error => {
            // Handle errors (auth, rate limit, etc.)
            handleApiError(error);
        });
});
```

## Support and Troubleshooting

### Common Issues

1. **Authentication Failures**
   - Verify API key format and validity
   - Check header name (`X-API-Key`)
   - Ensure API key is enabled

2. **Rate Limiting**
   - Check rate limit headers in responses
   - Implement exponential backoff
   - Consider requesting higher limits

3. **Input Validation**
   - Verify tensor shapes match requirements
   - Check data types (float32 for poses)
   - Ensure all required fields are present

### Getting Help

- **Documentation**: This guide and `/docs` endpoint 
- **Health Check**: Use `/health` endpoint for system status
- **Test Suite**: Run test suite to validate configuration
- **Logs**: Check API logs for detailed error information

For additional support, refer to the main Shuttle Insights repository and the serverless API guide.