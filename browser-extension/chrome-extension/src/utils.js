/**
 * Legacy Utility Functions
 * 
 * This file re-exports functions from specialized utility modules
 * for backward compatibility during the refactoring process.
 * 
 * @deprecated Direct imports from specific modules are preferred
 */

// Re-export UI utilities
export { 
  formatDateTime, 
  sanitize, 
  getVideoTitle 
} from './ui-utils.js';

// Re-export video utilities
export { 
  getVideo 
} from './video-utils.js';

// Re-export overlay utilities
export { 
  createOverlayCanvas,
  removeOverlayCanvas,
  disconnectOverlayObserver 
} from './overlay-utils.js';

// Re-export pose utilities
export { 
  setupDetector 
} from './pose-utils.js';