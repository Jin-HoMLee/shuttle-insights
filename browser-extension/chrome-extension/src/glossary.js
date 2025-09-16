/**
 * Glossary Management
 * 
 * This module handles the setup and management of shot glossary buttons and 
 * dimension controls. It loads shot definitions and dimensions from a JSON file
 * and creates interactive UI elements for shot labeling.
 * 
 * Features:
 * - Dynamic button generation from glossary data
 * - Collapsible dimension controls
 * - Shot type selection with visual feedback
 * - Advanced shot dimension annotation (position, timing, intention, etc.)
 */

import { CSS_CLASSES, EXTENSION_CONFIG } from './constants.js';
import { addTooltip } from './ui-utils.js';

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

/**
 * Loads glossary data from the extension's JSON file
 * 
 * @returns {Promise<Object>} Promise resolving to glossary data
 */
async function loadGlossaryData() {
  const response = await fetch(chrome.runtime.getURL(EXTENSION_CONFIG.GLOSSARY_FILE));
  
  if (!response.ok) {
    throw new Error(`Failed to fetch glossary: ${response.status}`);
  }
  
  return await response.json();
}

/**
 * Sets up shot type selection buttons
 * 
 * @param {HTMLElement} container - Container element for shot buttons
 * @param {Array} shots - Array of shot definitions from glossary
 * @param {Function} getCurrentShot - Function to get current shot object
 * @param {Function} updateStatus - Status update callback
 */
function setupShotButtons(container, shots, getCurrentShot, updateStatus) {
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

/**
 * Sets up dimension control UI (collapsible section with value buttons)
 * 
 * @param {HTMLElement} container - Container element for dimension controls
 * @param {Array} dimensions - Array of dimension definitions from glossary
 * @param {Function} getCurrentShot - Function to get current shot object
 * @param {Function} updateStatus - Status update callback
 */
function setupDimensionControls(container, dimensions, getCurrentShot, updateStatus) {
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
function createDimensionValueButton(value, dimension, getCurrentShot, updateStatus, buttonGroup) {
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
function updateDimensionButtonStates(buttonGroup, selectedButton) {
  // Reset all buttons in this group
  buttonGroup.querySelectorAll('button').forEach(btn => {
    btn.style.background = "#f9f9f9";
    btn.style.color = "#333";
  });
  
  // Highlight selected button
  selectedButton.style.background = "#007cba";
  selectedButton.style.color = "white";
}

/**
 * Maps dimension names to object property keys
 * Converts human-readable dimension names to camelCase property names
 * 
 * @param {string} dimensionTerm - Human-readable dimension name
 * @returns {string} Corresponding object property key
 */
function getDimensionKey(dimensionTerm) {
  const mapping = {
    'Longitudinal Position': 'longitudinalPosition',
    'Lateral Position': 'lateralPosition',
    'Timing': 'timing',
    'Intention': 'intention',
    'Impact': 'impact',
    'Direction': 'direction'
  };
  
  return mapping[dimensionTerm] || dimensionTerm.toLowerCase().replace(/\s+/g, '');
}

/**
 * Shows an error message in the glossary container
 * 
 * @param {HTMLElement} container - Container to show error in
 * @param {string} message - Error message to display
 */
function showGlossaryError(container, message) {
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    color: #d32f2f;
    background: #ffebee;
    border: 1px solid #f8bbd9;
    padding: 8px;
    border-radius: 4px;
    margin: 4px 0;
    font-size: 12px;
  `;
  errorDiv.textContent = message;
  container.appendChild(errorDiv);
}