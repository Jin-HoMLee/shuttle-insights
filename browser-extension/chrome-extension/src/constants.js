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
  // New UI elements for coach workflow
  CUSTOM_LABELS_SECTION: 'custom-labels-section',
  CUSTOM_LABELS_LIST: 'custom-labels-list',
  ADD_CUSTOM_LABEL: 'add-custom-label',
  CUSTOM_LABEL_INPUT: 'custom-label-input',
  CONTEXT_FORM: 'context-form',
  PLAYER_INPUT: 'player-input',
  SCORE_INPUT: 'score-input',
  RALLY_SELECT: 'rally-select',
  NOTES_TEXTAREA: 'notes-textarea',
  QUICK_SHOTS: 'quick-shots'
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
  DIMENSION_BTN: 'yt-shot-labeler-dimension-btn',
  DIMENSION_BUTTONS: 'yt-shot-labeler-dimension-buttons',
  DELETE_BTN: 'yt-shot-labeler-delete',
  RESIZE_HANDLE: 'yt-shot-labeler-resize-handle',
  STATUS_MESSAGE: 'yt-shot-labeler-status-message',
  // New CSS classes for coach workflow
  QUICK_SHOT_BTN: 'yt-shot-labeler-quick-shot-btn',
  CUSTOM_LABEL_ITEM: 'yt-shot-labeler-custom-label-item',
  CONTEXT_FORM: 'yt-shot-labeler-context-form',
  FORM_ROW: 'yt-shot-labeler-form-row',
  FORM_INPUT: 'yt-shot-labeler-form-input',
  SHORTCUT_HINT: 'yt-shot-labeler-shortcut-hint'
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
  direction: null,
  // New fields for coach workflow
  player: null,
  score: null,
  rallyContext: null,
  coachingNotes: null
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
  'direction',
  // New coach workflow fields
  'player',
  'score',
  'rally_context',
  'coaching_notes'
];

// Chrome Extension Configuration
export const EXTENSION_CONFIG = {
  GLOSSARY_FILE: 'badminton_shots_glossary.json',
  CSV_DOWNLOAD_ACTION: 'download-csv',
  DEFAULT_CSV_PATH: 'YouTube Shot Labeler'
};

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  MARK_START: 'KeyS',
  MARK_END: 'KeyE', 
  TOGGLE_OVERLAY: 'KeyO',
  CLOSE_PANEL: 'Escape',
  // Quick shot selection shortcuts (1-9)
  SHOT_1: 'Digit1',
  SHOT_2: 'Digit2',
  SHOT_3: 'Digit3',
  SHOT_4: 'Digit4',
  SHOT_5: 'Digit5',
  SHOT_6: 'Digit6',
  SHOT_7: 'Digit7',
  SHOT_8: 'Digit8',
  SHOT_9: 'Digit9'
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

// Quick shot types for coaches (mapped to number keys 1-9)
export const QUICK_SHOT_TYPES = [
  { key: '1', label: 'Smash', description: 'Hard attacking shot' },
  { key: '2', label: 'Clear', description: 'High deep shot' },
  { key: '3', label: 'Drop', description: 'Soft shot to front court' },
  { key: '4', label: 'Drive', description: 'Fast horizontal shot' },
  { key: '5', label: 'Net Shot', description: 'Close to net shot' },
  { key: '6', label: 'Lift', description: 'Defensive lob shot' },
  { key: '7', label: 'Serve', description: 'Service shot' },
  { key: '8', label: 'Half Smash', description: 'Medium power attack' },
  { key: '9', label: 'Block', description: 'Defensive return' }
];

// Rally context options
export const RALLY_CONTEXTS = [
  'Opening rally',
  'Mid-rally',
  'Game point',
  'Set point',
  'Match point',
  'Service game',
  'Pressure situation'
];