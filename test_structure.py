#!/usr/bin/env python3
"""
Simple test script for serverless API imports and structure validation

This script tests the serverless API code structure without requiring external dependencies.
"""

import sys
import os
import importlib.util
from pathlib import Path

def test_file_structure():
    """Test that all required files exist."""
    required_files = [
        'serverless_api.py',
        'main.py',
        'requirements_serverless.txt',
        'deploy_gcf.sh',
        'test_serverless_api.py',
        'api_client_example.py'
    ]
    
    missing_files = []
    for file in required_files:
        if not os.path.exists(file):
            missing_files.append(file)
    
    return {
        'success': len(missing_files) == 0,
        'missing_files': missing_files,
        'found_files': [f for f in required_files if os.path.exists(f)]
    }

def test_syntax_validation():
    """Test that Python files have valid syntax."""
    python_files = [
        'serverless_api.py',
        'main.py',
        'test_serverless_api.py',
        'api_client_example.py'
    ]
    
    results = {}
    for file in python_files:
        if os.path.exists(file):
            try:
                with open(file, 'r') as f:
                    compile(f.read(), file, 'exec')
                results[file] = {'valid': True}
            except SyntaxError as e:
                results[file] = {'valid': False, 'error': str(e)}
        else:
            results[file] = {'valid': False, 'error': 'File not found'}
    
    return results

def test_import_structure():
    """Test import structure without actually importing dependencies."""
    try:
        # Check if serverless_api can be loaded without external deps
        spec = importlib.util.spec_from_file_location("serverless_api", "serverless_api.py")
        
        # Just validate the module structure
        with open('serverless_api.py', 'r') as f:
            content = f.read()
        
        # Check for key components
        required_components = [
            'FastAPI',
            'PoseData',
            'PredictionResponse',
            'load_torchscript_model',
            'load_onnx_model',
            'predict_badminton_shot',
            '@app.post("/predict",',
            'MODEL_CONFIG'
        ]
        
        found_components = []
        missing_components = []
        
        for component in required_components:
            if component in content:
                found_components.append(component)
            else:
                missing_components.append(component)
        
        return {
            'success': len(missing_components) == 0,
            'found_components': found_components,
            'missing_components': missing_components
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

def test_model_files():
    """Check if BST model files exist."""
    model_paths = [
        'models/bst/weights/exported/bst_cg_ap_seq100_scripted.pt',
        'models/bst/weights/exported/bst_cg_ap_seq100.onnx'
    ]
    
    results = {}
    for path in model_paths:
        exists = os.path.exists(path)
        size = os.path.getsize(path) if exists else 0
        results[path] = {
            'exists': exists,
            'size_mb': round(size / (1024 * 1024), 2) if exists else 0
        }
    
    return results

def main():
    """Run all tests."""
    print("=" * 60)
    print("BST Serverless API - Structure and Syntax Tests")
    print("=" * 60)
    
    # Test file structure
    print("\n1. Testing file structure...")
    structure_result = test_file_structure()
    if structure_result['success']:
        print("✓ All required files present")
        for file in structure_result['found_files']:
            print(f"  - {file}")
    else:
        print("✗ Missing files:")
        for file in structure_result['missing_files']:
            print(f"  - {file}")
    
    # Test syntax
    print("\n2. Testing Python syntax...")
    syntax_results = test_syntax_validation()
    for file, result in syntax_results.items():
        if result['valid']:
            print(f"✓ {file} - syntax valid")
        else:
            print(f"✗ {file} - syntax error: {result['error']}")
    
    # Test import structure
    print("\n3. Testing import structure...")
    import_result = test_import_structure()
    if import_result['success']:
        print("✓ All required components found")
        print(f"  Found {len(import_result['found_components'])} components")
    else:
        print("✗ Missing components:")
        for component in import_result.get('missing_components', []):
            print(f"  - {component}")
        if 'error' in import_result:
            print(f"  Error: {import_result['error']}")
    
    # Test model files
    print("\n4. Testing model file availability...")
    model_results = test_model_files()
    for path, result in model_results.items():
        if result['exists']:
            print(f"✓ {path} - {result['size_mb']} MB")
        else:
            print(f"✗ {path} - not found")
    
    # Summary
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    
    total_tests = 4
    passed_tests = 0
    
    if structure_result['success']:
        passed_tests += 1
    
    if all(r['valid'] for r in syntax_results.values()):
        passed_tests += 1
    
    if import_result['success']:
        passed_tests += 1
    
    if all(r['exists'] for r in model_results.values()):
        passed_tests += 1
    
    print(f"Tests passed: {passed_tests}/{total_tests}")
    
    if passed_tests == total_tests:
        print("✅ All structure tests passed! API is ready for deployment.")
    else:
        print("⚠️ Some tests failed. Check the output above for details.")
    
    return passed_tests == total_tests

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)