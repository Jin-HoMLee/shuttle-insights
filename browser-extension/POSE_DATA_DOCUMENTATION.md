# Pose Data Collection and Export - Feature Documentation

## Overview

The browser extension now includes comprehensive pose data collection and export functionality that integrates seamlessly with the existing shot labeling workflow.

## Features

### 🤖 Pose Data Collection
- **Automatic Collection**: Pose keypoint data is automatically collected when the pose overlay is active
- **Frame-by-Frame Capture**: Captures pose data for each video frame during overlay sessions
- **Multi-Pose Support**: Supports up to 6 simultaneous poses per frame (configurable)
- **Confidence Filtering**: Only collects keypoints above the confidence threshold (0.2 by default)

### 📊 Data Association
- **Shot Integration**: Pose data is automatically associated with labeled shots when saved
- **Temporal Matching**: Data within shot time boundaries is linked to the corresponding shot
- **Player Management**: Supports player ID assignment for multi-player scenarios

### 💾 Export Functionality
- **Batch Export**: Export pose data for all labeled shots at once
- **Individual Export**: Export data for specific shots if needed
- **Manifest Generation**: Creates JSON manifest with metadata for all exports
- **Proper Folder Structure**: Follows the specified `train_keypoint_files/[player_id]/[sequence_id].csv` format

## Data Format Specification

The exported data follows the ASL Signs competition format:

| Column | Description | Type | Range |
|--------|-------------|------|-------|
| `frame` | Frame number in the raw video | integer | 0+ |
| `row_id` | Unique identifier for each row | integer | 0+ |
| `type` | Keypoint name (e.g., "nose", "left shoulder") | string | - |
| `keypoint_index` | MoveNet keypoint index | integer | 0-16 |
| `x` | Normalized X coordinate | float | 0.0-1.0 |
| `y` | Normalized Y coordinate | float | 0.0-1.0 |
| `z` | Z coordinate (typically 0 for MoveNet) | float | 0.0 |

### MoveNet Keypoint Mapping

The 17 keypoints follow the MoveNet model structure:

```
0: nose           9: left wrist     
1: left eye       10: right wrist    
2: right eye      11: left hip       
3: left ear       12: right hip      
4: right ear      13: left knee      
5: left shoulder  14: right knee     
6: right shoulder 15: left ankle     
7: left elbow     16: right ankle    
8: right elbow    
```

## User Workflow

### 1. Start Data Collection
- Click "Start Pose Overlay" button in the panel
- Pose detection begins and keypoint data collection starts automatically
- Status indicator shows "Overlay online" and data collection statistics

### 2. Label Shots
- Use existing shot labeling workflow:
  - Click "Mark Start" at shot beginning
  - Select shot type and dimensions
  - Click "Mark End & Save" at shot conclusion
- Pose data is automatically associated with each saved shot

### 3. Export Data
- Click "Export Pose Data" button in the new pose data section
- All shots with associated pose data are exported as individual CSV files
- A manifest JSON file is also generated with metadata
- Files follow the naming convention: `[player_id]/[sequence_id].csv`

## Technical Implementation

### Core Modules

1. **`pose-data-collector.js`** - Main collection logic
   - Manages collection state and data storage
   - Handles pose data processing and normalization
   - Associates data with shots based on timestamps

2. **`pose-data-export.js`** - Export functionality
   - Converts pose data to CSV format
   - Manages file downloads and naming
   - Creates manifest files with metadata

3. **Integration in `content.js`** - Data collection triggers
   - Starts/stops collection with overlay state
   - Calls collection function in pose estimation loop

4. **Integration in `panel.js`** - UI and user interaction
   - New pose data export section
   - Real-time status updates
   - Export button and feedback

### File Structure

Exported files are organized as follows:

```
Downloads/
├── labeled_shots.csv                    # Regular shot labels
├── pose_data_manifest_[video].json      # Export metadata
└── train_keypoint_files/                # Pose data folder
    └── 1/                               # Player ID folder
        ├── 1.csv                        # Shot 1 pose data
        ├── 2.csv                        # Shot 2 pose data
        └── ...
```

## Configuration

### Constants (in `constants.js`)

```javascript
export const POSE_DATA_CONFIG = {
  KEYPOINT_NAMES: [...], // 17 keypoint names
  EXPORT_FORMAT: 'parquet', // Target format (CSV for now)
  FOLDER_STRUCTURE: 'train_keypoint_files'
};
```

### Pose Detection Settings

```javascript
export const POSE_CONFIG = {
  CONFIDENCE_THRESHOLD: 0.2, // Minimum keypoint confidence
  MAX_POSES: 6,              // Maximum poses per frame
  OVERLAY_Z_INDEX: 10000     // Canvas z-index
};
```

## Benefits for Researchers and Coaches

1. **Comprehensive Datasets**: Collect detailed pose data alongside shot annotations
2. **Analysis Ready**: Data is in a format suitable for machine learning and analysis
3. **Temporal Alignment**: Pose data is perfectly synchronized with shot labels
4. **High Quality**: Only confident keypoints are included, ensuring data quality
5. **Batch Processing**: Export data for multiple shots simultaneously
6. **Metadata Rich**: Manifest files provide context and statistics for each export

## Future Enhancements

- **Parquet Format**: Direct parquet export for better compression and compatibility
- **Data Validation**: Enhanced validation and error checking
- **Custom Player IDs**: UI for setting player identifiers
- **Export Filtering**: Options to filter exports by shot type or time range
- **Real-time Preview**: Live preview of collected pose data during overlay sessions

## Troubleshooting

### No Pose Data Collected
- Ensure pose overlay is started before labeling shots
- Check that video contains detectable human poses
- Verify keypoints meet confidence threshold

### Export Issues
- Confirm shots have associated pose data (check status indicator)
- Ensure browser allows file downloads
- Check for sufficient storage space

### Data Quality Issues
- Adjust confidence threshold if needed
- Ensure good video quality and lighting
- Verify pose detection is working properly in overlay