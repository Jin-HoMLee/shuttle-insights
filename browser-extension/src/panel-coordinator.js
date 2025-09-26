/**
 * Panel Coordinator
 * 
 * Orchestrates all panel modules and manages the complete panel lifecycle.
 * This module acts as the central coordinator for panel creation, functionality setup,
 * and integration between different panel modules.
 */

import { formatDateTime, sanitize, getVideoTitle } from './utils/ui/ui-utils.js';
import { addResizeHandles } from './features/resize.js';
import { addDragBehavior } from './features/drag.js';
import { setupCSV } from './csv.js';
import { setupGlossaryButtons } from './glossary.js';
import { createPanelElement, stylePanelElement, setupScrollableBehavior } from './panel-factory.js';
import { setupKeyboardShortcuts, setupCloseButton, setupOverlayButton } from './panel-events.js';
import { 
  createWorkflowState, 
  setupShotMarkingButtons, 
  createStatusUpdater, 
  createShotListUpdater 
} from './panel-workflow.js';
import { UI_IDS, EVENTS } from './constants.js';
import { initializeTheme, toggleTheme, updateThemeToggleButton, getCurrentTheme } from './utils/theme-manager.js';

/**
 * Creates and initializes the main labeling panel
 * Sets up the complete UI with all sub-components and event handlers
 */
export function createLabelerPanel() {
  // Prevent duplicate panels
  if (document.getElementById(UI_IDS.PANEL)) return;

  // Initialize workflow state
  const workflowState = createWorkflowState();
  const { state } = workflowState;

  // Get video metadata
  const now = new Date();
  const dateTimeStr = formatDateTime(now);
  const videoTitle = getVideoTitle();
  const sanitizedTitle = sanitize(videoTitle) || "video";
  const videoUrl = window.location.href;

  // Create main panel structure
  const panel = createPanelElement(dateTimeStr, videoTitle, videoUrl);
  
  // Set initial state for entrance animation
  panel.style.opacity = '0';
  panel.style.transform = 'scale(0.8) translateY(-20px)';
  
  // Apply panel styling and behavior
  stylePanelElement(panel);
  addResizeHandles(panel);
  addDragBehavior(panel);
  setupScrollableBehavior(panel);

  // Create update functions
  const updateStatus = createStatusUpdater(panel, workflowState.getCurrentShot);
  const updateShotList = createShotListUpdater(
    panel, 
    workflowState.getShots, 
    workflowState.removeShot
  );

  // Create glossary setup function
  const setupGlossary = () => {
    setupGlossaryButtons(panel, workflowState.getCurrentShot, updateStatus);
  };

  // Set up functionality modules
  setupPanelFunctionality(panel, workflowState, {
    updateStatus,
    updateShotList,
    setupGlossary
  });
  
  setupCSV(panel, state.shots, updateShotList, videoUrl, sanitizedTitle);

  // Add panel to DOM
  document.body.appendChild(panel);

  // Initialize theme and set up theme toggle
  initializeTheme().then(currentTheme => {
    const themeToggleBtn = panel.querySelector(`#${UI_IDS.THEME_TOGGLE}`);
    updateThemeToggleButton(themeToggleBtn, currentTheme);
  });

  // Trigger entrance animation
  setTimeout(() => {
    panel.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
    panel.style.opacity = '1';
    panel.style.transform = 'scale(1) translateY(0)';
  }, 16);

  // Initialize display
  updateStatus();
}

/**
 * Sets up all panel functionality including event handlers
 * @param {HTMLElement} panel - The panel element
 * @param {Object} workflowState - Workflow state object
 * @param {Object} callbacks - Callback functions
 */
function setupPanelFunctionality(panel, workflowState, callbacks) {
  // Setup overlay toggle button
  setupOverlayButton(panel);
  
  // Setup theme toggle button
  setupThemeToggle(panel);
  
  // Setup shot marking buttons
  setupShotMarkingButtons(panel, workflowState, callbacks);
  
  // Setup glossary and dimension controls
  callbacks.setupGlossary();
  
  // Create keyboard shortcut handlers
  const keyboardHandlers = {
    onMarkStart: () => {
      const markStartBtn = panel.querySelector(`#${UI_IDS.MARK_START}`);
      if (markStartBtn) markStartBtn.click();
    },
    onMarkEnd: () => {
      const markEndBtn = panel.querySelector(`#${UI_IDS.MARK_END}`);
      if (markEndBtn) markEndBtn.click();
    },
    onToggleOverlay: () => {
      const overlayBtn = panel.querySelector(`#${UI_IDS.CUSTOM_ACTION_BTN}`);
      if (overlayBtn) overlayBtn.click();
    },
    onClose: () => {
      const closeBtn = panel.querySelector(`#${UI_IDS.CLOSE_BTN}`);
      if (closeBtn) closeBtn.click();
    }
  };
  
  // Setup keyboard shortcuts and close button
  setupKeyboardShortcuts(panel, keyboardHandlers);
  setupCloseButton(panel);
}

/**
 * Sets up the theme toggle button functionality
 * @param {HTMLElement} panel - The panel element
 */
function setupThemeToggle(panel) {
  const themeToggleBtn = panel.querySelector(`#${UI_IDS.THEME_TOGGLE}`);
  
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', async () => {
      try {
        const newTheme = await toggleTheme();
        updateThemeToggleButton(themeToggleBtn, newTheme);
      } catch (error) {
        console.error('Failed to toggle theme:', error);
      }
    });
    
    // Add hover effect
    themeToggleBtn.addEventListener('mouseenter', () => {
      themeToggleBtn.style.background = 'var(--theme-toggle-hover-bg)';
    });
    
    themeToggleBtn.addEventListener('mouseleave', () => {
      themeToggleBtn.style.background = 'var(--theme-toggle-bg)';
    });
  }
}

/**
 * Toggles the panel visibility
 * Creates panel if it doesn't exist, removes it if it does
 */
export function togglePanel() {
  const panel = document.getElementById(UI_IDS.PANEL);
  if (panel) {
    window.dispatchEvent(new CustomEvent(EVENTS.POSE_OVERLAY_CONTROL, { 
      detail: { action: 'stop' } 
    }));
    panel.remove();
  } else {
    createLabelerPanel();
  }
}