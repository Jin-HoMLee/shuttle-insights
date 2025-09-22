/**
 * Glossary Shot Buttons
 * 
 * Handles creation and management of shot type selection buttons.
 * Provides interactive UI elements for selecting shot types from the glossary.
 */

import { CSS_CLASSES } from './constants.js';
import { addTooltip } from './utils/ui/ui-utils.js';

/**
 * Sets up shot type selection buttons
 * 
 * @param {HTMLElement} container - Container element for shot buttons
 * @param {Array} shots - Array of shot definitions from glossary
 * @param {Function} getCurrentShot - Function to get current shot object
 * @param {Function} updateStatus - Status update callback
 */
export function setupShotButtons(container, shots, getCurrentShot, updateStatus) {
  if (!shots || !Array.isArray(shots)) {
    console.warn('No shots data available');
    return;
  }

  // Create section container for shot buttons
  const shotSection = document.createElement('div');
  shotSection.className = CSS_CLASSES.CATEGORY_SECTION;
  
  // Add section header
  const shotHeader = document.createElement('div');
  shotHeader.textContent = "Shots";
  shotHeader.className = CSS_CLASSES.CATEGORY_TITLE;
  shotSection.appendChild(shotHeader);

  // Create button for each shot type
  shots.forEach(shot => {
    const button = createShotButton(shot, getCurrentShot, updateStatus, container);
    shotSection.appendChild(button);
  });

  container.appendChild(shotSection);
}

/**
 * Creates a single shot selection button
 * 
 * @param {Object} shot - Shot definition object
 * @param {Function} getCurrentShot - Function to get current shot object
 * @param {Function} updateStatus - Status update callback
 * @param {HTMLElement} container - Container for managing button states
 * @returns {HTMLElement} Created button element
 */
function createShotButton(shot, getCurrentShot, updateStatus, container) {
  const button = document.createElement('button');
  button.textContent = shot.term;
  button.className = CSS_CLASSES.LABEL_BTN;
  
  // Add enhanced tooltip with definition
  addTooltip(button, `${shot.term}: ${shot.definition}`);
  button.setAttribute('aria-label', `Select ${shot.term} shot type`);

  button.onclick = () => {
    const currentShot = getCurrentShot();
    currentShot.label = shot.term;
    
    // Update button selection state
    updateButtonSelection(container, button);
    updateStatus();
    
    // Add visual feedback
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
      button.style.transform = '';
    }, 150);
  };

  return button;
}

/**
 * Updates button selection states within a container
 * 
 * @param {HTMLElement} container - Container element
 * @param {HTMLElement} selectedButton - Button to mark as selected
 */
function updateButtonSelection(container, selectedButton) {
  // Remove selection from all buttons in container
  container.querySelectorAll('button').forEach(btn => {
    btn.classList.remove("selected");
  });
  
  // Mark the clicked button as selected
  selectedButton.classList.add("selected");
}