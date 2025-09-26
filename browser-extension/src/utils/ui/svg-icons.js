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
 * @param {string} color - Icon color (default: currentColor)
 * @returns {string} SVG element as string
 */
function createSvgIcon(pathData, size = 16, color = 'currentColor') {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle;">
    ${pathData}
  </svg>`;
}

/**
 * SVG Icons collection
 */
export const SVG_ICONS = {
  // Main app icon - Badminton shuttlecock
  SHUTTLECOCK: createSvgIcon(`
    <circle cx="12" cy="4" r="2"/>
    <path d="M12 6v6l-3 3 3 3 3-3-3-3z"/>
    <path d="M9 9l-3-3"/>
    <path d="M15 9l3-3"/>
    <path d="M9 15l-3 3"/>
    <path d="M15 15l3 3"/>
  `),

  // Video details - Chart/analytics icon
  CHART: createSvgIcon(`
    <path d="M3 3v18h18"/>
    <path d="M7 12l4-4 4 4 6-6"/>
    <path d="m17 5l3-3"/>
  `),

  // Pose overlay - Target/crosshair icon
  TARGET: createSvgIcon(`
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  `),

  // Person/user icon
  USER: createSvgIcon(`
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  `),

  // Stop sign icon
  STOP: createSvgIcon(`
    <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/>
    <line x1="15" y1="9" x2="9" y2="15"/>
    <line x1="9" y1="9" x2="15" y2="15"/>
  `),

  // Folder icon
  FOLDER: createSvgIcon(`
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  `),

  // Folder open icon
  FOLDER_OPEN: createSvgIcon(`
    <path d="M6 14l1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  `),

  // Video/film icon
  VIDEO: createSvgIcon(`
    <polygon points="23 7 16 12 23 17 23 7"/>
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  `),

  // Play icon
  PLAY: createSvgIcon(`
    <polygon points="5 3 19 12 5 21 5 3"/>
  `),

  // Stop square icon
  STOP_SQUARE: createSvgIcon(`
    <rect x="6" y="6" width="12" height="12"/>
  `),

  // List/clipboard icon
  CLIPBOARD: createSvgIcon(`
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
  `),

  // Save/disk icon
  SAVE: createSvgIcon(`
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17,21 17,13 7,13 7,21"/>
    <polyline points="7,3 7,8 15,8"/>
  `),

  // Download icon
  DOWNLOAD: createSvgIcon(`
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7,10 12,15 17,10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  `),

  // Question/help icon
  HELP: createSvgIcon(`
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
    <circle cx="12" cy="17" r="1"/>
  `)
};

/**
 * Get an SVG icon with optional size override
 * @param {string} iconName - Name of the icon from SVG_ICONS
 * @param {number} size - Icon size (optional)
 * @param {string} color - Icon color (optional)
 * @returns {string} SVG element as string
 */
export function getSvgIcon(iconName, size, color) {
  const iconPath = SVG_ICONS[iconName];
  if (!iconPath) {
    console.warn(`SVG icon '${iconName}' not found`);
    return '';
  }
  
  // If custom size or color requested, regenerate the icon
  if (size || color) {
    // Extract the path data from the existing icon
    const pathMatch = iconPath.match(/<svg[^>]*>(.*)<\/svg>/s);
    if (pathMatch) {
      return createSvgIcon(pathMatch[1], size, color);
    }
  }
  
  return iconPath;
}