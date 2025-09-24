/**
 * Glossary Shot Buttons
 * 
 * Handles creation and management of shot type selection buttons.
 * Provides interactive UI elements for selecting shot types from the glossary.
 * Updated to use Material Design 3 filter chips.
 */

import { CSS_CLASSES } from './constants.js';
import { addTooltip } from './utils/ui/ui-utils.js';

/**
 * Sets up shot type selection buttons using Material 3 filter chips
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

  // Create section container for shot buttons using Material 3 chip set
  const shotSection = document.createElement('div');
  shotSection.className = CSS_CLASSES.CATEGORY_SECTION;
  
  // Add section header
  const shotHeader = document.createElement('div');
  shotHeader.textContent = "Shots";
  shotHeader.className = CSS_CLASSES.CATEGORY_TITLE;
  shotSection.appendChild(shotHeader);

  // Create chip set container
  const chipSet = document.createElement('md-chip-set');
  chipSet.style.cssText = 'display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;';

  // Create filter chip for each shot type
  shots.forEach(shot => {
    const chip = createShotChip(shot, getCurrentShot, updateStatus, chipSet);
    chipSet.appendChild(chip);
  });

  shotSection.appendChild(chipSet);
  container.appendChild(shotSection);
}

/**
 * Creates a single shot selection filter chip using Material 3
 * 
 * @param {Object} shot - Shot definition object
 * @param {Function} getCurrentShot - Function to get current shot object
 * @param {Function} updateStatus - Status update callback
 * @param {HTMLElement} chipSet - Chip set container for managing selection states
 * @returns {HTMLElement} Created filter chip element
 */
function createShotChip(shot, getCurrentShot, updateStatus, chipSet) {
  const chip = document.createElement('md-filter-chip');
  chip.textContent = shot.term;
  chip.setAttribute('label', shot.term);
  
  // Add enhanced tooltip with definition
  addTooltip(chip, `${shot.term}: ${shot.definition}`);
  chip.setAttribute('aria-label', `Select ${shot.term} shot type`);

  chip.addEventListener('click', () => {
    const currentShot = getCurrentShot();
    currentShot.label = shot.term;
    
    // Update chip selection state
    updateChipSelection(chipSet, chip);
    updateStatus();
  });

  return chip;
}

/**
 * Updates chip selection states within a chip set
 * 
 * @param {HTMLElement} chipSet - Chip set container
 * @param {HTMLElement} selectedChip - Chip to mark as selected
 */
function updateChipSelection(chipSet, selectedChip) {
  // Remove selection from all chips in set
  chipSet.querySelectorAll('md-filter-chip').forEach(chip => {
    chip.removeAttribute('selected');
  });
  
  // Mark the clicked chip as selected
  selectedChip.setAttribute('selected', '');
}