# Browser Extension Architecture Overview

Visual overview of the browser extension architecture, components, and data flow.

-> back to [README](README.md)

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Chrome Browser                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │                  Extension Components                      │     │
│  ├────────────────────────────────────────────────────────────┤     │
│  │                                                            │     │
│  │  ┌────────────────┐              ┌──────────────────────┐  │     │
│  │  │   Background   │◄────────────►│   Chrome Extension   │  │     │
│  │  │  Service Worker│              │        APIs          │  │     │
│  │  │                │              │  • downloads         │  │     │
│  │  │ • Icon clicks  │              │  • storage           │  │     │
│  │  │ • CSV download │              │  • tabs              │  │     │
│  │  │ • Messaging    │              │  • runtime           │  │     │
│  │  └───────┬────────┘              └──────────────────────┘  │     │
│  │          │                                                 │     │
│  │          │ message("toggle-panel")                         │     │
│  │          │ message("download-csv")                         │     │
│  │          ▼                                                 │     │
│  │  ┌────────────────────────────────────────────────────┐    │     │
│  │  │           Content Script (content.js)              │    │     │
│  │  ├────────────────────────────────────────────────────┤    │     │
│  │  │                                                    │    │     │
│  │  │  ┌─────────────────┐    ┌──────────────────────┐   │    │     │
│  │  │  │  Pose Overlay   │    │     Panel UI         │   │    │     │
│  │  │  │                 │    │                      │   │    │     │
│  │  │  │ ┌─────────────┐ │    │ ┌──────────────────┐ │   │    │     │
│  │  │  │ │ TensorFlow  │ │    │ │  Panel Header    │ │   │    │     │
│  │  │  │ │  Detector   │ │    │ │  • Title         │ │   │    │     │
│  │  │  │ └─────────────┘ │    │ │  • Theme toggle  │ │   │    │     │
│  │  │  │ ┌─────────────┐ │    │ │  • Close button  │ │   │    │     │
│  │  │  │ │   Canvas    │ │    │ └──────────────────┘ │   │    │     │
│  │  │  │ │   Overlay   │ │    │                      │   │    │     │
│  │  │  │ └─────────────┘ │    │ ┌──────────────────┐ │   │    │     │
│  │  │  │ ┌─────────────┐ │    │ │  Video Info      │ │   │    │     │
│  │  │  │ │   Pose      │ │    │ │  • Date/time     │ │   │    │     │
│  │  │  │ │  Drawing    │ │    │ │  • Title         │ │   │    │     │
│  │  │  │ └─────────────┘ │    │ │  • URL           │ │   │    │     │
│  │  │  └─────────────────┘    │ └──────────────────┘ │   │    │     │
│  │  │                         │                      │   │    │     │
│  │  │                         │ ┌──────────────────┐ │   │    │     │
│  │  │                         │ │  Workflow        │ │   │    │     │
│  │  │                         │ │  • Mark Start    │ │   │    │     │
│  │  │                         │ │  • Mark End      │ │   │    │     │
│  │  │                         │ │  • Status        │ │   │    │     │
│  │  │                         │ └──────────────────┘ │   │    │     │
│  │  │                         │                      │   │    │     │
│  │  │                         │ ┌──────────────────┐ │   │    │     │
│  │  │                         │ │  Glossary        │ │   │    │     │
│  │  │                         │ │  • Shot buttons  │ │   │    │     │
│  │  │                         │ │  • Dimensions    │ │   │    │     │
│  │  │                         │ └──────────────────┘ │   │    │     │
│  │  │                         │                      │   │    │     │
│  │  │                         │ ┌──────────────────┐ │   │    │     │
│  │  │                         │ │  Shot List       │ │   │    │     │
│  │  │                         │ │  • Labeled shots │ │   │    │     │
│  │  │                         │ │  • Edit/delete   │ │   │    │     │
│  │  │                         │ └──────────────────┘ │   │    │     │
│  │  │                         │                      │   │    │     │
│  │  │                         │ ┌──────────────────┐ │   │    │     │
│  │  │                         │ │  CSV Controls    │ │   │    │     │
│  │  │                         │ │  • Import        │ │   │    │     │
│  │  │                         │ │  • Export        │ │   │    │     │
│  │  │                         │ └──────────────────┘ │   │    │     │
│  │  │                         │                      │   │    │     │
│  │  │                         │ ┌──────────────────┐ │   │    │     │
│  │  │                         │ │  Drag/Resize     │ │   │    │     │
│  │  │                         │ │  • 8 handles     │ │   │    │     │
│  │  │                         │ │  • Draggable     │ │   │    │     │
│  │  │                         │ └──────────────────┘ │   │    │     │
│  │  │                         └──────────────────────┘   │    │     │
│  │  └────────────────────────────────────────────────────┘    │     │
│  │                               │                            │     │
│  └───────────────────────────────┼────────────────────────────┘     │
│                                  │                                  │
│                                  ▼                                  │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │                    YouTube Video Page                      │     │
│  ├────────────────────────────────────────────────────────────┤     │
│  │                                                            │     │
│  │  ┌────────────────┐     ┌────────────────┐                 │     │
│  │  │  Video Player  │     │  Pose Overlay  │                 │     │
│  │  │                │     │     Canvas     │                 │     │
│  │  │  (YouTube)     │     │  (Extension)   │                 │     │
│  │  └────────────────┘     └────────────────┘                 │     │
│  │                                                            │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Module Dependency Graph

```
content.js (Entry Point)
│
├─── togglePanel() ──► panel.js
│                      │
│                      └─── panel-coordinator.js
│                           ├─── panel-templates.js
│                           │    └─── createPanelHTML()
│                           │
│                           ├─── panel-factory.js
│                           │    ├─── createPanelElement()
│                           │    └─── stylePanelElement()
│                           │
│                           ├─── panel-events.js
│                           │    ├─── setupKeyboardShortcuts()
│                           │    ├─── setupCloseButton()
│                           │    └─── setupOverlayButton()
│                           │
│                           ├─── panel-workflow.js
│                           │    ├─── createWorkflowState()
│                           │    ├─── setupShotMarkingButtons()
│                           │    ├─── createShotListUpdater()
│                           │    └─── createStatusUpdater()
│                           │
│                           ├─── glossary.js
│                           │    ├─── glossary-loader.js
│                           │    │    └─── loadGlossaryData()
│                           │    │
│                           │    ├─── glossary-buttons.js
│                           │    │    ├─── setupShotButtons()
│                           │    │    └─── createShotButton()
│                           │    │
│                           │    ├─── glossary-dimensions.js
│                           │    │    ├─── setupDimensionControls()
│                           │    │    ├─── createDimensionSection()
│                           │    │    └─── createDimensionButton()
│                           │    │
│                           │    └─── utils/glossary/glossary-utils.js
│                           │
│                           ├─── csv.js
│                           │    ├─── features/csv-import.js
│                           │    │    ├─── setupCSVImport()
│                           │    │    └─── parseCSVContent()
│                           │    │
│                           │    ├─── features/csv-export.js
│                           │    │    ├─── setupCSVExport()
│                           │    │    ├─── generateCSVContent()
│                           │    │    └─── downloadCSV()
│                           │    │
│                           │    └─── utils/data/csv-utils.js
│                           │         ├─── parseCSVRow()
│                           │         ├─── escapeCSVField()
│                           │         ├─── mapCSVColumns()
│                           │         └─── extractShotFromRow()
│                           │
│                           ├─── features/drag.js
│                           │    └─── addDragBehavior()
│                           │
│                           ├─── features/resize.js
│                           │    └─── addResizeHandles()
│                           │
│                           ├─── utils/theme-manager.js
│                           │    ├─── initializeTheme()
│                           │    ├─── toggleTheme()
│                           │    ├─── getCurrentTheme()
│                           │    ├─── setCurrentTheme()
│                           │    └─── applyTheme()
│                           │
│                           └─── utils/ui/ui-utils.js
│                                ├─── formatTime()
│                                ├─── formatDateTime()
│                                ├─── sanitize()
│                                ├─── getVideoTitle()
│                                ├─── showSuccess()
│                                ├─── showError()
│                                └─── showWarning()
│
├─── startPoseOverlay() ──► utils/pose/pose-utils.js
│                           ├─── setupDetector()
│                           ├─── estimatePoses()
│                           └─── cleanupTensorFlow()
│
├─── poseOverlayLoop() ───► features/poseDrawing.js
│                           ├─── drawKeypoints()
│                           ├─── drawSkeletonAndBoxes()
│                           ├─── drawSkeleton()
│                           └─── drawBoundingBox()
│
├─── createOverlayCanvas() ─► utils/canvas/overlay-utils.js
│                             ├─── createOverlayCanvas()
│                             ├─── removeOverlayCanvas()
│                             └─── positionOverlayCanvas()
│
├─── getVideo() ───────────► utils/video/video-utils.js
│                             ├─── getVideo()
│                             └─── getVideoURL()
│
└─── constants.js
     ├─── UI_IDS
     ├─── CSS_CLASSES
     ├─── VIDEO_SELECTORS
     ├─── PANEL_CONFIG
     ├─── POSE_CONFIG
     ├─── EVENTS
     ├─── DEFAULT_SHOT
     ├─── CSV_HEADERS
     ├─── EXTENSION_CONFIG
     ├─── KEYBOARD_SHORTCUTS
     └─── UI_CONFIG


background.js (Service Worker - Independent)
│
├─── chrome.action.onClicked
│    └─── sendMessage("toggle-panel")
│
└─── chrome.runtime.onMessage
     └─── handleCSVDownload()
          └─── chrome.downloads.download()
```

---

## Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                         User Actions                             │
└────────────┬────────────────────────────────┬────────────────────┘
             │                                │
             │ Click extension icon           │ Interact with panel
             │                                │
             ▼                                ▼
┌─────────────────────┐          ┌──────────────────────────────┐
│  Background Worker  │          │      Content Script          │
│                     │          │                              │
│ • Receive click     │          │ • Mark shot start/end        │
│ • Send message      │◄─────────┤ • Select shot type           │
│ • Handle downloads  │  CSV     │ • Add dimensions             │
└─────────────────────┘  Download│ • Pose detection             │
                                 │ • Theme toggle               │
                                 └───────┬──────────────────────┘
                                         │
                     ┌───────────────────┼───────────────────┐
                     │                   │                   │
                     ▼                   ▼                   ▼
         ┌────────────────┐  ┌───────────────────┐  ┌────────────────┐
         │  Video Element │  │  Panel UI State   │  │ Canvas Overlay │
         │                │  │                   │  │                │
         │ • currentTime  │  │ • shots[]         │  │ • poses[]      │
         │ • dimensions   │  │ • currentShot{}   │  │ • keypoints    │
         │ • playback     │  │ • theme           │  │ • skeleton     │
         └────────────────┘  └──────┬────────────┘  └────────────────┘
                                    │
                                    │ Export
                                    ▼
                         ┌───────────────────┐
                         │    CSV File       │
                         │                   │
                         │ video_url         │
                         │ shot_id           │
                         │ start_sec         │
                         │ end_sec           │
                         │ label             │
                         │ dimensions...     │
                         └───────────────────┘
                                    │
                                    │ Import
                                    ▼
                         ┌───────────────────┐
                         │  Shots Array      │
                         │  (Panel State)    │
                         └───────────────────┘
```

---

## Component Interaction Flow

### 1. Extension Initialization

```
Extension Load
    │
    ├─► Background Worker starts
    │   └─► Listen for icon clicks
    │
    └─► Content Script injected (YouTube page)
        │
        ├─► Initialize theme
        │   ├─► Load saved theme from storage
        │   └─► Apply CSS theme
        │
        ├─► Detect video element
        │   └─► Attach MutationObserver
        │
        └─► Wait for user interaction
```

### 2. Panel Toggle Flow

```
User clicks icon
    │
    ▼
Background Worker
    │
    ├─► chrome.action.onClicked
    │
    └─► sendMessage("toggle-panel")
        │
        ▼
Content Script
    │
    ├─► Receive message
    │
    └─► togglePanel()
        │
        ├─► Panel exists?
        │   ├─► Yes: Remove panel
        │   └─► No: Create panel
        │       │
        │       ├─► createPanel()
        │       │   ├─► Generate HTML (panel-templates)
        │       │   ├─► Create DOM element (panel-factory)
        │       │   ├─► Setup event handlers (panel-events)
        │       │   ├─► Initialize workflow (panel-workflow)
        │       │   ├─► Load glossary (glossary-loader)
        │       │   ├─► Setup CSV (csv-import/export)
        │       │   ├─► Enable drag (drag.js)
        │       │   ├─► Enable resize (resize.js)
        │       │   └─► Apply theme (theme-manager)
        │       │
        │       └─► Insert into DOM
```

### 3. Shot Labeling Flow

```
User labels a shot
    │
    ├─► Mark Start
    │   ├─► Get video.currentTime
    │   ├─► Set currentShot.start
    │   └─► Update status display
    │
    ├─► Select Shot Type
    │   ├─► Click shot button
    │   ├─► Set currentShot.label
    │   ├─► Update button state
    │   └─► Update status display
    │
    ├─► Select Dimensions (optional)
    │   ├─► Click dimension buttons
    │   ├─► Set currentShot.dimensions
    │   └─► Update button states
    │
    ├─► Mark End
    │   ├─► Get video.currentTime
    │   ├─► Set currentShot.end
    │   ├─► Validate shot
    │   │   ├─► Check duration < 5 min
    │   │   └─── Check label exists
    │   ├─► Add to shots array
    │   ├─► Reset currentShot
    │   ├─► Update shot list display
    │   └─► Show success message
    │
    └─► Export CSV
        ├─► Generate CSV content
        │   ├─► Format headers
        │   ├─► Format each shot row
        │   └─► Escape CSV fields
        ├─► Create Blob
        ├─► Send to background
        └─► chrome.downloads.download()
```

### 4. Pose Overlay Flow

```
User clicks "Start Pose Overlay"
    │
    ▼
startPoseOverlay()
    │
    ├─► Initialize TensorFlow.js
    │   ├─► Setup WebGL backend
    │   └─► Load MoveNet model
    │
    ├─► Create canvas overlay
    │   ├─► Position over video
    │   └─► Match video dimensions
    │
    ├─► Attach video listeners
    │   ├─► play/pause events
    │   ├─► resize events
    │   └─► navigation events
    │
    └─► Start pose loop
        │
        ▼
    poseOverlayLoop()
        │
        ├─► Estimate poses from video
        │   ├─► detector.estimatePoses(video)
        │   └─► Get keypoints and boxes
        │
        ├─► Clear canvas
        │
        ├─► Draw poses
        │   ├─► drawKeypoints()
        │   └─► drawSkeletonAndBoxes()
        │
        └─► requestAnimationFrame(loop)
            │
            └─► (repeats until stopped)

User clicks "Stop Pose Overlay"
    │
    ▼
stopPoseOverlay()
    │
    ├─► Cancel animation frame
    ├─► Remove canvas
    ├─► Cleanup TensorFlow.js
    └─► Detach video listeners
```

### 5. CSV Import Flow

```
User clicks "Load CSV"
    │
    ▼
Trigger file picker
    │
    ▼
User selects CSV file
    │
    ▼
FileReader.readAsText()
    │
    ▼
parseCSVContent()
    │
    ├─► Split into lines
    │
    ├─► Parse header row
    │   └─► Map column names to indices
    │
    ├─► Parse data rows
    │   ├─► Split by comma (respect quotes)
    │   ├─► Extract shot fields
    │   └─► Validate format
    │
    ├─► Validate imported shots
    │   ├─► Check required fields
    │   └─► Check timestamps
    │
    ├─► Replace shots array
    │
    ├─► Update shot list display
    │
    └─► Show success message
```

---

## State Management

### Panel State

```javascript
{
  // Workflow state
  shots: [                    // Array of completed shots
    {
      start: Number,
      end: Number,
      label: String,
      dimensions: Object
    }
  ],
  currentShot: {              // Shot being labeled
    start: null,
    end: null,
    label: null,
    dimensions: {}
  },
  
  // UI state
  panelVisible: Boolean,
  panelPosition: {x, y},
  panelSize: {width, height},
  
  // Feature state
  theme: 'light' | 'dark',
  poseOverlayActive: Boolean,
  
  // Video state
  videoElement: HTMLVideoElement,
  videoURL: String,
  videoTitle: String
}
```

### Pose Detection State

```javascript
{
  detector: Object,           // TensorFlow.js detector instance
  poseLoopId: Number,        // RequestAnimationFrame ID
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  modeObserver: MutationObserver
}
```

---

## Event Flow

```
Keyboard Events
    │
    ├─► 'S' key ────► Mark Start
    ├─► 'E' key ────► Mark End
    ├─► 'O' key ────► Toggle Overlay
    └─► 'Esc' key ──► Close Panel

Mouse Events
    │
    ├─► Click header ──────► Start drag
    ├─► Click resize handle ► Start resize
    ├─► Click shot button ──► Select shot
    ├─► Click dimension btn ► Select dimension
    ├─► Click delete ───────► Remove shot
    └─► Click close ────────► Close panel

Video Events
    │
    ├─► play/pause ──► Update overlay
    ├─► resize ──────► Reposition canvas
    └─► navigation ──► Handle video change

Chrome Extension Events
    │
    ├─► action.onClicked ──► Toggle panel
    └─► runtime.onMessage ──► Handle CSV download

Storage Events
    │
    └─► Theme change ──► Save to chrome.storage.local

File Events
    │
    ├─► CSV file selected ──► Import shots
    └─── CSV export click ──► Generate and download
```

---

## Technology Stack Visualization

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser Extension                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                 Presentation Layer                   │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  • CSS Custom Properties (theming)                   │   │
│  │  • Vanilla HTML/CSS (no framework)                   │   │
│  │  • Material Design inspired                          │   │
│  └──────────────────────────────────────────────────────┘   │
│                          │                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                   Logic Layer                        │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  • ES6 JavaScript modules                            │   │
│  │  • Event-driven architecture                         │   │
│  │  • Factory and callback patterns                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                          │                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Machine Learning Layer                  │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  • TensorFlow.js (tfjs-core v4.22.0)                 │   │
│  │  • WebGL Backend (tfjs-backend-webgl)                │   │
│  │  • MoveNet Pose Detection (pose-detection v2.1.3)    │   │
│  └──────────────────────────────────────────────────────┘   │
│                          │                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Platform Integration                    │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  • Chrome Extension APIs (Manifest V3)               │   │
│  │  • YouTube DOM Integration                           │   │
│  │  • HTML5 Video API                                   │   │
│  │  • Canvas API                                        │   │
│  │  • FileReader API                                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Development Stack:
    │
    ├─► esbuild v0.25.5 (bundler)
    ├─► Jest v30.1.3 (testing)
    ├─► Babel (ES module transform)
    └─► jsdom (test environment)
```

---

## Migration Architecture Mapping

### From: shuttle-insights (Current)

```
Vanilla JS + CSS
    │
    ├─► ES6 Modules
    ├─► No framework
    ├─► Pure CSS with custom properties
    ├─► esbuild bundler
    └─► Jest testing
```

### To: shuttle-vision (Target)

```
TypeScript + Modern Framework
    │
    ├─► TypeScript (type safety)
    ├─► React/Vue/Svelte (component framework)
    ├─► Tailwind/CSS Modules (styling)
    ├─► Webpack/Vite (bundler)
    └─► Testing framework + type tests
```

### Mapping Strategy

```
Current Module           →  Target Component
─────────────────────────────────────────────────
panel-coordinator.js     →  PanelContainer.tsx
panel-templates.js       →  Component templates
panel-workflow.js        →  WorkflowManager.tsx
glossary-buttons.js      →  GlossaryButtons.tsx
glossary-dimensions.js   →  DimensionControls.tsx
csv-import.js           →  CSVImport.tsx
csv-export.js           →  CSVExport.tsx
drag.js                 →  useDraggable hook
resize.js               →  useResizable hook
poseDrawing.js          →  PoseOverlay.tsx
theme-manager.js        →  useTheme hook
utils/*                 →  utils/* (TypeScript)
```

---

## Performance Considerations

```
Bundle Size Breakdown:
    │
    ├─► TensorFlow.js Core      ~1.5MB (58%)
    ├─► TensorFlow.js WebGL     Included
    ├─► Pose Detection Model    ~700KB (27%)
    ├─► Extension Code          ~50KB (2%)
    └─► Assets (JSON, CSS)      ~50KB (2%)
    ────────────────────────────────────
    Total: ~2.2MB

Optimization Opportunities:
    │
    ├─► Lazy load TensorFlow.js (only when overlay enabled)
    ├─► Code splitting by feature
    ├─► Tree shaking unused TensorFlow.js modules
    └─► Minify production build

Runtime Performance:
    │
    ├─► Pose detection: ~30 FPS
    ├─► GPU acceleration via WebGL
    ├─► Canvas rendering: 60 FPS (capped by requestAnimationFrame)
    └─► Memory cleanup on stop
```

---

This architecture overview complements the detailed audit in [CODEBASE_AUDIT.md](./CODEBASE_AUDIT.md) and provides visual representations of the system structure, data flow, and component interactions.
