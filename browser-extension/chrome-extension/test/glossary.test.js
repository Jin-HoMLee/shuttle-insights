/**
 * Tests for glossary module coordination
 * 
 * Validates glossary setup, button creation, and dimension controls
 */

import { setupGlossaryButtons } from '../src/glossary.js';

// Mock the glossary sub-modules
jest.mock('../src/glossary-loader.js', () => ({
  loadGlossaryData: jest.fn(),
  showGlossaryError: jest.fn()
}));

jest.mock('../src/glossary-buttons.js', () => ({
  setupShotButtons: jest.fn()
}));

jest.mock('../src/glossary-dimensions.js', () => ({
  setupDimensionControls: jest.fn()
}));

describe('Glossary Module Coordination', () => {
  
  let mockPanel, mockGetCurrentShot, mockUpdateStatus;
  let mockGlossaryData;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock panel with required elements
    mockPanel = {
      querySelector: jest.fn((selector) => {
        const elements = {
          '#label-buttons': { innerHTML: '' },
          '#dimension-controls': { innerHTML: '' }
        };
        return elements[selector] || null;
      })
    };
    
    mockGetCurrentShot = jest.fn(() => ({ label: '', start: 0, end: 0 }));
    mockUpdateStatus = jest.fn();
    
    mockGlossaryData = {
      shots: [
        { name: 'Clear', category: 'offensive' },
        { name: 'Drop', category: 'deceptive' }
      ],
      dimensions: {
        longitudinalPosition: ['Front', 'Mid', 'Back'],
        lateralPosition: ['Left', 'Center', 'Right']
      }
    };
  });
  
  describe('setupGlossaryButtons', () => {
    
    it('should set up glossary UI successfully', async () => {
      const { loadGlossaryData } = require('../src/glossary-loader.js');
      const { setupShotButtons } = require('../src/glossary-buttons.js');
      const { setupDimensionControls } = require('../src/glossary-dimensions.js');
      
      // Mock successful data loading
      loadGlossaryData.mockResolvedValue(mockGlossaryData);
      
      await setupGlossaryButtons(mockPanel, mockGetCurrentShot, mockUpdateStatus);
      
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(loadGlossaryData).toHaveBeenCalled();
      expect(setupShotButtons).toHaveBeenCalledWith(
        mockPanel.querySelector('#label-buttons'),
        mockGlossaryData.shots,
        mockGetCurrentShot,
        mockUpdateStatus
      );
      expect(setupDimensionControls).toHaveBeenCalledWith(
        mockPanel.querySelector('#dimension-controls'),
        mockGlossaryData.dimensions,
        mockGetCurrentShot,
        mockUpdateStatus
      );
    });
    
    it('should handle missing container elements', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const badPanel = {
        querySelector: jest.fn(() => null)
      };
      
      setupGlossaryButtons(badPanel, mockGetCurrentShot, mockUpdateStatus);
      
      expect(consoleSpy).toHaveBeenCalledWith('Glossary container elements not found');
      consoleSpy.mockRestore();
    });
    
    it('should clear existing content before setup', async () => {
      const { loadGlossaryData } = require('../src/glossary-loader.js');
      loadGlossaryData.mockResolvedValue(mockGlossaryData);
      
      const labelDiv = { innerHTML: 'old content' };
      const dimensionDiv = { innerHTML: 'old content' };
      
      mockPanel.querySelector.mockImplementation((selector) => {
        if (selector === '#label-buttons') return labelDiv;
        if (selector === '#dimension-controls') return dimensionDiv;
        return null;
      });
      
      setupGlossaryButtons(mockPanel, mockGetCurrentShot, mockUpdateStatus);
      
      expect(labelDiv.innerHTML).toBe('');
      expect(dimensionDiv.innerHTML).toBe('');
    });
    
    it('should handle glossary data loading errors', async () => {
      const { loadGlossaryData, showGlossaryError } = require('../src/glossary-loader.js');
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Mock failed data loading
      const testError = new Error('Failed to load glossary');
      loadGlossaryData.mockRejectedValue(testError);
      
      await setupGlossaryButtons(mockPanel, mockGetCurrentShot, mockUpdateStatus);
      
      
      
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load glossary data:', testError);
      expect(showGlossaryError).toHaveBeenCalledWith(
        mockPanel.querySelector('#label-buttons'),
        'Failed to load shot glossary'
      );
      
      consoleErrorSpy.mockRestore();
    });
    
  });
  
  describe('Shot State Management Pattern', () => {
    
    it('should pass getCurrentShot callback to sub-modules', async () => {
      const { loadGlossaryData } = require('../src/glossary-loader.js');
      const { setupShotButtons } = require('../src/glossary-buttons.js');
      const { setupDimensionControls } = require('../src/glossary-dimensions.js');
      
      loadGlossaryData.mockResolvedValue(mockGlossaryData);
      
      await setupGlossaryButtons(mockPanel, mockGetCurrentShot, mockUpdateStatus);
      
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Verify callbacks are passed correctly
      expect(setupShotButtons).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Array),
        mockGetCurrentShot,
        mockUpdateStatus
      );
      expect(setupDimensionControls).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        mockGetCurrentShot,
        mockUpdateStatus
      );
    });
    
    it('should not manage shot state directly', async () => {
      const { loadGlossaryData } = require('../src/glossary-loader.js');
      loadGlossaryData.mockResolvedValue(mockGlossaryData);
      
      setupGlossaryButtons(mockPanel, mockGetCurrentShot, mockUpdateStatus);
      
      // The module should not create or manage shot objects directly
      // It should only coordinate sub-modules and pass callbacks
      expect(mockGetCurrentShot).not.toHaveBeenCalled(); // Only called by sub-modules
    });
    
  });
  
  describe('Module Integration', () => {
    
    it('should coordinate all glossary sub-modules', async () => {
      const { loadGlossaryData } = require('../src/glossary-loader.js');
      const { setupShotButtons } = require('../src/glossary-buttons.js');
      const { setupDimensionControls } = require('../src/glossary-dimensions.js');
      
      loadGlossaryData.mockResolvedValue(mockGlossaryData);
      
      setupGlossaryButtons(mockPanel, mockGetCurrentShot, mockUpdateStatus);
      
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Verify all modules are set up
      expect(loadGlossaryData).toHaveBeenCalledTimes(1);
      expect(setupShotButtons).toHaveBeenCalledTimes(1);
      expect(setupDimensionControls).toHaveBeenCalledTimes(1);
    });
    
    it('should maintain consistency with legacy API', () => {
      // The function signature should remain compatible
      expect(() => {
        setupGlossaryButtons(mockPanel, mockGetCurrentShot, mockUpdateStatus);
      }).not.toThrow();
      
      // Should accept the same parameters as before modularization
      expect(setupGlossaryButtons).toHaveLength(3); // 3 parameters
    });
    
  });
  
});