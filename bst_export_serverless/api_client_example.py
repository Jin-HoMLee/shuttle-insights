#!/usr/bin/env python3
"""
BST Serverless API Client Example

This script demonstrates how to use the BST serverless API for badminton shot classification.

Usage:
    python api_client_example.py --api-url http://localhost:8000
    python api_client_example.py --api-url https://your-function-url.cloudfunctions.net

Author: Jin-Ho M. Lee
Created for Issue #66: Implement Python-Based Serverless API for BST Inference
"""

import json
import time
import requests
import numpy as np
import argparse
from typing import Dict, Any, List

def create_sample_data(seq_len: int = 100) -> Dict[str, Any]:
    """
    Create sample badminton pose data for testing.
    
    In a real application, this data would come from:
    - Video pose estimation (MediaPipe, OpenPose, etc.)
    - Shuttlecock tracking algorithms
    - Player position detection
    
    Args:
        seq_len: Sequence length (number of frames)
        
    Returns:
        Sample pose data dictionary
    """
    n_people = 2  # Two players
    pose_features = 72  # Joint and bone features
    
    # Generate realistic-looking sample data
    np.random.seed(42)
    
    # Pose features: joint positions and bone vectors
    JnB = np.random.randn(1, seq_len, n_people, pose_features) * 0.1
    
    # Shuttlecock trajectory: x, y coordinates over time
    shuttle = np.random.randn(1, seq_len, 2) * 0.05
    
    # Player positions: x, y coordinates for each player
    pos = np.random.randn(1, seq_len, n_people, 2) * 0.1
    
    # Video length
    video_len = [seq_len]
    
    return {
        "JnB": JnB.tolist(),
        "shuttle": shuttle.tolist(),
        "pos": pos.tolist(),
        "video_len": video_len
    }

def call_api(api_url: str, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Make API call to BST serverless API.
    
    Args:
        api_url: Base API URL
        endpoint: API endpoint path
        data: Input data
        
    Returns:
        API response
    """
    try:
        url = f"{api_url.rstrip('/')}{endpoint}"
        
        print(f"Calling {url}...")
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
            result['_request_time'] = request_time
            return result
        else:
            return {
                'error': f"HTTP {response.status_code}: {response.text}",
                '_request_time': request_time
            }
            
    except Exception as e:
        return {'error': str(e)}

def print_prediction_results(result: Dict[str, Any], shot_types: List[str] = None):
    """
    Print prediction results in a readable format.
    
    Args:
        result: API response
        shot_types: List of shot type names (optional)
    """
    if 'error' in result:
        print(f"❌ Error: {result['error']}")
        return
    
    print("✅ Prediction successful!")
    print(f"⚡ Inference time: {result['inference_time']:.3f}s")
    print(f"🌐 Total request time: {result.get('_request_time', 0):.3f}s")
    print(f"🧠 Model type: {result['metadata']['model_type']}")
    
    # Print top predictions
    top_indices = result['top_predictions']['indices'][0]  # First batch item
    top_probs = result['top_predictions']['probabilities'][0]
    
    print("\n🏸 Top 5 shot predictions:")
    for i, (idx, prob) in enumerate(zip(top_indices, top_probs)):
        shot_name = shot_types[idx] if shot_types and idx < len(shot_types) else f"Shot_{idx}"
        print(f"  {i+1}. {shot_name}: {prob:.3f} ({prob*100:.1f}%)")

def main():
    """Main client example."""
    parser = argparse.ArgumentParser(description='BST Serverless API Client Example')
    parser.add_argument('--api-url', default='http://localhost:8000',
                       help='API base URL')
    parser.add_argument('--endpoint', default='/predict',
                       choices=['/predict', '/predict/torchscript', '/predict/onnx'],
                       help='API endpoint to test')
    parser.add_argument('--seq-len', type=int, default=100,
                       help='Sequence length for test data')
    
    args = parser.parse_args()
    
    print("🏸 BST Serverless API Client Example")
    print("=" * 50)
    
    # Create sample data
    print(f"📊 Generating sample data (seq_len={args.seq_len})...")
    sample_data = create_sample_data(seq_len=args.seq_len)
    
    print(f"✓ Sample data created:")
    print(f"  - JnB shape: {np.array(sample_data['JnB']).shape}")
    print(f"  - shuttle shape: {np.array(sample_data['shuttle']).shape}")
    print(f"  - pos shape: {np.array(sample_data['pos']).shape}")
    print(f"  - video_len: {sample_data['video_len']}")
    
    # Test API health
    print(f"\n🔍 Checking API health...")
    try:
        health_response = requests.get(f"{args.api_url}/health")
        if health_response.status_code == 200:
            health_data = health_response.json()
            print("✓ API is healthy")
            print(f"  - TorchScript model: {'loaded' if health_data['models']['torchscript']['loaded'] else 'available' if health_data['models']['torchscript']['available'] else 'missing'}")
            print(f"  - ONNX model: {'loaded' if health_data['models']['onnx']['loaded'] else 'available' if health_data['models']['onnx']['available'] else 'missing'}")
        else:
            print(f"⚠ API health check failed: {health_response.status_code}")
    except Exception as e:
        print(f"⚠ Could not check API health: {e}")
    
    # Make prediction
    print(f"\n🚀 Making prediction request to {args.endpoint}...")
    result = call_api(args.api_url, args.endpoint, sample_data)
    
    # Example shot types (you can customize this based on your model)
    badminton_shots = [
        "Clear", "Drop", "Smash", "Net Shot", "Lob", "Drive", "Serve",
        "Backhand Clear", "Forehand Clear", "Cross Court Drop", "Straight Drop",
        "Jump Smash", "Net Kill", "Push", "Lift", "Flick Serve", "Low Serve",
        "High Serve", "Backhand Drive", "Forehand Drive", "Block", "Counter Attack"
    ]
    
    # Print results
    print_prediction_results(result, badminton_shots)
    
    # Performance summary
    if 'error' not in result:
        inference_time = result['inference_time']
        total_time = result.get('_request_time', 0)
        network_time = total_time - inference_time
        
        print(f"\n📈 Performance Summary:")
        print(f"  - Model inference: {inference_time:.3f}s")
        print(f"  - Network/overhead: {network_time:.3f}s") 
        print(f"  - Total request: {total_time:.3f}s")
        print(f"  - Throughput: ~{1/total_time:.1f} requests/second")

if __name__ == "__main__":
    main()