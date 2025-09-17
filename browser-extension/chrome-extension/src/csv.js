/**
 * CSV Import/Export - Legacy Compatibility
 * 
 * This module provides backward compatibility for existing imports while
 * delegating functionality to the new modular components.
 * 
 * The CSV functionality has been split into:
 * - features/csv-import.js - CSV import functionality
 * - features/csv-export.js - CSV export functionality
 * - utils/csv-parser.js - CSV parsing utilities
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