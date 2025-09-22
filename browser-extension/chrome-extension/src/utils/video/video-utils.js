/**
 * Video Utility Functions
 * Contains utilities for interacting with YouTube video elements
 */

import { VIDEO_SELECTORS } from '../../constants.js';

/**
 * Gets the current active YouTube video element
 * YouTube can have multiple video elements, so we get the most recent one
 * @returns {HTMLVideoElement|null} The active video element or null if not found
 */
export function getVideo() {
  const videos = document.getElementsByClassName(VIDEO_SELECTORS.MAIN_VIDEO);
  return videos.length ? videos[videos.length - 1] : null;
}

/**
 * Checks if a video element is ready for interaction
 * @param {HTMLVideoElement} video - Video element to check
 * @returns {boolean} True if video is ready (has dimensions and is not ended)
 */
export function isVideoReady(video) {
  return !!(video && 
           video.videoWidth > 0 && 
           video.videoHeight > 0 && 
           !video.ended);
}

/**
 * Gets the current video time in seconds
 * @param {HTMLVideoElement} video - Video element to get time from
 * @returns {number|null} Current time in seconds or null if video not available
 */
export function getCurrentTime(video) {
  return video ? video.currentTime : null;
}

/**
 * Sets the video time to a specific position
 * @param {HTMLVideoElement} video - Video element to seek
 * @param {number} timeInSeconds - Time position to seek to
 * @returns {boolean} True if seek was successful
 */
export function seekTo(video, timeInSeconds) {
  if (!video || timeInSeconds < 0) return false;
  
  try {
    video.currentTime = timeInSeconds;
    return true;
  } catch (error) {
    console.warn('Failed to seek video:', error);
    return false;
  }
}

/**
 * Gets video dimensions
 * @param {HTMLVideoElement} video - Video element to get dimensions from
 * @returns {Object|null} Object with width/height or null if not available
 */
export function getVideoDimensions(video) {
  if (!isVideoReady(video)) return null;
  
  return {
    width: video.videoWidth,
    height: video.videoHeight
  };
}

/**
 * Gets the video container element's bounding rectangle
 * @param {HTMLVideoElement} video - Video element to get bounds for
 * @returns {DOMRect|null} Bounding rectangle or null if not available
 */
export function getVideoContainerRect(video) {
  if (!video) return null;
  
  return video.getBoundingClientRect();
}

/**
 * Checks if video is currently playing
 * @param {HTMLVideoElement} video - Video element to check
 * @returns {boolean} True if video is playing
 */
export function isVideoPlaying(video) {
  return !!(video && 
           !video.paused && 
           !video.ended && 
           video.currentTime > 0 && 
           video.readyState > 2);
}

/**
 * Gets the YouTube player container element
 * @returns {HTMLElement|null} Player container or null if not found
 */
export function getPlayerContainer() {
  return document.querySelector(VIDEO_SELECTORS.PLAYER);
}

/**
 * Waits for video to be ready with a timeout
 * @param {number} timeout - Maximum time to wait in milliseconds (default: 5000)
 * @returns {Promise<HTMLVideoElement|null>} Promise that resolves with video element or null
 */
export function waitForVideo(timeout = 5000) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const checkVideo = () => {
      const video = getVideo();
      
      if (isVideoReady(video)) {
        resolve(video);
        return;
      }
      
      if (Date.now() - startTime > timeout) {
        resolve(null);
        return;
      }
      
      // Check again after a short delay
      setTimeout(checkVideo, 100);
    };
    
    checkVideo();
  });
}

/**
 * Adds event listeners to a video element with cleanup tracking
 * @param {HTMLVideoElement} video - Video element to add listeners to
 * @param {Object} eventHandlers - Object mapping event names to handler functions
 * @returns {Function} Cleanup function to remove all added listeners
 */
export function addVideoEventListeners(video, eventHandlers) {
  if (!video || !eventHandlers) return () => {};
  
  const cleanupFunctions = [];
  
  Object.entries(eventHandlers).forEach(([eventName, handler]) => {
    if (typeof handler === 'function') {
      video.addEventListener(eventName, handler);
      cleanupFunctions.push(() => video.removeEventListener(eventName, handler));
    }
  });
  
  // Return cleanup function
  return () => {
    cleanupFunctions.forEach(cleanup => cleanup());
  };
}