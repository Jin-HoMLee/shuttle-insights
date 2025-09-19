/**
 * Panel Management (Legacy Compatibility)
 * 
 * This module maintains backward compatibility for the panel functionality
 * while internally using the new modular structure.
 * 
 * The panel has been split into focused modules:
 * - panel-templates.js: HTML templates
 * - panel-factory.js: DOM creation & styling
 * - panel-events.js: Event handlers & shortcuts
 * - panel-workflow.js: Shot marking workflow
 * - panel-coordinator.js: Module integration & lifecycle
 * 
 * This file now serves as a compatibility layer, re-exporting the main functions
 * from the coordinator module.
 */

import { createLabelerPanel as createLabelerPanelImpl, togglePanel as togglePanelImpl } from './panel-coordinator.js';

/**
 * Creates and initializes the main labeling panel
 * Sets up the complete UI with all sub-components and event handlers
 */
export function createLabelerPanel() {
  return createLabelerPanelImpl();
}

/**
 * Toggles the panel visibility
 * Creates panel if it doesn't exist, removes it if it does
 */
export function togglePanel() {
  return togglePanelImpl();
}
