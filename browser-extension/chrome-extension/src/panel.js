/**
 * Panel Management - Legacy Compatibility
 * 
 * This module provides backward compatibility for existing imports while
 * delegating functionality to the new modular components.
 * 
 * The panel functionality has been split into:
 * - components/panel-core.js - Main panel lifecycle management
 * - components/panel-ui.js - UI creation and styling
 * - features/shot-marking.js - Shot timing functionality
 * - features/keyboard-shortcuts.js - Keyboard handling
 */

// Re-export main functions from the new modular structure
export { createLabelerPanel, togglePanel } from './components/panel-core.js';
