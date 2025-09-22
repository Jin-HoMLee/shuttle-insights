/**
 * Glossary Utilities
 * 
 * Shared utility functions for glossary functionality.
 * Contains helper functions for dimension mapping and common operations.
 */

/**
 * Maps dimension names to object property keys
 * Converts human-readable dimension names to camelCase property names
 * 
 * @param {string} dimensionTerm - Human-readable dimension name
 * @returns {string} Corresponding object property key
 */
export function getDimensionKey(dimensionTerm) {
  const mapping = {
    'Longitudinal Position': 'longitudinalPosition',
    'Lateral Position': 'lateralPosition',
    'Timing': 'timing',
    'Intention': 'intention',
    'Impact': 'impact',
    'Direction': 'direction'
  };
  
  return mapping[dimensionTerm] || dimensionTerm.toLowerCase().replace(/\s+/g, '');
}