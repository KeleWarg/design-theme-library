# Phase 5 — Export System

Build the comprehensive export system with multiple format generators and AI platform integrations.

## Overview

Phase 5 creates a full export pipeline: UI for selecting themes/components, generators for various token formats (CSS, JSON, Tailwind, SCSS), AI platform exports (LLMS.txt, Cursor rules, Claude files), and MCP server generation for Claude Desktop integration.

## Sections

| Section | Chunks | Hours | Description |
|---------|--------|-------|-------------|
| 5A | 5.01-5.04 | 7h | Export Modal UI |
| 5B | 5.05-5.09 | 9h | Token Format Generators |
| 5C | 5.10-5.13 | 8.5h | AI Platform Exports |
| 5D | 5.14-5.17 | 8.5h | MCP Server Package |
| 5E | 5.18-5.20 | 6.5h | Package Builder & Download |
| **Total** | **20 chunks** | **40h** | |

## Parallelization Diagram

```
PHASE 5 EXECUTION FLOW
======================

Week 1: Export Modal + Generators
─────────────────────────────────

         ┌─────────────────────────────────────────────────────────┐
         │                   SECTIONS 5A + 5B                      │
         │              Export Modal + Token Formats               │
         └─────────────────────────────────────────────────────────┘

Track A (UI):              Track B (Generators):
    │                           │
    ▼                           ▼
  5.01 ──────────────────► 5.05
  ExportModal Shell         CSS Generator
  (2h)                      (2h)
    │                           │
    ├──► 5.02                   ├──► 5.06
    │    ThemeSelector          │    JSON Generator
    │    (1.5h)                 │    (1.5h)
    │                           │
    ├──► 5.03                   ├──► 5.07
    │    ComponentSelector      │    Tailwind Generator
    │    (1.5h)                 │    (2h)
    │                           │
    └──► 5.04                   ├──► 5.08
         FormatTabs             │    SCSS Generator
         (2h)                   │    (1.5h)
                                │
                                └──► 5.09
                                     FontFace Generator
                                     (2h)
                                        │
                                        ▼
         ┌─────────────────────────────────────────────────────────┐
         │              GATE: Token Generators Ready               │
         │  ✓ CSS generates valid output                           │
         │  ✓ JSON nested/flat/style-dictionary                    │
         │  ✓ Tailwind config valid JS                             │
         │  ✓ SCSS variables and maps                              │
         └─────────────────────────────────────────────────────────┘


Week 2: AI Platforms + MCP
──────────────────────────

         ┌─────────────────────────────────────────────────────────┐
         │                   SECTIONS 5C + 5D                      │
         │              AI Platforms + MCP Server                  │
         └─────────────────────────────────────────────────────────┘

Track A (AI Formats):      Track B (MCP):
    │                           │
    ▼                           ▼
  5.10 ──────────────────► 5.14
  LLMS.txt Generator        MCP Server Scaffold
  (3h)                      (2h)
    │                           │
    ├──► 5.11                   ├──► 5.15
    │    Cursor Rules           │    MCP Token Tools
    │    (2h)                   │    (2.5h)
    │                           │
    ├──► 5.12                   └──► 5.16
    │    Claude MD                   MCP Component Tools
    │    (2h)                        (2h)
    │                                   │
    └──► 5.13                           ▼
         Project Knowledge          5.17
         (1.5h)                     MCP Package Generator
                                    (2h)
                                        │
                                        ▼
         ┌─────────────────────────────────────────────────────────┐
         │              GATE: AI Exports Ready                     │
         │  ✓ LLMS.txt comprehensive                               │
         │  ✓ Cursor rules under 3KB                               │
         │  ✓ MCP server compiles                                  │
         └─────────────────────────────────────────────────────────┘


Week 2-3: Package Builder
─────────────────────────

         ┌─────────────────────────────────────────────────────────┐
         │                     SECTION 5E                          │
         │                  Package Builder                        │
         └─────────────────────────────────────────────────────────┘

  5.18 ──────► 5.19 ──────► 5.20
  Claude Skill  Package     ZIP Download
  (2h)          Builder     (1.5h)
                (3h)
                                │
                                ▼
         ┌─────────────────────────────────────────────────────────┐
         │              GATE: Phase 5 Complete                     │
         │  ✓ All formats generate correctly                       │
         │  ✓ Export modal fully functional                        │
         │  ✓ ZIP download works                                   │
         │  ✓ MCP server tested                                    │
         └─────────────────────────────────────────────────────────┘
```

## Parallel Execution Strategy

### Maximum Parallelization (3 tracks)

| Track | Focus | Chunks | Hours |
|-------|-------|--------|-------|
| A | UI Components | 5.01-5.04 | 7h |
| B | Token Generators | 5.05-5.09 | 9h |
| C | AI + MCP | 5.10-5.18 | 17h |

Then sequential: 5.19, 5.20

**With parallelization: ~25 hours** (vs 40h sequential)

### Recommended Execution Order

1. **Day 1**: 5.01 (Modal) + 5.05 (CSS) + 5.14 (MCP Scaffold) in parallel
2. **Day 1-2**: 5.02-5.04 + 5.06-5.08 + 5.15-5.16 in parallel
3. **Day 2**: 5.09 + 5.10 (LLMS.txt) in parallel
4. **Day 3**: 5.11-5.13 + 5.17 in parallel
5. **Day 3-4**: 5.18 (Claude Skill)
6. **Day 4**: 5.19 (Package Builder) - needs all generators
7. **Day 4**: 5.20 (ZIP Download)

## Chunk Index

### Section 5A: Export Modal (7h)
| Chunk | Name | Hours | Dependencies |
|-------|------|-------|--------------|
| 5.01 | ExportModal Shell | 2h | 1.11 |
| 5.02 | ThemeSelector (Export) | 1.5h | 5.01, 1.07 |
| 5.03 | ComponentSelector | 1.5h | 5.01, 1.10 |
| 5.04 | FormatTabs | 2h | 5.01 |

### Section 5B: Token Format Generators (9h)
| Chunk | Name | Hours | Dependencies |
|-------|------|-------|--------------|
| 5.05 | CSS Generator | 2h | 1.08 |
| 5.06 | JSON Generator | 1.5h | 1.08 |
| 5.07 | Tailwind Generator | 2h | 1.08 |
| 5.08 | SCSS Generator | 1.5h | 1.08 |
| 5.09 | FontFace Generator | 2h | 1.09 |

### Section 5C: AI Platform Exports (8.5h)
| Chunk | Name | Hours | Dependencies |
|-------|------|-------|--------------|
| 5.10 | LLMS.txt Generator | 3h | 1.08, 1.10 |
| 5.11 | Cursor Rules Generator | 2h | 5.10 |
| 5.12 | Claude MD Generator | 2h | 5.10 |
| 5.13 | Project Knowledge Generator | 1.5h | 5.10 |

### Section 5D: MCP Server Package (8.5h)
| Chunk | Name | Hours | Dependencies |
|-------|------|-------|--------------|
| 5.14 | MCP Server Scaffold | 2h | None |
| 5.15 | MCP Token Tools | 2.5h | 5.14 |
| 5.16 | MCP Component Tools | 2h | 5.14 |
| 5.17 | MCP Package Generator | 2h | 5.15, 5.16 |

### Section 5E: Package Builder (6.5h)
| Chunk | Name | Hours | Dependencies |
|-------|------|-------|--------------|
| 5.18 | Claude Skill Generator | 2h | 5.10 |
| 5.19 | Package Builder | 3h | 5.05-5.18 |
| 5.20 | ZIP Download | 1.5h | 5.19 |

## Gate Checkpoints

### Gate 5A: Export Modal
- [ ] Modal opens with theme/component selectors
- [ ] Multi-select works for both
- [ ] Format tabs navigate correctly
- [ ] Export button triggers build

### Gate 5B: Token Generators
- [ ] CSS generates valid :root variables
- [ ] CSS multi-theme with data attributes
- [ ] JSON nested and flat formats
- [ ] Tailwind config is valid JavaScript
- [ ] SCSS flat variables and maps
- [ ] FontFace generates @font-face rules

### Gate 5C: AI Platform Exports
- [ ] LLMS.txt includes all sections
- [ ] LLMS.txt under 50KB
- [ ] Cursor rules under 3KB
- [ ] Claude MD files valid
- [ ] Project knowledge under 3KB

### Gate 5D: MCP Server
- [ ] TypeScript compiles without errors
- [ ] Server starts and connects
- [ ] All 6 tools respond correctly
- [ ] design-system.json has correct structure

### Gate 5E: Package Builder
- [ ] All requested formats generated
- [ ] File paths correct in package
- [ ] ZIP downloads successfully
- [ ] Binary files (fonts) included

## Key Files Created

```
src/
├── components/
│   └── export/
│       ├── ExportModal.jsx
│       ├── ThemeSelector.jsx
│       ├── ComponentSelector.jsx
│       ├── FormatTabs.jsx
│       ├── ExportPreview.jsx
│       └── ExportResultDialog.jsx
├── services/
│   ├── exportService.js
│   ├── zipService.js
│   └── generators/
│       ├── cssGenerator.js
│       ├── jsonGenerator.js
│       ├── tailwindGenerator.js
│       ├── scssGenerator.js
│       ├── fontFaceGenerator.js
│       ├── llmsTxtGenerator.js
│       ├── cursorRulesGenerator.js
│       ├── claudeMdGenerator.js
│       ├── projectKnowledgeGenerator.js
│       ├── mcpServerGenerator.js
│       ├── mcpTemplates.js
│       └── claudeSkillGenerator.js
└── templates/
    └── mcp-server/
        ├── package.json
        ├── tsconfig.json
        └── src/
            ├── index.ts
            ├── server.ts
            ├── types.ts
            └── tools/
                ├── tokenTools.ts
                └── componentTools.ts
```

## Export Formats Summary

### Token Formats
| Format | File | Description |
|--------|------|-------------|
| CSS | `dist/tokens.css` | Custom properties in :root |
| JSON | `dist/tokens.json` | Nested with metadata |
| JSON Flat | `dist/tokens.flat.json` | Flat key-value |
| Tailwind | `dist/tailwind.config.js` | Theme extend object |
| SCSS | `dist/_tokens.scss` | Variables |
| SCSS Maps | `dist/_tokens-maps.scss` | SCSS maps with getter |

### AI Platform Formats
| Format | File(s) | Target |
|--------|---------|--------|
| LLMS.txt | `LLMS.txt` | Universal AI |
| Cursor | `.cursor/rules/design-system.mdc` | Cursor IDE |
| Claude | `CLAUDE.md`, `.claude/rules/tokens.md` | Claude Projects |
| Project Knowledge | `project-knowledge.txt` | Bolt/Lovable |
| MCP Server | `mcp-server/` | Claude Desktop |
| Claude Skill | `skill/` | Claude.ai Projects |

## Notes

- LLMS.txt is always generated as universal documentation
- Token generators share utility functions from cssGenerator
- MCP server is a complete npm package ready to build
- ZIP includes binary files (fonts) fetched from storage
- All AI formats are designed to stay under context limits
- Claude Skill includes both SKILL.md and JSON data files
