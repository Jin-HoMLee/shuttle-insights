# Machine Learning Modeling Pipeline

This directory contains the machine learning pipeline for badminton shot prediction and analysis. It provides MLflow-based experiment tracking and model training workflows.

## Current Status

⚠️ **Template Implementation**: The current modules contain template code using coffee quality data as an example. For badminton-specific modeling, these need to be adapted to work with pose sequence data and shot classification.

## Module Overview

### config.py
**Purpose**: MLflow configuration and experiment settings  
**Features**:
- MLflow tracking URI management
- Experiment naming and organization
- Logging configuration

**Usage**:
```python
from modeling.config import TRACKING_URI, EXPERIMENT_NAME
import mlflow

mlflow.set_tracking_uri(TRACKING_URI)
mlflow.set_experiment(EXPERIMENT_NAME)
```

### feature_engineering.py
**Purpose**: Data preprocessing and feature extraction  
**Current**: Template functions for data transformation  
**Needed**: Badminton-specific feature engineering

**Template Functions**:
- `transform_altitude()`: Data scaling and transformation
- `drop_column()`: Column management utility
- `fill_missing_values()`: Missing data imputation

**For Badminton Implementation**:
```python
# Needed functions for pose data:
def normalize_pose_coordinates(pose_data)
def extract_temporal_features(pose_sequences)
def calculate_movement_features(pose_data)
def prepare_shot_sequences(pose_data, labels)
```

### train.py
**Purpose**: Model training with MLflow tracking  
**Current**: Linear regression template with coffee data  
**Needed**: LSTM/CNN models for pose sequence analysis

**Template Features**:
- MLflow experiment tracking
- Automated metric logging
- Model training pipeline
- Data splitting and validation

**For Badminton Implementation**:
```python
# Needed for shot prediction:
- LSTM architecture for temporal pose analysis
- Multi-class classification for shot types
- Sequence-to-sequence models for shot timing
- Pose coordinate normalization and preprocessing
```

### predict.py
**Purpose**: Model inference and prediction  
**Current**: Command-line prediction script  
**Needed**: Real-time pose sequence prediction

**Current Usage**:
```bash
python modeling/predict.py <model_path> <X_test_path> <y_test_path>
```

**For Badminton Implementation**:
```python
# Needed capabilities:
- Real-time pose sequence prediction
- Shot confidence scoring
- Temporal prediction smoothing
- Integration with pose analysis pipeline
```

## Implementation Roadmap

### Phase 1: Data Integration
- [ ] Connect with pose analysis output from `src/analyze_pose.py`
- [ ] Load and preprocess pose sequence data
- [ ] Integrate with browser extension labeled data
- [ ] Implement train/test split for temporal data

### Phase 2: Feature Engineering
- [ ] Pose coordinate normalization
- [ ] Temporal feature extraction (velocity, acceleration)
- [ ] Movement pattern analysis
- [ ] Shot-specific feature engineering

### Phase 3: Model Development
- [ ] LSTM architecture for pose sequences
- [ ] Multi-class shot type classification
- [ ] Temporal alignment and shot timing prediction
- [ ] Model evaluation and validation

### Phase 4: Production Integration
- [ ] Real-time prediction pipeline
- [ ] Model serving and endpoints
- [ ] Integration with video analysis workflow
- [ ] Performance optimization

## Getting Started

### 1. Set Up MLflow Tracking

Create `.mlflow_uri` file in project root:
```bash
echo "http://localhost:5000" > .mlflow_uri
```

Or set environment variable:
```bash
export MLFLOW_URI="http://localhost:5000"
```

### 2. Start MLflow Server (Optional)
```bash
mlflow server --host 0.0.0.0 --port 5000
```

### 3. Run Template Training
```python
from modeling.train import run_training
run_training()  # Runs template training with coffee data
```

## Dependencies

Core requirements for modeling:
```
mlflow>=2.0.0          # Experiment tracking
scikit-learn>=1.0.0    # Machine learning algorithms
pandas>=1.3.0          # Data manipulation
numpy>=1.21.0          # Numerical computing
tensorflow>=2.8.0      # Deep learning (for LSTM/CNN)
parsenvy>=2.0.0        # Environment variable parsing
```

For badminton-specific modeling, add:
```
mediapipe>=0.9.0       # Pose detection integration
opencv-python>=4.5.0   # Video processing
matplotlib>=3.5.0      # Visualization
seaborn>=0.11.0        # Statistical plotting
```

## Data Requirements

### Current Template Data
- Coffee quality dataset (automatically downloaded)
- Regression targets and features
- Structured tabular data

### Badminton Data Requirements
- **Pose Sequences**: Output from `src/analyze_pose.py`
- **Shot Labels**: Manual annotations from browser extension
- **Video Metadata**: Frame timing and video information
- **Temporal Alignment**: Frame-to-shot mapping

### Expected Data Format
```python
# Pose sequence data
pose_data = {
    'video_id': str,
    'frame_id': int,
    'timestamp': float,
    'pose_landmarks': List[Dict],  # MediaPipe landmarks
    'shot_label': str,             # From manual annotation
    'shot_timing': Dict            # Start/end frames
}
```

## Integration Points

### With Core Pipeline
- **Input**: Pose data from `src/analyze_pose.py`
- **Labels**: Shot annotations from browser extension
- **Output**: Trained models for shot prediction

### With Notebooks
- **Training**: Use `03_lstm_shot_prediction.ipynb` for model development
- **Analysis**: Leverage EDA notebook for data exploration
- **Validation**: Visual evaluation of model predictions

### With Cloud Deployment
- **Models**: Export trained models for VertexAI deployment
- **Inference**: Real-time prediction endpoints
- **Monitoring**: Model performance tracking

---

**Next Steps**: Adapt template modules to work with badminton pose data and implement LSTM-based shot prediction models. See [STARTER_PIPELINE_CHECKLIST.md](../docs/STARTER_PIPELINE_CHECKLIST.md) for detailed implementation guidance.