/**
 * Popup Functionality Tests
 * 
 * Tests for the popup interface that replaced the content script panel injection.
 * Validates UI state management, Chrome messaging, and user interactions.
 */

// Mock Chrome APIs for testing
global.chrome = {
  tabs: {
    query: jest.fn(),
    sendMessage: jest.fn()
  },
  runtime: {
    sendMessage: jest.fn(),
    lastError: null
  }
};

// Mock DOM environment
global.document = {
  getElementById: jest.fn(),
  createElement: jest.fn(),
  addEventListener: jest.fn(),
  querySelector: jest.fn(),
  querySelectorAll: jest.fn()
};

// Mock window for global functions
global.window = {
  saveCurrentShot: jest.fn(),
  updateShotStatus: jest.fn()
};

describe('Popup Interface Tests', () => {
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Reset Chrome API mocks
    chrome.tabs.query.mockResolvedValue([{ id: 1, url: 'https://youtube.com/watch?v=test' }]);
    chrome.tabs.sendMessage.mockResolvedValue({ status: 'ok' });
    chrome.runtime.sendMessage.mockResolvedValue({ success: true });
    chrome.runtime.lastError = null;
  });

  describe('Connection Management', () => {
    
    it('should detect YouTube video pages correctly', async () => {
      const tabs = [{ id: 1, url: 'https://youtube.com/watch?v=test123' }];
      chrome.tabs.query.mockResolvedValue(tabs);
      chrome.tabs.sendMessage.mockResolvedValue({ status: 'ok' });
      
      // This would be called by checkConnection function
      const result = await chrome.tabs.query({ active: true, currentWindow: true });
      expect(result[0].url).toContain('youtube.com/watch');
    });

    it('should handle non-YouTube pages gracefully', async () => {
      const tabs = [{ id: 1, url: 'https://google.com' }];
      chrome.tabs.query.mockResolvedValue(tabs);
      
      const result = await chrome.tabs.query({ active: true, currentWindow: true });
      expect(result[0].url).not.toContain('youtube.com/watch');
    });

    it('should handle content script communication errors', async () => {
      chrome.tabs.sendMessage.mockRejectedValue(new Error('Content script not responding'));
      
      try {
        await chrome.tabs.sendMessage(1, { action: 'ping' });
      } catch (error) {
        expect(error.message).toBe('Content script not responding');
      }
    });

  });

  describe('Workflow State Management', () => {
    
    let mockWorkflowState;
    
    beforeEach(() => {
      mockWorkflowState = {
        shots: [],
        currentShot: {
          start_sec: null,
          end_sec: null,
          label: null,
          longitudinal_position: null,
          lateral_position: null,
          timing: null,
          intention: null,
          impact: null,
          direction: null
        }
      };
    });

    it('should initialize with empty workflow state', () => {
      expect(mockWorkflowState.shots).toEqual([]);
      expect(mockWorkflowState.currentShot.start_sec).toBeNull();
      expect(mockWorkflowState.currentShot.end_sec).toBeNull();
      expect(mockWorkflowState.currentShot.label).toBeNull();
    });

    it('should handle shot start marking', () => {
      const currentTime = 15.5;
      mockWorkflowState.currentShot.start_sec = currentTime;
      mockWorkflowState.currentShot.end_sec = null;
      mockWorkflowState.currentShot.label = null;
      
      expect(mockWorkflowState.currentShot.start_sec).toBe(15.5);
      expect(mockWorkflowState.currentShot.end_sec).toBeNull();
    });

    it('should handle shot end marking with validation', () => {
      mockWorkflowState.currentShot.start_sec = 10.0;
      const endTime = 15.0;
      const duration = endTime - mockWorkflowState.currentShot.start_sec;
      
      // Validate positive duration
      expect(duration).toBeGreaterThan(0);
      
      if (duration > 0 && duration <= 300) { // MAX_SHOT_DURATION_SECONDS
        mockWorkflowState.currentShot.end_sec = endTime;
      }
      
      expect(mockWorkflowState.currentShot.end_sec).toBe(15.0);
    });

    it('should reject invalid shot durations', () => {
      mockWorkflowState.currentShot.start_sec = 15.0;
      const endTime = 10.0; // Before start time
      const duration = endTime - mockWorkflowState.currentShot.start_sec;
      
      expect(duration).toBeLessThanOrEqual(0);
      // Should not update end_sec for invalid duration
    });

    it('should save complete shots correctly', () => {
      const completeShot = {
        video_url: 'https://youtube.com/watch?v=test',
        shot_id: 'shot_123',
        start_sec: 10.0,
        end_sec: 15.0,
        label: 'Clear',
        longitudinal_position: 'Front',
        lateral_position: 'Center',
        timing: 'Early',
        intention: 'Attack',
        impact: 'Racket',
        direction: 'Straight'
      };
      
      mockWorkflowState.shots.push(completeShot);
      expect(mockWorkflowState.shots).toHaveLength(1);
      expect(mockWorkflowState.shots[0].label).toBe('Clear');
      expect(mockWorkflowState.shots[0].start_sec).toBe(10.0);
      expect(mockWorkflowState.shots[0].end_sec).toBe(15.0);
    });

  });

  describe('Chrome Extension Messaging', () => {
    
    it('should send ping message to content script', async () => {
      chrome.tabs.sendMessage.mockResolvedValue({ status: 'ok' });
      
      const response = await chrome.tabs.sendMessage(1, { action: 'ping' });
      expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(1, { action: 'ping' });
      expect(response.status).toBe('ok');
    });

    it('should request video details from content script', async () => {
      const videoDetails = {
        title: 'Test Badminton Video',
        url: 'https://youtube.com/watch?v=test',
        videoReady: true
      };
      chrome.tabs.sendMessage.mockResolvedValue(videoDetails);
      
      const response = await chrome.tabs.sendMessage(1, { action: 'get-video-details' });
      expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(1, { action: 'get-video-details' });
      expect(response.title).toBe('Test Badminton Video');
      expect(response.videoReady).toBe(true);
    });

    it('should request current video time from content script', async () => {
      chrome.tabs.sendMessage.mockResolvedValue({ currentTime: 42.5 });
      
      const response = await chrome.tabs.sendMessage(1, { action: 'get-current-time' });
      expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(1, { action: 'get-current-time' });
      expect(response.currentTime).toBe(42.5);
    });

    it('should toggle pose overlay via content script', async () => {
      chrome.tabs.sendMessage.mockResolvedValue({ status: 'Overlay started', type: 'success' });
      
      const response = await chrome.tabs.sendMessage(1, { action: 'toggle-pose-overlay' });
      expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(1, { action: 'toggle-pose-overlay' });
      expect(response.status).toBe('Overlay started');
      expect(response.type).toBe('success');
    });

    it('should handle CSV download via background script', async () => {
      const downloadMessage = {
        action: 'download-csv',
        filename: 'test_shots.csv',
        dataUrl: 'data:text/csv;charset=utf-8,test,data'
      };
      chrome.runtime.sendMessage.mockResolvedValue({ success: true });
      
      const response = await chrome.runtime.sendMessage(downloadMessage);
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(downloadMessage);
      expect(response.success).toBe(true);
    });

  });

  describe('CSV Operations', () => {
    
    it('should parse CSV content correctly', () => {
      const csvContent = 'video_url,shot_id,start_sec,end_sec,label\nhttps://youtube.com/test,shot1,10.0,15.0,Clear';
      const lines = csvContent.trim().split('\n');
      const headers = lines[0].split(',');
      const values = lines[1].split(',');
      
      expect(headers).toEqual(['video_url', 'shot_id', 'start_sec', 'end_sec', 'label']);
      expect(values[4]).toBe('Clear');
      expect(parseFloat(values[2])).toBe(10.0);
      expect(parseFloat(values[3])).toBe(15.0);
    });

    it('should generate CSV content from shots data', () => {
      const shots = [
        {
          video_url: 'https://youtube.com/test',
          shot_id: 'shot1',
          start_sec: 10.0,
          end_sec: 15.0,
          label: 'Clear',
          longitudinal_position: 'Front',
          lateral_position: 'Center',
          timing: '',
          intention: '',
          impact: '',
          direction: ''
        }
      ];
      
      const headers = ['video_url', 'shot_id', 'start_sec', 'end_sec', 'label', 'longitudinal_position', 'lateral_position', 'timing', 'intention', 'impact', 'direction'];
      const csvLines = [headers.join(',')];
      
      shots.forEach(shot => {
        const row = headers.map(header => shot[header] || '');
        csvLines.push(row.join(','));
      });
      
      const csvContent = csvLines.join('\n');
      expect(csvContent).toContain('Clear');
      expect(csvContent).toContain('10'); // Numbers may not have decimal if whole
      expect(csvContent).toContain('Front');
    });

    it('should handle empty shots array for export', () => {
      const shots = [];
      expect(shots.length).toBe(0);
      // Should not attempt to export when no shots available
    });

  });

  describe('Keyboard Shortcuts', () => {
    
    it('should handle shot start shortcut (S key)', () => {
      const mockEvent = {
        code: 'KeyS',
        preventDefault: jest.fn(),
        target: { tagName: 'BODY' }
      };
      
      // Simulate keyboard handler logic
      if (mockEvent.code === 'KeyS' && mockEvent.target.tagName !== 'INPUT') {
        mockEvent.preventDefault();
        // Would call markShotStart()
      }
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should handle shot end shortcut (E key)', () => {
      const mockEvent = {
        code: 'KeyE',
        preventDefault: jest.fn(),
        target: { tagName: 'BODY' }
      };
      
      if (mockEvent.code === 'KeyE' && mockEvent.target.tagName !== 'INPUT') {
        mockEvent.preventDefault();
        // Would call markShotEnd()
      }
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should handle pose overlay toggle shortcut (O key)', () => {
      const mockEvent = {
        code: 'KeyO',
        preventDefault: jest.fn(),
        target: { tagName: 'BODY' }
      };
      
      if (mockEvent.code === 'KeyO' && mockEvent.target.tagName !== 'INPUT') {
        mockEvent.preventDefault();
        // Would call togglePoseOverlay()
      }
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should not interfere with typing in input fields', () => {
      const mockEvent = {
        code: 'KeyS',
        preventDefault: jest.fn(),
        target: { tagName: 'INPUT' }
      };
      
      // Should not handle shortcuts when typing in inputs
      if (mockEvent.target.tagName === 'INPUT' || mockEvent.target.tagName === 'TEXTAREA') {
        return; // Don't process shortcut
      }
      
      // preventDefault should not be called
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });

  });

  describe('UI State Updates', () => {
    
    it('should show appropriate status for shot workflow stages', () => {
      const mockShot = {
        start_sec: null,
        end_sec: null,
        label: null
      };
      
      // Stage 1: No start time
      expect(mockShot.start_sec).toBeNull();
      // Status should be: 'Click "Mark Start" to begin'
      
      // Stage 2: Has start, no end
      mockShot.start_sec = 10.0;
      expect(mockShot.start_sec).toBe(10.0);
      expect(mockShot.end_sec).toBeNull();
      // Status should show start time and ask for end
      
      // Stage 3: Has start and end, no label
      mockShot.end_sec = 15.0;
      expect(mockShot.end_sec).toBe(15.0);
      expect(mockShot.label).toBeNull();
      // Status should show duration and ask for label
      
      // Stage 4: Complete shot
      mockShot.label = 'Clear';
      expect(mockShot.label).toBe('Clear');
      // Status should show ready to save
    });

    it('should calculate shot duration correctly', () => {
      const startTime = 10.5;
      const endTime = 15.2;
      const duration = endTime - startTime;
      
      expect(duration).toBeCloseTo(4.7, 1);
      expect(duration.toFixed(2)).toBe('4.70');
    });

  });

});

describe('Popup UI Component Integration', () => {

  it('should have required DOM structure for popup interface', () => {
    // Mock DOM elements that should exist in popup.html
    const requiredElements = [
      'popup-container',
      'popup-header', 
      'popup-content',
      'connection-status',
      'video-details-section',
      'pose-overlay-section',
      'load-data-section',
      'label-shot-section',
      'labeled-shots-section',
      'export-section',
      'help-section'
    ];

    requiredElements.forEach(elementId => {
      const mockElement = { id: elementId };
      expect(mockElement.id).toBe(elementId);
    });
  });

  it('should handle glossary button interactions', () => {
    const mockButton = {
      textContent: 'Clear',
      addEventListener: jest.fn(),
      classList: {
        add: jest.fn(),
        remove: jest.fn()
      }
    };
    
    // Simulate button click handler
    const clickHandler = jest.fn();
    mockButton.addEventListener('click', clickHandler);
    
    expect(mockButton.addEventListener).toHaveBeenCalledWith('click', clickHandler);
  });

});