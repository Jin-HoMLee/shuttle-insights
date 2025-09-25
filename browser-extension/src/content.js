/**
 * Content Script - Pose Overlay Management
 * 
 * This script handles pose overlay functionality for the YouTube Badminton Shot Labeler extension.
 * It manages the pose detection loop, video event handling, and communication with the popup UI.
 * 
 * Key Responsibilities:
 * - Pose overlay start/stop management via TensorFlow.js
 * - Video change detection and overlay repositioning
 * - Communication with popup interface via Chrome messaging
 * - Video metadata provision to popup
 * 
 * Note: UI management has been moved to popup interface (popup.js).
 * This script focuses solely on pose detection and video integration.
 */

import { getVideo } from './utils/video/video-utils.js';
import { removeOverlayCanvas, createOverlayCanvas } from './utils/canvas/overlay-utils.js';
import { setupDetector } from './utils/pose/pose-utils.js';
import { drawKeypoints, drawSkeletonAndBoxes } from './features/poseDrawing.js';
import { getVideoTitle } from './utils/ui/ui-utils.js';
import { EVENTS, UI_IDS } from './constants.js';

// State management
let detector = null; // Pose detector instance (needed for pose estimation)
let poseLoopId = null; // ID of the pose overlay loop (needed for checking and canceling)
let modeObserver = null; // MutationObserver for mode changes

/**
 * Attaches MutationObserver to watch for YouTube player mode changes
 * Observes the video player container for attribute changes that indicate
 * mode switches (default, theater, fullscreen) which require overlay repositioning
 */
function attachModeObserver() {
  const player = document.querySelector('.html5-video-player');
  if (player && !modeObserver) {
    modeObserver = new MutationObserver(() => {
      handleVideoChange();
    });
    modeObserver.observe(player, { attributes: true, attributeFilter: ['class', 'style'] });
  }
}

/**
 * Detaches and cleans up the MutationObserver
 * Called when overlay is stopped to prevent memory leaks
 */
function detachModeObserver() {
  if (modeObserver) {
    modeObserver.disconnect();
    modeObserver = null;
  }
}

/**
 * Main pose overlay rendering loop
 * Continuously estimates poses from video and draws them on canvas
 * 
 * @param {HTMLVideoElement} video - The video element to analyze
 * @param {Object} detector - The pose detection model instance
 * @param {HTMLCanvasElement} overlay - The canvas element for drawing
 * @param {CanvasRenderingContext2D} ctx - The 2D rendering context
 */
async function poseOverlayLoop(video, detector, overlay, ctx) {
  try {
    // Validate video and overlay are still valid
    if (!video || video.videoWidth === 0 || video.videoHeight === 0 || video.ended) {
      return; // Stop loop if video is not ready
    }
    
    // Estimate poses from current video frame
    const poses = await detector.estimatePoses(video, { maxPoses: 6 });
    
    // Draw the detected poses on the overlay canvas
    drawKeypoints(ctx, poses);
    drawSkeletonAndBoxes(ctx, poses);
    
  } catch (err) {
    console.error('Pose estimation failed:', err);
    return; // Stop loop on error
  }
  
  // Schedule next frame analysis
  poseLoopId = window.requestAnimationFrame(() => poseOverlayLoop(video, detector, overlay, ctx));
}

/**
 * Starts the pose overlay functionality
 * Sets up video event listeners, initializes detector, creates overlay canvas,
 * and begins the pose detection loop
 */
async function startPoseOverlay() {
  // Set status: loading
  const statusEl = document.getElementById(UI_IDS.OVERLAY_STATUS);
  if (statusEl) statusEl.textContent = 'Overlay loading...';

  const video = getVideo();
  
  // Attach event listeners to handle video changes
  attachVideoListeners(video);
  
  // Check if video is ready for pose detection
  if (!video || video.videoWidth === 0) {
    if (statusEl) statusEl.textContent = 'Overlay: video not ready';
    return;
  }
  
  // Attach MutationObserver for YouTube mode changes (Default, Theater, Fullscreen)
  attachModeObserver();
  
  // Initialize pose detector if not already done
  if (!detector) {
    if (statusEl) statusEl.textContent = 'Loading pose model...';
    detector = await setupDetector();
  }

  // Create overlay canvas positioned over the video
  const overlay = createOverlayCanvas(video);
  const ctx = overlay.getContext('2d');

  // Set status: online
  if (statusEl) statusEl.textContent = 'Overlay online';

  // Start the pose detection and rendering loop
  poseOverlayLoop(video, detector, overlay, ctx);
}

/**
 * Stops the pose overlay functionality
 * Cancels the animation loop, removes overlay canvas, and cleans up observers
 */
function stopPoseOverlay() {
  // Set status: offline
  const statusEl = document.getElementById(UI_IDS.OVERLAY_STATUS);
  if (statusEl) statusEl.textContent = 'Overlay offline';

  // Cancel the pose detection loop
  if (poseLoopId) {
    window.cancelAnimationFrame(poseLoopId);
    poseLoopId = null;
  }

  // Remove overlay canvas from DOM
  removeOverlayCanvas();

  // Disconnect MutationObserver when overlay stops
  detachModeObserver();
}

/**
 * Handles video change events (quality changes, mode switches, etc.)
 * Restarts the overlay if it's currently active to ensure proper positioning
 * 
 * This is called when:
 * - Video quality changes
 * - Player mode changes (theater, fullscreen)
 * - Video element is replaced
 */
export function handleVideoChange() {
  // Only restart overlay if it is currently active
  if (poseLoopId !== null) {
    stopPoseOverlay();
    startPoseOverlay(); // This will use the updated video element
  }
}

/**
 * Attaches event listeners to the current video element
 * Listens for events that indicate the video or its container has changed
 * 
 * @param {HTMLVideoElement} video - Video element to attach listeners to
 */
function attachVideoListeners(video) {
  if (video) {
    video.addEventListener('loadeddata', handleVideoChange);
    video.addEventListener('resize', handleVideoChange);
  }
}

// ================================
// Event Handling & Communication
// ================================

/**
 * Listen for messages from popup
 * The popup sends messages to control overlay state and get video information
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'ping':
      sendResponse({ status: 'ok' });
      break;
      
    case 'get-video-details':
      const video = getVideo();
      sendResponse({
        title: getVideoTitle(),
        url: window.location.href,
        videoReady: video && video.videoWidth > 0
      });
      break;
      
    case 'get-current-time':
      const currentVideo = getVideo();
      if (currentVideo) {
        sendResponse({ currentTime: currentVideo.currentTime });
      } else {
        sendResponse({ error: 'Video not available' });
      }
      break;
      
    case 'toggle-pose-overlay':
      if (poseLoopId !== null) {
        stopPoseOverlay();
        sendResponse({ status: 'Overlay stopped', type: 'warning' });
      } else {
        startPoseOverlay();
        sendResponse({ status: 'Overlay started', type: 'success' });
      }
      break;
      
    case EVENTS.TOGGLE_PANEL:
      // Legacy support - this is no longer used with popup interface
      console.log('Panel toggle requested - this is now handled by popup interface');
      sendResponse({ status: 'Panel functionality moved to popup' });
      break;
      
    default:
      sendResponse({ error: 'Unknown action' });
  }
  
  return true; // Keep message channel open for async responses
});