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

  // Restore the visual state of dimension buttons based on current shot
  restoreDimensionButtonStates(content, getCurrentShot);

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
  label.setAttribute('data-dimension-label', 'true');
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
  
  // Button visual styling is handled via CSS classes (see CSS_CLASSES.DIMENSION_BTN) for consistency and maintainability.

  // Add accessibility attributes
  button.setAttribute('role', 'button');
  button.setAttribute('tabindex', '0');
  button.setAttribute('aria-pressed', 'false');

  button.onclick = () => {
    const currentShot = getCurrentShot();
    const dimensionKey = getDimensionKey(dimension.term);
    // Check if this button is already selected
    const isCurrentlySelected = button.classList.contains('selected');
    if (isCurrentlySelected) {
      // Deselect - clear the dimension value and reset button state
      delete currentShot[dimensionKey];
      resetDimensionButtonStates(buttonGroup);
    } else {
      // Select - set the dimension value and update button states
      currentShot[dimensionKey] = value.term;
      updateDimensionButtonStates(buttonGroup, button);
    }
    updateStatus();
  };

  // Add keyboard navigation support
  button.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      button.click();
    }
  });

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
    btn.classList.remove('selected');
    btn.setAttribute('aria-pressed', 'false');
  });
  // Highlight selected button
  selectedButton.classList.add('selected');
  selectedButton.setAttribute('aria-pressed', 'true');
}

/**
 * Resets all button states within a dimension button group to unselected
 * 
 * @param {HTMLElement} buttonGroup - Container with dimension value buttons
 */
function resetDimensionButtonStates(buttonGroup) {
  buttonGroup.querySelectorAll('button').forEach(btn => {
    btn.classList.remove('selected');
    btn.setAttribute('aria-pressed', 'false');
  });
}

/**
 * Restores the visual state of dimension buttons based on current shot values
 * 
 * @param {HTMLElement} content - Content container with all dimension controls
 * @param {Function} getCurrentShot - Function to get current shot object
 */
function restoreDimensionButtonStates(content, getCurrentShot) {
  const currentShot = getCurrentShot();
  
  // Find all dimension buttons and restore their states
  content.querySelectorAll(`.${CSS_CLASSES.DIMENSION_BUTTONS}`).forEach(buttonGroup => {
    const buttons = buttonGroup.querySelectorAll('button');
    
    buttons.forEach(button => {
      // Get the dimension and value from button context
      const dimensionContainer = button.closest(`.${CSS_CLASSES.DIMENSION_SECTION}`);
      if (!dimensionContainer) return;
      const labelEl = dimensionContainer.querySelector('[data-dimension-label="true"]');
      if (!labelEl) return;
      const dimensionLabel = labelEl.textContent.replace(':', '');
      const dimensionKey = getDimensionKey(dimensionLabel);
      const buttonValue = button.textContent.trim();
      // Check if this button's value matches the current shot's dimension value
      if (currentShot[dimensionKey] === buttonValue) {
        button.classList.add('selected');
        button.setAttribute('aria-pressed', 'true');
      } else {
        button.classList.remove('selected');
        button.setAttribute('aria-pressed', 'false');
      }
    });
  });
}