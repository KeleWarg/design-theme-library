# Chunk 5.17 — MCP Package Generator

## Purpose
Generate complete MCP server package from design system data.

---

## Inputs
- Themes and components data
- MCP server template

## Outputs
- Complete mcp-server/ folder

---

## Dependencies
- Chunk 5.15 must be complete
- Chunk 5.16 must be complete

---

## Implementation Notes

```javascript
// src/services/generators/mcpServerGenerator.js

// Template contents (imported from template files)
import { 
  MCP_PACKAGE_JSON,
  MCP_TSCONFIG,
  MCP_INDEX,
  MCP_SERVER,
  MCP_TYPES,
  TOKEN_TOOLS_TEMPLATE,
  COMPONENT_TOOLS_TEMPLATE
} from './mcpTemplates';

export async function generateMCPServer(themes, components, options = {}) {
  const { projectName = 'design-system' } = options;
  
  // Prepare design system data
  const designSystemData = {
    name: projectName,
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    themes: themes.map(theme => ({
      name: theme.name,
      slug: theme.slug,
      isDefault: theme.is_default,
    })),
    tokens: themes.flatMap(theme => 
      (theme.tokens || []).map(token => ({
        themeId: theme.id,
        themeName: theme.name,
        path: token.path,
        name: token.name,
        category: token.category,
        type: token.type,
        value: token.value,
        css_variable: token.css_variable,
      }))
    ),
    components: components.map(comp => ({
      name: comp.name,
      slug: comp.slug || comp.name.toLowerCase().replace(/\s+/g, '-'),
      description: comp.description,
      category: comp.category,
      props: comp.props,
      variants: comp.variants,
      code: comp.code,
      linked_tokens: comp.linked_tokens,
      examples: comp.component_examples?.map(ex => ({
        title: ex.title,
        code: ex.code,
        description: ex.description,
      })) || [],
    })),
  };

  // Generate all files
  const files = {
    'package.json': generatePackageJson(projectName),
    'tsconfig.json': MCP_TSCONFIG,
    'src/index.ts': MCP_INDEX,
    'src/server.ts': generateServerTs(projectName),
    'src/types.ts': MCP_TYPES,
    'src/tools/tokenTools.ts': TOKEN_TOOLS_TEMPLATE,
    'src/tools/componentTools.ts': COMPONENT_TOOLS_TEMPLATE,
    'design-system.json': JSON.stringify(designSystemData, null, 2),
    'README.md': generateMCPReadme(projectName),
    '.gitignore': 'node_modules/\ndist/\n',
  };

  return files;
}

function generatePackageJson(projectName) {
  return JSON.stringify({
    name: `${projectName}-mcp`,
    version: '1.0.0',
    type: 'module',
    main: 'dist/index.js',
    scripts: {
      build: 'tsc',
      start: 'node dist/index.js',
      dev: 'tsc --watch',
    },
    dependencies: {
      '@modelcontextprotocol/sdk': '^1.0.0',
    },
    devDependencies: {
      typescript: '^5.0.0',
      '@types/node': '^20.0.0',
    },
  }, null, 2);
}

function generateServerTs(projectName) {
  return `import { McpServer, StdioServerTransport } from "@modelcontextprotocol/sdk/server/index.js";
import { registerTokenTools } from './tools/tokenTools.js';
import { registerComponentTools } from './tools/componentTools.js';
import designSystem from '../design-system.json' assert { type: 'json' };
import type { DesignSystem } from './types.js';

const server = new McpServer({
  name: "${projectName}-mcp",
  version: "1.0.0",
});

// Register tools
registerTokenTools(server, designSystem as DesignSystem);
registerComponentTools(server, designSystem as DesignSystem);

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("${projectName} MCP server running");
}

main().catch(console.error);
`;
}

function generateMCPReadme(projectName) {
  return `# ${projectName} MCP Server

Model Context Protocol server for the ${projectName} design system.

## Setup

\`\`\`bash
npm install
npm run build
\`\`\`

## Usage with Claude Desktop

Add to your \`claude_desktop_config.json\`:

\`\`\`json
{
  "mcpServers": {
    "${projectName}": {
      "command": "node",
      "args": ["path/to/mcp-server/dist/index.js"]
    }
  }
}
\`\`\`

## Available Tools

### Token Tools
- \`get_token\` - Get a specific design token by path or CSS variable
- \`list_tokens\` - List all tokens with optional category/theme filter
- \`search_tokens\` - Search tokens by name, path, or CSS variable
- \`get_theme\` - Get theme info with token counts

### Component Tools
- \`get_component\` - Get full component details including code
- \`list_components\` - List all components with optional category filter
- \`search_components\` - Search components by name or description

## Example Usage

In Claude Desktop, you can ask:
- "What color tokens are available?"
- "Show me the Button component"
- "Search for tokens containing 'primary'"
- "List all form components"
`;
}
```

---

## Files Created
- `src/services/generators/mcpServerGenerator.js` — MCP package generator
- `src/services/generators/mcpTemplates.js` — Template constants

---

## Tests

### Unit Tests
- [ ] Generates all required files
- [ ] design-system.json has correct structure
- [ ] Package.json has correct dependencies
- [ ] TypeScript compiles generated code
- [ ] Server starts and responds to tools

---

## Time Estimate
2 hours
