/**
 * Popup Script - Main UI Logic for Extension Popup
 * 
 * This script handles the popup interface functionality including:
 * - Communication with content script on active YouTube tab
 * - UI state management for shot labeling workflow
 * - Event handling for all popup controls
 * - Glossary button generation and dimension controls
 * - CSV import/export operations
 * 
 * Key Responsibilities:
 * - Popup initialization and connection status
 * - Shot marking workflow management (start/end, labeling)
 * - Pose overlay control via messaging
 * - CSV data management and export
 * - UI state synchronization with content script
 */

import { setupGlossaryButtons } from './glossary.js';
import { parseCSVRow, escapeCSVField } from './utils/data/csv-utils.js';
import { formatDateTime, sanitize } from './utils/ui/ui-utils.js';
import { UI_IDS, EVENTS, CSV_HEADERS, MAX_SHOT_DURATION_SECONDS } from './constants.js';

// Popup state management
let currentTab = null;
let connected = false;
let workflowState = {
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

// DOM element references
let elements = {};

/**
 * Initialize the popup interface
 * Sets up DOM references, checks connection to content script, and initializes UI
 */
async function initializePopup() {
  // Get DOM element references
  elements = {
    connectionStatus: document.getElementById('connection-status'),
    videoDetailsSection: document.getElementById('video-details-section'),
    poseOverlaySection: document.getElementById('pose-overlay-section'),
    loadDataSection: document.getElementById('load-data-section'),
    labelShotSection: document.getElementById('label-shot-section'),
    labeledShotsSection: document.getElementById('labeled-shots-section'),
    exportSection: document.getElementById('export-section'),
    helpSection: document.getElementById('help-section'),
    
    datetime: document.getElementById('popup-datetime'),
    videoTitle: document.getElementById('popup-video-title'),
    url: document.getElementById('popup-url'),
    
    poseToggle: document.getElementById('popup-pose-toggle'),
    overlayStatus: document.getElementById('popup-overlay-status'),
    
    loadCsv: document.getElementById('popup-load-csv'),
    csvFileInput: document.getElementById('popup-csv-file-input'),
    
    markStart: document.getElementById('popup-mark-start'),
    markEnd: document.getElementById('popup-mark-end'),
    shotStatus: document.getElementById('popup-shot-status'),
    labelButtons: document.getElementById('popup-label-buttons'),
    dimensionControls: document.getElementById('popup-dimension-controls'),
    
    labelList: document.getElementById('popup-label-list'),
    saveLabels: document.getElementById('popup-save-labels')
  };

  // Check connection to content script
  await checkConnection();
  
  // Set up event listeners
  setupEventListeners();
  
  // Initialize glossary if connected
  if (connected) {
    await initializeGlossary();
  }
}

/**
 * Check connection to content script on active tab
 * Updates UI based on whether we can communicate with YouTube page
 */
async function checkConnection() {
  try {
    // Get current active tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    currentTab = tabs[0];
    
    // Check if on YouTube
    if (!currentTab.url.includes('youtube.com/watch')) {
      updateConnectionStatus('Not on YouTube video page', 'warning');
      return;
    }
    
    // Try to communicate with content script
    const response = await chrome.tabs.sendMessage(currentTab.id, { action: 'ping' });
    
    if (response && response.status === 'ok') {
      connected = true;
      updateConnectionStatus('Connected to YouTube page', 'success');
      await getVideoDetails();
      showConnectedSections();
    } else {
      updateConnectionStatus('Content script not responding', 'error');
    }
  } catch (error) {
    console.error('Connection check failed:', error);
    updateConnectionStatus('Failed to connect to page', 'error');
  }
}

/**
 * Update connection status display
 * @param {string} message - Status message to display
 * @param {string} type - Status type: 'success', 'warning', 'error'
 */
function updateConnectionStatus(message, type = '') {
  elements.connectionStatus.textContent = message;
  elements.connectionStatus.className = `status-message ${type}`;
}

/**
 * Show UI sections when connected to YouTube page
 */
function showConnectedSections() {
  const sections = [
    elements.videoDetailsSection,
    elements.poseOverlaySection,
    elements.loadDataSection,
    elements.labelShotSection,
    elements.labeledShotsSection,
    elements.exportSection,
    elements.helpSection
  ];
  
  sections.forEach(section => {
    if (section) section.style.display = 'block';
  });
}

/**
 * Get video details from content script
 */
async function getVideoDetails() {
  try {
    const response = await chrome.tabs.sendMessage(currentTab.id, { 
      action: 'get-video-details' 
    });
    
    if (response) {
      const now = new Date();
      const dateTimeStr = formatDateTime(now);
      
      elements.datetime.textContent = dateTimeStr;
      elements.videoTitle.textContent = response.title || 'Unknown';
      elements.url.textContent = response.url || currentTab.url;
    }
  } catch (error) {
    console.error('Failed to get video details:', error);
  }
}

/**
 * Set up event listeners for popup controls
 */
function setupEventListeners() {
  // Pose overlay toggle
  if (elements.poseToggle) {
    elements.poseToggle.addEventListener('click', togglePoseOverlay);
  }
  
  // Shot marking buttons
  if (elements.markStart) {
    elements.markStart.addEventListener('click', markShotStart);
  }
  if (elements.markEnd) {
    elements.markEnd.addEventListener('click', markShotEnd);
  }
  
  // CSV operations
  if (elements.loadCsv) {
    elements.loadCsv.addEventListener('click', () => elements.csvFileInput.click());
  }
  if (elements.csvFileInput) {
    elements.csvFileInput.addEventListener('change', handleCSVImport);
  }
  if (elements.saveLabels) {
    elements.saveLabels.addEventListener('click', exportToCSV);
  }
  
  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboard);
}

/**
 * Initialize glossary buttons and dimension controls
 */
async function initializeGlossary() {
  if (!connected) return;
  
  try {
    // Create a mock panel element with the expected structure for glossary setup
    const mockPanel = document.createElement('div');
    mockPanel.innerHTML = `
      <div id="label-buttons"></div>
      <div id="dimension-controls"></div>
    `;
    
    // Set up glossary buttons using the existing glossary module
    await setupGlossaryButtons(
      mockPanel, 
      () => workflowState.currentShot, 
      updateShotStatus
    );
    
    // Transfer the created elements to our popup containers
    const labelButtons = mockPanel.querySelector('#label-buttons');
    const dimensionControls = mockPanel.querySelector('#dimension-controls');
    
    if (labelButtons && elements.labelButtons) {
      elements.labelButtons.innerHTML = labelButtons.innerHTML;
      // Re-attach event listeners
      attachGlossaryEventListeners(elements.labelButtons);
    }
    
    if (dimensionControls && elements.dimensionControls) {
      elements.dimensionControls.innerHTML = dimensionControls.innerHTML;
      // Re-attach event listeners
      attachGlossaryEventListeners(elements.dimensionControls);
    }
    
    updateShotStatus();
  } catch (error) {
    console.error('Failed to initialize glossary:', error);
  }
}

/**
 * Toggle pose overlay on/off
 */
async function togglePoseOverlay() {
  if (!connected) return;
  
  try {
    elements.poseToggle.classList.add('loading');
    elements.overlayStatus.textContent = 'Toggling overlay...';
    
    const response = await chrome.tabs.sendMessage(currentTab.id, { 
      action: 'toggle-pose-overlay' 
    });
    
    if (response) {
      elements.overlayStatus.textContent = response.status || 'Overlay toggled';
      elements.overlayStatus.className = `status-message ${response.type || ''}`;
    }
  } catch (error) {
    console.error('Failed to toggle pose overlay:', error);
    elements.overlayStatus.textContent = 'Failed to toggle overlay';
    elements.overlayStatus.className = 'status-message error';
  } finally {
    elements.poseToggle.classList.remove('loading');
  }
}

/**
 * Mark the start of a shot
 */
async function markShotStart() {
  if (!connected) return;
  
  try {
    const response = await chrome.tabs.sendMessage(currentTab.id, { 
      action: 'get-current-time' 
    });
    
    if (response && typeof response.currentTime === 'number') {
      workflowState.currentShot.start_sec = response.currentTime;
      workflowState.currentShot.end_sec = null;
      workflowState.currentShot.label = null;
      
      // Reset dimension selections
      resetCurrentShotDimensions();
      
      updateShotStatus();
    }
  } catch (error) {
    console.error('Failed to mark shot start:', error);
    updateShotStatus('Failed to mark start', 'error');
  }
}

/**
 * Mark the end of a shot
 */
async function markShotEnd() {
  if (!connected || !workflowState.currentShot.start_sec) return;
  
  try {
    const response = await chrome.tabs.sendMessage(currentTab.id, { 
      action: 'get-current-time' 
    });
    
    if (response && typeof response.currentTime === 'number') {
      const endTime = response.currentTime;
      const duration = endTime - workflowState.currentShot.start_sec;
      
      // Validate shot duration
      if (duration <= 0) {
        updateShotStatus('End time must be after start time', 'error');
        return;
      }
      
      if (duration > MAX_SHOT_DURATION_SECONDS) {
        updateShotStatus(`Shot too long (max ${MAX_SHOT_DURATION_SECONDS}s)`, 'error');
        return;
      }
      
      workflowState.currentShot.end_sec = endTime;
      updateShotStatus();
    }
  } catch (error) {
    console.error('Failed to mark shot end:', error);
    updateShotStatus('Failed to mark end', 'error');
  }
}

/**
 * Reset dimension selections for current shot
 */
function resetCurrentShotDimensions() {
  workflowState.currentShot.longitudinal_position = null;
  workflowState.currentShot.lateral_position = null;
  workflowState.currentShot.timing = null;
  workflowState.currentShot.intention = null;
  workflowState.currentShot.impact = null;
  workflowState.currentShot.direction = null;
}

/**
 * Update shot status display
 * @param {string} message - Optional status message
 * @param {string} type - Optional status type
 */
function updateShotStatus(message, type) {
  if (message) {
    elements.shotStatus.textContent = message;
    elements.shotStatus.className = `status-message ${type || ''}`;
    return;
  }
  
  const shot = workflowState.currentShot;
  let status = '';
  let statusType = '';
  
  if (!shot.start_sec) {
    status = 'Click "Mark Start" to begin';
    statusType = '';
  } else if (!shot.end_sec) {
    status = `Start: ${shot.start_sec.toFixed(2)}s - Click "Mark End"`;
    statusType = 'warning';
  } else if (!shot.label) {
    const duration = (shot.end_sec - shot.start_sec).toFixed(2);
    status = `Shot: ${shot.start_sec.toFixed(2)}s - ${shot.end_sec.toFixed(2)}s (${duration}s) - Select label`;
    statusType = 'warning';
  } else {
    const duration = (shot.end_sec - shot.start_sec).toFixed(2);
    status = `Ready: ${shot.label} (${duration}s) - Click label to save`;
    statusType = 'success';
  }
  
  elements.shotStatus.textContent = status;
  elements.shotStatus.className = `status-message ${statusType}`;
}

/**
 * Save current shot to the shots list
 * @param {string} label - Shot label to save
 */
function saveCurrentShot(label) {
  const shot = workflowState.currentShot;
  
  if (!shot.start_sec || !shot.end_sec || !label) {
    updateShotStatus('Incomplete shot data', 'error');
    return;
  }
  
  // Create new shot entry
  const newShot = {
    video_url: currentTab.url,
    shot_id: `shot_${Date.now()}`,
    start_sec: shot.start_sec,
    end_sec: shot.end_sec,
    label: label,
    longitudinal_position: shot.longitudinal_position || '',
    lateral_position: shot.lateral_position || '',
    timing: shot.timing || '',
    intention: shot.intention || '',
    impact: shot.impact || '',
    direction: shot.direction || ''
  };
  
  // Add to shots list
  workflowState.shots.push(newShot);
  
  // Reset current shot
  workflowState.currentShot = {
    start_sec: null,
    end_sec: null,
    label: null,
    longitudinal_position: null,
    lateral_position: null,
    timing: null,
    intention: null,
    impact: null,
    direction: null
  };
  
  // Update UI
  updateShotList();
  updateShotStatus();
  updateShotStatus('Shot saved successfully!', 'success');
  
  // Clear success message after delay
  setTimeout(() => updateShotStatus(), 2000);
}

/**
 * Update the labeled shots list display
 */
function updateShotList() {
  if (!elements.labelList) return;
  
  elements.labelList.innerHTML = '';
  
  if (workflowState.shots.length === 0) {
    elements.labelList.innerHTML = '<div style="padding: 16px; text-align: center; color: var(--text-secondary);">No shots labeled yet</div>';
    return;
  }
  
  workflowState.shots.forEach((shot, index) => {
    const shotElement = createShotListItem(shot, index);
    elements.labelList.appendChild(shotElement);
  });
}

/**
 * Create shot list item element
 * @param {Object} shot - Shot data
 * @param {number} index - Shot index
 * @returns {HTMLElement} Shot list item element
 */
function createShotListItem(shot, index) {
  const item = document.createElement('div');
  item.className = 'popup-label-item';
  
  const duration = (shot.end_sec - shot.start_sec).toFixed(2);
  const content = document.createElement('div');
  content.className = 'popup-label-item-content';
  content.innerHTML = `
    <div><strong>${shot.label}</strong></div>
    <div>${shot.start_sec.toFixed(2)}s - ${shot.end_sec.toFixed(2)}s (${duration}s)</div>
  `;
  
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'popup-delete-btn';
  deleteBtn.textContent = '×';
  deleteBtn.title = 'Delete shot';
  deleteBtn.addEventListener('click', () => deleteShotAtIndex(index));
  
  item.appendChild(content);
  item.appendChild(deleteBtn);
  
  return item;
}

/**
 * Delete shot at specific index
 * @param {number} index - Index of shot to delete
 */
function deleteShotAtIndex(index) {
  if (index >= 0 && index < workflowState.shots.length) {
    workflowState.shots.splice(index, 1);
    updateShotList();
  }
}

/**
 * Handle CSV file import
 * @param {Event} event - File input change event
 */
function handleCSVImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const csvText = e.target.result;
      const importedShots = parseCSVFile(csvText);
      
      if (importedShots.length > 0) {
        workflowState.shots = importedShots;
        updateShotList();
        updateShotStatus(`Imported ${importedShots.length} shots`, 'success');
        
        // Clear success message after delay
        setTimeout(() => updateShotStatus(), 3000);
      } else {
        updateShotStatus('No valid shots found in CSV', 'warning');
      }
    } catch (error) {
      console.error('CSV import failed:', error);
      updateShotStatus('Failed to import CSV', 'error');
    }
    
    // Reset file input
    event.target.value = '';
  };
  
  reader.readAsText(file);
}

/**
 * Parse CSV file content
 * @param {string} csvText - CSV file content
 * @returns {Array} Array of shot objects
 */
function parseCSVFile(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = parseCSVRow(lines[0]);
  const shots = [];
  
  for (let i = 1; i < lines.length; i++) {
    try {
      const values = parseCSVRow(lines[i]);
      if (values.length !== headers.length) continue;
      
      const shot = {};
      headers.forEach((header, index) => {
        shot[header] = values[index];
      });
      
      // Validate required fields
      if (shot.start_sec && shot.end_sec && shot.label) {
        shot.start_sec = parseFloat(shot.start_sec);
        shot.end_sec = parseFloat(shot.end_sec);
        shots.push(shot);
      }
    } catch (error) {
      console.warn(`Failed to parse CSV line ${i + 1}:`, error);
    }
  }
  
  return shots;
}

/**
 * Export shots to CSV file
 */
async function exportToCSV() {
  if (workflowState.shots.length === 0) {
    updateShotStatus('No shots to export', 'warning');
    return;
  }
  
  try {
    elements.saveLabels.classList.add('loading');
    
    // Generate CSV content
    const csvContent = generateCSVContent();
    
    // Get video title for filename
    const videoTitle = elements.videoTitle.textContent || 'video';
    const sanitizedTitle = sanitize(videoTitle);
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `${sanitizedTitle}_shots_${timestamp}.csv`;
    
    // Create data URL
    const dataUrl = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    
    // Send download request to background script
    await chrome.runtime.sendMessage({
      action: 'download-csv',
      filename: filename,
      dataUrl: dataUrl
    });
    
    updateShotStatus('CSV export initiated', 'success');
    setTimeout(() => updateShotStatus(), 3000);
    
  } catch (error) {
    console.error('CSV export failed:', error);
    updateShotStatus('Failed to export CSV', 'error');
  } finally {
    elements.saveLabels.classList.remove('loading');
  }
}

/**
 * Generate CSV content from shots data
 * @returns {string} CSV formatted content
 */
function generateCSVContent() {
  const lines = [CSV_HEADERS.join(',')];
  
  workflowState.shots.forEach(shot => {
    const row = CSV_HEADERS.map(header => {
      const value = shot[header] || '';
      return escapeCSVField(String(value));
    });
    lines.push(row.join(','));
  });
  
  return lines.join('\n');
}

/**
 * Handle keyboard shortcuts
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleKeyboard(event) {
  if (!connected) return;
  
  // Prevent shortcuts when typing in inputs
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
    return;
  }
  
  switch (event.code) {
    case 'KeyS':
      event.preventDefault();
      markShotStart();
      break;
    case 'KeyE':
      event.preventDefault();
      markShotEnd();
      break;
    case 'KeyO':
      event.preventDefault();
      togglePoseOverlay();
      break;
  }
}

/**
 * Attach event listeners to glossary elements after they're moved to popup
 * @param {HTMLElement} container - Container with glossary elements
 */
function attachGlossaryEventListeners(container) {
  // Label buttons
  const labelButtons = container.querySelectorAll('.popup-label-btn, .yt-shot-labeler-label-btn');
  labelButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const label = e.target.textContent.trim();
      if (label) {
        // Update current shot label and save it
        workflowState.currentShot.label = label;
        saveCurrentShot(label);
      }
    });
  });
  
  // Dimension buttons
  const dimensionButtons = container.querySelectorAll('.popup-dimension-btn, .yt-shot-labeler-dimension-btn');
  dimensionButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const button = e.target;
      const dimensionType = button.dataset.dimension;
      const dimensionValue = button.dataset.value;
      
      if (dimensionType && dimensionValue) {
        // Toggle button selection
        const siblings = container.querySelectorAll(`[data-dimension="${dimensionType}"]`);
        siblings.forEach(sibling => sibling.classList.remove('selected'));
        button.classList.add('selected');
        
        // Update current shot dimension
        workflowState.currentShot[dimensionType] = dimensionValue;
        updateShotStatus();
      }
    });
  });
}

// Export functions for glossary modules
window.saveCurrentShot = saveCurrentShot;
window.updateShotStatus = updateShotStatus;

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePopup);