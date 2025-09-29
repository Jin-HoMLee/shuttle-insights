# Purpose

This is the main project overview and quick start guide for Shuttle Insights. It provides a high-level summary, setup instructions, and links to component documentation. For detailed guides and implementation docs, see docs/README.md.

# Shuttle Insights

A comprehensive toolkit for analyzing badminton videos using pose estimation, machine learning, and data visualization. This project includes tools for video analysis, manual shot labeling, predictive modeling, and cloud deployment.

## Overview

This project provides multiple approaches to badminton video analysis:
1. **Local Pipeline**: Download, extract frames, and analyze poses
2. **Browser Extension**: Manual shot labeling on YouTube videos
3. **Machine Learning**: LSTM-based shot prediction models
4. **Cloud Deployment**: VertexAI model deployment setup

## Directory Structure

```
shuttle-insights/
├── src/                          # Core Python scripts
│   ├── download_video.py         # YouTube video downloader
│   ├── extract_frames.py         # Frame extraction from videos
│   └── analyze_pose.py           # Pose estimation (requires MediaPipe setup)
├── notebooks/                    # Jupyter notebooks for analysis
│   ├── 01_pose_overlay_video.ipynb        # Pose visualization
│   ├── 02_manual_labeling_segmenting.ipynb # Data labeling tools
│   ├── 03_lstm_shot_prediction.ipynb      # ML model training
│   └── EDA-and-modeling_template.ipynb    # Template for analysis
├── browser-extension/            # Chrome extension for YouTube labeling
│   ├── chrome-extension/         # Extension source code
│   └── README.md                 # Extension documentation
├── modeling/                     # ML model training and prediction
│   ├── train.py                  # Model training scripts
│   ├── predict.py                # Model prediction scripts
│   ├── feature_engineering.py    # Feature processing
│   └── config.py                 # Model configuration
├── experiments/                  # Experimental notebooks
│   └── multipose_movenet_test/   # MoveNet multi-pose experiments
├── vertexai_model_endpoint_setup/ # Cloud deployment setup
│   ├── 01_export_model_movenet.ipynb     # Model export
│   ├── 02_upload_model_to_gcs.ipynb      # GCS upload
│   ├── 03_deploy_model_on_vertexai.ipynb # VertexAI deployment
│   └── terraform/                # Infrastructure as code
├── data/                         # Data directories (created during use)
├── models/                       # Saved model files
├── images/                       # Project images and assets
├── requirements.txt              # Production dependencies
└── Makefile                      # Setup automation
```

## Prerequisites

- Python 3.11+ (tested with 3.11.3, also works with 3.12+)
- Git
- Optional: pyenv for Python version management

## Setup

### Option 1: Using Makefile (if pyenv is available)

```bash
make setup
```

**Note**: The Makefile assumes pyenv is installed. If you don't have pyenv, use Option 2.

### Option 2: Manual Setup (Recommended for most users)

```bash
# Create virtual environment (Python 3.11+ required)
python -m venv .venv

# Activate virtual environment
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Upgrade pip and install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# For development with Jupyter notebooks, install additional packages
pip install -r requirements_dev.txt
```

### Dependencies

The `requirements.txt` file contains core dependencies for:
- **Video processing**: yt-dlp, opencv-python  
- **Pose estimation**: mediapipe
- **Data analysis**: pandas, matplotlib, seaborn
- **Machine learning**: scikit-learn, tensorflow
- **Jupyter support**: ipykernel, ipywidgets

## Quick Start

### 1. Basic Video Analysis Pipeline

```python
# Activate your virtual environment first
# source .venv/bin/activate

# Then run Python and import the functions
from src.download_video import download_video
from src.extract_frames import extract_frames  
from src.analyze_pose import analyze_poses

# Download a YouTube badminton video
video_dir = download_video("https://youtube.com/watch?v=VIDEO_ID")
video_path = f"{video_dir}/video.mp4"

# Extract frames (every 5th frame by default)
extract_frames(video_path, output_dir="data/frames", every_nth=5)

# Analyze poses and save to CSV
analyze_poses(frame_dir="data/frames", output_csv="data/pose_data.csv")
```

### 2. Using Jupyter Notebooks

```bash
# Start Jupyter (make sure virtual environment is activated)
jupyter lab

# Open and run the analysis notebooks:
# - 01_pose_overlay_video.ipynb: Visualize pose estimation on videos
# - 02_manual_labeling_segmenting.ipynb: Interactive data labeling
# - 03_lstm_shot_prediction.ipynb: Train ML models for shot prediction
```

### 3. Browser Extension for Manual Labeling

1. Load the browser extension from `browser-extension/chrome-extension/`
2. Go to any YouTube badminton video
3. Use the extension panel to manually label shots and events
4. Export labeled data as CSV

See [browser-extension/README.md](browser-extension/README.md) for detailed instructions.

## Project Components

### Core Analysis (src/)
- **download_video.py**: Downloads YouTube videos using yt-dlp
- **extract_frames.py**: Extracts frames from videos at specified intervals  
- **analyze_pose.py**: Performs pose estimation using MediaPipe

### Jupyter Notebooks (notebooks/)
- **01_pose_overlay_video.ipynb**: Demonstrates pose estimation and visualization overlays
- **02_manual_labeling_segmenting.ipynb**: Interactive tools for manual shot labeling and data segmentation
- **03_lstm_shot_prediction.ipynb**: LSTM model training for predicting badminton shots from pose sequences
- **EDA-and-modeling_template.ipynb**: Template for exploratory data analysis and modeling workflows

### Browser Extension (browser-extension/)
Chrome extension for manually labeling badminton shots while watching YouTube videos. Exports labeled timestamps and shot types as CSV files for training data generation.

### Machine Learning Models (modeling/)
- **train.py**: Scripts for training shot prediction models
- **predict.py**: Model inference and prediction scripts  
- **feature_engineering.py**: Feature extraction and preprocessing pipelines
- **config.py**: Model configuration and hyperparameters

### Cloud Deployment (vertexai_model_endpoint_setup/)
Notebooks and configuration for deploying trained models to Google Cloud VertexAI:
- Model export and containerization
- Google Cloud Storage upload
- VertexAI endpoint deployment
- Terraform infrastructure setup

### BST Model Export and Optimization
Tools for exporting and optimizing BST (Badminton Stroke-type Transformer) models for cloud inference:

#### Quick Start
```bash
# Export BST model to TorchScript and ONNX formats
python export_bst_model.py --model_type BST_CG_AP --weights_path weights/bst_model.pt

# Test exported models for cloud deployment
python cloud_deployment_example.py --model_path weights/exported/bst_cg_ap_seq100_scripted.pt

# Run basic functionality tests
python test_export_basic.py
```

#### Makefile Commands
```bash
make export-bst        # Export BST model with default settings
make export-bst-all    # Export to all formats with benchmarking
make test-export       # Test export functionality
make test-cloud        # Test cloud deployment simulation
```

#### Key Features
- **Multiple Model Variants**: BST_0, BST, BST_CG, BST_AP, BST_CG_AP
- **Dual Export Formats**: TorchScript (.pt) and ONNX (.onnx)
- **Cloud Optimization**: Memory and inference speed optimization
- **Deployment Examples**: Google Cloud Functions, AWS Lambda, ONNX Runtime
- **Performance Benchmarking**: Inference speed and memory usage testing

See [docs/BST_MODEL_EXPORT_GUIDE.md](docs/BST_MODEL_EXPORT_GUIDE.md) for comprehensive documentation.

### Experiments (experiments/)
Experimental notebooks for testing new approaches:
- **multipose_movenet_test/**: Testing MoveNet models for multi-person pose detection

## Usage Examples

### Training a Shot Prediction Model

```python
# From modeling directory
from modeling.train import train_model
from modeling.config import MODEL_CONFIG

# Train LSTM model on labeled pose data
model = train_model(
    data_path="../data/output/pose_data.csv",
    labels_path="../data/labels/shot_labels.csv",
    config=MODEL_CONFIG
)
```

### Making Predictions

```python
from modeling.predict import predict_shot
from modeling.feature_engineering import preprocess_pose_sequence

# Predict shot type from pose sequence
pose_sequence = preprocess_pose_sequence(pose_data)
prediction = predict_shot(model, pose_sequence)
```

## Troubleshooting

### Common Issues

1. **Import errors when running scripts**
   - Make sure your virtual environment is activated: `source .venv/bin/activate`
   - Install dependencies: `pip install -r requirements.txt`

2. **Dependency conflicts during installation**
   - Try installing packages individually to identify conflicts
   - Use `pip install --upgrade pip` before installing requirements
   - Consider using fresh virtual environment

3. **MediaPipe installation issues**
   - MediaPipe has specific platform requirements
   - Try: `pip install --upgrade mediapipe`
   - On some systems, you may need to install system dependencies

4. **Jupyter notebooks not starting**
   - Install Jupyter: `pip install -r requirements_dev.txt`
   - Or manually: `pip install jupyter ipykernel ipywidgets`

5. **Browser extension not loading**
   - Enable Developer mode in Chrome Extensions
   - Check for console errors in the extension
   - Rebuild with `npm run build` in the chrome-extension directory

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add your changes with appropriate documentation
4. Test your changes with the existing notebooks
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Credits

- Badminton shots glossary adapted from [WorldBadminton.com](https://www.worldbadminton.com/glossary.htm)
- Pose estimation powered by [MediaPipe](https://mediapipe.dev/) and [TensorFlow.js](https://tensorflow.org/js)
- Machine learning with [TensorFlow](https://tensorflow.org/) and [scikit-learn](https://scikit-learn.org/)
- Video downloading via [yt-dlp](https://github.com/yt-dlp/yt-dlp)
- Browser extension built with [esbuild](https://esbuild.github.io/)

Developed by [Jin-HoMLee](https://github.com/Jin-HoMLee) with assistance from GitHub Copilot.

---

Last updated: September 2025 - Dependencies optimized, deprecated code removed, documentation improved.

---
