import { togglePanel } from './panel.js';
import { getVideo, disconnectOverlayObserver, removeOverlayCanvas, createOverlayCanvas, drawKeypoints, setupDetector } from './utils.js'; 

let detector = null; // Pose detector instance (needed for pose estimation)
let poseLoopId = null; // ID of the pose overlay loop (needed for canceling)

// Pose overlay loop
async function poseOverlayLoop(video, detector, overlay) {
  const poses = await detector.estimatePoses(video, { maxPoses: 6 });
  drawKeypoints(overlay, poses);
  poseLoopId = window.requestAnimationFrame(() => poseOverlayLoop(video, detector, overlay));
}

// Start overlay
async function startPoseOverlay() {
  const video = getVideo();
  if (!video || video.videoWidth === 0) {
    alert('No video element found or video not loaded.');
    return;
  }
  if (!detector) detector = await setupDetector();
  const overlay = createOverlayCanvas(video);
  poseOverlayLoop(video, detector, overlay);
}

// Stop overlay
function stopPoseOverlay() {
  if (poseLoopId) {
    window.cancelAnimationFrame(poseLoopId);
    poseLoopId = null;
  }
  removeOverlayCanvas();
}

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