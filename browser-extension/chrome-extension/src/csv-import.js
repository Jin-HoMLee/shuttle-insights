/**
 * CSV Import Functionality
 * 
 * Handles the import of shot labeling data from CSV files.
 * Manages file selection, parsing, and data validation for import operations.
 */

import { showError, showSuccess } from './ui-utils.js';
import { mapCSVColumns, parseCSVRow, extractShotFromRow, validateCSVFormat } from './csv-utils.js';

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
 * Parses CSV content and extracts shot data
 * 
 * @param {string} csvText - Raw CSV text content
 * @returns {Array} Array of parsed shot objects
 * @throws {Error} If CSV format is invalid
 */
function parseCSVContent(csvText) {
  const lines = validateCSVFormat(csvText);
  
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