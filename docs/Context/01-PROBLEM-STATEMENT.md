# Problem Statement

## Project Name
Design System Admin v2.0

## The Problem
> Design system teams cannot efficiently manage, distribute, and consume design tokens across multiple platforms and AI coding tools, resulting in inconsistent implementations, manual synchronization, and AI assistants that don't understand the design system.

### Pain Points
1. **Fragmented token management** — Tokens live in Figma, but developers need them in CSS/Tailwind/SCSS; manual conversion is error-prone
2. **AI coding blind spots** — AI tools (Cursor, Claude, Copilot) generate UI code without knowledge of the design system, producing inconsistent output
3. **No single source of truth** — Design tokens, component documentation, and usage examples are scattered across tools
4. **Component documentation gap** — Components exist in code but lack structured documentation for AI consumption
5. **Manual Figma sync** — Importing components from Figma requires manual copy-paste and interpretation
6. **Format proliferation** — Teams need tokens in 5+ formats; maintaining each manually is unsustainable

### Who is Affected
- **Design system maintainers** — Spend excessive time on token conversion and documentation
- **Developers using AI tools** — Get AI-generated code that ignores design system conventions
- **Frontend developers** — Need tokens in their preferred format (CSS, Tailwind, SCSS)
- **AI/ML engineers** — Need structured data to train or prompt AI assistants
- **Designers** — Want to push Figma changes to the codebase without manual steps

---

## Solution Framing

> Design System Admin v2.0 is the **command center** for design system distribution:
> - **Import** — Parse Figma Variables JSON with full provenance tracking
> - **Edit** — Visual editors for all token types with live preview
> - **Components** — Document and generate components with AI assistance
> - **Export** — Generate CSS, JSON, Tailwind, SCSS + AI platform formats (LLMS.txt, Cursor rules, Claude files, MCP server)
> - **AI Integration** — Produce structured outputs that make AI coding tools design-system-aware

---

## Core Philosophy

> **AI-first export is a first-class citizen.**
>
> Every design system should be consumable by AI coding assistants. LLMS.txt, Cursor rules, Claude project files, and MCP servers are not afterthoughts—they're primary export targets alongside CSS and JSON.

> **Figma is the source, not the prison.**
>
> Import from Figma preserves all metadata (variable IDs, collections, modes). Edit freely in the admin tool. Export back to Figma-compatible format or to any other format needed.

---

## Success Metrics

| Metric | Target | How Measured |
|--------|--------|--------------|
| Token import success | > 95% | % of valid Figma Variables JSON files parsed without errors |
| Export format accuracy | 100% | Automated tests comparing output to expected format |
| AI code compliance | > 80% | % of AI-generated components using correct design tokens |
| Time to first export | < 5 min | Time from upload to first successful export |
| Component documentation coverage | > 90% | % of components with props, variants, and examples documented |

---

## Constraints & Assumptions

### Constraints
- **Technical** — React 18 + Vite + Supabase + Tailwind stack
- **Technical** — No authentication in v2.0 (single-user/team use)
- **Technical** — Claude API for AI generation (claude-sonnet-4-20250514)
- **Resource** — Implementation via AI-assisted development (Cursor)

### Assumptions
- Users have Figma Variables JSON exports (standard format)
- Supabase provides sufficient storage for themes and components
- Users understand design token concepts
- AI coding tools can consume LLMS.txt and rule files

---

## Out of Scope (v2.0)
- Real-time Figma plugin sync (bidirectional)
- Multi-user authentication and permissions
- Design token versioning with branching
- Token aliasing UI (visual reference editing)
- Theme inheritance (child themes)
- Component visual regression testing
- Hosted MCP server (export only, user hosts)
