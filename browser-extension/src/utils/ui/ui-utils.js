/**
 * UI Utility Functions
 * Contains utilities for formatting, sanitization, and UI-related operations
 */

import { VIDEO_SELECTORS } from '../../constants.js';

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
  errorDiv.className = 'yt-shot-labeler-message yt-shot-labeler-message-error';

  // Create icon and message elements separately for XSS safety
  const iconSpan = document.createElement('span');
  iconSpan.textContent = '⚠️';

  const messageSpan = document.createElement('span');
  messageSpan.textContent = message; // Safe: prevents HTML injection

  errorDiv.appendChild(iconSpan);
  errorDiv.appendChild(messageSpan);

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
  successDiv.className = 'yt-shot-labeler-message yt-shot-labeler-message-success';

  const iconSpan = document.createElement('span');
  iconSpan.textContent = '✅';

  const messageSpan = document.createElement('span');
  messageSpan.textContent = message;

  successDiv.appendChild(iconSpan);
  successDiv.appendChild(messageSpan);

  container.appendChild(successDiv);
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    if (successDiv.parentElement) {
      successDiv.parentElement.removeChild(successDiv);
    }
  }, 3000);
}

/**
 * Creates a standardized warning message display
 * @param {string} message - Warning message to display  
 * @param {HTMLElement} container - Container element to show message in
 */
export function showWarning(message, container) {
  if (!container) return;
  
  const warningDiv = document.createElement('div');
  warningDiv.className = 'yt-shot-labeler-message yt-shot-labeler-message-warning';

  const iconSpan = document.createElement('span');
  iconSpan.textContent = '⚠️';

  const messageSpan = document.createElement('span');
  messageSpan.textContent = message;

  warningDiv.appendChild(iconSpan);
  warningDiv.appendChild(messageSpan);

  container.appendChild(warningDiv);
  
  // Auto-remove after 4 seconds
  setTimeout(() => {
    if (warningDiv.parentElement) {
      warningDiv.parentElement.removeChild(warningDiv);
    }
  }, 4000);
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
 * Creates a loading spinner element
 * @param {string} text - Optional loading text
 * @returns {HTMLElement} Loading spinner element
 */
export function createLoadingSpinner(text = 'Loading...') {
  const spinner = document.createElement('div');
  spinner.style.cssText = `
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--text-secondary);
  `;
  
  // Create spinner icon and text safely
  const spinnerIcon = document.createElement('div');
  spinnerIcon.className = 'yt-shot-labeler-spinner';

  const spinnerText = document.createElement('span');
  spinnerText.textContent = text;

  spinner.appendChild(spinnerIcon);
  spinner.appendChild(spinnerText);

  return spinner;
}

/**
 * Shows a loading state on a button
 * @param {HTMLElement} button - Button to show loading on
 * @param {string} loadingText - Text to show while loading
 */
export function showButtonLoading(button, loadingText = 'Loading...') {
  if (!button) return;
  
  button.dataset.originalText = button.textContent;
  button.dataset.originalDisabled = button.disabled;

  // Remove all children
  while (button.firstChild) {
    button.removeChild(button.firstChild);
  }

  const spinnerIcon = document.createElement('div');
  spinnerIcon.className = 'yt-shot-labeler-spinner';

  const spinnerText = document.createElement('span');
  spinnerText.textContent = loadingText;

  button.appendChild(spinnerIcon);
  button.appendChild(spinnerText);

  button.disabled = true;
}

/**
 * Hides loading state on a button
 * @param {HTMLElement} button - Button to hide loading from
 */
export function hideButtonLoading(button) {
  if (!button || !button.dataset.originalText) return;
  
  button.textContent = button.dataset.originalText;
  button.disabled = button.dataset.originalDisabled === 'true';
  
  delete button.dataset.originalText;
  delete button.dataset.originalDisabled;
}

/**
 * Adds tooltip to an element
 * @param {HTMLElement} element - Element to add tooltip to
 * @param {string} tooltipText - Tooltip text
 */
export function addTooltip(element, tooltipText) {
  if (!element || !tooltipText) return;
  
  element.classList.add('yt-shot-labeler-tooltip');
  element.setAttribute('data-tooltip', tooltipText);
  element.setAttribute('aria-label', tooltipText);
}