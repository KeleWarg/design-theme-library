# Gate Checkpoints — Design System Admin

All gate definitions for Phases 0-5. Gates verify integration before proceeding.

---

## Phase 0 — Validation

### Gate 0 — Validation Complete
**Trigger:** 0.01-0.03 all ✅

**Verifies:**
- Figma plugin PoC extracts tokens
- Token parser handles all formats
- Supabase connection works

**Test:**
```bash
# Plugin builds
cd poc/figma-plugin && npm run build

# Parser works
node -e "require('./src/lib/tokenParser.js')"

# Supabase connects
curl $SUPABASE_URL/rest/v1/ -H "apikey: $SUPABASE_ANON_KEY"
```

---

## Phase 1 — Foundation

### Gate 1 — Foundation Complete
**Trigger:** 1.01-1.12 all ✅

**Verifies:**
- Database schema deployed
- All services functional
- Routing works
- App shell renders

**Test:**
```bash
# Build succeeds
npm run build

# App loads
npm run dev
# Navigate to / — should render app shell
```

---

## Phase 2 — Theme System

### Gate 2 — Theme CRUD
**Trigger:** 2.01-2.04 all ✅

**Verifies:**
- Create theme works
- Edit theme works
- Delete theme works
- ThemeContext provides data

**Test:**
1. Create new theme → appears in list
2. Edit theme name → persists
3. Delete theme → removed from list

---

### Gate 3 — Token Editors
**Trigger:** 2.05-2.15 all ✅

**Verifies:**
- All editor components render
- Token values editable
- Changes persist to database

**Test:**
1. Edit color token → preview updates
2. Edit spacing token → value saves
3. All editors render without errors

---

### Gate 4 — Phase 2 Complete
**Trigger:** 2.01-2.27 all ✅

**Verifies:**
- Full theme system works
- Typography/typeface management
- Theme preview functional
- Token import from JSON

**Test:**
1. Import Figma JSON → tokens created
2. Edit tokens across all categories
3. Preview updates in real-time
4. Typography page manages typefaces

---

## Phase 3 — Component System

### Gate 5 — Component List
**Trigger:** 3.01-3.04 all ✅

**Verifies:**
- ComponentsPage renders
- Filters work
- Cards display correctly
- Add dropdown shows options

**Test:**
```bash
# Components wired up
grep -r "<ComponentCard" src/
grep -r "<ComponentFilters" src/
grep -r "<AddComponentDropdown" src/
```

1. Navigate to /components
2. Filters update list
3. "Add Component" dropdown shows 3 options

---

### Gate 6 — Creation Wizards
**Trigger:** 3.05-3.11 all ✅

**Verifies:**
- Manual wizard completes all steps
- AI generation works
- Components save to database

**Test:**
1. /components/new?mode=manual → complete 4 steps → component created
2. /components/new?mode=ai → enter prompt → generate → accept → saved

---

### Gate 7 — Component Detail
**Trigger:** 3.12-3.17 all ✅

**Verifies:**
- Detail page loads
- All 5 tabs work (Preview, Code, Props, Tokens, Examples)
- Save/Cancel pattern works
- Delete requires confirmation

**Test:**
1. Click component → detail page loads
2. Each tab renders without error
3. Edit code → Save → persists
4. Edit props → Save → persists
5. Link tokens → Save → persists

---

## Phase 4 — Figma Import

### Gate 8 — Figma Plugin
**Trigger:** 4.01-4.05 all ✅

**Verifies:**
- Plugin UI works
- Component extraction works
- Image export works
- API client sends data

**Test:**
```bash
# Plugin builds
cd poc/figma-plugin && npm run build
```

1. Load plugin in Figma
2. Scan Document → components appear
3. Select components → Export → sends to API

---

### Gate 9 — Import UI
**Trigger:** 4.06-4.11 all ✅

**Verifies:**
- FigmaImportPage shows imports
- Review modal works
- Structure/Images/Tokens tabs work
- API endpoint receives data

**Test:**
1. Navigate to /figma-import
2. Imports appear in list
3. Click import → review modal opens
4. All tabs render correctly

---

### Gate 10 — Phase 4 Complete
**Trigger:** 4.01-4.13 all ✅

**Verifies:**
- Full Figma → Admin → AI generation flow
- Figma context in AI prompt
- Component created with linked tokens (PATHS not IDs)
- Images uploaded

**Test:**
1. Export from Figma plugin
2. Review in admin
3. Click "Import & Generate Code"
4. Component created with:
   - Generated code ✅
   - Props from Figma ✅
   - Linked tokens as paths ✅
   - Images uploaded ✅

---

## Phase 5 — Export System

### Gate 11 — Export Modal UI
**Trigger:** 5.01-5.04 all ✅

**Verifies:**
- ExportModal opens
- ThemeSelector shows themes
- ComponentSelector shows published components
- FormatTabs navigate correctly

**Test:**
1. Open Export modal
2. Select themes → checkboxes work
3. Select components → filter works
4. Tab navigation works

---

### Gate 12 — Token Generators
**Trigger:** 5.05-5.09 all ✅

**Verifies:**
- CSS Generator → valid CSS
- JSON Generator → valid JSON
- Tailwind Generator → valid JS config
- SCSS Generator → valid SCSS
- FontFace Generator → valid @font-face rules

**Test:**
```javascript
const tokens = [
  { name: 'color-primary', value: '#3b82f6', category: 'color' }
];

// Each must produce valid output
generateCSS(tokens);        // Valid CSS
generateJSON(tokens);       // JSON.parse() works
generateTailwind(tokens);   // Valid JS
generateSCSS(tokens);       // Valid SCSS
generateFontFaceCss([]);    // Valid CSS
```

---

### Gate 13 — AI Generators
**Trigger:** 5.10-5.13 all ✅

**Verifies:**
- LLMS.txt comprehensive
- Cursor Rules under 3KB
- Claude MD well-formatted
- Project Knowledge complete

**Test:**
```javascript
const themes = [{ name: 'Default', tokens: [...] }];
const components = [{ name: 'Button', code: '...' }];

generateLLMSTxt(themes, components);         // Comprehensive
generateCursorRules(themes, components);     // Under 3KB
generateClaudeMd(themes, components);        // Valid markdown
generateProjectKnowledge(themes, components); // Complete
```

---

### Gate 14 — Phase 5 Complete
**Trigger:** 5.01-5.20 all ✅

**Verifies:**
- Full export flow works
- All generators produce valid output
- MCP server compiles
- ZIP downloads correctly

**Test:**
1. Open Export Modal
2. Select themes + components
3. Select "Full Package"
4. Click Export
5. ZIP downloads with:
   - LLMS.txt ✅
   - dist/tokens.css ✅
   - dist/tokens.json ✅
   - dist/tailwind.config.js ✅
   - .cursor/rules/*.mdc ✅
   - CLAUDE.md ✅
   - mcp-server/ ✅
   - skill/ ✅
   - package.json ✅

6. Verify MCP server compiles:
```bash
cd mcp-server && npm install && npm run build
```

---

## Phase 6 — Testing & Polish

### Gate 15 — E2E Tests
**Trigger:** 6.01-6.04 all ✅

**Verifies:**
- E2E test suite passes
- All critical flows covered
- CI/CD pipeline works

---

### Gate 16 — Phase 6 Complete (MVP)
**Trigger:** 6.01-6.07 all ✅

**Verifies:**
- All tests pass
- Performance acceptable
- Documentation complete
- Ready for release

---

## Gate Summary

| Gate | Phase | Trigger | Verifies |
|------|-------|---------|----------|
| 0 | 0 | 0.01-0.03 | Validation/PoC |
| 1 | 1 | 1.01-1.12 | Foundation |
| 2 | 2 | 2.01-2.04 | Theme CRUD |
| 3 | 2 | 2.05-2.15 | Token Editors |
| 4 | 2 | 2.01-2.27 | Phase 2 Complete |
| 5 | 3 | 3.01-3.04 | Component List |
| 6 | 3 | 3.05-3.11 | Creation Wizards |
| 7 | 3 | 3.12-3.17 | Component Detail |
| 8 | 4 | 4.01-4.05 | Figma Plugin |
| 9 | 4 | 4.06-4.11 | Import UI |
| 10 | 4 | 4.01-4.13 | Phase 4 Complete |
| 11 | 5 | 5.01-5.04 | Export Modal |
| 12 | 5 | 5.05-5.09 | Token Generators |
| 13 | 5 | 5.10-5.13 | AI Generators |
| 14 | 5 | 5.01-5.20 | Phase 5 Complete |
| 15 | 6 | 6.01-6.04 | E2E Tests |
| 16 | 6 | 6.01-6.07 | MVP Complete |

---

## Current Status

| Gate | Status |
|------|--------|
| Gate 0 | ✅ PASSED |
| Gate 1 | ✅ PASSED |
| Gate 2 | ✅ PASSED |
| Gate 3 | ✅ PASSED |
| Gate 4 | ✅ PASSED |
| Gate 5 | ✅ PASSED |
| Gate 6 | ✅ PASSED |
| Gate 7 | ✅ PASSED |
| Gate 8 | ✅ PASSED |
| Gate 9 | ✅ PASSED |
| Gate 10 | ✅ PASSED |
| Gate 11 | ✅ PASSED |
| Gate 12 | ⏳ In Progress |
| Gate 13 | ⏳ In Progress |
| Gate 14 | ⏳ Pending |
| Gate 15 | ⬜ Not Started |
| Gate 16 | ⬜ Not Started |
