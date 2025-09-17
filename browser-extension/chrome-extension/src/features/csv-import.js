/**
 * CSV Import Feature
 * 
 * This module handles the import of shot labeling data from CSV files.
 * It supports parsing CSV content and populating the shots array.
 * 
 * Key Features:
 * - File selection and reading
 * - CSV parsing with header mapping
 * - Data validation and error handling
 * - Shot array population
 */

import { CSV_HEADERS } from '../constants.js';
import { showError, showSuccess, showWarning } from '../utils/ui-utils.js';
import { parseCSVContent, mapCSVColumns, parseCSVRow, extractShotFromRow } from '../utils/csv-parser.js';

/**
 * Sets up CSV import functionality
 * 
 * @param {HTMLElement} panel - The main panel element
 * @param {Array} shots - Reference to shots array to populate
 * @param {Function} updateShotList - Callback to refresh display after import
 */
export function setupCSVImport(panel, shots, updateShotList) {
  const loadBtn = panel.querySelector('#load-csv');
  const fileInput = panel.querySelector('#csv-file-input');
  
  if (!loadBtn || !fileInput) {
    console.warn('CSV import elements not found');
    return;
  }
  
  // Trigger file picker when load button is clicked
  loadBtn.onclick = () => fileInput.click();
  
  // Handle file selection and parsing
  fileInput.onchange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.csv')) {
      showError('Please select a CSV file');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target.result;
        const importedShots = parseCSVContent(csvText);
        
        if (importedShots.length === 0) {
          showError('No valid shots found in CSV file');
          return;
        }
        
        // Clear existing shots and add imported ones
        shots.length = 0;
        shots.push(...importedShots);
        
        updateShotList();
        showSuccess(`Imported ${importedShots.length} shot(s) from CSV`);
        
      } catch (error) {
        console.error('CSV import error:', error);
        showError(`Failed to import CSV: ${error.message}`);
      }
    };
    
    reader.onerror = () => {
      showError('Failed to read file');
    };
    
    reader.readAsText(file);
    
    // Reset file input for next use
    fileInput.value = '';
  };
}

/**
 * Validates imported shot data
 */
export function validateImportedShot(shot) {
  const errors = [];
  
  if (typeof shot.start !== 'number' || shot.start < 0) {
    errors.push('Invalid start time');
  }
  
  if (typeof shot.end !== 'number' || shot.end < 0) {
    errors.push('Invalid end time');
  }
  
  if (shot.start >= shot.end) {
    errors.push('End time must be after start time');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}