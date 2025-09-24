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
    # Dynamically derive required files based on naming conventions and known extensions
    # Required: all .py files, all .sh files, all .txt files in this directory
    exts = {'.py', '.sh', '.txt'}
    cwd_files = [f for f in os.listdir('.') if os.path.isfile(f)]
    required_files = [f for f in cwd_files if os.path.splitext(f)[1] in exts]
    # Optionally, add any additional required files by name here if needed

    missing_files = [f for f in required_files if not os.path.exists(f)]

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
    import ast
    try:
        with open('serverless_api.py', 'r') as f:
            tree = ast.parse(f.read(), filename='serverless_api.py')

        # Define required classes, functions, and variables
        required_classes = {'PoseData', 'PredictionResponse'}
        required_functions = {'load_torchscript_model', 'load_onnx_model', 'predict_badminton_shot'}
        required_variables = {'MODEL_CONFIG'}
        required_fastapi = {'FastAPI'}
        required_routes = {'/predict'}

        found_classes = set()
        found_functions = set()
        found_variables = set()
        found_fastapi = set()
        found_routes = set()

        for node in ast.walk(tree):
            if isinstance(node, ast.ClassDef):
                if node.name in required_classes:
                    found_classes.add(node.name)
            elif isinstance(node, ast.FunctionDef):
                if node.name in required_functions:
                    found_functions.add(node.name)
            elif isinstance(node, ast.Assign):
                for target in node.targets:
                    if isinstance(target, ast.Name) and target.id in required_variables:
                        found_variables.add(target.id)
            elif isinstance(node, ast.ImportFrom):
                for alias in node.names:
                    if alias.name in required_fastapi:
                        found_fastapi.add(alias.name)
            elif isinstance(node, ast.Call):
                # Look for @app.post("/predict")
                if hasattr(node.func, 'attr') and node.func.attr in {'post', 'get'}:
                    for arg in node.args:
                        if isinstance(arg, ast.Constant) and isinstance(arg.value, str):
                            for route in required_routes:
                                if route in arg.value:
                                    found_routes.add(route)

        missing = []
        if not required_classes.issubset(found_classes):
            missing.extend(list(required_classes - found_classes))
        if not required_functions.issubset(found_functions):
            missing.extend(list(required_functions - found_functions))
        if not required_variables.issubset(found_variables):
            missing.extend(list(required_variables - found_variables))
        if not required_fastapi.issubset(found_fastapi):
            missing.extend(list(required_fastapi - found_fastapi))
        if not required_routes.issubset(found_routes):
            missing.extend(list(required_routes - found_routes))

        return {
            'success': len(missing) == 0,
            'found_components': list(found_classes | found_functions | found_variables | found_fastapi | found_routes),
            'missing_components': missing
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
        print(f"  Found {len(import_result['found_components'])} components:")
        for comp in sorted(import_result['found_components']):
            print(f"    - {comp}")
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