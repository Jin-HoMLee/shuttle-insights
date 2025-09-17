/**
 * CSV Export Feature
 * 
 * This module handles the export of shot labeling data to CSV format.
 * It generates properly formatted CSV content and triggers downloads.
 * 
 * Key Features:
 * - CSV content generation
 * - Field escaping and formatting
 * - File download triggers
 * - Filename generation
 */

import { CSV_HEADERS, EXTENSION_CONFIG } from '../constants.js';
import { showSuccess, showWarning, showError } from '../utils/ui-utils.js';
import { generateCSVContent, downloadCSV } from '../utils/csv-parser.js';

/**
 * Sets up CSV export functionality
 * 
 * @param {HTMLElement} panel - The main panel element
 * @param {Array} shots - Array of shot data to export
 * @param {string} videoUrl - Current video URL for metadata
 * @param {string} sanitizedTitle - Sanitized video title for filename
 */
export function setupCSVExport(panel, shots, videoUrl, sanitizedTitle) {
  const saveBtn = panel.querySelector('#save-labels');
  
  if (!saveBtn) {
    console.warn('CSV export button not found');
    return;
  }
  
  saveBtn.onclick = () => {
    if (shots.length === 0) {
      showWarning('No shots to export');
      return;
    }
    
    try {
      const csvContent = generateCSVContent(shots, videoUrl);
      downloadCSV(csvContent, sanitizedTitle);
      showSuccess(`Exported ${shots.length} shot(s) to CSV`);
      
    } catch (error) {
      console.error('CSV export error:', error);
      showError(`Failed to export CSV: ${error.message}`);
    }
  };
}

/**
 * Generates filename for CSV export
 */
export function generateCSVFilename(sanitizedTitle, timestamp = new Date()) {
  const dateStr = timestamp.toISOString().split('T')[0]; // YYYY-MM-DD format
  const timeStr = timestamp.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS format
  
  const baseFilename = sanitizedTitle || 'badminton_shots';
  return `${baseFilename}_${dateStr}_${timeStr}.csv`;
}

/**
 * Validates shot data before export
 */
export function validateShotsForExport(shots) {
  const errors = [];
  
  shots.forEach((shot, index) => {
    if (!shot.start && shot.start !== 0) {
      errors.push(`Shot ${index + 1}: Missing start time`);
    }
    
    if (!shot.end && shot.end !== 0) {
      errors.push(`Shot ${index + 1}: Missing end time`);
    }
    
    if (shot.start >= shot.end) {
      errors.push(`Shot ${index + 1}: Invalid time range`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
}