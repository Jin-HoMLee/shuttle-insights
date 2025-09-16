/**
 * Custom Labels Management
 * 
 * This module handles custom shot types defined by coaches.
 * Provides functionality to add, edit, delete, and persist custom labels.
 * 
 * Features:
 * - Storage and retrieval of custom labels using chrome.storage
 * - UI for managing custom labels
 * - Integration with existing shot labeling workflow
 */

import { UI_IDS, CSS_CLASSES } from './constants.js';
import { addTooltip, showSuccess, showWarning } from './ui-utils.js';

// Storage key for custom labels
const STORAGE_KEY = 'custom_shot_labels';

/**
 * Sets up the custom labels management UI
 * 
 * @param {HTMLElement} container - Container element for custom labels section
 * @param {Function} getCurrentShot - Function to get current shot object
 * @param {Function} updateStatus - Status update callback
 */
export function setupCustomLabels(container, getCurrentShot, updateStatus) {
  if (!container) {
    console.warn('Custom labels container not found');
    return;
  }

  // Clear existing content
  container.innerHTML = '';

  // Create custom labels section
  const section = createCustomLabelsSection();
  container.appendChild(section);

  // Load and display existing custom labels
  loadCustomLabels().then(customLabels => {
    displayCustomLabels(section, customLabels, getCurrentShot, updateStatus);
  });
}

/**
 * Creates the custom labels section UI structure
 * 
 * @returns {HTMLElement} Custom labels section element
 */
function createCustomLabelsSection() {
  const section = document.createElement('div');
  section.id = UI_IDS.CUSTOM_LABELS_SECTION;
  section.className = CSS_CLASSES.SECTION;

  section.innerHTML = `
    <div class="${CSS_CLASSES.SECTION_TITLE}">🏷️ Custom Shot Types</div>
    <div class="${CSS_CLASSES.INFO}" style="font-size: 12px; margin-bottom: 8px;">
      Define your own shot types for specific coaching needs
    </div>
    <div style="display: flex; gap: 4px; margin-bottom: 8px;">
      <input type="text" id="${UI_IDS.CUSTOM_LABEL_INPUT}" 
             class="${CSS_CLASSES.FORM_INPUT}"
             placeholder="Enter custom shot name..." 
             maxlength="30"
             style="flex: 1; padding: 4px 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 12px;">
      <button id="${UI_IDS.ADD_CUSTOM_LABEL}" 
              class="yt-shot-labeler-btn yt-shot-labeler-tooltip"
              data-tooltip="Add custom shot type"
              style="padding: 4px 12px; font-size: 12px;">
        ➕ Add
      </button>
    </div>
    <div id="${UI_IDS.CUSTOM_LABELS_LIST}" style="max-height: 100px; overflow-y: auto;"></div>
  `;

  // Setup add button functionality
  setupAddCustomLabel(section, getCurrentShot, updateStatus);

  // Setup enter key support for input
  const input = section.querySelector(`#${UI_IDS.CUSTOM_LABEL_INPUT}`);
  if (input) {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const addBtn = section.querySelector(`#${UI_IDS.ADD_CUSTOM_LABEL}`);
        if (addBtn) addBtn.click();
      }
    });
  }

  return section;
}

/**
 * Sets up the add custom label button functionality
 * 
 * @param {HTMLElement} section - Custom labels section element
 * @param {Function} getCurrentShot - Function to get current shot object
 * @param {Function} updateStatus - Status update callback
 */
function setupAddCustomLabel(section, getCurrentShot, updateStatus) {
  const addBtn = section.querySelector(`#${UI_IDS.ADD_CUSTOM_LABEL}`);
  const input = section.querySelector(`#${UI_IDS.CUSTOM_LABEL_INPUT}`);

  if (!addBtn || !input) return;

  addBtn.onclick = async () => {
    const labelName = input.value.trim();
    
    if (!labelName) {
      showWarning('Please enter a shot name', section);
      return;
    }

    if (labelName.length > 30) {
      showWarning('Shot name must be 30 characters or less', section);
      return;
    }

    try {
      // Load existing labels
      const customLabels = await loadCustomLabels();
      
      // Check for duplicates
      if (customLabels.includes(labelName)) {
        showWarning('This shot type already exists', section);
        return;
      }

      // Add new label
      customLabels.push(labelName);
      await saveCustomLabels(customLabels);

      // Update UI
      input.value = '';
      displayCustomLabels(section, customLabels, getCurrentShot, updateStatus);
      showSuccess(`Added "${labelName}" shot type`, section);

    } catch (error) {
      console.error('Failed to add custom label:', error);
      showWarning('Failed to save custom shot type', section);
    }
  };
}

/**
 * Displays the list of custom labels with selection and delete functionality
 * 
 * @param {HTMLElement} section - Custom labels section element
 * @param {Array} customLabels - Array of custom label strings
 * @param {Function} getCurrentShot - Function to get current shot object
 * @param {Function} updateStatus - Status update callback
 */
function displayCustomLabels(section, customLabels, getCurrentShot, updateStatus) {
  const listContainer = section.querySelector(`#${UI_IDS.CUSTOM_LABELS_LIST}`);
  if (!listContainer) return;

  if (customLabels.length === 0) {
    listContainer.innerHTML = `
      <div style="color: #999; font-size: 12px; text-align: center; padding: 8px;">
        No custom shot types defined yet
      </div>
    `;
    return;
  }

  // Create buttons for each custom label
  listContainer.innerHTML = customLabels.map((label, index) => `
    <div class="${CSS_CLASSES.CUSTOM_LABEL_ITEM}" style="display: flex; align-items: center; gap: 4px; margin: 2px 0;">
      <button class="${CSS_CLASSES.LABEL_BTN}" 
              data-label="${label}"
              style="flex: 1; font-size: 11px; padding: 3px 8px; text-align: left;">
        ${label}
      </button>
      <button class="${CSS_CLASSES.DELETE_BTN}" 
              data-index="${index}"
              title="Delete custom shot type"
              style="background: transparent; border: none; cursor: pointer; font-size: 12px; color: #d32f2f;">
        🗑️
      </button>
    </div>
  `).join('');

  // Setup click handlers for label selection
  listContainer.querySelectorAll(`.${CSS_CLASSES.LABEL_BTN}`).forEach(btn => {
    btn.onclick = () => {
      const currentShot = getCurrentShot();
      currentShot.label = btn.dataset.label;
      
      // Update button selection state
      updateCustomLabelSelection(listContainer, btn);
      updateStatus();
      
      // Add visual feedback
      btn.style.transform = 'scale(0.95)';
      setTimeout(() => {
        btn.style.transform = '';
      }, 150);
    };
  });

  // Setup delete handlers
  listContainer.querySelectorAll(`.${CSS_CLASSES.DELETE_BTN}`).forEach(btn => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const index = parseInt(btn.dataset.index);
      const labelToDelete = customLabels[index];
      
      if (confirm(`Delete "${labelToDelete}" shot type?`)) {
        try {
          customLabels.splice(index, 1);
          await saveCustomLabels(customLabels);
          displayCustomLabels(section, customLabels, getCurrentShot, updateStatus);
          showSuccess(`Deleted "${labelToDelete}" shot type`, section);
        } catch (error) {
          console.error('Failed to delete custom label:', error);
          showWarning('Failed to delete shot type', section);
        }
      }
    };
  });
}

/**
 * Updates custom label button selection states
 * 
 * @param {HTMLElement} container - Container with label buttons
 * @param {HTMLElement} selectedButton - Button to mark as selected
 */
function updateCustomLabelSelection(container, selectedButton) {
  // Remove selection from all custom label buttons
  container.querySelectorAll(`.${CSS_CLASSES.LABEL_BTN}`).forEach(btn => {
    btn.classList.remove("selected");
  });
  
  // Mark the clicked button as selected
  selectedButton.classList.add("selected");
}

/**
 * Loads custom labels from chrome storage
 * 
 * @returns {Promise<Array>} Promise resolving to array of custom label strings
 */
async function loadCustomLabels() {
  try {
    const result = await chrome.storage.local.get([STORAGE_KEY]);
    return result[STORAGE_KEY] || [];
  } catch (error) {
    console.error('Failed to load custom labels:', error);
    return [];
  }
}

/**
 * Saves custom labels to chrome storage
 * 
 * @param {Array} customLabels - Array of custom label strings to save
 * @returns {Promise} Promise that resolves when save is complete
 */
async function saveCustomLabels(customLabels) {
  try {
    await chrome.storage.local.set({ [STORAGE_KEY]: customLabels });
  } catch (error) {
    console.error('Failed to save custom labels:', error);
    throw error;
  }
}

/**
 * Gets all custom labels for external use
 * 
 * @returns {Promise<Array>} Promise resolving to array of custom label strings
 */
export async function getCustomLabels() {
  return await loadCustomLabels();
}

/**
 * Clears all custom labels (useful for testing/reset)
 * 
 * @returns {Promise} Promise that resolves when clear is complete
 */
export async function clearCustomLabels() {
  return await saveCustomLabels([]);
}