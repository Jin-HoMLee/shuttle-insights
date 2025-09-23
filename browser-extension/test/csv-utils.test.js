/**
 * Tests for CSV utilities module
 * 
 * Validates CSV parsing, field extraction, and data validation logic
 */

import { 
  mapCSVColumns, 
  parseCSVRow, 
  extractShotFromRow, 
  cleanFieldValue, 
  escapeCSVField, 
  validateCSVFormat 
} from '../src/utils/data/csv-utils.js';

describe('CSV Utilities', () => {
  
  describe('mapCSVColumns', () => {
    it('should map standard CSV headers to indices', () => {
      const headers = ['video_url', 'shot_id', 'start_sec', 'end_sec', 'label', 'longitudinal_position'];
      const mapping = mapCSVColumns(headers);
      
      expect(mapping.start).toBe(2);
      expect(mapping.end).toBe(3);
      expect(mapping.label).toBe(4);
      expect(mapping.longitudinalPosition).toBe(5);
    });
    
    it('should return -1 for missing columns', () => {
      const headers = ['start_sec', 'end_sec'];
      const mapping = mapCSVColumns(headers);
      
      expect(mapping.label).toBe(-1);
      expect(mapping.timing).toBe(-1);
    });
  });
  
  describe('parseCSVRow', () => {
    it('should parse simple CSV row', () => {
      const row = 'value1,value2,value3';
      const result = parseCSVRow(row);
      
      expect(result).toEqual(['value1', 'value2', 'value3']);
    });
    
    it('should handle quoted fields with commas', () => {
      const row = '"Field with, comma","Regular field","Another, field"';
      const result = parseCSVRow(row);
      
      expect(result).toEqual(['Field with, comma', 'Regular field', 'Another, field']);
    });
    
    it('should handle empty fields', () => {
      const row = 'value1,,value3';
      const result = parseCSVRow(row);
      
      expect(result).toEqual(['value1', '', 'value3']);
    });
  });
  
  describe('extractShotFromRow', () => {
    const basicIndices = {
      start: 0,
      end: 1, 
      label: 2,
      longitudinalPosition: -1,
      lateralPosition: -1
    };
    
    it('should extract basic shot data', () => {
      const fields = ['10.5', '15.2', 'Clear'];
      const shot = extractShotFromRow(fields, basicIndices);
      
      expect(shot).toEqual({
        start: 10.5,
        end: 15.2,
        label: 'Clear'
      });
    });
    
    it('should extract shot with dimensions', () => {
      const indices = {
        start: 0,
        end: 1,
        label: 2,
        longitudinalPosition: 3,
        lateralPosition: 4
      };
      const fields = ['10.5', '15.2', 'Clear', 'Front', 'Left'];
      const shot = extractShotFromRow(fields, indices);
      
      expect(shot).toEqual({
        start: 10.5,
        end: 15.2,
        label: 'Clear',
        longitudinalPosition: 'Front',
        lateralPosition: 'Left'
      });
    });
    
    it('should return null for invalid time values', () => {
      const fields = ['invalid', '15.2', 'Clear'];
      const shot = extractShotFromRow(fields, basicIndices);
      
      expect(shot).toBeNull();
    });
    
    it('should throw error for missing required columns', () => {
      const badIndices = { start: -1, end: 1, label: 2 };
      const fields = ['10.5', '15.2', 'Clear'];
      
      expect(() => extractShotFromRow(fields, badIndices))
        .toThrow('Required columns (start_sec, end_sec, label) not found');
    });
  });
  
  describe('cleanFieldValue', () => {
    it('should remove quotes and trim whitespace', () => {
      expect(cleanFieldValue('"quoted value"')).toBe('quoted value');
      expect(cleanFieldValue('  spaced  ')).toBe('spaced');
      expect(cleanFieldValue('"  quoted and spaced  "')).toBe('quoted and spaced');
    });
    
    it('should handle empty and null values', () => {
      expect(cleanFieldValue('')).toBe('');
      expect(cleanFieldValue(null)).toBe('');
      expect(cleanFieldValue(undefined)).toBe('');
    });
  });
  
  describe('escapeCSVField', () => {
    it('should quote and escape values', () => {
      expect(escapeCSVField('simple')).toBe('"simple"');
      expect(escapeCSVField('value with "quotes"')).toBe('"value with ""quotes"""');
      expect(escapeCSVField('')).toBe('""');
    });
    
    it('should handle null/undefined values', () => {
      expect(escapeCSVField(null)).toBe('""');
      expect(escapeCSVField(undefined)).toBe('""');
    });
  });
  
  describe('validateCSVFormat', () => {
    it('should accept valid CSV format', () => {
      const validCSV = 'header1,header2\nvalue1,value2\nvalue3,value4';
      const lines = validateCSVFormat(validCSV);
      
      expect(lines).toHaveLength(3);
      expect(lines[0]).toBe('header1,header2');
    });
    
    it('should reject CSV with only headers', () => {
      const headerOnlyCSV = 'header1,header2';
      
      expect(() => validateCSVFormat(headerOnlyCSV))
        .toThrow('CSV file must contain headers and at least one data row');
    });
    
    it('should reject empty CSV', () => {
      expect(() => validateCSVFormat(''))
        .toThrow('CSV file must contain headers and at least one data row');
    });
  });
});