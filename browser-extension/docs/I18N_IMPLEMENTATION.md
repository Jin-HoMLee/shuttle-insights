# Internationalization (i18n) Implementation Guide

## Overview

The YouTube Badminton Shot Labeler extension now supports multiple languages through a custom, lightweight internationalization system. This implementation allows for easy addition of new languages and provides a seamless user experience for language switching.

## Features

- **Supported Languages**: English (default) and Korean
- **Dynamic Language Switching**: Users can switch languages without restarting the extension
- **Persistent Preferences**: Language choices are saved and restored across sessions
- **Fallback System**: Graceful degradation when translations are missing
- **Test Environment Support**: Works in both production and test environments

## Architecture

### Core Components

#### 1. i18n Manager (`src/utils/i18n-manager.js`)

**Key Functions:**
- `initializeI18n()`: Sets up the i18n system and loads saved preferences
- `t(key, params)`: Gets translated strings with optional parameter interpolation
- `switchLanguage(languageCode)`: Changes the current language
- `getCurrentLanguage()`: Returns the current language code
- `updateLanguageSelector(button, language)`: Updates UI button with language flag

**Features:**
- Chrome extension storage integration
- Fallback to localStorage for testing
- Event system for language change notifications
- Automatic fallback translations for missing keys

#### 2. Translation Files (`src/locales/`)

**Structure:**
```
src/locales/
├── en.json    # English translations
└── ko.json    # Korean translations
```

**Translation Format:**
```json
{
  "app": {
    "title": "YouTube Badminton Shot Labeler"
  },
  "ui": {
    "close": "Close",
    "toggle_theme": "Toggle dark/light theme"
  },
  "sections": {
    "video_details": "Video Details",
    "pose_overlay": "Pose Overlay"
  }
}
```

#### 3. UI Integration

**Template Updates (`src/panel-templates.js`):**
- All hardcoded strings replaced with `t()` function calls
- Dynamic tooltip and aria-label updates
- Language selector button in panel header

**CSS Styling (`src/styles.css`):**
- Consistent styling for language selector button
- Theme-aware colors for light/dark modes
- Responsive design considerations

## Implementation Details

### Language Selector

**Location**: Panel header (top-right, next to theme toggle)
**Behavior**: 
- Cycles through supported languages on click
- Shows country flag for current language
- Updates tooltips and aria-labels immediately

**Supported Languages:**
- 🇺🇸 English (`en`)
- 🇰🇷 Korean (`ko`)

### Translation Keys

**Categories:**
- `app.*`: Application-level strings (title, etc.)
- `ui.*`: General UI elements (close, toggle, etc.)
- `sections.*`: Section titles and headers
- `buttons.*`: Button text and labels
- `labels.*`: Form labels and static text
- `tooltips.*`: Tooltip text for accessibility
- `aria_labels.*`: ARIA labels for screen readers
- `help.*`: Help text and instructions

### Event System

**Language Change Events:**
```javascript
window.addEventListener('language-changed', (event) => {
  console.log('New language:', event.detail.language);
});
```

## Adding New Languages

### Step 1: Create Translation File

Create a new JSON file in `src/locales/` following the existing structure:

```bash
cp src/locales/en.json src/locales/fr.json
# Edit fr.json with French translations
```

### Step 2: Update Language Configuration

Add the new language to `src/utils/i18n-manager.js`:

```javascript
export const SUPPORTED_LANGUAGES = {
  en: { name: 'English', flag: '🇺🇸' },
  ko: { name: '한국어', flag: '🇰🇷' },
  fr: { name: 'Français', flag: '🇫🇷' }  // Add this line
};
```

### Step 3: Update Build Process

The build process automatically copies all JSON files from `src/locales/` to `dist/locales/`, so no changes needed to `esbuild.config.js`.

### Step 4: Test the Implementation

```bash
npm test
npm run build
```

## RTL Language Support

For right-to-left languages (Arabic, Hebrew, etc.):

### CSS Considerations

```css
:root[dir="rtl"] {
  /* RTL-specific styles */
}

.yt-shot-labeler-panel[dir="rtl"] {
  /* Panel adjustments for RTL */
}
```

### Implementation Steps

1. Add `dir` attribute detection in i18n manager
2. Update CSS with RTL-specific rules
3. Test layout with RTL content
4. Ensure proper text alignment and spacing

## Testing

### Unit Tests

The i18n system includes comprehensive unit tests in `test/i18n-manager.test.js`:

- Language initialization and loading
- Translation function behavior
- Language switching functionality
- UI update mechanisms
- Event system integration
- Persistence and storage

### Manual Testing Checklist

- [ ] Language selector appears in panel header
- [ ] Clicking language selector cycles through languages
- [ ] Tooltips update when language changes
- [ ] Language preference persists across sessions
- [ ] Fallback translations work when files are missing
- [ ] All UI text translates correctly
- [ ] Layout remains intact with different text lengths

## Browser Compatibility

**Supported Browsers:**
- Chrome 110+
- All Chromium-based browsers (Edge, Brave, etc.)

**API Dependencies:**
- `chrome.storage.local` for preference persistence
- `chrome.runtime.getURL()` for translation file loading
- ES6 modules and async/await

## Performance Considerations

### Optimization Features

1. **Lazy Loading**: Translation files loaded only when needed
2. **Caching**: Translations cached in memory after first load
3. **Minimal Bundle Impact**: No external i18n libraries used
4. **Fallback Efficiency**: Multiple fallback layers for reliability

### Memory Usage

- **Per Language**: ~2KB of translation data
- **Runtime Overhead**: <1KB for i18n manager
- **Total Impact**: <5KB additional bundle size

## Troubleshooting

### Common Issues

1. **Translations Not Loading**
   - Check browser console for fetch errors
   - Verify translation files exist in `dist/locales/`
   - Ensure chrome.runtime.getURL permissions

2. **Language Not Persisting**
   - Check Chrome storage permissions in manifest
   - Verify chrome.storage.local is available
   - Test localStorage fallback in development

3. **Missing Translations**
   - Check browser console for missing key warnings
   - Verify translation key exists in JSON file
   - Check for typos in translation keys

### Debug Information

```javascript
// Check current language and translations
import { getCurrentLanguage, t } from './src/utils/i18n-manager.js';

console.log('Current language:', getCurrentLanguage());
console.log('Sample translation:', t('app.title'));

// Check storage
chrome.storage.local.get(['yt-shot-labeler-language'], (result) => {
  console.log('Stored language:', result);
});
```

## Future Enhancements

### Planned Features

1. **Auto-detection**: Browser language auto-detection
2. **More Languages**: Spanish, Chinese, Japanese support
3. **Language Packs**: Dynamic language pack loading
4. **Pluralization**: Smart plural form handling
5. **Date/Time Formatting**: Locale-aware formatting

### Community Contributions

Translation contributions are welcome! To contribute:

1. Fork the repository
2. Add translation file for your language
3. Update language configuration
4. Test thoroughly
5. Submit pull request with screenshots

## Conclusion

The i18n implementation provides a solid foundation for multi-language support while maintaining the extension's performance and simplicity. The system is designed to be maintainable, extensible, and user-friendly, following modern web development best practices.