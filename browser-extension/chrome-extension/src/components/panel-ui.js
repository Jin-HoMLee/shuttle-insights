/**
 * Panel UI Creation
 * 
 * This module handles the creation of the main panel DOM structure and styling.
 * It focuses purely on UI creation and layout without business logic.
 * 
 * Key Features:
 * - Panel DOM element creation
 * - Panel styling and layout
 * - Scrollable behavior setup
 */

import { 
  UI_IDS, 
  CSS_CLASSES, 
  PANEL_CONFIG 
} from '../constants.js';

/**
 * Creates the main panel DOM element with HTML structure
 */
export function createPanelElement(dateTimeStr, videoTitle, videoUrl) {
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
        <div class="${CSS_CLASSES.SECTION_TITLE}">🎥 Pose Overlay</div>
        <button id="${UI_IDS.CUSTOM_ACTION_BTN}" class="yt-shot-labeler-btn yt-shot-labeler-tooltip" 
                data-tooltip="Toggle pose detection overlay on/off" aria-label="Toggle pose overlay">
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
        <div class="${CSS_CLASSES.INFO}">
          <button id="${UI_IDS.MARK_START}" class="yt-shot-labeler-btn yt-shot-labeler-tooltip" 
                  data-tooltip="Mark current video time as shot start" aria-label="Mark shot start">
            <span>▶️</span> Mark Start
          </button>
          <button id="${UI_IDS.MARK_END}" class="yt-shot-labeler-btn yt-shot-labeler-tooltip" 
                  data-tooltip="Mark current video time as shot end and save" aria-label="Mark shot end">
            <span>⏹️</span> Mark End & Save
          </button>
        </div>
        <div id="${UI_IDS.SHOT_STATUS}" class="${CSS_CLASSES.STATUS_MESSAGE}"></div>
      </div>
      <div class="${CSS_CLASSES.SECTION}">
        <div class="${CSS_CLASSES.SECTION_TITLE}">🏆 Shot Types</div>
        <div id="${UI_IDS.LABEL_BUTTONS}"></div>
      </div>
      <div class="${CSS_CLASSES.SECTION}">
        <div class="${CSS_CLASSES.SECTION_TITLE}">🎯 Shot Dimensions</div>
        <div id="${UI_IDS.DIMENSION_CONTROLS}"></div>
      </div>
      <div class="${CSS_CLASSES.SECTION}">
        <div class="${CSS_CLASSES.SECTION_TITLE}">📋 Current Labels</div>
        <div id="${UI_IDS.LABEL_LIST}" class="${CSS_CLASSES.LABEL_LIST}"></div>
      </div>
      <div class="${CSS_CLASSES.SECTION}">
        <div class="${CSS_CLASSES.SECTION_TITLE}">💾 Export Data</div>
        <button id="${UI_IDS.SAVE_LABELS}" class="yt-shot-labeler-btn yt-shot-labeler-tooltip" 
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
          <div>1. Mark start → 2. Mark end → 3. Select shot type → 4. Download CSV</div>
        </div>
      </div>
    </div>`;
  
  return panel;
}

/**
 * Applies styling to the panel element
 */
export function stylePanelElement(panel) {
  const styles = {
    position: 'fixed',
    top: PANEL_CONFIG.DEFAULT_POSITION.top,
    right: PANEL_CONFIG.DEFAULT_POSITION.right,
    width: PANEL_CONFIG.DEFAULT_SIZE.width,
    minWidth: PANEL_CONFIG.DEFAULT_SIZE.minWidth,
    minHeight: PANEL_CONFIG.DEFAULT_SIZE.minHeight,
    maxWidth: `${PANEL_CONFIG.MAX_SIZE.width()}px`,
    maxHeight: `${PANEL_CONFIG.MAX_SIZE.height()}px`,
    backgroundColor: '#ffffff',
    border: '2px solid #1976d2',
    borderRadius: '8px',
    boxShadow: '0 8px 32px rgba(25, 118, 210, 0.3), 0 4px 16px rgba(0, 0, 0, 0.1)',
    zIndex: PANEL_CONFIG.Z_INDEX,
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '14px',
    transition: 'opacity 0.3s ease, transform 0.3s ease',
    resize: 'both',
    overflow: 'hidden'
  };

  Object.assign(panel.style, styles);
}

/**
 * Sets up scrollable behavior for panel content
 */
export function setupScrollableBehavior(panel) {
  const content = panel.querySelector(`#${UI_IDS.CONTENT}`);
  if (!content) return;

  const observer = new MutationObserver(() => {
    const header = panel.querySelector(`#${UI_IDS.HEADER}`);
    const headerHeight = header ? header.offsetHeight : 0;
    const availableHeight = panel.clientHeight - headerHeight;
    
    content.style.maxHeight = `${availableHeight}px`;
    content.style.overflowY = 'auto';
    content.style.padding = '16px';
  });
  observer.observe(panel, { childList: true, subtree: true });
}