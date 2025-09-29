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
import { 
  initializeI18n, 
  switchLanguage, 
  updateLanguageSelector, 
  getCurrentLanguage, 
  SUPPORTED_LANGUAGES 
} from './utils/i18n-manager.js';

/**
 * Creates and initializes the main labeling panel
 * Sets up the complete UI with all sub-components and event handlers
 */
export async function createLabelerPanel() {
  // Prevent duplicate panels
  if (document.getElementById(UI_IDS.PANEL)) return;

  // Initialize i18n system first
  await initializeI18n();

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

  // Initialize language selector
  const currentLanguage = getCurrentLanguage();
  const languageSelector = panel.querySelector(`#${UI_IDS.LANGUAGE_SELECTOR}`);
  updateLanguageSelector(languageSelector, currentLanguage);

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
  
  // Setup language selector button
  setupLanguageSelector(panel);
  
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
    
    // Hover effect is now handled via CSS. No inline event listeners needed.
  }
}

/**
 * Sets up the language selector button functionality
 * @param {HTMLElement} panel - The panel element
 */
function setupLanguageSelector(panel) {
  const languageSelector = panel.querySelector(`#${UI_IDS.LANGUAGE_SELECTOR}`);
  
  if (languageSelector) {
    languageSelector.addEventListener('click', async () => {
      try {
        const currentLang = getCurrentLanguage();
        const supportedLangs = Object.keys(SUPPORTED_LANGUAGES);
        const currentIndex = supportedLangs.indexOf(currentLang);
        const nextIndex = (currentIndex + 1) % supportedLangs.length;
        const nextLang = supportedLangs[nextIndex];
        
        await switchLanguage(nextLang);
        updateLanguageSelector(languageSelector, nextLang);
        
        // Update tooltips and text immediately
        refreshPanelText(panel);
      } catch (error) {
        console.error('Failed to switch language:', error);
      }
    });
  }
}

/**
 * Refreshes all translatable text in the panel
 * @param {HTMLElement} panel - The panel element
 */
function refreshPanelText(panel) {
  // Note: For a complete implementation, we would need to reload the panel content
  // or update each element individually. For now, we'll show a simple notification
  // that a page refresh is needed for full language changes.
  
  // Update dynamic tooltips and aria-labels
  const elementsToUpdate = [
    { selector: `#${UI_IDS.LANGUAGE_SELECTOR}`, tooltip: 'ui.language_selector_tooltip', aria: 'ui.language_selector_aria' },
    { selector: `#${UI_IDS.THEME_TOGGLE}`, tooltip: 'ui.toggle_theme', aria: 'aria_labels.toggle_theme' },
    { selector: `#${UI_IDS.CLOSE_BTN}`, tooltip: 'tooltips.close_panel', aria: 'aria_labels.close_panel' }
  ];
  
  elementsToUpdate.forEach(({ selector, tooltip, aria }) => {
    const element = panel.querySelector(selector);
    if (element) {
      import('./utils/i18n-manager.js').then(({ t }) => {
        element.setAttribute('data-tooltip', t(tooltip));
        element.setAttribute('aria-label', t(aria));
      });
    }
  });
}

/**
 * Toggles the panel visibility
 * Creates panel if it doesn't exist, removes it if it does
 */
export async function togglePanel() {
  const panel = document.getElementById(UI_IDS.PANEL);
  if (panel) {
    window.dispatchEvent(new CustomEvent(EVENTS.POSE_OVERLAY_CONTROL, { 
      detail: { action: 'stop' } 
    }));
    panel.remove();
  } else {
    await createLabelerPanel();
  }
}