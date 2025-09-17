/**
 * Keyboard Shortcuts Feature
 * 
 * This module handles keyboard shortcuts for the panel functionality.
 * It provides keyboard access to key features for improved usability.
 * 
 * Key Features:
 * - Ctrl+S: Mark shot start
 * - Ctrl+E: Mark shot end & save
 * - Ctrl+O: Toggle pose overlay
 * - Esc: Close panel
 */

import { UI_IDS, KEYBOARD_SHORTCUTS, EVENTS } from '../constants.js';

/**
 * Sets up keyboard shortcuts for the panel
 */
export function setupKeyboardShortcuts(panel, currentShot, shots, updateStatus, updateShotList) {
  let removed = false;
  
  const handleKeydown = (event) => {
    // Only handle shortcuts when panel is active and not in an input field
    if (removed) return;
    if (!panel || !document.contains(panel)) return;
    if (
      event.target.tagName === 'INPUT' ||
      event.target.tagName === 'TEXTAREA' ||
      event.target.isContentEditable
    ) return;

    switch (event.code) {
      case KEYBOARD_SHORTCUTS.MARK_START:
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          const markStartBtn = panel.querySelector(`#${UI_IDS.MARK_START}`);
          if (markStartBtn) markStartBtn.click();
        }
        break;

      case KEYBOARD_SHORTCUTS.MARK_END:
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          const markEndBtn = panel.querySelector(`#${UI_IDS.MARK_END}`);
          if (markEndBtn) markEndBtn.click();
        }
        break;

      case KEYBOARD_SHORTCUTS.TOGGLE_OVERLAY:
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          const overlayBtn = panel.querySelector(`#${UI_IDS.CUSTOM_ACTION_BTN}`);
          if (overlayBtn) overlayBtn.click();
        }
        break;

      case KEYBOARD_SHORTCUTS.CLOSE_PANEL:
        event.preventDefault();
        const closeBtn = panel.querySelector(`#${UI_IDS.CLOSE_BTN}`);
        if (closeBtn) closeBtn.click();
        break;
    }
  };

  // Add event listener
  document.addEventListener('keydown', handleKeydown);

  // Cleanup function to remove event listener
  const cleanup = () => {
    removed = true;
    document.removeEventListener('keydown', handleKeydown);
  };

  // Auto-cleanup when panel is removed
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        const removedNodes = Array.from(mutation.removedNodes);
        if (removedNodes.some(node => node === panel || node.contains?.(panel))) {
          cleanup();
          observer.disconnect();
        }
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  return cleanup;
}

/**
 * Gets available keyboard shortcuts with descriptions
 */
export function getAvailableShortcuts() {
  return [
    { key: 'Ctrl+S', description: 'Mark shot start time' },
    { key: 'Ctrl+E', description: 'Mark shot end time & save' },
    { key: 'Ctrl+O', description: 'Toggle pose overlay' },
    { key: 'Esc', description: 'Close panel' }
  ];
}