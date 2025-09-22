/**
 * CSV Export Functionality
 * 
 * Handles the export of shot labeling data to CSV files.
 * Manages CSV generation, formatting, and download operations.
 */

import { CSV_HEADERS, EXTENSION_CONFIG } from './constants.js';
import { showError, showSuccess } from './ui-utils.js';
import { escapeCSVField } from './csv-utils.js';

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
    if (!shots.length) {
      showError('No labels to save!', panel);
      return;
    }
    
    try {
      const csvContent = generateCSVContent(shots, videoUrl);
      downloadCSV(csvContent, sanitizedTitle);
      showSuccess(`Exported ${shots.length} shots to CSV`, panel);
      
    } catch (error) {
      console.error('CSV export failed:', error);
      showError(`Failed to export CSV: ${error.message}`, panel);
    }
  };
}

/**
 * Generates CSV content from shots array
 * 
 * @param {Array} shots - Array of shot objects
 * @param {string} videoUrl - Video URL for metadata
 * @returns {string} CSV content string
 */
export function generateCSVContent(shots, videoUrl) {
  let csv = CSV_HEADERS.join(',') + '\n';
  
  shots.forEach((shot, index) => {
    const row = [
      escapeCSVField(videoUrl),
      index + 1,
      shot.start,
      shot.end,
      escapeCSVField(shot.label || ''),
      escapeCSVField(shot.longitudinalPosition || ''),
      escapeCSVField(shot.lateralPosition || ''),
      escapeCSVField(shot.timing || ''),
      escapeCSVField(shot.intention || ''),
      escapeCSVField(shot.impact || ''),
      escapeCSVField(shot.direction || '')
    ];
    
    csv += row.join(',') + '\n';
  });
  
  return csv;
}

/**
 * Downloads CSV content as a file
 * 
 * @param {string} csvContent - CSV content to download
 * @param {string} sanitizedTitle - Base filename
 */
export function downloadCSV(csvContent, sanitizedTitle) {
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const reader = new FileReader();
  
  reader.onload = () => {
    chrome.runtime.sendMessage({
      action: EXTENSION_CONFIG.CSV_DOWNLOAD_ACTION,
      filename: `${EXTENSION_CONFIG.DEFAULT_CSV_PATH}/${sanitizedTitle}/labeled_shots.csv`,
      dataUrl: reader.result
    });
  };
  
  reader.readAsDataURL(blob);
}