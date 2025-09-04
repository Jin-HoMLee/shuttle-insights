/**
 * Utility functions for config validation and debug logging
 * Use these to keep resize.js and other modules clean and maintainable.
 */

/**
 * Assert that config properties are functions
 * @param {Object} config - config object
 * @param {Array<string>} keys - keys to check
 * @param {string} context - context for error message
 */
export function assertConfigFunctions(config, keys, context = '') {
  keys.forEach(key => {
    if (typeof config[key] !== 'function') {
      throw new Error(`${context} config.${key} must be a function returning a value`);
    }
  });
}

/**
 * Log types and values of config properties
 * @param {Object} config - config object
 * @param {Array<string>} keys - keys to log
 * @param {Object} extra - extra values to log
 * @param {string} context - context for log
 */
export function logConfigTypesAndValues(config, keys, extra = {}, context = '') {
  const types = {};
  const values = {};
  keys.forEach(key => {
    types[key + '_type'] = typeof config[key];
    values[key] = config[key];
  });
  Object.entries(extra).forEach(([k, v]) => {
    types[k + '_type'] = typeof v;
    values[k] = v;
  });
  console.log(`[${context}] Types:`, types);
  console.log(`[${context}] Values:`, values);
}
