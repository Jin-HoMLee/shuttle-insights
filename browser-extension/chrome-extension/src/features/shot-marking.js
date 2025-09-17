/**
 * Shot Marking Feature
 * 
 * This module handles the shot start/end marking functionality.
 * It manages the timing workflow and shot creation process.
 * 
 * Key Features:
 * - Shot start time marking
 * - Shot end time marking and saving
 * - Shot timing validation
 * - Status updates and user feedback
 */

import { getVideo } from '../utils/video-utils.js';
import { showWarning, showSuccess, showButtonLoading, hideButtonLoading } from '../utils/ui-utils.js';
import { UI_IDS, DEFAULT_SHOT } from '../constants.js';

/**
 * Sets up shot start/end marking buttons
 */
export function setupShotMarkingButtons(panel, currentShot, shots, updateStatus, updateShotList) {
  const markStartBtn = panel.querySelector(`#${UI_IDS.MARK_START}`);
  const markEndBtn = panel.querySelector(`#${UI_IDS.MARK_END}`);
  
  if (!markStartBtn || !markEndBtn) {
    console.warn('Shot marking buttons not found');
    return;
  }

  // Mark start time button
  markStartBtn.onclick = () => {
    markShotStart(currentShot, updateStatus);
  };

  // Mark end time and save shot button
  markEndBtn.onclick = () => {
    markShotEnd(currentShot, shots, updateStatus, updateShotList);
  };
}

/**
 * Marks the current video time as shot start
 */
function markShotStart(currentShot, updateStatus) {
  const video = getVideo();
  if (!video) {
    showWarning('No video found');
    return;
  }

  const currentTime = parseFloat(video.currentTime.toFixed(2));
  currentShot.start = currentTime;
  currentShot.end = null; // Reset end time
  currentShot.label = null; // Reset label
  
  // Reset all dimensions
  currentShot.longitudinalPosition = null;
  currentShot.lateralPosition = null;
  currentShot.timing = null;
  currentShot.intention = null;
  currentShot.impact = null;
  currentShot.direction = null;

  updateStatus(`Shot start marked at ${currentTime}s`);
}

/**
 * Marks the current video time as shot end and saves the shot
 */
function markShotEnd(currentShot, shots, updateStatus, updateShotList) {
  const video = getVideo();
  if (!video) {
    showWarning('No video found');
    return;
  }

  if (currentShot.start === null) {
    showWarning('Please mark start time first');
    return;
  }

  const currentTime = parseFloat(video.currentTime.toFixed(2));
  
  if (currentTime <= currentShot.start) {
    showWarning('End time must be after start time');
    return;
  }

  currentShot.end = currentTime;
  
  // Create a copy of the current shot for storage
  const shotToSave = { ...currentShot };
  shots.push(shotToSave);

  // Reset current shot for next labeling
  Object.assign(currentShot, { ...DEFAULT_SHOT });

  updateStatus(`Shot saved: ${shotToSave.start}s - ${shotToSave.end}s`);
  updateShotList();
  showSuccess('Shot saved successfully!');
}

/**
 * Validates shot timing constraints
 */
export function validateShotTiming(startTime, endTime) {
  if (startTime === null || endTime === null) {
    return { valid: false, message: 'Both start and end times must be set' };
  }
  
  if (endTime <= startTime) {
    return { valid: false, message: 'End time must be after start time' };
  }
  
  const duration = endTime - startTime;
  if (duration > 60) { // Arbitrary reasonable limit
    return { valid: false, message: 'Shot duration seems too long (>60s)' };
  }
  
  return { valid: true, message: 'Valid shot timing' };
}