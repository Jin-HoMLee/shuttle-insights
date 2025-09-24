# Material 3 Setup Guide

### Purpose
Provide step-by-step instructions and best practices for installing and setting up Material Design 3 (Material You) in the browser extension, to assist with the migration effort.

---

#### 1. Implementation Used

- [x] **Material Web Components (MWC)** for framework-agnostic setup (`@material/web`).

#### 2. Installation

```bash
npm install @material/web
```

#### 3. Theming & Configuration

- For MWC, import components and customize CSS custom properties.
- See [Material Web Getting Started](https://material-web.dev/getting-started/).

#### 4. Browser Extension Best Practices

- Import only needed components to minimize bundle size.
- Use static imports, enable tree-shaking.
- Consider Shadow DOM for isolation (with web components).

#### 5. Accessibility & Responsiveness

- Use semantic HTML, ARIA roles, and test for keyboard/screen reader compatibility.
- Support light/dark mode and dynamic theming.

#### 6. Example Usage

```html
<md-filled-button>Material 3 Button</md-filled-button>
<script type="module">
  import '@material/web/button/filled-button.js';
</script>
```

#### 7. References
- [Material Design 3 Guidelines](https://m3.material.io/)
- [Material Web Components](https://material-web.dev/)
- [Browser Extension Performance Best Practices](https://web.dev/extensions-performance-best-practices/)

---

_This issue will guide the technical setup needed for the overall Material 3 migration._