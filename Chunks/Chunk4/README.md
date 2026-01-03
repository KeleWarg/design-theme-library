# Phase 4 — Figma Component Import

Build the Figma plugin enhancement and Admin Tool integration for importing components with AI-enhanced code generation.

## Overview

Phase 4 creates a complete pipeline from Figma to working React components: enhance the Figma plugin to export components, build the Admin Tool import review interface, and connect to AI generation with Figma structure context.

## Sections

| Section | Chunks | Hours | Description |
|---------|--------|-------|-------------|
| 4A | 4.01-4.05 | 12h | Plugin Enhancement |
| 4B | 4.06-4.11 | 15h | Import Review Flow |
| 4C | 4.12-4.13 | 5h | AI with Figma Context |
| **Total** | **13 chunks** | **30h** | |

## Parallelization Diagram

```
PHASE 4 EXECUTION FLOW
======================

Week 1: Plugin Enhancement (4A)
───────────────────────────────

         ┌─────────────────────────────────────────────────────────┐
         │                     SECTION 4A                          │
         │                 Plugin Enhancement                      │
         └─────────────────────────────────────────────────────────┘

Track A (UI):              Track B (Extractors):
    │                           │
    ▼                           ▼
  4.01 ──────────────────► 4.02
  Components Tab            ComponentExtractor
  (2h)                      (3h)
                                │
                                ├──► 4.03
                                │    ImageExporter
                                │    (3h)
                                │
                                ▼
                            4.04
                            PluginAPIClient
                            (2h)
                                │
                                ▼
                            4.05
                            Integration Test
                            (2h)
                                │
                                ▼
         ┌─────────────────────────────────────────────────────────┐
         │              GATE: Plugin Exports Working               │
         │  ✓ Scan finds all components                            │
         │  ✓ Metadata extracted correctly                         │
         │  ✓ Images exported                                      │
         │  ✓ API receives payload                                 │
         └─────────────────────────────────────────────────────────┘


Week 2: Import Review Flow (4B)
───────────────────────────────

         ┌─────────────────────────────────────────────────────────┐
         │                     SECTION 4B                          │
         │                 Import Review Flow                      │
         └─────────────────────────────────────────────────────────┘

Track A (Pages):           Track B (API):
    │                           │
    ▼                           ▼
  4.06 ──────────────────► 4.11
  FigmaImportPage           Import API Endpoint
  (2h)                      (2h)
    │
    ├──► 4.07
    │    ImportReviewCard
    │    (2h)
    │
    └──► 4.08
         ImportReviewModal
         (2h)
           │
           ├──► 4.09
           │    FigmaStructureView
           │    (2.5h)
           │
           └──► 4.10
                ImageManager
                (2.5h)
                    │
                    ▼
         ┌─────────────────────────────────────────────────────────┐
         │              GATE: Import Review Working                │
         │  ✓ Import page loads data                               │
         │  ✓ Review modal shows all tabs                          │
         │  ✓ Structure tree renders                               │
         │  ✓ Image management works                               │
         └─────────────────────────────────────────────────────────┘


Week 2-3: AI with Figma Context (4C)
────────────────────────────────────

         ┌─────────────────────────────────────────────────────────┐
         │                     SECTION 4C                          │
         │                AI with Figma Context                    │
         └─────────────────────────────────────────────────────────┘

  4.12 ───────────────────────────► 4.13
  Figma Prompt Builder              Generate from Figma
  (3h)                              (2h)
                                        │
                                        ▼
         ┌─────────────────────────────────────────────────────────┐
         │              GATE: Phase 4 Complete                     │
         │  ✓ AI prompt includes Figma structure                   │
         │  ✓ Token bindings mapped to CSS vars                    │
         │  ✓ Generated code matches Figma layout                  │
         │  ✓ Component saved with images                          │
         └─────────────────────────────────────────────────────────┘
```

## Parallel Execution Strategy

### Maximum Parallelization (2 tracks)

| Track | Focus | Chunks | Hours |
|-------|-------|--------|-------|
| A | Plugin + UI | 4.01, 4.06-4.10 | 14h |
| B | Extractors + API + AI | 4.02-4.05, 4.11-4.13 | 16h |

**With parallelization: ~18 hours** (vs 30h sequential)

### Recommended Execution Order

1. **Day 1**: 4.01 (Plugin UI) + 4.02 (ComponentExtractor) in parallel
2. **Day 2**: 4.03 (ImageExporter) + 4.04 (APIClient)
3. **Day 2**: 4.05 (Plugin Integration Test)
4. **Day 3**: 4.06 (FigmaImportPage) + 4.11 (API Endpoint) in parallel
5. **Day 3-4**: 4.07, 4.08 (Review components)
6. **Day 4**: 4.09, 4.10 (Modal tabs) in parallel
7. **Day 5**: 4.12 (Figma Prompt Builder)
8. **Day 5**: 4.13 (Generate Flow)

## Chunk Index

### Section 4A: Plugin Enhancement (12h)
| Chunk | Name | Hours | Dependencies |
|-------|------|-------|--------------|
| 4.01 | Plugin UI - Components Tab | 2h | 0.02 |
| 4.02 | ComponentExtractor Module | 3h | 0.02 |
| 4.03 | ImageExporter Module | 3h | 0.03 |
| 4.04 | PluginAPIClient | 2h | 0.04 |
| 4.05 | Plugin Integration Testing | 2h | 4.01-4.04 |

### Section 4B: Import Review Flow (15h)
| Chunk | Name | Hours | Dependencies |
|-------|------|-------|--------------|
| 4.06 | FigmaImportPage | 2h | 1.10, 1.11 |
| 4.07 | ImportReviewCard | 2h | 4.06 |
| 4.08 | ImportReviewModal | 2h | 4.07 |
| 4.09 | FigmaStructureView | 2.5h | 4.08 |
| 4.10 | ImageManager | 2.5h | 4.08, 1.05 |
| 4.11 | Import API Endpoint | 2h | 4.04, 1.10 |

### Section 4C: AI with Figma Context (5h)
| Chunk | Name | Hours | Dependencies |
|-------|------|-------|--------------|
| 4.12 | Figma Prompt Builder | 3h | 3.11, 4.02 |
| 4.13 | Generate from Figma Flow | 2h | 4.12, 4.08 |

## Gate Checkpoints

### Gate 4A: Plugin Export
- [ ] Scan finds all components in document
- [ ] Component metadata extracted (name, description, type)
- [ ] Properties extracted from componentPropertyDefinitions
- [ ] Variants parsed from ComponentSet
- [ ] Bound variables detected with collection info
- [ ] Preview images exported at 2x
- [ ] Vector icons exported as SVG
- [ ] API receives payload successfully

### Gate 4B: Import Review
- [ ] Import page loads from API
- [ ] Component cards show preview + stats
- [ ] Review modal opens with all tabs
- [ ] Structure tree expands/collapses
- [ ] Layout indicators show correctly
- [ ] Images can be replaced/removed
- [ ] Props can be edited before import

### Gate 4C: AI Generation
- [ ] Prompt includes Figma structure hints
- [ ] Token bindings mapped to CSS variables
- [ ] Generated code uses correct layout (flex)
- [ ] Props match Figma properties
- [ ] Component saved with all metadata
- [ ] Images uploaded to component

## Key Files Created

```
figma-plugin/
├── src/
│   ├── ui/
│   │   ├── ComponentsTab.tsx
│   │   ├── ComponentListItem.tsx
│   │   └── fetchHandler.ts
│   ├── extractors/
│   │   ├── component.ts
│   │   └── images.ts
│   ├── api/
│   │   └── client.ts
│   ├── types/
│   │   ├── component.ts
│   │   ├── images.ts
│   │   └── api.ts
│   └── main.ts

src/
├── pages/
│   └── FigmaImportPage.jsx
├── components/
│   └── figma-import/
│       ├── ImportReviewCard.jsx
│       ├── ImportReviewModal.jsx
│       ├── FigmaStructureView.jsx
│       ├── ImageManager.jsx
│       └── GenerateFromFigma.jsx
├── hooks/
│   └── useFigmaImport.js
└── lib/
    └── figmaPromptBuilder.js

supabase/
├── functions/
│   └── figma-import/
│       └── index.ts
└── migrations/
    └── 005_figma_imports.sql
```

## Database Tables Added

```sql
-- Figma import sessions
figma_imports (
  id, file_key, file_name, exported_at, 
  component_count, status, created_at
)

-- Staged component data
figma_import_components (
  id, import_id, figma_id, name, description,
  component_type, properties, variants, 
  structure, bound_variables
)

-- Imported images
figma_import_images (
  id, import_id, node_id, node_name,
  storage_path, format, width, height
)
```

## Notes

- Plugin communicates via UI iframe (fetch available there)
- Large payloads chunked at 1MB threshold
- Images stored in Supabase Storage bucket
- Figma structure limited to 5 levels depth
- AI prompt enhanced with structure hints for better layout matching
- Category auto-detected from component name patterns
