/**
 * @jest-environment jsdom
 */

import { 
  initializeI18n, 
  t, 
  getCurrentLanguage, 
  switchLanguage, 
  updateLanguageSelector,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE 
} from '../src/utils/i18n-manager.js';

// Mock chrome APIs for testing
global.chrome = {
  storage: {
    local: {
      get: jest.fn((keys, callback) => callback({})),
      set: jest.fn()
    }
  }
};

// Mock localStorage
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn()
};

describe('I18n Manager', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    
    it('should initialize with default language', async () => {
      const language = await initializeI18n();
      expect(language).toBe(DEFAULT_LANGUAGE);
    });

    it('should load fallback translations in test environment', async () => {
      await initializeI18n();
      expect(t('app.title')).toBe('YouTube Badminton Shot Labeler');
    });

  });

  describe('Translation Function', () => {
    
    beforeEach(async () => {
      await initializeI18n();
    });

    it('should return translated strings', () => {
      expect(t('app.title')).toBe('YouTube Badminton Shot Labeler');
      expect(t('ui.close')).toBe('Close');
      expect(t('sections.video_details')).toBe('Video Details');
    });

    it('should return key as fallback for missing translations', () => {
      expect(t('missing.key')).toBe('missing.key');
    });

    it('should handle parameter interpolation', () => {
      // Note: This would require adding a parameterized string to our translations
      // For now, just test that it doesn't break with params
      expect(t('app.title', { param: 'test' })).toBe('YouTube Badminton Shot Labeler');
    });

  });

  describe('Language Management', () => {
    
    beforeEach(async () => {
      await initializeI18n();
    });

    it('should get current language', () => {
      expect(getCurrentLanguage()).toBe(DEFAULT_LANGUAGE);
    });

    it('should validate supported languages', () => {
      expect(SUPPORTED_LANGUAGES).toHaveProperty('en');
      expect(SUPPORTED_LANGUAGES).toHaveProperty('ko');
      expect(SUPPORTED_LANGUAGES.en).toHaveProperty('name', 'English');
      expect(SUPPORTED_LANGUAGES.ko).toHaveProperty('name', '한국어');
    });

    it('should switch languages', async () => {
      await switchLanguage('ko');
      expect(getCurrentLanguage()).toBe('ko');
    });

    it('should reject unsupported languages', async () => {
      await expect(switchLanguage('fr')).rejects.toThrow('Unsupported language: fr');
    });

  });

  describe('UI Updates', () => {
    
    beforeEach(async () => {
      await initializeI18n();
    });

    it('should update language selector button', () => {
      const button = document.createElement('button');
      document.body.appendChild(button);

      updateLanguageSelector(button, 'en');
      expect(button.textContent).toBe('🇺🇸');
      // Since we're in test environment, tooltip will be the key name
      expect(button.getAttribute('data-tooltip')).toBe('ui.language_selector_tooltip');

      updateLanguageSelector(button, 'ko');
      expect(button.textContent).toBe('🇰🇷');

      document.body.removeChild(button);
    });

    it('should handle null button gracefully', () => {
      expect(() => updateLanguageSelector(null, 'en')).not.toThrow();
    });

  });

  describe('Event System', () => {
    
    beforeEach(async () => {
      await initializeI18n();
    });

    it('should dispatch language change events', async () => {
      const eventListener = jest.fn();
      window.addEventListener('language-changed', eventListener);

      await switchLanguage('ko');

      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: { language: 'ko' }
        })
      );

      window.removeEventListener('language-changed', eventListener);
    });

  });

  describe('Persistence', () => {
    
    it('should save language preferences', async () => {
      await initializeI18n();
      await switchLanguage('ko');

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        'yt-shot-labeler-language': 'ko'
      });
    });

    it('should load saved language preferences', async () => {
      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({ 'yt-shot-labeler-language': 'ko' });
      });

      const language = await initializeI18n();
      expect(language).toBe('ko');
    });

  });

});