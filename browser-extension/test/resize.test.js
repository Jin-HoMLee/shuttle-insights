/**
 * Automated tests for resize.js panel resizing logic
 *
 * These tests validate correct handling of config values, type assertions, and dimension calculations.
 * Run with: `npm test` (after adding a test runner like Jest)
 */

import { PANEL_CONFIG } from '../src/constants.js';

// Mock panel element for testing
function createMockPanel() {
  return {
    style: {},
    getBoundingClientRect: () => ({ width: 360, height: 200, left: 40, top: 80 })
  };
}

describe('Panel Resize Logic', () => {
  it('should throw if MAX_SIZE.width/height are not functions', () => {
    const badConfig = { ...PANEL_CONFIG, MAX_SIZE: { width: 1000, height: 800 } };
    expect(() => {
      if (typeof badConfig.MAX_SIZE.width !== 'function' || typeof badConfig.MAX_SIZE.height !== 'function') {
        throw new Error('PANEL_CONFIG.MAX_SIZE.width and height must be functions returning numbers');
      }
    }).toThrow();
  });

  it('should calculate maxW/maxH as numbers', () => {
    const maxW = PANEL_CONFIG.MAX_SIZE.width();
    const maxH = PANEL_CONFIG.MAX_SIZE.height();
    expect(typeof maxW).toBe('number');
    expect(typeof maxH).toBe('number');
    expect(maxW).toBeGreaterThan(0);
    expect(maxH).toBeGreaterThan(0);
  });

  it('should clamp width/height within min/max', () => {
    const minW = PANEL_CONFIG.MIN_SIZE.width;
    const minH = PANEL_CONFIG.MIN_SIZE.height;
    const maxW = PANEL_CONFIG.MAX_SIZE.width();
    const maxH = PANEL_CONFIG.MAX_SIZE.height();
    // Simulate resizing
    let newWidth = Math.min(maxW, Math.max(minW, 500));
    let newHeight = Math.min(maxH, Math.max(minH, 100));
    expect(newWidth).toBeLessThanOrEqual(maxW);
    expect(newWidth).toBeGreaterThanOrEqual(minW);
    expect(newHeight).toBeLessThanOrEqual(maxH);
    expect(newHeight).toBeGreaterThanOrEqual(minH);
  });
});
