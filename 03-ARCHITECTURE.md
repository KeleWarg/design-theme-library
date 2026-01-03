# Architecture Document

## System Overview

Design System Admin v2.0 is a comprehensive tool for managing design tokens and components, with first-class support for AI platform exports. It transforms Figma Variables into editable database records, provides visual editors, enables AI-assisted component generation, and exports to multiple formats including AI-specific outputs.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DESIGN SYSTEM ADMIN                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐  │
│  │   THEMES    │  │ COMPONENTS  │  │   FIGMA     │  │  EXPORT   │  │
│  │   SYSTEM    │  │   SYSTEM    │  │   IMPORT    │  │  SYSTEM   │  │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └─────┬─────┘  │
│         │                │                │               │         │
│         └────────────────┴────────────────┴───────────────┘         │
│                                   │                                  │
│                          ┌───────┴───────┐                          │
│                          │   SERVICES    │                          │
│                          └───────┬───────┘                          │
│                                  │                                  │
│                          ┌───────┴───────┐                          │
│                          │   SUPABASE    │                          │
│                          │   Database    │                          │
│                          └───────────────┘                          │
└─────────────────────────────────────────────────────────────────────┘

EXPORTS TO:
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│   CSS    │ │   JSON   │ │ Tailwind │ │   SCSS   │ │  Fonts   │
└──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ LLMS.txt │ │  Cursor  │ │  Claude  │ │   MCP    │ │  Skill   │
│          │ │  Rules   │ │   MD     │ │  Server  │ │ Package  │
└──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘
```

---

## Phase Breakdown

```
Phase 0: VALIDATION (optional)
  └── Figma plugin PoC, AI generation testing

Phase 1: FOUNDATION
  └── Database schema, services, token parser, app shell

Phase 2: THEME SYSTEM ⭐ CORE
  └── Theme CRUD, import wizard, token editors, typography, preview

Phase 3: COMPONENT SYSTEM
  └── Component CRUD, AI generation, detail page with tabs

Phase 4: FIGMA IMPORT
  └── Enhanced plugin, import review, AI with Figma context

Phase 5: EXPORT SYSTEM
  └── Token formats, AI platform exports, MCP server, package builder

Phase 6: TESTING & POLISH
  └── E2E tests, integration tests, error/empty states, documentation
```

---

## Data Flow

### Token Import Flow
```
[Figma Variables JSON]
        ↓
[Token Parser] → validates, extracts, detects categories
        ↓
[Import Wizard] → user reviews, enters theme details
        ↓
[Theme Service] → creates theme + bulk inserts tokens
        ↓
[Supabase Database]
```

### Token Edit Flow
```
[Theme Editor] ← loads theme + grouped tokens
        ↓
[Token Editors] → type-specific editing
        ↓
[Live Preview] ← CSS variables update
        ↓
[Save] → tokenService.updateToken()
```

### Export Flow
```
[Export Modal] → select themes, components, formats
        ↓
[Package Builder] → calls appropriate generators
        ↓
[Generators] → CSS, JSON, Tailwind, LLMS.txt, etc.
        ↓
[ZIP Creator] → bundles all files
        ↓
[Download]
```

### AI Generation Flow
```
[Component Description]
        ↓
[Prompt Builder] → injects token context
        ↓
[Claude API] → generates component code
        ↓
[Preview] → user reviews
        ↓
[Accept] → componentService.createComponent()
```

---

## Database Schema

### Tables

```
themes
├── id: UUID (PK)
├── name: VARCHAR(100)
├── slug: VARCHAR(100) UNIQUE
├── description: TEXT
├── source: ENUM('manual', 'import', 'figma')
├── figma_file_key: VARCHAR
├── is_default: BOOLEAN
├── created_at: TIMESTAMP
└── updated_at: TIMESTAMP

tokens
├── id: UUID (PK)
├── theme_id: UUID (FK → themes)
├── name: VARCHAR(100)
├── path: VARCHAR(255)
├── category: ENUM('color', 'typography', 'spacing', 'shadow', 'radius', 'grid', 'other')
├── type: VARCHAR(50)
├── value: JSONB
├── css_variable: VARCHAR(100)
├── description: TEXT
├── metadata: JSONB
├── sort_order: INTEGER
├── created_at: TIMESTAMP
└── updated_at: TIMESTAMP

typefaces
├── id: UUID (PK)
├── theme_id: UUID (FK → themes)
├── name: VARCHAR(100)
├── type: ENUM('google', 'custom')
├── google_font_name: VARCHAR
├── google_font_weights: INTEGER[]
└── created_at: TIMESTAMP

font_files
├── id: UUID (PK)
├── typeface_id: UUID (FK → typefaces)
├── file_name: VARCHAR
├── file_path: VARCHAR
├── weight: INTEGER
├── style: ENUM('normal', 'italic')
├── format: ENUM('woff2', 'woff', 'ttf', 'otf')
└── created_at: TIMESTAMP

typography_roles
├── id: UUID (PK)
├── theme_id: UUID (FK → themes)
├── role: ENUM('primary', 'heading', 'mono')
├── typeface_id: UUID (FK → typefaces)
├── weight: INTEGER
├── fallback_stack: VARCHAR
└── created_at: TIMESTAMP

components
├── id: UUID (PK)
├── name: VARCHAR(100)
├── slug: VARCHAR(100) UNIQUE
├── description: TEXT
├── category: VARCHAR(50)
├── code: TEXT
├── props: JSONB
├── variants: JSONB
├── linked_tokens: VARCHAR[]
├── status: ENUM('draft', 'published', 'archived')
├── figma_node_id: VARCHAR
├── figma_file_key: VARCHAR
├── created_at: TIMESTAMP
└── updated_at: TIMESTAMP

component_images
├── id: UUID (PK)
├── component_id: UUID (FK → components)
├── variant_name: VARCHAR
├── image_path: VARCHAR
├── width: INTEGER
├── height: INTEGER
└── created_at: TIMESTAMP

component_examples
├── id: UUID (PK)
├── component_id: UUID (FK → components)
├── title: VARCHAR(100)
├── code: TEXT
├── description: TEXT
├── sort_order: INTEGER
└── created_at: TIMESTAMP
```

### Relationships
```
themes (1) ──→ (N) tokens
themes (1) ──→ (N) typefaces
themes (1) ──→ (N) typography_roles
typefaces (1) ──→ (N) font_files
components (1) ──→ (N) component_images
components (1) ──→ (N) component_examples
```

---

## Key Types

```typescript
// Theme types
interface Theme {
  id: string;
  name: string;
  slug: string;
  description?: string;
  source: 'manual' | 'import' | 'figma';
  is_default: boolean;
}

// Token types
interface Token {
  id: string;
  theme_id: string;
  name: string;
  path: string;
  category: TokenCategory;
  type: string;
  value: TokenValue;
  css_variable: string;
}

type TokenCategory = 'color' | 'typography' | 'spacing' | 'shadow' | 'radius' | 'grid' | 'other';

// Component types
interface Component {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category: string;
  code: string;
  props: ComponentProp[];
  variants: ComponentVariant[];
  linked_tokens: string[];
  status: 'draft' | 'published' | 'archived';
}

// Export types
interface ExportOptions {
  themes: string[];
  components: string[];
  formats: ExportFormat[];
}

type ExportFormat = 
  | 'css' | 'json' | 'tailwind' | 'scss'
  | 'llms-txt' | 'cursor-rules' | 'claude-md' | 'project-knowledge'
  | 'mcp-server' | 'claude-skill' | 'full-package';
```

---

## Service Layer

| Service | Responsibilities |
|---------|------------------|
| themeService | Theme CRUD, duplicate, set default |
| tokenService | Token CRUD, bulk operations, search |
| typefaceService | Typeface CRUD, font file management |
| componentService | Component CRUD, examples, images |
| aiService | Claude API calls, prompt building |
| exportService | Package building, format orchestration |

### Generators (in exportService)
| Generator | Output |
|-----------|--------|
| cssGenerator | CSS custom properties |
| jsonGenerator | Nested/flat/Style Dictionary JSON |
| tailwindGenerator | tailwind.config.js extend object |
| scssGenerator | SCSS variables or maps |
| fontFaceGenerator | @font-face CSS rules |
| llmsTxtGenerator | LLMS.txt documentation |
| cursorRulesGenerator | .cursor/rules/*.mdc |
| claudeMdGenerator | CLAUDE.md + .claude/rules/ |
| projectKnowledgeGenerator | Condensed AI context |
| mcpPackageGenerator | Full MCP server package |
| claudeSkillGenerator | Claude skill package |

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite 5 |
| Styling | Tailwind CSS 3 |
| Database | Supabase (PostgreSQL) |
| AI | Claude API (claude-sonnet-4-20250514) |
| Code Editor | Monaco Editor |
| Icons | Lucide React |
| Testing | Vitest + Playwright |
| Build | Vite |

---

## File Structure

```
src/
├── components/
│   ├── layout/         # Layout, Header, Sidebar
│   ├── themes/         # ThemeCard, ThemeSelector, CreateThemeModal
│   ├── editor/         # TokenList, CategorySidebar, *Editor components
│   ├── import/         # ImportWizard, UploadStep, MappingStep, ReviewStep
│   ├── components/     # ComponentCard, wizard steps, detail tabs
│   ├── figma/          # FigmaStructureView, ImportReviewCard
│   ├── export/         # ExportModal, FormatTabs, selectors
│   ├── preview/        # ThemePreview, TypographyPreview
│   └── ui/             # Button, Input, Modal, EmptyState, Skeleton
├── contexts/
│   └── ThemeContext.jsx
├── hooks/
│   ├── useCSSVariables.js
│   └── useFontLoader.js
├── lib/
│   ├── supabase.js
│   ├── storage.js
│   └── tokenParser.js
├── pages/
│   ├── Dashboard.jsx
│   ├── ThemesPage.jsx
│   ├── ThemeEditorPage.jsx
│   ├── ComponentsPage.jsx
│   ├── ComponentDetailPage.jsx
│   └── FigmaImportPage.jsx
├── services/
│   ├── themeService.js
│   ├── tokenService.js
│   ├── typefaceService.js
│   ├── componentService.js
│   ├── aiService.js
│   ├── exportService.js
│   └── generators/
│       ├── cssGenerator.js
│       ├── jsonGenerator.js
│       └── ... (all generators)
└── templates/
    └── mcp-server/     # MCP server template files
```
