/**
 * Glossary Dimension Controls
 * 
 * Handles creation and management of dimension control UI elements.
 * Provides collapsible sections with value buttons for advanced shot annotation.
 */

import { CSS_CLASSES } from './constants.js';
import { getDimensionKey } from './glossary-utils.js';

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
 * Creates a dimension control group (label + value buttons)
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

  // Create button group for dimension values
  const buttonGroup = document.createElement('div');
  buttonGroup.className = CSS_CLASSES.DIMENSION_BUTTONS;
  buttonGroup.style.display = "flex";
  buttonGroup.style.gap = "4px";
  buttonGroup.style.flexWrap = "wrap";

  // Create button for each dimension value
  if (dimension.values && Array.isArray(dimension.values)) {
    dimension.values.forEach(value => {
      const button = createDimensionValueButton(
        value, 
        dimension, 
        getCurrentShot, 
        updateStatus, 
        buttonGroup
      );
      buttonGroup.appendChild(button);
    });
  }

  container.appendChild(buttonGroup);
  return container;
}

/**
 * Creates a button for a specific dimension value
 * 
 * @param {Object} value - Dimension value object
 * @param {Object} dimension - Parent dimension object
 * @param {Function} getCurrentShot - Function to get current shot object
 * @param {Function} updateStatus - Status update callback
 * @param {HTMLElement} buttonGroup - Parent button group for state management
 * @returns {HTMLElement} Value button element
 */
export function createDimensionValueButton(value, dimension, getCurrentShot, updateStatus, buttonGroup) {
  const button = document.createElement('button');
  button.textContent = value.term;
  button.className = CSS_CLASSES.DIMENSION_BTN;
  button.title = value.description;
  
  // Style the dimension button
  Object.assign(button.style, {
    fontSize: "11px",
    padding: "2px 6px",
    border: "1px solid #ccc",
    borderRadius: "3px",
    background: "#f9f9f9",
    cursor: "pointer",
    color: "#333"
  });

  button.onclick = () => {
    const currentShot = getCurrentShot();
    const dimensionKey = getDimensionKey(dimension.term);
    
    // Set the dimension value on the current shot
    currentShot[dimensionKey] = value.term;
    
    // Update button states within this dimension group
    updateDimensionButtonStates(buttonGroup, button);
    updateStatus();
  };

  return button;
}

/**
 * Updates button states within a dimension button group
 * 
 * @param {HTMLElement} buttonGroup - Container with dimension value buttons
 * @param {HTMLElement} selectedButton - Button to mark as selected
 */
export function updateDimensionButtonStates(buttonGroup, selectedButton) {
  // Reset all buttons in this group
  buttonGroup.querySelectorAll('button').forEach(btn => {
    btn.style.background = "#f9f9f9";
    btn.style.color = "#333";
  });
  
  // Highlight selected button
  selectedButton.style.background = "#007cba";
  selectedButton.style.color = "white";
}