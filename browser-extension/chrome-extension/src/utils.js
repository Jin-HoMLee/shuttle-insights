// Import Tensorflow.js
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';

// Utility functions

// For panel.js
export function formatDateTime(dt) {
  const pad = (n) => n.toString().padStart(2, '0');
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`;
}

export function sanitize(str) {
  return str.replace(/[<>:"/\\|?*]+/g, '').trim();
}

export function getVideoTitle() {
  let title =
    document.querySelector('h1.title')?.innerText ||
    document.querySelector('h1.ytd-watch-metadata')?.innerText ||
    document.querySelector('.title.style-scope.ytd-video-primary-info-renderer')?.innerText ||
    null;
  if (!title || title.trim() === '') {
    title = document.title
      .replace(/^\(\d+\)\s*/, '')
      .replace(/ - YouTube$/, '')
      .trim();
  }
  return title;
}

// Get the latest YouTube video element
export function getVideo() {
  const videos = document.getElementsByClassName('html5-main-video');
  return videos.length ? videos[videos.length - 1] : null;
}

// for content.js

// Remove overlay canvas from DOM
export function removeOverlayCanvas() {
  const oldCanvas = document.getElementById('pose-overlay-canvas');
  if (oldCanvas?.parentElement) oldCanvas.parentElement.removeChild(oldCanvas);
}

// Disconnect ResizeObserver for overlay
export function disconnectOverlayObserver() {
  if (window.overlayResizeObserver) {
    window.overlayResizeObserver.disconnect();
    window.overlayResizeObserver = null;
  }
}

// Create overlay canvas and attach to video container
export function createOverlayCanvas(video) {
  removeOverlayCanvas();
  disconnectOverlayObserver();
  const canvas = document.createElement('canvas');
  canvas.id = 'pose-overlay-canvas';
  canvas.style.position = 'absolute';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = 10000;

  // Intrinsic size for drawing
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  // Position and display size for overlay
  const rect = video.getBoundingClientRect();
  canvas.style.left = `${rect.left + window.scrollX}px`;
  canvas.style.top = `${rect.top + window.scrollY}px`;
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;

  document.body.appendChild(canvas); // Attach directly to body for absolute positioning

  window.overlayResizeObserver = new ResizeObserver(() => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const rect = video.getBoundingClientRect();
    canvas.style.left = `${rect.left + window.scrollX}px`;
    canvas.style.top = `${rect.top + window.scrollY}px`;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    console.log('ResizeObserver fired:', rect);
  });
  window.overlayResizeObserver.observe(video);

  return canvas;
}

// Setup pose detector
export async function setupDetector() {
  await tf.setBackend('webgl');
  await tf.ready();
  return await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    { modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING }
  );
}