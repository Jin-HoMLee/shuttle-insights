/**
 * Mock for Material Web Components
 * Used in Jest tests to avoid import issues
 */

// Mock all Material Web Component imports
export default {};

// Define mock Material 3 components for jsdom
if (typeof window !== 'undefined') {
  // Mock md-filled-button
  class MockMdFilledButton extends HTMLElement {
    constructor() {
      super();
      this.innerHTML = this.textContent || 'Button';
    }
  }
  
  // Mock md-outlined-button
  class MockMdOutlinedButton extends HTMLElement {
    constructor() {
      super();
      this.innerHTML = this.textContent || 'Button';
    }
  }
  
  // Mock md-icon-button
  class MockMdIconButton extends HTMLElement {
    constructor() {
      super();
      this.innerHTML = this.textContent || '×';
    }
  }
  
  // Mock md-filter-chip
  class MockMdFilterChip extends HTMLElement {
    constructor() {
      super();
      this.innerHTML = this.textContent || 'Chip';
    }
    
    setAttribute(name, value) {
      super.setAttribute(name, value);
      if (name === 'selected') {
        this.classList.add('selected');
      }
    }
    
    removeAttribute(name) {
      super.removeAttribute(name);
      if (name === 'selected') {
        this.classList.remove('selected');
      }
    }
  }
  
  // Mock md-chip-set
  class MockMdChipSet extends HTMLElement {
    constructor() {
      super();
    }
  }
  
  // Register mock components
  if (!customElements.get('md-filled-button')) {
    customElements.define('md-filled-button', MockMdFilledButton);
  }
  if (!customElements.get('md-outlined-button')) {
    customElements.define('md-outlined-button', MockMdOutlinedButton);
  }
  if (!customElements.get('md-icon-button')) {
    customElements.define('md-icon-button', MockMdIconButton);
  }
  if (!customElements.get('md-filter-chip')) {
    customElements.define('md-filter-chip', MockMdFilterChip);
  }
  if (!customElements.get('md-chip-set')) {
    customElements.define('md-chip-set', MockMdChipSet);
  }
}