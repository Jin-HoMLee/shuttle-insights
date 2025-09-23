/**
 * CSV Management (Modular Compatibility)
 * 
 * This module maintains compatibility for CSV functionality while using the new modular structure.
 * 
 * The CSV functionality has been split into focused modules:
 * - csv-import.js: Import functionality and parsing logic
 * - csv-export.js: Export functionality and generation logic
 * - csv-utils.js: Shared utilities (parsing, escaping, validation)
 * 
 * This file now serves as a compatibility layer, re-exporting the main functions
 * from the specialized modules.
 * 
 * CSV Format:
 * - Headers: video_url, shot_id, start_sec, end_sec, label, longitudinal_position, 
 *           lateral_position, timing, intention, impact, direction
 * - Supports quoted fields with comma escaping
 * - Handles both basic shot data and advanced dimension annotations
 */

import { setupCSVImport } from './features/csv-import.js';
import { setupCSVExport } from './features/csv-export.js';

/**
 * Sets up CSV import and export functionality for the panel
 * 
 * @param {HTMLElement} panel - The main panel element containing CSV controls
 * @param {Array} shots - Reference to the shots array for data manipulation
 * @param {Function} updateShotList - Callback to refresh the shot list display
 * @param {string} videoUrl - Current video URL for export metadata
 * @param {string} sanitizedTitle - Sanitized video title for filename
 */
export function setupCSV(panel, shots, updateShotList, videoUrl, sanitizedTitle) {
  setupCSVImport(panel, shots, updateShotList);
  setupCSVExport(panel, shots, videoUrl, sanitizedTitle);
}


