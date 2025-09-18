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

The extension has been modularized for improved maintainability and scalability:

#### Core Modules:

- **`content.js`** - Main entry point, handles pose overlay and panel management
- **`background.js`** - Service worker for extension-level functionality

#### UI Components (`components/`):

- **`panel-core.js`** - Core panel lifecycle and feature coordination
- **`panel-ui.js`** - Panel DOM creation and styling utilities
- **`glossary-buttons.js`** - Shot type button creation and management
- **`dimension-controls.js`** - Advanced shot annotation controls
- **`poseDrawing.js`** - Pose visualization rendering on canvas

#### Feature Modules (`features/`):

- **`shot-marking.js`** - Shot start/end timing functionality
- **`keyboard-shortcuts.js`** - Keyboard shortcuts handling
- **`csv-import.js`** - CSV import functionality
- **`csv-export.js`** - CSV export functionality
- **`drag.js`** - Panel drag behavior
- **`resize.js`** - Panel resize behavior

#### Utility Modules (`utils/`):

- **`ui-utils.js`** - UI-related utilities (formatting, sanitization, error handling)
- **`video-utils.js`** - Video element utilities and state management
- **`pose-utils.js`** - TensorFlow.js pose detection utilities
- **`overlay-utils.js`** - Canvas overlay management and positioning
- **`data-validation.js`** - Data validation and integrity checks
- **`config-utils.js`** - Configuration utilities and validation
- **`csv-parser.js`** - CSV parsing and generation utilities

#### Data Loading Modules (`loaders/`):

- **`glossary-loader.js`** - Glossary data loading, caching, and validation

#### Legacy Compatibility:

- **`panel.js`** - Re-exports from modular panel components
- **`csv.js`** - Re-exports from modular CSV features
- **`glossary.js`** - Re-exports from modular glossary components
- **`constants.js`** - Centralized configuration and constants

#### Key Improvements:

- **Modular Architecture**: Clear separation of concerns with focused, single-responsibility modules
- **Organized Structure**: Logical grouping by components, features, utilities, and data
- **Reduced Complexity**: Main files reduced from 1,269 lines to 105 lines (93% reduction)
- **Enhanced Maintainability**: Easier navigation, debugging, and feature development
- **Backward Compatibility**: Existing imports continue to work through legacy files
- **Comprehensive Documentation**: JSDoc comments throughout all modules
- **Scalable Design**: Easy to add new features without affecting existing code

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
│   ├── constants.js             # Configuration constants
│   ├── panel.js                 # Panel management (legacy compatibility)
│   ├── csv.js                   # CSV functionality (legacy compatibility)
│   ├── glossary.js              # Glossary management (legacy compatibility)
│   ├── components/              # UI Components
│   │   ├── panel-core.js        # Core panel lifecycle management
│   │   ├── panel-ui.js          # Panel UI creation and styling
│   │   ├── glossary-buttons.js  # Shot type button components
│   │   ├── dimension-controls.js # Shot dimension controls
│   │   └── poseDrawing.js       # Pose visualization rendering
│   ├── features/                # Feature Modules
│   │   ├── shot-marking.js      # Shot timing and marking functionality
│   │   ├── keyboard-shortcuts.js # Keyboard shortcuts handling
│   │   ├── csv-import.js        # CSV import functionality
│   │   ├── csv-export.js        # CSV export functionality
│   │   ├── drag.js              # Panel drag behavior
│   │   └── resize.js            # Panel resize behavior
│   ├── utils/                   # Utility Modules
│   │   ├── ui-utils.js          # UI-related utilities
│   │   ├── video-utils.js       # Video handling utilities
│   │   ├── pose-utils.js        # Pose detection utilities
│   │   ├── overlay-utils.js     # Canvas overlay utilities
│   │   ├── data-validation.js   # Data validation utilities
│   │   ├── config-utils.js      # Configuration utilities
│   │   └── csv-parser.js        # CSV parsing utilities
│   └── data/                    # Data Management
│       └── glossary-loader.js   # Glossary data loading and caching
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