# Core Analysis Pipeline

This directory contains the core Python modules for badminton video analysis. These modules form the foundation of the pose estimation and video processing pipeline.

## Module Overview

### download_video.py
**Purpose**: YouTube video downloader for badminton analysis  
**Key Features**:
- Downloads YouTube videos using yt-dlp
- Creates unique directories based on URL hash
- Ensures MP4 format for consistent processing
- Error handling for missing dependencies

**Usage**:
```python
from src.download_video import download_video

video_dir = download_video("https://youtube.com/watch?v=VIDEO_ID")
video_path = f"{video_dir}/video.mp4"
```

**Dependencies**: `yt-dlp`, `hashlib`, `os`

### extract_frames.py
**Purpose**: Extract frames from videos for pose analysis  
**Key Features**:
- Configurable frame extraction intervals
- JPEG output with sequential naming
- Automatic directory creation
- Progress feedback during extraction

**Usage**:
```python
from src.extract_frames import extract_frames

extract_frames("path/to/video.mp4", 
               output_dir="data/frames", 
               every_nth=5)
```

**Dependencies**: `opencv-python`, `os`

### analyze_pose.py
**Purpose**: Pose estimation using MediaPipe  
**Key Features**:
- Batch processing of image directories
- MediaPipe pose landmark detection
- CSV export of 3D pose coordinates
- Handles missing pose detections

**Usage**:
```python
from src.analyze_pose import analyze_poses

analyze_poses(frame_dir="data/frames", 
              output_csv="data/pose_data.csv")
```

**Dependencies**: `mediapipe`, `opencv-python`, `pandas`, `os`

## Complete Pipeline Workflow

### Basic Usage
```python
# 1. Download a badminton video
from src.download_video import download_video
video_dir = download_video("https://youtube.com/watch?v=VIDEO_ID")
video_path = f"{video_dir}/video.mp4"

# 2. Extract frames for analysis
from src.extract_frames import extract_frames
extract_frames(video_path, output_dir="data/frames", every_nth=5)

# 3. Analyze poses in extracted frames
from src.analyze_pose import analyze_poses
analyze_poses(frame_dir="data/frames", output_csv="data/pose_data.csv")
```

### Advanced Configuration
```python
# High-frequency frame extraction for detailed analysis
extract_frames(video_path, every_nth=2)  # Every 2nd frame

# Low-frequency extraction for overview analysis
extract_frames(video_path, every_nth=30)  # Every 30th frame

# Custom output locations
extract_frames(video_path, 
               output_dir="analysis/high_res_frames",
               every_nth=1)  # Every frame
```

## Data Flow

```
YouTube URL → download_video.py → video.mp4
    ↓
video.mp4 → extract_frames.py → frame_000.jpg, frame_005.jpg, ...
    ↓
frames/ → analyze_pose.py → pose_data.csv
```

## Output Formats

### Video Download
- **Directory**: `{output_dir}/{url_hash}/`
- **File**: `video.mp4` in MP4 format
- **Naming**: Uses SHA256 hash of URL for unique directories

### Frame Extraction
- **Files**: `frame_{frame_id}.jpg` (e.g., `frame_0.jpg`, `frame_5.jpg`)
- **Format**: JPEG images
- **Naming**: Sequential frame IDs based on extraction interval

### Pose Analysis
- **File**: CSV with pose landmark data
- **Columns**: `frame, x_0, y_0, z_0, x_1, y_1, z_1, ...`
- **Landmarks**: 33 MediaPipe pose landmarks per detected person
- **Coordinates**: Normalized (0-1 for x,y; relative depth for z)

## Error Handling

### Common Issues
1. **Missing yt-dlp**: Install with `pip install yt-dlp`
2. **Invalid video URLs**: Check URL format and availability
3. **OpenCV issues**: Ensure `opencv-python` is installed
4. **MediaPipe installation**: May require specific platform builds

### Troubleshooting
```python
# Test video download
try:
    video_dir = download_video("https://youtube.com/watch?v=dQw4w9WgXcQ")
    print(f"Video downloaded to: {video_dir}")
except Exception as e:
    print(f"Download failed: {e}")

# Test frame extraction
try:
    extract_frames("test_video.mp4", "test_frames/", every_nth=10)
    print("Frame extraction successful")
except Exception as e:
    print(f"Frame extraction failed: {e}")

# Test pose analysis
try:
    analyze_poses("test_frames/", "test_poses.csv")
    print("Pose analysis successful")
except Exception as e:
    print(f"Pose analysis failed: {e}")
```

## Performance Considerations

### Frame Extraction
- **Storage**: Higher frame rates require more disk space
- **Processing**: More frames = longer pose analysis time
- **Quality**: Balance between analysis detail and computational cost

### Pose Analysis
- **Speed**: MediaPipe is optimized but still CPU/GPU intensive
- **Accuracy**: Better lighting and resolution improve detection
- **Memory**: Large numbers of frames may require batch processing

### Recommended Settings
```python
# For overview analysis (fast)
extract_frames(video_path, every_nth=30)  # ~1 frame per second

# For detailed analysis (slower)
extract_frames(video_path, every_nth=5)   # ~6 frames per second

# For training data (comprehensive)
extract_frames(video_path, every_nth=2)   # ~15 frames per second
```

## Integration Points

### With Jupyter Notebooks
- Load pose data in analysis notebooks
- Visualize pose estimation results
- Develop and test new analysis approaches

### With Browser Extension
- Complement manual labeling with automated pose data
- Provide ground truth for model training
- Export labeled data for supervised learning

### With Modeling Pipeline
- Pose data serves as input for ML models
- Temporal sequences for LSTM training
- Feature engineering for shot classification

### With Cloud Deployment
- Batch processing for large video datasets
- Integration with cloud storage and compute
- Scalable analysis workflows

---

**Note**: These modules are designed to be used programmatically. They do not include command-line interfaces and should be imported and called from Python scripts or notebooks.