#!/usr/bin/env python3
"""
BST Production API - Secure Inference Endpoint

Enhanced version of the BST Serverless API with production-ready security features:
- API key authentication
- OAuth support
- Rate limiting
- Comprehensive error handling
- Production configuration management

Supersedes and extends Issue #67, incorporating results from Issue #66.

Author: Jin-Ho M. Lee
Created for Issue #68: Finalize and Secure BST Inference Endpoint for Production
"""

import json
import os
import time
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Union, Tuple
from pathlib import Path

# Import validation and response models
from pydantic import BaseModel, Field, validator
from fastapi import FastAPI, HTTPException, Request, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, APIKeyHeader
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import numpy as np

# Import base serverless API components
from serverless_api import (
    MODEL_CONFIG, PoseData, PredictionResponse, ErrorResponse,
    load_torchscript_model, load_onnx_model, preprocess_input,
    predict_with_torchscript, predict_with_onnx
)

# Security configuration
SECURITY_CONFIG = {
    'api_key_header': 'X-API-Key',
    'rate_limit_requests': int(os.getenv('RATE_LIMIT_REQUESTS', 100)),  # per hour
    'rate_limit_window': int(os.getenv('RATE_LIMIT_WINDOW', 3600)),  # 1 hour in seconds
    'oauth_enabled': os.getenv('OAUTH_ENABLED', 'false').lower() == 'true',
    'require_auth': os.getenv('REQUIRE_AUTH', 'true').lower() == 'true',
    'admin_api_key': os.getenv('ADMIN_API_KEY', ''),
}

# In-memory storage for rate limiting and API keys (use Redis in production)
rate_limit_storage = {}
api_keys_storage = {
    # Default demo API key (should be replaced in production)
    'demo-api-key-12345': {
        'name': 'Demo Key',
        'created_at': datetime.utcnow().isoformat(),
        'rate_limit': 100,  # requests per hour
        'enabled': True,
        'permissions': ['predict']
    }
}

# Add admin key if provided
if SECURITY_CONFIG['admin_api_key']:
    api_keys_storage[SECURITY_CONFIG['admin_api_key']] = {
        'name': 'Admin Key',
        'created_at': datetime.utcnow().isoformat(),
        'rate_limit': 1000,  # higher limit for admin
        'enabled': True,
        'permissions': ['predict', 'admin']
    }

# Enhanced models for authentication
class AuthenticatedPredictionResponse(PredictionResponse):
    """Extended prediction response with authentication metadata."""
    auth_info: Dict[str, Any] = Field(default_factory=dict)

class RateLimitError(BaseModel):
    """Rate limit error response."""
    success: bool = False
    error: str = "Rate limit exceeded"
    rate_limit_info: Dict[str, Any]

class AuthenticationError(BaseModel):
    """Authentication error response."""
    success: bool = False
    error: str = "Authentication failed"
    details: Optional[str] = None

# FastAPI app initialization with enhanced security
app = FastAPI(
    title="BST Production API",
    description="Production-ready API for Badminton Stroke-type Transformer model inference with authentication and rate limiting",
    version="2.0.0",
    docs_url="/docs" if os.getenv('ENABLE_DOCS', 'true').lower() == 'true' else None,
    redoc_url="/redoc" if os.getenv('ENABLE_DOCS', 'true').lower() == 'true' else None,
)

# CORS middleware for browser integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv('CORS_ORIGINS', '*').split(','),
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Security dependencies
security = HTTPBearer(auto_error=False)
api_key_header = APIKeyHeader(name=SECURITY_CONFIG['api_key_header'], auto_error=False)

def generate_api_key() -> str:
    """Generate a secure API key."""
    return f"bst_{secrets.token_urlsafe(32)}"

def hash_key(key: str) -> str:
    """Hash API key for rate limiting."""
    return hashlib.sha256(key.encode()).hexdigest()[:16]

def check_rate_limit(api_key: str) -> Tuple[bool, Dict[str, Any]]:
    """
    Check if API key is within rate limits.
    
    Args:
        api_key: The API key to check
        
    Returns:
        (allowed, rate_limit_info) tuple
    """
    if not SECURITY_CONFIG['require_auth']:
        return True, {}
    
    key_hash = hash_key(api_key)
    current_time = datetime.utcnow()
    window_start = current_time - timedelta(seconds=SECURITY_CONFIG['rate_limit_window'])
    
    # Get API key config
    key_config = api_keys_storage.get(api_key, {})
    max_requests = key_config.get('rate_limit', SECURITY_CONFIG['rate_limit_requests'])
    
    # Initialize rate limit data if not exists
    if key_hash not in rate_limit_storage:
        rate_limit_storage[key_hash] = []
    
    # Clean old requests outside the window
    rate_limit_storage[key_hash] = [
        req_time for req_time in rate_limit_storage[key_hash]
        if req_time > window_start
    ]
    
    # Check if under limit
    current_requests = len(rate_limit_storage[key_hash])
    allowed = current_requests < max_requests
    
    if allowed:
        # Add current request
        rate_limit_storage[key_hash].append(current_time)
    
    rate_limit_info = {
        'requests_made': current_requests + (1 if allowed else 0),
        'requests_limit': max_requests,
        'window_seconds': SECURITY_CONFIG['rate_limit_window'],
        'reset_time': (window_start + timedelta(seconds=SECURITY_CONFIG['rate_limit_window'])).isoformat()
    }
    
    return allowed, rate_limit_info

async def verify_api_key(api_key: str = Depends(api_key_header)) -> Dict[str, Any]:
    """
    Verify API key authentication.
    
    Args:
        api_key: API key from header
        
    Returns:
        API key information
        
    Raises:
        HTTPException: If authentication fails
    """
    if not SECURITY_CONFIG['require_auth']:
        return {'name': 'No Auth Required', 'permissions': ['predict']}
    
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key required. Provide via X-API-Key header.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if API key exists and is enabled
    key_info = api_keys_storage.get(api_key)
    if not key_info or not key_info.get('enabled', False):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or disabled API key",
        )
    
    # Check rate limits
    allowed, rate_limit_info = check_rate_limit(api_key)
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded",
            headers={
                "X-RateLimit-Limit": str(rate_limit_info['requests_limit']),
                "X-RateLimit-Remaining": str(max(0, rate_limit_info['requests_limit'] - rate_limit_info['requests_made'])),
                "X-RateLimit-Reset": rate_limit_info['reset_time']
            }
        )
    
    # Return key info with rate limit data
    return {
        **key_info,
        'rate_limit_info': rate_limit_info
    }

async def verify_oauth_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """
    Verify OAuth token (placeholder implementation).
    
    In production, integrate with your OAuth provider (Google, Auth0, etc.)
    
    Args:
        credentials: OAuth token from Authorization header
        
    Returns:
        User information
        
    Raises:
        HTTPException: If authentication fails
    """
    if not SECURITY_CONFIG['oauth_enabled']:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="OAuth authentication not enabled"
        )
    
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Bearer token required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    
    # Placeholder OAuth verification - replace with actual OAuth provider
    # Example with Google OAuth:
    # try:
    #     from google.auth.transport import requests as google_requests
    #     from google.oauth2 import id_token
    #     user_info = id_token.verify_oauth2_token(token, google_requests.Request())
    #     return user_info
    # except Exception as e:
    #     raise HTTPException(status_code=401, detail=f"OAuth verification failed: {str(e)}")
    
    # Demo implementation - in production, implement proper OAuth verification
    if token == "demo-oauth-token":
        return {
            'sub': 'demo-user',
            'email': 'demo@example.com',
            'name': 'Demo User',
            'permissions': ['predict'],
            'rate_limit': 50
        }
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid OAuth token"
    )

# Enhanced endpoints with authentication
@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "message": "BST Production API",
        "status": "ready",
        "version": "2.0.0",
        "authentication_required": SECURITY_CONFIG['require_auth'],
        "oauth_enabled": SECURITY_CONFIG['oauth_enabled'],
        "available_endpoints": ["/predict", "/predict/torchscript", "/predict/onnx"],
        "documentation": "/docs" if os.getenv('ENABLE_DOCS', 'true').lower() == 'true' else "disabled"
    }

@app.get("/health")
async def health_check():
    """Detailed health check with model and security status."""
    from serverless_api import torchscript_model, onnx_session
    
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
        "config": MODEL_CONFIG,
        "security": {
            "authentication_required": SECURITY_CONFIG['require_auth'],
            "oauth_enabled": SECURITY_CONFIG['oauth_enabled'],
            "rate_limiting": {
                "requests_per_window": SECURITY_CONFIG['rate_limit_requests'],
                "window_seconds": SECURITY_CONFIG['rate_limit_window']
            },
            "active_api_keys": len([k for k, v in api_keys_storage.items() if v.get('enabled', False)])
        }
    }

@app.post("/predict", response_model=Union[AuthenticatedPredictionResponse, ErrorResponse])
async def predict_authenticated(
    data: PoseData,
    auth_info: Dict[str, Any] = Depends(verify_api_key)
):
    """
    Main authenticated prediction endpoint. Tries TorchScript first, falls back to ONNX.
    """
    try:
        # Check permissions
        if 'predict' not in auth_info.get('permissions', []):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions for prediction"
            )
        
        # Preprocess input
        preprocessed_data = preprocess_input(data)
        
        # Try TorchScript first
        result = predict_with_torchscript(preprocessed_data)
        
        if not result['success']:
            # Fallback to ONNX
            result = predict_with_onnx(preprocessed_data)
        
        if result['success']:
            return AuthenticatedPredictionResponse(
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
                },
                auth_info={
                    'api_key_name': auth_info.get('name', 'Unknown'),
                    'rate_limit_remaining': auth_info.get('rate_limit_info', {}).get('requests_limit', 0) - 
                                            auth_info.get('rate_limit_info', {}).get('requests_made', 0)
                }
            )
        else:
            raise HTTPException(status_code=500, detail=result['error'])
            
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.post("/predict/torchscript", response_model=Union[AuthenticatedPredictionResponse, ErrorResponse])
async def predict_torchscript_authenticated(
    data: PoseData,
    auth_info: Dict[str, Any] = Depends(verify_api_key)
):
    """TorchScript-specific authenticated prediction endpoint."""
    try:
        if 'predict' not in auth_info.get('permissions', []):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        preprocessed_data = preprocess_input(data)
        result = predict_with_torchscript(preprocessed_data)
        
        if result['success']:
            return AuthenticatedPredictionResponse(
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
                },
                auth_info={
                    'api_key_name': auth_info.get('name', 'Unknown'),
                    'rate_limit_remaining': auth_info.get('rate_limit_info', {}).get('requests_limit', 0) - 
                                            auth_info.get('rate_limit_info', {}).get('requests_made', 0)
                }
            )
        else:
            raise HTTPException(status_code=500, detail=result['error'])
            
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TorchScript prediction failed: {str(e)}")

@app.post("/predict/onnx", response_model=Union[AuthenticatedPredictionResponse, ErrorResponse])
async def predict_onnx_authenticated(
    data: PoseData,
    auth_info: Dict[str, Any] = Depends(verify_api_key)
):
    """ONNX-specific authenticated prediction endpoint."""
    try:
        if 'predict' not in auth_info.get('permissions', []):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        preprocessed_data = preprocess_input(data)
        result = predict_with_onnx(preprocessed_data)
        
        if result['success']:
            return AuthenticatedPredictionResponse(
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
                },
                auth_info={
                    'api_key_name': auth_info.get('name', 'Unknown'),
                    'rate_limit_remaining': auth_info.get('rate_limit_info', {}).get('requests_limit', 0) - 
                                            auth_info.get('rate_limit_info', {}).get('requests_made', 0)
                }
            )
        else:
            raise HTTPException(status_code=500, detail=result['error'])
            
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ONNX prediction failed: {str(e)}")

# OAuth endpoint (optional)
@app.post("/predict/oauth", response_model=Union[AuthenticatedPredictionResponse, ErrorResponse])
async def predict_oauth(
    data: PoseData,
    user_info: Dict[str, Any] = Depends(verify_oauth_token)
):
    """OAuth-authenticated prediction endpoint."""
    try:
        if 'predict' not in user_info.get('permissions', []):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Check OAuth-based rate limiting
        user_id = user_info.get('sub', 'unknown')
        allowed, rate_limit_info = check_rate_limit(f"oauth_{user_id}")
        
        if not allowed:
            raise HTTPException(
                status_code=429,
                detail="Rate limit exceeded for OAuth user",
                headers={
                    "X-RateLimit-Limit": str(rate_limit_info['requests_limit']),
                    "X-RateLimit-Remaining": str(max(0, rate_limit_info['requests_limit'] - rate_limit_info['requests_made'])),
                }
            )
        
        preprocessed_data = preprocess_input(data)
        result = predict_with_torchscript(preprocessed_data)
        
        if not result['success']:
            result = predict_with_onnx(preprocessed_data)
        
        if result['success']:
            return AuthenticatedPredictionResponse(
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
                },
                auth_info={
                    'user_name': user_info.get('name', 'Unknown'),
                    'user_email': user_info.get('email'),
                    'auth_method': 'oauth',
                    'rate_limit_remaining': rate_limit_info['requests_limit'] - rate_limit_info['requests_made']
                }
            )
        else:
            raise HTTPException(status_code=500, detail=result['error'])
            
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OAuth prediction failed: {str(e)}")

# Admin endpoints for API key management
@app.post("/admin/api-keys")
async def create_api_key(
    request: Dict[str, Any],
    auth_info: Dict[str, Any] = Depends(verify_api_key)
):
    """Create a new API key (admin only)."""
    if 'admin' not in auth_info.get('permissions', []):
        raise HTTPException(status_code=403, detail="Admin permissions required")
    
    api_key = generate_api_key()
    api_keys_storage[api_key] = {
        'name': request.get('name', 'Generated Key'),
        'created_at': datetime.utcnow().isoformat(),
        'rate_limit': request.get('rate_limit', SECURITY_CONFIG['rate_limit_requests']),
        'enabled': True,
        'permissions': request.get('permissions', ['predict'])
    }
    
    return {
        'api_key': api_key,
        'created_at': api_keys_storage[api_key]['created_at'],
        'name': api_keys_storage[api_key]['name']
    }

@app.get("/admin/api-keys")
async def list_api_keys(auth_info: Dict[str, Any] = Depends(verify_api_key)):
    """List all API keys (admin only)."""
    if 'admin' not in auth_info.get('permissions', []):
        raise HTTPException(status_code=403, detail="Admin permissions required")
    
    return {
        'api_keys': [
            {
                'key_prefix': key[:8] + '...',
                'name': info['name'],
                'created_at': info['created_at'],
                'enabled': info['enabled'],
                'rate_limit': info['rate_limit'],
                'permissions': info['permissions']
            }
            for key, info in api_keys_storage.items()
        ]
    }

if __name__ == "__main__":
    # For local development
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)