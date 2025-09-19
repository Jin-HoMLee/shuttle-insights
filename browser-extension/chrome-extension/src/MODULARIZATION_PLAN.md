# Modularization Action Plan

## Phase 1: Split panel.js (Immediate Priority)

### Current State
- **File Size:** 548 lines (17.5% of total codebase)
- **Responsibilities:** 4 distinct areas mixed together
- **Complexity:** Large HTML template, event handling, workflow logic, integrations

### Target Architecture

```
panel.js (548 lines) 
    ↓
├── panel-factory.js      (~120 lines) - Panel creation & styling
├── panel-workflow.js     (~150 lines) - Shot marking workflow  
├── panel-events.js       (~130 lines) - Event handlers & shortcuts
├── panel-coordinator.js  (~120 lines) - Module integration & lifecycle
└── panel-templates.js    (~100 lines) - HTML templates & constants
```

### Step-by-Step Implementation

#### Step 1: Extract HTML Templates (Low Risk)
**File:** `panel-templates.js`
```javascript
// Extract large HTML template strings
export const PANEL_HTML_TEMPLATE = `...`;
export const SECTION_TEMPLATES = {
  videoDetails: `...`,
  overlayControls: `...`,
  // ...
};
```

#### Step 2: Extract Panel Factory (Low Risk)  
**File:** `panel-factory.js`
```javascript
import { PANEL_HTML_TEMPLATE } from './panel-templates.js';

export function createPanelElement(dateTimeStr, videoTitle, videoUrl) {
  // Move createPanelElement function here
}

export function stylePanelElement(panel) {
  // Move styling logic here
}

export function setupScrollableBehavior(panel) {
  // Move scrollable setup here
}
```

#### Step 3: Extract Event Handling (Medium Risk)
**File:** `panel-events.js`
```javascript
export function setupKeyboardShortcuts(panel, handlers) {
  // Move keyboard shortcut logic
}

export function setupCloseButton(panel, onClose) {
  // Move close button setup
}

export function setupOverlayButton(panel, overlayHandler) {
  // Move overlay button setup
}
```

#### Step 4: Extract Workflow Logic (Medium Risk)
**File:** `panel-workflow.js`
```javascript
export function setupShotMarkingButtons(panel, workflowState, callbacks) {
  // Move shot start/end marking logic
}

export function createWorkflowState(initialShot) {
  // Create workflow state management
}

export function validateWorkflowState(currentShot) {
  // Move workflow validation
}
```

#### Step 5: Create Coordinator (High Risk - Most Changes)
**File:** `panel-coordinator.js`
```javascript
import { createPanelElement, stylePanelElement } from './panel-factory.js';
import { setupKeyboardShortcuts, setupCloseButton } from './panel-events.js';
import { setupShotMarkingButtons, createWorkflowState } from './panel-workflow.js';

export function createLabelerPanel() {
  // Orchestrate all the pieces
  // This becomes the new main export
}

export function togglePanel() {
  // Move toggle logic here
}
```

### Migration Strategy

#### Option A: Big Bang (Faster, Higher Risk)
1. Create all 5 new files in one PR
2. Update imports across the codebase
3. Test everything together

#### Option B: Gradual (Safer, Recommended)
1. **Week 1:** Extract templates (minimal impact)
2. **Week 2:** Extract factory (low impact)  
3. **Week 3:** Extract events (medium impact)
4. **Week 4:** Extract workflow (medium impact)
5. **Week 5:** Create coordinator & finalize

### Testing Strategy

#### Regression Testing Checklist
- [ ] Panel opens and closes correctly
- [ ] Shot marking workflow functions
- [ ] Keyboard shortcuts work
- [ ] CSV import/export still works
- [ ] Glossary buttons still work
- [ ] Drag and resize still work
- [ ] Overlay toggle still works

#### Unit Testing Opportunities (New)
After split, each module can be tested independently:
```javascript
// Example: panel-workflow.test.js
import { validateWorkflowState } from './panel-workflow.js';

test('validates complete shot workflow', () => {
  const shot = { start: 10, end: 20, label: 'clear' };
  expect(validateWorkflowState(shot)).toBe(true);
});
```

## Phase 2: Consider glossary.js Split (Future)

### Trigger Conditions
- File exceeds 500 lines
- Adding new shot categories frequently
- Dimension control complexity increases

### Potential Split
```
glossary.js (400 lines)
    ↓ 
├── glossary-loader.js    (~100 lines) - JSON loading & data management
├── glossary-shots.js     (~150 lines) - Shot type buttons & selection
└── glossary-dimensions.js (~150 lines) - Dimension controls & UI
```

## Phase 3: Monitor Growth Areas

### ui-utils.js Watch List
**Current:** 236 lines  
**Split Trigger:** 300+ lines  
**Potential Split:**
```
ui-utils.js → {
  formatters.js,    // Date/time formatting, sanitization
  messages.js,      // Error/success/warning displays  
  dom-helpers.js    // DOM utilities, loading states
}
```

### csv.js Expansion Scenarios
**Current:** 321 lines (well-organized)  
**Split Only If:** Adding multiple file formats (JSON, XML, etc.)

## Implementation Timeline

### Month 1: panel.js Split
- **Week 1-2:** Planning & template extraction  
- **Week 3-4:** Factory and events extraction
- **Week 5-6:** Workflow extraction & coordinator
- **Week 7-8:** Testing & refinement

### Month 2: Documentation & Process
- Update architecture documentation
- Create splitting guidelines for future files
- Set up automated complexity monitoring

### Month 3+: Monitoring
- Watch for new complexity hotspots
- Apply lessons learned to other large files
- Consider template extraction for other HTML-heavy files

## Success Metrics

### Quantitative
- [ ] No single file exceeds 300 lines
- [ ] panel.js reduced from 548 to ~120 lines average per split file
- [ ] Maintained build performance (≤2.2MB)
- [ ] No increase in bundle complexity

### Qualitative  
- [ ] Easier to locate specific functionality
- [ ] Reduced cognitive load when editing
- [ ] Improved testability of components
- [ ] Clearer responsibility boundaries

## Risk Mitigation

### High Risk Areas
1. **Panel Integration:** Many files depend on panel.js exports
2. **Event Handling:** Complex event listener lifecycle management
3. **State Management:** Current shot state shared across functions

### Mitigation Strategies
1. **Gradual Migration:** Implement piece by piece with rollback points
2. **Interface Stability:** Maintain existing public APIs during transition
3. **Comprehensive Testing:** Regression test suite before each step
4. **Documentation:** Update all relevant docs during migration

## Rollback Plan

If modularization causes issues:

### Immediate Rollback (< 24 hours)
1. Revert to previous commit
2. Investigate issues in development
3. Fix problems before re-attempting

### Selective Rollback (After deployment)
1. Keep beneficial splits (templates, factory)
2. Temporarily revert problematic splits (coordinator)
3. Address issues incrementally

## Future Considerations

### Code Generation
For repetitive UI patterns, consider:
```javascript
// Auto-generate button creation code
generateButtonConfig({
  type: 'shot-marking',
  shortcuts: ['Ctrl+S', 'Ctrl+E'],
  validation: shotValidationRules
});
```

### TypeScript Migration
Split files provide natural boundaries for:
- Interface definitions
- Type-safe module boundaries  
- Compile-time dependency checking

### Build Optimization
Smaller files enable:
- Better tree-shaking
- Selective component loading
- Development hot-reload optimization