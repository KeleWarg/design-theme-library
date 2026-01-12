# Chunk 6.07 — Documentation

## Purpose
Create user documentation and README files.

---

## Inputs
- Application features

## Outputs
- README.md
- docs/ folder with guides

---

## Dependencies
- All features complete

---

## Implementation Notes

### Main README

```markdown
<!-- README.md -->
# Design System Admin

A comprehensive tool for creating, managing, and exporting design system tokens and components.

## Features

- **Theme Management**: Create, import, and edit design tokens
- **Component Library**: Build and document React components
- **AI Generation**: Generate components from descriptions using Claude
- **Figma Import**: Import components directly from Figma
- **Multi-format Export**: CSS, JSON, Tailwind, SCSS, and more
- **AI Platform Integration**: Export LLMS.txt, Cursor rules, Claude files
- **MCP Server**: Model Context Protocol server for AI assistants

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account (or local instance)
- Claude API key (for AI features)

### Installation

```bash
git clone https://github.com/your-org/design-system-admin.git
cd design-system-admin
npm install
cp .env.example .env.local
# Edit .env.local with your credentials
npm run dev
```

### Environment Variables

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_CLAUDE_API_KEY=your-claude-api-key
```

## Usage

### Creating a Theme

1. Navigate to **Themes** page
2. Click **Create Theme**
3. Choose **Start from Scratch** or **Import from JSON**
4. Add tokens using the category editors
5. Preview changes in the typography/color previews

### Importing Tokens from Figma

1. Export your Figma Variables to JSON
2. Click **Create Theme** > **Import from JSON**
3. Upload your JSON file
4. Map collections and modes
5. Review and confirm import

### Managing Components

1. Navigate to **Components** page
2. Click **Add Component**
3. Choose:
   - **Create Manually**: Step-by-step wizard
   - **Generate with AI**: Describe your component
   - **Import from Figma**: Use the Figma plugin
4. Edit code, add examples, link tokens
5. Publish when ready

### Exporting

1. Click **Export** in the header
2. Select themes and components
3. Choose format:
   - **Tokens**: CSS, JSON, Tailwind, SCSS
   - **AI Platforms**: LLMS.txt, Cursor, Claude
   - **MCP Server**: Model Context Protocol server
   - **Full Package**: Everything in one ZIP
4. Download or copy individual files

## Architecture

```
src/
├── components/          # React components
│   ├── themes/         # Theme editor components
│   ├── components/     # Component library UI
│   ├── export/         # Export modal and results
│   └── ui/             # Shared UI components
├── contexts/           # React contexts
├── hooks/              # Custom hooks
├── lib/                # Utilities
├── pages/              # Page components
├── services/           # API and business logic
│   └── generators/     # Export format generators
└── templates/          # Export templates (MCP, etc.)
```

## Development

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run test         # Run unit tests
npm run test:e2e     # Run E2E tests
npm run lint         # Run ESLint
npm run typecheck    # TypeScript check
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests (requires running app)
npm run test:e2e

# Integration tests
npm run test:integration
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

MIT
```

### Theme Guide

```markdown
<!-- docs/theme-guide.md -->
# Theme Guide

## Overview

Themes contain design tokens organized by category. Each theme can have multiple tokens that define your visual language.

## Token Categories

### Colors
Define your color palette including:
- Primary, secondary, accent colors
- Background and foreground
- Semantic colors (success, error, warning, info)
- Neutral/gray scale

### Typography
Font-related tokens:
- Font sizes (xs through 6xl)
- Font weights (thin through black)
- Line heights
- Letter spacing
- Font families (via typeface roles)

### Spacing
Consistent spacing scale:
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px
- etc.

### Shadows
Elevation and depth:
- sm: Subtle shadow for cards
- md: Medium elevation
- lg: Popovers and dropdowns
- xl: Modals and dialogs

### Radius
Border radius values:
- none: 0
- sm: 4px
- md: 8px
- lg: 12px
- xl: 16px
- full: 9999px (pill shape)

### Grid
Layout tokens:
- Breakpoints (sm, md, lg, xl, 2xl)
- Container max-widths
- Column counts
- Gutters

## Typography Roles

Each theme can define typeface roles:
- **Primary**: Main body text
- **Heading**: Headlines and titles
- **Mono**: Code and technical content

Fonts can be:
- **Google Fonts**: Loaded from Google
- **Custom**: Uploaded font files

## Best Practices

1. **Use semantic names**: `color-primary` not `color-blue`
2. **Maintain consistency**: Use the spacing scale
3. **Document tokens**: Add descriptions for clarity
4. **Test in context**: Use the preview panel
5. **Consider dark mode**: Plan token names for theming
```

### Component Guide

```markdown
<!-- docs/component-guide.md -->
# Component Guide

## Creating Components

### Manual Creation

1. **Basic Info**: Name, category, description
2. **Props**: Define component props with types
3. **Variants**: Create named variations
4. **Token Linking**: Connect to design tokens
5. **Code**: Write or paste component code

### AI Generation

Describe your component in natural language:
- "A button with primary and secondary variants"
- "A card component with image, title, and description"
- "An input field with label, error state, and helper text"

The AI will generate code using your design tokens.

### From Figma

1. Install the Figma plugin
2. Select components in Figma
3. Click Export to Admin Tool
4. Review and import

## Component Structure

```jsx
// Recommended structure
export default function Button({ 
  variant = 'primary',
  size = 'md',
  children,
  ...props 
}) {
  return (
    <button 
      className={cn('button', `button-${variant}`, `button-${size}`)}
      style={{
        backgroundColor: 'var(--color-primary)',
        padding: 'var(--space-sm) var(--space-md)',
        borderRadius: 'var(--radius-md)',
      }}
      {...props}
    >
      {children}
    </button>
  );
}
```

## Props Best Practices

- Use TypeScript types or PropTypes
- Provide sensible defaults
- Document each prop
- Use enums for variants

## Examples

Add usage examples to help users:

```jsx
// Basic usage
<Button>Click me</Button>

// With variant
<Button variant="secondary">Cancel</Button>

// With loading state
<Button loading>Saving...</Button>
```
```

### Export Guide

```markdown
<!-- docs/export-guide.md -->
# Export Guide

## Token Formats

### CSS Custom Properties
```css
:root {
  --color-primary: #3B82F6;
  --space-md: 16px;
}
```

### JSON
```json
{
  "color": {
    "primary": "#3B82F6"
  }
}
```

### Tailwind Config
```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)'
      }
    }
  }
}
```

### SCSS Variables
```scss
$color-primary: #3B82F6;
$space-md: 16px;
```

## AI Platform Exports

### LLMS.txt
Comprehensive documentation for any AI tool.

### Cursor Rules
`.cursor/rules/design-system.mdc` for Cursor IDE.

### Claude Files
- `CLAUDE.md` - Project context
- `.claude/rules/tokens.md` - Token reference

### Project Knowledge
Condensed format for Bolt, Lovable, etc.

## MCP Server

The MCP server provides tools for AI assistants:

### Setup
```bash
cd mcp-server
npm install
npm run build
```

### Claude Desktop Config
```json
{
  "mcpServers": {
    "design-system": {
      "command": "node",
      "args": ["path/to/mcp-server/dist/index.js"]
    }
  }
}
```

### Available Tools
- `get_token` - Get specific token
- `list_tokens` - List by category
- `search_tokens` - Search tokens
- `get_component` - Get component details
- `list_components` - List components
```

---

## Files Created
- `README.md` — Main README
- `docs/theme-guide.md` — Theme documentation
- `docs/component-guide.md` — Component documentation
- `docs/export-guide.md` — Export documentation
- `docs/figma-plugin.md` — Plugin documentation (stub)
- `CONTRIBUTING.md` — Contribution guidelines
- `.env.example` — Example environment file

---

## Tests

### Verification
- [ ] README has all sections
- [ ] Setup instructions work
- [ ] Links are valid
- [ ] Code examples are correct
- [ ] Environment variables documented

---

## Time Estimate
3 hours
