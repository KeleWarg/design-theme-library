# Phase 2 — Theme System ⭐ CORE

This is the critical path phase. Everything else builds on this foundation.

## Overview

Phase 2 implements the complete theme management system including CRUD operations, token import, category-specific editors, typography management, and live preview.

## Sections

| Section | Chunks | Hours | Description |
|---------|--------|-------|-------------|
| 2A | 2.01-2.06 | 13h | Theme CRUD + Context |
| 2B | 2.07-2.11 | 11h | Token Import Flow |
| 2C | 2.12-2.20 | 18h | Token Editors |
| 2D | 2.21-2.25 | 13.5h | Typography Enhancement |
| 2E | 2.26-2.27 | 5h | Theme Preview |
| **Total** | **27 chunks** | **60.5h** | |

## Parallelization Diagram

```
PHASE 2 EXECUTION FLOW
======================

Week 1: Foundation (2A + 2B start)
──────────────────────────────────

         ┌─────────────────────────────────────────────────────────┐
         │                     SECTION 2A                          │
         │                  Theme CRUD + Context                   │
         └─────────────────────────────────────────────────────────┘

Track A (UI):        Track B (Context):
    │                     │
    ▼                     ▼
  2.01 ──────────────► 2.04 ◄──── Independent
  ThemesPage           ThemeContext
  (2h)                 (3h)
    │                     │
    ├──────┬──────┐       ├──────┬──────┐
    ▼      ▼      ▼       ▼      ▼      ▼
  2.02   2.03   ─────► 2.05    2.06
  Card   Modal         Selector Injection
  (2h)   (2h)          (2h)    (2h)
    │      │             │       │
    └──────┴─────────────┴───────┘
                 │
                 ▼
         ┌─────────────────────────────────────────────────────────┐
         │              GATE: Theme CRUD Functional                │
         │  ✓ Create/edit/delete themes                            │
         │  ✓ Theme selector switches active theme                 │
         │  ✓ CSS variables injected globally                      │
         └─────────────────────────────────────────────────────────┘


         ┌─────────────────────────────────────────────────────────┐
         │                     SECTION 2B                          │
         │                  Token Import Flow                      │
         └─────────────────────────────────────────────────────────┘

  2.07 ──► 2.08 ──► 2.09 ──► 2.10 ──► 2.11
  Wizard   Upload   Mapping  Review   Integration
  (2h)     (2h)     (3h)     (2h)     (2h)


         ┌─────────────────────────────────────────────────────────┐
         │                     SECTION 2E                          │
         │                    Theme Preview                        │
         └─────────────────────────────────────────────────────────┘

  2.26 ──► 2.27
  Panel    Components
  (2h)     (3h)
              │
              ▼
         ┌─────────────────────────────────────────────────────────┐
         │              GATE: Phase 2 Complete                     │
         │  ✓ Full typography with font upload                     │
         │  ✓ Live preview panel                                   │
         │  ✓ All token types editable                             │
         └─────────────────────────────────────────────────────────┘
```

## Parallel Execution Strategy

### Maximum Parallelization (3 tracks)

| Track | Focus | Chunks | Hours |
|-------|-------|--------|-------|
| A | UI Components | 2.01→2.02/2.03, 2.12→2.13→2.14 | 12h |
| B | Context/Services | 2.04→2.05/2.06, 2.07→...→2.11 | 24h |
| C | Editors (parallel) | 2.15-2.20 (all 6 in parallel) | 12.5h |

**With parallelization: ~35 hours** (vs 60.5h sequential)

## Chunk Index

### Section 2A: Theme CRUD + Context (13h)
| Chunk | Name | Hours | Dependencies |
|-------|------|-------|--------------|
| 2.01 | ThemesPage Layout | 2h | 1.07, 1.11 |
| 2.02 | ThemeCard Component | 2h | 2.01 |
| 2.03 | CreateThemeModal | 2h | 2.01, 1.07 |
| 2.04 | ThemeContext Provider | 3h | 1.07, 1.08 |
| 2.05 | ThemeSelector (Header) | 2h | 2.04 |
| 2.06 | CSS Variable Injection | 2h | 2.04 |

### Section 2B: Token Import Flow (11h)
| Chunk | Name | Hours | Dependencies |
|-------|------|-------|--------------|
| 2.07 | ImportWizard Shell | 2h | 2.01 |
| 2.08 | UploadStep | 2h | 2.07, 1.12 |
| 2.09 | MappingStep | 3h | 2.08 |
| 2.10 | ReviewStep | 2h | 2.09 |
| 2.11 | Import Integration | 2h | 2.07-2.10, 1.08 |

### Section 2C: Token Editors (18h)
| Chunk | Name | Hours | Dependencies |
|-------|------|-------|--------------|
| 2.12 | ThemeEditor Layout | 3h | 2.01, 1.08 |
| 2.13 | CategorySidebar | 1h | 2.12 |
| 2.14 | TokenList | 2h | 2.12 |
| 2.15 | ColorEditor | 3h | 2.14 |
| 2.16 | TypographyEditor | 2h | 2.14 |
| 2.17 | SpacingEditor | 1.5h | 2.14 |
| 2.18 | ShadowEditor | 2.5h | 2.14 |
| 2.19 | RadiusEditor | 1.5h | 2.14 |
| 2.20 | GridEditor | 2h | 2.14 |

### Section 2D: Typography Enhancement (13.5h)
| Chunk | Name | Hours | Dependencies |
|-------|------|-------|--------------|
| 2.21 | TypefaceManager | 3h | 1.09 |
| 2.22 | TypefaceForm | 3h | 2.21 |
| 2.23 | FontUploader | 2.5h | 2.22 |
| 2.24 | TypographyRoleEditor | 3h | 2.21 |
| 2.25 | Font Loading System | 2h | 2.23 |

### Section 2E: Theme Preview (5h)
| Chunk | Name | Hours | Dependencies |
|-------|------|-------|--------------|
| 2.26 | ThemePreview Panel | 2h | 2.06 |
| 2.27 | Preview Components | 3h | 2.26 |

## Gate Checkpoints

### Gate 2A: Theme CRUD
- [ ] Create theme from scratch
- [ ] Edit theme metadata
- [ ] Delete theme
- [ ] Duplicate theme
- [ ] Set default theme
- [ ] Theme selector in header works
- [ ] CSS variables update on theme switch

### Gate 2B: Import Flow
- [ ] Upload JSON file
- [ ] Parse Figma Variables format
- [ ] Detect token categories
- [ ] Allow category override
- [ ] Import tokens to database
- [ ] Navigate to editor after import

### Gate 2C: Token Editors
- [ ] Color editor (HEX/RGB/HSL + opacity)
- [ ] Typography editor (size, weight, line-height)
- [ ] Spacing editor (px/rem)
- [ ] Shadow editor (multi-layer)
- [ ] Radius editor (presets)
- [ ] Grid editor (breakpoints)
- [ ] All editors save to database
- [ ] CSS variables update live

### Gate 2D: Typography
- [ ] Add typeface (Google/Adobe/System/Custom)
- [ ] Upload custom font files
- [ ] Configure typography roles
- [ ] Fonts load correctly
- [ ] Font preview works

### Gate 2E: Preview
- [ ] Preview panel toggles
- [ ] Viewport size selector works
- [ ] All preview components render
- [ ] Updates when tokens change

## Key Files Created

```
src/
├── pages/
│   ├── ThemesPage.jsx
│   ├── ThemeEditorPage.jsx
│   └── ImportWizardPage.jsx
├── contexts/
│   └── ThemeContext.jsx
├── components/
│   ├── themes/
│   │   ├── ThemeCard.jsx
│   │   ├── CreateThemeModal.jsx
│   │   ├── import/
│   │   ├── editor/
│   │   ├── typography/
│   │   └── preview/
│   ├── layout/
│   │   └── ThemeSelector.jsx
│   └── ui/
├── hooks/
│   ├── useThemes.js
│   ├── useTheme.js
│   ├── useTypefaces.js
│   └── useTypographyRoles.js
└── lib/
    ├── cssVariableInjector.js
    ├── cssGenerator.js
    ├── fontLoader.js
    ├── colorUtils.js
    └── googleFonts.js
```
