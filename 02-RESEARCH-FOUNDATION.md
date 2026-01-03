# Research Foundation

## Overview
This document grounds all technical decisions in research, prior art, or explicitly documented engineering decisions for the Design System Admin v2.0.

---

## Data Sources

| Source | What It Provides | How We Use It |
|--------|------------------|---------------|
| Figma Variables JSON Export | Token structure, types, color spaces, alias references | Primary import format |
| W3C Design Tokens Format (DTCG) | Community standard for `$type`, `$value`, `$extensions` | Reference for token semantics |
| Project token files (*.json) | Real-world production token structures | Test fixtures |
| LLMS.txt Specification | AI-readable documentation format | Export target format |
| Cursor Rules Format | IDE rule file structure (.mdc) | Export target format |
| Claude Project Files | Claude.ai project knowledge format | Export target format |
| MCP Specification | Model Context Protocol server structure | Export target format |

---

## Key Scientific Decisions

### Token Type Detection
**Choice:** Infer type from `$type` field with fallback to path-based heuristics
**Rationale:** Figma Variables always include `$type`; path detection handles edge cases
**Source:** Figma Variables export format specification

### Color Space Handling
**Choice:** Store both sRGB components and hex; convert on import if hex missing
**Rationale:** Figma exports both; hex is human-readable, components enable color math
**Source:** Figma Variables JSON structure (sRGB 0-1 component values)

### Category Detection
**Choice:** Path-prefix matching with explicit mapping table
**Rationale:** Figma uses hierarchical naming (Color/Button/Primary); first segment indicates category
**Source:** Analysis of production token files

### AI Export Size Limits
**Choice:** LLMS.txt < 50KB, Cursor rules < 3KB, Project Knowledge < 3KB
**Rationale:** Context window constraints; diminishing returns on larger files
**Source:** Claude/GPT context limits, Cursor rule loading behavior

---

## Engineering Decisions

### ENGINEERING DECISION: CSS Variable Naming

**Context:** Need consistent CSS variable names from arbitrary token paths
**Decision:** Generate as `--{category}-{path-segments}` with lowercase, hyphen normalization
**Rationale:** 
- Matches CSS custom property conventions
- Lowercase prevents case-sensitivity issues
- Hyphens are standard separator

### ENGINEERING DECISION: Database Token Storage

**Context:** Tokens have varying value structures (color = object, number = primitive)
**Decision:** Store `value` as JSONB column
**Rationale:**
- Avoids schema changes for new token types
- Enables querying within value structure
- Preserves original data without flattening

### ENGINEERING DECISION: Component Code Storage

**Context:** Component code varies in length and complexity
**Decision:** Store as TEXT column with no size limit in database
**Rationale:**
- Components can be arbitrarily complex
- Supabase TEXT has no practical limit
- Monaco editor handles large files fine

### ENGINEERING DECISION: AI Generation Model

**Context:** Need reliable code generation for components
**Decision:** Use claude-sonnet-4-20250514 via API
**Rationale:**
- Best balance of quality and speed for code generation
- Consistent output format
- Supports structured prompts with token context

### ENGINEERING DECISION: MCP Server as Export

**Context:** MCP servers need to run locally
**Decision:** Export MCP server as downloadable package, not hosted
**Rationale:**
- User controls their own AI tool integrations
- No server hosting costs
- Works offline after download

---

## Figma Variables Format Specification

### Token Structure
```json
{
  "CategoryName": {
    "GroupName": {
      "token-name": {
        "$type": "color" | "number" | "string",
        "$value": <type-specific-value>,
        "$extensions": {
          "com.figma.variableId": "VariableID:XXXX:YYY"
        }
      }
    }
  }
}
```

### Color Value Structure
```json
{
  "colorSpace": "srgb",
  "components": [0.396, 0.494, 0.475],
  "alpha": 1,
  "hex": "#657E79"
}
```

### Mode Extension
```json
{
  "$extensions": {
    "com.figma.modeName": "Desktop"
  }
}
```

---

## AI Export Format Specifications

### LLMS.txt Structure
```
# Design System Name

## Overview
Brief description of the design system.

## Typography Roles
| Role | Font | Weight | Fallback |
...

## Colors
| Name | Value | CSS Variable |
...

## Components
### ComponentName
Description, props, variants, usage examples.
```

### Cursor Rules Structure (.mdc)
```yaml
---
description: Design system rules
globs: ["**/*.jsx", "**/*.tsx"]
alwaysApply: true
---

## Token Reference
- Primary: var(--color-primary)
...

## Component Patterns
...
```

### Claude Project Files
- `CLAUDE.md` — Project context and conventions
- `.claude/rules/tokens.md` — Token reference

### MCP Server Tools
- `get_token` — Find token by path or CSS variable
- `list_tokens` — Filter by category/theme
- `search_tokens` — Fuzzy search
- `get_component` — Full component details
- `list_components` — Filter by category
- `search_components` — Search by name/description

---

## Provenance Table

| Fact/Assumption | Value | Evidence | Confidence |
|-----------------|-------|----------|------------|
| Figma exports include `$type` | Always present | Analyzed production files | ✅ High |
| Color tokens have hex | Usually present | File analysis | ⚠️ Medium |
| First path segment = category | Reliable pattern | Consistent in files | ✅ High |
| sRGB components 0-1 range | Confirmed | Figma docs + files | ✅ High |
| Max tokens per theme | ~500 | Largest file ~400 | ⚠️ Medium |
| LLMS.txt optimal size | < 50KB | Context window research | ⚠️ Medium |
| Cursor rules size limit | < 3KB | Empirical testing | ⚠️ Medium |

---

## Validation Backlog

| Item | Current Value | Validation Method | Priority |
|------|---------------|-------------------|----------|
| Hex always in color tokens | Assumed true | Test 10+ Figma exports | High |
| Category detection accuracy | Path-prefix | Review 100 tokens | High |
| CSS variable collision rate | 0% assumed | Full theme uniqueness check | Medium |
| MCP server startup time | < 1s assumed | Benchmark | Low |
| AI generation success rate | > 80% | Track failures | High |

---

## References

1. Figma, "Variables REST API," Figma Developer Documentation
2. W3C Design Tokens Community Group, "Design Tokens Format Module"
3. Tailwind Labs, "Theme Configuration," Tailwind CSS Documentation
4. Anthropic, "Model Context Protocol Specification"
5. Cursor, "Rules Documentation"
