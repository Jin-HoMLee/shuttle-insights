/**
 * Material 3 Web Components Imports
 * 
 * Centralized imports for all Material Design 3 components used in the extension.
 * This ensures efficient tree-shaking and consistent component availability.
 */

// Button Components
import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/text-button.js';

// Icon Components
import '@material/web/icon/icon.js';

// Card Components
import '@material/web/labs/card/filled-card.js';
import '@material/web/labs/card/outlined-card.js';

// List Components
import '@material/web/list/list.js';
import '@material/web/list/list-item.js';

// Icon Button Components
import '@material/web/iconbutton/icon-button.js';
import '@material/web/iconbutton/filled-icon-button.js';

// Progress Components
import '@material/web/progress/circular-progress.js';

// Chip Components
import '@material/web/chips/chip-set.js';
import '@material/web/chips/filter-chip.js';
import '@material/web/chips/input-chip.js';

// Dialog Components (for future use)
import '@material/web/dialog/dialog.js';

/**
 * Initialize Material 3 components for the extension
 * This function should be called once during extension initialization
 */
export function initializeMaterial3() {
  // Set global Material 3 theme colors to match our existing design
  const style = document.createElement('style');
  style.textContent = `
    :root {
      /* Material 3 design tokens matching our existing design */
      --md-sys-color-primary: #1976d2;
      --md-sys-color-on-primary: #ffffff;
      --md-sys-color-primary-container: #bbdefb;
      --md-sys-color-on-primary-container: #0d47a1;
      --md-sys-color-secondary: #757575;
      --md-sys-color-on-secondary: #ffffff;
      --md-sys-color-error: #f44336;
      --md-sys-color-on-error: #ffffff;
      --md-sys-color-surface: #fafafa;
      --md-sys-color-on-surface: #212121;
      --md-sys-color-surface-variant: #e0e0e0;
      --md-sys-color-on-surface-variant: #757575;
      --md-sys-color-outline: #e0e0e0;
      --md-sys-color-background: #ffffff;
      --md-sys-color-on-background: #212121;
      
      /* Success color for our specific use case */
      --md-sys-color-tertiary: #4caf50;
      --md-sys-color-on-tertiary: #ffffff;
    }
    
    /* Custom styling for Material 3 components to match our design */
    md-filled-button {
      --md-filled-button-container-height: 36px;
      margin: 4px;
    }
    
    md-outlined-button {
      --md-outlined-button-container-height: 36px;
      margin: 4px;
    }
    
    md-icon-button {
      --md-icon-button-icon-size: 18px;
    }
  `;
  document.head.appendChild(style);
}