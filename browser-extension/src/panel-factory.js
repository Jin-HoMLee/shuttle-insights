/**
 * Panel Factory
 * 
 * Handles DOM creation, styling, and setup for the main panel element.
 * This module provides functions to create and configure the panel structure.
 */

import { getPanelTemplate } from './panel-templates.js';
import { UI_IDS, PANEL_CONFIG } from './constants.js';

/**
 * Creates the main panel DOM element with HTML structure
 * @param {string} dateTimeStr - Formatted date/time string
 * @param {string} videoTitle - Title of the video  
 * @param {string} videoUrl - URL of the video
 * @returns {HTMLElement} The created panel element
 */
export function createPanelElement(dateTimeStr, videoTitle, videoUrl) {
  const panel = document.createElement('div');
  panel.id = UI_IDS.PANEL;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'YouTube Badminton Shot Labeler');
  panel.innerHTML = getPanelTemplate(dateTimeStr, videoTitle, videoUrl);
  return panel;
}

/**
 * Applies styling to the panel element
 * @param {HTMLElement} panel - The panel element to style
 */
export function stylePanelElement(panel) {
  Object.assign(panel.style, {
    position: "fixed", 
    top: PANEL_CONFIG.DEFAULT_POSITION.top, 
    right: PANEL_CONFIG.DEFAULT_POSITION.right, 
    zIndex: PANEL_CONFIG.Z_INDEX,
    background: "var(--background-color)", 
    border: "1px solid var(--border-color)", 
    padding: "0",
    borderRadius: "12px", 
    boxShadow: "var(--shadow-heavy)", 
    width: PANEL_CONFIG.DEFAULT_SIZE.width,
    fontSize: "14px", 
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", 
    lineHeight: "1.5",
    userSelect: "none", 
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", 
    overflow: "hidden",
    backgroundClip: "padding-box", 
    display: "flex", 
    flexDirection: "column",
    maxHeight: "90vh", 
    minWidth: PANEL_CONFIG.DEFAULT_SIZE.minWidth, 
    minHeight: PANEL_CONFIG.DEFAULT_SIZE.minHeight, 
    resize: "none",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)"
  });
  
  // Add enhanced hover effect
  panel.addEventListener('mouseenter', () => {
    panel.style.transform = 'translateY(-2px)';
    panel.style.boxShadow = 'var(--shadow-heavy)'; // Use CSS variable for consistency
  });
  
  panel.addEventListener('mouseleave', () => {
    panel.style.transform = 'translateY(0)';
    panel.style.boxShadow = 'var(--shadow-medium)'; // Use CSS variable for consistency
  });
}

/**
 * Sets up scrollable behavior for panel content
 * @param {HTMLElement} panel - The panel element to configure
 */
export function setupScrollableBehavior(panel) {
  const observer = new MutationObserver(() => {
    const content = panel.querySelector(`#${UI_IDS.CONTENT}`);
    if (content) {
      content.style.flex = "1 1 auto";
      content.style.overflowY = "auto";
      content.style.overflowX = "hidden";
      observer.disconnect();
    }
  });
  observer.observe(panel, { childList: true, subtree: true });
}