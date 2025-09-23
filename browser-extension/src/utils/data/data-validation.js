/**
 * Data Validation Utilities
 * 
 * This module provides validation functions for shot data, CSV imports,
 * and other data integrity checks throughout the extension.
 * 
 * Features:
 * - Shot object validation
 * - Time range validation
 * - Data sanitization
 * - Input validation helpers
 */

import { DEFAULT_SHOT, MAX_SHOT_DURATION_SECONDS } from '../../constants.js';

/**
 * Validates a shot object for completeness and data integrity
 * 
 * @param {Object} shot - Shot object to validate
 * @returns {Object} Validation result with isValid flag and errors array
 */
export function validateShot(shot) {
  const errors = [];
  
  if (!shot || typeof shot !== 'object') {
    return { isValid: false, errors: ['Shot must be an object'] };
  }
  
  // Check required fields
  if (typeof shot.start !== 'number' || isNaN(shot.start)) {
    errors.push('Start time must be a valid number');
  }
  
  if (typeof shot.end !== 'number' || isNaN(shot.end)) {
    errors.push('End time must be a valid number');
  }
  
  if (!shot.label || typeof shot.label !== 'string' || shot.label.trim() === '') {
    errors.push('Label is required and must be a non-empty string');
  }
  
  // Check time relationship
  if (typeof shot.start === 'number' && typeof shot.end === 'number') {
    if (shot.start < 0) {
      errors.push('Start time cannot be negative');
    }
    
    if (shot.end < 0) {
      errors.push('End time cannot be negative');
    }
    
    if (shot.end <= shot.start) {
      errors.push('End time must be greater than start time');
    }
    
    if (shot.end - shot.start > MAX_SHOT_DURATION_SECONDS) { // 5 minutes seems like a reasonable max
      errors.push('Shot duration seems too long (over 5 minutes)');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates an array of shots
 * 
 * @param {Array} shots - Array of shot objects to validate
 * @returns {Object} Validation result with overall validity and per-shot details
 */
export function validateShotsArray(shots) {
  if (!Array.isArray(shots)) {
    return { isValid: false, errors: ['Shots must be an array'], shotResults: [] };
  }
  
  const shotResults = shots.map((shot, index) => ({
    index,
    ...validateShot(shot)
  }));
  
  const allErrors = shotResults.reduce((acc, result) => {
    if (!result.isValid) {
      acc.push(`Shot ${result.index + 1}: ${result.errors.join(', ')}`);
    }
    return acc;
  }, []);
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    shotResults,
    validCount: shotResults.filter(r => r.isValid).length,
    totalCount: shots.length
  };
}

/**
 * Sanitizes and normalizes a shot object
 * 
 * @param {Object} shot - Raw shot object to sanitize
 * @returns {Object} Sanitized shot object
 */
export function sanitizeShot(shot) {
  if (!shot || typeof shot !== 'object') {
    return { ...DEFAULT_SHOT };
  }
  
  const sanitized = { ...DEFAULT_SHOT };
  
  // Handle numeric fields
  if (typeof shot.start === 'number' && !isNaN(shot.start)) {
    sanitized.start = Math.max(0, shot.start);
  }
  
  if (typeof shot.end === 'number' && !isNaN(shot.end)) {
    sanitized.end = Math.max(0, shot.end);
  }
  
  // Handle string fields
  if (typeof shot.label === 'string') {
    sanitized.label = shot.label.trim() || null;
  }
  
  // Handle optional dimension fields
  const dimensionFields = [
    'longitudinalPosition', 'lateralPosition', 'timing', 
    'intention', 'impact', 'direction'
  ];
  
  dimensionFields.forEach(field => {
    if (typeof shot[field] === 'string' && shot[field].trim()) {
      sanitized[field] = shot[field].trim();
    }
  });
  
  return sanitized;
}

/**
 * Validates time range input
 * 
 * @param {number} start - Start time in seconds
 * @param {number} end - End time in seconds
 * @returns {Object} Validation result
 */
export function validateTimeRange(start, end) {
  const errors = [];
  
  if (typeof start !== 'number' || isNaN(start)) {
    errors.push('Start time must be a number');
  } else if (start < 0) {
    errors.push('Start time cannot be negative');
  }
  
  if (typeof end !== 'number' || isNaN(end)) {
    errors.push('End time must be a number');
  } else if (end < 0) {
    errors.push('End time cannot be negative');
  }
  
  if (typeof start === 'number' && typeof end === 'number' && !isNaN(start) && !isNaN(end)) {
    if (end <= start) {
      errors.push('End time must be greater than start time');
    }
    
    if (end - start < 0.1) {
      errors.push('Shot duration must be at least 0.1 seconds');
    }
    
    if (end - start > MAX_SHOT_DURATION_SECONDS) {
      errors.push(`Shot duration cannot exceed ${MAX_SHOT_DURATION_SECONDS / 60} minutes`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates video URL format
 * 
 * @param {string} url - URL to validate
 * @returns {Object} Validation result
 */
export function validateVideoUrl(url) {
  if (typeof url !== 'string' || !url.trim()) {
    return { isValid: false, errors: ['URL is required'] };
  }
  
  try {
    const urlObj = new URL(url);
    const isYouTube = urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be');
    
    if (!isYouTube) {
      return { isValid: false, errors: ['URL must be a YouTube URL'] };
    }
    
    return { isValid: true, errors: [] };
  } catch (error) {
    return { isValid: false, errors: ['Invalid URL format'] };
  }
}

/**
 * Validates label string
 * 
 * @param {string} label - Label to validate
 * @returns {Object} Validation result
 */
export function validateLabel(label) {
  if (typeof label !== 'string') {
    return { isValid: false, errors: ['Label must be a string'] };
  }
  
  const trimmed = label.trim();
  
  if (!trimmed) {
    return { isValid: false, errors: ['Label cannot be empty'] };
  }
  
  if (trimmed.length > 100) {
    return { isValid: false, errors: ['Label cannot exceed 100 characters'] };
  }
  
  return { isValid: true, errors: [] };
}

/**
 * Validates dimension value
 * 
 * @param {string} value - Dimension value to validate
 * @param {string} dimensionType - Type of dimension for context
 * @returns {Object} Validation result
 */
export function validateDimensionValue(value, dimensionType = 'dimension') {
  if (value === null || value === undefined || value === '') {
    return { isValid: true, errors: [] }; // Optional values are valid when empty
  }
  
  if (typeof value !== 'string') {
    return { isValid: false, errors: [`${dimensionType} must be a string`] };
  }
  
  const trimmed = value.trim();
  
  if (trimmed.length > 50) {
    return { isValid: false, errors: [`${dimensionType} cannot exceed 50 characters`] };
  }
  
  return { isValid: true, errors: [] };
}

/**
 * Creates a comprehensive validation report for debugging
 * 
 * @param {Array} shots - Array of shots to analyze
 * @returns {Object} Detailed validation report
 */
export function createValidationReport(shots) {
  const startTime = performance.now();
  
  const result = validateShotsArray(shots);
  const report = {
    timestamp: new Date().toISOString(),
    processingTime: performance.now() - startTime,
    summary: {
      totalShots: result.totalCount,
      validShots: result.validCount,
      invalidShots: result.totalCount - result.validCount,
      overallValid: result.isValid
    },
    details: result.shotResults,
    errors: result.errors
  };
  
  if (result.totalCount > 0) {
    report.summary.validPercentage = Math.round((result.validCount / result.totalCount) * 100);
  }
  
  return report;
}