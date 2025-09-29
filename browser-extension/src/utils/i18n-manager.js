/**
 * Internationalization (i18n) Manager
 * 
 * Handles language switching, translation loading, and text localization
 * for the YouTube Badminton Shot Labeler extension.
 */

import { UI_IDS } from '../constants.js';

// Supported languages
export const SUPPORTED_LANGUAGES = {
  en: { name: 'English', flag: '🇺🇸' },
  ko: { name: '한국어', flag: '🇰🇷' }
};

export const DEFAULT_LANGUAGE = 'en';

// Storage key for persisting language preference
const LANGUAGE_STORAGE_KEY = 'yt-shot-labeler-language';

// Current language cache
let currentLanguage = DEFAULT_LANGUAGE;
let translations = {};

/**
 * Initializes the i18n system
 * @returns {Promise<string>} The initialized language code
 */
export async function initializeI18n() {
  try {
    // Load saved language preference
    const savedLanguage = await getSavedLanguage();
    currentLanguage = savedLanguage || DEFAULT_LANGUAGE;
    
    // Load translations for current language
    await loadTranslations(currentLanguage);
    
    return currentLanguage;
  } catch (error) {
    console.warn('Failed to initialize i18n, using default language:', error);
    currentLanguage = DEFAULT_LANGUAGE;
    await loadTranslations(DEFAULT_LANGUAGE);
    return DEFAULT_LANGUAGE;
  }
}

/**
 * Gets the saved language preference from storage
 * @returns {Promise<string|null>} The saved language code or null
 */
async function getSavedLanguage() {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      return new Promise((resolve) => {
        chrome.storage.local.get([LANGUAGE_STORAGE_KEY], (result) => {
          resolve(result[LANGUAGE_STORAGE_KEY]);
        });
      });
    } else {
      // Fallback to localStorage for testing
      return localStorage.getItem(LANGUAGE_STORAGE_KEY);
    }
  } catch (error) {
    console.warn('Failed to get saved language:', error);
    return null;
  }
}

/**
 * Saves the language preference to storage
 * @param {string} languageCode - Language code to save
 */
async function saveLanguage(languageCode) {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ [LANGUAGE_STORAGE_KEY]: languageCode });
    } else {
      // Fallback to localStorage for testing
      localStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
    }
  } catch (error) {
    console.warn('Failed to save language preference:', error);
  }
}

/**
 * Loads translations for the specified language
 * @param {string} languageCode - Language code to load
 */
async function loadTranslations(languageCode) {
  try {
    // Check if we're in a test environment (no chrome.runtime)
    if (typeof chrome === 'undefined' || !chrome.runtime) {
      console.warn('Using fallback translations in test environment');
      translations = getInlineTranslations();
      return;
    }
    
    const response = await fetch(chrome.runtime.getURL(`dist/locales/${languageCode}.json`));
    if (!response.ok) {
      throw new Error(`Failed to load translations for ${languageCode}`);
    }
    translations = await response.json();
  } catch (error) {
    console.warn(`Failed to load translations for ${languageCode}, using fallback:`, error);
    // If loading fails, use English as fallback
    if (languageCode !== DEFAULT_LANGUAGE) {
      await loadTranslations(DEFAULT_LANGUAGE);
    } else {
      // If even English fails, use minimal inline translations
      translations = getInlineTranslations();
    }
  }
}

/**
 * Gets a translated string for the given key
 * @param {string} key - Translation key
 * @param {Object} params - Optional parameters for string interpolation
 * @returns {string} Translated string
 */
export function t(key, params = {}) {
  let translation = translations[key];
  
  if (!translation) {
    console.warn(`Missing translation for key: ${key}`);
    return key; // Return the key itself as fallback
  }
  
  // Simple parameter interpolation
  if (typeof translation === 'string' && Object.keys(params).length > 0) {
    translation = translation.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
      return params[paramKey] !== undefined ? params[paramKey] : match;
    });
  }
  
  return translation;
}

/**
 * Gets the current language code
 * @returns {string} Current language code
 */
export function getCurrentLanguage() {
  return currentLanguage;
}

/**
 * Switches to a new language
 * @param {string} languageCode - New language code
 * @returns {Promise<void>}
 */
export async function switchLanguage(languageCode) {
  if (!SUPPORTED_LANGUAGES[languageCode]) {
    throw new Error(`Unsupported language: ${languageCode}`);
  }
  
  if (languageCode === currentLanguage) {
    return; // No change needed
  }
  
  // Load new translations
  await loadTranslations(languageCode);
  
  // Update current language
  currentLanguage = languageCode;
  
  // Save to storage
  await saveLanguage(languageCode);
  
  // Dispatch language change event
  window.dispatchEvent(new CustomEvent('language-changed', {
    detail: { language: languageCode }
  }));
}

/**
 * Updates the language selector button
 * @param {HTMLElement} button - Language selector button element
 * @param {string} currentLang - Current language code
 */
export function updateLanguageSelector(button, currentLang) {
  if (!button) return;
  
  const langInfo = SUPPORTED_LANGUAGES[currentLang];
  if (langInfo) {
    button.textContent = langInfo.flag;
    button.setAttribute('data-tooltip', t('ui.language_selector_tooltip'));
    button.setAttribute('aria-label', t('ui.language_selector_aria'));
  }
}

/**
 * Minimal inline translations as ultimate fallback
 * @returns {Object} Basic translation object
 */
function getInlineTranslations() {
  return {
    'app.title': 'YouTube Badminton Shot Labeler',
    'ui.close': 'Close',
    'ui.toggle_theme': 'Toggle theme',
    'sections.video_details': 'Video Details',
    'sections.pose_overlay': 'Pose Overlay',
    'sections.load_data': 'Load Data',
    'sections.label_shot': 'Label Shot',
    'sections.labeled_shots': 'Labeled Shots',
    'sections.export': 'Export',
    'sections.quick_help': 'Quick Help',
    'buttons.mark_start': 'Mark Start',
    'buttons.mark_end_save': 'Mark End & Save',
    'buttons.download_csv': 'Download CSV',
    'buttons.load_csv': 'Load Existing CSV',
    'buttons.toggle_pose_overlay': 'Toggle Pose Overlay',
    'labels.date_time': 'Date/Time:',
    'labels.video_title': 'Video Title:',
    'labels.url': 'URL:',
    'help.keyboard_shortcuts': 'Keyboard Shortcuts:',
    'help.workflow': 'Workflow:',
    'help.workflow_steps': '1. Mark shot start → 2. Select shot type → 3. Mark end & save'
  };
}