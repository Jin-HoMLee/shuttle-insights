/**
 * Panel Templates
 * 
 * Contains HTML templates and template strings for the panel UI.
 * This module isolates the large HTML templates from the main panel logic.
 */

import { UI_IDS, CSS_CLASSES } from './constants.js';
import { SVG_ICONS } from './utils/ui/svg-icons.js';
import { t } from './utils/i18n-manager.js';

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
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 20px;">${SVG_ICONS.SHUTTLECOCK}</span>
        <strong style="font-size: 16px; font-weight: 600;">${t('app.title')}</strong>
      </div>
      <div style="float: right; display: flex; gap: 8px; align-items: center;">
        <button id="${UI_IDS.LANGUAGE_SELECTOR}" class="yt-shot-labeler-tooltip yt-shot-labeler-language-selector" data-tooltip="${t('ui.language_selector_tooltip')}" aria-label="${t('ui.language_selector_aria')}">🇺🇸</button>
        <button id="${UI_IDS.THEME_TOGGLE}" class="yt-shot-labeler-tooltip yt-shot-labeler-theme-toggle" data-tooltip="${t('ui.toggle_theme')}" aria-label="${t('aria_labels.toggle_theme')}">🌙</button>
        <button id="${UI_IDS.CLOSE_BTN}" class="yt-shot-labeler-tooltip yt-shot-labeler-close-btn" data-tooltip="${t('tooltips.close_panel')}" aria-label="${t('aria_labels.close_panel')}">×</button>
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
      <div class="${CSS_CLASSES.SECTION_TITLE}">${SVG_ICONS.CHART} ${t('sections.video_details')}</div>
      <div class="${CSS_CLASSES.INFO}">
        <div><b>${t('labels.date_time')}</b> <span id="${UI_IDS.DATETIME}">${dateTimeStr}</span></div>
        <div><b>${t('labels.video_title')}</b> <span id="${UI_IDS.VIDEO_TITLE}">${videoTitle}</span></div>
        <div style="max-width:310px;word-break:break-all;"><b>${t('labels.url')}</b> <span id="${UI_IDS.URL}">${videoUrl}</span></div>
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
      <div class="${CSS_CLASSES.SECTION_TITLE}">${SVG_ICONS.TARGET} ${t('sections.pose_overlay')}</div>
      <button id="${UI_IDS.CUSTOM_ACTION_BTN}" class="yt-shot-labeler-btn yt-shot-labeler-tooltip" 
              data-tooltip="${t('tooltips.toggle_pose_overlay')}" aria-label="${t('aria_labels.toggle_pose_overlay')}">
        <span>${SVG_ICONS.USER}</span> ${t('buttons.toggle_pose_overlay')}
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
      <div class="${CSS_CLASSES.SECTION_TITLE}">${SVG_ICONS.FOLDER} ${t('sections.load_data')}</div>
      <button id="${UI_IDS.LOAD_CSV}" class="yt-shot-labeler-btn yt-shot-labeler-tooltip" 
              data-tooltip="${t('tooltips.load_csv')}" aria-label="${t('aria_labels.load_csv')}">
        <span>${SVG_ICONS.FOLDER_OPEN}</span> ${t('buttons.load_csv')}
      </button>
      <input type="file" id="${UI_IDS.CSV_FILE_INPUT}" accept=".csv" style="display:none;" aria-label="${t('aria_labels.csv_file_input')}">
    </div>
  `;
}

/**
 * Label shot section template
 */
function getLabelShotSection() {
  return `
    <div class="${CSS_CLASSES.SECTION}">
      <div class="${CSS_CLASSES.SECTION_TITLE}">${SVG_ICONS.VIDEO} ${t('sections.label_shot')}</div>
      <div style="margin:12px 0; display: flex; align-items: center; gap: 12px;">
        <button id="${UI_IDS.MARK_START}" class="yt-shot-labeler-btn yt-shot-labeler-btn-primary yt-shot-labeler-tooltip" 
                data-tooltip="${t('tooltips.mark_start')}" aria-label="${t('aria_labels.mark_start')}">
          <span>${SVG_ICONS.PLAY}</span> ${t('buttons.mark_start')}
        </button>
        <span id="${UI_IDS.SHOT_STATUS}" style="flex: 1;"></span>
      </div>
      <div id="${UI_IDS.LABEL_BUTTONS}" style="margin-bottom:12px;"></div>
      <div id="${UI_IDS.DIMENSION_CONTROLS}" style="margin-bottom:12px;"></div>
      <button id="${UI_IDS.MARK_END}" class="yt-shot-labeler-btn yt-shot-labeler-btn-success yt-shot-labeler-tooltip" 
              data-tooltip="${t('tooltips.mark_end_save')}" aria-label="${t('aria_labels.mark_end_save')}">
        <span>${SVG_ICONS.STOP_SQUARE}</span> ${t('buttons.mark_end_save')}
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
      <div class="${CSS_CLASSES.SECTION_TITLE}">${SVG_ICONS.CLIPBOARD} ${t('sections.labeled_shots')}</div>
      <div id="${UI_IDS.LABEL_LIST}" style="max-height:120px;overflow:auto;font-size:13px;margin-bottom:12px;" 
           role="list" aria-label="${t('aria_labels.labeled_shots_list')}"></div>
    </div>
  `;
}

/**
 * Export section template
 */
function getExportSection() {
  return `
    <div class="${CSS_CLASSES.SECTION}">
      <div class="${CSS_CLASSES.SECTION_TITLE}">${SVG_ICONS.SAVE} ${t('sections.export')}</div>
      <button id="${UI_IDS.SAVE_LABELS}" class="yt-shot-labeler-btn yt-shot-labeler-btn-success yt-shot-labeler-tooltip" 
              data-tooltip="${t('tooltips.download_csv')}" aria-label="${t('aria_labels.download_csv')}">
        <span>${SVG_ICONS.DOWNLOAD}</span> ${t('buttons.download_csv')}
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
      <div class="${CSS_CLASSES.SECTION_TITLE}">${SVG_ICONS.HELP} ${t('sections.quick_help')}</div>
      <div class="${CSS_CLASSES.INFO}" style="font-size: 12px;">
        <div><b>${t('help.keyboard_shortcuts')}</b></div>
        <div>• ${t('help.ctrl_s')}</div>
        <div>• ${t('help.ctrl_e')}</div>
        <div>• ${t('help.ctrl_o')}</div>
        <div>• ${t('help.esc')}</div>
        <div style="margin-top: 8px;"><b>${t('help.workflow')}</b></div>
        <div>${t('help.workflow_steps')}</div>
      </div>
    </div>
  `;
}