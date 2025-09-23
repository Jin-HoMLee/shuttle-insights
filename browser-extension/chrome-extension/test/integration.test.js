/**
 * Integration test for modular imports and structure validation
 * 
 * Validates that the modular structure properly integrates
 */

describe('Module Integration Validation', () => {
  
  describe('Import Structure', () => {
    
    it('should allow importing all main modules', () => {
      expect(() => {
        require('../src/panel.js');
        require('../src/csv.js');
        require('../src/glossary.js');
        require('../src/panel-coordinator.js');
      }).not.toThrow();
    });
    
    it('should allow importing all utility modules', () => {
      expect(() => {
        require('../src/utils/ui/ui-utils.js');
        require('../src/utils/data/csv-utils.js');
        require('../src/constants.js');
      }).not.toThrow();
    });
    
    it('should allow importing all sub-modules', () => {
      expect(() => {
        require('../src/csv-import.js');
        require('../src/csv-export.js');
        require('../src/glossary-loader.js');
        require('../src/glossary-buttons.js');
        require('../src/glossary-dimensions.js');
        require('../src/panel-factory.js');
        require('../src/panel-events.js');
        require('../src/panel-workflow.js');
        require('../src/panel-templates.js');
      }).not.toThrow();
    });
    
  });
  
  describe('Export Validation', () => {
    
    it('should export expected functions from main modules', () => {
      const panelModule = require('../src/panel.js');
      const csvModule = require('../src/csv.js');
      const glossaryModule = require('../src/glossary.js');
      
      expect(panelModule.createLabelerPanel).toBeDefined();
      expect(panelModule.togglePanel).toBeDefined();
      expect(csvModule.setupCSV).toBeDefined();
      expect(glossaryModule.setupGlossaryButtons).toBeDefined();
    });
    
    it('should export expected functions from utility modules', () => {
      const csvUtils = require('../src/utils/data/csv-utils.js');
      const uiUtils = require('../src/utils/ui/ui-utils.js');
      
      expect(csvUtils.parseCSVRow).toBeDefined();
      expect(csvUtils.escapeCSVField).toBeDefined();
      expect(uiUtils.formatDateTime).toBeDefined();
      expect(uiUtils.sanitize).toBeDefined();
    });
    
  });
  
  describe('Modular Architecture Validation', () => {
    
    it('should have split large files into smaller modules', () => {
      // Verify that main modules are now coordination layers
      const fs = require('fs');
      const path = require('path');
      
      const panelPath = path.resolve(__dirname, '../src/panel.js');
      const csvPath = path.resolve(__dirname, '../src/csv.js');
      const glossaryPath = path.resolve(__dirname, '../src/glossary.js');
      
      const panelSize = fs.statSync(panelPath).size;
      const csvSize = fs.statSync(csvPath).size;
      const glossarySize = fs.statSync(glossaryPath).size;
      
      // These should be small coordination files (less than 5KB each)
      expect(panelSize).toBeLessThan(5000);
      expect(csvSize).toBeLessThan(5000);
      // Glossary may have more comments, but should not be much larger than other modules
      const maxMainModuleSize = Math.max(panelSize, csvSize);
      expect(glossarySize).toBeLessThan(maxMainModuleSize * 2); // Allow up to 2x the largest main module
    });
    
    it('should maintain backward compatibility', () => {
      // Main modules should still work as before
      const { createLabelerPanel, togglePanel } = require('../src/panel.js');
      const { setupCSV } = require('../src/csv.js');
      const { setupGlossaryButtons } = require('../src/glossary.js');
      
      expect(typeof createLabelerPanel).toBe('function');
      expect(typeof togglePanel).toBe('function');
      expect(typeof setupCSV).toBe('function');
      expect(typeof setupGlossaryButtons).toBe('function');
    });
    
  });
  
  describe('Build Integration', () => {
    
    it('should have successfully built the extension', () => {
      const fs = require('fs');
      const path = require('path');
      
      const distPath = path.resolve(__dirname, '../dist/content.js');
      expect(fs.existsSync(distPath)).toBe(true);
      
      const stats = fs.statSync(distPath);
      expect(stats.size).toBeGreaterThan(1000000); // Should be > 1MB (includes TensorFlow)
    });
    
  });
  
});