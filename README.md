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

Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_CLAUDE_API_KEY=your-claude-api-key
```

**Required for:**
- Phases 1-2: Supabase only
- Phases 3+: Claude API key needed for AI generation

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
npm run seed         # Seed database with sample data
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests (requires running app)
npm run test:e2e

# Gate checkpoint tests
npm run test:gates
```

## Documentation

- [Theme Guide](./docs/theme-guide.md) - Token categories and best practices
- [Component Guide](./docs/component-guide.md) - Creating and managing components
- [Export Guide](./docs/export-guide.md) - Export formats and usage
- [Figma Plugin Guide](./docs/figma-plugin.md) - Plugin installation and usage

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

MIT
