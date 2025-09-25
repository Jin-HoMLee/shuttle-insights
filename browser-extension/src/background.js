/**
 * Background Service Worker
 * 
 * This service worker handles extension-level functionality including:
 * - CSV file download coordination
 * - Message routing between extension components
 * 
 * Note: Extension icon clicks now open the popup interface automatically.
 * Panel toggle functionality has been moved to the popup interface.
 */

/**
 * Extension action clicks now automatically open the popup
 * No additional handling needed - popup interface manages all UI functionality
 */

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