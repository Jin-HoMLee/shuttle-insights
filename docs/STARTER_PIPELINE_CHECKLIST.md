# Badminton Shot Classification Pipeline Checklist

A comprehensive, modular checklist for building a badminton shot classification system using computer vision, pose estimation, and machine learning. This guide references state-of-the-art resources and provides practical implementation templates for contributors.

## 📊 Data Preparation & Collection

### Dataset Sources
- [ ] **ShuttleSet22**: Download and process the ShuttleSet22 dataset
  - [ ] Register and access the [ShuttleSet22 dataset](https://sites.google.com/view/shuttleset22/home)
  - [ ] Extract badminton videos with shot annotations
  - [ ] Convert annotations to standardized format (timestamp, shot_type, coordinates)
  - [ ] Verify data quality and annotation consistency

- [ ] **Badminton Stroke Technique (BST) Dataset**: Integrate BST for stroke analysis
  - [ ] Access BST dataset for detailed stroke biomechanics
  - [ ] Align BST annotations with ShuttleSet22 temporal segments
  - [ ] Extract technique quality labels and performance metrics

- [ ] **Custom Data Collection**: Use browser extension for additional labeling
  - [ ] Set up the [browser extension](browser-extension/) for YouTube video labeling
  - [ ] Label 50+ videos with shot types using the badminton glossary
  - [ ] Export labeled data as CSV using the extension's export feature
  - [ ] Validate annotation consistency across multiple annotators

### Data Structure & Organization
- [ ] **Standardized Data Format**:
  ```
  data/
  ├── videos/                     # Raw video files
  │   ├── {video_hash}/
  │   │   ├── video.mp4          # Original video
  │   │   ├── frames/            # Extracted frames
  │   │   ├── pose_data.csv      # Pose keypoints per frame
  │   │   └── manual_labels.csv  # Shot annotations
  ├── processed/                  # Processed datasets
  │   ├── shot_sequences/        # Segmented shot clips
  │   ├── features/              # Extracted features
  │   └── labels/                # Consolidated labels
  └── splits/                    # Train/val/test splits
      ├── train.csv
      ├── val.csv
      └── test.csv
  ```

- [ ] **Data Quality Assurance**:
  - [ ] Implement frame quality filtering (blur detection, lighting)
  - [ ] Verify pose detection confidence thresholds (>0.7 recommended)
  - [ ] Check temporal consistency in pose sequences
  - [ ] Balance shot type distribution across dataset

## 🏸 Shuttlecock Detection & Tracking

### TrackNet Integration
- [ ] **TrackNet Model Setup**: Implement shuttlecock tracking using TrackNet
  - [ ] Clone and setup [TrackNet repository](https://github.com/Chang-Chia-chi/TrackNet-Badminton-Tracking-tensorflow2)
  - [ ] Download pre-trained TrackNet weights for badminton
  - [ ] Integrate TrackNet inference into video processing pipeline
  - [ ] Validate tracking accuracy on test videos

- [ ] **Trajectory Analysis**:
  - [ ] Extract shuttlecock coordinates per frame
  - [ ] Implement trajectory smoothing (Kalman filter or similar)
  - [ ] Calculate velocity, acceleration, and flight patterns
  - [ ] Detect rally start/end based on trajectory discontinuities

### Custom Tracking Enhancements
- [ ] **Multi-Object Tracking**: Enhance tracking robustness
  - [ ] Implement YOLO-based shuttlecock detection as backup
  - [ ] Add tracking confidence scoring
  - [ ] Handle occlusion and rapid motion scenarios
  - [ ] Integrate with pose estimation for player-shuttlecock relationships

## 🤸 Pose Estimation & Player Analysis

### MediaPipe Integration (Existing)
- [ ] **Leverage Existing Pipeline**: Utilize current MediaPipe setup
  - [ ] Review and enhance [analyze_pose.py](src/analyze_pose.py)
  - [ ] Validate pose detection accuracy on badminton players
  - [ ] Optimize keypoint extraction for racket sports movements
  - [ ] Handle multi-player scenarios (singles/doubles)

- [ ] **Pose Quality Assessment**:
  - [ ] Implement pose confidence filtering
  - [ ] Detect and handle pose estimation failures
  - [ ] Validate keypoint anatomical consistency
  - [ ] Add pose completeness scoring (all keypoints visible)

### Advanced Pose Features
- [ ] **Biomechanical Analysis**: Extract sport-specific features
  - [ ] Calculate joint angles (shoulder, elbow, wrist, hip, knee)
  - [ ] Measure limb velocities and accelerations
  - [ ] Detect racket position and orientation (if visible)
  - [ ] Extract stance and movement patterns

- [ ] **Player Tracking**: Maintain player identity across frames
  - [ ] Implement player detection and tracking
  - [ ] Handle player identification in doubles matches
  - [ ] Track court position and movement patterns
  - [ ] Correlate player actions with shuttlecock events

## ⏱️ Temporal Segmentation & Shot Boundary Detection

### Shot Segmentation Pipeline
- [ ] **Automated Shot Detection**: Identify shot boundaries
  - [ ] Implement change point detection on pose sequences
  - [ ] Use shuttlecock trajectory analysis for shot timing
  - [ ] Detect swing phases (preparation, contact, follow-through)
  - [ ] Validate against manual annotations

- [ ] **Temporal Feature Extraction**:
  ```python
  # Example shot segmentation approach
  def detect_shot_boundaries(pose_sequence, shuttlecock_trajectory):
      """
      Detect shot start/end times using multimodal signals
      """
      # 1. Detect rapid pose changes (swing motion)
      pose_velocity = calculate_pose_velocity(pose_sequence)
      swing_peaks = find_peaks(pose_velocity, prominence=threshold)
      
      # 2. Correlate with shuttlecock direction changes
      trajectory_changes = detect_trajectory_changes(shuttlecock_trajectory)
      
      # 3. Combine signals for robust detection
      shot_boundaries = align_temporal_events(swing_peaks, trajectory_changes)
      return shot_boundaries
  ```

### Context-Aware Segmentation
- [ ] **Rally Context**: Consider match context for shot classification
  - [ ] Track rally progression and shot sequences
  - [ ] Identify serve vs. return vs. rally shots
  - [ ] Account for defensive vs. offensive contexts
  - [ ] Model shot transition probabilities

## 🔧 Multimodal Feature Engineering

### Feature Categories
- [ ] **Pose-Based Features**: Extract kinematic features from pose data
  - [ ] Joint angle sequences (17 MediaPipe keypoints)
  - [ ] Velocity and acceleration profiles
  - [ ] Center of mass movement
  - [ ] Pose stability and balance metrics

- [ ] **Visual Features**: Extract appearance-based features
  - [ ] CNN features from shot frames (ResNet, EfficientNet)
  - [ ] Optical flow between frames
  - [ ] Court region analysis (front, middle, back)
  - [ ] Player appearance and clothing features

- [ ] **Temporal Features**: Capture shot timing characteristics
  - [ ] Shot duration and rhythm
  - [ ] Pre/post-shot context windows
  - [ ] Frequency domain features (FFT of pose sequences)
  - [ ] Temporal attention weights

- [ ] **Shuttlecock Features**: Incorporate ball flight characteristics
  - [ ] Trajectory shape and curvature
  - [ ] Speed and spin estimation
  - [ ] Landing position and angle
  - [ ] Flight time and height

### Feature Engineering Pipeline
```python
# Example multimodal feature extraction
def extract_multimodal_features(shot_data):
    """
    Extract comprehensive features for shot classification
    """
    features = {}
    
    # Pose features
    features['pose'] = extract_pose_features(shot_data['poses'])
    features['kinematic'] = calculate_joint_kinematics(shot_data['poses'])
    
    # Visual features
    features['visual'] = extract_cnn_features(shot_data['frames'])
    features['optical_flow'] = calculate_optical_flow(shot_data['frames'])
    
    # Temporal features
    features['temporal'] = extract_temporal_patterns(shot_data['sequence'])
    
    # Shuttlecock features
    features['shuttlecock'] = analyze_trajectory(shot_data['trajectory'])
    
    return features
```

## 🧠 Model Architecture & Design

### LSTM-Based Models (Existing)
- [ ] **Enhance Current LSTM**: Build upon [03_lstm_shot_prediction.ipynb](notebooks/03_lstm_shot_prediction.ipynb)
  - [ ] Optimize sequence length and padding strategies
  - [ ] Add bidirectional LSTM layers
  - [ ] Implement attention mechanisms
  - [ ] Add dropout and regularization

### Modern Architecture Alternatives
- [ ] **Transformer Models**: Implement attention-based sequence modeling
  ```python
  import torch
  import torch.nn as nn
  
  class ShotClassificationTransformer(nn.Module):
      def __init__(self, input_dim, num_classes, seq_length):
          super().__init__()
          self.positional_encoding = PositionalEncoding(input_dim)
          self.transformer = nn.TransformerEncoder(
              nn.TransformerEncoderLayer(
                  d_model=input_dim,
                  nhead=8,
                  dim_feedforward=512,
                  dropout=0.1
              ),
              num_layers=6
          )
          self.classifier = nn.Linear(input_dim, num_classes)
      
      def forward(self, x):
          x = self.positional_encoding(x)
          x = self.transformer(x)
          x = x.mean(dim=1)  # Global average pooling
          return self.classifier(x)
  ```

- [ ] **Graph Neural Networks**: Model pose as graph structure
  - [ ] Implement GCN for pose skeleton analysis
  - [ ] Model temporal graph evolution
  - [ ] Include spatial relationships between joints
  - [ ] Incorporate court position as graph context

- [ ] **3D CNN Models**: Process spatiotemporal features
  - [ ] Implement 3D ResNet for video classification
  - [ ] Use I3D (Inflated 3D ConvNet) for action recognition
  - [ ] Combine with pose features for multimodal learning

### Multimodal Fusion Strategies
- [ ] **Early Fusion**: Concatenate features before modeling
- [ ] **Late Fusion**: Ensemble predictions from separate models
- [ ] **Attention Fusion**: Learn feature importance weights
- [ ] **Cross-Modal Attention**: Model interactions between modalities

## 🏋️ Training & Optimization

### Training Pipeline
- [ ] **Data Loading & Augmentation**:
  ```python
  # Example training setup
  def create_data_loaders():
      transform = Compose([
          TemporalResize(seq_length=100),
          RandomTemporalCrop(crop_length=80),
          NormalizePose(),
          AddGaussianNoise(std=0.01)
      ])
      
      train_dataset = ShotDataset('data/splits/train.csv', transform=transform)
      val_dataset = ShotDataset('data/splits/val.csv', transform=None)
      
      return DataLoader(train_dataset, batch_size=32, shuffle=True), \
             DataLoader(val_dataset, batch_size=32, shuffle=False)
  ```

- [ ] **Training Configuration**:
  - [ ] Implement class balancing for imbalanced shot types
  - [ ] Use focal loss for difficult examples
  - [ ] Add learning rate scheduling
  - [ ] Implement early stopping and model checkpointing

### Hyperparameter Optimization
- [ ] **MLflow Integration**: Use existing [modeling/config.py](modeling/config.py)
  - [ ] Track experiments with MLflow
  - [ ] Log hyperparameters and metrics
  - [ ] Compare model architectures
  - [ ] Store best model artifacts

- [ ] **Hyperparameter Search**:
  - [ ] Grid search for basic parameters
  - [ ] Bayesian optimization for complex spaces
  - [ ] Population-based training for neural architecture search

## 📊 Evaluation & Metrics

### Classification Metrics
- [ ] **Standard Metrics**: Implement comprehensive evaluation
  - [ ] Accuracy, Precision, Recall, F1-score per shot type
  - [ ] Confusion matrix analysis
  - [ ] ROC curves and AUC scores
  - [ ] Classification report with support counts

- [ ] **Temporal Metrics**: Evaluate sequence-level performance
  - [ ] Shot boundary detection accuracy
  - [ ] Temporal IoU for shot segments
  - [ ] Sequence-level precision and recall

### Domain-Specific Evaluation
- [ ] **Shot Quality Assessment**: Evaluate shot technique quality
  - [ ] Correlate with BST technique scores
  - [ ] Validate against expert annotations
  - [ ] Measure consistency across different players

- [ ] **Cross-Validation Strategies**:
  - [ ] Player-independent splits (avoid data leakage)
  - [ ] Court/venue-independent validation
  - [ ] Temporal splits (train on older, test on newer data)

## 🚀 Inference & Deployment

### Real-Time Inference
- [ ] **Model Optimization**: Prepare for production deployment
  - [ ] Model quantization and pruning
  - [ ] ONNX conversion for cross-platform inference
  - [ ] TensorRT optimization for GPU inference
  - [ ] Mobile deployment with TensorFlow Lite

- [ ] **Inference Pipeline**:
  ```python
  class ShotClassificationPipeline:
      def __init__(self, model_path, config):
          self.pose_detector = load_pose_detector()
          self.shuttlecock_tracker = load_tracknet_model()
          self.classifier = load_shot_classifier(model_path)
          
      def process_video(self, video_path):
          frames = extract_frames(video_path)
          poses = [self.pose_detector(frame) for frame in frames]
          trajectory = self.shuttlecock_tracker(frames)
          
          shots = segment_shots(poses, trajectory)
          predictions = []
          
          for shot in shots:
              features = extract_features(shot)
              prediction = self.classifier(features)
              predictions.append(prediction)
              
          return predictions
  ```

### Cloud Deployment (Existing Infrastructure)
- [ ] **VertexAI Deployment**: Use existing [vertexai_model_endpoint_setup/](vertexai_model_endpoint_setup/)
  - [ ] Review [01_export_model_movenet.ipynb](vertexai_model_endpoint_setup/01_export_model_movenet.ipynb)
  - [ ] Adapt for shot classification models
  - [ ] Update [terraform/](vertexai_model_endpoint_setup/terraform/) configurations
  - [ ] Deploy endpoints for real-time inference

- [ ] **API Development**:
  - [ ] Create REST API for shot classification
  - [ ] Add batch processing endpoints
  - [ ] Implement authentication and rate limiting
  - [ ] Add monitoring and logging

## 📈 Visualization & Analysis

### Pose Visualization (Existing)
- [ ] **Enhanced Pose Overlays**: Build upon [01_pose_overlay_video.ipynb](notebooks/01_pose_overlay_video.ipynb)
  - [ ] Add shot prediction overlays
  - [ ] Show confidence scores and temporal segments
  - [ ] Highlight key poses and movement patterns
  - [ ] Include shuttlecock trajectory visualization

- [ ] **Interactive Analysis**: Create analysis dashboards
  - [ ] Shot distribution and frequency analysis
  - [ ] Player performance metrics
  - [ ] Technique quality heatmaps
  - [ ] Rally pattern visualization

### Performance Analytics
- [ ] **Match Analysis**: Comprehensive match breakdowns
  - [ ] Shot selection and success rates
  - [ ] Player movement and court coverage
  - [ ] Rally length and intensity analysis
  - [ ] Tactical pattern recognition

- [ ] **Training Insights**: Provide coaching feedback
  - [ ] Technique improvement suggestions
  - [ ] Consistency metrics and trends
  - [ ] Comparison with professional players
  - [ ] Personalized training recommendations

## ☁️ Cloud Infrastructure & Scaling

### Google Cloud Platform (Existing)
- [ ] **Infrastructure as Code**: Use existing [terraform/](vertexai_model_endpoint_setup/terraform/)
  - [ ] Review and update Terraform configurations
  - [ ] Set up auto-scaling for inference workloads
  - [ ] Configure monitoring and alerting
  - [ ] Implement cost optimization strategies

- [ ] **Data Pipeline**: Scalable data processing
  - [ ] Use Cloud Dataflow for batch processing
  - [ ] Implement Cloud Pub/Sub for real-time streaming
  - [ ] Set up BigQuery for analytics and reporting
  - [ ] Configure Cloud Storage for data archival

### MLOps Pipeline
- [ ] **Continuous Integration**: Automate model lifecycle
  - [ ] Set up GitHub Actions for model training
  - [ ] Implement automated testing for model performance
  - [ ] Add model validation and approval workflows
  - [ ] Configure automated deployment pipelines

## 🔬 Experiment Tracking & Management

### MLflow Integration (Existing)
- [ ] **Enhanced Experiment Tracking**: Build upon [modeling/config.py](modeling/config.py)
  - [ ] Track data versions and feature engineering steps
  - [ ] Log model artifacts and dependencies
  - [ ] Compare model architectures and hyperparameters
  - [ ] Implement model versioning and lineage

- [ ] **Experiment Organization**:
  ```python
  # Example MLflow experiment structure
  import mlflow
  
  def run_experiment(config):
      with mlflow.start_run(experiment_id="shot_classification"):
          # Log parameters
          mlflow.log_params(config)
          
          # Train model
          model = train_model(config)
          
          # Evaluate model
          metrics = evaluate_model(model, val_data)
          mlflow.log_metrics(metrics)
          
          # Save model
          mlflow.sklearn.log_model(model, "shot_classifier")
          
          # Log artifacts
          mlflow.log_artifacts("plots/", "evaluation_plots")
  ```

### A/B Testing Framework
- [ ] **Model Comparison**: Systematic model evaluation
  - [ ] Implement statistical significance testing
  - [ ] Compare model performance across different conditions
  - [ ] Track model drift and performance degradation
  - [ ] Implement champion/challenger model framework

## 🎯 Sample Model Skeletons

### Basic LSTM Classifier
```python
import tensorflow as tf
from tensorflow.keras import layers, Model

class BasicShotClassifier(Model):
    def __init__(self, num_classes, sequence_length, feature_dim):
        super().__init__()
        self.lstm1 = layers.LSTM(128, return_sequences=True, dropout=0.2)
        self.lstm2 = layers.LSTM(64, dropout=0.2)
        self.dense1 = layers.Dense(32, activation='relu')
        self.dropout = layers.Dropout(0.3)
        self.classifier = layers.Dense(num_classes, activation='softmax')
    
    def call(self, inputs, training=None):
        x = self.lstm1(inputs, training=training)
        x = self.lstm2(x, training=training)
        x = self.dense1(x)
        x = self.dropout(x, training=training)
        return self.classifier(x)
```

### Multimodal Transformer
```python
import torch
import torch.nn as nn

class MultimodalShotClassifier(nn.Module):
    def __init__(self, pose_dim, visual_dim, num_classes):
        super().__init__()
        
        # Modality-specific encoders
        self.pose_encoder = nn.TransformerEncoder(
            nn.TransformerEncoderLayer(pose_dim, nhead=8), num_layers=3
        )
        self.visual_encoder = nn.Sequential(
            nn.Linear(visual_dim, 256),
            nn.ReLU(),
            nn.Dropout(0.1)
        )
        
        # Cross-modal attention
        self.cross_attention = nn.MultiheadAttention(256, num_heads=8)
        
        # Final classifier
        self.classifier = nn.Sequential(
            nn.Linear(512, 128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, num_classes)
        )
    
    def forward(self, pose_seq, visual_features):
        # Encode modalities
        pose_encoded = self.pose_encoder(pose_seq).mean(dim=1)
        visual_encoded = self.visual_encoder(visual_features)
        
        # Cross-modal attention
        attended, _ = self.cross_attention(
            pose_encoded.unsqueeze(0),
            visual_encoded.unsqueeze(0),
            visual_encoded.unsqueeze(0)
        )
        
        # Combine and classify
        combined = torch.cat([pose_encoded, attended.squeeze(0)], dim=-1)
        return self.classifier(combined)
```

### Feature Engineering Template
```python
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler

class ShotFeatureExtractor:
    def __init__(self):
        self.scaler = StandardScaler()
        
    def extract_pose_features(self, pose_sequence):
        """Extract kinematic features from pose sequence"""
        features = {}
        
        # Joint angles
        features['joint_angles'] = self.calculate_joint_angles(pose_sequence)
        
        # Velocity profiles
        features['velocities'] = np.diff(pose_sequence, axis=0)
        
        # Statistical features
        features['pose_mean'] = np.mean(pose_sequence, axis=0)
        features['pose_std'] = np.std(pose_sequence, axis=0)
        features['pose_range'] = np.ptp(pose_sequence, axis=0)
        
        return features
    
    def extract_temporal_features(self, sequence):
        """Extract temporal patterns and dynamics"""
        # Frequency domain features
        fft_features = np.abs(np.fft.fft(sequence, axis=0))
        
        # Rhythm and timing
        peak_times = self.detect_movement_peaks(sequence)
        
        return {
            'fft_features': fft_features,
            'peak_intervals': np.diff(peak_times),
            'sequence_length': len(sequence)
        }
```

## 📚 Key Resources & References

### Datasets
- **ShuttleSet22**: [https://sites.google.com/view/shuttleset22/home](https://sites.google.com/view/shuttleset22/home)
- **BST Dataset**: [Badminton Stroke Technique Dataset](https://ieeexplore.ieee.org/document/8784900)
- **BWF Video Archive**: [Badminton World Federation](https://bwfbadminton.com/videos/)

### Models & Tools
- **TrackNet**: [https://github.com/Chang-Chia-chi/TrackNet-Badminton-Tracking-tensorflow2](https://github.com/Chang-Chia-chi/TrackNet-Badminton-Tracking-tensorflow2)
- **MediaPipe**: [https://mediapipe.dev/](https://mediapipe.dev/)
- **YOLOv8**: [https://github.com/ultralytics/ultralytics](https://github.com/ultralytics/ultralytics)
- **MLflow**: [https://mlflow.org/](https://mlflow.org/)

### Research Papers
- "TrackNet: A Deep Learning Network for Tracking High-speed and Tiny Objects in Sport Applications"
- "ShuttleSet22: A Comprehensive Dataset for Badminton Video Analysis"
- "Pose Estimation and Action Recognition for Badminton Analysis"
- "Multimodal Learning for Sports Video Analysis"

---

## Getting Started

1. **Clone and Setup**: Follow the [README.md](README.md) setup instructions
2. **Choose Your Path**: Select relevant sections based on your goals
3. **Start Small**: Begin with existing notebooks and extend functionality
4. **Collaborate**: Use this checklist to coordinate team efforts
5. **Iterate**: Continuously improve and add new features

This checklist serves as a comprehensive guide for building production-ready badminton shot classification systems. Each section can be developed independently, making it ideal for collaborative development and incremental progress.