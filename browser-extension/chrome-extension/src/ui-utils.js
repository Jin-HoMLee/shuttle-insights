/**
 * UI Utility Functions
 * Contains utilities for formatting, sanitization, and UI-related operations
 */

import { VIDEO_SELECTORS } from './constants.js';

/**
 * Formats a Date object into YYYY-MM-DD HH:MM:SS format
 * @param {Date} dt - Date object to format
 * @returns {string} Formatted date string
 */
export function formatDateTime(dt) {
  const pad = (n) => n.toString().padStart(2, '0');
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`;
}

/**
 * Sanitizes a string by removing characters that are invalid for filenames
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string safe for use in filenames
 */
export function sanitize(str) {
  return str.replace(/[<>:"/\\|?*]+/g, '').trim();
}

/**
 * Extracts the video title from the current YouTube page
 * Uses multiple selectors as fallbacks and cleans the document title if needed
 * @returns {string} The video title or 'video' as fallback
 */
export function getVideoTitle() {
  // Try multiple selectors for the video title
  for (const selector of VIDEO_SELECTORS.TITLE_SELECTORS) {
    const element = document.querySelector(selector);
    if (element?.innerText?.trim()) {
      return element.innerText.trim();
    }
  }
  
  // Fallback to document title with YouTube-specific cleanup
  let title = document.title
    .replace(/^\(\d+\)\s*/, '') // Remove notification count like "(1) "
    .replace(/ - YouTube$/, '') // Remove " - YouTube" suffix
    .trim();
    
  return title || 'video'; // Final fallback
}

/**
 * Creates a standardized error message display
 * @param {string} message - Error message to display
 * @param {HTMLElement} container - Container element to show error in
 */
export function showError(message, container) {
  if (!container) return;
  
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
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (errorDiv.parentElement) {
      errorDiv.parentElement.removeChild(errorDiv);
    }
  }, 5000);
}

/**
 * Creates a standardized success message display
 * @param {string} message - Success message to display  
 * @param {HTMLElement} container - Container element to show message in
 */
export function showSuccess(message, container) {
  if (!container) return;
  
  const successDiv = document.createElement('div');
  successDiv.style.cssText = `
    color: #2e7d32;
    background: #e8f5e8;
    border: 1px solid #c8e6c9;
    padding: 8px;
    border-radius: 4px;
    margin: 4px 0;
    font-size: 12px;
  `;
  successDiv.textContent = message;
  
  container.appendChild(successDiv);
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    if (successDiv.parentElement) {
      successDiv.parentElement.removeChild(successDiv);
    }
  }, 3000);
}

/**
 * Safely removes an element from the DOM
 * @param {string|HTMLElement} elementOrId - Element or element ID to remove
 */
export function safeRemoveElement(elementOrId) {
  const element = typeof elementOrId === 'string' 
    ? document.getElementById(elementOrId)
    : elementOrId;
    
  if (element?.parentElement) {
    element.parentElement.removeChild(element);
  }
}

/**
 * Applies consistent styling to button elements
 * @param {HTMLElement} button - Button element to style
 * @param {string} variant - Style variant ('primary', 'secondary', 'danger')
 */
export function styleButton(button, variant = 'primary') {
  if (!button) return;
  
  const baseStyles = `
    border: none;
    border-radius: 4px;
    padding: 6px 12px;
    font-size: 13px;
    cursor: pointer;
    transition: background-color 0.2s, transform 0.1s;
    outline: none;
  `;
  
  const variants = {
    primary: `
      background: #1976d2;
      color: white;
    `,
    secondary: `
      background: #f5f5f5;
      color: #333;
      border: 1px solid #ddd;
    `,
    danger: `
      background: #d32f2f;
      color: white;
    `
  };
  
  button.style.cssText = baseStyles + (variants[variant] || variants.primary);
  
  // Add hover effects
  button.addEventListener('mouseenter', () => {
    button.style.transform = 'translateY(-1px)';
  });
  
  button.addEventListener('mouseleave', () => {
    button.style.transform = 'translateY(0)';
  });
}