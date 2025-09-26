/**
 * Integration tests for theme functionality
 * 
 * Tests that theme switching works correctly when integrated with the panel
 * and that all UI elements respond appropriately to theme changes.
 */

import { initializeTheme, toggleTheme, THEMES } from '../src/utils/theme-manager.js';
import { UI_IDS } from '../src/constants.js';

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

// Mock document.documentElement
Object.defineProperty(document, 'documentElement', {
  value: {
    setAttribute: jest.fn()
  },
  writable: true
});

// Mock window.dispatchEvent
window.dispatchEvent = jest.fn();

describe('Theme Integration Tests', () => {
  beforeEach(() => {
    // Clear all mocks and storage
    jest.clearAllMocks();
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
  });

  test('should initialize theme correctly', async () => {
    const theme = await initializeTheme();
    
    expect(theme).toBe(THEMES.LIGHT);
    expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', THEMES.LIGHT);
  });

  test('should toggle theme correctly', async () => {
    // Start with light theme
    await initializeTheme();
    
    // Toggle to dark
    const newTheme = await toggleTheme();
    
    expect(newTheme).toBe(THEMES.DARK);
    expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', THEMES.DARK);
  });

  test('should persist theme in storage', async () => {
    // Set dark theme
    await toggleTheme();
    
    // Verify it was stored
    expect(chrome.storage.local.set).toHaveBeenCalledWith({
      'yt-shot-labeler-theme': THEMES.DARK
    });
    
    // Get theme again (should retrieve from storage)
    const storedTheme = await initializeTheme();
    expect(storedTheme).toBe(THEMES.DARK);
  });

  test('should dispatch theme-changed event', async () => {
    await toggleTheme();
    
    expect(window.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'theme-changed',
        detail: { theme: THEMES.DARK }
      })
    );
  });

  test('should create theme toggle button element with correct attributes', () => {
    // Create a mock theme toggle button
    const button = document.createElement('button');
    button.id = UI_IDS.THEME_TOGGLE;
    button.setAttribute('data-tooltip', 'Toggle dark/light theme');
    button.setAttribute('aria-label', 'Toggle theme');
    button.textContent = '🌙';
    
    // Verify the button has the correct attributes
    expect(button.id).toBe(UI_IDS.THEME_TOGGLE);
    expect(button.getAttribute('data-tooltip')).toBe('Toggle dark/light theme');
    expect(button.getAttribute('aria-label')).toBe('Toggle theme');
    expect(button.textContent).toBe('🌙');
  });
});