# Jupyter Notebooks for Badminton Analysis

This directory contains Jupyter notebooks for interactive badminton video analysis, data exploration, and model development.

## Available Notebooks

### 01_pose_overlay_video.ipynb
**Purpose**: Pose visualization and video overlay demonstration  
**Description**: Shows how to overlay pose detection results on badminton videos for visual analysis and validation.

**Key Features**:
- Pose estimation visualization on video frames
- Overlay pose landmarks on original video
- Interactive pose analysis tools
- Video export with pose annotations

**Usage**: 
- Start with a downloaded badminton video
- Follow the notebook to see pose detection in action
- Useful for validating pose estimation quality

### 02_manual_labeling_segmenting.ipynb
**Purpose**: Interactive data labeling and video segmentation  
**Description**: Tools for manually labeling badminton shots and segmenting videos into meaningful sequences.

**Key Features**:
- Manual shot labeling interface
- Video segmentation tools
- Label export for training data
- Quality control for labeled data

**Usage**:
- Load badminton videos for analysis
- Manually label shots and key moments
- Export labeled data for model training

### 03_lstm_shot_prediction.ipynb
**Purpose**: LSTM model training for shot prediction  
**Description**: Implements and trains LSTM neural networks to predict badminton shots from pose sequences.

**Key Features**:
- LSTM model architecture for temporal analysis
- Training on pose sequence data
- Shot type classification
- Model evaluation and visualization

**Usage**:
- Load pose data from previous analysis steps
- Train LSTM models on labeled shot sequences
- Evaluate model performance on badminton shots

### EDA-and-modeling_template.ipynb
**Purpose**: Template for exploratory data analysis  
**Description**: Reusable template for exploring pose data and developing new modeling approaches.

**Key Features**:
- Data exploration templates
- Visualization patterns for pose data
- Model development framework
- Analysis workflow templates

**Usage**:
- Copy and adapt for new analysis projects
- Follow structured approach to data exploration
- Use as starting point for custom analysis

## Getting Started

1. **Set up environment**:
   ```bash
   source .venv/bin/activate
   pip install -r requirements_dev.txt
   ```

2. **Start Jupyter**:
   ```bash
   jupyter lab
   ```

3. **Run notebooks in order**:
   - Start with `01_pose_overlay_video.ipynb` to understand pose detection
   - Use `02_manual_labeling_segmenting.ipynb` to create training data
   - Train models with `03_lstm_shot_prediction.ipynb`
   - Use template notebook for custom analysis

## Data Requirements

- **Video Files**: Badminton videos (MP4 format recommended)
- **Pose Data**: Output from `src/analyze_pose.py`
- **Labels**: Manual annotations from browser extension or labeling notebook

## Output Files

- **Annotated Videos**: Videos with pose overlays
- **Training Data**: Labeled pose sequences for model training
- **Trained Models**: LSTM models for shot prediction
- **Analysis Results**: Plots, metrics, and evaluation reports

## Tips for Best Results

- **Video Quality**: Use high-resolution videos for better pose detection
- **Lighting**: Ensure good lighting and contrast for pose accuracy
- **Frame Rate**: Consider video frame rate when setting analysis intervals
- **Labeling**: Be consistent in manual labeling for better model training

## Dependencies

Required packages are listed in `requirements_dev.txt`:
- `jupyter`: For notebook environment
- `ipywidgets`: For interactive widgets
- `matplotlib`, `seaborn`: For visualizations
- `tensorflow`: For LSTM model training
- `opencv-python`: For video processing
- `mediapipe`: For pose estimation

---

**Note**: These notebooks are designed to work with the pose analysis pipeline in `src/` and can integrate with the browser extension for manual labeling workflows.