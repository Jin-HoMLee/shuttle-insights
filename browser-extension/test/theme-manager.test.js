/**
 * Tests for theme-manager.js
 * 
 * These tests verify that the theme management functionality works correctly,
 * including theme switching, persistence, and UI updates.
 */

import { 
  THEMES, 
  getCurrentTheme, 
  setCurrentTheme, 
  applyTheme, 
  getOppositeTheme, 
  getThemeIcon, 
  toggleTheme, 
  initializeTheme,
  updateThemeToggleButton
} from '../src/utils/theme-manager.js';

// Mock Chrome storage API
const mockStorage = {};
global.chrome = {
  storage: {
    local: {
      get: jest.fn((keys) => {
        const result = {};
        keys.forEach(key => {
          if (mockStorage[key]) {
            result[key] = mockStorage[key];
          }
        });
        return Promise.resolve(result);
      }),
      set: jest.fn((items) => {
        Object.assign(mockStorage, items);
        return Promise.resolve();
      })
    }
  }
};

// Mock localStorage as fallback
const mockLocalStorage = {};
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn((key) => mockLocalStorage[key] || null),
    setItem: jest.fn((key, value) => {
      mockLocalStorage[key] = value;
    })
  },
  writable: true
});

// Mock document.documentElement
Object.defineProperty(document, 'documentElement', {
  value: {
    setAttribute: jest.fn()
  },
  writable: true
});

// Mock window.dispatchEvent
window.dispatchEvent = jest.fn();

describe('Theme Manager', () => {
  beforeEach(() => {
    // Clear all mocks and storage
    jest.clearAllMocks();
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
    Object.keys(mockLocalStorage).forEach(key => delete mockLocalStorage[key]);
  });

  describe('Constants', () => {
    test('should have correct theme constants', () => {
      expect(THEMES.LIGHT).toBe('light');
      expect(THEMES.DARK).toBe('dark');
    });
  });

  describe('getCurrentTheme', () => {
    test('should return default theme when no theme is stored', async () => {
      const theme = await getCurrentTheme();
      expect(theme).toBe(THEMES.LIGHT);
    });

    test('should return stored theme from Chrome storage', async () => {
      await setCurrentTheme(THEMES.DARK);
      const theme = await getCurrentTheme();
      expect(theme).toBe(THEMES.DARK);
    });
  });

  describe('setCurrentTheme', () => {
    test('should store theme in Chrome storage', async () => {
      await setCurrentTheme(THEMES.DARK);
      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        'yt-shot-labeler-theme': THEMES.DARK
      });
    });
  });

  describe('applyTheme', () => {
    test('should set data-theme attribute on document root', () => {
      applyTheme(THEMES.DARK);
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', THEMES.DARK);
    });

    test('should dispatch theme-changed event', () => {
      applyTheme(THEMES.DARK);
      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'theme-changed',
          detail: { theme: THEMES.DARK }
        })
      );
    });
  });

  describe('getOppositeTheme', () => {
    test('should return dark when current is light', () => {
      expect(getOppositeTheme(THEMES.LIGHT)).toBe(THEMES.DARK);
    });

    test('should return light when current is dark', () => {
      expect(getOppositeTheme(THEMES.DARK)).toBe(THEMES.LIGHT);
    });
  });

  describe('getThemeIcon', () => {
    test('should return moon icon for light theme', () => {
      expect(getThemeIcon(THEMES.LIGHT)).toBe('🌙');
    });

    test('should return sun icon for dark theme', () => {
      expect(getThemeIcon(THEMES.DARK)).toBe('☀️');
    });
  });

  describe('toggleTheme', () => {
    test('should switch from light to dark', async () => {
      await setCurrentTheme(THEMES.LIGHT);
      const newTheme = await toggleTheme();
      expect(newTheme).toBe(THEMES.DARK);
    });

    test('should switch from dark to light', async () => {
      await setCurrentTheme(THEMES.DARK);
      const newTheme = await toggleTheme();
      expect(newTheme).toBe(THEMES.LIGHT);
    });

    test('should apply the new theme', async () => {
      await setCurrentTheme(THEMES.LIGHT);
      await toggleTheme();
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', THEMES.DARK);
    });
  });

  describe('initializeTheme', () => {
    test('should apply default theme and return it', async () => {
      const theme = await initializeTheme();
      expect(theme).toBe(THEMES.LIGHT);
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', THEMES.LIGHT);
    });

    test('should apply stored theme', async () => {
      await setCurrentTheme(THEMES.DARK);
      const theme = await initializeTheme();
      expect(theme).toBe(THEMES.DARK);
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', THEMES.DARK);
    });
  });

  describe('updateThemeToggleButton', () => {
    test('should update button text and attributes', () => {
      const button = {
        textContent: '',
        setAttribute: jest.fn()
      };

      updateThemeToggleButton(button, THEMES.LIGHT);

      expect(button.textContent).toBe('🌙');
      expect(button.setAttribute).toHaveBeenCalledWith('data-tooltip', 'Switch to dark theme');
      expect(button.setAttribute).toHaveBeenCalledWith('aria-label', 'Switch to dark theme');
    });

    test('should handle null button gracefully', () => {
      expect(() => updateThemeToggleButton(null, THEMES.LIGHT)).not.toThrow();
    });
  });
});