/**
 * Glossary Dimension Controls
 * 
 * Handles creation and management of dimension control UI elements.
 * Provides collapsible sections with value buttons for advanced shot annotation.
 */

import { CSS_CLASSES } from './constants.js';
import { getDimensionKey } from './utils/glossary/glossary-utils.js';

/**
 * Sets up dimension control UI (collapsible section with value buttons)
 * 
 * @param {HTMLElement} container - Container element for dimension controls
 * @param {Array} dimensions - Array of dimension definitions from glossary
 * @param {Function} getCurrentShot - Function to get current shot object
 * @param {Function} updateStatus - Status update callback
 */
export function setupDimensionControls(container, dimensions, getCurrentShot, updateStatus) {
  if (!dimensions || !Array.isArray(dimensions)) {
    console.warn('No dimensions data available');
    return;
  }

  // Create main dimension section container
  const dimensionSection = document.createElement('div');
  dimensionSection.className = CSS_CLASSES.CATEGORY_SECTION;

  // Create collapsible header
  const header = createDimensionHeader();
  dimensionSection.appendChild(header);

  // Create collapsible content area
  const content = document.createElement('div');
  content.style.display = 'none'; // Start collapsed
  content.className = 'dimension-content';

  // Setup collapse/expand functionality
  setupDimensionCollapse(header, content);

  // Create controls for each dimension
  dimensions.forEach(dimension => {
    const dimensionControl = createDimensionControl(dimension, getCurrentShot, updateStatus);
    content.appendChild(dimensionControl);
  });

  dimensionSection.appendChild(content);
  container.appendChild(dimensionSection);
}

/**
 * Creates the collapsible header for dimension controls
 * 
 * @returns {HTMLElement} Header element with collapse indicator
 */
function createDimensionHeader() {
  const header = document.createElement('div');
  header.className = CSS_CLASSES.CATEGORY_TITLE;
  header.style.marginTop = "10px";
  header.style.cursor = "pointer";
  header.title = "Click to expand/collapse";
  header.textContent = 'Advanced Shot Dimensions';

  // Add collapse/expand indicator
  const collapseIcon = document.createElement('span');
  collapseIcon.textContent = '▼'; // Default collapsed
  collapseIcon.style.marginLeft = '8px';
  collapseIcon.className = 'collapse-icon';
  header.appendChild(collapseIcon);

  return header;
}

/**
 * Sets up collapse/expand functionality for dimension controls
 * 
 * @param {HTMLElement} header - Header element to make clickable
 * @param {HTMLElement} content - Content element to show/hide
 */
function setupDimensionCollapse(header, content) {
  const icon = header.querySelector('.collapse-icon');
  
  header.onclick = () => {
    const isVisible = content.style.display !== 'none';
    
    if (isVisible) {
      content.style.display = 'none';
      icon.textContent = '▼';
    } else {
      content.style.display = 'block';
      icon.textContent = '▲';
    }
  };
}

/**
 * Creates a dimension control group (label + value chips using Material 3)
 * 
 * @param {Object} dimension - Dimension definition object
 * @param {Function} getCurrentShot - Function to get current shot object
 * @param {Function} updateStatus - Status update callback
 * @returns {HTMLElement} Dimension control container
 */
function createDimensionControl(dimension, getCurrentShot, updateStatus) {
  const container = document.createElement('div');
  container.className = CSS_CLASSES.DIMENSION_SECTION;
  container.style.marginBottom = "8px";

  // Create dimension label
  const label = document.createElement('div');
  label.textContent = dimension.term + ':';
  label.style.fontSize = "12px";
  label.style.fontWeight = "bold";
  label.style.marginBottom = "4px";
  label.title = dimension.description;
  container.appendChild(label);

  // Create chip set for dimension values
  const chipSet = document.createElement('md-chip-set');
  chipSet.style.cssText = 'display: flex; flex-wrap: wrap; gap: 4px;';

  // Create filter chip for each dimension value
  if (dimension.values && Array.isArray(dimension.values)) {
    dimension.values.forEach(value => {
      const chip = createDimensionValueChip(
        value, 
        dimension,
        getCurrentShot, 
        updateStatus, 
        chipSet
      );
      chipSet.appendChild(chip);
    });
  }

  container.appendChild(chipSet);
  return container;
}

/**
 * Creates a filter chip for a specific dimension value using Material 3
 * 
 * @param {Object} value - Dimension value object
 * @param {Object} dimension - Parent dimension object
 * @param {Function} getCurrentShot - Function to get current shot object
 * @param {Function} updateStatus - Status update callback
 * @param {HTMLElement} chipSet - Parent chip set for state management
 * @returns {HTMLElement} Value chip element
 */
function createDimensionValueChip(value, dimension, getCurrentShot, updateStatus, chipSet) {
  const chip = document.createElement('md-filter-chip');
  chip.textContent = value.term;
  chip.setAttribute('label', value.term);
  chip.title = value.description;
  
  // Style the dimension chip to be smaller
  chip.style.cssText = '--md-filter-chip-container-height: 24px; font-size: 11px;';

  chip.addEventListener('click', () => {
    const currentShot = getCurrentShot();
    const dimensionKey = getDimensionKey(dimension.term);
    
    // Set the dimension value on the current shot
    currentShot[dimensionKey] = value.term;
    
    // Update chip states within this dimension group
    updateDimensionChipStates(chipSet, chip);
    updateStatus();
  });

  return chip;
}

/**
 * Updates dimension chip selection states within a chip set
 * 
 * @param {HTMLElement} chipSet - Chip set container
 * @param {HTMLElement} selectedChip - Chip to mark as selected
 */
function updateDimensionChipStates(chipSet, selectedChip) {
  // Remove selection from all chips in this dimension group
  chipSet.querySelectorAll('md-filter-chip').forEach(chip => {
    chip.removeAttribute('selected');
  });
  
  // Mark the clicked chip as selected
  selectedChip.setAttribute('selected', '');
}