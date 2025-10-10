# Module Splitting Documentation

-> back to [README](../README.md)

## Overview

This document describes the splitting process for large multi-purpose files in the browser extension, outlining the rationale and implementation details.

## Files Split

### 1. panel.js (Original: 34 lines)

**Status**: Already split (completed in previous iteration)

**Split Into**:
- `panel-coordinator.js` (146 lines) - Module integration & lifecycle management
- `panel-templates.js` (156 lines) - HTML templates and template strings  
- `panel-factory.js` (86 lines) - DOM creation & styling logic
- `panel-events.js` (163 lines) - Event handlers & keyboard shortcuts
- `panel-workflow.js` (204 lines) - Shot marking workflow logic

**Current Role**: Compatibility layer re-exporting functions from coordinator module

### 2. csv.js (Original: 321 lines → Final: 38 lines)

**Split Into**:
- `csv-import.js` (92 lines) - Import functionality and parsing logic
- `csv-export.js` (95 lines) - Export functionality and generation logic  
- `csv-utils.js` (140 lines) - Shared utilities (parsing, escaping, validation)

**Current Role**: Compatibility layer coordinating import and export modules

### 3. glossary.js (Original: 400 lines → Final: 76 lines)

**Split Into**:
- `glossary-loader.js` (43 lines) - Data loading and error handling
- `glossary-buttons.js` (93 lines) - Shot button creation and management
- `glossary-dimensions.js` (200 lines) - Dimension controls and UI
- `glossary-utils.js` (25 lines) - Shared utilities and helpers

**Current Role**: Compatibility layer coordinating all glossary modules

## Splitting Rationale

### Separation of Concerns

1. **Data Loading vs UI Creation**: Separated data fetching logic from UI component creation
2. **Import vs Export**: CSV import and export have different responsibilities and error handling
3. **Button Management vs Dimension Controls**: Different UI patterns and interaction models
4. **Utilities vs Core Logic**: Reusable functions separated from specific implementations

### Benefits Achieved

1. **Improved Maintainability**: Each module has a single, focused responsibility
2. **Better Testability**: Smaller modules are easier to unit test
3. **Code Reusability**: Utility functions can be shared across modules
4. **Reduced Complexity**: Individual modules are easier to understand and modify
5. **Cleaner Dependencies**: Clear separation of what each module needs

### Compatibility Approach

- **Backward Compatibility**: All original API functions still work unchanged
- **Gradual Migration**: New code can use specific modules directly
- **No Breaking Changes**: Existing imports continue to function
- **Clear Documentation**: Each compatibility layer explains the new structure

## Module Organization Patterns

### 1. Compatibility Layer Pattern

Used for maintaining API compatibility while enabling modular structure:

```javascript
// Main module (e.g., csv.js)
import { setupCSVImport } from './csv-import.js';
import { setupCSVExport } from './csv-export.js';

export function setupCSV(panel, shots, updateShotList, videoUrl, sanitizedTitle) {
  setupCSVImport(panel, shots, updateShotList);
  setupCSVExport(panel, shots, videoUrl, sanitizedTitle);
}
```

### 2. Utility Separation Pattern  

Common utilities extracted to shared modules:

```javascript
// csv-utils.js
export function parseCSVRow(line) { /* implementation */ }
export function escapeCSVField(value) { /* implementation */ }

// Used by both csv-import.js and csv-export.js
import { parseCSVRow, escapeCSVField } from './csv-utils.js';
```

### 3. Feature Module Pattern

Related functionality grouped by feature:

```javascript
// glossary-buttons.js - handles shot button creation
// glossary-dimensions.js - handles dimension controls  
// glossary-loader.js - handles data loading
```

## File Size Improvements

| Module | Original Lines | Final Main Lines | Total Split Lines | Reduction |
|--------|----------------|------------------|-------------------|-----------|
| panel.js | 34 | 34 | 755 (already split) | N/A |
| csv.js | 321 | 38 | 367 total | 88% reduction |
| glossary.js | 400 | 76 | 361 total | 81% reduction |

## Implementation Guidelines

### For Future Splits

1. **Identify Clear Boundaries**: Look for natural separation points in functionality
2. **Preserve Public APIs**: Ensure existing code doesn't break
3. **Create Focused Modules**: Each module should have one primary responsibility  
4. **Extract Common Utilities**: Shared code should be in separate utility modules
5. **Maintain Documentation**: Update comments to reflect new structure

### When to Split

Split a file when it:
- Exceeds 300-400 lines
- Contains multiple distinct responsibilities  
- Has separable utility functions
- Becomes difficult to navigate or understand
- Has mixed concerns (UI + logic + data handling)

### When NOT to Split

Don't split when:
- The file is already focused and cohesive
- Splitting would create many tiny files with minimal content
- The code is tightly coupled and difficult to separate
- The complexity of coordination outweighs the benefits

## Testing Strategy

After splitting:

1. **Build Verification**: Ensure the extension builds successfully
2. **Import/Export Testing**: Verify CSV functionality works correctly  
3. **UI Testing**: Confirm shot buttons and dimensions work as expected
4. **Integration Testing**: Test the complete panel creation workflow
5. **Compatibility Testing**: Ensure existing code using old APIs continues to work

## Conclusion

The module splitting process successfully reduced complexity while maintaining full backward compatibility. The new structure provides:

- Better organization by functionality
- Easier maintenance and testing
- Clear separation of concerns  
- Preserved API compatibility
- Foundation for future enhancements

Each split module now has a focused responsibility, making the codebase more maintainable and easier to understand for new contributors.