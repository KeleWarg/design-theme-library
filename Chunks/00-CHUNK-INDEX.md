# Chunk Index — Design System Admin v2.0

## Overview

Total chunks: **103** across **7** phases
Estimated total time: **160-180 hours** (with parallelization)

---

## Reading This Document

- Each chunk is identified as `X.YY` (Phase.ChunkNumber)
- Dependencies show which chunks must be complete before starting
- Individual chunk specs are in `chunks/phase-X/chunk-X.YY.md`
- Update Status column as you complete chunks

---

## Phase 0: Validation

| Chunk | Name | Est. Time | Dependencies | Status |
|-------|------|-----------|--------------|--------|
| 0.00 | Project Setup | 2h | None | ⬜ |
| 0.01 | Figma Plugin Setup | 2h | 0.00 | ✅ |
| 0.02 | Component Extraction | 4h | 0.01 | ✅ |
| 0.03 | Image Export | 3h | 0.01 | ✅ |
| 0.04 | API Communication | 2h | 0.02 | ✅ |
| 0.05 | AI Generation Testing | 4h | 0.00 | ✅ |
| 0.06 | Validation Report | 2h | 0.04, 0.05 | ✅ |

**Phase 0 Total:** 17 hours

**Skip Option:** If you want to skip validation, start at Phase 1.

---

## Phase 1: Foundation

| Chunk | Name | Est. Time | Dependencies | Status |
|-------|------|-----------|--------------|--------|
| 1.01 | Supabase Setup | 1h | Phase 0 or skip | ✅ |
| 1.02 | Schema - Themes & Tokens | 2h | 1.01 | ✅ |
| 1.03 | Schema - Typography | 2h | 1.01 | ✅ |
| 1.04 | Schema - Components | 2h | 1.01 | ✅ |
| 1.05 | Storage Buckets | 1h | 1.01 | ✅ |
| 1.06 | Seed Data | 2h | 1.02, 1.03, 1.04 | ✅ |
| 1.07 | Theme Service | 3h | 1.02 | ✅ |
| 1.08 | Token Service | 2h | 1.02 | ✅ |
| 1.09 | Typeface Service | 2h | 1.03, 1.05 | ✅ |
| 1.10 | Component Service | 2h | 1.04 | ✅ |
| 1.11 | App Shell & Routing | 3h | None | ✅ |
| 1.12 | Token Parser | 2h | None | ✅ |

**Phase 1 Total:** 24 hours

---

## Phase 2: Theme System ⭐ CORE

| Chunk | Name | Est. Time | Dependencies | Status |
|-------|------|-----------|--------------|--------|
| 2.01 | ThemesPage Layout | 2h | 1.11, 1.07 | ✅ |
| 2.02 | ThemeCard | 2h | 2.01 | ✅ |
| 2.03 | CreateThemeModal | 2h | 2.01 | ✅ |
| 2.04 | ThemeContext | 3h | 1.07, 1.08 | ✅ |
| 2.05 | ThemeSelector | 2h | 2.04 | ✅ |
| 2.06 | CSS Variable Injection | 2h | 2.04 | ✅ |
| 2.07 | ImportWizard Shell | 2h | 2.01 | ✅ |
| 2.08 | UploadStep | 2.5h | 2.07, 1.12 | ✅ |
| 2.09 | MappingStep | 3h | 2.08 | ✅ |
| 2.10 | ReviewStep | 2.5h | 2.09 | ✅ |
| 2.11 | Import Integration | 2h | 2.10, 1.08 | ✅ |
| 2.12 | ThemeEditor Layout | 2h | 2.01, 1.08 | ✅ |
| 2.13 | CategorySidebar | 1.5h | 2.12 | ✅ |
| 2.14 | TokenList | 2h | 2.12 | ✅ |
| 2.15 | ColorEditor | 3h | 2.14 | ✅ |
| 2.16 | TypographyEditor | 2.5h | 2.14 | ✅ |
| 2.17 | SpacingEditor | 2h | 2.14 | ✅ |
| 2.18 | ShadowEditor | 3h | 2.14 | ✅ |
| 2.19 | RadiusEditor | 1.5h | 2.14 | ✅ |
| 2.20 | GridEditor | 2.5h | 2.14 | ✅ |
| 2.21 | TypefaceManager | 3h | 1.09 | ✅ |
| 2.22 | TypefaceForm | 2.5h | 2.21 | ✅ |
| 2.23 | FontUploader | 3h | 2.21, 1.05 | ✅ |
| 2.24 | TypographyRoleEditor | 3h | 2.21, 2.16 | ✅ |
| 2.25 | Font Loading System | 2h | 2.04, 2.23 | ✅ |
| 2.26 | TypographyPreview | 2.5h | 2.06 | ✅ |
| 2.27 | ThemePreview | 3h | 2.26 | ✅ |

**Phase 2 Total:** 62.5 hours

---

## Phase 3: Component System

| Chunk | Name | Est. Time | Dependencies | Status |
|-------|------|-----------|--------------|--------|
| 3.01 | ComponentsPage Layout | 2h | 1.11, 1.10 | ✅ |
| 3.02 | ComponentCard | 2h | 3.01 | ✅ |
| 3.03 | ComponentFilters | 1.5h | 3.01 | ✅ |
| 3.04 | AddComponentDropdown | 1h | 3.01 | ✅ |
| 3.05 | ManualWizard Shell | 2h | 3.04 | ✅ |
| 3.06 | BasicInfoStep | 1.5h | 3.05 | ✅ |
| 3.07 | PropsStep | 2.5h | 3.05 | ✅ |
| 3.08 | VariantsStep | 2h | 3.05 | ✅ |
| 3.09 | TokenLinkingStep | 2.5h | 3.05, 2.04 | ✅ |
| 3.10 | AIGenerationFlow | 3h | 3.04, 2.04 | ✅ |
| 3.11 | AI Service | 4h | 1.08 | ✅ |
| 3.12 | ComponentDetail Layout | 2h | 3.01, 1.10 | ✅ |
| 3.13 | PreviewTab | 3h | 3.12, 2.04 | ✅ |
| 3.14 | CodeTab | 2.5h | 3.12 | ✅ |
| 3.15 | PropsTab | 2h | 3.12 | ✅ |
| 3.16 | TokensTab | 2h | 3.12, 2.04 | ✅ |
| 3.17 | ExamplesTab | 2h | 3.12 | ✅ |

**Phase 3 Total:** 38.5 hours

---

## Phase 4: Figma Import

| Chunk | Name | Est. Time | Dependencies | Status |
|-------|------|-----------|--------------|--------|
| 4.01 | Plugin UI | 2h | 0.02 | ✅ |
| 4.02 | ComponentExtractor | 3h | 0.02 | ✅ |
| 4.03 | ImageExporter | 3h | 0.03 | ✅ |
| 4.04 | PluginAPIClient | 2h | 0.04 | ✅ |
| 4.05 | Plugin Integration Test | 2h | 4.01-4.04 | ✅ |
| 4.06 | FigmaImportPage | 2h | 1.11, 1.10 | ✅ |
| 4.07 | ImportReviewCard | 2h | 4.06 | ✅ |
| 4.08 | ImportReviewModal | 2h | 4.07 | ✅ |
| 4.09 | FigmaStructureView | 2.5h | 4.08 | ✅ |
| 4.10 | ImageManager | 2.5h | 4.08, 1.05 | ✅ |
| 4.11 | Import API Endpoint | 2h | 4.04, 1.10 | ✅ |
| 4.12 | Figma Prompt Builder | 3h | 3.11, 4.02 | ✅ |
| 4.13 | Generate from Figma | 2h | 4.12, 4.08 | ✅ |

**Phase 4 Total:** 30 hours

---

## Phase 5: Export System

| Chunk | Name | Est. Time | Dependencies | Status |
|-------|------|-----------|--------------|--------|
| 5.01 | ExportModal Shell | 2h | 1.11 | ✅ |
| 5.02 | ThemeSelector Export | 1.5h | 5.01, 1.07 | ✅ |
| 5.03 | ComponentSelector | 1.5h | 5.01, 1.10 | ✅ |
| 5.04 | FormatTabs | 2h | 5.01 | ✅ |
| 5.05 | CSS Generator | 2h | 1.08 | ✅ |
| 5.06 | JSON Generator | 1.5h | 1.08 | ✅ |
| 5.07 | Tailwind Generator | 2h | 1.08 | ✅ |
| 5.08 | SCSS Generator | 1.5h | 1.08 | ✅ |
| 5.09 | FontFace Generator | 2h | 1.09 | ✅ |
| 5.10 | LLMS.txt Generator | 3h | 1.08, 1.10 | ✅ |
| 5.11 | Cursor Rules Generator | 2h | 5.10 | ✅ |
| 5.12 | Claude MD Generator | 2h | 5.10 | ✅ |
| 5.13 | Project Knowledge Gen | 1.5h | 5.10 | ✅ |
| 5.14 | MCP Server Scaffold | 2h | None | ✅ |
| 5.15 | MCP Token Tools | 2.5h | 5.14 | ✅ |
| 5.16 | MCP Component Tools | 2h | 5.14 | ✅ |
| 5.17 | MCP Package Generator | 2h | 5.15, 5.16 | ✅ |
| 5.18 | Claude Skill Generator | 2h | 5.10 | ✅ |
| 5.19 | Package Builder | 3h | 5.05-5.18 | ✅ |
| 5.20 | ZIP Download | 1.5h | 5.19 | ✅ |

**Phase 5 Total:** 40 hours

---

## Phase 6: Testing & Polish

| Chunk | Name | Est. Time | Dependencies | Status |
|-------|------|-----------|--------------|--------|
| 6.01 | E2E: Theme Flow | 3h | Phase 2 | ✅ |
| 6.02 | E2E: Component Flow | 3h | Phase 3 | ✅ |
| 6.03 | E2E: Export Flow | 3h | Phase 5 | ✅ |
| 6.04 | Integration Tests | 4h | Phases 1-5 | ✅ |
| 6.05 | Error States | 3h | Phases 2-5 | ✅ |
| 6.06 | Empty States | 2h | Phases 2-4 | ✅ |
| 6.07 | Documentation | 3h | All | ✅ |

**Phase 6 Total:** 21 hours

---

## Dependency Graph

```
Phase 1: Foundation
  1.01 ──┬── 1.02 ── 1.07 ── 1.08
         ├── 1.03 ── 1.09
         ├── 1.04 ── 1.10
         └── 1.05
  1.11, 1.12 (parallel, no deps)
              │
              ▼
Phase 2: Theme System ⭐
  2.01-2.06 (CRUD + Context)
  2.07-2.11 (Import Flow)      ─── parallel tracks
  2.12-2.20 (Token Editors)    ───
  2.21-2.25 (Typography)       ───
  2.26-2.27 (Preview)
              │
              ▼
Phase 3: Components
  3.01-3.04 (List UI)
  3.05-3.11 (Creation)         ─── parallel tracks
  3.12-3.17 (Detail Page)      ───
              │
              ▼
Phase 4: Figma Import
  4.01-4.05 (Plugin)           ─── parallel tracks
  4.06-4.11 (Admin UI)         ───
  4.12-4.13 (AI + Figma)
              │
              ▼
Phase 5: Export
  5.01-5.04 (Modal UI)
  5.05-5.09 (Token Formats)    ─── parallel tracks
  5.10-5.13 (AI Exports)       ───
  5.14-5.17 (MCP Server)       ───
  5.18-5.20 (Package)
              │
              ▼
Phase 6: Testing
  6.01-6.07 (all parallel)
```

---

## Critical Path

Minimum path to working theme editor:

```
1.01 → 1.02 → 1.07 → 1.08 → 2.01 → 2.04 → 2.12 → 2.14 → 2.15
```

**Critical path time:** ~22 hours

Minimum path to export:
```
... → 5.01 → 5.05 → 5.10 → 5.19 → 5.20
```

**Full critical path:** ~35 hours

---

## Parallelization Opportunities

| Parallel Group | Chunks | Notes |
|----------------|--------|-------|
| Foundation | 1.02 + 1.03 + 1.04 + 1.05 | All depend only on 1.01 |
| Foundation | 1.11 + 1.12 | No dependencies |
| Services | 1.07 + 1.09 + 1.10 | After their schema deps |
| Theme UI | 2.01-2.06 vs 2.07-2.11 vs 2.21-2.25 | 3 parallel tracks |
| Token Editors | 2.15-2.20 | All depend only on 2.14 |
| Component UI | 3.05-3.11 vs 3.12-3.17 | 2 parallel tracks |
| Figma | 4.01-4.05 vs 4.06-4.11 | Plugin vs Admin |
| Generators | 5.05-5.09 + 5.10-5.13 + 5.14-5.17 | 3 parallel tracks |
| Testing | 6.01-6.07 | All parallel after features done |

---

## Gate Checkpoints

| Gate | After | Test File | Status |
|------|-------|-----------|--------|
| Gate 1 | 1.02 + 1.07 + 1.08 | `tests/gates/gate-1.test.js` | ⬜ |
| Gate 2 | 2.04 + 2.06 + 2.11 | `tests/gates/gate-2.test.jsx` | ⬜ |
| Gate 3 | 2.14 + 2.15 | `tests/gates/gate-3.test.jsx` | ⬜ |
| Gate 4 | Phase 2 complete | `tests/gates/gate-4.test.jsx` | ✅ |
| Gate 5 | 3.11 + 3.12 | `tests/gates/gate-5.test.jsx` | ⬜ |
| Gate 6 | Phase 3 complete | `tests/gates/gate-6.test.jsx` | ⬜ |
| Gate 7 | 4.05 + 4.11 | `tests/gates/gate-7.test.jsx` | ⬜ |
| Gate 8 | 5.19 + 5.20 | `tests/gates/gate-8.test.js` | ⬜ |
| Gate 9 | Phase 6 complete | `tests/e2e/full-flow.spec.ts` | ⬜ |

---

## Summary

| Phase | Chunks | Hours | Key Deliverable |
|-------|--------|-------|-----------------|
| 0 | 7 | 17h | Validation report |
| 1 | 12 | 24h | Schema + services |
| 2 | 27 | 62.5h | Theme system |
| 3 | 17 | 38.5h | Component system |
| 4 | 13 | 30h | Figma import |
| 5 | 20 | 40h | Export system |
| 6 | 7 | 21h | Testing & polish |
| **Total** | **103** | **233h** | **Complete system** |

**With 3 parallel agents: ~80-100 hours**
**With 5 parallel agents: ~60-70 hours**

---

## Status Legend

- ⬜ Not started
- 🔄 In progress
- ✅ Complete
- ⚠️ Blocked
- 🔍 Needs review
