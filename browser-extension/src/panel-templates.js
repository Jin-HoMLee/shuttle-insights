/**
 * Panel Templates
 * 
 * Contains HTML templates and template strings for the panel UI.
 * This module isolates the large HTML templates from the main panel logic.
 * Updated to use Material Design 3 components.
 */

import { UI_IDS, CSS_CLASSES } from './constants.js';
import { initializeMaterial3 } from './material3-imports.js';

/**
 * Main panel HTML template
 * @param {string} dateTimeStr - Formatted date/time string
 * @param {string} videoTitle - Title of the video
 * @param {string} videoUrl - URL of the video
 * @returns {string} Complete HTML template for the panel
 */
export function getPanelTemplate(dateTimeStr, videoTitle, videoUrl) {
  // Initialize Material 3 theme
  initializeMaterial3();
  
  return `
    <div id="${UI_IDS.HEADER}" class="${CSS_CLASSES.SECTION_TITLE}" style="background: linear-gradient(135deg, #1976d2, #42a5f5); color: white; margin: 0; padding: 16px; border-radius: 8px 8px 0 0;">
      <md-icon-button id="${UI_IDS.CLOSE_BTN}" class="yt-shot-labeler-tooltip" data-tooltip="Close panel" aria-label="Close panel" 
                      style="float:right; --md-icon-button-icon-color: white; --md-icon-button-state-layer-color: rgba(255,255,255,0.12);">
        ×
      </md-icon-button>
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 20px;">🏸</span>
        <strong style="font-size: 16px; font-weight: 600;">YouTube Badminton Shot Labeler</strong>
      </div>
    </div>
    <div id="${UI_IDS.CONTENT}">
      ${getVideoDetailsSection(dateTimeStr, videoTitle, videoUrl)}
      ${getPoseOverlaySection()}
      ${getLoadDataSection()}
      ${getLabelShotSection()}
      ${getLabeledShotsSection()}
      ${getExportSection()}
      ${getQuickHelpSection()}
    </div>
  `;
}

/**
 * Video details section template
 */
function getVideoDetailsSection(dateTimeStr, videoTitle, videoUrl) {
  return `
    <div class="${CSS_CLASSES.SECTION}">
      <div class="${CSS_CLASSES.SECTION_TITLE}">📊 Video Details</div>
      <div class="${CSS_CLASSES.INFO}" style="background: var(--md-sys-color-surface-variant); padding: 12px; border-radius: 8px; border: 1px solid var(--md-sys-color-outline);">
        <div style="margin-bottom: 8px;"><b>Date/Time:</b> <span id="${UI_IDS.DATETIME}">${dateTimeStr}</span></div>
        <div style="margin-bottom: 8px;"><b>Video Title:</b> <span id="${UI_IDS.VIDEO_TITLE}">${videoTitle}</span></div>
        <div style="max-width:310px;word-break:break-all;"><b>URL:</b> <span id="${UI_IDS.URL}">${videoUrl}</span></div>
      </div>
    </div>
  `;
}

/**
 * Pose overlay section template
 */
function getPoseOverlaySection() {
  return `
    <div class="${CSS_CLASSES.SECTION}">
      <div class="${CSS_CLASSES.SECTION_TITLE}">🎯 Pose Overlay</div>
      <md-filled-button id="${UI_IDS.CUSTOM_ACTION_BTN}" class="yt-shot-labeler-tooltip" 
                        data-tooltip="Toggle pose detection overlay on video" aria-label="Toggle pose overlay">
        👤 Toggle Pose Overlay
      </md-filled-button>
      <span id="${UI_IDS.OVERLAY_STATUS}" class="${CSS_CLASSES.STATUS_MESSAGE}"></span>
    </div>
  `;
}

/**
 * Load data section template
 */
function getLoadDataSection() {
  return `
    <div class="${CSS_CLASSES.SECTION}">
      <div class="${CSS_CLASSES.SECTION_TITLE}">📂 Load Data</div>
      <md-outlined-button id="${UI_IDS.LOAD_CSV}" class="yt-shot-labeler-tooltip" 
                          data-tooltip="Load previously saved shot labels from CSV file" aria-label="Load existing CSV">
        📁 Load Existing CSV
      </md-outlined-button>
      <input type="file" id="${UI_IDS.CSV_FILE_INPUT}" accept=".csv" style="display:none;" aria-label="CSV file input">
    </div>
  `;
}

/**
 * Label shot section template
 */
function getLabelShotSection() {
  return `
    <div class="${CSS_CLASSES.SECTION}">
      <div class="${CSS_CLASSES.SECTION_TITLE}">🎬 Label Shot</div>
      <div style="margin:12px 0; display: flex; align-items: center; gap: 12px;">
        <md-filled-button id="${UI_IDS.MARK_START}" class="yt-shot-labeler-tooltip" 
                          data-tooltip="Mark the start time of a badminton shot" aria-label="Mark shot start">
          ▶️ Mark Start
        </md-filled-button>
        <span id="${UI_IDS.SHOT_STATUS}" style="flex: 1;"></span>
      </div>
      <div id="${UI_IDS.LABEL_BUTTONS}" style="margin-bottom:12px;"></div>
      <div id="${UI_IDS.DIMENSION_CONTROLS}" style="margin-bottom:12px;"></div>
      <md-filled-button id="${UI_IDS.MARK_END}" class="yt-shot-labeler-tooltip" 
                        data-tooltip="Mark the end time and save the labeled shot" aria-label="Mark shot end and save"
                        style="--md-filled-button-container-color: var(--md-sys-color-tertiary); --md-filled-button-label-text-color: var(--md-sys-color-on-tertiary);">
        ⏹️ Mark End & Save
      </md-filled-button>
    </div>
  `;
}

/**
 * Labeled shots section template
 */
function getLabeledShotsSection() {
  return `
    <div class="${CSS_CLASSES.SECTION}">
      <div class="${CSS_CLASSES.SECTION_TITLE}">📋 Labeled Shots</div>
      <div id="${UI_IDS.LABEL_LIST}" style="max-height:120px;overflow:auto;font-size:13px;margin-bottom:12px;" 
           role="list" aria-label="List of labeled shots"></div>
    </div>
  `;
}

/**
 * Export section template
 */
function getExportSection() {
  return `
    <div class="${CSS_CLASSES.SECTION}">
      <div class="${CSS_CLASSES.SECTION_TITLE}">💾 Export</div>
      <md-filled-button id="${UI_IDS.SAVE_LABELS}" class="yt-shot-labeler-tooltip" 
                        data-tooltip="Download all labeled shots as CSV file" aria-label="Download CSV file"
                        style="--md-filled-button-container-color: var(--md-sys-color-tertiary); --md-filled-button-label-text-color: var(--md-sys-color-on-tertiary);">
        ⬇️ Download CSV
      </md-filled-button>
    </div>
  `;
}

/**
 * Quick help section template
 */
function getQuickHelpSection() {
  return `
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
  `;
}