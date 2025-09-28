/**
 * Theme Manager
 * 
 * Handles dark/light theme switching and persistence for the YouTube Badminton Shot Labeler.
 * Uses Chrome storage API to persist theme preference across sessions.
 */

/**
 * Theme constants
 */
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark'
};

/**
 * Storage key for theme preference
 */
const THEME_STORAGE_KEY = 'yt-shot-labeler-theme';

/**
 * Default theme
 */
const DEFAULT_THEME = THEMES.LIGHT;

/**
 * Theme icons for the toggle button
 */
const THEME_ICONS = {
  [THEMES.LIGHT]: '🌙', // Moon icon for switching to dark
  [THEMES.DARK]: '☀️'   // Sun icon for switching to light
};

/**
 * Gets the current theme from storage or returns default
 * @returns {Promise<string>} Current theme
 */
export async function getCurrentTheme() {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    try {
      const result = await chrome.storage.local.get([THEME_STORAGE_KEY]);
      return result[THEME_STORAGE_KEY] || DEFAULT_THEME;
    } catch (error) {
      console.warn('Failed to get theme from storage:', error);
      return DEFAULT_THEME;
    }
  }
  
  // Fallback to localStorage for testing/development environments
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME;
  } catch (error) {
    console.warn('Failed to get theme from localStorage:', error);
    return DEFAULT_THEME;
  }
}

/**
 * Sets the current theme in storage
 * @param {string} theme - Theme to set
 * @returns {Promise<void>}
 */
export async function setCurrentTheme(theme) {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    try {
      await chrome.storage.local.set({ [THEME_STORAGE_KEY]: theme });
    } catch (error) {
      console.warn('Failed to save theme to storage:', error);
      // Fallback to localStorage
      try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
      } catch (lsError) {
        console.warn('Failed to save theme to localStorage:', lsError);
      }
    }
  } else {
    // Fallback to localStorage for testing/development environments
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (lsError) {
      console.warn('Failed to save theme to localStorage:', lsError);
    }
  }
}

/**
 * Applies the theme to the document root
 * @param {string} theme - Theme to apply
 */
export function applyTheme(theme) {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  
  // Emit custom event for other components that might need to react to theme changes
  window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme } }));
}

/**
 * Gets the opposite theme
 * @param {string} currentTheme - Current theme
 * @returns {string} Opposite theme
 */
export function getOppositeTheme(currentTheme) {
  return currentTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
}

/**
 * Gets the icon for the current theme (what should be shown on the toggle button)
 * @param {string} currentTheme - Current theme
 * @returns {string} Icon emoji
 */
export function getThemeIcon(currentTheme) {
  return THEME_ICONS[currentTheme] || THEME_ICONS[DEFAULT_THEME];
}

/**
 * Toggles between light and dark themes
 * @returns {Promise<string>} New theme after toggle
 */
export async function toggleTheme() {
  const currentTheme = await getCurrentTheme();
  const newTheme = getOppositeTheme(currentTheme);
  
  await setCurrentTheme(newTheme);
  applyTheme(newTheme);
  
  return newTheme;
}

/**
 * Initializes theme on page load
 * @returns {Promise<string>} Applied theme
 */
export async function initializeTheme() {
  const theme = await getCurrentTheme();
  applyTheme(theme);
  return theme;
}

/**
 * Updates the theme toggle button appearance
 * @param {HTMLElement} button - Theme toggle button element
 * @param {string} currentTheme - Current theme
 */
export function updateThemeToggleButton(button, currentTheme) {
  if (button) {
    const icon = getThemeIcon(currentTheme);
    button.textContent = icon;
    
    // Update tooltip
    const oppositeTheme = getOppositeTheme(currentTheme);
    const tooltipText = `Switch to ${oppositeTheme} theme`;
    button.setAttribute('data-tooltip', tooltipText);
    button.setAttribute('aria-label', tooltipText);
  }
}