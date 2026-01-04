/**
 * @chunk 0.01 - Figma Plugin PoC Setup
 * 
 * Build script to generate the UI HTML file with inlined JavaScript.
 * Figma plugins require the UI to be a single HTML file with inlined scripts.
 */

const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const jsPath = path.join(distDir, 'ui.js');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Read the bundled JavaScript
let jsContent = '';
if (fs.existsSync(jsPath)) {
  jsContent = fs.readFileSync(jsPath, 'utf8');
}

// Generate HTML with inlined JavaScript
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Design System Admin PoC</title>
  <style>
    * {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      padding: 0;
      background: #fff;
    }
    #root {
      min-height: 100vh;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
${jsContent}
  </script>
</body>
</html>`;

// Write the HTML file
fs.writeFileSync(path.join(distDir, 'ui.html'), html);

console.log('✅ Built ui.html with inlined JavaScript');


