# Design System Admin - Figma Plugin PoC

Proof of concept Figma plugin for validating API capabilities.

## Purpose

This PoC validates:
- ✅ Plugin loads without errors
- ✅ UI renders correctly
- ✅ Can access `figma.currentPage`
- ✅ Can communicate between main code and UI via `postMessage`
- ✅ Can track selection changes

## Setup

1. Install dependencies:
   ```bash
   cd poc/figma-plugin
   npm install
   ```

2. Build the plugin:
   ```bash
   npm run build
   ```

3. Install in Figma:
   - Open Figma Desktop
   - Go to **Plugins** > **Development** > **Import plugin from manifest...**
   - Select `poc/figma-plugin/manifest.json`

4. Run the plugin:
   - Right-click on canvas
   - Select **Plugins** > **Development** > **Design System Admin PoC**

## Development

Watch mode for development:
```bash
npm run watch
```

Type checking:
```bash
npm run typecheck
```

## File Structure

```
poc/figma-plugin/
├── manifest.json         # Plugin configuration
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── src/
│   ├── main.ts           # Plugin entry (Figma sandbox)
│   └── ui.tsx            # UI entry (iframe)
├── scripts/
│   └── build-html.js     # Inlines JS into HTML
└── dist/                 # Build output (generated)
    ├── main.js
    └── ui.html
```

## Next Steps

After validating this PoC:
- **Chunk 0.02**: Component extraction testing
- **Chunk 0.03**: Image export testing
- **Chunk 0.04**: API communication testing

## Verification Checklist

- [ ] Plugin loads in Figma Dev Mode
- [ ] Status shows "Connected to Figma"
- [ ] Current page name and ID display correctly
- [ ] Selection updates when elements are selected
- [ ] Ping/Pong communication works
- [ ] No console errors

