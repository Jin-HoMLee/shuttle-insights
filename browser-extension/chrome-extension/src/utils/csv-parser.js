/**
 * CSV Parser Utilities
 * 
 * This module provides utilities for parsing and generating CSV content.
 * It handles the low-level CSV format operations and data transformations.
 * 
 * Key Features:
 * - CSV content parsing
 * - Header mapping and validation
 * - Field escaping and unescaping
 * - Row parsing with quoted field support
 */

import { CSV_HEADERS } from '../constants.js';

/**
 * Parses CSV content and extracts shot data
 * 
 * @param {string} csvText - Raw CSV content
 * @returns {Array} Array of shot objects
 */
export function parseCSVContent(csvText) {
  const lines = csvText.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    throw new Error('CSV must contain at least a header and one data row');
  }
  
  const headers = parseCSVRow(lines[0]);
  const columnIndices = mapCSVColumns(headers);
  const shots = [];
  
  for (let i = 1; i < lines.length; i++) {
    try {
      const fields = parseCSVRow(lines[i]);
      const shot = extractShotFromRow(fields, columnIndices);
      
      if (shot.start !== null && shot.end !== null) {
        shots.push(shot);
      }
    } catch (error) {
      console.warn(`Skipping invalid row ${i + 1}: ${error.message}`);
    }
  }
  
  return shots;
}

/**
 * Maps CSV column headers to array indices
 * 
 * @param {Array} headers - Array of header strings
 * @returns {Object} Mapping of field names to column indices
 */
export function mapCSVColumns(headers) {
  const indices = {};
  
  headers.forEach((header, index) => {
    const trimmedHeader = header.trim().toLowerCase();
    
    // Map common variations to standard field names
    const fieldMapping = {
      'video_url': 'videoUrl',
      'shot_id': 'shotId',
      'start_sec': 'start',
      'end_sec': 'end',
      'label': 'label',
      'longitudinal_position': 'longitudinalPosition',
      'lateral_position': 'lateralPosition',
      'timing': 'timing',
      'intention': 'intention',
      'impact': 'impact',
      'direction': 'direction'
    };
    
    if (fieldMapping[trimmedHeader]) {
      indices[fieldMapping[trimmedHeader]] = index;
    }
  });
  
  return indices;
}

/**
 * Parses a single CSV row handling quoted fields
 * 
 * @param {string} line - CSV row string
 * @returns {Array} Array of field values
 */
export function parseCSVRow(line) {
  const fields = [];
  let currentField = '';
  let inQuotes = false;
  let i = 0;
  
  while (i < line.length) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        currentField += '"';
        i += 2;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      fields.push(currentField.trim());
      currentField = '';
      i++;
    } else {
      currentField += char;
      i++;
    }
  }
  
  // Add the last field
  fields.push(currentField.trim());
  
  return fields;
}

/**
 * Extracts shot data from parsed CSV row
 * 
 * @param {Array} fields - Array of field values
 * @param {Object} indices - Column index mapping
 * @returns {Object} Shot object
 */
export function extractShotFromRow(fields, indices) {
  const shot = {
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
  
  // Extract start time
  if (indices.start !== undefined && fields[indices.start]) {
    const startValue = parseFloat(fields[indices.start]);
    if (!isNaN(startValue)) {
      shot.start = startValue;
    }
  }
  
  // Extract end time
  if (indices.end !== undefined && fields[indices.end]) {
    const endValue = parseFloat(fields[indices.end]);
    if (!isNaN(endValue)) {
      shot.end = endValue;
    }
  }
  
  // Extract string fields
  const stringFields = ['label', 'longitudinalPosition', 'lateralPosition', 'timing', 'intention', 'impact', 'direction'];
  stringFields.forEach(field => {
    if (indices[field] !== undefined && fields[indices[field]]) {
      shot[field] = cleanFieldValue(fields[indices[field]]);
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
 * Triggers CSV file download
 * 
 * @param {string} csvContent - CSV content to download
 * @param {string} sanitizedTitle - Base filename
 */
export function downloadCSV(csvContent, sanitizedTitle) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', generateFilename(sanitizedTitle));
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Cleans and validates field values
 * 
 * @param {string} value - Raw field value
 * @returns {string} Cleaned field value
 */
function cleanFieldValue(value) {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/^["']|["']$/g, ''); // Remove surrounding quotes
}

/**
 * Escapes CSV field values
 * 
 * @param {string} value - Field value to escape
 * @returns {string} Escaped field value
 */
export function escapeCSVField(value) {
  if (value === null || value === undefined) return '';
  
  const stringValue = String(value);
  
  // If field contains comma, newline, or quote, wrap in quotes
  if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

/**
 * Generates filename for CSV export
 */
function generateFilename(sanitizedTitle) {
  const timestamp = new Date();
  const dateStr = timestamp.toISOString().split('T')[0];
  const timeStr = timestamp.toTimeString().split(' ')[0].replace(/:/g, '-');
  
  const baseFilename = sanitizedTitle || 'badminton_shots';
  return `${baseFilename}_${dateStr}_${timeStr}.csv`;
}