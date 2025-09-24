#!/usr/bin/env python3
"""
Test script for BST Serverless API

This script validates the serverless API functionality with dummy data.
Tests both FastAPI endpoints and Google Cloud Functions entry point.

Usage:
    python test_serverless_api.py [--api-url http://localhost:8000]
"""

import json
import time
import requests
import numpy as np
from typing import Dict, Any
import argparse

def create_test_data(seq_len: int = 100, batch_size: int = 1) -> Dict[str, Any]:
    """
    Create test data for BST model inference.
    
    Args:
        seq_len: Sequence length
        batch_size: Batch size
        
    Returns:
        Test data dictionary
    """
    n_people = 2
    pose_features = 72
    
    # Generate dummy data with realistic shapes
    np.random.seed(42)  # For reproducible tests
    
    data = {
        "JnB": np.random.randn(batch_size, seq_len, n_people, pose_features).tolist(),
        "shuttle": np.random.randn(batch_size, seq_len, 2).tolist(),
        "pos": np.random.randn(batch_size, seq_len, n_people, 2).tolist(),
        "video_len": [seq_len] * batch_size
    }
    
    return data

def test_api_endpoint(api_url: str, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Test a specific API endpoint.
    
    Args:
        api_url: Base API URL
        endpoint: Endpoint path
        data: Test data
        
    Returns:
        Test result
    """
    try:
        url = f"{api_url}{endpoint}"
        
        print(f"Testing {endpoint}...")
        start_time = time.time()
        
        response = requests.post(
            url,
            json=data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        request_time = time.time() - start_time
        
        if response.status_code == 200:
            result = response.json()
            return {
                'success': True,
                'status_code': response.status_code,
                'request_time': request_time,
                'inference_time': result.get('inference_time', 0),
                'model_type': result.get('metadata', {}).get('model_type', 'unknown'),
                'response_size': len(response.content),
                'top_prediction': result.get('top_predictions', {}).get('indices', [[]])[0][0] if result.get('top_predictions') else None
            }
        else:
            return {
                'success': False,
                'status_code': response.status_code,
                'error': response.text,
                'request_time': request_time
            }
            
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'request_time': 0
        }

def test_health_endpoints(api_url: str) -> Dict[str, Any]:
    """Test health check endpoints."""
    results = {}
    
    # Test root endpoint
    try:
        response = requests.get(f"{api_url}/")
        results['root'] = {
            'success': response.status_code == 200,
            'status_code': response.status_code,
            'response': response.json() if response.status_code == 200 else response.text
        }
    except Exception as e:
        results['root'] = {'success': False, 'error': str(e)}
    
    # Test health endpoint
    try:
        response = requests.get(f"{api_url}/health")
        results['health'] = {
            'success': response.status_code == 200,
            'status_code': response.status_code,
            'response': response.json() if response.status_code == 200 else response.text
        }
    except Exception as e:
        results['health'] = {'success': False, 'error': str(e)}
    
    return results

def test_input_validation(api_url: str) -> Dict[str, Any]:
    """Test input validation with invalid data."""
    results = {}
    
    # Test with empty data
    try:
        response = requests.post(f"{api_url}/predict", json={})
        results['empty_data'] = {
            'success': response.status_code == 422,  # Validation error expected
            'status_code': response.status_code
        }
    except Exception as e:
        results['empty_data'] = {'success': False, 'error': str(e)}
    
    # Test with invalid shapes
    invalid_data = {
        "JnB": [[[1, 2]]],  # Wrong shape
        "shuttle": [[1, 2]],
        "pos": [[[1, 2]]],
        "video_len": [10]
    }
    
    try:
        response = requests.post(f"{api_url}/predict", json=invalid_data)
        results['invalid_shape'] = {
            'success': response.status_code in [400, 422],  # Error expected
            'status_code': response.status_code
        }
    except Exception as e:
        results['invalid_shape'] = {'success': False, 'error': str(e)}
    
    return results

def test_local_import():
    """Test local import of serverless API module."""
    try:
        import serverless_api
        
        # Test dummy data creation and preprocessing
        from serverless_api import preprocess_input, PoseData
        
        # Create test data
        test_data = create_test_data(seq_len=10, batch_size=1)
        pose_data = PoseData(**test_data)
        
        # Test preprocessing
        preprocessed = preprocess_input(pose_data)
        
        return {
            'success': True,
            'import_successful': True,
            'preprocessing_successful': True,
            'preprocessed_shapes': {
                'JnB': preprocessed['JnB'].shape,
                'shuttle': preprocessed['shuttle'].shape,
                'pos': preprocessed['pos'].shape,
                'video_len': preprocessed['video_len'].shape
            }
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

def main():
    """Main test function."""
    parser = argparse.ArgumentParser(description='Test BST Serverless API')
    parser.add_argument('--api-url', default='http://localhost:8000', 
                       help='API base URL (default: http://localhost:8000)')
    parser.add_argument('--local-only', action='store_true',
                       help='Only run local import tests')
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("BST Serverless API Test Suite")
    print("=" * 60)
    
    # Test local import
    print("\n1. Testing local import...")
    local_result = test_local_import()
    if local_result['success']:
        print("✓ Local import successful")
        if 'preprocessed_shapes' in local_result:
            shapes = local_result['preprocessed_shapes']
            print(f"  - JnB shape: {shapes['JnB']}")
            print(f"  - shuttle shape: {shapes['shuttle']}")
            print(f"  - pos shape: {shapes['pos']}")
            print(f"  - video_len shape: {shapes['video_len']}")
    else:
        print(f"✗ Local import failed: {local_result['error']}")
    
    if args.local_only:
        return
    
    # Test API endpoints
    api_url = args.api_url
    print(f"\n2. Testing API endpoints at {api_url}...")
    
    # Test health endpoints
    print("\n   Health checks...")
    health_results = test_health_endpoints(api_url)
    
    for endpoint, result in health_results.items():
        if result['success']:
            print(f"   ✓ {endpoint} endpoint working")
        else:
            print(f"   ✗ {endpoint} endpoint failed: {result.get('error', 'Unknown error')}")
    
    # Test prediction endpoints with valid data
    print("\n   Prediction endpoints...")
    test_data = create_test_data(seq_len=50, batch_size=1)  # Smaller data for faster testing
    
    endpoints = ["/predict", "/predict/torchscript", "/predict/onnx"]
    results = {}
    
    for endpoint in endpoints:
        result = test_api_endpoint(api_url, endpoint, test_data)
        results[endpoint] = result
        
        if result['success']:
            print(f"   ✓ {endpoint}: {result['model_type']} model, "
                  f"inference: {result['inference_time']:.3f}s, "
                  f"total: {result['request_time']:.3f}s")
        else:
            print(f"   ✗ {endpoint} failed: {result.get('error', 'Unknown error')}")
    
    # Test input validation
    print("\n   Input validation...")
    validation_results = test_input_validation(api_url)
    
    for test_name, result in validation_results.items():
        if result['success']:
            print(f"   ✓ {test_name} validation working")
        else:
            print(f"   ✗ {test_name} validation failed")
    
    # Summary
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    
    total_tests = 1  # Local import
    passed_tests = 1 if local_result['success'] else 0
    
    if not args.local_only:
        # Count health tests
        total_tests += len(health_results)
        passed_tests += sum(1 for r in health_results.values() if r['success'])
        
        # Count prediction tests
        total_tests += len(results)
        passed_tests += sum(1 for r in results.values() if r['success'])
        
        # Count validation tests
        total_tests += len(validation_results)
        passed_tests += sum(1 for r in validation_results.values() if r['success'])
    
    print(f"Tests passed: {passed_tests}/{total_tests}")
    
    if passed_tests == total_tests:
        print("✓ All tests passed!")
    else:
        print("⚠ Some tests failed. Check the output above for details.")

if __name__ == "__main__":
    main()