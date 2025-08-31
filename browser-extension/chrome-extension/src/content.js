import { togglePanel } from './panel.js';
import { getVideo, disconnectOverlayObserver, removeOverlayCanvas, createOverlayCanvas, setupDetector } from './utils.js'; 
import { drawKeypoints, drawSkeletonAndBoxes} from './poseDrawing.js'; 

let detector = null; // Pose detector instance (needed for pose estimation)
let poseLoopId = null; // ID of the pose overlay loop (needed for checking and canceling)

// Pose overlay loop
async function poseOverlayLoop(video, detector, overlay, ctx) {
  try {
    // Validate video and overlay
    if (!video || video.videoWidth === 0 || video.videoHeight === 0 || video.paused || video.ended) {
      return; // Stop loop if video is not ready
    }
    const poses = await detector.estimatePoses(video, { maxPoses: 6 });
    drawKeypoints(ctx, poses);
    drawSkeletonAndBoxes(ctx, poses);
  } catch (err) {
    console.error('Pose estimation failed:', err);
    return; // Stop loop on error
  }
  // Request next animation frame
  poseLoopId = window.requestAnimationFrame(() => poseOverlayLoop(video, detector, overlay, ctx));
}

// Start overlay
async function startPoseOverlay() {
  // Check if video is ready
  const video = getVideo();
  if (!video || video.videoWidth === 0) {
    alert('No video element found or video not loaded.');
    return;
  }
  // Attach event listeners to handle video changes
  attachVideoListeners(video);
  if (!detector) detector = await setupDetector();
  const overlay = createOverlayCanvas(video);
  const ctx = overlay.getContext('2d');
  poseOverlayLoop(video, detector, overlay, ctx);
}

// Stop overlay
function stopPoseOverlay() {
  if (poseLoopId) {
    window.cancelAnimationFrame(poseLoopId);
    poseLoopId = null;
  }
  removeOverlayCanvas();
}

// Handle video change events (quality, modes)
export function handleVideoChange() {
  // Only restart overlay if it is currently active
  if (poseLoopId !== null) {
    stopPoseOverlay();
    startPoseOverlay(); // This will use the updated video element
  }
}

// Attach event listeners to the current video element
function attachVideoListeners(video) {
  if (video) {
    video.addEventListener('loadeddata', handleVideoChange);
    video.addEventListener('resize', handleVideoChange);
  }
}

// Main control flow

// Listen for start/stop overlay events from panel button
window.addEventListener('pose-overlay-control', (e) => {
  if (e.detail.action === 'start') startPoseOverlay();
  else if (e.detail.action === 'stop') stopPoseOverlay();
});

// Panel toggle logic
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'toggle-panel') {
    togglePanel();
  }
});