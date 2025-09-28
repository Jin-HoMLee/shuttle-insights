/**
 * Constants and configuration values for the YouTube Badminton Shot Labeler
 * Centralizes magic strings, IDs, and configuration to improve maintainability
 */

// UI Element IDs
export const UI_IDS = {
  PANEL: 'yt-shot-labeler-panel',
  OVERLAY_CANVAS: 'pose-overlay-canvas',
  OVERLAY_STATUS: 'overlay-status',
  MARK_START: 'mark-start',
  MARK_END: 'mark-end',
  SHOT_STATUS: 'shot-status',
  LABEL_BUTTONS: 'label-buttons',
  DIMENSION_CONTROLS: 'dimension-controls',
  LABEL_LIST: 'label-list',
  SAVE_LABELS: 'save-labels',
  LOAD_CSV: 'load-csv',
  CSV_FILE_INPUT: 'csv-file-input',
  CUSTOM_ACTION_BTN: 'custom-action-btn',
  HEADER: 'yt-shot-labeler-header',
  CLOSE_BTN: 'yt-shot-labeler-close',
  CONTENT: 'yt-shot-labeler-content',
  DATETIME: 'yt-shot-labeler-datetime',
  VIDEO_TITLE: 'yt-shot-labeler-videotitle',
  URL: 'yt-shot-labeler-url',
  DATA_TOOLTIP: 'data-tooltip', 
  THEME_TOGGLE: 'yt-shot-labeler-theme-toggle'
};

// CSS Classes
export const CSS_CLASSES = {
  SECTION: 'yt-shot-labeler-section',
  SECTION_TITLE: 'yt-shot-labeler-section-title',
  INFO: 'yt-shot-labeler-info',
  LABEL_BTN: 'yt-shot-labeler-label-btn',
  CATEGORY_SECTION: 'yt-shot-labeler-category-section',
  CATEGORY_TITLE: 'yt-shot-labeler-category-title',
  DIMENSION_SECTION: 'yt-shot-labeler-dimension-section',
  DIMENSION_LABEL: 'yt-shot-labeler-dimension-label',
  DIMENSION_BTN: 'yt-shot-labeler-dimension-btn',
  DIMENSION_BUTTONS: 'yt-shot-labeler-dimension-buttons',
  DELETE_BTN: 'yt-shot-labeler-delete',
  RESIZE_HANDLE: 'yt-shot-labeler-resize-handle',
  TOOLTIP: 'yt-shot-labeler-tooltip',
  STATUS_MESSAGE: 'yt-shot-labeler-status-message'
};

// YouTube Video Selectors
export const VIDEO_SELECTORS = {
  MAIN_VIDEO: 'html5-main-video',
  PLAYER: '.html5-video-player',
  TITLE_SELECTORS: [
    'h1.title',
    'h1.ytd-watch-metadata',
    '.title.style-scope.ytd-video-primary-info-renderer'
  ]
};

// Panel Configuration
export const PANEL_CONFIG = {
  DEFAULT_POSITION: { top: '80px', right: '40px' },
  DEFAULT_SIZE: { width: '360px', minWidth: '320px', minHeight: '200px' },
  MAX_SIZE: {
    width: () => window.innerWidth * 0.98,
    height: () => window.innerHeight * 0.98
  },
  MIN_SIZE: { width: 280, height: 200 },
  Z_INDEX: 99999
};

// Pose Detection Configuration
export const POSE_CONFIG = {
  CONFIDENCE_THRESHOLD: 0.2,
  MAX_POSES: 6,
  OVERLAY_Z_INDEX: 10000
};

// Event Names
export const EVENTS = {
  POSE_OVERLAY_CONTROL: 'pose-overlay-control',
  TOGGLE_PANEL: 'toggle-panel'
};

// Default Shot Structure
export const DEFAULT_SHOT = {
  start: null,
  end: null,
  label: null,
  longitudinalPosition: null,
  lateralPosition: null,
  timing: null,
  intention: null,
  impact: null,
  direction: null
};

// CSV Headers
export const CSV_HEADERS = [
  'video_url',
  'shot_id', 
  'start_sec',
  'end_sec',
  'label',
  'longitudinal_position',
  'lateral_position',
  'timing',
  'intention',
  'impact',
  'direction'
];

// Chrome Extension Configuration
export const EXTENSION_CONFIG = {
  GLOSSARY_FILE: 'assets/badminton_shots_glossary.json',
  CSV_DOWNLOAD_ACTION: 'download-csv',
  DEFAULT_CSV_PATH: 'YouTube Shot Labeler'
};

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  MARK_START: 'KeyS',
  MARK_END: 'KeyE', 
  TOGGLE_OVERLAY: 'KeyO',
  CLOSE_PANEL: 'Escape'
};

// UI Configuration
export const UI_CONFIG = {
  ANIMATION_DURATION: 300,
  TOAST_DURATION: 3000,
  TOOLTIP_DELAY: 500,
  BUTTON_FEEDBACK_DURATION: 150
};

// Maximum allowed shot duration in seconds (5 minutes)
export const MAX_SHOT_DURATION_SECONDS = 300;