# Theme Implementation Guide

-> back to [README](../README.md)

## Overview

The YouTube Badminton Shot Labeler extension now supports dark and light themes to improve accessibility and user experience. The theme system uses CSS custom properties (CSS variables) for consistent theming across all UI components.

## Features

- **Toggle Button**: Theme toggle button in the panel header (🌙/☀️ icon)
- **Persistent Storage**: Theme preference is saved using Chrome storage API
- **Automatic Initialization**: Theme is applied on extension load
- **Accessible Design**: High contrast colors for both themes
- **Seamless Switching**: Instant theme changes without page reload

## Architecture

### Files Structure

```
src/
├── utils/theme-manager.js        # Core theme management logic
├── styles.css                    # CSS variables for both themes
├── panel-coordinator.js          # Panel integration
├── panel-templates.js            # Theme toggle button HTML
├── constants.js                  # Theme-related constants
└── content.js                    # Theme initialization
```

### Components

#### 1. Theme Manager (`src/utils/theme-manager.js`)

Core module that handles:
- Theme persistence using Chrome storage API
- Theme switching logic
- CSS variable application
- Theme-related utility functions

**Key Functions:**
- `initializeTheme()` - Loads and applies saved theme
- `toggleTheme()` - Switches between light/dark themes
- `getCurrentTheme()` - Retrieves current theme from storage
- `setCurrentTheme(theme)` - Saves theme to storage
- `applyTheme(theme)` - Applies theme to document root

#### 2. CSS Design System (`src/styles.css`)

**Light Theme (Default):**
```css
:root {
  --primary-color: #1976d2;
  --background-color: #ffffff;
  --text-primary: #212121;
  --border-color: #e0e0e0;
  /* ... additional variables */
}
```

**Dark Theme:**
```css
:root[data-theme="dark"] {
  --primary-color: #64b5f6;
  --background-color: #121212;
  --text-primary: #ffffff;
  --border-color: #333333;
  /* ... additional variables */
}
```

#### 3. Theme Toggle UI

- **Location**: Panel header (top-right)
- **Icons**: 🌙 (light theme) → ☀️ (dark theme)
- **Tooltip**: Dynamic tooltip text based on current theme
- **Accessibility**: Proper ARIA labels and keyboard support

## Usage

### User Interface

1. **Access Theme Toggle**: Click the extension icon to open the panel
2. **Switch Themes**: Click the theme toggle button (🌙/☀️) in the panel header
3. **Persistence**: Theme preference is automatically saved and restored

### Developer Integration

```javascript
import { initializeTheme, toggleTheme, getCurrentTheme } from './utils/theme-manager.js';

// Initialize theme on page load
await initializeTheme();

// Toggle theme programmatically
const newTheme = await toggleTheme();

// Get current theme
const currentTheme = await getCurrentTheme();
```

## Color Palette

### Light Theme
- **Primary**: #1976d2 (Material Blue 700)
- **Background**: #ffffff (White)
- **Surface**: #fafafa (Very Light Gray)
- **Text Primary**: #212121 (Near Black)
- **Text Secondary**: #757575 (Medium Gray)
- **Border**: #e0e0e0 (Light Gray)

### Dark Theme
- **Primary**: #64b5f6 (Light Blue 300)
- **Background**: #121212 (Very Dark Gray)
- **Surface**: #1e1e1e (Dark Gray)
- **Text Primary**: #ffffff (White)
- **Text Secondary**: #b0b0b0 (Light Gray)
- **Border**: #333333 (Medium Dark Gray)

## Accessibility

### Contrast Ratios
- **Light Theme**: All text meets WCAG AA standards (4.5:1 ratio)
- **Dark Theme**: Enhanced contrast for better readability
- **Interactive Elements**: Clear focus indicators and hover states

### Features
- High contrast color combinations
- Proper ARIA labels on theme toggle button
- Keyboard navigation support
- Semantic HTML structure maintained

## Technical Details

### Storage
- **Key**: `yt-shot-labeler-theme`
- **Values**: `'light'` | `'dark'`
- **Fallback**: Uses localStorage in development/testing environments

### CSS Implementation
- Uses CSS custom properties for theming
- `data-theme` attribute on document root
- Automatic cascade to all components
- No hardcoded colors in components

### Events
- Dispatches `theme-changed` custom event when theme switches
- Other components can listen for theme changes:

```javascript
window.addEventListener('theme-changed', (e) => {
  console.log('Theme changed to:', e.detail.theme);
});
```

## Testing

### Unit Tests
- `test/theme-manager.test.js` - Core theme management functionality
- `test/theme-integration.test.js` - Integration with panel system

### Manual Testing
1. Open extension panel
2. Toggle theme multiple times
3. Close and reopen panel (theme should persist)
4. Verify all UI elements adapt to theme changes
5. Test accessibility with screen readers

## Browser Compatibility

- **Chrome**: Full support (extension environment)
- **Storage API**: Chrome storage API required
- **CSS Variables**: Supported in all modern browsers
- **Fallback**: localStorage for development environments

## Future Enhancements

### Potential Improvements
1. **System Theme Detection**: Auto-detect OS dark/light preference
2. **Custom Themes**: Allow users to create custom color schemes
3. **Animation**: Smooth transitions during theme changes
4. **High Contrast Mode**: Additional accessibility theme option

### Implementation Ideas
```javascript
// System theme detection
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

// Custom theme support
const customThemes = {
  'high-contrast': { /* custom variables */ },
  'colorblind-friendly': { /* custom variables */ }
};
```

## Troubleshooting

### Common Issues

1. **Theme not persisting**: Check Chrome storage permissions
2. **Colors not changing**: Verify CSS variables are used consistently
3. **Theme toggle not working**: Check for JavaScript errors in console

### Debug Information
```javascript
// Check current theme
console.log('Current theme:', await getCurrentTheme());

// Check storage
chrome.storage.local.get(['yt-shot-labeler-theme'], (result) => {
  console.log('Stored theme:', result);
});

// Check applied theme
console.log('Applied theme:', document.documentElement.getAttribute('data-theme'));
```

## Conclusion

The theme implementation provides a robust, accessible, and user-friendly way to switch between light and dark modes. The system is designed to be maintainable, extensible, and follows modern web development best practices.