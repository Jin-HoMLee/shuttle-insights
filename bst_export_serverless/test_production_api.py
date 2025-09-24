#!/usr/bin/env python3
"""
Test suite for BST Production API

Tests authentication, rate limiting, and security features.
Validates both API key and OAuth authentication flows.

Usage:
    python test_production_api.py [--api-url http://localhost:8000]
"""

import json
import time
import requests
import numpy as np
from typing import Dict, Any
import argparse
import threading
from concurrent.futures import ThreadPoolExecutor


def create_test_data(seq_len: int = 100, batch_size: int = 1) -> Dict[str, Any]:
    """Create sample badminton pose data for testing."""
    n_people = 2
    pose_features = 72
    
    np.random.seed(42)
    
    JnB = np.random.randn(batch_size, seq_len, n_people, pose_features).tolist()
    shuttle = np.random.randn(batch_size, seq_len, 2).tolist()
    pos = np.random.randn(batch_size, seq_len, n_people, 2).tolist()
    video_len = [seq_len] * batch_size
    
    return {
        "JnB": JnB,
        "shuttle": shuttle,
        "pos": pos,
        "video_len": video_len
    }


def test_api_endpoint(api_url: str, endpoint: str, data: Dict[str, Any], 
                     headers: Dict[str, str] = None, expected_status: int = 200) -> Dict[str, Any]:
    """Make API call and return response."""
    try:
        url = f"{api_url.rstrip('/')}{endpoint}"
        
        response = requests.post(
            url,
            json=data,
            headers=headers or {},
            timeout=30
        )
        
        result = {
            'status_code': response.status_code,
            'expected_status': expected_status,
            'success': response.status_code == expected_status,
            'url': url
        }
        
        try:
            result['response'] = response.json()
        except:
            result['response'] = response.text
            
        return result
        
    except Exception as e:
        return {
            'status_code': None,
            'expected_status': expected_status,
            'success': False,
            'error': str(e)
        }


def test_get_endpoint(api_url: str, endpoint: str, headers: Dict[str, str] = None) -> Dict[str, Any]:
    """Make GET API call and return response."""
    try:
        url = f"{api_url.rstrip('/')}{endpoint}"
        
        response = requests.get(
            url,
            headers=headers or {},
            timeout=30
        )
        
        result = {
            'status_code': response.status_code,
            'success': response.status_code == 200,
            'url': url
        }
        
        try:
            result['response'] = response.json()
        except:
            result['response'] = response.text
            
        return result
        
    except Exception as e:
        return {
            'status_code': None,
            'success': False,
            'error': str(e)
        }


def test_authentication(api_url: str, test_data: Dict[str, Any]):
    """Test API key authentication."""
    print("\n" + "="*60)
    print("AUTHENTICATION TESTS")
    print("="*60)
    
    # Test 1: No authentication (should fail if auth required) 
    print("\n1. Testing request without API key...")
    result = test_api_endpoint(api_url, "/predict", test_data, expected_status=401)
    if result['success']:
        print(f"✓ Correctly rejected unauthenticated request")
    else:
        print(f"✗ Expected 401, got {result['status_code']}")
        if 'response' in result:
            print(f"  Response: {result['response']}")
    
    # Test 2: Invalid API key
    print("\n2. Testing invalid API key...")
    headers = {"X-API-Key": "invalid-key-12345"}
    result = test_api_endpoint(api_url, "/predict", test_data, headers, expected_status=401)
    if result['success']:
        print(f"✓ Correctly rejected invalid API key")
    else:
        print(f"✗ Expected 401, got {result['status_code']}")
    
    # Test 3: Valid API key
    print("\n3. Testing valid API key...")
    headers = {"X-API-Key": "demo-api-key-12345"}
    result = test_api_endpoint(api_url, "/predict", test_data, headers, expected_status=200)
    if result['success']:
        print(f"✓ Successfully authenticated with valid API key")
        if 'response' in result and 'auth_info' in result['response']:
            auth_info = result['response']['auth_info']
            print(f"  API Key Name: {auth_info.get('api_key_name', 'N/A')}")
            print(f"  Rate Limit Remaining: {auth_info.get('rate_limit_remaining', 'N/A')}")
    else:
        print(f"✗ Expected 200, got {result['status_code']}")
        if 'response' in result:
            print(f"  Response: {result['response']}")
    
    return headers  # Return valid headers for subsequent tests


def test_rate_limiting(api_url: str, test_data: Dict[str, Any], valid_headers: Dict[str, str]):
    """Test rate limiting functionality."""
    print("\n" + "="*60)
    print("RATE LIMITING TESTS")
    print("="*60)
    
    # First, check current rate limit status
    print("\n1. Checking initial rate limit status...")
    result = test_api_endpoint(api_url, "/predict", test_data, valid_headers)
    if result['success'] and 'response' in result:
        auth_info = result['response'].get('auth_info', {})
        remaining = auth_info.get('rate_limit_remaining', 'Unknown')
        print(f"✓ Initial rate limit remaining: {remaining}")
    
    # Test rapid requests to trigger rate limiting
    print("\n2. Testing rapid requests to trigger rate limiting...")
    rapid_requests = 5
    results = []
    
    start_time = time.time()
    for i in range(rapid_requests):
        result = test_api_endpoint(api_url, "/predict", test_data, valid_headers)
        results.append(result)
        if not result['success'] and result['status_code'] == 429:
            print(f"✓ Rate limit triggered after {i+1} requests")
            break
        print(f"  Request {i+1}: Status {result['status_code']}")
    
    elapsed_time = time.time() - start_time
    successful_requests = sum(1 for r in results if r['success'])
    print(f"✓ Made {rapid_requests} requests in {elapsed_time:.2f}s")
    print(f"✓ {successful_requests} successful, {rapid_requests - successful_requests} rate-limited")


def test_concurrent_requests(api_url: str, test_data: Dict[str, Any], valid_headers: Dict[str, str]):
    """Test concurrent request handling."""
    print("\n" + "="*60)
    print("CONCURRENT REQUEST TESTS")
    print("="*60)
    
    def make_request(request_id):
        result = test_api_endpoint(api_url, "/predict", test_data, valid_headers)
        return (request_id, result)
    
    print("\n1. Testing 3 concurrent requests...")
    with ThreadPoolExecutor(max_workers=3) as executor:
        futures = [executor.submit(make_request, i) for i in range(3)]
        results = [future.result() for future in futures]
    
    successful = sum(1 for _, result in results if result['success'])
    rate_limited = sum(1 for _, result in results if result['status_code'] == 429)
    
    print(f"✓ Concurrent requests: {successful} successful, {rate_limited} rate-limited")
    
    for request_id, result in results:
        status = "✓" if result['success'] else "✗"
        print(f"  {status} Request {request_id+1}: Status {result['status_code']}")


def test_oauth_authentication(api_url: str, test_data: Dict[str, Any]):
    """Test OAuth authentication (if enabled)."""
    print("\n" + "="*60)
    print("OAUTH AUTHENTICATION TESTS")
    print("="*60)
    
    # Test 1: OAuth endpoint without token
    print("\n1. Testing OAuth endpoint without token...")
    result = test_api_endpoint(api_url, "/predict/oauth", test_data, expected_status=401)
    if result['success']:
        print(f"✓ Correctly rejected OAuth request without token")
    else:
        print(f"✗ Expected 401, got {result['status_code']}")
        if result['status_code'] == 501:
            print("  OAuth authentication not enabled")
            return
    
    # Test 2: Invalid OAuth token
    print("\n2. Testing invalid OAuth token...")
    headers = {"Authorization": "Bearer invalid-token"}
    result = test_api_endpoint(api_url, "/predict/oauth", test_data, headers, expected_status=401)
    if result['success']:
        print(f"✓ Correctly rejected invalid OAuth token")
    else:
        print(f"✗ Expected 401, got {result['status_code']}")
    
    # Test 3: Valid OAuth token (demo)
    print("\n3. Testing valid OAuth token...")
    headers = {"Authorization": "Bearer demo-oauth-token"}
    result = test_api_endpoint(api_url, "/predict/oauth", test_data, headers, expected_status=200)
    if result['success']:
        print(f"✓ Successfully authenticated with OAuth token")
        if 'response' in result and 'auth_info' in result['response']:
            auth_info = result['response']['auth_info']
            print(f"  User Name: {auth_info.get('user_name', 'N/A')}")
            print(f"  User Email: {auth_info.get('user_email', 'N/A')}")
    else:
        print(f"✗ Expected 200, got {result['status_code']}")


def test_admin_endpoints(api_url: str, valid_headers: Dict[str, str]):
    """Test admin API key management endpoints."""
    print("\n" + "="*60)
    print("ADMIN ENDPOINT TESTS")
    print("="*60)
    
    # Check if we have admin permissions
    admin_headers = valid_headers.copy()
    
    # Test 1: List API keys (might fail if not admin)
    print("\n1. Testing API key listing...")
    result = test_get_endpoint(api_url, "/admin/api-keys", admin_headers)
    if result['success']:
        print(f"✓ Successfully listed API keys")
        if 'response' in result:
            api_keys = result['response'].get('api_keys', [])
            print(f"  Found {len(api_keys)} API keys")
    else:
        print(f"✗ Failed to list API keys: Status {result['status_code']}")
        if result['status_code'] == 403:
            print("  Admin permissions required")
            return
    
    # Test 2: Create new API key (might fail if not admin)
    print("\n2. Testing API key creation...")
    create_data = {
        "name": "Test API Key",
        "rate_limit": 50,
        "permissions": ["predict"]
    }
    
    result = test_api_endpoint(api_url, "/admin/api-keys", create_data, admin_headers)
    if result['success']:
        print(f"✓ Successfully created new API key")
        if 'response' in result:
            new_key = result['response'].get('api_key', '')
            print(f"  New API Key: {new_key[:12]}...")
    else:
        print(f"✗ Failed to create API key: Status {result['status_code']}")
        if result['status_code'] == 403:
            print("  Admin permissions required")


def test_health_endpoints(api_url: str):
    """Test health and status endpoints."""
    print("\n" + "="*60)
    print("HEALTH CHECK TESTS")
    print("="*60)
    
    # Test 1: Root endpoint
    print("\n1. Testing root endpoint...")
    result = test_get_endpoint(api_url, "/")
    if result['success']:
        print(f"✓ Root endpoint responding")
        if 'response' in result:
            response = result['response']
            print(f"  API Version: {response.get('version', 'N/A')}")
            print(f"  Authentication Required: {response.get('authentication_required', 'N/A')}")
            print(f"  OAuth Enabled: {response.get('oauth_enabled', 'N/A')}")
    else:
        print(f"✗ Root endpoint failed: Status {result['status_code']}")
    
    # Test 2: Health endpoint
    print("\n2. Testing health endpoint...")
    result = test_get_endpoint(api_url, "/health")
    if result['success']:
        print(f"✓ Health endpoint responding")
        if 'response' in result:
            response = result['response']
            print(f"  Status: {response.get('status', 'N/A')}")
            security_info = response.get('security', {})
            print(f"  Active API Keys: {security_info.get('active_api_keys', 'N/A')}")
            rate_limit = security_info.get('rate_limiting', {})
            print(f"  Rate Limit: {rate_limit.get('requests_per_window', 'N/A')}/{rate_limit.get('window_seconds', 'N/A')}s")
    else:
        print(f"✗ Health endpoint failed: Status {result['status_code']}")


def test_error_handling(api_url: str, valid_headers: Dict[str, str]):
    """Test error handling and edge cases."""
    print("\n" + "="*60)
    print("ERROR HANDLING TESTS")
    print("="*60)
    
    # Test 1: Invalid JSON structure
    print("\n1. Testing invalid input data...")
    invalid_data = {
        "JnB": "invalid",  # Should be array
        "shuttle": [[1, 2]],
        "pos": [[[[1, 2]]]],
        "video_len": [1]
    }
    
    result = test_api_endpoint(api_url, "/predict", invalid_data, valid_headers, expected_status=400)
    if result['success']:
        print(f"✓ Correctly rejected invalid input data")
    else:
        print(f"✗ Expected 400, got {result['status_code']}")
    
    # Test 2: Missing required fields
    print("\n2. Testing missing required fields...")
    incomplete_data = {
        "JnB": [[[[[1.0]]]]],
        # Missing shuttle, pos, video_len
    }
    
    result = test_api_endpoint(api_url, "/predict", incomplete_data, valid_headers, expected_status=422)
    if result['success']:
        print(f"✓ Correctly rejected incomplete data")
    else:
        print(f"Expected 422, got {result['status_code']}")
        # 400 is also acceptable for validation errors
        if result['status_code'] == 400:
            print(f"✓ Validation error handled correctly")
    
    # Test 3: Wrong endpoint
    print("\n3. Testing non-existent endpoint...")
    result = test_api_endpoint(api_url, "/nonexistent", {}, valid_headers, expected_status=404)
    if result['success']:
        print(f"✓ Correctly returned 404 for non-existent endpoint")
    else:
        print(f"Expected 404, got {result['status_code']}")


def main():
    """Main test runner."""
    parser = argparse.ArgumentParser(description='BST Production API Test Suite')
    parser.add_argument('--api-url', default='http://localhost:8000',
                       help='API base URL')
    parser.add_argument('--skip-oauth', action='store_true',
                       help='Skip OAuth tests')
    parser.add_argument('--skip-admin', action='store_true',
                       help='Skip admin tests')
    parser.add_argument('--skip-rate-limit', action='store_true',
                       help='Skip rate limiting tests')
    
    args = parser.parse_args()
    
    print("🏸 BST Production API Test Suite")
    print("=" * 70)
    print(f"Testing API at: {args.api_url}")
    
    # Create test data
    print(f"\n📊 Generating test data...")
    test_data = create_test_data()
    print(f"✓ Test data created with shapes:")
    print(f"  - JnB: {np.array(test_data['JnB']).shape}")
    print(f"  - shuttle: {np.array(test_data['shuttle']).shape}")
    print(f"  - pos: {np.array(test_data['pos']).shape}")
    print(f"  - video_len: {len(test_data['video_len'])}")
    
    # Run test suites
    test_health_endpoints(args.api_url)
    
    valid_headers = test_authentication(args.api_url, test_data)
    
    if not args.skip_rate_limit and valid_headers:
        test_rate_limiting(args.api_url, test_data, valid_headers)
        test_concurrent_requests(args.api_url, test_data, valid_headers)
    
    if not args.skip_oauth:
        test_oauth_authentication(args.api_url, test_data)
    
    if not args.skip_admin and valid_headers:
        test_admin_endpoints(args.api_url, valid_headers)
    
    if valid_headers:
        test_error_handling(args.api_url, valid_headers)
    
    print("\n" + "="*70)
    print("🏁 Test suite completed!")
    print("="*70)


if __name__ == "__main__":
    main()