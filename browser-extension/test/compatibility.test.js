/**
 * Tests for compatibility layers
 * 
 * Validates that compatibility layers properly delegate to modular implementations
 */

import { createLabelerPanel, togglePanel } from '../src/panel.js';
import { setupCSV } from '../src/csv.js';

// Mock the underlying implementations
jest.mock('../src/panel-coordinator.js', () => ({
  createLabelerPanel: jest.fn(),
  togglePanel: jest.fn()
}));

jest.mock('../src/features/csv-import.js', () => ({
  setupCSVImport: jest.fn()
}));

jest.mock('../src/features/csv-export.js', () => ({
  setupCSVExport: jest.fn()
}));

describe('Compatibility Layers', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('Panel Compatibility Layer', () => {
    
    it('should delegate createLabelerPanel to coordinator', () => {
      const { createLabelerPanel: coordinatorCreate } = require('../src/panel-coordinator.js');
      
      createLabelerPanel();
      
      expect(coordinatorCreate).toHaveBeenCalled();
    });
    
    it('should delegate togglePanel to coordinator', () => {
      const { togglePanel: coordinatorToggle } = require('../src/panel-coordinator.js');
      
      togglePanel();
      
      expect(coordinatorToggle).toHaveBeenCalled();
    });
    
    it('should maintain same function signatures', () => {
      // Functions should have same arity as before
      expect(createLabelerPanel).toHaveLength(0);
      expect(togglePanel).toHaveLength(0);
    });
    
    it('should return same values as coordinator', () => {
      const { createLabelerPanel: coordinatorCreate } = require('../src/panel-coordinator.js');
      coordinatorCreate.mockReturnValue('test-result');
      
      const result = createLabelerPanel();
      
      expect(result).toBe('test-result');
    });
    
  });
  
  describe('CSV Compatibility Layer', () => {
    
    it('should delegate to both import and export modules', () => {
      const { setupCSVImport } = require('../src/features/csv-import.js');
      const { setupCSVExport } = require('../src/features/csv-export.js');
      
      const mockPanel = {};
      const mockShots = [];
      const mockUpdateShotList = jest.fn();
      const mockVideoUrl = 'http://test.com';
      const mockTitle = 'test-video';
      
      setupCSV(mockPanel, mockShots, mockUpdateShotList, mockVideoUrl, mockTitle);
      
      expect(setupCSVImport).toHaveBeenCalledWith(mockPanel, mockShots, mockUpdateShotList);
      expect(setupCSVExport).toHaveBeenCalledWith(mockPanel, mockShots, mockVideoUrl, mockTitle);
    });
    
    it('should maintain same function signature', () => {
      // Should accept same parameters as before modularization
      expect(setupCSV).toHaveLength(5);
    });
    
    it('should pass parameters correctly to sub-modules', () => {
      const { setupCSVImport } = require('../src/features/csv-import.js');
      const { setupCSVExport } = require('../src/features/csv-export.js');
      
      const testParams = [
        { element: 'panel' },
        [{ shot: 'data' }],
        jest.fn(),
        'https://youtube.com/test',
        'sanitized-title'
      ];
      
      setupCSV(...testParams);
      
      expect(setupCSVImport).toHaveBeenCalledWith(
        testParams[0], // panel
        testParams[1], // shots
        testParams[2]  // updateShotList
      );
      
      expect(setupCSVExport).toHaveBeenCalledWith(
        testParams[0], // panel
        testParams[1], // shots
        testParams[3], // videoUrl
        testParams[4]  // sanitizedTitle
      );
    });
    
  });
  
  describe('Backward Compatibility', () => {
    
    it('should maintain existing API contracts', () => {
      // All legacy functions should still exist and work
      expect(typeof createLabelerPanel).toBe('function');
      expect(typeof togglePanel).toBe('function');
      expect(typeof setupCSV).toBe('function');
      
      // Should not throw when called with expected parameters
      expect(() => createLabelerPanel()).not.toThrow();
      expect(() => togglePanel()).not.toThrow();
      expect(() => setupCSV({}, [], jest.fn(), '', '')).not.toThrow();
    });
    
    it('should provide transparent delegation', () => {
      const { createLabelerPanel: coordinatorCreate } = require('../src/panel-coordinator.js');
      const { setupCSVImport } = require('../src/features/csv-import.js');
      const { setupCSVExport } = require('../src/features/csv-export.js');
      
      // Call compatibility layer functions
      createLabelerPanel();
      setupCSV({}, [], jest.fn(), 'url', 'title');
      
      // Verify underlying implementations are called
      expect(coordinatorCreate).toHaveBeenCalled();
      expect(setupCSVImport).toHaveBeenCalled();
      expect(setupCSVExport).toHaveBeenCalled();
    });
    
    it('should not add any new dependencies to legacy API', () => {
      // Legacy modules should only import from their respective implementations
      // No additional setup or configuration should be required
      
      const mockPanel = document.createElement('div');
      const mockShots = [];
      const mockCallback = jest.fn();
      
      // These should work exactly as they did before modularization
      expect(() => {
        createLabelerPanel();
        togglePanel();
        setupCSV(mockPanel, mockShots, mockCallback, 'url', 'title');
      }).not.toThrow();
    });
    
  });
  
  describe('Module Loading', () => {
    
    it('should successfully import all compatibility modules', () => {
      // All imports should succeed without errors - modules already imported at top
      expect(() => {
        expect(createLabelerPanel).toBeDefined();
        expect(togglePanel).toBeDefined();
        expect(setupCSV).toBeDefined();
      }).not.toThrow();
    });
    
    it('should have expected exports', () => {
      // Use the imported modules directly
      expect(createLabelerPanel).toBeDefined();
      expect(togglePanel).toBeDefined();
      expect(setupCSV).toBeDefined();
    });
    
  });
  
});