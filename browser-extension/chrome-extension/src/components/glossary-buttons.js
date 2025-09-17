/**
 * Glossary Buttons Component
 * 
 * This module handles the creation and management of shot type buttons.
 * It focuses on the interactive shot selection UI and button state management.
 * 
 * Key Features:
 * - Dynamic button creation from glossary data
 * - Button selection and visual feedback
 * - Shot type assignment to current shot
 */

import { CSS_CLASSES } from '../constants.js';
import { addTooltip } from '../utils/ui-utils.js';

/**
 * Sets up shot type buttons in the container
 * 
 * @param {HTMLElement} container - Container element for shot buttons
 * @param {Array} shots - Array of shot definitions from glossary
 * @param {Function} getCurrentShot - Function to get current shot object
 * @param {Function} updateStatus - Status update callback
 */
export function setupShotButtons(container, shots, getCurrentShot, updateStatus) {
  if (!shots || !Array.isArray(shots)) {
    console.warn('No shots data available for buttons');
    return;
  }

  // Clear existing content
  container.innerHTML = '';

  // Create button for each shot type
  shots.forEach(shot => {
    const button = createShotButton(shot, getCurrentShot, updateStatus, container);
    container.appendChild(button);
  });
}

/**
 * Creates a single shot type button
 * 
 * @param {Object} shot - Shot definition object
 * @param {Function} getCurrentShot - Function to get current shot object
 * @param {Function} updateStatus - Status update callback
 * @param {HTMLElement} container - Parent container for button selection management
 * @returns {HTMLElement} Button element
 */
function createShotButton(shot, getCurrentShot, updateStatus, container) {
  const button = document.createElement('button');
  button.className = `${CSS_CLASSES.SHOT_BUTTON} yt-shot-labeler-tooltip`;
  button.textContent = shot.name;
  button.setAttribute('data-tooltip', shot.description || shot.name);
  button.setAttribute('aria-label', `Select ${shot.name} shot type`);
  
  button.onclick = () => {
    const currentShot = getCurrentShot();
    currentShot.label = shot.name;
    
    // Update button selection visual state
    updateButtonSelection(container, button);
    
    // Update status display
    updateStatus(`Shot type: ${shot.name}`);
    
    // Add visual feedback
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
      button.style.transform = '';
    }, 150);
  };

  return button;
}

/**
 * Updates visual selection state of buttons
 * 
 * @param {HTMLElement} container - Container with shot buttons
 * @param {HTMLElement} selectedButton - Currently selected button
 */
function updateButtonSelection(container, selectedButton) {
  // Remove selection from all buttons
  container.querySelectorAll(`.${CSS_CLASSES.SHOT_BUTTON}`).forEach(btn => {
    btn.classList.remove(CSS_CLASSES.SHOT_BUTTON_SELECTED);
    btn.style.backgroundColor = '';
    btn.style.color = '';
  });
  
  // Add selection to current button
  if (selectedButton) {
    selectedButton.classList.add(CSS_CLASSES.SHOT_BUTTON_SELECTED);
    selectedButton.style.backgroundColor = '#1976d2';
    selectedButton.style.color = 'white';
  }
}

/**
 * Gets the currently selected shot button
 * 
 * @param {HTMLElement} container - Container with shot buttons
 * @returns {HTMLElement|null} Selected button or null
 */
export function getSelectedShotButton(container) {
  return container.querySelector(`.${CSS_CLASSES.SHOT_BUTTON_SELECTED}`);
}

/**
 * Clears all shot button selections
 * 
 * @param {HTMLElement} container - Container with shot buttons
 */
export function clearShotButtonSelection(container) {
  updateButtonSelection(container, null);
}