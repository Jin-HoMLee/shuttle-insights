// esbuild.config.js
require('esbuild').build({
  entryPoints: ['src/content.js'],
  bundle: true,
  outfile: 'dist/content.js',
  minify: false,        // Set to true for production
  sourcemap: true,      // Useful for debugging
  target: ['chrome110'],// Or latest Chrome version
  format: 'iife',       // Ensures compatibility with content scripts
}).catch(() => process.exit(1));