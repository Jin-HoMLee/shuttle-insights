/**
 * Overlay Canvas Utility Functions
 * Contains utilities for managing the pose overlay canvas and resize observers
 */

import { UI_IDS, POSE_CONFIG } from '../constants.js';
import { getVideoContainerRect, getVideoDimensions } from './video-utils.js';
import { safeRemoveElement } from './ui-utils.js';

/**
 * Creates and positions an overlay canvas for pose visualization
 * @param {HTMLVideoElement} video - Video element to overlay on
 * @returns {HTMLCanvasElement} Created canvas element
 * @throws {Error} If video element is not provided or not ready
 */
export function createOverlayCanvas(video) {
  if (!video) {
    throw new Error('Video element is required to create overlay canvas');
  }
  
  const dimensions = getVideoDimensions(video);
  if (!dimensions) {
    throw new Error('Video is not ready - no dimensions available');
  }
  
  // Clean up any existing overlay
  removeOverlayCanvas();
  disconnectOverlayObserver();
  
  // Create new canvas element
  const canvas = document.createElement('canvas');
  canvas.id = UI_IDS.OVERLAY_CANVAS;
  
  // Set canvas properties for overlay
  Object.assign(canvas.style, {
    position: 'absolute',
    pointerEvents: 'none', // Allow clicks to pass through
    zIndex: POSE_CONFIG.OVERLAY_Z_INDEX,
    border: 'none',
    background: 'transparent'
  });
  
  // Set intrinsic canvas dimensions for drawing
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
  
  // Position and size the canvas to match video display
  updateCanvasPosition(canvas, video);
  
  // Attach to document body for absolute positioning
  document.body.appendChild(canvas);
  
  // Set up resize observer to keep canvas synchronized with video
  setupOverlayResizeObserver(canvas, video);
  
  console.log('Overlay canvas created and positioned');
  return canvas;
}

/**
 * Updates canvas position and size to match video element
 * @param {HTMLCanvasElement} canvas - Canvas element to update
 * @param {HTMLVideoElement} video - Video element to match
 */
export function updateCanvasPosition(canvas, video) {
  if (!canvas || !video) return;
  
  const rect = getVideoContainerRect(video);
  const dimensions = getVideoDimensions(video);
  
  if (!rect || !dimensions) return;
  
  // Update canvas drawing dimensions
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
  
  // Update canvas display position and size
  Object.assign(canvas.style, {
    left: `${rect.left + window.scrollX}px`,
    top: `${rect.top + window.scrollY}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`
  });
}

/**
 * Sets up ResizeObserver to automatically update canvas when video changes
 * @param {HTMLCanvasElement} canvas - Canvas element to observe
 * @param {HTMLVideoElement} video - Video element to observe
 */
export function setupOverlayResizeObserver(canvas, video) {
  if (!canvas || !video) return;
  
  // Disconnect any existing observer
  disconnectOverlayObserver();
  
  // Create new ResizeObserver
  window.overlayResizeObserver = new ResizeObserver(() => {
    updateCanvasPosition(canvas, video);
  });
  
  // Observe the video element for size changes
  window.overlayResizeObserver.observe(video);
  
  // Also observe window scroll changes for absolute positioning
  const handleScroll = () => updateCanvasPosition(canvas, video);
  window.addEventListener('scroll', handleScroll);
  window.addEventListener('resize', handleScroll);
  
  // Store cleanup function
  window.overlayCleanupHandlers = window.overlayCleanupHandlers || [];
  window.overlayCleanupHandlers.push(() => {
    window.removeEventListener('scroll', handleScroll);
    window.removeEventListener('resize', handleScroll);
  });
}

/**
 * Removes the overlay canvas from the DOM
 */
export function removeOverlayCanvas() {
  safeRemoveElement(UI_IDS.OVERLAY_CANVAS);
  console.log('Overlay canvas removed');
}

/**
 * Disconnects and cleans up the ResizeObserver for overlay
 */
export function disconnectOverlayObserver() {
  // Disconnect ResizeObserver
  if (window.overlayResizeObserver) {
    window.overlayResizeObserver.disconnect();
    window.overlayResizeObserver = null;
  }
  
  // Clean up event handlers
  if (window.overlayCleanupHandlers) {
    window.overlayCleanupHandlers.forEach(cleanup => {
      try { cleanup(); } catch (e) { /* ignore */ }
    });
    window.overlayCleanupHandlers = [];
  }
  
  console.log('Overlay observer disconnected');
}

/**
 * Gets the overlay canvas element if it exists
 * @returns {HTMLCanvasElement|null} Canvas element or null if not found
 */
export function getOverlayCanvas() {
  return document.getElementById(UI_IDS.OVERLAY_CANVAS);
}

/**
 * Checks if overlay canvas is currently active
 * @returns {boolean} True if overlay canvas exists and is attached to DOM
 */
export function isOverlayActive() {
  const canvas = getOverlayCanvas();
  return !!(canvas && canvas.parentElement);
}

/**
 * Gets the 2D rendering context from the overlay canvas
 * @returns {CanvasRenderingContext2D|null} Canvas context or null if not available
 */
export function getOverlayContext() {
  const canvas = getOverlayCanvas();
  return canvas ? canvas.getContext('2d') : null;
}

/**
 * Clears the overlay canvas
 */
export function clearOverlay() {
  const ctx = getOverlayContext();
  if (ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
}

/**
 * Validates that canvas and video are properly aligned
 * @param {HTMLCanvasElement} canvas - Canvas element to validate
 * @param {HTMLVideoElement} video - Video element to compare against
 * @returns {boolean} True if canvas is properly aligned with video
 */
export function validateCanvasAlignment(canvas, video) {
  if (!canvas || !video) return false;
  
  const canvasRect = canvas.getBoundingClientRect();
  const videoRect = getVideoContainerRect(video);
  const videoDimensions = getVideoDimensions(video);
  
  if (!videoRect || !videoDimensions) return false;
  
  // Check position alignment (with small tolerance for floating point errors)
  const tolerance = 2;
  const positionMatch = Math.abs(canvasRect.left - videoRect.left) < tolerance &&
                       Math.abs(canvasRect.top - videoRect.top) < tolerance;
  
  // Check size alignment
  const sizeMatch = Math.abs(canvasRect.width - videoRect.width) < tolerance &&
                   Math.abs(canvasRect.height - videoRect.height) < tolerance;
  
  // Check canvas drawing dimensions
  const drawingMatch = canvas.width === videoDimensions.width &&
                      canvas.height === videoDimensions.height;
  
  return positionMatch && sizeMatch && drawingMatch;
}