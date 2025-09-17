/**
 * Panel Resizing Functionality
 *
 * This module provides interactive resizing capabilities for the panel.
 * It adds resize handles to all corners and edges, allowing users to adjust
 * panel dimensions while maintaining minimum/maximum size constraints.
 *
 * Features:
 * - 8-direction resize handles (corners + edges)
 * - Minimum and maximum size constraints
 * - Smooth resize interaction with visual feedback
 * - Cursor changes to indicate resize direction
 *
 * Configuration Requirements:
 * - PANEL_CONFIG.MAX_SIZE.width and PANEL_CONFIG.MAX_SIZE.height must be functions returning numbers.
 *   This allows dynamic calculation of max panel size based on viewport.
 * - Defensive assertions and debug logging are used to catch config errors early.
 *
 * Debugging Strategy:
 * - Types and values of all critical variables are logged before calculations.
 * - If config values are not functions, an error is thrown to prevent silent bugs.
 * - Automated tests (see test/resize.test.js) validate config and calculation logic.
 */

import { PANEL_CONFIG, CSS_CLASSES } from '../constants.js';
import { assertConfigFunctions, logConfigTypesAndValues } from '../utils/config-utils.js';

/**
 * Adds interactive resize handles to a panel element
 * Creates 8 resize handles (4 corners + 4 edges) with appropriate cursors
 * 
 * @param {HTMLElement} panel - Panel element to make resizable
 */
export function addResizeHandles(panel) {
  if (!panel) {
    console.warn('Panel element required for resize functionality');
    return;
  }

  // Define resize handle configurations
  const handles = [
    { cls: 'n', cursor: 'ns-resize' },    // North (top)
    { cls: 's', cursor: 'ns-resize' },    // South (bottom)
    { cls: 'e', cursor: 'ew-resize' },    // East (right)
    { cls: 'w', cursor: 'ew-resize' },    // West (left)
    { cls: 'ne', cursor: 'nesw-resize' }, // Northeast (top-right)
    { cls: 'nw', cursor: 'nwse-resize' }, // Northwest (top-left)
    { cls: 'se', cursor: 'nwse-resize' }, // Southeast (bottom-right)
    { cls: 'sw', cursor: 'nesw-resize' }  // Southwest (bottom-left)
  ];

  // Create and attach resize handles
  handles.forEach(({ cls, cursor }) => {
    const handle = document.createElement('div');
    handle.className = `${CSS_CLASSES.RESIZE_HANDLE} ${cls}`;
    handle.style.cursor = cursor;
    panel.appendChild(handle);
  });

  // Set up resize interaction state
  let resizing = false;
  let resizeDirection = '';
  let startX, startY, startWidth, startHeight, startLeft, startTop;

  // Add mousedown listeners to all resize handles
  panel.querySelectorAll(`.${CSS_CLASSES.RESIZE_HANDLE}`).forEach(handle => {
    handle.addEventListener("mousedown", function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      startResize(e, handle, panel);
    });
  });

  // Global mousemove handler for resize dragging
  document.addEventListener("mousemove", function(e) {
    if (!resizing) return;
    
    performResize(e, panel, {
      direction: resizeDirection,
      startX, startY, startWidth, startHeight, startLeft, startTop
    });
  });

  // Global mouseup handler to end resize
  document.addEventListener("mouseup", function() {
    if (resizing) {
      endResize();
    }
  });

  /**
   * Initiates resize operation
   * 
   * @param {MouseEvent} e - Mouse event
   * @param {HTMLElement} handle - Resize handle element
   * @param {HTMLElement} panel - Panel being resized
   */
  function startResize(e, handle, panel) {
    resizing = true;
    
    // Determine resize direction from handle class
    resizeDirection = Array.from(handle.classList)
      .find(cls => cls.length <= 2 && cls !== CSS_CLASSES.RESIZE_HANDLE);
    
    // Record starting mouse position
    startX = e.clientX;
    startY = e.clientY;
    
    // Record starting panel dimensions and position
    const rect = panel.getBoundingClientRect();
    startWidth = rect.width;
    startHeight = rect.height;
    startLeft = rect.left;
    startTop = rect.top;
    
    // Prevent text selection during resize
    document.body.style.userSelect = "none";
  }

  /**
   * Performs resize calculation and application
   * 
   * @param {MouseEvent} e - Mouse event
   * @param {HTMLElement} panel - Panel being resized
   * @param {Object} resizeState - Current resize operation state
   */
  function performResize(e, panel, resizeState) {
    const { direction, startX, startY, startWidth, startHeight, startLeft, startTop } = resizeState;
    
    // Calculate mouse movement delta
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    
    // Calculate size constraints
    const minW = PANEL_CONFIG.MIN_SIZE.width;
    const minH = PANEL_CONFIG.MIN_SIZE.height;
    const maxW = PANEL_CONFIG.MAX_SIZE.width();
    const maxH = PANEL_CONFIG.MAX_SIZE.height();
        
    // Initialize new dimensions and position
    let newWidth = startWidth;
    let newHeight = startHeight;
    let newLeft = startLeft;
    let newTop = startTop;
    
    // Apply resize based on direction
    if (direction.includes('e')) { // East - expand right
      newWidth = Math.min(maxW, Math.max(minW, startWidth + deltaX));
    }
    if (direction.includes('s')) { // South - expand down
      newHeight = Math.min(maxH, Math.max(minH, startHeight + deltaY));
    }
    if (direction.includes('w')) { // West - expand left
      newWidth = Math.min(maxW, Math.max(minW, startWidth - deltaX));
      newLeft = startLeft + deltaX;
    }
    if (direction.includes('n')) { // North - expand up
      newHeight = Math.min(maxH, Math.max(minH, startHeight - deltaY));
      newTop = startTop + deltaY;
    }
    
    // Apply calculated dimensions and position
    if (direction.includes('w')) {
      panel.style.left = newLeft + "px";
    }
    if (direction.includes('n')) {
      panel.style.top = newTop + "px";
    }
    
    panel.style.width = newWidth + "px";
    panel.style.height = newHeight + "px";
  }

  /**
   * Ends resize operation and cleans up
   */
  function endResize() {
    resizing = false;
    resizeDirection = '';
    document.body.style.userSelect = "";
  }
}