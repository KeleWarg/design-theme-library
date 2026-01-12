# Chunk 0.01 — Figma Plugin PoC Setup

## Purpose
Initialize a minimal Figma plugin project to test API capabilities.

---

## Inputs
- None (fresh start)

## Outputs
- Working Figma plugin scaffold (consumed by chunk 0.02, 0.03)
- manifest.json configured
- Basic UI rendering

---

## Dependencies
- None

---

## Implementation Notes

### Key Considerations
- Use TypeScript for type safety
- Keep plugin minimal - only what's needed for PoC
- Test in Figma Dev Mode first

### Gotchas
- Plugin sandbox has limited APIs
- CORS issues when calling external APIs
- Must use `figma.ui.postMessage` for UI communication

### Algorithm/Approach
1. Create manifest.json with required permissions
2. Setup TypeScript compilation
3. Create minimal UI with React
4. Test basic figma.currentPage access

### Manifest Permissions Required
```json
{
  "name": "Design System Admin PoC",
  "id": "design-system-admin-poc",
  "api": "1.0.0",
  "main": "dist/main.js",
  "ui": "dist/ui.html",
  "editorType": ["figma"],
  "capabilities": ["currentuser"],
  "permissions": ["activeusers"],
  "networkAccess": {
    "allowedDomains": ["*"]
  }
}
```

---

## Files Created
- `figma-plugin/manifest.json` — Plugin configuration
- `figma-plugin/package.json` — Dependencies
- `figma-plugin/tsconfig.json` — TypeScript config
- `figma-plugin/src/main.ts` — Plugin entry point
- `figma-plugin/src/ui.tsx` — UI entry point

---

## Tests

### Unit Tests
- [ ] Plugin loads without errors
- [ ] UI renders correctly

### Verification
- [ ] Can install plugin in Figma Dev Mode
- [ ] Can access figma.currentPage

---

## Time Estimate
2 hours

---

## Notes
This is the first step in validating Figma API capabilities. Success here is required before proceeding with extraction and export testing.
