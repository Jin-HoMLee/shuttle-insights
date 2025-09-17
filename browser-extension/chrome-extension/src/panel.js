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
  panel.setAttribute('aria-modal', 'true');
  
  // Detect system theme preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  panel.innerHTML = `
    <div id="${UI_IDS.HEADER}" style="
      background: var(--md-sys-color-primary-container); 
      color: var(--md-sys-color-on-primary-container); 
      margin: 0; 
      padding: var(--md-sys-shape-corner-large); 
      border-radius: var(--md-sys-shape-corner-large) var(--md-sys-shape-corner-large) 0 0;
      position: relative;
      overflow: hidden;
    ">
      <div style="position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: var(--md-sys-color-primary);"></div>
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--md-sys-shape-corner-small);">
        <div style="display: flex; align-items: center; gap: var(--md-sys-shape-corner-medium);">
          <div style="
            width: 32px; 
            height: 32px; 
            background: var(--md-sys-color-primary); 
            border-radius: var(--md-sys-shape-corner-small); 
            display: flex; 
            align-items: center; 
            justify-content: center;
            font-size: 16px;
            box-shadow: var(--md-sys-elevation-level1);
          ">🏸</div>
          <strong style="
            font-size: var(--md-sys-typescale-title-large-font-size); 
            font-weight: var(--md-sys-typescale-title-large-font-weight);
            line-height: var(--md-sys-typescale-title-large-line-height);
          ">YouTube Badminton Shot Labeler</strong>
        </div>
        <div style="display: flex; align-items: center; gap: var(--md-sys-shape-corner-small);">
          <button id="${UI_IDS.CLOSE_BTN}" class="yt-shot-labeler-tooltip" 
                  data-tooltip="Close panel (Esc)" 
                  aria-label="Close panel"
                  style="
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.2);
                    color: var(--md-sys-color-on-primary-container);
                    font-size: 18px;
                    cursor: pointer;
                    border-radius: var(--md-sys-shape-corner-extra-large);
                    padding: var(--md-sys-shape-corner-small);
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all var(--transition-fast);
                  ">✕</button>
        </div>
      </div>
      <div style="
        font-size: var(--md-sys-typescale-body-small-font-size);
        opacity: 0.8;
        font-weight: var(--md-sys-typescale-body-small-font-weight);
      ">Advanced badminton video analysis and shot labeling</div>
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
        <div class="${CSS_CLASSES.INFO}" style="font-size: var(--md-sys-typescale-body-small-font-size);">
          <details style="margin-bottom: var(--md-sys-shape-corner-small);">
            <summary style="cursor: pointer; font-weight: 500; padding: var(--md-sys-shape-corner-small); background: var(--md-sys-color-surface-container-low); border-radius: var(--md-sys-shape-corner-small); margin-bottom: var(--md-sys-shape-corner-small);">
              <b>🎯 Getting Started</b>
            </summary>
            <div style="padding-left: var(--md-sys-shape-corner-medium);">
              <div><b>1. Load Video:</b> Navigate to any YouTube video</div>
              <div><b>2. Mark Shots:</b> Use "Mark Start" → Select shot type → "Mark End & Save"</div>
              <div><b>3. Export Data:</b> Download your labeled data as CSV</div>
              <div style="margin-top: var(--md-sys-shape-corner-small); padding: var(--md-sys-shape-corner-small); background: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container); border-radius: var(--md-sys-shape-corner-small); font-size: var(--md-sys-typescale-body-small-font-size);">
                💡 <b>Tip:</b> Use pose overlay to better analyze player movements
              </div>
            </div>
          </details>
          
          <details style="margin-bottom: var(--md-sys-shape-corner-small);">
            <summary style="cursor: pointer; font-weight: 500; padding: var(--md-sys-shape-corner-small); background: var(--md-sys-color-surface-container-low); border-radius: var(--md-sys-shape-corner-small); margin-bottom: var(--md-sys-shape-corner-small);">
              <b>⌨️ Keyboard Shortcuts</b>
            </summary>
            <div style="padding-left: var(--md-sys-shape-corner-medium);">
              <div>• <kbd style="background: var(--md-sys-color-surface-container); padding: 2px 6px; border-radius: var(--md-sys-shape-corner-extra-small); font-family: monospace;">Ctrl+S</kbd> Mark start time</div>
              <div>• <kbd style="background: var(--md-sys-color-surface-container); padding: 2px 6px; border-radius: var(--md-sys-shape-corner-extra-small); font-family: monospace;">Ctrl+E</kbd> Mark end time & save</div>
              <div>• <kbd style="background: var(--md-sys-color-surface-container); padding: 2px 6px; border-radius: var(--md-sys-shape-corner-extra-small); font-family: monospace;">Ctrl+O</kbd> Toggle pose overlay</div>
              <div>• <kbd style="background: var(--md-sys-color-surface-container); padding: 2px 6px; border-radius: var(--md-sys-shape-corner-extra-small); font-family: monospace;">Esc</kbd> Close panel</div>
            </div>
          </details>
          
          <details>
            <summary style="cursor: pointer; font-weight: 500; padding: var(--md-sys-shape-corner-small); background: var(--md-sys-color-surface-container-low); border-radius: var(--md-sys-shape-corner-small); margin-bottom: var(--md-sys-shape-corner-small);">
              <b>🔒 Privacy & Permissions</b>
            </summary>
            <div style="padding-left: var(--md-sys-shape-corner-medium);">
              <div style="margin-bottom: var(--md-sys-shape-corner-small);">
                <div style="display: flex; align-items: center; gap: var(--md-sys-shape-corner-small); margin-bottom: 4px;">
                  <span style="color: var(--success-color);">✓</span>
                  <span><b>Local Processing:</b> All analysis runs in your browser</span>
                </div>
                <div style="display: flex; align-items: center; gap: var(--md-sys-shape-corner-small); margin-bottom: 4px;">
                  <span style="color: var(--success-color);">✓</span>
                  <span><b>No Data Collection:</b> Your videos and labels stay private</span>
                </div>
                <div style="display: flex; align-items: center; gap: var(--md-sys-shape-corner-small);">
                  <span style="color: var(--success-color);">✓</span>
                  <span><b>Minimal Permissions:</b> Only YouTube access required</span>
                </div>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  `;
  return panel;
}

/**
 * Applies Material Design 3 styling to the panel element
 */
function stylePanelElement(panel) {
  Object.assign(panel.style, {
    position: "fixed", 
    top: PANEL_CONFIG.DEFAULT_POSITION.top() + "px", 
    right: PANEL_CONFIG.DEFAULT_POSITION.right() + "px",
    width: PANEL_CONFIG.DEFAULT_SIZE.width() + "px",
    height: PANEL_CONFIG.DEFAULT_SIZE.height() + "px",
    maxWidth: PANEL_CONFIG.MAX_SIZE.width() + "px",
    maxHeight: PANEL_CONFIG.MAX_SIZE.height() + "px",
    minWidth: PANEL_CONFIG.MIN_SIZE.width() + "px",
    minHeight: PANEL_CONFIG.MIN_SIZE.height() + "px",
    zIndex: PANEL_CONFIG.Z_INDEX,
    background: "var(--md-sys-color-surface-container)", 
    border: "1px solid var(--md-sys-color-outline-variant)", 
    padding: "0",
    borderRadius: "var(--md-sys-shape-corner-large)", 
    boxShadow: "var(--md-sys-elevation-level3)", 
    fontSize: "var(--md-sys-typescale-body-medium-font-size)", 
    fontFamily: "'Roboto', 'Segoe UI', system-ui, -apple-system, sans-serif", 
    lineHeight: "var(--md-sys-typescale-body-medium-line-height)",
    userSelect: "none", 
    transition: "all var(--transition-emphasized)", 
    overflow: "hidden",
    backgroundClip: "padding-box", 
    display: "flex", 
    flexDirection: "column",
    resize: "none",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    color: "var(--md-sys-color-on-surface)",
    // Initial animation state
    opacity: "0",
    transform: "scale(0.9) translateY(8px)"
  });
  
  // Enhanced hover and focus effects with Material Design 3 principles
  panel.addEventListener('mouseenter', () => {
    panel.style.transform = 'translateY(-2px) scale(1)';
    panel.style.boxShadow = 'var(--md-sys-elevation-level4)';
  });
  
  panel.addEventListener('mouseleave', () => {
    panel.style.transform = 'translateY(0) scale(1)';
    panel.style.boxShadow = 'var(--md-sys-elevation-level3)';
  });
  
  // Add focus management for accessibility
  panel.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      const focusableElements = panel.querySelectorAll(
        'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  });
  
  // Set initial focus for accessibility
  setTimeout(() => {
    const firstButton = panel.querySelector('button');
    if (firstButton) {
      firstButton.focus();
    }
  }, 100);
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
