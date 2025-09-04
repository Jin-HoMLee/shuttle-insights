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

import { formatDateTime, sanitize, getVideoTitle } from './ui-utils.js';
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
  EVENTS 
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
  panel.innerHTML = `
    <div id="${UI_IDS.HEADER}" class="${CSS_CLASSES.SECTION_TITLE}">
      <button id="${UI_IDS.CLOSE_BTN}" title="Close" style="float:right;background:transparent;border:none;font-size:18px;cursor:pointer;">×</button>
      <strong style="font-size:16px;">YouTube Badminton Shot Labeler</strong>
    </div>
    <div id="${UI_IDS.CONTENT}">
      <div class="${CSS_CLASSES.SECTION}">
        <div class="${CSS_CLASSES.SECTION_TITLE}">Video Details</div>
        <div class="${CSS_CLASSES.INFO}">
          <div><b>Date/Time:</b> <span id="${UI_IDS.DATETIME}">${dateTimeStr}</span></div>
          <div><b>Video Title:</b> <span id="${UI_IDS.VIDEO_TITLE}">${videoTitle}</span></div>
          <div style="max-width:310px;word-break:break-all;"><b>URL:</b> <span id="${UI_IDS.URL}">${videoUrl}</span></div>
        </div>
      </div>
      <div class="${CSS_CLASSES.SECTION}">
        <div class="${CSS_CLASSES.SECTION_TITLE}">Overlay Poses</div>
        <button id="${UI_IDS.CUSTOM_ACTION_BTN}" style="margin-bottom:10px;">Custom Action</button>
        <span id="${UI_IDS.OVERLAY_STATUS}" class="${CSS_CLASSES.STATUS_MESSAGE}"></span>
      </div>
      <hr>
      <div class="${CSS_CLASSES.SECTION}">
        <div class="${CSS_CLASSES.SECTION_TITLE}">Load Existing Labels</div>
        <button id="${UI_IDS.LOAD_CSV}" style="margin-bottom:10px;">Load existing CSV</button>
        <input type="file" id="${UI_IDS.CSV_FILE_INPUT}" accept=".csv" style="display:none;">
      </div>
      <hr>
      <div class="${CSS_CLASSES.SECTION}">
        <div class="${CSS_CLASSES.SECTION_TITLE}">Label a Shot</div>
        <div style="margin:8px 0;">
          <button id="${UI_IDS.MARK_START}">Mark Start</button>
          <span id="${UI_IDS.SHOT_STATUS}" style="margin-left:10px;"></span>
        </div>
        <div id="${UI_IDS.LABEL_BUTTONS}" style="margin-bottom:10px;"></div>
        <div id="${UI_IDS.DIMENSION_CONTROLS}" style="margin-bottom:10px;"></div>
        <button id="${UI_IDS.MARK_END}" style="margin-bottom:10px;">Mark End</button>
      </div>
      <hr>
      <div class="${CSS_CLASSES.SECTION}">
        <div class="${CSS_CLASSES.SECTION_TITLE}">Labeled Shots</div>
        <div id="${UI_IDS.LABEL_LIST}" style="max-height:120px;overflow:auto;font-size:13px;margin-bottom:10px;"></div>
      </div>
      <hr>
      <div class="${CSS_CLASSES.SECTION}">
        <div class="${CSS_CLASSES.SECTION_TITLE}">Export Labels</div>
        <button id="${UI_IDS.SAVE_LABELS}" style="margin-bottom:2px;">Download CSV</button>
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
    background: "#fff", 
    border: "1px solid #222", 
    padding: "0",
    borderRadius: "8px", 
    boxShadow: "0 4px 16px #0002", 
    width: PANEL_CONFIG.DEFAULT_SIZE.width,
    fontSize: "14px", 
    fontFamily: "Arial, sans-serif", 
    lineHeight: "1.5",
    userSelect: "none", 
    transition: "box-shadow 0.2s", 
    overflow: "hidden",
    backgroundClip: "padding-box", 
    display: "flex", 
    flexDirection: "column",
    maxHeight: "90vh", 
    minWidth: PANEL_CONFIG.DEFAULT_SIZE.minWidth, 
    minHeight: PANEL_CONFIG.DEFAULT_SIZE.minHeight, 
    resize: "none"
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
}

/**
 * Sets up the overlay start/stop button
 */
function setupOverlayButton(panel) {
  const customBtn = panel.querySelector(`#${UI_IDS.CUSTOM_ACTION_BTN}`);
  if (!customBtn) return;

  customBtn.textContent = 'Start Overlay';
  customBtn.dataset.state = 'stopped';
  
  customBtn.onclick = () => {
    if (customBtn.dataset.state === 'stopped') {
      window.dispatchEvent(new CustomEvent(EVENTS.POSE_OVERLAY_CONTROL, { 
        detail: { action: 'start' } 
      }));
      customBtn.textContent = 'Stop Overlay';
      customBtn.dataset.state = 'started';
    } else {
      window.dispatchEvent(new CustomEvent(EVENTS.POSE_OVERLAY_CONTROL, { 
        detail: { action: 'stop' } 
      }));
      customBtn.textContent = 'Start Overlay';
      customBtn.dataset.state = 'stopped';
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
      if (!video) return;
      currentShot.start = video.currentTime;
      updateStatus();
    };
  }

  // Mark End button
  const markEndBtn = panel.querySelector(`#${UI_IDS.MARK_END}`);
  if (markEndBtn) {
    markEndBtn.onclick = () => {
      const video = getVideo();
      if (!video) return;
      
      // Validation
      if (currentShot.start === null) {
        alert("Please mark the start first!");
        return;
      }
      if (!currentShot.label) {
        alert("Please select a shot label!");
        return;
      }
      
      currentShot.end = video.currentTime;
      if (currentShot.end <= currentShot.start) {
        alert("End time must be after start time!");
        return;
      }
      
      // Save current shot and reset
      shots.push({ ...currentShot });
      updateShotList();
      
      // Reset current shot
      Object.assign(currentShot, DEFAULT_SHOT);
      updateStatus();
      
      // Re-render glossary buttons for fresh state
      setupGlossaryButtons(panel, () => currentShot, updateStatus);
    };
  }
}

/**
 * Sets up the panel close button
 */
function setupCloseButton(panel) {
  const closeBtn = panel.querySelector(`#${UI_IDS.CLOSE_BTN}`);
  if (closeBtn) {
    closeBtn.onclick = () => {
      window.dispatchEvent(new CustomEvent(EVENTS.POSE_OVERLAY_CONTROL, { 
        detail: { action: 'stop' } 
      }));
      panel.remove();
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
