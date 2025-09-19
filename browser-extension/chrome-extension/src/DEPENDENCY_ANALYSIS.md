# File Dependency Analysis

## Import/Export Relationships

### Core Entry Point
```
content.js (199 lines)
├── imports: panel.js, video-utils.js, overlay-utils.js, pose-utils.js, poseDrawing.js, constants.js
└── responsibilities: Main entry, pose overlay control, panel toggle
```

### Central UI Hub (SPLIT CANDIDATE)
```
panel.js (548 lines) ⚠️ LARGEST FILE
├── imports: ui-utils.js, video-utils.js, resize.js, drag.js, csv.js, glossary.js, constants.js
├── exports: createLabelerPanel(), togglePanel()
└── responsibilities: Panel creation, workflow, events, integration
    ├── DOM creation (212 lines in createPanelElement)
    ├── Event handling & keyboard shortcuts
    ├── Shot workflow management
    └── Module integration
```

### Feature Modules

#### CSV Operations
```
csv.js (321 lines)
├── imports: constants.js, ui-utils.js
├── exports: setupCSV()
└── responsibilities: Import/export, parsing, validation
```

#### Shot Type Management
```
glossary.js (400 lines) ⚠️ SECOND LARGEST
├── imports: constants.js, ui-utils.js
├── exports: setupGlossaryButtons()
└── responsibilities: Shot buttons, dimension controls, JSON loading
    ├── Data loading from JSON
    ├── Shot type UI generation
    └── Dimension controls (collapsible)
```

#### Validation Layer
```
data-validation.js (284 lines)
├── imports: constants.js
├── exports: validateShot(), validateShotsArray(), sanitizeShot(), etc.
└── responsibilities: All validation logic
```

### UI Utilities
```
ui-utils.js (236 lines)
├── imports: constants.js
├── exports: formatDateTime(), sanitize(), showError(), showSuccess(), etc.
└── responsibilities: Formatting, messages, DOM utilities
```

### Pose Detection Pipeline
```
pose-utils.js (168 lines)
├── imports: @tensorflow-models/pose-detection, @tensorflow/tfjs-core, constants.js
├── exports: setupDetector(), estimatePoses(), etc.
└── responsibilities: TensorFlow.js integration
```

```
poseDrawing.js (147 lines)
├── imports: constants.js
├── exports: drawKeypoints(), drawSkeletonAndBoxes()
└── responsibilities: Canvas drawing operations
```

### Video Integration
```
video-utils.js (154 lines)
├── imports: constants.js
├── exports: getVideo(), getVideoDimensions(), etc.
└── responsibilities: YouTube video element interaction
```

```
overlay-utils.js (211 lines)
├── imports: constants.js, video-utils.js, ui-utils.js
├── exports: createOverlayCanvas(), updateCanvasPosition(), etc.
└── responsibilities: Canvas overlay management
```

### Panel Behavior
```
resize.js (182 lines)
├── imports: constants.js, config-utils.js
├── exports: addResizeHandles()
└── responsibilities: 8-direction panel resizing
```

```
drag.js (113 lines)
├── imports: constants.js
├── exports: addDragBehavior()
└── responsibilities: Panel drag functionality
```

### Configuration
```
constants.js (132 lines)
├── imports: none
├── exports: UI_IDS, CSS_CLASSES, PANEL_CONFIG, etc.
└── responsibilities: All configuration constants
```

```
config-utils.js (40 lines)
├── imports: none
├── exports: assertConfigFunctions(), logConfigTypesAndValues()
└── responsibilities: Configuration validation
```

## Dependency Flow Analysis

### High Fan-out (Many Dependencies)
1. **panel.js** → 7 imports (high coupling)
2. **content.js** → 6 imports (reasonable for entry point)

### High Fan-in (Many Dependents)
1. **constants.js** → Used by 12 files (appropriate for config)
2. **ui-utils.js** → Used by 6 files (utility pattern)

### Isolated Modules (Good Design)
- **config-utils.js** → Only used by resize.js
- **poseDrawing.js** → Only used by content.js
- **data-validation.js** → Self-contained validation

## Architecture Patterns Observed

### 1. **Central Hub Pattern** (panel.js)
- ✅ **Pro:** Single entry point for panel functionality
- ❌ **Con:** Becomes bloated with responsibilities
- **Recommendation:** Split into focused modules

### 2. **Utility Module Pattern** (ui-utils.js, video-utils.js)
- ✅ **Pro:** Reusable functions across components
- ✅ **Pro:** Clear naming conventions
- **Status:** Well-implemented

### 3. **Feature Module Pattern** (csv.js, glossary.js, resize.js, drag.js)
- ✅ **Pro:** Self-contained functionality
- ✅ **Pro:** Clear integration points
- **Status:** Excellent implementation

### 4. **Configuration Centralization** (constants.js)
- ✅ **Pro:** Single source of truth for config
- ✅ **Pro:** Easy to maintain and update
- **Status:** Well-designed

## Recommendations by Dependency Analysis

### 1. **Reduce panel.js Coupling**
Current: panel.js imports 7 different modules
Target: Split into 3-4 focused files, each importing 2-3 modules

### 2. **Extract Common Patterns**
- HTML template extraction from panel.js
- Error handling patterns from multiple files
- Event handling abstractions

### 3. **Consider Dependency Injection**
For complex integrations like panel.js ↔ glossary.js ↔ csv.js:
```javascript
// Instead of direct imports, use dependency injection
export function createPanel(dependencies) {
  const { csvHandler, glossaryHandler, uiUtils } = dependencies;
  // ...
}
```

### 4. **Monitor Growth Areas**
Files likely to grow and need future splitting:
1. glossary.js (if adding shot types)
2. ui-utils.js (if adding UI patterns)
3. data-validation.js (if adding validation rules)