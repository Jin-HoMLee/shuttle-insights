/**
 * Glossary Data Loader
 * 
 * Handles loading shot and dimension data from the glossary JSON file.
 * Manages data fetching, error handling, and validation for glossary functionality.
 */

import { EXTENSION_CONFIG } from './constants.js';

/**
 * Loads glossary data from the extension's JSON file
 * 
 * @returns {Promise<Object>} Promise resolving to glossary data
 */
export async function loadGlossaryData() {
  const response = await fetch(chrome.runtime.getURL(EXTENSION_CONFIG.GLOSSARY_FILE));
  
  if (!response.ok) {
    throw new Error(`Failed to fetch glossary: ${response.status}`);
  }
  
  return await response.json();
}

/**
 * Shows an error message in the glossary container
 * 
 * @param {HTMLElement} container - Container to show error in
 * @param {string} message - Error message to display
 */
export function showGlossaryError(container, message) {
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    color: #d32f2f;
    background: #ffebee;
    border: 1px solid #f8bbd9;
    padding: 8px;
    border-radius: 4px;
    margin: 4px 0;
    font-size: 12px;
  `;
  errorDiv.textContent = message;
  container.appendChild(errorDiv);
}