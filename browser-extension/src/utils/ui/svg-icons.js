/**
 * SVG Icons
 * 
 * Modern SVG icons to replace emoji in the panel UI.
 * Provides consistent, scalable, and accessible iconography.
 */

/**
 * Base SVG wrapper with default styling
 * @param {string} pathData - SVG path data
 * @param {number} size - Icon size (default: 16)
 * @param {string} color - Icon stroke color (default: currentColor)
 * @param {string} fill - Icon fill color (default: none for outline icons)
 * @returns {string} SVG element as string
 */
function createSvgIcon(pathData, size = 16, color = 'currentColor', fill = 'none') {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill}" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle;">
    ${pathData}
  </svg>`;
}

/**
 * SVG Icon path data storage
 * Stores just the inner SVG content without the wrapper for easy customization
 */
const SVG_PATHS = {
  // Main app icon - Badminton shuttlecock
  SHUTTLECOCK: `
    <circle cx="12" cy="4" r="2"/>
    <path d="M12 6v6l-3 3 3 3 3-3-3-3z"/>
    <path d="M9 9l-3-3"/>
    <path d="M15 9l3-3"/>
    <path d="M9 15l-3 3"/>
    <path d="M15 15l3 3"/>
  `,

  // Video details - Chart/analytics icon
  CHART: `
    <path d="M3 3v18h18"/>
    <path d="M7 12l4-4 4 4 6-6"/>
    <path d="m17 5l3-3"/>
  `,

  // Pose overlay - Target/crosshair icon
  TARGET: `
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  `,

  // Person/user icon
  USER: `
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  `,

  // Stop sign icon (filled)
  STOP: {
    paths: `
      <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
    `,
    defaultFill: 'currentColor'
  },

  // Folder icon
  FOLDER: `
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  `,

  // Folder open icon
  FOLDER_OPEN: `
    <path d="M6 14l1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  `,

  // Video/film icon
  VIDEO: `
    <polygon points="23 7 16 12 23 17 23 7"/>
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  `,

  // Play icon (filled)
  PLAY: {
    paths: `<polygon points="5 3 19 12 5 21 5 3"/>`,
    defaultFill: 'currentColor'
  },

  // Stop square icon (filled)
  STOP_SQUARE: {
    paths: `<rect x="6" y="6" width="12" height="12"/>`,
    defaultFill: 'currentColor'
  },

  // List/clipboard icon
  CLIPBOARD: `
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
  `,

  // Save/disk icon
  SAVE: `
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17,21 17,13 7,13 7,21"/>
    <polyline points="7,3 7,8 15,8"/>
  `,

  // Download icon
  DOWNLOAD: `
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7,10 12,15 17,10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  `,

  // Question/help icon
  HELP: `
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
    <circle cx="12" cy="17" r="1"/>
  `
};

/**
 * Shared helper to render SVG icon from path data or icon object
 * @param {string|object} pathData - SVG path string or icon object
 * @param {number} size - Icon size
 * @param {string} color - Stroke color
 * @param {string} fill - Fill color
 * @returns {string} SVG element as string
 */
function renderSvgIcon(pathData, size = 16, color = 'currentColor', fill = 'none') {
  if (typeof pathData === 'object') {
    const finalFill = fill !== undefined ? fill : pathData.defaultFill;
    return createSvgIcon(pathData.paths, size, color, finalFill);
  } else {
    return createSvgIcon(pathData, size, color, fill);
  }
}

/**
 * Pre-built SVG icons with default styling
 */
export const SVG_ICONS = Object.fromEntries(
  Object.entries(SVG_PATHS).map(([name, pathData]) => [name, renderSvgIcon(pathData)])
);

/**
 * Get an SVG icon with optional customization
 * @param {string} iconName - Name of the icon from SVG_ICONS
 * @param {number} size - Icon size (optional)
 * @param {string} color - Icon stroke color (optional)
 * @param {string} fill - Icon fill color (optional)
 * @returns {string} SVG element as string
 */
export function getSvgIcon(iconName, size, color, fill) {
  const pathData = SVG_PATHS[iconName];
  if (!pathData) {
    console.warn(`SVG icon '${iconName}' not found`);
    return '';
  }
  // Use shared helper for rendering
  if (size || color || fill) {
    return renderSvgIcon(pathData, size, color, fill);
  }
  // Return the pre-built default icon
  return SVG_ICONS[iconName];
}