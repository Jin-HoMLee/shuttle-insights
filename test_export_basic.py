#!/usr/bin/env python3
"""
Test BST Model Export - Basic functionality test

This script tests the basic functionality of the BST model export without requiring
actual weights or complex dependencies.

Usage:
    python test_export_basic.py
"""

import os
import sys
import tempfile
from pathlib import Path

# Add the models directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'models'))

def test_import_availability():
    """Test if required modules can be imported."""
    print("Testing import availability...")
    
    required_modules = [
        'torch',
        'positional_encodings',  # Provides positional encoding layers for PyTorch models. Install via: pip install positional-encodings
        'torchinfo'
    ]
    
    available_modules = []
    missing_modules = []
    
    for module in required_modules:
        try:
            __import__(module)
            available_modules.append(module)
            print(f"✓ {module} - available")
        except ImportError:
            missing_modules.append(module)
            print(f"✗ {module} - missing")
    
    return available_modules, missing_modules

def test_bst_model_imports():
    """Test if BST model classes can be imported."""
    print("\nTesting BST model imports...")
    
    try:
        from models.bst.model.bst import BST_0, BST, BST_CG, BST_AP, BST_CG_AP
        print("✓ BST model classes imported successfully")
        return True
    except Exception as e:
        print(f"✗ Failed to import BST models: {e}")
        return False

def test_export_script_syntax():
    """Test if the export script has valid syntax."""
    print("\nTesting export script syntax...")
    
    export_script_path = "export_bst_model.py"
    
    if not os.path.exists(export_script_path):
        print(f"✗ Export script not found: {export_script_path}")
        return False
    
    try:
        # Try to compile the script
        with open(export_script_path, 'r') as f:
            code = f.read()
        
        compile(code, export_script_path, 'exec')
        print("✓ Export script syntax is valid")
        return True
    except SyntaxError as e:
        print(f"✗ Syntax error in export script: {e}")
        return False
    except Exception as e:
        print(f"✗ Error checking export script: {e}")
        return False

def test_directory_structure():
    """Test if the required directory structure exists."""
    print("\nTesting directory structure...")
    
    required_dirs = [
        "models/bst/model",
        "weights",
        "weights/exported"
    ]
    
    all_exist = True
    for dir_path in required_dirs:
        if os.path.exists(dir_path):
            print(f"✓ {dir_path} - exists")
        else:
            print(f"✗ {dir_path} - missing")
            all_exist = False
    
    return all_exist

def test_create_dummy_model():
    """Test creating a dummy BST model (if torch is available)."""
    print("\nTesting dummy model creation...")
    
    try:
        import torch
        from models.bst.model.bst import BST_CG_AP
        
        # Try to create a model with minimal parameters
        model = BST_CG_AP(
            in_dim=72,
            seq_len=10,  # Very short sequence for testing
            n_class=35,
            n_people=2,
            d_model=32,  # Smaller dimension for testing
            d_head=32,
            n_head=2,
            depth_tem=1,
            depth_inter=1,
            drop_p=0.1,
            mlp_d_scale=2,
            tcn_kernel_size=3
        )
        
        model.eval()
        print("✓ Dummy BST_CG_AP model created successfully")
        
        # Test with dummy inputs
        b, t, n = 1, 10, 2
        JnB = torch.randn(b, t, n, 72, dtype=torch.float)
        shuttle = torch.randn(b, t, 2, dtype=torch.float)
        pos = torch.randn(b, t, n, 2, dtype=torch.float)
        video_len = torch.tensor([t], dtype=torch.long).repeat(b)
        
        with torch.no_grad():
            output = model(JnB, shuttle, pos, video_len)
        
        print(f"✓ Model forward pass successful, output shape: {output.shape}")
        return True
        
    except ImportError:
        print("⚠ Torch not available - skipping model creation test")
        return None
    except Exception as e:
        print(f"✗ Failed to create dummy model: {e}")
        return False

def test_export_functionality():
    """Test the export functionality (if dependencies are available)."""
    print("\nTesting export functionality...")
    
    try:
        from export_bst_model import BST_ModelExporter
        
        # Test exporter initialization
        exporter = BST_ModelExporter('BST_CG_AP')
        print("✓ BST_ModelExporter initialized successfully")
        
        # Test dummy input creation
        dummy_inputs = exporter.create_dummy_inputs()
        print(f"✓ Dummy inputs created: {len(dummy_inputs)} tensors")
        
        return True
        
    except ImportError as e:
        print(f"⚠ Missing dependencies for export test: {e}")
        return None
    except Exception as e:
        print(f"✗ Export functionality test failed: {e}")
        return False

def main():
    """Run all tests."""
    print("=" * 60)
    print("BST Model Export - Basic Functionality Test")
    print("=" * 60)
    
    tests = [
        ("Import Availability", test_import_availability),
        ("BST Model Imports", test_bst_model_imports),
        ("Export Script Syntax", test_export_script_syntax),
        ("Directory Structure", test_directory_structure),
        ("Dummy Model Creation", test_create_dummy_model),
        ("Export Functionality", test_export_functionality),
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        if test_name == "Import Availability":
            available, missing = test_func()
            results[test_name] = (len(missing) == 0, f"Missing: {missing}" if missing else "All available")
        else:
            try:
                result = test_func()
                results[test_name] = (result, "Passed" if result else "Failed" if result is False else "Skipped")
            except Exception as e:
                results[test_name] = (False, f"Error: {e}")
    
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    
    passed = 0
    total = 0
    
    for test_name, (success, message) in results.items():
        if success is True:
            status = "✓ PASS"
            passed += 1
        elif success is False:
            status = "✗ FAIL"
        else:
            status = "⚠ SKIP"
        
        if success is not None:
            total += 1
            
        print(f"{status:<8} {test_name:<25} {message}")
    
    print("\n" + "=" * 60)
    
    if total > 0:
        pass_rate = (passed / total) * 100
        print(f"Results: {passed}/{total} tests passed ({pass_rate:.1f}%)")
        
        if passed == total:
            print("🎉 All tests passed! BST export functionality is ready.")
        elif passed > 0:
            print("⚠ Some tests passed. Check missing dependencies and fix issues.")
        else:
            print("❌ All tests failed. Check environment setup and dependencies.")
    else:
        print("ℹ No tests could be run. Check environment setup.")
    
    print("=" * 60)

if __name__ == '__main__':
    main()