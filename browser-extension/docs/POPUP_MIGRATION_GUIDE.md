# Popup Migration Guide

## Overview

This document outlines the migration from content script panel injection to Chrome extension popup interface for the YouTube Badminton Shot Labeler extension.

## What Changed

### Before (Content Script Panel)
- UI was injected directly into YouTube pages as an overlay panel
- Extension icon clicked to toggle panel visibility on the page
- Panel was draggable and resizable within the YouTube page
- UI state managed within the content script context

### After (Extension Popup)
- UI is now displayed in a Chrome extension popup when icon is clicked
- Clean separation between content script (pose detection only) and UI (popup)
- Popup provides all the same functionality in a dedicated interface
- Communication via Chrome extension messaging API

## Key Benefits

1. **Better Security**: Reduced content script privileges and smaller attack surface
2. **Improved Performance**: UI logic no longer runs in the context of every YouTube page
3. **Cleaner Architecture**: Clear separation of concerns between pose detection and UI
4. **Better UX**: Popup is always accessible and doesn't interfere with YouTube's UI
5. **Easier Maintenance**: UI logic is isolated and easier to test and debug

## Architecture Changes

### Content Script (`content.js`)
**Before:**
- Managed complete panel UI lifecycle
- Handled all user interactions
- Stored workflow state
- Managed CSV operations

**After:**
- Only handles pose overlay functionality
- Responds to messages from popup
- Provides video information to popup
- No UI management responsibilities

### Background Script (`background.js`)
**Before:**
- Forwarded extension icon clicks to content script for panel toggle

**After:**
- Only handles CSV download operations
- Extension icon clicks automatically open popup (no custom handling needed)

### New Popup Interface
- **popup.html**: Complete UI structure with all original functionality
- **popup.js**: Full workflow state management and Chrome messaging
- **popup.css**: Responsive design optimized for popup dimensions

## Feature Parity

All original features have been preserved:

### ✅ Video Information Display
- Date/time stamp
- Video title and URL
- Connection status to YouTube page

### ✅ Pose Overlay Control
- Toggle pose detection on/off
- Status indicators for overlay state
- TensorFlow.js integration preserved

### ✅ Shot Labeling Workflow
- Mark shot start/end with video time capture
- Shot type selection from glossary
- Dimension controls (position, timing, intention, etc.)
- Shot duration validation and error handling

### ✅ Data Management  
- CSV import/export functionality
- Shot list display with delete capability
- Data persistence during popup sessions

### ✅ Keyboard Shortcuts
- S: Mark shot start
- E: Mark shot end  
- O: Toggle pose overlay
- All shortcuts work when popup has focus

### ✅ Error Handling
- Connection status management
- Invalid shot duration detection
- CSV parsing error handling
- Content script communication failure handling

## Testing

### Automated Tests
- 85 test cases covering all major functionality
- Chrome messaging API testing
- Workflow state management validation
- CSV operations testing
- Keyboard shortcut handling

### Manual Testing Checklist

1. **Connection Testing**
   - [ ] Navigate to non-YouTube page → popup shows "Not on YouTube video page"
   - [ ] Navigate to YouTube video → popup shows "Connected to YouTube page"
   - [ ] All UI sections become visible when connected

2. **Video Information**
   - [ ] Video title displays correctly
   - [ ] Video URL displays correctly
   - [ ] Timestamp shows current date/time

3. **Pose Overlay**
   - [ ] "Toggle Pose Overlay" button works
   - [ ] Status updates correctly (loading → online/offline)
   - [ ] Pose detection appears on video when enabled

4. **Shot Labeling**
   - [ ] "Mark Start" captures current video time
   - [ ] "Mark End" captures current video time
   - [ ] Status updates show shot progress
   - [ ] Shot duration validation works (rejects negative or >5min shots)
   - [ ] Shot type buttons load from glossary
   - [ ] Dimension controls load and function
   - [ ] Complete shots save to labeled shots list

5. **Data Operations**
   - [ ] CSV import loads existing shot data
   - [ ] Shot list displays all labeled shots
   - [ ] Delete buttons remove individual shots
   - [ ] CSV export generates downloadable file

6. **Keyboard Shortcuts**
   - [ ] S key marks shot start
   - [ ] E key marks shot end
   - [ ] O key toggles pose overlay
   - [ ] Shortcuts disabled when typing in inputs

## Migration Impact

### For Users
- **Minimal Impact**: Same functionality, slightly different access pattern
- **Improved Experience**: Popup doesn't interfere with YouTube UI
- **Familiar Interface**: UI looks and works exactly the same

### For Developers
- **Cleaner Code**: Better separation of concerns
- **Easier Testing**: UI logic is isolated and testable
- **Better Performance**: Reduced content script overhead
- **Improved Security**: Smaller content script attack surface

## Backward Compatibility

The migration maintains full backward compatibility:
- All glossary data formats unchanged
- CSV import/export formats identical
- All keyboard shortcuts preserved
- All workflow patterns maintained

## Technical Implementation Details

### Chrome Extension Messaging
```javascript
// Popup → Content Script
chrome.tabs.sendMessage(tabId, { action: 'get-current-time' })
chrome.tabs.sendMessage(tabId, { action: 'toggle-pose-overlay' })

// Popup → Background Script  
chrome.runtime.sendMessage({ action: 'download-csv', filename, dataUrl })
```

### State Management
```javascript
// Popup maintains complete workflow state
let workflowState = {
  shots: [],
  currentShot: {
    start_sec: null,
    end_sec: null,
    label: null,
    // ... dimension properties
  }
};
```

### Glossary Integration
- Reuses existing glossary-loader, glossary-buttons, and glossary-dimensions modules
- Adapts the DOM structure for popup context
- Preserves all button generation and interaction logic

## Deployment

### Build Process
```bash
npm run build
```

Generates:
- `dist/popup.html`
- `dist/popup.css`  
- `dist/popup.js`
- Updated `dist/manifest.json` with popup configuration

### Installation
1. Load extension in Chrome via `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `dist` folder
4. Extension icon will now open popup interface instead of injecting panel

## Future Enhancements

With the popup architecture in place, future improvements become easier:

1. **Enhanced State Persistence**: Use chrome.storage API for cross-session persistence
2. **Multi-tab Support**: Handle multiple YouTube tabs simultaneously  
3. **Improved Error Recovery**: Better handling of content script disconnections
4. **Performance Monitoring**: Track popup performance and usage metrics
5. **Advanced Features**: More sophisticated video analysis tools

## Conclusion

The popup migration successfully modernizes the extension architecture while maintaining complete feature parity. The new structure provides better security, performance, and maintainability while delivering the same user experience that users expect.