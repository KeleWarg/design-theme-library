# Chunk 5.14 — MCP Server Scaffold

## Purpose
Create base MCP server TypeScript structure.

---

## Inputs
- MCP SDK knowledge

## Outputs
- MCP server scaffold files

---

## Dependencies
- None

---

## Implementation Notes

### Server Entry Point
```typescript
// templates/mcp-server/src/index.ts
export * from './server.js';
```

```typescript
// templates/mcp-server/src/server.ts
import { McpServer, StdioServerTransport } from "@modelcontextprotocol/sdk/server/index.js";
import { registerTokenTools } from './tools/tokenTools.js';
import { registerComponentTools } from './tools/componentTools.js';
import designSystem from '../design-system.json' assert { type: 'json' };

const server = new McpServer({
  name: "design-system-mcp",
  version: "1.0.0",
});

// Register tools
registerTokenTools(server, designSystem);
registerComponentTools(server, designSystem);

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Design System MCP server running");
}

main().catch(console.error);
```

### Package Configuration
```json
// templates/mcp-server/package.json
{
  "name": "design-system-mcp",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0"
  }
}
```

### TypeScript Configuration
```json
// templates/mcp-server/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "declaration": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Design System Types
```typescript
// templates/mcp-server/src/types.ts
export interface DesignSystem {
  name: string;
  version: string;
  generatedAt: string;
  themes: Theme[];
  tokens: Token[];
  components: Component[];
}

export interface Theme {
  name: string;
  slug: string;
  isDefault: boolean;
}

export interface Token {
  themeId: string;
  themeName: string;
  path: string;
  name: string;
  category: string;
  type: string;
  value: any;
  css_variable: string;
}

export interface Component {
  name: string;
  slug: string;
  description: string;
  category: string;
  props: Prop[];
  variants: Variant[];
  code: string;
  linked_tokens: string[];
  examples: Example[];
}

export interface Prop {
  name: string;
  type: string;
  default?: any;
  required: boolean;
  description: string;
}

export interface Variant {
  name: string;
  props: Record<string, any>;
  description: string;
}

export interface Example {
  title: string;
  code: string;
  description: string;
}
```

---

## Files Created
- `src/templates/mcp-server/package.json`
- `src/templates/mcp-server/tsconfig.json`
- `src/templates/mcp-server/src/index.ts`
- `src/templates/mcp-server/src/server.ts`
- `src/templates/mcp-server/src/types.ts`

---

## Tests

### Unit Tests
- [ ] Template files valid JSON/TS
- [ ] TypeScript compiles
- [ ] Server starts without data

---

## Time Estimate
2 hours
