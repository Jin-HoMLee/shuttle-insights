# Shuttle Insights
Shuttle Insights is a multi-component badminton video analysis system with a Python pose estimation pipeline, Chrome browser extension for YouTube video labeling, MLflow modeling pipeline, and Google Cloud deployment infrastructure.

**ALWAYS reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Working Effectively

### Environment Setup
- **CRITICAL DEPENDENCY ISSUE RESOLVED**: Use the provided `requirements-fixed.txt` file with compatible version pins to avoid numpy and other dependency conflicts. You MUST use this file for Python work:
  ```bash
  python3 -m venv .venv
  source .venv/bin/activate
  pip install --upgrade pip
  pip install -r requirements-fixed.txt

### Browser Extension Development
- **FASTEST BUILD COMPONENT**: Browser extension builds in under 1 second
- Setup and build process:
  ```bash
  cd browser-extension
  npm install  # Takes ~4 seconds, NEVER CANCEL
  npm run build  # Takes ~0.3 seconds
  ```
- **VALIDATION**: After building, verify `chrome-extension/dist/content.js` exists (~2.2MB file)
- Extension can be loaded in Chrome via `chrome://extensions` -> "Load unpacked" -> select `chrome-extension` folder

### Python Pipeline
- **Core Scripts Location**: `src/` directory contains main pipeline scripts
- **NO CLI INTERFACES**: Scripts do not have `if __name__ == "__main__"` blocks - they are library functions
- **Required Dependencies**: OpenCV, MediaPipe, yt-dlp, pandas for core functionality
- Basic pipeline workflow:
  ```python
  # Import and use functions directly
  from src.download_video import download_video
  from src.extract_frames import extract_frames  
  from src.analyze_pose import analyze_poses
  
  # Execute pipeline
  video_dir = download_video("https://youtube.com/watch?v=...")
  extract_frames(f"{video_dir}/video.mp4")
  analyze_poses()
  ```

### Modeling Pipeline
- **MLflow Integration**: Located in `modeling/` directory
- **Dependencies**: Requires MLflow, scikit-learn, parsenvy
- **Configuration**: Uses `.mlflow_uri` file or `MLFLOW_URI` environment variable
- Run training:
  ```bash
  cd modeling
  python train.py
  ```

### Jupyter Notebooks
- **NEVER CANCEL**: Notebook execution with TensorFlow can take 20+ minutes. Set timeout to 30+ minutes.
- **Dependencies Required**: All notebooks require the full Python environment setup
- Available notebooks:
  - `01_pose_overlay_video.ipynb`: Video pose overlay visualization
  - `02_manual_labeling_segmenting.ipynb`: Manual video labeling
  - `03_lstm_shot_prediction.ipynb`: LSTM model for shot prediction
  - `EDA-and-modeling_template.ipynb`: Exploratory data analysis template

### Google Cloud Deployment
- **Terraform Required**: Install terraform separately (not included in requirements)
- **Configuration**: Located in `vertexai_model_endpoint_setup/terraform/`
- **NEVER CANCEL**: Terraform operations can take 10+ minutes. Set timeout to 15+ minutes.
- Setup:
  ```bash
  cd vertexai_model_endpoint_setup/terraform
  terraform init
  terraform plan
  terraform apply
  ```

## Validation Scenarios

### ALWAYS Test Browser Extension Build
- **PRIMARY VALIDATION**: This is the fastest and most reliable validation
- Steps:
  1. `cd browser-extension && npm install` (expect ~4 seconds)
  2. `npm run build` (expect ~0.3 seconds)  
  3. Verify `chrome-extension/dist/content.js` exists and is ~2.2MB
  4. Check for build warnings but no errors

### Python Environment Validation
- **AFTER resolving dependency conflicts**:
  ```bash
  source .venv/bin/activate
  python -c "import cv2, pandas, mediapipe; print('Core dependencies available')"
  python -c "from src.download_video import download_video; print('Scripts importable')"
  ```

### Full Pipeline Test (When Dependencies Available)
- **NEVER CANCEL**: Full pipeline can take 30+ minutes with video download and processing
- **Requires Internet**: YouTube video download needs network access
- Test with short video for faster validation:
  ```python
  from src.download_video import download_video
  from src.extract_frames import extract_frames
  # Use a short test video URL
  video_dir = download_video("https://youtube.com/watch?v=SHORT_VIDEO")
  extract_frames(f"{video_dir}/video.mp4", every_nth=30)  # Extract fewer frames
  ```

## Directory Structure Reference

```
shuttle-insights/
├── .github/
│   └── copilot-instructions.md     # This file
├── browser-extension/              # Chrome extension for YouTube labeling
│   ├── package.json               # Node.js dependencies (esbuild, tensorflow.js)
│   ├── chrome-extension/          # Extension source and manifest
│   │   ├── src/                   # JavaScript source files
│   │   ├── dist/                  # Built extension (created by npm run build)
│   │   ├── manifest.json          # Chrome extension manifest
│   │   └── badminton_shots_glossary.json
│   └── README.md                  # Extension usage instructions
├── src/                           # Python pipeline scripts
│   ├── download_video.py          # YouTube video download (requires yt-dlp)
│   ├── extract_frames.py          # Video frame extraction (requires OpenCV)
│   ├── analyze_pose.py           # Pose estimation (requires MediaPipe)
│   └── utils.py                   # Utilities (placeholder)
├── modeling/                      # MLflow modeling pipeline
│   ├── train.py                   # Model training with MLflow tracking
│   ├── config.py                  # MLflow configuration
│   ├── feature_engineering.py    # Feature processing
│   └── predict.py                 # Model prediction
├── notebooks/                     # Jupyter analysis notebooks
├── vertexai_model_endpoint_setup/ # Google Cloud deployment
│   ├── terraform/                 # Infrastructure as code
│   └── *.ipynb                   # Vertex AI deployment notebooks
├── experiments/                   # Experimental code
├── data/                         # Data storage (gitignored)
├── requirements.txt              # Python dependencies (HAS CONFLICTS)
└── Makefile                      # Environment setup (references missing requirements_dev.txt)
```

## Known Issues and Limitations

### Critical Dependency Conflicts
- **requirements.txt has numpy version conflicts** - resolve by installing packages without version pins
- **requirements_dev.txt missing** - Makefile references this file but it doesn't exist
- **Network timeouts** - PyPI installations may timeout, retry with longer timeouts

### Missing Tools
- **No Terraform installed** - Required for cloud deployment
- **No test framework** - Repository has no unit tests or test configuration
- **No linting configuration** - No ESLint, Pylint, or other code quality tools
- **No CI/CD** - No GitHub Actions or other automated workflows

### Environment Dependencies
- **Python 3.11.3 preferred** but 3.12+ works with dependency resolution
- **Node.js 20+ required** for browser extension
- **Google Cloud credentials required** for Vertex AI deployment

## Time Expectations

- **Browser extension build**: 5 seconds total (4s install + 0.3s build)
- **Python environment setup**: 15-20 minutes (dependency resolution + large packages)
- **Full video processing**: 30+ minutes (depends on video length)
- **Model training**: 10-20 minutes (depends on data size)
- **Terraform deployment**: 10-15 minutes (cloud resource provisioning)

## Always Validate Changes

- **Browser extension**: Run build after any changes to `browser-extension/chrome-extension/src/`
- **Python scripts**: Test imports after dependency changes
- **Notebooks**: Restart kernel and run all cells after environment changes
- **No automated testing available** - manual validation required for all changes