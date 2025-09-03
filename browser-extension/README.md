# YouTube Badminton Shot Labeler Extension

This browser extension lets you label shots/events in any YouTube video and export the results as a CSV file. **New in this version**: Collect and export pose keypoint data for labeled shots.

## How to Use

1. **Download Extensions Folder:**
   - Download `chrome-extension` folder.

2. **Load as Unpacked Extension:**
   - Open `chrome://extensions` in Chrome (or your browser's extensions page).
   - Enable "Developer mode".
   - Click "Load unpacked" and select your folder.

3. **Go to YouTube:**
   - Open any YouTube video.
   - Click the extension icon to show/hide the labeling panel.

4. **Labeling with Pose Data Collection:**
   - Play/pause the video. 
   - **Click "Start Overlay"** to begin pose detection and data collection.
   - Click "Mark Start" at the start of an event, select a shot label, then "Mark End" at the end.
   - **Pose data is automatically collected and associated with each labeled shot.**
   - Repeat for as many shots as you want.
   - Each shot can be deleted (🗑️) from the list.
   - Click "Download CSV" to export shot labels.
   - **Click "Export Pose Data"** to export pose keypoint data for all labeled shots.

5. **Move the Panel:**
   - Drag the panel by its title bar to reposition anywhere in the window.
   - Resize the panel by dragging the edges or corners.

6. **Close/Reopen the Panel:**
   - Click the `×` button to close the panel.
   - Click the extension icon again to bring it back.

## Features

- Show/hide panel with the extension icon.
- Movable and resizable panel.
- **🆕 Pose overlay visualization with TensorFlow.js.**
- **🆕 Automatic pose data collection during overlay active periods.**
- **🆕 Pose data export in JSON, CSV, and parquet-compatible formats.**
- Advanced shot dimensions (position, timing, intention, etc.).
- Displays current date/time, video title, and URL at the top.
- Works on any YouTube video page.
- Lets you label shots/events using customizable buttons.
- Download all labels as a CSV file.
- Load existing CSV files to continue labeling.
- Delete shots if mis-labeled.
- Non-destructive: no changes to the video or your YouTube account.

## 🆕 Pose Data Collection

This extension now includes advanced pose data collection capabilities for machine learning research and analysis:

### What's Collected
- **17 keypoint coordinates** (x, y) for each detected person per frame
- **Confidence scores** for each keypoint 
- **Frame timestamps** synchronized with video playback
- **Bounding boxes** around detected persons
- **Automatic association** with labeled shots

### Data Formats
- **JSON**: Human-readable format with full metadata
- **CSV**: Spreadsheet-compatible format for statistical analysis  
- **Parquet-compatible**: Structured format for ML training pipelines

### Data Structure
The exported pose data follows the ASL signs dataset format:
```json
{
  "metadata": {
    "shot_id": "session_abc123_shot_1693834938",
    "shot_label": "smash",
    "shot_start": 12.34,
    "shot_end": 15.67,
    "total_frames": 98
  },
  "frames": [
    {
      "frame_timestamp": 12.34,
      "poses": [{
        "score": 0.85,
        "nose_x": 320, "nose_y": 240, "nose_score": 0.9,
        "left_eye_x": 315, "left_eye_y": 235, "left_eye_score": 0.88,
        // ... all 17 keypoints with x, y, score
      }]
    }
  ]
}
```

### Usage for Research
- **Badminton technique analysis**: Study body movements during different shot types
- **ML model training**: Train shot detection and classification models
- **Performance analysis**: Compare pose patterns between players
- **Dataset creation**: Build training datasets for sports analytics

## Developer Information

### Architecture Overview

The extension has been refactored for improved maintainability and scalability:

#### Core Modules:

- **`content.js`** - Main entry point, handles pose overlay and panel management
- **`panel.js`** - Panel UI creation and shot labeling workflow
- **`background.js`** - Service worker for extension-level functionality

#### Utility Modules:

- **`constants.js`** - Centralized configuration and magic strings
- **`ui-utils.js`** - UI-related utilities (formatting, sanitization, error handling)
- **`video-utils.js`** - Video element utilities and state management
- **`pose-utils.js`** - TensorFlow.js pose detection utilities
- **`pose-data.js`** - 🆕 Pose data collection, storage, and export functionality
- **`overlay-utils.js`** - Canvas overlay management and positioning
- **`data-validation.js`** - Data validation and integrity checks

#### Feature Modules:

- **`csv.js`** - CSV import/export functionality
- **`glossary.js`** - Shot glossary and dimension controls
- **`poseDrawing.js`** - Pose visualization on canvas
- **`resize.js`** - Panel resizing functionality
- **`drag.js`** - Panel drag and drop

#### Key Improvements:

- **Modular Architecture**: Clear separation of concerns
- **Comprehensive Documentation**: JSDoc comments throughout
- **Type Safety**: Input validation and error handling
- **Maintainable Code**: Consistent naming and structure
- **Scalable Design**: Easy to add new features

### Building and Development

1. **Install Dependencies:**
   ```bash
   cd browser-extension
   npm install
   ```

2. **Build the Extension:**
   ```bash
   npm run build
   ```

3. **Development Workflow:**
   - Source files are in `chrome-extension/src/`
   - Built files go to `chrome-extension/dist/`
   - Edit source files and rebuild to see changes

### File Structure

```
chrome-extension/
├── src/                          # Source code (edit these)
│   ├── content.js               # Main content script
│   ├── panel.js                 # Panel UI management
│   ├── constants.js             # Configuration constants
│   ├── ui-utils.js              # UI utilities
│   ├── video-utils.js           # Video handling utilities
│   ├── pose-utils.js            # Pose detection utilities
│   ├── overlay-utils.js         # Canvas overlay utilities
│   ├── data-validation.js       # Data validation utilities
│   ├── csv.js                   # CSV import/export
│   ├── glossary.js              # Shot glossary management
│   ├── poseDrawing.js           # Pose visualization
│   ├── resize.js                # Panel resizing
│   ├── drag.js                  # Panel dragging
│   └── utils.js                 # Legacy compatibility layer
├── dist/                        # Built files (generated)
│   └── content.js               # Bundled content script
├── manifest.json                # Extension manifest
├── background.js                # Service worker
├── styles.css                   # Extension styles
├── badminton_shots_glossary.json # Shot definitions
└── esbuild.config.js            # Build configuration
```

## Customization

- **Add new labels**: Edit `chrome-extension/badminton_shots_glossary.json` file
- **Modify UI**: Edit CSS in `chrome-extension/styles.css`
- **Add features**: Create new modules in `src/` directory
- **Configure settings**: Update constants in `src/constants.js`

After making changes, rebuild the extension using `npm run build`.

## Dependencies

- **TensorFlow.js**: For pose detection and overlay visualization
- **esbuild**: For building and bundling the extension
- **Chrome Extensions API**: For browser integration

---

**Enjoy!**

## Credits

The badminton shots glossary [badminton_shots_glossary.json](chrome-extension/badminton_shots_glossary.json) in this repository is adapted and modified from [WorldBadminton.com Glossary](https://www.worldbadminton.com/glossary.htm). 

Special thanks to GitHub Copilot for guidance and assistance during the refactoring process.

Developed by Jin-HoMLee. 