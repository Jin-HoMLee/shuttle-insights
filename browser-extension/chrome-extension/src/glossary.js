/**
 * Glossary Management - Legacy Compatibility
 * 
 * This module provides backward compatibility for existing imports while
 * delegating functionality to the new modular components.
 * 
 * The glossary functionality has been split into:
 * - components/glossary-buttons.js - Shot button creation and management
 * - components/dimension-controls.js - Dimension control UI
 * - data/glossary-loader.js - Glossary data loading and caching
 */

import { setupShotButtons } from './components/glossary-buttons.js';
import { setupDimensionControls } from './components/dimension-controls.js';
import { loadGlossaryData } from './loaders/glossary-loader.js';
import { CSS_CLASSES } from './constants.js';

/**
 * Sets up glossary buttons and dimension controls for the panel
 * 
 * @param {HTMLElement} panel - The main panel element
 * @param {Function} getCurrentShot - Function that returns the current shot object
 * @param {Function} updateStatus - Callback to update the status display
 */
export function setupGlossaryButtons(panel, getCurrentShot, updateStatus) {
  const labelDiv = panel.querySelector('#label-buttons');
  const dimensionDiv = panel.querySelector('#dimension-controls');
  
  if (!labelDiv || !dimensionDiv) {
    console.warn('Glossary container elements not found');
    return;
  }
  
  // Clear existing content
  labelDiv.innerHTML = "";
  dimensionDiv.innerHTML = "";

  // Load glossary data and setup UI
  loadGlossaryData()
    .then(glossaryData => {
      setupShotButtons(labelDiv, glossaryData.shots, getCurrentShot, updateStatus);
      setupDimensionControls(dimensionDiv, glossaryData.dimensions, getCurrentShot, updateStatus);
    })
    .catch(error => {
      console.error('Failed to load glossary data:', error);
      showGlossaryError(labelDiv, 'Failed to load shot types. Please refresh the page.');
    });
}

/**
 * Shows an error message in the glossary container
 */
function showGlossaryError(container, message) {
  container.innerHTML = `
    <div class="${CSS_CLASSES.INFO}" style="color: #d32f2f; padding: 8px; background: #ffeaa7; border-radius: 4px;">
      <strong>⚠️ Error:</strong> ${message}
    </div>
  `;
}

// Re-export commonly used functions for backward compatibility
export { loadGlossaryData, getShotTypes, getDimensions } from './loaders/glossary-loader.js';
export { setupShotButtons, clearShotButtonSelection } from './components/glossary-buttons.js';
export { setupDimensionControls } from './components/dimension-controls.js';