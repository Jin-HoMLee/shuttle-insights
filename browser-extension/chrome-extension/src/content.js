window.addEventListener('DOMContentLoaded', init); // Ensures that init runs only after HTML document is fully loaded and parsed
document.addEventListener('yt-navigate-finish', init); // Ensures that init re-runs after navigating to new videos

import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';

import { createLabelerPanel } from './panel.js'; 

const PANEL_ID = 'yt-shot-labeler-panel';
let detector = null;
let overlayActive = false;
let poseLoopId = null;
let mainVideo = null;

// --- Helper functions ---
// Remove overlay canvas from DOM
function removeOverlayCanvas() {
  const oldCanvas = document.getElementById('pose-overlay-canvas');
  if (oldCanvas?.parentElement) oldCanvas.parentElement.removeChild(oldCanvas);
}

// Disconnect ResizeObserver for overlay
function disconnectOverlayObserver() {
  if (window.overlayResizeObserver) {
    window.overlayResizeObserver.disconnect();
    window.overlayResizeObserver = null;
  }
}

// Get the latest YouTube video element
function getLatestVideo() {
  const videos = document.getElementsByClassName('html5-main-video');
  return videos.length ? videos[videos.length - 1] : null;
}

// Initialize main video and overlay state
function init() {
  mainVideo = getLatestVideo();
  if (!mainVideo) return;
  if (overlayActive) stopPoseOverlay();
  // Optionally, auto-start overlay here if desired
}

// Create overlay canvas and attach to video container
function createOverlayCanvas(video) {
  removeOverlayCanvas();
  disconnectOverlayObserver();
  const containers = document.getElementsByClassName('html5-video-container');
  const container = containers.length ? containers[containers.length - 1] : video.parentElement;
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
  window.overlayResizeObserver?.disconnect();
  window.overlayResizeObserver = new ResizeObserver(() => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  });
  window.overlayResizeObserver.observe(video);
  return canvas;
}

// Draw pose keypoints on overlay canvas
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

// Setup pose detector
async function setupDetector() {
  await tf.setBackend('webgl');
  await tf.ready();
  detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    { modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING }
  );
}

// Main pose overlay loop
async function poseOverlayLoop(video, overlay) {
  if (!overlayActive) return;
  const currentVideo = getLatestVideo();
  let currentOverlay = overlay;
  if (currentVideo !== video) {
    removeOverlayCanvas();
    disconnectOverlayObserver();
    const initialWidth = currentVideo.videoWidth;
    const initialHeight = currentVideo.videoHeight;
    let tries = 0;
    while (tries < 40) {
      await new Promise(res => setTimeout(res, 50));
      if (currentVideo.videoWidth !== initialWidth || currentVideo.videoHeight !== initialHeight) break;
      tries++;
    }
    currentOverlay = createOverlayCanvas(currentVideo);
    video = currentVideo;
  }
  if (video.videoWidth === 0 || video.videoHeight === 0 || video.paused || video.ended) {
    poseLoopId = requestAnimationFrame(() => poseOverlayLoop(video, currentOverlay));
    return;
  }
  const poses = await detector.estimatePoses(video, { maxPoses: 6 });
  drawKeypoints(currentOverlay, poses);
  poseLoopId = requestAnimationFrame(() => poseOverlayLoop(video, currentOverlay));
}

// Start overlay
async function startPoseOverlay() {
  if (overlayActive) return;
  const video = getLatestVideo();
  if (!video || video.videoWidth === 0) {
    alert('No video element found or video not loaded.');
    return;
  }
  if (!detector) await setupDetector();
  const overlay = createOverlayCanvas(video);
  overlayActive = true;
  poseOverlayLoop(video, overlay);
}

// Stop overlay
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