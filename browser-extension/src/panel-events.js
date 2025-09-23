/**
 * Panel Events
 * 
 * Handles event listeners, keyboard shortcuts, and user interactions for the panel.
 * This module manages all event-related functionality including keyboard shortcuts,
 * button clicks, and panel lifecycle events.
 */

import { addTooltip, showButtonLoading, hideButtonLoading } from './utils/ui/ui-utils.js';
import { UI_IDS, KEYBOARD_SHORTCUTS, EVENTS } from './constants.js';

/**
 * Sets up keyboard shortcuts for the panel
 * @param {HTMLElement} panel - The panel element
 * @param {Object} handlers - Object containing handler functions
 * @param {Function} handlers.onMarkStart - Handler for mark start shortcut
 * @param {Function} handlers.onMarkEnd - Handler for mark end shortcut
 * @param {Function} handlers.onToggleOverlay - Handler for toggle overlay shortcut
 * @param {Function} handlers.onClose - Handler for close panel shortcut
 */
export function setupKeyboardShortcuts(panel, handlers) {
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
          handlers.onMarkStart();
        }
        break;
      case KEYBOARD_SHORTCUTS.MARK_END:
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          handlers.onMarkEnd();
        }
        break;
      case KEYBOARD_SHORTCUTS.TOGGLE_OVERLAY:
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          handlers.onToggleOverlay();
        }
        break;
      case KEYBOARD_SHORTCUTS.CLOSE_PANEL:
        event.preventDefault();
        handlers.onClose();
        break;
    }
  };

  document.addEventListener('keydown', handleKeydown);

  // Add visual indication of keyboard shortcuts to buttons
  const markStartBtn = panel.querySelector(`#${UI_IDS.MARK_START}`);
  const markEndBtn = panel.querySelector(`#${UI_IDS.MARK_END}`);
  const overlayBtn = panel.querySelector(`#${UI_IDS.CUSTOM_ACTION_BTN}`);
  const closeBtn = panel.querySelector(`#${UI_IDS.CLOSE_BTN}`);

  if (markStartBtn) {
    addTooltip(markStartBtn, 'Mark shot start time (Ctrl+S)');
  }
  if (markEndBtn) {
    addTooltip(markEndBtn, 'Mark shot end time and save (Ctrl+E)');
  }
  if (overlayBtn) {
    addTooltip(overlayBtn, 'Toggle pose overlay (Ctrl+O)');
  }
  if (closeBtn) {
    addTooltip(closeBtn, 'Close panel (Esc)');
  }

  // Provide a cleanup function for removing the event listener
  panel._removeKeydownHandler = () => {
    removed = true;
    document.removeEventListener('keydown', handleKeydown);
    delete panel._removeKeydownHandler;
  };
}

/**
 * Sets up the panel close button
 * @param {HTMLElement} panel - The panel element
 * @param {Function} onClose - Callback function to execute on close
 */
export function setupCloseButton(panel, onClose) {
  const closeBtn = panel.querySelector(`#${UI_IDS.CLOSE_BTN}`);
  if (closeBtn) {
    // Enhanced hover effects
    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.background = 'rgba(255,255,255,0.3)';
      closeBtn.style.transform = 'scale(1.1)';
    });
    
    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.background = 'rgba(255,255,255,0.2)';
      closeBtn.style.transform = 'scale(1)';
    });
    
    closeBtn.onclick = () => {
      // Clean up keyboard event listener
      if (panel._removeKeydownHandler) {
        panel._removeKeydownHandler();
      }
      
      // Add closing animation
      panel.style.transform = 'scale(0.9)';
      panel.style.opacity = '0';
      
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent(EVENTS.POSE_OVERLAY_CONTROL, { 
          detail: { action: 'stop' } 
        }));
        panel.remove();
        if (onClose) onClose();
      }, 200);
    };
  }
}

/**
 * Sets up the overlay start/stop button
 * @param {HTMLElement} panel - The panel element
 */
export function setupOverlayButton(panel) {
  const customBtn = panel.querySelector(`#${UI_IDS.CUSTOM_ACTION_BTN}`);
  if (!customBtn) return;

  customBtn.innerHTML = '<span>👤</span> Start Pose Overlay';
  customBtn.dataset.state = 'stopped';
  
  customBtn.onclick = () => {
    if (customBtn.dataset.state === 'stopped') {
      showButtonLoading(customBtn, 'Starting...');
      window.dispatchEvent(new CustomEvent(EVENTS.POSE_OVERLAY_CONTROL, { 
        detail: { action: 'start' } 
      }));
      setTimeout(() => {
        hideButtonLoading(customBtn);
        customBtn.innerHTML = '<span>🛑</span> Stop Pose Overlay';
        customBtn.dataset.state = 'started';
        customBtn.classList.add('yt-shot-labeler-btn-danger');
      }, 500);
    } else {
      showButtonLoading(customBtn, 'Stopping...');
      window.dispatchEvent(new CustomEvent(EVENTS.POSE_OVERLAY_CONTROL, { 
        detail: { action: 'stop' } 
      }));
      setTimeout(() => {
        hideButtonLoading(customBtn);
        customBtn.innerHTML = '<span>👤</span> Start Pose Overlay';
        customBtn.dataset.state = 'stopped';
        customBtn.classList.remove('yt-shot-labeler-btn-danger');
      }, 300);
    }
  };
}