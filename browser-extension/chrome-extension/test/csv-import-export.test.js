/**
 * Tests for CSV import/export functionality
 * 
 * Validates CSV import parsing and export generation
 */

import { setupCSVImport } from '../src/csv-import.js';
import { setupCSVExport } from '../src/csv-export.js';

// Mock UI utilities
jest.mock('../src/utils/ui/ui-utils.js', () => ({
  showError: jest.fn(),
  showSuccess: jest.fn()
}));

// Mock Chrome runtime API
global.chrome = {
  runtime: {
    sendMessage: jest.fn()
  }
};

// Mock FileReader
global.FileReader = jest.fn(() => ({
  readAsText: jest.fn(),
  readAsDataURL: jest.fn(),
  onload: null,
  onerror: null,
  result: null
}));

// Mock Blob
global.Blob = jest.fn();

describe('CSV Import/Export', () => {
  
  let mockShots, mockUpdateShotList;
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockShots = [];
    mockUpdateShotList = jest.fn();
  });
  
  describe('setupCSVImport', () => {
    
    it('should handle missing elements gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      // Panel with missing elements
      const badPanel = {
        querySelector: jest.fn(() => null)
      };
      
      setupCSVImport(badPanel, mockShots, mockUpdateShotList);
      
      expect(consoleSpy).toHaveBeenCalledWith('CSV import elements not found');
      consoleSpy.mockRestore();
    });
    
    it('should set up event handlers when elements exist', () => {
      const mockLoadBtn = { onclick: null };
      const mockFileInput = { onchange: null, click: jest.fn() };
      
      const mockPanel = {
        querySelector: jest.fn((selector) => {
          if (selector === '#load-csv') return mockLoadBtn;
          if (selector === '#csv-file-input') return mockFileInput;
          return null;
        })
      };
      
      setupCSVImport(mockPanel, mockShots, mockUpdateShotList);
      
      // Event handlers should be assigned
      expect(mockLoadBtn.onclick).not.toBeNull();
      expect(mockFileInput.onchange).not.toBeNull();
    });
    
  });
  
  describe('setupCSVExport', () => {
    
    it('should handle missing save button gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const badPanel = {
        querySelector: jest.fn(() => null)
      };
      
      setupCSVExport(badPanel, mockShots, 'http://test.com', 'test-video');
      
      expect(consoleSpy).toHaveBeenCalledWith('CSV export button not found');
      consoleSpy.mockRestore();
    });
    
    it('should set up export button when it exists', () => {
      const mockSaveBtn = { onclick: null };
      
      const mockPanel = {
        querySelector: jest.fn((selector) => {
          if (selector === '#save-labels') return mockSaveBtn;
          return null;
        })
      };
      
      setupCSVExport(mockPanel, mockShots, 'http://test.com', 'test-video');
      
      // Event handler should be assigned
      expect(mockSaveBtn.onclick).not.toBeNull();
    });
    
  });
  
  describe('Module Integration', () => {
    
    it('should coordinate import and export functionality', () => {
      const mockLoadBtn = { onclick: null };
      const mockFileInput = { onchange: null, click: jest.fn() };
      const mockSaveBtn = { onclick: null };
      
      const mockPanel = {
        querySelector: jest.fn((selector) => {
          if (selector === '#load-csv') return mockLoadBtn;
          if (selector === '#csv-file-input') return mockFileInput;
          if (selector === '#save-labels') return mockSaveBtn;
          return null;
        })
      };
      
      // Setup both import and export
      setupCSVImport(mockPanel, mockShots, mockUpdateShotList);
      setupCSVExport(mockPanel, mockShots, 'http://test.com', 'test-video');
      
      // Both should be set up correctly
      expect(mockLoadBtn.onclick).not.toBeNull();
      expect(mockFileInput.onchange).not.toBeNull();
      expect(mockSaveBtn.onclick).not.toBeNull();
    });
    
  });
  
});