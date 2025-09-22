/**
 * Glossary Management (Modular Compatibility)
 *
 * This module maintains compatibility for glossary functionality while using the new modular structure.
 *
 * The glossary functionality has been split into focused modules:
 * - glossary-loader.js: Data loading and error handling
 * - glossary-buttons.js: Shot button creation and management
 * - glossary-dimensions.js: Dimension controls and UI
 * - glossary-utils.js: Shared utilities and helpers
 * 
 * This file now serves as a compatibility layer, coordinating the specialized modules.
 *
 * Features:
 * - Dynamic button generation from glossary data
 * - Collapsible dimension controls
 * - Shot type selection with visual feedback
 * - Advanced shot dimension annotation (position, timing, intention, etc.)
 *
 * ---
 * IMPORTANT: Shot State Management Pattern
 *
 * The glossary UI does not manage its own shot state. Instead, it expects a callback
 * function (getCurrentShot) to be passed in by the caller (typically panel.js).
 *
 * Example usage from panel.js:
 *   let currentShot = { ...DEFAULT_SHOT };
 *   setupGlossaryButtons(panel, () => currentShot, updateStatus);
 *
 * The getCurrentShot parameter is an arrow function that always returns the currentShot
 * object managed by the parent module. This allows glossary.js to update the correct shot
 * object without direct knowledge of its scope or lifecycle.
 *
 * Whenever glossary.js needs to update shot data (label, dimensions, etc.), it calls
 * getCurrentShot(), which returns the current shot object from panel.js.
 *
 * This pattern avoids global state and keeps shot management centralized in the parent module.
 * ---
 */

import { loadGlossaryData, showGlossaryError } from './glossary-loader.js';
import { setupShotButtons } from './glossary-buttons.js';
import { setupDimensionControls } from './glossary-dimensions.js';

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
      showGlossaryError(labelDiv, 'Failed to load shot glossary');
    });
}

