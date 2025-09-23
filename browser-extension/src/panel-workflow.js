/**
 * Panel Workflow
 * 
 * Manages the shot labeling workflow, including shot start/end marking,
 * state management, and shot list operations.
 */

import { getVideo } from './utils/video/video-utils.js';
import { showButtonLoading, hideButtonLoading, showWarning, showSuccess } from './utils/ui/ui-utils.js';
import { UI_IDS, DEFAULT_SHOT, CSS_CLASSES } from './constants.js';

/**
 * Creates workflow state management functions
 * @param {Object} initialShot - Initial shot object
 * @returns {Object} State management functions and data
 */
export function createWorkflowState(initialShot = { ...DEFAULT_SHOT }) {
  const state = {
    shots: [],
    currentShot: { ...initialShot }
  };

  return {
    state,
    reset: () => Object.assign(state.currentShot, DEFAULT_SHOT),
    addShot: (shot) => state.shots.push({ ...shot }),
    removeShot: (index) => state.shots.splice(index, 1),
    getCurrentShot: () => state.currentShot,
    getShots: () => state.shots
  };
}

/**
 * Sets up shot start/end marking buttons
 * @param {HTMLElement} panel - The panel element
 * @param {Object} workflowState - Workflow state object
 * @param {Object} callbacks - Callback functions
 * @param {Function} callbacks.updateStatus - Function to update status display
 * @param {Function} callbacks.updateShotList - Function to update shot list display
 * @param {Function} callbacks.setupGlossary - Function to setup glossary buttons
 */
export function setupShotMarkingButtons(panel, workflowState, callbacks) {
  const { state } = workflowState;
  
  // Mark Start button
  const markStartBtn = panel.querySelector(`#${UI_IDS.MARK_START}`);
  if (markStartBtn) {
    markStartBtn.onclick = () => {
      const video = getVideo();
      if (!video) {
        showWarning('Video not found. Please reload the page.', panel);
        return;
      }
      
      // Add visual feedback
      markStartBtn.style.transform = 'scale(0.95)';
      state.currentShot.start = video.currentTime;
      callbacks.updateStatus();
      
      // Success feedback
      const originalContent = markStartBtn.innerHTML;
      markStartBtn.innerHTML = '<span>✅</span> Start Marked';
      markStartBtn.classList.add('yt-shot-labeler-btn-success');
      
      setTimeout(() => {
        markStartBtn.innerHTML = originalContent;
        markStartBtn.classList.remove('yt-shot-labeler-btn-success');
        markStartBtn.style.transform = '';
      }, 1000);
    };
  }

  // Mark End button
  const markEndBtn = panel.querySelector(`#${UI_IDS.MARK_END}`);
  if (markEndBtn) {
    markEndBtn.onclick = () => {
      const video = getVideo();
      if (!video) {
        showWarning('Video not found. Please reload the page.', panel);
        return;
      }
      
      // Validation with better error messages
      if (state.currentShot.start === null) {
        showWarning("Please mark the start time first!", panel);
        markStartBtn.style.animation = 'pulse 0.5s ease-in-out';
        setTimeout(() => { markStartBtn.style.animation = ''; }, 500);
        return;
      }
      if (!state.currentShot.label) {
        showWarning("Please select a shot type first!", panel);
        const labelButtons = panel.querySelector('#label-buttons');
        if (labelButtons) {
          labelButtons.style.animation = 'pulse 0.5s ease-in-out';
          setTimeout(() => { labelButtons.style.animation = ''; }, 500);
        }
        return;
      }
      
      state.currentShot.end = video.currentTime;
      if (state.currentShot.end <= state.currentShot.start) {
        showWarning("End time must be after start time!", panel);
        return;
      }
      
      // Show loading state
      showButtonLoading(markEndBtn, 'Saving...');
      
      // Simulate processing time for smooth UX
      setTimeout(() => {
        // Save current shot and reset
        workflowState.addShot(state.currentShot);
        callbacks.updateShotList();
        
        // Reset current shot
        workflowState.reset();
        callbacks.updateStatus();
        
        // Success feedback
        hideButtonLoading(markEndBtn);
        showSuccess(`Shot labeled successfully! (${state.shots.length} total shots)`, panel);
        
        // Re-render glossary buttons for fresh state
        callbacks.setupGlossary();
      }, 300);
    };
  }
}

/**
 * Creates status update function
 * @param {HTMLElement} panel - The panel element
 * @param {Function} getCurrentShot - Function to get current shot state
 * @returns {Function} Status update function
 */
export function createStatusUpdater(panel, getCurrentShot) {
  return function updateStatus() {
    const status = panel.querySelector(`#${UI_IDS.SHOT_STATUS}`);
    if (!status) return;

    const currentShot = getCurrentShot();
    const dimensions = [];
    
    // Check all possible dimensions and include them if they have values
    if (currentShot.longitudinalPosition) dimensions.push(`Pos: ${currentShot.longitudinalPosition}`);
    if (currentShot.lateralPosition) dimensions.push(`Lateral: ${currentShot.lateralPosition}`);
    if (currentShot.timing) dimensions.push(`Time: ${currentShot.timing}`);
    if (currentShot.intention) dimensions.push(`Intent: ${currentShot.intention}`);
    if (currentShot.impact) dimensions.push(`Impact: ${currentShot.impact}`);
    if (currentShot.direction) dimensions.push(`Direction: ${currentShot.direction}`);
    
    const dimensionText = dimensions.length > 0 ? ` | ${dimensions.join(' | ')}` : '';
    status.textContent = `Start: ${currentShot.start !== null ? currentShot.start.toFixed(2) + 's' : "-"} | End: ${currentShot.end !== null ? currentShot.end.toFixed(2) + 's' : "-"} | Label: ${currentShot.label ?? '-'}${dimensionText}`;
  };
}

/**
 * Creates shot list update function
 * @param {HTMLElement} panel - The panel element
 * @param {Function} getShots - Function to get shots array
 * @param {Function} removeShot - Function to remove a shot by index
 * @returns {Function} Shot list update function
 */
export function createShotListUpdater(panel, getShots, removeShot) {
  function updateShotListImpl() {
    const listDiv = panel.querySelector(`#${UI_IDS.LABEL_LIST}`);
    if (!listDiv) return;

    const shots = getShots();
    listDiv.innerHTML = shots.length === 0
      ? `<div style="color:#999;">No shots labeled yet.</div>`
      : shots.map((shot, i) => {
          const dimensions = [];
          if (shot.longitudinalPosition) dimensions.push(shot.longitudinalPosition);
          if (shot.lateralPosition) dimensions.push(shot.lateralPosition);
          if (shot.timing) dimensions.push(shot.timing);
          if (shot.intention) dimensions.push(shot.intention);
          if (shot.impact) dimensions.push(shot.impact);
          if (shot.direction) dimensions.push(shot.direction);
          
          const dimensionText = dimensions.length > 0 ? ` (${dimensions.join(', ')})` : '';
          
          return `<div style="display:flex;align-items:center;gap:6px;">
            <div style="flex:1;">#${i + 1}: <b>${shot.label}</b>${dimensionText} [${shot.start.toFixed(2)}s - ${shot.end.toFixed(2)}s]</div>
            <button title="Delete" class="${CSS_CLASSES.DELETE_BTN}" data-index="${i}" style="background:transparent;border:none;cursor:pointer;font-size:15px;">🗑️</button>
          </div>`;
        }).join("");
        
    // Add delete functionality
    listDiv.querySelectorAll(`.${CSS_CLASSES.DELETE_BTN}`).forEach(btn => {
      btn.onclick = function () {
        const idx = parseInt(btn.getAttribute('data-index'));
        removeShot(idx);
        updateShotListImpl();
      };
    });
  }
  return updateShotListImpl;
}

/**
 * Validates the current shot workflow state
 * @param {Object} currentShot - Current shot object
 * @returns {boolean} True if workflow state is valid
 */
export function validateWorkflowState(currentShot) {
  return !!(
    currentShot &&
    currentShot.start !== null &&
    currentShot.end !== null &&
    currentShot.label &&
    currentShot.end > currentShot.start
  );
}