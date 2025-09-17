/**
 * Panel Core Management
 * 
 * This module handles the core panel lifecycle and coordination.
 * It manages panel creation, initialization, and integration of all features.
 * 
 * Key Features:
 * - Panel creation and lifecycle management
 * - Feature module coordination
 * - Shot data state management
 * - Panel toggle functionality
 */

import { formatDateTime, sanitize, getVideoTitle, addTooltip } from '../utils/ui-utils.js';
import { addResizeHandles } from '../features/resize.js';
import { addDragBehavior } from '../features/drag.js';
import { setupCSV } from '../csv.js';
import { setupGlossaryButtons } from '../glossary.js';
import { createPanelElement, stylePanelElement, setupScrollableBehavior } from './panel-ui.js';
import { setupShotMarkingButtons } from '../features/shot-marking.js';
import { setupKeyboardShortcuts } from '../features/keyboard-shortcuts.js';
import { 
  UI_IDS, 
  DEFAULT_SHOT, 
  EVENTS 
} from '../constants.js';

/**
 * Creates and initializes the main labeling panel
 * Sets up the complete UI with all sub-components and event handlers
 */
export function createLabelerPanel() {
  // Prevent duplicate panels
  if (document.getElementById(UI_IDS.PANEL)) return;

  // Initialize shot data
  let shots = [];
  let currentShot = { ...DEFAULT_SHOT };

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

  // Set up functionality modules
  setupPanelFunctionality(panel, shots, currentShot, updateStatus, updateShotList);

  // Set up CSV functionality
  setupCSV(panel, shots, updateShotList, videoUrl, sanitizedTitle);

  // Add to DOM and show with animation
  document.body.appendChild(panel);
  
  // Initialize tooltips
  addTooltip();
  
  // Show panel with entrance animation
  setTimeout(() => {
    panel.style.opacity = '1';
    panel.style.transform = 'scale(1) translateY(0)';
  }, 50);

  // Status update function
  function updateStatus(message, isError = false) {
    const statusElement = panel.querySelector(`#${UI_IDS.SHOT_STATUS}`);
    if (statusElement) {
      statusElement.textContent = message;
      statusElement.style.color = isError ? '#d32f2f' : '#2e7d32';
    }
  }

  // Shot list update function
  function updateShotList() {
    const listElement = panel.querySelector(`#${UI_IDS.LABEL_LIST}`);
    if (!listElement) return;

    if (shots.length === 0) {
      listElement.innerHTML = '<div style="color: #666; font-style: italic;">No shots labeled yet</div>';
      return;
    }

    listElement.innerHTML = shots.map((shot, index) => {
      const duration = shot.end ? (shot.end - shot.start).toFixed(1) : 'N/A';
      const label = shot.label || 'Unlabeled';
      
      return `
        <div class="shot-item" style="background:#f5f5f5;margin:4px 0;padding:8px;border-radius:4px;font-size:12px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>
              <strong>${label}</strong><br>
              ${shot.start}s - ${shot.end}s (${duration}s)
            </div>
            <button class="delete-shot" data-index="${index}" style="background:#f44336;color:white;border:none;border-radius:3px;padding:4px 8px;cursor:pointer;font-size:10px;" aria-label="Delete shot">Delete</button>
          </div>
        </div>
      `;
    }).join('');

    // Add delete functionality
    listElement.querySelectorAll('.delete-shot').forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.dataset.index);
        shots.splice(idx, 1);
        updateShotList();
      };
    });
  }
}

/**
 * Sets up all panel functionality including event handlers
 */
function setupPanelFunctionality(panel, shots, currentShot, updateStatus, updateShotList) {
  // Setup overlay toggle button
  setupOverlayButton(panel);
  
  // Setup shot marking buttons
  setupShotMarkingButtons(panel, currentShot, shots, updateStatus, updateShotList);
  
  // Setup glossary and dimension controls
  setupGlossaryButtons(panel, () => currentShot, updateStatus);
  
  // Setup close button
  setupCloseButton(panel);
  
  // Setup keyboard shortcuts
  setupKeyboardShortcuts(panel, currentShot, shots, updateStatus, updateShotList);
}

/**
 * Sets up the overlay start/stop button
 */
function setupOverlayButton(panel) {
  const customBtn = panel.querySelector(`#${UI_IDS.CUSTOM_ACTION_BTN}`);
  if (!customBtn) return;

  customBtn.onclick = () => {
    window.dispatchEvent(new CustomEvent(EVENTS.POSE_OVERLAY_CONTROL, {
      detail: { action: 'toggle' }
    }));
  };

  // Listen for overlay status updates
  const handleOverlayStatus = (event) => {
    const statusSpan = panel.querySelector(`#${UI_IDS.OVERLAY_STATUS}`);
    if (!statusSpan) return;

    const { isActive, message } = event.detail;
    statusSpan.textContent = message || (isActive ? 'Overlay Active' : 'Overlay Inactive');
    statusSpan.style.color = isActive ? '#2e7d32' : '#666';
    
    // Update button text
    const buttonText = customBtn.querySelector('span:last-child') || customBtn;
    if (isActive) {
      buttonText.textContent = buttonText.textContent.replace('Start', 'Stop').replace('Toggle', 'Stop');
    } else {
      buttonText.textContent = buttonText.textContent.replace('Stop', 'Toggle');
    }
  };

  window.addEventListener('poseOverlayStatus', handleOverlayStatus);

  // Cleanup listener when panel is removed
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        const removedNodes = Array.from(mutation.removedNodes);
        if (removedNodes.some(node => node === panel || node.contains?.(panel))) {
          window.removeEventListener('poseOverlayStatus', handleOverlayStatus);
          observer.disconnect();
        }
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * Sets up the panel close button
 */
function setupCloseButton(panel) {
  const closeBtn = panel.querySelector(`#${UI_IDS.CLOSE_BTN}`);
  if (!closeBtn) return;

  closeBtn.onclick = () => {
    panel.style.opacity = '0';
    panel.style.transform = 'scale(0.8) translateY(-20px)';
    
    setTimeout(() => {
      if (panel.parentNode) {
        panel.parentNode.removeChild(panel);
      }
    }, 300);
  };
}

/**
 * Toggles the panel visibility
 */
export function togglePanel() {
  const existingPanel = document.getElementById(UI_IDS.PANEL);
  
  if (existingPanel) {
    // Close existing panel
    const closeBtn = existingPanel.querySelector(`#${UI_IDS.CLOSE_BTN}`);
    if (closeBtn) closeBtn.click();
  } else {
    // Create new panel
    createLabelerPanel();
  }
}