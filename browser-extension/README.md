# YouTube Badminton Shot Labeler Extension

This browser extension lets you label shots/events in any YouTube video and export the results as a CSV file.

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

4. **Labeling:**
   - Play/pause the video. 
   - Click "Mark Start" at the start of an event, select a shot label, then "Mark End" at the end.
   - Repeat for as many shots as you want.
   - Each shot can be deleted (🗑️) from the list.
   - Click "Download CSV" to export the labels (button is below the shot list).

5. **Move the Panel:**
   - Drag the panel by its title bar to reposition anywhere in the window.
   - Resize the panel by dragging the edges or corners.

6. **Close/Reopen the Panel:**
   - Click the `×` button to close the panel.
   - Click the extension icon again to bring it back.

## Features

- Show/hide panel with the extension icon.
- Movable and resizable panel.
- Pose overlay visualization with TensorFlow.js.
- Advanced shot dimensions (position, timing, intention, etc.).
- Displays current date/time, video title, and URL at the top.
- Works on any YouTube video page.
- Lets you label shots/events using customizable buttons.
- Download all labels as a CSV file.
- Load existing CSV files to continue labeling.
- Delete shots if mis-labeled.
- Non-destructive: no changes to the video or your YouTube account.

## Developer Information

### Architecture Overview

The extension has been refactored for improved maintainability and scalability:

#### Core Modules:

- **`content.js`** - Main entry point, handles pose overlay and panel management
- **`panel.js`** - Panel UI creation and shot labeling workflow
- **`background.js`** - Service worker for extension-level functionality

#### Utility Modules (in `src/utils/`):

- **`constants.js`** - Centralized configuration and magic strings
- **`utils/ui/ui-utils.js`** - UI-related utilities (formatting, sanitization, error handling)
- **`utils/video/video-utils.js`** - Video element utilities and state management
- **`utils/pose/pose-utils.js`** - TensorFlow.js pose detection utilities
- **`utils/canvas/overlay-utils.js`** - Canvas overlay management and positioning
- **`utils/data/data-validation.js`** - Data validation and integrity checks
- **`utils/data/csv-utils.js`** - CSV parsing and formatting utilities
- **`utils/config/config-utils.js`** - Configuration validation and debugging
- **`utils/glossary/glossary-utils.js`** - Glossary dimension mapping helpers

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
│   ├── utils/                   # Organized utility modules
│   │   ├── ui/                  # UI-related utilities
│   │   │   └── ui-utils.js      # Formatting, sanitization, error handling
│   │   ├── video/               # Video handling utilities
│   │   │   └── video-utils.js   # YouTube video element interaction
│   │   ├── pose/                # Pose detection utilities
│   │   │   └── pose-utils.js    # TensorFlow.js pose detection
│   │   ├── canvas/              # Canvas/overlay utilities
│   │   │   └── overlay-utils.js # Canvas overlay management
│   │   ├── data/                # Data processing utilities
│   │   │   ├── csv-utils.js     # CSV parsing and formatting
│   │   │   └── data-validation.js # Data validation and integrity
│   │   ├── config/              # Configuration utilities
│   │   │   └── config-utils.js  # Config validation and debugging
│   │   └── glossary/            # Glossary utilities
│   │       └── glossary-utils.js # Dimension mapping helpers
│   ├── csv.js                   # CSV import/export coordination
│   ├── glossary.js              # Shot glossary management
│   ├── poseDrawing.js           # Pose visualization
│   ├── resize.js                # Panel resizing
│   └── drag.js                  # Panel dragging
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