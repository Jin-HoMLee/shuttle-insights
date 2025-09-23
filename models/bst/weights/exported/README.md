# Exported BST Models

This directory contains optimized BST models for cloud deployment.

## Model Formats

### TorchScript Models (*.pt)
- **Best for**: PyTorch-based inference pipelines
- **Deployment**: Google Cloud Functions, AWS Lambda with PyTorch
- **Advantages**: Native PyTorch compatibility, good performance
- **Loading**: `torch.jit.load('model.pt')`

### ONNX Models (*.onnx)  
- **Best for**: Cross-platform inference, non-PyTorch environments
- **Deployment**: ONNX Runtime, TensorRT, OpenVINO
- **Advantages**: Framework agnostic, wider deployment options
- **Loading**: `onnxruntime.InferenceSession('model.onnx')`

## Model Variants

Generated models follow the naming convention: `{model_type}_seq{seq_len}_{format}.{ext}`

Example files:
- `bst_cg_ap_seq100_scripted.pt` - TorchScript BST_CG_AP model
- `bst_cg_ap_seq100.onnx` - ONNX BST_CG_AP model

## Cloud Deployment

### Google Cloud Functions
```python
import torch

# Load TorchScript model
model = torch.jit.load('bst_cg_ap_seq100_scripted.pt')
model.eval()

def predict(request):
    # Your inference code here
    pass
```

### ONNX Runtime
```python
import onnxruntime as ort

# Load ONNX model
session = ort.InferenceSession('bst_cg_ap_seq100.onnx')

def predict(inputs):
    outputs = session.run(None, inputs)
    return outputs[0]
```

## Performance Considerations

- **Memory Usage**: Models are optimized for minimal memory footprint
- **Cold Start**: TorchScript models have faster cold start times
- **Inference Speed**: Both formats offer similar inference performance
- **Size**: ONNX models may be slightly smaller due to optimization