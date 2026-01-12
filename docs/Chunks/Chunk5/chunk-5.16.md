# Chunk 5.16 — MCP Component Tools

## Purpose
Implement MCP tools for component queries.

---

## Inputs
- MCP server scaffold

## Outputs
- 2 component-related tools

---

## Dependencies
- Chunk 5.14 must be complete

---

## Implementation Notes

```typescript
// templates/mcp-server/src/tools/componentTools.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/index.js";
import type { DesignSystem, Component } from '../types.js';

export function registerComponentTools(server: McpServer, designSystem: DesignSystem) {
  
  // get_component - Get full component details
  server.tool(
    "get_component",
    "Get a component by name with props, variants, code, and examples",
    {
      name: {
        type: "string",
        description: "Component name or slug",
        required: true
      },
      includeCode: {
        type: "boolean",
        description: "Include component source code (default: true)",
        required: false
      }
    },
    async ({ name, includeCode = true }) => {
      const component = designSystem.components.find(c =>
        c.name.toLowerCase() === (name as string).toLowerCase() ||
        c.slug === (name as string).toLowerCase()
      );
      
      if (!component) {
        return { error: `Component not found: ${name}` };
      }
      
      const result: any = {
        name: component.name,
        slug: component.slug,
        description: component.description,
        category: component.category,
        props: component.props?.map(p => ({
          name: p.name,
          type: p.type,
          required: p.required,
          default: p.default,
          description: p.description
        })),
        variants: component.variants?.map(v => ({
          name: v.name,
          description: v.description,
          props: v.props
        })),
        linkedTokens: component.linked_tokens,
        examples: component.examples?.map(ex => ({
          title: ex.title,
          description: ex.description,
          code: ex.code
        }))
      };
      
      if (includeCode !== false) {
        result.code = component.code;
      }
      
      return result;
    }
  );

  // list_components - List available components
  server.tool(
    "list_components",
    "List all available components with optional category filter",
    {
      category: {
        type: "string",
        description: "Filter by category: buttons, forms, layout, navigation, feedback, data-display, overlay",
        required: false
      }
    },
    async ({ category }) => {
      let components = designSystem.components;
      
      if (category) {
        components = components.filter(c => 
          c.category === category || 
          c.category.toLowerCase() === (category as string).toLowerCase()
        );
      }
      
      // Get unique categories for reference
      const categories = [...new Set(designSystem.components.map(c => c.category))];
      
      return {
        count: components.length,
        availableCategories: categories,
        components: components.map(c => ({
          name: c.name,
          slug: c.slug,
          description: c.description?.substring(0, 100),
          category: c.category,
          propCount: c.props?.length || 0,
          variantCount: c.variants?.length || 0,
          hasExamples: (c.examples?.length || 0) > 0
        }))
      };
    }
  );

  // search_components - Search components
  server.tool(
    "search_components",
    "Search components by name or description",
    {
      query: {
        type: "string",
        description: "Search query",
        required: true
      }
    },
    async ({ query }) => {
      const q = (query as string).toLowerCase();
      const matches = designSystem.components.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      );
      
      return {
        query,
        count: matches.length,
        components: matches.map(c => ({
          name: c.name,
          description: c.description?.substring(0, 100),
          category: c.category
        }))
      };
    }
  );
}
```

---

## Files Created
- `src/templates/mcp-server/src/tools/componentTools.ts` — Component tools

---

## Tests

### Unit Tests
- [ ] get_component returns full details
- [ ] get_component respects includeCode flag
- [ ] list_components returns all
- [ ] list_components filters by category
- [ ] search_components finds matches

---

## Time Estimate
2 hours
