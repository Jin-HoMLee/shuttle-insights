/**
 * Glossary Loader
 * Loads and caches glossary data for shot types and dimensions.
 * Used by glossary.js and UI components.
 */

// Path to the glossary JSON file
const GLOSSARY_JSON_PATH = '../badminton_shots_glossary.json';

/**
 * Loads glossary data (shot types and dimensions) from JSON file
 * @returns {Promise<{shots: Array, dimensions: Array}>}
 */
export async function loadGlossaryData() {
  try {
    const response = await fetch(GLOSSARY_JSON_PATH);
    if (!response.ok) throw new Error('Failed to fetch glossary JSON');
    const data = await response.json();
    return {
      shots: data.shots || [],
      dimensions: data.dimensions || []
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Returns only the shot types from the glossary
 * @returns {Promise<Array>}
 */
export async function getShotTypes() {
  const data = await loadGlossaryData();
  return data.shots;
}

/**
 * Returns only the dimensions from the glossary
 * @returns {Promise<Array>}
 */
export async function getDimensions() {
  const data = await loadGlossaryData();
  return data.dimensions;
}
