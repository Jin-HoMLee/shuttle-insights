import { createLabelerPanel } from './panel.js'; 
import { getVideo, disconnectOverlayObserver, removeOverlayCanvas, createOverlayCanvas, drawKeypoints, setupDetector } from './utils.js'; 

const PANEL_ID = 'yt-shot-labeler-panel';
let detector = null;
let poseLoopId = null;

// Pose overlay loop
async function poseOverlayLoop(video, detector, overlay) {
  if (video.videoWidth === 0 || video.videoHeight === 0 || video.paused || video.ended) {
    poseLoopId = requestAnimationFrame(() => poseOverlayLoop(video, detector, overlay));
    return;
  }
  const poses = await detector.estimatePoses(video, { maxPoses: 6 });
  drawKeypoints(overlay, poses);
  poseLoopId = requestAnimationFrame(() => poseOverlayLoop(video, detector, overlay));
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
    cancelAnimationFrame(poseLoopId);
    poseLoopId = null;
  }
  const canvas = document.getElementById('pose-overlay-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

// Listen for start/stop overlay events from panel button
window.addEventListener('pose-overlay-control', (e) => {
  if (e.detail.action === 'start') startPoseOverlay();
  else if (e.detail.action === 'stop') stopPoseOverlay();
});

// Panel toggle logic
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'toggle-panel') {
    const panel = document.getElementById(PANEL_ID);
    if (panel) panel.remove();
    else createLabelerPanel();
  }
});