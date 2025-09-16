/**
 * Tests for Enhanced Badminton Shot Labeler Features
 * 
 * These tests validate the new coach workflow features including
 * quick shot selection, custom labels, and context form functionality.
 */

// Mock chrome storage API
global.chrome = {
  storage: {
    local: {
      data: {},
      get: function(keys) {
        return Promise.resolve(
          keys.reduce((result, key) => {
            result[key] = this.data[key] || null;
            return result;
          }, {})
        );
      },
      set: function(items) {
        Object.assign(this.data, items);
        return Promise.resolve();
      }
    }
  }
};

import { QUICK_SHOT_TYPES, RALLY_CONTEXTS, DEFAULT_SHOT, KEYBOARD_SHORTCUTS } from '../src/constants.js';

describe('Enhanced Badminton Shot Labeler', () => {
  describe('Quick Shot Types', () => {
    it('should have 9 predefined shot types', () => {
      expect(QUICK_SHOT_TYPES).toHaveLength(9);
    });

    it('should have proper key mappings (1-9)', () => {
      QUICK_SHOT_TYPES.forEach((shot, index) => {
        expect(shot.key).toBe(String(index + 1));
      });
    });

    it('should include common badminton shots', () => {
      const shotLabels = QUICK_SHOT_TYPES.map(shot => shot.label);
      expect(shotLabels).toContain('Smash');
      expect(shotLabels).toContain('Clear');
      expect(shotLabels).toContain('Drop');
      expect(shotLabels).toContain('Drive');
      expect(shotLabels).toContain('Net Shot');
    });
  });

  describe('Rally Contexts', () => {
    it('should have predefined rally contexts', () => {
      expect(RALLY_CONTEXTS).toContain('Opening rally');
      expect(RALLY_CONTEXTS).toContain('Mid-rally');
      expect(RALLY_CONTEXTS).toContain('Game point');
      expect(RALLY_CONTEXTS).toContain('Set point');
      expect(RALLY_CONTEXTS).toContain('Match point');
    });
  });

  describe('Enhanced Shot Structure', () => {
    it('should include new coach workflow fields', () => {
      expect(DEFAULT_SHOT).toHaveProperty('player');
      expect(DEFAULT_SHOT).toHaveProperty('score');
      expect(DEFAULT_SHOT).toHaveProperty('rallyContext');
      expect(DEFAULT_SHOT).toHaveProperty('coachingNotes');
    });

    it('should maintain existing fields', () => {
      expect(DEFAULT_SHOT).toHaveProperty('start');
      expect(DEFAULT_SHOT).toHaveProperty('end');
      expect(DEFAULT_SHOT).toHaveProperty('label');
      expect(DEFAULT_SHOT).toHaveProperty('longitudinalPosition');
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should include number key shortcuts for quick shots', () => {
      for (let i = 1; i <= 9; i++) {
        expect(KEYBOARD_SHORTCUTS).toHaveProperty(`SHOT_${i}`);
        expect(KEYBOARD_SHORTCUTS[`SHOT_${i}`]).toBe(`Digit${i}`);
      }
    });

    it('should maintain existing keyboard shortcuts', () => {
      expect(KEYBOARD_SHORTCUTS.MARK_START).toBe('KeyS');
      expect(KEYBOARD_SHORTCUTS.MARK_END).toBe('KeyE');
      expect(KEYBOARD_SHORTCUTS.TOGGLE_OVERLAY).toBe('KeyO');
      expect(KEYBOARD_SHORTCUTS.CLOSE_PANEL).toBe('Escape');
    });
  });

  describe('Shot Validation', () => {
    it('should create valid shot object with all fields', () => {
      const shot = {
        ...DEFAULT_SHOT,
        start: 45.23,
        end: 46.12,
        label: 'Smash',
        player: 'Lin Dan',
        score: '15-12',
        rallyContext: 'Mid-rally',
        coachingNotes: 'Excellent power and placement'
      };

      expect(shot.start).toBe(45.23);
      expect(shot.end).toBe(46.12);
      expect(shot.label).toBe('Smash');
      expect(shot.player).toBe('Lin Dan');
      expect(shot.score).toBe('15-12');
      expect(shot.rallyContext).toBe('Mid-rally');
      expect(shot.coachingNotes).toBe('Excellent power and placement');
    });
  });
});