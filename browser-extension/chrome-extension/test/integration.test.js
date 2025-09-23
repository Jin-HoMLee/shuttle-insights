/**
 * Integration test for modular imports and structure validation
 * 
 * Validates that the modular structure properly integrates
 */

import * as panel from '../src/panel.js';
import * as csv from '../src/csv.js';
import * as glossary from '../src/glossary.js';
import * as panelCoordinator from '../src/panel-coordinator.js';
import * as uiUtils from '../src/utils/ui/ui-utils.js';
import * as csvUtils from '../src/utils/data/csv-utils.js';
import * as constants from '../src/constants.js';
import * as csvImport from '../src/csv-import.js';
import * as csvExport from '../src/csv-export.js';
import * as glossaryLoader from '../src/glossary-loader.js';
import * as glossaryButtons from '../src/glossary-buttons.js';
import * as glossaryDimensions from '../src/glossary-dimensions.js';
import * as panelFactory from '../src/panel-factory.js';
import * as panelEvents from '../src/panel-events.js';
import * as panelWorkflow from '../src/panel-workflow.js';
import * as panelTemplates from '../src/panel-templates.js';

describe('Module Integration Validation', () => {
  
  describe('Import Structure', () => {
    
    it('should allow importing all main modules', () => {
      expect(() => {
        // Modules already imported at top of file
        expect(panel).toBeDefined();
        expect(csv).toBeDefined();
        expect(glossary).toBeDefined();
        expect(panelCoordinator).toBeDefined();
      }).not.toThrow();
    });
    
    it('should allow importing all utility modules', () => {
      expect(() => {
        // Modules already imported at top of file
        expect(uiUtils).toBeDefined();
        expect(csvUtils).toBeDefined();
        expect(constants).toBeDefined();
      }).not.toThrow();
    });
    
    it('should allow importing all sub-modules', () => {
      expect(() => {
        // Modules already imported at top of file
        expect(csvImport).toBeDefined();
        expect(csvExport).toBeDefined();
        expect(glossaryLoader).toBeDefined();
        expect(glossaryButtons).toBeDefined();
        expect(glossaryDimensions).toBeDefined();
        expect(panelFactory).toBeDefined();
        expect(panelEvents).toBeDefined();
        expect(panelWorkflow).toBeDefined();
        expect(panelTemplates).toBeDefined();
      }).not.toThrow();
    });
    
  });
  
  describe('Export Validation', () => {
    
    it('should export expected functions from main modules', () => {
      expect(panel.createLabelerPanel).toBeDefined();
      expect(panel.togglePanel).toBeDefined();
      expect(csv.setupCSV).toBeDefined();
      expect(glossary.setupGlossaryButtons).toBeDefined();
    });
    
    it('should export expected functions from utility modules', () => {
      expect(csvUtils.parseCSVRow).toBeDefined();
      expect(csvUtils.escapeCSVField).toBeDefined();
      expect(uiUtils.formatDateTime).toBeDefined();
      expect(uiUtils.sanitize).toBeDefined();
    });
    
  });
  
  describe('Modular Architecture Validation', () => {
    
    it('should have split large files into smaller modules', () => {
      // Note: For this file system test, we keep require() as it's more 
      // appropriate for Node.js file operations in test context
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
      expect(typeof panel.createLabelerPanel).toBe('function');
      expect(typeof panel.togglePanel).toBe('function');
      expect(typeof csv.setupCSV).toBe('function');
      expect(typeof glossary.setupGlossaryButtons).toBe('function');
    });
    
  });
  
  describe('Build Integration', () => {
    
    it('should have successfully built the extension', () => {
      // Note: For this file system test, we keep require() as it's more 
      // appropriate for Node.js file operations in test context.
      const fs = require('fs');
      const path = require('path');
      
      const distPath = path.resolve(__dirname, '../dist/content.js');
      expect(fs.existsSync(distPath)).toBe(true);
      
      const stats = fs.statSync(distPath);
      expect(stats.size).toBeGreaterThan(1000000); // Should be > 1MB (includes TensorFlow)
    });
    
  });
  
});