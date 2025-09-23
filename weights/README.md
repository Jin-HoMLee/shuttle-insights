# Weights Directory

This directory contains BST model weights and exported models.

## Structure

```
weights/
├── README.md                    # This file
├── exported/                    # Exported optimized models
│   ├── *.pt                    # TorchScript models
│   ├── *.onnx                  # ONNX models
│   └── README.md               # Export documentation
└── bst_*.pt                    # Raw PyTorch weights (to be added)
```

## Usage

1. **Add pre-trained weights**: Place your trained BST model weights here (e.g., `bst_CG_AP_JnB_bone_between_2_hits_with_max_limits_seq_100_merged_2.pt`)

2. **Export models**: Use the export script to convert weights to optimized formats:
   ```bash
   python export_bst_model.py --model_type BST_CG_AP --weights_path weights/your_weights.pt
   ```

3. **Deploy**: Use the exported models in `exported/` directory for cloud inference

## Pre-trained Weights

Pre-trained weights should be obtained from Issue #71 or trained using the modeling pipeline.

Expected weight file naming convention:
- `bst_CG_AP_*.pt` - BST with Clean Gate and Aim Player
- `bst_CG_*.pt` - BST with Clean Gate  
- `bst_AP_*.pt` - BST with Aim Player
- `bst_*.pt` - Base BST models