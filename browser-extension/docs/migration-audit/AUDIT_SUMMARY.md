# Browser Extension Audit Summary

Quick reference summary of the browser-extension codebase audit. For full details, see [CODEBASE_AUDIT.md](./CODEBASE_AUDIT.md).

-> back to [README](README.md)

---

## Quick Stats

| Metric | Value |
|--------|-------|
| **Total Lines** | ~4,600 lines |
| **Source Files** | 32 files (27 JS, 1 CSS, 1 manifest, 3 data) |
| **Test Suites** | 9 suites, 83 tests (83 passing) |
| **Build Output** | ~2.2MB bundled content script |
| **Production Dependencies** | 3 (TensorFlow.js ecosystem) |
| **Dev Dependencies** | 4 (build/test tools) |
| **Build Time** | <1 second |

---

## Core Features at a Glance

| Feature | Description | Key Modules |
|---------|-------------|-------------|
| **Shot Labeling** | Mark start/end timestamps, select shot types, add dimensions | `panel-workflow.js`, `glossary-buttons.js` |
| **Pose Overlay** | Real-time pose detection on video using TensorFlow.js | `content.js`, `poseDrawing.js`, `pose-utils.js` |
| **CSV Export** | Save labeled shots to CSV with metadata | `csv-export.js`, `csv-utils.js` |
| **CSV Import** | Load existing CSV files to continue labeling | `csv-import.js`, `csv-utils.js` |
| **Drag/Resize** | Flexible panel positioning and sizing | `drag.js`, `resize.js` |
| **Theme System** | Dark/light mode with persistence | `theme-manager.js` |
| **Glossary** | 11 shot types + 5 dimensional categories | `glossary-*.js`, `badminton_shots_glossary.json` |
| **Keyboard Shortcuts** | S=start, E=end, O=overlay, Esc=close | `panel-events.js` |
| **Video Info** | Display video title, URL, timestamp | `panel-templates.js`, `ui-utils.js` |
| **Extension Icon** | Toggle panel visibility from browser toolbar | `background.js`, `content.js` |

---

## Technology Stack

### Production Dependencies

| Package | Version | Purpose | Bundle Impact |
|---------|---------|---------|---------------|
| `@tensorflow/tfjs-core` | 4.22.0 | Core TensorFlow.js library | ~1.5MB |
| `@tensorflow/tfjs-backend-webgl` | 4.22.0 | WebGL GPU acceleration | Included |
| `@tensorflow-models/pose-detection` | 2.1.3 | MoveNet pose detection model | ~700KB |

### Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `esbuild` | 0.25.5 | Fast bundler |
| `jest` | 30.1.3 | Testing framework |
| `jest-environment-jsdom` | 30.1.2 | DOM simulation |
| `babel-jest` | 30.1.2 | ES module transform |

---

## File Structure Overview

```
browser-extension/
├── src/                  # Source code (32 files)
│   ├── content.js        # Entry point
│   ├── background.js     # Service worker
│   ├── panel-*.js        # Panel UI (6 files)
│   ├── glossary-*.js     # Glossary system (4 files)
│   ├── csv.js            # CSV coordination
│   ├── features/         # Features (5 modules)
│   ├── utils/            # Utilities (8 categories)
│   └── assets/           # Static data
├── test/                 # Tests (9 suites)
├── dist/                 # Build output
├── docs/                 # Documentation (6 files)
└── [config files]        # Build/test config
```

---

## Module Categories

### Core Modules (3 files)
- `content.js` - Main entry point, pose overlay orchestration
- `background.js` - Service worker, icon clicks, downloads
- `constants.js` - Centralized configuration (137 lines)

### Panel Modules (6 files)
- `panel-coordinator.js` - Panel lifecycle orchestration
- `panel-templates.js` - HTML template strings
- `panel-factory.js` - DOM creation and styling
- `panel-events.js` - Event handlers and shortcuts
- `panel-workflow.js` - Shot marking workflow
- `panel.js` - Compatibility layer

### Glossary Modules (4 files + 1 data)
- `glossary-loader.js` - JSON data loading
- `glossary-buttons.js` - Shot type buttons
- `glossary-dimensions.js` - Dimension controls
- `glossary.js` - Compatibility layer
- `assets/badminton_shots_glossary.json` - Shot definitions

### Feature Modules (5 files)
- `features/csv-import.js` - Import CSV files
- `features/csv-export.js` - Export to CSV
- `features/drag.js` - Panel dragging
- `features/resize.js` - Panel resizing
- `features/poseDrawing.js` - Pose visualization

### Utility Modules (12 files in 7 categories)
- `utils/ui/ui-utils.js` - UI helpers, toasts, formatting
- `utils/ui/svg-icons.js` - SVG icon definitions
- `utils/video/video-utils.js` - YouTube video interaction
- `utils/canvas/overlay-utils.js` - Canvas lifecycle
- `utils/pose/pose-utils.js` - TensorFlow.js utilities
- `utils/data/csv-utils.js` - CSV parsing/formatting
- `utils/data/data-validation.js` - Data validation
- `utils/config/config-utils.js` - Config validation
- `utils/glossary/glossary-utils.js` - Glossary helpers
- `utils/theme-manager.js` - Theme system logic

---

## Key Data Structures

### Shot Object
```javascript
{
  start: Number,              // Start time (seconds)
  end: Number,                // End time (seconds)
  label: String,              // Shot type
  longitudinalPosition: String, // front|middle|rear
  lateralPosition: String,    // left|middle|right
  timing: String,             // early|normal|late
  intention: String,          // attack|neutral|defensive
  impact: String,             // full|flat|slice
  direction: String           // straight|cross|body
}
```

### CSV Format
```csv
video_url,shot_id,start_sec,end_sec,label,longitudinal_position,lateral_position,timing,intention,impact,direction
```

---

## Architectural Patterns

| Pattern | Usage | Example |
|---------|-------|---------|
| **Module** | Encapsulation | `glossary-buttons.js` |
| **Factory** | Object creation | `createWorkflowState()` |
| **Callback** | Parent-child state | `getCurrentShot()` pattern |
| **Observer** | DOM monitoring | MutationObserver for video |
| **Singleton** | Single instance | Pose detector |
| **Strategy** | Different algorithms | Pose drawing methods |
| **Facade** | Simple interface | `setupCSV()`, `togglePanel()` |
| **Dependency Injection** | Testability | All setup functions |
| **Event Delegation** | Efficient events | Glossary buttons |
| **Lazy Loading** | On-demand loading | Glossary cache |

---

## Testing Infrastructure

### Test Suites (9 suites, 83 tests)

| Suite | Tests | Purpose |
|-------|-------|---------|
| `csv-utils.test.js` | 12 | CSV parsing/formatting |
| `theme-manager.test.js` | 8 | Theme system |
| `glossary.test.js` | 10 | Glossary loading/UI |
| `resize.test.js` | 7 | Panel resizing |
| `csv-import-export.test.js` | 9 | CSV features |
| `panel-coordinator.test.js` | 11 | Panel orchestration |
| `theme-integration.test.js` | 6 | Theme integration |
| `compatibility.test.js` | 15 | Backward compatibility |
| `integration.test.js` | 5 | End-to-end (requires build artifacts) |

**Test Framework:** Jest v30.1.3 with jsdom  
**Coverage:** Major modules have unit tests  
**Note:** Integration tests require `npm run build` to generate `dist/content.js` before running

---

## Build System

**Build Tool:** esbuild v0.25.5  
**Entry:** `src/content.js`  
**Output:** `dist/content.js` (~2.2MB)

**Build Configuration:**
- Bundle all dependencies
- IIFE format (content script compatible)
- Source maps enabled
- Target Chrome 110+
- Copy static files (manifest, background, CSS, assets)

**Build Command:** `npm run build`  
**Build Time:** <1 second

---

## Migration Priority Matrix

### Priority 1: Essential Core (Must Have)
- ✅ Shot labeling workflow
- ✅ Glossary system
- ✅ CSV import/export
- ✅ Draggable/resizable panel
- ✅ Pose overlay visualization

### Priority 2: Important Features (Should Have)
- ✅ Theme system
- ✅ Keyboard shortcuts
- ✅ Data validation
- ✅ User feedback
- ✅ Video information display

### Priority 3: Enhancements (Nice to Have)
- ✅ Animations and transitions
- ✅ Error handling
- ✅ Configuration management

---

## Chrome Extension Specifics

**Manifest Version:** 3

**Permissions:**
- `downloads` - Save CSV files
- `scripting` - Inject content script
- `storage` - Save theme preference
- `activeTab` - Access active tab

**Host Permissions:**
- `https://www.youtube.com/*`

**Content Script:** Injected on YouTube pages at `document_idle`

**Service Worker:** Background script for icon clicks and downloads

**Web Accessible Resources:** Glossary JSON file

---

## Known Limitations

1. **YouTube only** - No other video platforms
2. **Single video** - Cannot label multiple simultaneously
3. **No cloud sync** - Labels stored locally
4. **No collaboration** - Single-user only
5. **No undo/redo** - Limited edit history
6. **No video upload** - YouTube videos only

---

## Recommended Migration Path

### Phase 1: Utilities
Port foundational utilities first (video, CSV, validation, UI, theme)

### Phase 2: Features
Port self-contained features (pose, CSV import/export, drag/resize)

### Phase 3: Components
Port UI components (panel, glossary, shot list, workflow)

### Phase 4: Integration
Orchestrate modules, handle events, manage state

### Phase 5: Testing
Port tests, add framework-specific tests, E2E testing

---

## Documentation Files

| File | Purpose |
|------|---------|
| `CODEBASE_AUDIT.md` | Complete codebase audit (this summary) |
| `AUDIT_SUMMARY.md` | Quick reference summary |
| `UI_AUDIT.md` | UI components inventory |
| `RESTRUCTURING_SUMMARY.md` | Folder restructure details |
| `SPLITTING_DOCUMENTATION.md` | Module splitting rationale |
| `THEME_IMPLEMENTATION.md` | Theme system guide |
| `UI_COMPONENT_DIAGRAM.md` | Visual component structure |

---

## Strengths for Migration

✅ **Modular architecture** - Clear module boundaries  
✅ **Comprehensive docs** - Well-documented codebase  
✅ **Test coverage** - 83/83 tests passing  
✅ **Modern practices** - ES6 modules, CSS custom properties  
✅ **Clean dependencies** - Minimal external dependencies  
✅ **Compatibility layers** - Support gradual migration  
✅ **Organized structure** - Standard extension layout

---

## Key Contacts & Resources

- **Repository:** Jin-HoMLee/shuttle-insights
- **Extension Path:** `/browser-extension`
- **Target Repository:** Jin-HoMLee/shuttle-vision (migration target)
- **Issue:** #140 (Audit), Parent Issue: #6 (Migration)

---

**For complete details, architecture diagrams, code examples, and migration recommendations, see [CODEBASE_AUDIT.md](./CODEBASE_AUDIT.md).**
