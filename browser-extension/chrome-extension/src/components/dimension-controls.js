/**
 * Dimension Controls Component
 * 
 * This module handles the creation and management of shot dimension controls.
 * It provides collapsible UI for advanced shot annotation with position, timing, etc.
 * 
 * Key Features:
 * - Collapsible dimension control sections
 * - Dynamic value button generation
 * - Multi-dimensional shot annotation
 * - State management for dimension values
 */

import { CSS_CLASSES } from '../constants.js';
import { addTooltip } from '../utils/ui-utils.js';

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

  // Clear existing content
  container.innerHTML = '';

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
    const control = createDimensionControl(dimension, getCurrentShot, updateStatus);
    content.appendChild(control);
  });

  dimensionSection.appendChild(content);
  container.appendChild(dimensionSection);
}

/**
 * Creates the collapsible header for dimension controls
 * 
 * @returns {HTMLElement} Header element
 */
function createDimensionHeader() {
  const header = document.createElement('div');
  header.className = `${CSS_CLASSES.CATEGORY_TITLE} dimension-header`;
  header.style.cssText = `
    cursor: pointer;
    padding: 8px 12px;
    background: #f5f5f5;
    border-radius: 4px;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    user-select: none;
  `;
  
  header.innerHTML = `
    <span>🎯 Shot Dimensions (Optional)</span>
    <span class="expand-indicator" style="transition: transform 0.2s;">▼</span>
  `;
  
  return header;
}

/**
 * Sets up collapse/expand behavior for dimension controls
 * 
 * @param {HTMLElement} header - Clickable header element
 * @param {HTMLElement} content - Content to show/hide
 */
function setupDimensionCollapse(header, content) {
  const indicator = header.querySelector('.expand-indicator');
  
  header.onclick = () => {
    const isCollapsed = content.style.display === 'none';
    
    if (isCollapsed) {
      content.style.display = 'block';
      indicator.style.transform = 'rotate(180deg)';
      header.setAttribute('aria-expanded', 'true');
    } else {
      content.style.display = 'none';
      indicator.style.transform = 'rotate(0deg)';
      header.setAttribute('aria-expanded', 'false');
    }
  };
  
  // Initialize ARIA attributes
  header.setAttribute('role', 'button');
  header.setAttribute('aria-expanded', 'false');
  header.setAttribute('tabindex', '0');
}

/**
 * Creates a dimension control with value buttons
 * 
 * @param {Object} dimension - Dimension definition object
 * @param {Function} getCurrentShot - Function to get current shot object
 * @param {Function} updateStatus - Status update callback
 * @returns {HTMLElement} Dimension control element
 */
function createDimensionControl(dimension, getCurrentShot, updateStatus) {
  const control = document.createElement('div');
  control.className = 'dimension-control';
  control.style.cssText = 'margin-bottom: 12px; padding: 8px; border: 1px solid #e0e0e0; border-radius: 4px;';
  
  // Create dimension title
  const title = document.createElement('div');
  title.className = 'dimension-title';
  title.style.cssText = 'font-weight: 600; margin-bottom: 6px; font-size: 13px;';
  title.textContent = dimension.name;
  
  // Create button group for values
  const buttonGroup = document.createElement('div');
  buttonGroup.className = 'dimension-values';
  buttonGroup.style.cssText = 'display: flex; flex-wrap: wrap; gap: 4px;';
  
  // Create button for each value
  dimension.values.forEach(value => {
    const button = createDimensionValueButton(value, dimension, getCurrentShot, updateStatus, buttonGroup);
    buttonGroup.appendChild(button);
  });
  
  control.appendChild(title);
  control.appendChild(buttonGroup);
  
  return control;
}

/**
 * Creates a button for a dimension value
 * 
 * @param {string} value - Dimension value
 * @param {Object} dimension - Dimension definition
 * @param {Function} getCurrentShot - Function to get current shot object
 * @param {Function} updateStatus - Status update callback
 * @param {HTMLElement} buttonGroup - Parent button group for selection management
 * @returns {HTMLElement} Button element
 */
function createDimensionValueButton(value, dimension, getCurrentShot, updateStatus, buttonGroup) {
  const button = document.createElement('button');
  button.className = 'dimension-value-btn yt-shot-labeler-tooltip';
  button.textContent = value;
  button.setAttribute('data-tooltip', `Set ${dimension.name} to ${value}`);
  button.style.cssText = `
    padding: 4px 8px;
    font-size: 11px;
    border: 1px solid #ccc;
    background: white;
    border-radius: 3px;
    cursor: pointer;
    transition: all 0.2s;
  `;
  
  button.onclick = () => {
    const currentShot = getCurrentShot();
    const dimensionKey = getDimensionKey(dimension.name);
    currentShot[dimensionKey] = value;
    
    // Update button selection state
    updateDimensionButtonStates(buttonGroup, button);
    
    // Update status
    updateStatus(`${dimension.name}: ${value}`);
    
    // Visual feedback
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
      button.style.transform = '';
    }, 150);
  };
  
  return button;
}

/**
 * Updates the selection state of dimension value buttons
 * 
 * @param {HTMLElement} buttonGroup - Container with dimension value buttons
 * @param {HTMLElement} selectedButton - Currently selected button
 */
function updateDimensionButtonStates(buttonGroup, selectedButton) {
  // Reset all buttons in this group
  buttonGroup.querySelectorAll('.dimension-value-btn').forEach(btn => {
    btn.style.backgroundColor = 'white';
    btn.style.color = 'black';
    btn.style.borderColor = '#ccc';
  });
  
  // Highlight selected button
  if (selectedButton) {
    selectedButton.style.backgroundColor = '#1976d2';
    selectedButton.style.color = 'white';
    selectedButton.style.borderColor = '#1976d2';
  }
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