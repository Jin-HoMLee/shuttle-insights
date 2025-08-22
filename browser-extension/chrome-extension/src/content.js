window.addEventListener('DOMContentLoaded', init);
document.addEventListener('yt-navigate-finish', init); // For YouTube navigation (if available)
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import { createLabelerPanel } from './panel.js';

console.log('[Shot Labeler] content.js injected');

const PANEL_ID = 'yt-shot-labeler-panel';
let detector = null;
let overlayActive = false;
let poseLoopId = null;
let mainVideo = null;
let videoCollection = null;

// --- Helper functions ---
function removeOverlayCanvas() {
  const oldCanvas = document.getElementById('pose-overlay-canvas');
  if (oldCanvas && oldCanvas.parentElement) {
    oldCanvas.parentElement.removeChild(oldCanvas);
  }
}

function disconnectOverlayObserver() {
  if (window.overlayResizeObserver) {
    window.overlayResizeObserver.disconnect();
    window.overlayResizeObserver = null;
  }
}

function getLatestVideo() {
  let videos = document.getElementsByClassName('html5-main-video');
  return videos.length ? videos[videos.length - 1] : null;
}

function init() {
  mainVideo = getLatestVideo();
  if (!mainVideo) return;
  // If overlay is active, stop and restart with the new video
  if (overlayActive) {
    stopPoseOverlay();
  }
  // Start overlay if panel/button requests it
  // Optionally, auto-start overlay here if desired
}

function createOverlayCanvas(video) {
  // Remove any old overlay canvas and disconnect ResizeObserver
  removeOverlayCanvas();
  disconnectOverlayObserver();
  // Find the current video container (YouTube uses 'html5-video-container')
  const containers = document.getElementsByClassName('html5-video-container');
  const container = containers.length ? containers[containers.length - 1] : video.parentElement;
  // Create new overlay canvas
  const canvas = document.createElement('canvas');
  canvas.id = 'pose-overlay-canvas';
  canvas.style.position = 'absolute';
  canvas.style.top = '0px';
  canvas.style.left = '0px';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = 10000;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  container.appendChild(canvas);
  // Use ResizeObserver to keep canvas size in sync with video
  if (window.overlayResizeObserver) {
    window.overlayResizeObserver.disconnect();
  }
  window.overlayResizeObserver = new ResizeObserver(() => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  });
  window.overlayResizeObserver.observe(video);
  return canvas;
}

function drawKeypoints(canvas, poses, threshold = 0.2) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  poses.forEach(pose => {
    pose.keypoints.forEach(kp => {
      if (kp.score > threshold) {
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();
      }
    });
  });
}

async function setupDetector() {
  await tf.setBackend('webgl');
  await tf.ready();
  detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    { modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING }
  );
}

async function poseOverlayLoop(video, overlay) {
  if (!overlayActive) return;
  // Always re-query the video element in case YouTube replaced it or changed quality
  const currentVideo = getLatestVideo();
  let currentOverlay = overlay;
  if (currentVideo !== video) {
    // Video element changed (e.g., ad transition or manual quality change)
    removeOverlayCanvas();
    disconnectOverlayObserver();
    // Wait for the new video element to update its resolution after quality change
    let initialWidth = currentVideo.videoWidth;
    let initialHeight = currentVideo.videoHeight;
    let tries = 0;
    while (tries < 40) {
      await new Promise(res => setTimeout(res, 50));
      if (currentVideo.videoWidth !== initialWidth || currentVideo.videoHeight !== initialHeight) {
        break;
      }
      tries++;
    }
    currentOverlay = createOverlayCanvas(currentVideo);
    video = currentVideo;
  }
  // Always use latest video dimensions for pose detection
  if (video.videoWidth === 0 || video.videoHeight === 0 || video.paused || video.ended) {
    poseLoopId = requestAnimationFrame(() => poseOverlayLoop(video, currentOverlay));
    return;
  }
  const poses = await detector.estimatePoses(video, { maxPoses: 6 });
  drawKeypoints(currentOverlay, poses);
  poseLoopId = requestAnimationFrame(() => poseOverlayLoop(video, currentOverlay));
}

async function startPoseOverlay() {
  if (overlayActive) return;
  const video = getLatestVideo();
  if (!video || video.videoWidth === 0) {
    alert('No video element found or video not loaded.');
    return;
  }
  if (!detector) {
    await setupDetector();
  }
  const overlay = createOverlayCanvas(video);
  overlayActive = true;
  poseOverlayLoop(video, overlay);
}

function stopPoseOverlay() {
  overlayActive = false;
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
  if (e.detail.action === 'start') {
    startPoseOverlay();
  } else if (e.detail.action === 'stop') {
    stopPoseOverlay();
  }
});

// Panel toggle logic remains unchanged
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "toggle-panel") {
    console.log('[Shot Labeler] Received toggle-panel message');
    const panel = document.getElementById(PANEL_ID);
    if (panel) {
      console.log('[Shot Labeler] Removing panel');
      panel.remove();
    } else {
      console.log('[Shot Labeler] Creating panel');
      createLabelerPanel();
    }
  }
});