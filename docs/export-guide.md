# Export Guide

## Overview

Export your design system in multiple formats for use in different tools and platforms.

## Export Formats

### Token Formats

#### CSS Custom Properties

Standard CSS variables for use in any project.

**When to use:**
- Web projects using vanilla CSS
- React projects with inline styles
- Any project that supports CSS variables

**Example output:**
```css
:root {
  --color-primary: #3B82F6;
  --space-md: 1rem;
  --font-size-base: 1rem;
}
```

**Usage:**
```html
<link rel="stylesheet" href="tokens.css">
```

#### JSON

Structured JSON format for programmatic access.

**When to use:**
- JavaScript/TypeScript projects
- Build tools and processors
- API responses

**Formats:**
- **Nested**: Hierarchical structure matching token paths
- **Flat**: Key-value pairs

**Example (nested):**
```json
{
  "color": {
    "primary": "#3B82F6",
    "secondary": "#10B981"
  },
  "spacing": {
    "md": "1rem"
  }
}
```

**Example (flat):**
```json
{
  "color-primary": "#3B82F6",
  "color-secondary": "#10B981",
  "spacing-md": "1rem"
}
```

#### Tailwind Config

Tailwind CSS configuration file.

**When to use:**
- Projects using Tailwind CSS
- Need Tailwind's utility classes

**Example output:**
```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
      },
      spacing: {
        md: 'var(--space-md)',
      },
    },
  },
}
```

**Usage:**
```js
// tailwind.config.js
module.exports = require('./dist/tailwind.config.js');
```

#### SCSS Variables

SCSS variables for Sass/SCSS projects.

**When to use:**
- Projects using Sass/SCSS
- Need SCSS variable syntax

**Formats:**
- **Standard**: `$variable: value;`
- **Maps**: SCSS maps for nested access

**Example (standard):**
```scss
$color-primary: #3B82F6;
$space-md: 1rem;
```

**Example (maps):**
```scss
$colors: (
  primary: #3B82F6,
  secondary: #10B981,
);
```

### AI Platform Formats

#### LLMS.txt

Comprehensive documentation format for any AI tool.

**When to use:**
- Training AI assistants
- Providing context to LLMs
- Documentation for AI tools

**Includes:**
- All tokens with descriptions
- All components with code
- Usage examples
- Best practices

**Usage:**
Upload to your AI tool or include in prompts.

#### Cursor Rules

`.cursor/rules/design-system.mdc` for Cursor IDE.

**When to use:**
- Using Cursor IDE
- Want AI to understand your design system
- Need code generation with your tokens

**Installation:**
1. Export with "Cursor" format
2. Copy `.cursor/rules/design-system.mdc` to your project
3. Cursor will automatically use it

**Location:**
```
your-project/
  .cursor/
    rules/
      design-system.mdc
```

#### Claude Files

Claude-specific documentation files.

**When to use:**
- Using Claude Desktop
- Want Claude to understand your design system
- Need Claude to generate code with your tokens

**Files:**
- `CLAUDE.md` - Project context
- `.claude/rules/tokens.md` - Token reference
- `.claude/rules/components.md` - Component reference

**Installation:**
1. Export with "Claude" format
2. Copy files to your project root
3. Claude Desktop will automatically load them

#### Project Knowledge

Condensed format for Bolt, Lovable, and similar tools.

**When to use:**
- Using AI-powered development tools
- Need compact design system reference
- Want AI to generate code with your tokens

**Format:**
Plain text with structured sections.

### MCP Server

Model Context Protocol server for AI assistants.

**When to use:**
- Using Claude Desktop with MCP
- Want AI to query your design system
- Need dynamic token/component lookup

**Setup:**

1. Export with "MCP Server" format
2. Navigate to `mcp-server` directory:
```bash
cd mcp-server
npm install
npm run build
```

3. Configure Claude Desktop:

**macOS:**
```json
// ~/Library/Application Support/Claude/claude_desktop_config.json
{
  "mcpServers": {
    "design-system": {
      "command": "node",
      "args": ["/path/to/mcp-server/dist/index.js"]
    }
  }
}
```

**Windows:**
```json
// %APPDATA%\Claude\claude_desktop_config.json
{
  "mcpServers": {
    "design-system": {
      "command": "node",
      "args": ["C:\\path\\to\\mcp-server\\dist\\index.js"]
    }
  }
}
```

4. Restart Claude Desktop

**Available Tools:**
- `get_token` - Get specific token by name
- `list_tokens` - List tokens by category
- `search_tokens` - Search tokens by name/description
- `get_component` - Get component details
- `list_components` - List components by category
- `search_components` - Search components by name

**Usage in Claude:**
```
User: What's the primary color token?
Claude: [Uses get_token tool] The primary color is #3B82F6 (--color-primary)
```

### Claude Skill

Claude Skill package for Claude Desktop.

**When to use:**
- Using Claude Desktop
- Want a dedicated skill for your design system
- Need easy installation

**Installation:**
1. Export with "Claude Skill" format
2. Follow installation instructions in the exported package
3. The skill will appear in Claude Desktop

## Full Package

Export everything in one ZIP file.

**Includes:**
- All token formats (CSS, JSON, Tailwind, SCSS)
- All AI platform formats
- MCP server (if selected)
- Component code
- Font files
- README with usage instructions

**When to use:**
- Starting a new project
- Sharing design system with team
- Archiving design system version

## Export Workflow

### Step 1: Select Themes

Choose which themes to export:
- Select one or more themes
- Default theme is pre-selected
- All tokens from selected themes are included

### Step 2: Select Components

Choose which components to export:
- Select published components only
- Draft components are excluded
- Archived components are excluded

### Step 3: Choose Formats

Select export formats:
- **Tokens**: CSS, JSON, Tailwind, SCSS
- **AI Platforms**: LLMS.txt, Cursor, Claude, Project Knowledge
- **MCP Server**: Complete MCP server package
- **Full Package**: Everything in one ZIP

### Step 4: Configure Options

- **Project Name**: Used in generated files
- **Version**: Version string for exports

### Step 5: Export

Click **Export** to generate files:
- Individual files can be copied
- Full package downloads as ZIP
- Files are generated on-demand

## Export Result Dialog

After exporting, you'll see:
- List of all generated files
- File sizes
- Copy buttons for individual files
- Download ZIP button for full package

## Best Practices

### Version Your Exports

Use version numbers in project name:
- `my-design-system-v1.0.0`
- Helps track changes over time

### Export Regularly

Export after major changes:
- Before sharing with team
- Before starting new projects
- For version control

### Use Appropriate Formats

Choose formats based on your needs:
- **Web projects**: CSS or Tailwind
- **React projects**: CSS variables
- **AI tools**: LLMS.txt or Cursor rules
- **Team sharing**: Full package

### Keep Exports Updated

Update exports when:
- Tokens change
- Components are added/updated
- New formats are needed

## Related Documentation

- [Theme Guide](./theme-guide.md) - Understanding tokens
- [Component Guide](./component-guide.md) - Understanding components





