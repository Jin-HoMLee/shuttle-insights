/**
 * Panel Templates
 * 
 * Contains HTML templates and template strings for the panel UI.
 * This module isolates the large HTML templates from the main panel logic.
 */

import { UI_IDS, CSS_CLASSES } from './constants.js';
import { SVG_ICONS } from './utils/ui/svg-icons.js';

/**
 * Main panel HTML template
 * @param {string} dateTimeStr - Formatted date/time string
 * @param {string} videoTitle - Title of the video
 * @param {string} videoUrl - URL of the video
 * @returns {string} Complete HTML template for the panel
 */
export function getPanelTemplate(dateTimeStr, videoTitle, videoUrl) {
  return `
    <div id="${UI_IDS.HEADER}" class="${CSS_CLASSES.SECTION_TITLE}" style="background: linear-gradient(135deg, #1976d2, #42a5f5); color: white; margin: 0; padding: 16px; border-radius: 8px 8px 0 0;">
      <button id="${UI_IDS.CLOSE_BTN}" class="yt-shot-labeler-tooltip" data-tooltip="Close panel" aria-label="Close panel" 
              style="float:right;background:rgba(255,255,255,0.2);border:none;color:white;font-size:18px;cursor:pointer;border-radius:4px;padding:4px 8px;transition:background 0.2s;">×</button>
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 20px;">${SVG_ICONS.SHUTTLECOCK}</span>
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
      <div class="${CSS_CLASSES.SECTION_TITLE}">${SVG_ICONS.CHART} Video Details</div>
      <div class="${CSS_CLASSES.INFO}">
        <div><b>Date/Time:</b> <span id="${UI_IDS.DATETIME}">${dateTimeStr}</span></div>
        <div><b>Video Title:</b> <span id="${UI_IDS.VIDEO_TITLE}">${videoTitle}</span></div>
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
      <div class="${CSS_CLASSES.SECTION_TITLE}">${SVG_ICONS.TARGET} Pose Overlay</div>
      <button id="${UI_IDS.CUSTOM_ACTION_BTN}" class="yt-shot-labeler-btn yt-shot-labeler-tooltip" 
              data-tooltip="Toggle pose detection overlay on video" aria-label="Toggle pose overlay">
        <span>${SVG_ICONS.USER}</span> Toggle Pose Overlay
      </button>
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
      <div class="${CSS_CLASSES.SECTION_TITLE}">${SVG_ICONS.FOLDER} Load Data</div>
      <button id="${UI_IDS.LOAD_CSV}" class="yt-shot-labeler-btn yt-shot-labeler-tooltip" 
              data-tooltip="Load previously saved shot labels from CSV file" aria-label="Load existing CSV">
        <span>${SVG_ICONS.FOLDER_OPEN}</span> Load Existing CSV
      </button>
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
      <div class="${CSS_CLASSES.SECTION_TITLE}">${SVG_ICONS.VIDEO} Label Shot</div>
      <div style="margin:12px 0; display: flex; align-items: center; gap: 12px;">
        <button id="${UI_IDS.MARK_START}" class="yt-shot-labeler-btn yt-shot-labeler-btn-primary yt-shot-labeler-tooltip" 
                data-tooltip="Mark the start time of a badminton shot" aria-label="Mark shot start">
          <span>${SVG_ICONS.PLAY}</span> Mark Start
        </button>
        <span id="${UI_IDS.SHOT_STATUS}" style="flex: 1;"></span>
      </div>
      <div id="${UI_IDS.LABEL_BUTTONS}" style="margin-bottom:12px;"></div>
      <div id="${UI_IDS.DIMENSION_CONTROLS}" style="margin-bottom:12px;"></div>
      <button id="${UI_IDS.MARK_END}" class="yt-shot-labeler-btn yt-shot-labeler-btn-success yt-shot-labeler-tooltip" 
              data-tooltip="Mark the end time and save the labeled shot" aria-label="Mark shot end and save">
        <span>${SVG_ICONS.STOP_SQUARE}</span> Mark End & Save
      </button>
    </div>
  `;
}

/**
 * Labeled shots section template
 */
function getLabeledShotsSection() {
  return `
    <div class="${CSS_CLASSES.SECTION}">
      <div class="${CSS_CLASSES.SECTION_TITLE}">${SVG_ICONS.CLIPBOARD} Labeled Shots</div>
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
      <div class="${CSS_CLASSES.SECTION_TITLE}">${SVG_ICONS.SAVE} Export</div>
      <button id="${UI_IDS.SAVE_LABELS}" class="yt-shot-labeler-btn yt-shot-labeler-btn-success yt-shot-labeler-tooltip" 
              data-tooltip="Download all labeled shots as CSV file" aria-label="Download CSV file">
        <span>${SVG_ICONS.DOWNLOAD}</span> Download CSV
      </button>
    </div>
  `;
}

/**
 * Quick help section template
 */
function getQuickHelpSection() {
  return `
    <div class="${CSS_CLASSES.SECTION}">
      <div class="${CSS_CLASSES.SECTION_TITLE}">${SVG_ICONS.HELP} Quick Help</div>
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