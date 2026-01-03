#!/bin/bash
# Design System Admin - Project Bootstrap
# Run this in an empty directory to set up the project

set -e

echo "🚀 Design System Admin - Bootstrap"
echo "=================================="

# Check if Chunks folder exists
if [ ! -d "Chunks" ]; then
  echo "❌ Error: Chunks/ folder not found"
  echo "   Copy the Chunks folder to this directory first"
  exit 1
fi

echo "📦 Initializing npm project..."
npm init -y

echo "📦 Installing dependencies..."
npm install react@18 react-dom@18 react-router-dom@6
npm install @supabase/supabase-js
npm install lucide-react sonner
npm install -D vite @vitejs/plugin-react
npm install -D tailwindcss postcss autoprefixer
npm install -D vitest @testing-library/react jsdom

echo "📁 Creating directory structure..."
mkdir -p src/{components,contexts,hooks,lib,pages,services}
mkdir -p src/components/{layout,themes,editor,components,export,import,figma,typography,preview,ui}
mkdir -p src/components/components/{wizard,detail}
mkdir -p src/services/generators
mkdir -p src/templates/mcp-server/src
mkdir -p tests/{unit,integration,e2e,fixtures,gates}
mkdir -p supabase/migrations
mkdir -p docs
mkdir -p config
mkdir -p .cursor/rules

echo "📝 Creating configuration files..."

# vite.config.js
cat > vite.config.js << 'VITE'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
VITE

# tailwind.config.js
cat > tailwind.config.js << 'TAILWIND'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
TAILWIND

# postcss.config.js
cat > postcss.config.js << 'POSTCSS'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
POSTCSS

# index.html
cat > index.html << 'HTML'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Design System Admin</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
HTML

# src/main.jsx
cat > src/main.jsx << 'MAIN'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
MAIN

# src/App.jsx
cat > src/App.jsx << 'APP'
export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b p-4">
        <h1 className="text-xl font-bold">Design System Admin</h1>
        <p className="text-gray-500">Run chunk 1.11 to implement routing</p>
      </header>
    </div>
  )
}
APP

# src/index.css
cat > src/index.css << 'CSS'
@tailwind base;
@tailwind components;
@tailwind utilities;
CSS

# .env.example
cat > .env.example << 'ENV'
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_CLAUDE_API_KEY=your-claude-api-key
ENV

# .gitignore
cat > .gitignore << 'GITIGNORE'
node_modules
dist
.env
.env.local
*.log
.DS_Store
GITIGNORE

# Copy Cursor rules if present
if [ -f "automation/cursor-rules.mdc" ]; then
  cp automation/cursor-rules.mdc .cursor/rules/
fi

# Update package.json scripts
npm pkg set scripts.dev="vite"
npm pkg set scripts.build="vite build"
npm pkg set scripts.preview="vite preview"
npm pkg set scripts.test="vitest"

echo ""
echo "✅ Bootstrap complete!"
echo ""
echo "Next steps:"
echo "  1. cp .env.example .env.local"
echo "  2. Edit .env.local with your Supabase/Claude keys"
echo "  3. npm run dev"
echo "  4. Open Cursor and start with chunk 1.01"
echo ""
echo "First Cursor prompt:"
echo '  Implement chunk 1.01 (Supabase Setup).'
echo '  Read: Chunks/Chunk1/chunk-1.01.md'
echo ""
