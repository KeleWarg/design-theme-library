# Phase 3 — Component System

Build the component management system with manual creation, AI generation, and detailed editing.

## Overview

Phase 3 implements the full component lifecycle: listing, creation (manual and AI-powered), and detailed editing with live preview.

## Sections

| Section | Chunks | Hours | Description |
|---------|--------|-------|-------------|
| 3A | 3.01-3.04 | 6.5h | Component List |
| 3B | 3.05-3.11 | 17.5h | Add Component Flow |
| 3C | 3.12-3.17 | 13.5h | Component Detail Page |
| **Total** | **17 chunks** | **37.5h** | |

## Parallelization Diagram

```
PHASE 3 EXECUTION FLOW
======================

Week 1: Component List + Creation Start (3A + 3B)
─────────────────────────────────────────────────

         ┌─────────────────────────────────────────────────────────┐
         │                     SECTION 3A                          │
         │                   Component List                        │
         └─────────────────────────────────────────────────────────┘

  3.01 ───┬──► 3.02
  Page    │    Card
  (2h)    │    (2h)
          │
          ├──► 3.03
          │    Filters
          │    (1.5h)
          │
          └──► 3.04
               Dropdown
               (1h)
                 │
                 ▼
         ┌─────────────────────────────────────────────────────────┐
         │              GATE: Component List Functional            │
         │  ✓ List components with grid view                       │
         │  ✓ Filter by status/category/search                     │
         │  ✓ Add dropdown with 3 creation paths                   │
         └─────────────────────────────────────────────────────────┘


         ┌─────────────────────────────────────────────────────────┐
         │                     SECTION 3B                          │
         │                  Add Component Flow                     │
         └─────────────────────────────────────────────────────────┘

Track A (Manual):              Track B (AI):
    │                              │
    ▼                              ▼
  3.05 ─────────────────────► 3.10
  Wizard Shell                AI Flow
  (2h)                        (3h)
    │                              │
    ├──► 3.06                      │
    │    BasicInfo                 │
    │    (1.5h)                    │
    │                              │
    ├──► 3.07                      ▼
    │    Props                 3.11
    │    (2.5h)                AI Service
    │                          (4h)
    ├──► 3.08
    │    Variants
    │    (2h)
    │
    └──► 3.09
         TokenLinking
         (2.5h)
                 │
                 ▼
         ┌─────────────────────────────────────────────────────────┐
         │              GATE: Component Creation Works             │
         │  ✓ Manual wizard completes all steps                    │
         │  ✓ AI generation produces valid component               │
         │  ✓ Both paths save to database                          │
         └─────────────────────────────────────────────────────────┘


Week 2: Component Detail (3C)
─────────────────────────────

         ┌─────────────────────────────────────────────────────────┐
         │                     SECTION 3C                          │
         │                 Component Detail Page                   │
         └─────────────────────────────────────────────────────────┘

  3.12 ───┬──► 3.13
  Layout  │    Preview
  (2h)    │    (3h)
          │
          ├──► 3.14
          │    CodeTab
          │    (2.5h)
          │
          ├──► 3.15
          │    PropsTab
          │    (2h)
          │
          ├──► 3.16
          │    TokensTab
          │    (2h)
          │
          └──► 3.17
               Examples
               (2h)
                 │
                 ▼
         ┌─────────────────────────────────────────────────────────┐
         │              GATE: Phase 3 Complete                     │
         │  ✓ Full component CRUD                                  │
         │  ✓ Live preview with prop controls                      │
         │  ✓ Monaco code editor                                   │
         │  ✓ Token linking with detection                         │
         │  ✓ Usage examples for LLMS.txt                          │
         └─────────────────────────────────────────────────────────┘
```

## Parallel Execution Strategy

### Maximum Parallelization (3 tracks)

| Track | Focus | Chunks | Hours |
|-------|-------|--------|-------|
| A | List + Manual | 3.01-3.09 | 17h |
| B | AI Generation | 3.10-3.11 | 7h |
| C | Detail Tabs (parallel) | 3.13-3.17 (after 3.12) | 11.5h |

**With parallelization: ~22 hours** (vs 37.5h sequential)

### Recommended Execution Order

1. **Day 1**: 3.01 (ComponentsPage)
2. **Day 1-2**: 3.02, 3.03, 3.04 in parallel
3. **Day 2-3**: 3.05 (Manual wizard shell) + 3.10 (AI flow) in parallel
4. **Day 3-4**: 3.06-3.09 (wizard steps) + 3.11 (AI service) in parallel
5. **Day 5**: 3.12 (Detail layout)
6. **Day 5-6**: 3.13-3.17 (all tabs in parallel)

## Chunk Index

### Section 3A: Component List (6.5h)
| Chunk | Name | Hours | Dependencies |
|-------|------|-------|--------------|
| 3.01 | ComponentsPage Layout | 2h | 1.10, 1.11 |
| 3.02 | ComponentCard | 2h | 3.01 |
| 3.03 | ComponentFilters | 1.5h | 3.01 |
| 3.04 | AddComponentDropdown | 1h | 3.01 |

### Section 3B: Add Component Flow (17.5h)
| Chunk | Name | Hours | Dependencies |
|-------|------|-------|--------------|
| 3.05 | ManualCreationWizard Shell | 2h | 3.04 |
| 3.06 | BasicInfoStep | 1.5h | 3.05 |
| 3.07 | PropsStep | 2.5h | 3.05 |
| 3.08 | VariantsStep | 2h | 3.05 |
| 3.09 | TokenLinkingStep | 2.5h | 3.05, 2.04 |
| 3.10 | AIGenerationFlow | 3h | 3.04, 2.04 |
| 3.11 | AI Service & Prompt Builder | 4h | 1.08 |

### Section 3C: Component Detail Page (13.5h)
| Chunk | Name | Hours | Dependencies |
|-------|------|-------|--------------|
| 3.12 | ComponentDetail Layout | 2h | 3.01, 1.10 |
| 3.13 | PreviewTab | 3h | 3.12, 2.04 |
| 3.14 | CodeTab (Monaco) | 2.5h | 3.12 |
| 3.15 | PropsTab | 2h | 3.12 |
| 3.16 | TokensTab | 2h | 3.12, 2.04 |
| 3.17 | ExamplesTab | 2h | 3.12 |

## Gate Checkpoints

### Gate 3A: Component List
- [ ] Grid displays components
- [ ] Filter by status works
- [ ] Filter by category works
- [ ] Search works
- [ ] Add dropdown shows 3 options

### Gate 3B: Component Creation
- [ ] Manual wizard completes all 4 steps
- [ ] Props definition works
- [ ] Variants with prop values work
- [ ] Token linking works
- [ ] AI generation produces valid JSX
- [ ] AI regeneration with feedback works
- [ ] Both paths save to database

### Gate 3C: Component Detail
- [ ] Tab navigation works
- [ ] Live preview renders component
- [ ] Prop controls update preview
- [ ] Variant selection applies props
- [ ] Monaco editor loads and saves
- [ ] Props CRUD works
- [ ] Token linking with detection
- [ ] Examples CRUD works

## Key Files Created

```
src/
├── pages/
│   ├── ComponentsPage.jsx
│   ├── CreateComponentPage.jsx
│   └── ComponentDetail.jsx
├── components/
│   └── components/
│       ├── ComponentCard.jsx
│       ├── ComponentFilters.jsx
│       ├── AddComponentDropdown.jsx
│       ├── create/
│       │   ├── ManualCreationWizard.jsx
│       │   ├── BasicInfoStep.jsx
│       │   ├── PropsStep.jsx
│       │   ├── VariantsStep.jsx
│       │   ├── TokenLinkingStep.jsx
│       │   ├── AIGenerationFlow.jsx
│       │   └── TokenSelector.jsx
│       └── detail/
│           ├── PreviewTab.jsx
│           ├── ComponentRenderer.jsx
│           ├── PropControl.jsx
│           ├── CodeTab.jsx
│           ├── PropsTab.jsx
│           ├── TokensTab.jsx
│           └── ExamplesTab.jsx
├── hooks/
│   ├── useComponents.js
│   └── useComponent.js
├── services/
│   └── aiService.js
└── lib/
    └── promptBuilder.js
```

## Notes

- AI generation requires `VITE_CLAUDE_API_KEY` environment variable
- Monaco Editor requires `@monaco-editor/react` package
- ComponentRenderer uses eval-based approach; consider react-live for production
- Token detection scans component code for CSS variable references
- Examples feed into LLMS.txt export (Phase 5)
