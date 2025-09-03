/**
 * Background Service Worker
 * 
 * This service worker handles extension-level functionality including:
 * - Extension icon click handling for panel toggle
 * - CSV file download coordination
 * - Message routing between extension components
 * 
 * The service worker runs in the background and coordinates communication
 * between the browser action (extension icon) and content scripts.
 */

/**
 * Handles extension icon clicks to toggle the labeling panel
 * Sends a message to the content script to show/hide the panel
 */
chrome.action.onClicked.addListener((tab) => {
  // Ensure we have a valid tab
  if (!tab.id) {
    console.warn('No valid tab ID for extension action');
    return;
  }
  
  // Send toggle message to content script
  // The content script may not be present (e.g., on non-YouTube pages)
  chrome.tabs.sendMessage(tab.id, { action: "toggle-panel" }, (response) => {
    if (chrome.runtime.lastError) {
      // Content script not present or not responding - this is normal
      // Could happen on pages where the extension isn't active
      console.log('Content script not available:', chrome.runtime.lastError.message);
    }
  });
});

/**
 * Handles messages from content scripts
 * Currently processes CSV download requests from the panel
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle CSV download requests
  if (message.action === "download-csv") {
    handleCSVDownload(message);
  }
  
  // Other message types can be added here as needed
});

/**
 * Processes CSV download requests from the content script
 * Uses the Chrome downloads API to save CSV files with user-specified names
 * 
 * @param {Object} message - Message object containing download details
 * @param {string} message.filename - Suggested filename for the download
 * @param {string} message.dataUrl - Data URL containing the CSV content
 */
function handleCSVDownload(message) {
  if (!message.filename || !message.dataUrl) {
    console.error('Invalid CSV download request - missing filename or data');
    return;
  }
  
  try {
    chrome.downloads.download({
      url: message.dataUrl,
      filename: message.filename,
      saveAs: true  // Show save dialog to user
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        console.error('CSV download failed:', chrome.runtime.lastError);
      } else {
        console.log('CSV download initiated with ID:', downloadId);
      }
    });
  } catch (error) {
    console.error('Error initiating CSV download:', error);
  }
}