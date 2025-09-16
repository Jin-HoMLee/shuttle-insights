/**
 * CSV Import/Export Functionality
 * 
 * This module handles the import and export of shot labeling data in CSV format.
 * It supports loading existing labels from CSV files and exporting current labels
 * for analysis or backup purposes.
 * 
 * CSV Format:
 * - Headers: video_url, shot_id, start_sec, end_sec, label, longitudinal_position, 
 *           lateral_position, timing, intention, impact, direction
 * - Supports quoted fields with comma escaping
 * - Handles both basic shot data and advanced dimension annotations
 */

import { CSV_HEADERS, EXTENSION_CONFIG } from './constants.js';
import { showError, showSuccess } from './ui-utils.js';

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

/**
 * Sets up CSV import functionality
 * 
 * @param {HTMLElement} panel - The main panel element
 * @param {Array} shots - Reference to shots array to populate
 * @param {Function} updateShotList - Callback to refresh display after import
 */
function setupCSVImport(panel, shots, updateShotList) {
  const loadBtn = panel.querySelector('#load-csv');
  const fileInput = panel.querySelector('#csv-file-input');
  
  if (!loadBtn || !fileInput) {
    console.warn('CSV import elements not found');
    return;
  }
  
  // Trigger file picker when load button is clicked
  loadBtn.onclick = () => fileInput.click();
  
  // Handle file selection and processing
  fileInput.onchange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedShots = parseCSVContent(e.target.result);
        
        // Replace current shots with imported data
        shots.length = 0;
        shots.push(...importedShots);
        
        updateShotList();
        showSuccess(`Imported ${importedShots.length} shots from CSV`, panel);
        
      } catch (error) {
        console.error('CSV import failed:', error);
        showError(`Failed to import CSV: ${error.message}`, panel);
      }
    };
    
    reader.onerror = () => {
      showError('Failed to read CSV file', panel);
    };
    
    reader.readAsText(file);
  };
}

/**
 * Sets up CSV export functionality
 * 
 * @param {HTMLElement} panel - The main panel element
 * @param {Array} shots - Array of shot data to export
 * @param {string} videoUrl - Current video URL for metadata
 * @param {string} sanitizedTitle - Sanitized video title for filename
 */
function setupCSVExport(panel, shots, videoUrl, sanitizedTitle) {
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
 * Parses CSV content and extracts shot data
 * 
 * @param {string} csvText - Raw CSV text content
 * @returns {Array} Array of parsed shot objects
 * @throws {Error} If CSV format is invalid
 */
function parseCSVContent(csvText) {
  const lines = csvText.trim().split('\n');
  
  if (lines.length < 2) {
    throw new Error('CSV file must contain headers and at least one data row');
  }
  
  const headers = lines[0].split(',').map(header => header.trim());
  
  // Find column indices for required and optional fields
  const columnIndices = mapCSVColumns(headers);
  
  const shots = [];
  
  // Process each data row
  lines.slice(1).forEach((line, index) => {
    try {
      const parsedRow = parseCSVRow(line);
      const shot = extractShotFromRow(parsedRow, columnIndices);
      
      if (shot) {
        shots.push(shot);
      }
    } catch (error) {
      console.warn(`Skipping invalid row ${index + 2}: ${error.message}`);
    }
  });
  
  return shots;
}

/**
 * Maps CSV headers to column indices
 * 
 * @param {Array} headers - Array of header strings
 * @returns {Object} Object mapping field names to column indices
 */
function mapCSVColumns(headers) {
  return {
    start: headers.indexOf('start_sec'),
    end: headers.indexOf('end_sec'),
    label: headers.indexOf('label'),
    longitudinalPosition: headers.indexOf('longitudinal_position'),
    lateralPosition: headers.indexOf('lateral_position'),
    timing: headers.indexOf('timing'),
    intention: headers.indexOf('intention'),
    impact: headers.indexOf('impact'),
    direction: headers.indexOf('direction'),
    // New coach workflow fields
    player: headers.indexOf('player'),
    score: headers.indexOf('score'),
    rallyContext: headers.indexOf('rally_context'),
    coachingNotes: headers.indexOf('coaching_notes')
  };
}

/**
 * Parses a single CSV row, handling quoted fields and commas
 * 
 * @param {string} line - CSV row string
 * @returns {Array} Array of parsed field values
 */
function parseCSVRow(line) {
  const fields = [];
  let currentField = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      fields.push(currentField);
      currentField = '';
    } else {
      currentField += char;
    }
  }
  
  // Add the last field
  fields.push(currentField);
  
  return fields;
}

/**
 * Extracts shot object from parsed CSV row
 * 
 * @param {Array} fields - Array of field values
 * @param {Object} indices - Column index mapping
 * @returns {Object|null} Shot object or null if invalid
 */
function extractShotFromRow(fields, indices) {
  // Validate required fields
  if (indices.start < 0 || indices.end < 0 || indices.label < 0) {
    throw new Error('Required columns (start_sec, end_sec, label) not found');
  }
  
  const startTime = parseFloat(fields[indices.start]);
  const endTime = parseFloat(fields[indices.end]);
  const label = cleanFieldValue(fields[indices.label]);
  
  // Validate time values
  if (isNaN(startTime) || isNaN(endTime) || !label) {
    return null;
  }
  
  const shot = {
    start: startTime,
    end: endTime,
    label: label
  };
  
  // Add optional dimension fields if present
  const dimensionFields = [
    'longitudinalPosition', 'lateralPosition', 'timing', 
    'intention', 'impact', 'direction'
  ];
  
  dimensionFields.forEach(field => {
    const index = indices[field];
    if (index >= 0 && fields[index]) {
      shot[field] = cleanFieldValue(fields[index]) || null;
    }
  });
  
  // Add new coach workflow fields if present
  const coachFields = ['player', 'score', 'rallyContext', 'coachingNotes'];
  
  coachFields.forEach(field => {
    const index = indices[field];
    if (index >= 0 && fields[index]) {
      shot[field] = cleanFieldValue(fields[index]) || null;
    }
  });
  
  return shot;
}

/**
 * Generates CSV content from shots array
 * 
 * @param {Array} shots - Array of shot objects
 * @param {string} videoUrl - Video URL for metadata
 * @returns {string} CSV content string
 */
function generateCSVContent(shots, videoUrl) {
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
      escapeCSVField(shot.direction || ''),
      // New coach workflow fields
      escapeCSVField(shot.player || ''),
      escapeCSVField(shot.score || ''),
      escapeCSVField(shot.rallyContext || ''),
      escapeCSVField(shot.coachingNotes || '')
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
function downloadCSV(csvContent, sanitizedTitle) {
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

/**
 * Cleans and unquotes a CSV field value
 * 
 * @param {string} value - Raw field value
 * @returns {string} Cleaned field value
 */
function cleanFieldValue(value) {
  if (!value) return '';
  return value.replace(/^"|"$/g, '').trim();
}

/**
 * Escapes a field value for CSV output
 * 
 * @param {string} value - Field value to escape
 * @returns {string} Escaped and quoted field value
 */
function escapeCSVField(value) {
  if (!value) return '""';
  const escaped = value.toString().replace(/"/g, '""');
  return `"${escaped}"`;
}
