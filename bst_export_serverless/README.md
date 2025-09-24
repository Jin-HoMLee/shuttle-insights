# BST Model Export and Serverless API

Tools for exporting BST (Badminton Stroke-type Transformer) models and deploying as a serverless API for cloud inference.

## Quick Start 
(paths are relative to `bst_export_serverless`)

```bash
# Export BST model to TorchScript and ONNX formats
python export_bst_model.py --model_type BST_CG_AP --weights_path ../models/bst/weights/bst_CG_AP_JnB_bone_between_2_hits_with_max_limits_seq_100_merged_2.pt

# Test exported models for cloud deployment
python cloud_deployment_example.py --model_path ../models/bst/exported/bst_cg_ap_seq100_scripted.pt

# Run basic functionality tests
python test_export_basic.py

# Test serverless API structure
python test_structure.py
```

## Serverless API

### Setup venv

Make sure, to move into the folder `bst_export_serverless` (e.g. `cd bst_export_serverless`), before setting up the venv: 

```bash
pyenv local 3.13.5
python -m venv .venv_bst_export
pip install --upgrade pip
pip install -r requirements_serverless.txt
# or 
make setup
```

### Local development
```bash
python serverless_api.py
# or
uvicorn bst_export_serverless.serverless_api:app --reload --port 8000
``` 

### Google Cloud Functions deployment
```bash
./deploy_gcf.sh
```

### Test API
```bash
python api_client_example.py --api-url http://localhost:8000
```

## Makefile Commands

```bash
make export-bst        # Export BST model with default settings
make export-bst-all    # Export to all formats with benchmarking
make test-export       # Test export functionality
make test-cloud        # Test cloud deployment simulation
```

## Key Features
- **Multiple Model Variants**: BST_0, BST, BST_CG, BST_AP, BST_CG_AP
- **Dual Export Formats**: TorchScript (.pt) and ONNX (.onnx)
- **Cloud Optimization**: Memory and inference speed optimization
- **Deployment Examples**: Google Cloud Functions, AWS Lambda, ONNX Runtime
- **Performance Benchmarking**: Inference speed and memory usage testing

See [../docs/BST_MODEL_EXPORT_GUIDE.md](../docs/BST_MODEL_EXPORT_GUIDE.md) for comprehensive documentation.

## What is tempose.py?

`tempose.py` defines the **TemPose** model and its core neural network modules. TemPose is a transformer-based architecture for fine-grained motion recognition in badminton, as described in the 2023 paper referenced in the file header. 

- It provides reusable building blocks such as `MLP`, `MLP_Head`, `FeedForward`, `MultiHeadAttention`, and more.
- These modules are used both for standalone TemPose experiments and as submodules within the main BST models (see `bst.py`).
- In summary: `tempose.py` is a foundational part of the model codebase, supporting both TemPose and BST model variants.

## What is bst.py?

`bst.py` defines the main **BST (Badminton Stroke-type Transformer)** model family. These models are designed for advanced badminton shot recognition and sequence modeling, building on top of the core modules provided by `tempose.py`.

- It implements multiple BST variants: `BST_0`, `BST`, `BST_CG`, `BST_AP`, and `BST_CG_AP`, each adding new architectural features for improved performance.
- The BST models use components from `tempose.py` (such as transformer layers and temporal encoders) as building blocks.
- These models are used for both training and inference, and are the primary models exported for cloud deployment and serverless APIs.

In summary: `bst.py` is the central file for all BST model definitions, leveraging the reusable modules from `tempose.py` to enable state-of-the-art badminton video analysis.

## Usage Example: Using the Serverless API

```python
import requests
import numpy as np

# Create sample badminton pose data
sample_data = {
    "JnB": np.random.randn(1, 100, 2, 72).tolist(),  # Pose features
    "shuttle": np.random.randn(1, 100, 2).tolist(),   # Shuttle trajectory  
    "pos": np.random.randn(1, 100, 2, 2).tolist(),    # Player positions
    "video_len": [100]                                # Video length
}

# Make prediction request
response = requests.post(
    "http://localhost:8000/predict",  # Or your Cloud Functions URL
    json=sample_data
)

result = response.json()
print(f"Top shot prediction: {result['top_predictions']['indices'][0][0]}")
print(f"Confidence: {result['top_predictions']['probabilities'][0][0]:.3f}")
```
