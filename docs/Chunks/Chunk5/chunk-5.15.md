# Chunk 5.15 — MCP Token Tools

## Purpose
Implement MCP tools for token queries.

---

## Inputs
- MCP server scaffold

## Outputs
- 4 token-related tools

---

## Dependencies
- Chunk 5.14 must be complete

---

## Implementation Notes

```typescript
// templates/mcp-server/src/tools/tokenTools.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/index.js";
import type { DesignSystem, Token } from '../types.js';

export function registerTokenTools(server: McpServer, designSystem: DesignSystem) {
  
  // get_token - Get a specific token by path
  server.tool(
    "get_token",
    "Get a specific design token by its path or CSS variable name",
    {
      path: {
        type: "string",
        description: "Token path (e.g., 'color/primary') or CSS variable (e.g., '--color-primary')",
        required: true
      }
    },
    async ({ path }) => {
      const token = findTokenByPath(designSystem.tokens, path as string);
      if (!token) {
        return { error: `Token not found: ${path}` };
      }
      return {
        path: token.path,
        name: token.name,
        value: token.value,
        cssVariable: token.css_variable,
        category: token.category,
        type: token.type,
        theme: token.themeName
      };
    }
  );

  // list_tokens - List tokens by category
  server.tool(
    "list_tokens",
    "List all design tokens, optionally filtered by category",
    {
      category: {
        type: "string",
        description: "Filter by category: color, typography, spacing, shadow, radius, grid",
        required: false
      },
      theme: {
        type: "string",
        description: "Filter by theme name",
        required: false
      }
    },
    async ({ category, theme }) => {
      let tokens = designSystem.tokens;
      
      if (category) {
        tokens = tokens.filter(t => t.category === category);
      }
      if (theme) {
        tokens = tokens.filter(t => 
          t.themeName.toLowerCase() === (theme as string).toLowerCase()
        );
      }
      
      return {
        count: tokens.length,
        tokens: tokens.map(t => ({
          path: t.path,
          name: t.name,
          cssVariable: t.css_variable,
          category: t.category,
          value: formatValueForDisplay(t.value)
        }))
      };
    }
  );

  // search_tokens - Search tokens by name or path
  server.tool(
    "search_tokens",
    "Search design tokens by name, path, or CSS variable",
    {
      query: {
        type: "string",
        description: "Search query",
        required: true
      }
    },
    async ({ query }) => {
      const q = (query as string).toLowerCase();
      const matches = designSystem.tokens.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.path.toLowerCase().includes(q) ||
        t.css_variable.toLowerCase().includes(q)
      );
      
      return {
        query,
        count: matches.length,
        tokens: matches.slice(0, 20).map(t => ({
          path: t.path,
          name: t.name,
          cssVariable: t.css_variable,
          category: t.category
        }))
      };
    }
  );

  // get_theme - Get full theme data
  server.tool(
    "get_theme",
    "Get a theme by name with summary of its tokens",
    {
      name: {
        type: "string",
        description: "Theme name",
        required: true
      }
    },
    async ({ name }) => {
      const theme = designSystem.themes.find(t => 
        t.name.toLowerCase() === (name as string).toLowerCase()
      );
      
      if (!theme) {
        return { error: `Theme not found: ${name}` };
      }
      
      const themeTokens = designSystem.tokens.filter(t => 
        t.themeName.toLowerCase() === theme.name.toLowerCase()
      );
      
      const categoryCounts: Record<string, number> = {};
      for (const token of themeTokens) {
        categoryCounts[token.category] = (categoryCounts[token.category] || 0) + 1;
      }
      
      return {
        name: theme.name,
        slug: theme.slug,
        isDefault: theme.isDefault,
        tokenCount: themeTokens.length,
        categories: categoryCounts
      };
    }
  );
}

function findTokenByPath(tokens: Token[], path: string): Token | undefined {
  // Try exact path match
  let token = tokens.find(t => t.path === path);
  if (token) return token;
  
  // Try CSS variable match
  token = tokens.find(t => t.css_variable === path);
  if (token) return token;
  
  // Try without -- prefix
  if (path.startsWith('--')) {
    token = tokens.find(t => t.css_variable === path);
  } else {
    token = tokens.find(t => t.css_variable === `--${path.replace(/\//g, '-')}`);
  }
  
  return token;
}

function formatValueForDisplay(value: any): string {
  if (typeof value === 'object' && value !== null) {
    if (value.hex) return value.hex;
    if (value.value !== undefined && value.unit) {
      return `${value.value}${value.unit}`;
    }
    return JSON.stringify(value);
  }
  return String(value);
}
```

---

## Files Created
- `src/templates/mcp-server/src/tools/tokenTools.ts` — Token tools

---

## Tests

### Unit Tests
- [ ] get_token finds by path
- [ ] get_token finds by CSS variable
- [ ] list_tokens filters by category
- [ ] list_tokens filters by theme
- [ ] search_tokens finds matches
- [ ] get_theme returns theme with counts

---

## Time Estimate
2.5 hours
