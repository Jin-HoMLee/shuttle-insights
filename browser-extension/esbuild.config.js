// esbuild.config.js
import fs from 'fs';
import path from 'path';
import esbuild from 'esbuild';

// Copy static files function
function copyStaticFiles() {
  const staticFiles = [
    { from: 'src/manifest.json', to: 'dist/manifest.json' },
    { from: 'src/background.js', to: 'dist/background.js' },
    { from: 'src/styles.css', to: 'dist/styles.css' },
    { from: 'src/assets/badminton_shots_glossary.json', to: 'dist/assets/badminton_shots_glossary.json' }
  ];

  // Ensure dist and assets directories exist
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
  }
  if (!fs.existsSync('dist/assets')) {
    fs.mkdirSync('dist/assets', { recursive: true });
  }

  staticFiles.forEach(({ from, to }) => {
    if (fs.existsSync(from)) {
      fs.copyFileSync(from, to);
      console.log(`Copied ${from} to ${to}`);
    } else {
      console.warn(`Warning: ${from} not found`);
    }
  });
}

esbuild.build({
  entryPoints: ['src/content.js'],
  bundle: true,
  outfile: 'dist/content.js',
  minify: false,        // Set to true for production
  sourcemap: true,      // Useful for debugging
  target: ['chrome110'],// Or latest Chrome version
  format: 'iife',       // Ensures compatibility with content scripts
}).then(() => {
  // Copy static files after successful build
  copyStaticFiles();
  console.log('Build completed successfully!');
}).catch(() => process.exit(1));