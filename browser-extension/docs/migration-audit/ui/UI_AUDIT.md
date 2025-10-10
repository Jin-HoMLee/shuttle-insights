# Browser Extension UI Audit

## Overview
This document provides a comprehensive audit of the YouTube Badminton Shot Labeler browser extension UI, listing all components, pages, and design systems used.

-> back to [README](../README.md)

## UI Architecture

### Design System
**Type**: Custom CSS Design System (inspired by Material Design principles, but no Material Design components used)
- **CSS Variables**: Modern CSS custom properties for consistent theming
- **Color Palette**: Inspired by Material Design, implemented with custom CSS (no Material Design components)
- **Typography**: System fonts (Segoe UI, Tahoma, Geneva, Verdana, sans-serif)
- **Component Library**: Custom-built components with no external UI framework dependencies or Material Design components

### Design Tokens (CSS Custom Properties)
Located in `src/styles.css`:
```css
:root {
  --primary-color: #1976d2;
  --primary-dark: #1565c0;
  --primary-light: #42a5f5;
  --secondary-color: #757575;
  --accent-color: #ff5722;
  --success-color: #4caf50;
  --warning-color: #ff9800;
  --error-color: #f44336;
  --background-color: #ffffff;
  --surface-color: #fafafa;
  --text-primary: #212121;
  --text-secondary: #757575;
  --border-color: #e0e0e0;
  --shadow-light: 0 2px 4px rgba(0,0,0,0.12);
  --shadow-medium: 0 4px 8px rgba(0,0,0,0.16);
  --shadow-heavy: 0 8px 16px rgba(0,0,0,0.24);
  --border-radius: 8px;
  --border-radius-small: 4px;
  --transition-fast: 0.15s ease;
  --transition-medium: 0.25s ease;
}
```

### Theme System (NEW in v2.1)
**Implementation**: Complete dark/light theme system with toggle button
- **Theme Toggle**: Located in panel header with 🌙/☀️ icons
- **Persistence**: Uses Chrome storage API to remember user preference
- **CSS Architecture**: Dark theme overrides using `[data-theme="dark"]` selector
- **Accessibility**: High contrast ratios for both themes (WCAG AA compliant)
- **Components**: All UI elements automatically adapt to theme changes
- **Module**: `src/utils/theme-manager.js` handles theme logic

## Pages and UI Structure

### Single Page Application
The extension provides **one main UI page**: the **Labeling Panel**

#### Main Panel (`src/panel-coordinator.js`, `src/panel-templates.js`)
- **Purpose**: Primary interface for video shot labeling
- **State**: Draggable, resizable modal panel overlay
- **Position**: Fixed positioning on YouTube video pages
- **Dimensions**: Default 360px width, scalable with constraints

## UI Components Inventory

### 1. Panel Container Components

#### Main Panel (`#yt-shot-labeler-panel`)
- **Module**: `src/panel-factory.js`
- **Styling**: Custom CSS with backdrop blur effect
- **Features**: 
  - Draggable via header
  - 8-direction resizable (corners + edges)
  - Smooth animations and transitions
  - Responsive design for mobile screens

#### Panel Header (`#yt-shot-labeler-header`)
- **Module**: `src/panel-templates.js`
- **Styling**: Gradient background (`linear-gradient(135deg, #1976d2, #42a5f5)`)
- **Components**:
  - Extension icon (🏸)
  - Title text
  - Theme toggle button (`#yt-shot-labeler-theme-toggle`) 🌙/☀️ *(NEW in v2.1)*
  - Close button (×)

#### Panel Content (`#yt-shot-labeler-content`)
- **Module**: `src/panel-templates.js`
- **Styling**: Scrollable content area
- **Layout**: Flex column with sections

### 2. Information Display Components

#### Video Details Section
- **Module**: `src/panel-templates.js`
- **Components**:
  - Timestamp display (`#yt-shot-labeler-datetime`)
  - Video title display (`#yt-shot-labeler-videotitle`)
  - Video URL display (`#yt-shot-labeler-url`)
- **Styling**: Info text with secondary color

#### Pose Overlay Section
- **Module**: `src/panel-templates.js`
- **Components**:
  - Toggle button for pose detection
  - Status indicator (`#overlay-status`)
- **Purpose**: Control TensorFlow.js pose detection overlay

### 3. Data Management Components

#### Load Data Section
- **Module**: `src/panel-templates.js`, `src/features/csv-import.js`
- **Components**:
  - "Load Existing CSV" button (`#load-csv`)
  - Hidden file input (`#csv-file-input`)
- **Purpose**: Import previously saved shot labels

#### Export Section
- **Module**: `src/panel-templates.js`, `src/features/csv-export.js`
- **Components**:
  - "Download CSV" button (`#save-labels`)
- **Styling**: Success variant button (green)
- **Purpose**: Export labeled shots to CSV file

### 4. Shot Labeling Workflow Components

#### Label Shot Section
- **Module**: `src/panel-templates.js`
- **Components**:
  - "Mark Start" button (`#mark-start`)
  - "Mark End" button (`#mark-end`)
  - Shot status display (`#shot-status`)
- **Purpose**: Define time boundaries for shots

#### Shot Type Selection (`#label-buttons`)
- **Module**: `src/glossary-buttons.js`
- **Data Source**: `src/assets/badminton_shots_glossary.json`
- **Components**:
  - Category section container (`.yt-shot-labeler-category-section`)
  - Shot type buttons (`.yt-shot-labeler-label-btn`)
- **Available Shot Types**:
  - Serve, Clear, Drop, Smash, Half Smash
  - Lift, Net Shot, (Net) Kill, Push
  - Drive, Block
- **Styling**: Custom buttons with hover effects and selection states

#### Advanced Dimensions (`#dimension-controls`)
- **Module**: `src/glossary-dimensions.js`
- **UI Pattern**: Collapsible section with expandable content
- **Components**:
  - Collapsible header with expand/collapse icon (▼/▲)
  - Dimension control groups
  - Value selection buttons
- **Available Dimensions**:
  1. **Longitudinal Position**: front, middle, rear
  2. **Lateral Position**: left, middle, right  
  3. **Timing**: early, normal, late
  4. **Intention**: attacking, neutral, defending
  5. **Impact Quality**: perfect, good, poor
  6. **Shot Direction**: cross-court, straight, down-the-line

#### Labeled Shots List (`#label-list`)
- **Module**: `src/panel-workflow.js`
- **Components**:
  - Shot item containers (individual labeled shots)
  - Delete buttons (`.yt-shot-labeler-delete`)
- **Features**:
  - Scrollable list (max-height: 120px)
  - Hover effects on items
  - Individual shot removal

### 5. Interactive Controls

#### Button Variants
1. **Primary Buttons** (`.yt-shot-labeler-btn-primary`)
   - Mark Start/End buttons
   - Primary actions

2. **Success Buttons** (`.yt-shot-labeler-btn-success`)
   - Download CSV button
   - Confirmation actions

3. **Danger Buttons** (`.yt-shot-labeler-btn-danger`)
   - Delete buttons
   - Destructive actions

4. **Label Buttons** (`.yt-shot-labeler-label-btn`)
   - Shot type selection
   - Dimension value selection

#### Resize Handles (`.yt-shot-labeler-resize-handle`)
- **Module**: `src/features/resize.js`
- **Count**: 8 handles (4 corners + 4 edges)
- **Cursors**: Directional resize cursors (ns-resize, ew-resize, etc.)
- **Constraints**: Min/max size limits with viewport bounds checking

### 6. Feedback and Status Components

#### Tooltip System (`.yt-shot-labeler-tooltip`)
- **Module**: `src/utils/ui/ui-utils.js`
- **Implementation**: CSS-based tooltips with data attributes
- **Features**: Hover activation, positioning, fade transitions

#### Message Components
- **Success Messages** (`.yt-shot-labeler-message-success`)
- **Error Messages** (`.yt-shot-labeler-message-error`)  
- **Warning Messages** (`.yt-shot-labeler-message-warning`)
- **Features**: Auto-dismiss timers, slide-in animations

#### Loading States
- **Button Loading** - Spinner replacement for button content
- **Loading Spinner** (`.yt-shot-labeler-spinner`) - Animated circular indicator

### 7. Background Extension Components

#### Service Worker (`src/background.js`)
- **Purpose**: Handle extension icon clicks and CSV downloads
- **UI Interaction**: No direct UI, coordinates with content script

#### Content Script (`src/content.js`)
- **Purpose**: Pose overlay management and panel integration
- **UI Components**: 
  - TensorFlow.js pose detection canvas overlay
  - Video event handling

## Component Dependencies

### Core Dependencies
- **No External UI Frameworks**: Pure vanilla JavaScript + CSS
- **TensorFlow.js**: For pose detection (not UI framework)
- **Chrome Extension APIs**: For file downloads and messaging

### Internal Module Structure
```
src/
├── panel-coordinator.js     # Main panel orchestration
├── panel-templates.js       # HTML template strings  
├── panel-factory.js         # DOM creation and styling
├── panel-events.js          # Event handlers and shortcuts
├── panel-workflow.js        # Shot marking workflow logic
├── glossary-buttons.js      # Shot type button creation
├── glossary-dimensions.js   # Dimension control creation
├── features/
│   ├── resize.js           # Panel resizing functionality
│   ├── drag.js             # Panel dragging functionality
│   ├── csv-import.js       # CSV file import handling
│   └── csv-export.js       # CSV file export handling
└── utils/
    └── ui/
        └── ui-utils.js     # UI utility functions
```

## Design System Analysis

### Strengths
1. **Consistent Design Language**: Unified color palette and spacing
2. **Modern CSS Practices**: CSS custom properties, flexbox layouts
3. **Accessibility**: ARIA labels, semantic HTML, keyboard navigation
4. **Responsive Design**: Mobile-friendly with media queries
5. **Performance**: No external CSS framework dependencies
6. **Maintainability**: Modular CSS with clear naming conventions

### Component Patterns
1. **Section Pattern**: Consistent section headers with decorative elements
2. **Button System**: Standardized button variants with state management
3. **Interactive Feedback**: Hover effects, transitions, and loading states
4. **Form Controls**: Consistent input styling and validation

### Accessibility Features
- ARIA labels on interactive elements
- Semantic HTML structure
- Keyboard navigation support
- High contrast color ratios
- Tooltip descriptions for complex controls

## Recommendations

### Future Improvements
1. **Design System Documentation**: Create a component style guide
2. ~~**Theme Support**: Add dark/light mode toggle~~ ✅ **IMPLEMENTED** (v2.1)
3. **Internationalization**: Support for multi-language UI
4. **Enhanced Mobile Experience**: Better touch targets and gestures
5. **Animation Library**: Consistent micro-interactions across components

### Technical Considerations
- Consider migrating to a CSS-in-JS solution for better component encapsulation
- Implement CSS modules to prevent style conflicts with YouTube's styles
- Add automated visual regression testing for UI components
- Consider adding a design token build system for better maintainability

## Summary

The YouTube Badminton Shot Labeler extension uses a **custom-built design system** with no external UI framework dependencies. The UI consists of a single, feature-rich panel with multiple functional sections, implemented using modern CSS practices and vanilla JavaScript. The design follows Material Design principles but implements them entirely through custom CSS, providing a cohesive and professional user interface while maintaining minimal bundle size and maximum performance.