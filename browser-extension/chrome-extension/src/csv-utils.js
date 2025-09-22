/**
 * CSV Utilities
 * 
 * Shared utilities for CSV parsing, validation, and field handling.
 * This module contains common functions used by both import and export modules.
 */

import { CSV_HEADERS } from './constants.js';

/**
 * Maps CSV headers to column indices
 * 
 * @param {Array} headers - Array of header strings
 * @returns {Object} Object mapping field names to column indices
 */
export function mapCSVColumns(headers) {
  return {
    start: headers.indexOf('start_sec'),
    end: headers.indexOf('end_sec'),
    label: headers.indexOf('label'),
    longitudinalPosition: headers.indexOf('longitudinal_position'),
    lateralPosition: headers.indexOf('lateral_position'),
    timing: headers.indexOf('timing'),
    intention: headers.indexOf('intention'),
    impact: headers.indexOf('impact'),
    direction: headers.indexOf('direction')
  };
}

/**
 * Parses a single CSV row, handling quoted fields and commas
 * 
 * @param {string} line - CSV row string
 * @returns {Array} Array of parsed field values
 */
export function parseCSVRow(line) {
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
export function extractShotFromRow(fields, indices) {
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
  
  return shot;
}

/**
 * Cleans and unquotes a CSV field value
 * 
 * @param {string} value - Raw field value
 * @returns {string} Cleaned field value
 */
export function cleanFieldValue(value) {
  if (!value) return '';
  return value.replace(/^"|"$/g, '').trim();
}

/**
 * Escapes a field value for CSV output
 * 
 * @param {string} value - Field value to escape
 * @returns {string} Escaped and quoted field value
 */
export function escapeCSVField(value) {
  if (!value) return '""';
  const escaped = value.toString().replace(/"/g, '""');
  return `"${escaped}"`;
}

/**
 * Validates CSV format and structure
 * 
 * @param {string} csvText - Raw CSV text content
 * @throws {Error} If CSV format is invalid
 */
export function validateCSVFormat(csvText) {
  const lines = csvText.trim().split('\n');
  
  if (lines.length < 2) {
    throw new Error('CSV file must contain headers and at least one data row');
  }
  
  return lines;
}