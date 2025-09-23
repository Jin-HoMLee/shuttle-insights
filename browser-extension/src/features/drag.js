/**
 * Panel Drag Functionality
 * 
 * This module provides drag-and-drop repositioning for the panel.
 * Users can click and drag the panel header to move the entire panel
 * around the screen while avoiding conflicts with resize handles.
 * 
 * Features:
 * - Click and drag from panel header
 * - Avoids interference with resize handles
 * - Smooth dragging with position tracking
 * - Automatic positioning cleanup
 */

import { UI_IDS, CSS_CLASSES } from '../constants.js';

/**
 * Adds drag behavior to a panel element
 * Makes the panel draggable by its header while avoiding resize handle conflicts
 * 
 * @param {HTMLElement} panel - Panel element to make draggable
 */
export function addDragBehavior(panel) {
  if (!panel) {
    console.warn('Panel element required for drag functionality');
    return;
  }

  const header = panel.querySelector(`#${UI_IDS.HEADER}`);
  if (!header) {
    console.warn('Panel header not found - drag functionality unavailable');
    return;
  }

  // Drag state management
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  /**
   * Initiates drag operation when header is clicked
   * Calculates initial offset for smooth dragging
   */
  header.onmousedown = function (e) {
    // Ignore clicks on resize handles to avoid conflicts
    if (e.target.classList.contains(CSS_CLASSES.RESIZE_HANDLE)) {
      return;
    }

    isDragging = true;
    
    // Calculate offset from click point to panel top-left
    const panelRect = panel.getBoundingClientRect();
    offsetX = e.clientX - panelRect.left;
    offsetY = e.clientY - panelRect.top;
    
    // Prevent text selection during drag
    document.body.style.userSelect = "none";
  };

  /**
   * Handles mouse movement during drag operation
   * Updates panel position based on mouse movement
   */
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    // Calculate new position based on mouse position and initial offset
    const newLeft = e.clientX - offsetX;
    const newTop = e.clientY - offsetY;

    // Apply position with bounds checking
    updatePanelPosition(panel, newLeft, newTop);
  });

  /**
   * Ends drag operation when mouse is released
   * Cleans up drag state and restores text selection
   */
  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      document.body.style.userSelect = "";
    }
  });
}

/**
 * Updates panel position with boundary constraints
 * Ensures panel remains within viewport bounds
 * 
 * @param {HTMLElement} panel - Panel element to position
 * @param {number} left - Desired left position in pixels
 * @param {number} top - Desired top position in pixels
 */
function updatePanelPosition(panel, left, top) {
  // Get viewport dimensions
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const panelRect = panel.getBoundingClientRect();
  
  // Apply boundary constraints
  const constrainedLeft = Math.max(0, Math.min(left, viewportWidth - panelRect.width));
  const constrainedTop = Math.max(0, Math.min(top, viewportHeight - panelRect.height));
  
  // Apply positioning
  panel.style.left = constrainedLeft + "px";
  panel.style.top = constrainedTop + "px";
  
  // Reset positioning properties that might conflict
  panel.style.right = "auto";
  panel.style.bottom = "auto";
  panel.style.margin = "0";
}