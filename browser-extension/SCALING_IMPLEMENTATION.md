# Dynamic Pose Overlay Scaling

This document explains how the pose overlay dynamically scales with video quality changes in the YouTube Badminton Shot Labeler extension.

## Problem Solved

Previously, when users changed video quality on YouTube (e.g., from 720p to 1080p), the pose overlay would become misaligned because:

1. YouTube updates the video's intrinsic dimensions (`video.videoWidth` and `video.videoHeight`)
2. The overlay canvas dimensions were only updated via ResizeObserver (DOM element resize)
3. Video quality changes don't trigger DOM resize events
4. Result: Pose coordinates were drawn on incorrectly sized canvas

## Solution

The extension now monitors video intrinsic dimensions and updates the overlay canvas accordingly:

### Key Components

1. **`updateCanvasDimensions(canvas, video)`**
   - Updates canvas dimensions to match video's actual resolution
   - Ensures pose coordinates are drawn at correct scale

2. **`checkAndUpdateCanvasScale(canvas, video)`**
   - Detects when video dimensions change
   - Updates canvas dimensions when changes are detected
   - Returns `true` if dimensions changed, `false` otherwise

3. **Enhanced pose overlay loop**
   - Checks for dimension changes each animation frame
   - Clears canvas when dimensions change to prevent artifacts
   - Maintains smooth pose visualization during quality transitions

### Example Scenarios

| Scenario | Video Dimensions | Canvas Behavior |
|----------|------------------|-----------------|
| Initial 720p | 1280×720 | Canvas sized to 1280×720 |
| Switch to 1080p | 1920×1080 | Canvas resized to 1920×1080, cleared |
| Switch to 480p | 854×480 | Canvas resized to 854×480, cleared |
| No quality change | 1920×1080 | No canvas updates (performance) |

## Implementation Details

### Tracking Dimension Changes

```javascript
// Store last known dimensions on canvas
canvas._lastVideoWidth = video.videoWidth;
canvas._lastVideoHeight = video.videoHeight;

// Check for changes
if (canvas._lastVideoWidth !== currentWidth || 
    canvas._lastVideoHeight !== currentHeight) {
    // Update canvas and tracking variables
}
```

### Performance Considerations

- Change detection happens during the animation loop (no additional polling)
- Canvas is only updated when dimensions actually change
- Efficient comparison prevents unnecessary updates
- Canvas clearing only happens when needed

## Testing

The implementation includes comprehensive tests for:

- Initial canvas setup with various video resolutions
- Quality change detection (720p → 1080p → 480p → 4K)
- No-change scenarios (performance verification)
- Edge cases (zero dimensions, missing elements)

All tests pass, ensuring reliable behavior across different video quality scenarios.

## Impact

- ✅ Pose overlays remain accurately aligned during quality changes
- ✅ Seamless user experience when switching video quality
- ✅ No performance degradation
- ✅ No visual artifacts during transitions
- ✅ Works with all YouTube video quality settings