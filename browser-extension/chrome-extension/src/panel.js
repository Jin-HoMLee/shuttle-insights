/**
 * Panel Management
 * 
 * This module handles the creation and management of the main labeling panel UI.
 * It coordinates between different UI components and manages the shot labeling workflow.
 * 
 * Key Features:
 * - Panel creation and lifecycle management
 * - Shot data management and state updates
 * - Integration with CSV, glossary, drag, and resize functionality
 * - Event handling for shot marking and labeling
 */

import { formatDateTime, sanitize, getVideoTitle, addTooltip, showButtonLoading, hideButtonLoading, showWarning, showSuccess } from './ui-utils.js';
import { getVideo } from './video-utils.js';
import { addResizeHandles } from './resize.js';
import { addDragBehavior } from './drag.js';
import { setupCSV } from './csv.js';
import { setupGlossaryButtons } from './glossary.js';
import { 
  UI_IDS, 
  CSS_CLASSES, 
  PANEL_CONFIG, 
  DEFAULT_SHOT, 
  EVENTS,
  KEYBOARD_SHORTCUTS 
} from './constants.js';

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
  setupCSV(panel, shots, updateShotList, videoUrl, sanitizedTitle);

  // Add panel to DOM
  document.body.appendChild(panel);

  // Trigger entrance animation
  setTimeout(() => {
    panel.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
    panel.style.opacity = '1';
    panel.style.transform = 'scale(1) translateY(0)';
  }, 16);

  // Initialize display
  updateStatus();

  /**
   * Updates the current shot status display
   */
  function updateStatus() {
    const status = panel.querySelector(`#${UI_IDS.SHOT_STATUS}`);
    if (!status) return;

    const dimensions = [];
    if (currentShot.longitudinalPosition) dimensions.push(`Pos: ${currentShot.longitudinalPosition}`);
    if (currentShot.timing) dimensions.push(`Time: ${currentShot.timing}`);
    if (currentShot.intention) dimensions.push(`Intent: ${currentShot.intention}`);
    
    const dimensionText = dimensions.length > 0 ? ` | ${dimensions.join(' | ')}` : '';
    status.textContent = `Start: ${currentShot.start !== null ? currentShot.start.toFixed(2) + 's' : "-"} | End: ${currentShot.end !== null ? currentShot.end.toFixed(2) + 's' : "-"} | Label: ${currentShot.label ?? '-'}${dimensionText}`;
  }

  /**
   * Updates the shot list display
   */
  function updateShotList() {
    const listDiv = panel.querySelector(`#${UI_IDS.LABEL_LIST}`);
    if (!listDiv) return;

    listDiv.innerHTML = shots.length === 0
      ? `<div style="color:#999;">No shots labeled yet.</div>`
      : shots.map((shot, i) => {
          const dimensions = [];
          if (shot.intention) dimensions.push(shot.intention);
          if (shot.longitudinalPosition) dimensions.push(shot.longitudinalPosition);
          
          const dimensionText = dimensions.length > 0 ? ` (${dimensions.join(', ')})` : '';
          
          return `<div style="display:flex;align-items:center;gap:6px;">
            <div style="flex:1;">#${i + 1}: <b>${shot.label}</b>${dimensionText} [${shot.start.toFixed(2)}s - ${shot.end.toFixed(2)}s]</div>
            <button title="Delete" class="${CSS_CLASSES.DELETE_BTN}" data-index="${i}" style="background:transparent;border:none;cursor:pointer;font-size:15px;">🗑️</button>
          </div>`;
        }).join("");
        
    // Add delete functionality
    listDiv.querySelectorAll(`.${CSS_CLASSES.DELETE_BTN}`).forEach(btn => {
      btn.onclick = function () {
        const idx = parseInt(btn.getAttribute('data-index'));
        shots.splice(idx, 1);
        updateShotList();
      };
    });
  }
}

/**
 * Creates the main panel DOM element with HTML structure
 */
function createPanelElement(dateTimeStr, videoTitle, videoUrl) {
  const panel = document.createElement('div');
  panel.id = UI_IDS.PANEL;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'YouTube Badminton Shot Labeler');
  panel.innerHTML = `
    <div id="${UI_IDS.HEADER}" class="${CSS_CLASSES.SECTION_TITLE}" style="background: linear-gradient(135deg, #1976d2, #42a5f5); color: white; margin: 0; padding: 16px; border-radius: 8px 8px 0 0;">
      <button id="${UI_IDS.CLOSE_BTN}" class="yt-shot-labeler-tooltip" data-tooltip="Close panel" aria-label="Close panel" 
              style="float:right;background:rgba(255,255,255,0.2);border:none;color:white;font-size:18px;cursor:pointer;border-radius:4px;padding:4px 8px;transition:background 0.2s;">×</button>
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 20px;">🏸</span>
        <strong style="font-size: 16px; font-weight: 600;">YouTube Badminton Shot Labeler</strong>
      </div>
    </div>
    <div id="${UI_IDS.CONTENT}">
      <div class="${CSS_CLASSES.SECTION}">
        <div class="${CSS_CLASSES.SECTION_TITLE}">📊 Video Details</div>
        <div class="${CSS_CLASSES.INFO}">
          <div><b>Date/Time:</b> <span id="${UI_IDS.DATETIME}">${dateTimeStr}</span></div>
          <div><b>Video Title:</b> <span id="${UI_IDS.VIDEO_TITLE}">${videoTitle}</span></div>
          <div style="max-width:310px;word-break:break-all;"><b>URL:</b> <span id="${UI_IDS.URL}">${videoUrl}</span></div>
        </div>
      </div>
      <div class="${CSS_CLASSES.SECTION}">
        <div class="${CSS_CLASSES.SECTION_TITLE}">🎯 Pose Overlay</div>
        <button id="${UI_IDS.CUSTOM_ACTION_BTN}" class="yt-shot-labeler-btn yt-shot-labeler-tooltip" 
                data-tooltip="Toggle pose detection overlay on video" aria-label="Toggle pose overlay">
          <span>👤</span> Toggle Pose Overlay
        </button>
        <span id="${UI_IDS.OVERLAY_STATUS}" class="${CSS_CLASSES.STATUS_MESSAGE}"></span>
      </div>
      <div class="${CSS_CLASSES.SECTION}">
        <div class="${CSS_CLASSES.SECTION_TITLE}">📂 Load Data</div>
        <button id="${UI_IDS.LOAD_CSV}" class="yt-shot-labeler-btn yt-shot-labeler-tooltip" 
                data-tooltip="Load previously saved shot labels from CSV file" aria-label="Load existing CSV">
          <span>📁</span> Load Existing CSV
        </button>
        <input type="file" id="${UI_IDS.CSV_FILE_INPUT}" accept=".csv" style="display:none;" aria-label="CSV file input">
      </div>
      <div class="${CSS_CLASSES.SECTION}">
        <div class="${CSS_CLASSES.SECTION_TITLE}">🎬 Label Shot</div>
        <div style="margin:12px 0; display: flex; align-items: center; gap: 12px;">
          <button id="${UI_IDS.MARK_START}" class="yt-shot-labeler-btn yt-shot-labeler-btn-primary yt-shot-labeler-tooltip" 
                  data-tooltip="Mark the start time of a badminton shot" aria-label="Mark shot start">
            <span>▶️</span> Mark Start
          </button>
          <span id="${UI_IDS.SHOT_STATUS}" style="flex: 1;"></span>
        </div>
        <div id="${UI_IDS.LABEL_BUTTONS}" style="margin-bottom:12px;"></div>
        <div id="${UI_IDS.DIMENSION_CONTROLS}" style="margin-bottom:12px;"></div>
        <button id="${UI_IDS.MARK_END}" class="yt-shot-labeler-btn yt-shot-labeler-btn-success yt-shot-labeler-tooltip" 
                data-tooltip="Mark the end time and save the labeled shot" aria-label="Mark shot end and save">
          <span>⏹️</span> Mark End & Save
        </button>
      </div>
      <div class="${CSS_CLASSES.SECTION}">
        <div class="${CSS_CLASSES.SECTION_TITLE}">📋 Labeled Shots</div>
        <div id="${UI_IDS.LABEL_LIST}" style="max-height:120px;overflow:auto;font-size:13px;margin-bottom:12px;" 
             role="list" aria-label="List of labeled shots"></div>
      </div>
      <div class="${CSS_CLASSES.SECTION}">
        <div class="${CSS_CLASSES.SECTION_TITLE}">💾 Export</div>
        <button id="${UI_IDS.SAVE_LABELS}" class="yt-shot-labeler-btn yt-shot-labeler-btn-success yt-shot-labeler-tooltip" 
                data-tooltip="Download all labeled shots as CSV file" aria-label="Download CSV file">
          <span>⬇️</span> Download CSV
        </button>
      </div>
      <div class="${CSS_CLASSES.SECTION}">
        <div class="${CSS_CLASSES.SECTION_TITLE}">❓ Quick Help</div>
        <div class="${CSS_CLASSES.INFO}" style="font-size: 12px;">
          <div><b>Keyboard Shortcuts:</b></div>
          <div>• Ctrl+S: Mark start time</div>
          <div>• Ctrl+E: Mark end time & save</div>
          <div>• Ctrl+O: Toggle pose overlay</div>
          <div>• Esc: Close panel</div>
          <div style="margin-top: 8px;"><b>Workflow:</b></div>
          <div>1. Mark shot start → 2. Select shot type → 3. Mark end & save</div>
        </div>
      </div>
    </div>
  `;
  return panel;
}

/**
 * Applies styling to the panel element
 */
function stylePanelElement(panel) {
  Object.assign(panel.style, {
    position: "fixed", 
    top: PANEL_CONFIG.DEFAULT_POSITION.top, 
    right: PANEL_CONFIG.DEFAULT_POSITION.right, 
    zIndex: PANEL_CONFIG.Z_INDEX,
    background: "white", 
    border: "1px solid var(--border-color)", 
    padding: "0",
    borderRadius: "12px", 
    boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)", 
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
    panel.style.boxShadow = '0 12px 40px rgba(0,0,0,0.16), 0 4px 12px rgba(0,0,0,0.12)';
  });
  
  panel.addEventListener('mouseleave', () => {
    panel.style.transform = 'translateY(0)';
    panel.style.boxShadow = '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)';
  });
}

/**
 * Sets up scrollable behavior for panel content
 */
function setupScrollableBehavior(panel) {
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

/**
 * Sets up shot start/end marking buttons
 */
function setupShotMarkingButtons(panel, currentShot, shots, updateStatus, updateShotList) {
  // Mark Start button
  const markStartBtn = panel.querySelector(`#${UI_IDS.MARK_START}`);
  if (markStartBtn) {
    markStartBtn.onclick = () => {
      const video = getVideo();
      if (!video) {
        showWarning('Video not found. Please reload the page.', panel);
        return;
      }
      
      // Add visual feedback
      markStartBtn.style.transform = 'scale(0.95)';
      currentShot.start = video.currentTime;
      updateStatus();
      
      // Success feedback
      const originalContent = markStartBtn.innerHTML;
      markStartBtn.innerHTML = '<span>✅</span> Start Marked';
      markStartBtn.classList.add('yt-shot-labeler-btn-success');
      
      setTimeout(() => {
        markStartBtn.innerHTML = originalContent;
        markStartBtn.classList.remove('yt-shot-labeler-btn-success');
        markStartBtn.style.transform = '';
      }, 1000);
    };
  }

  // Mark End button
  const markEndBtn = panel.querySelector(`#${UI_IDS.MARK_END}`);
  if (markEndBtn) {
    markEndBtn.onclick = () => {
      const video = getVideo();
      if (!video) {
        showWarning('Video not found. Please reload the page.', panel);
        return;
      }
      
      // Validation with better error messages
      if (currentShot.start === null) {
        showWarning("Please mark the start time first!", panel);
        markStartBtn.style.animation = 'pulse 0.5s ease-in-out';
        setTimeout(() => { markStartBtn.style.animation = ''; }, 500);
        return;
      }
      if (!currentShot.label) {
        showWarning("Please select a shot type first!", panel);
        const labelButtons = panel.querySelector('#label-buttons');
        if (labelButtons) {
          labelButtons.style.animation = 'pulse 0.5s ease-in-out';
          setTimeout(() => { labelButtons.style.animation = ''; }, 500);
        }
        return;
      }
      
      currentShot.end = video.currentTime;
      if (currentShot.end <= currentShot.start) {
        showWarning("End time must be after start time!", panel);
        return;
      }
      
      // Show loading state
      showButtonLoading(markEndBtn, 'Saving...');
      
      // Simulate processing time for smooth UX
      setTimeout(() => {
        // Save current shot and reset
        shots.push({ ...currentShot });
        updateShotList();
        
        // Reset current shot
        Object.assign(currentShot, DEFAULT_SHOT);
        updateStatus();
        
        // Success feedback
        hideButtonLoading(markEndBtn);
        showSuccess(`Shot labeled successfully! (${shots.length} total shots)`, panel);
        
        // Re-render glossary buttons for fresh state
        setupGlossaryButtons(panel, () => currentShot, updateStatus);
      }, 300);
    };
  }
}

/**
 * Sets up keyboard shortcuts for the panel
 */
function setupKeyboardShortcuts(panel, currentShot, shots, updateStatus, updateShotList) {
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
 */
function setupCloseButton(panel) {
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
      }, 200);
    };
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
