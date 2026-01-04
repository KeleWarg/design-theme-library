/**
 * @chunk 5.16 - MCP Component Tools
 * 
 * Component query tools for MCP server.
 * Provides get_component, list_components, get_component_code, get_component_props, and search_components tools.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/index.js";
import type { DesignSystem, Component, Token } from '../types.js';

export function registerComponentTools(server: McpServer, designSystem: DesignSystem) {
  
  // Handle tool calls
  // Note: This handler also handles token tools to ensure all tools work
  // when componentTools is registered after tokenTools
  server.setRequestHandler('tools/call', async (request) => {
    
    // Token tools (delegated from tokenTools to ensure compatibility)
    if (request.params.name === 'get_token') {
      const args = request.params.arguments as { name?: string; path?: string };
      const identifier = args.name || args.path;
      
      if (!identifier) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ error: 'Token name or path is required' })
          }],
          isError: true
        };
      }
      
      const token = findTokenByPath(designSystem.tokens, identifier);
      if (!token) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ error: `Token not found: ${identifier}` })
          }],
          isError: true
        };
      }
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            path: token.path,
            name: token.name,
            value: token.value,
            cssVariable: token.css_variable,
            category: token.category,
            type: token.type,
            theme: token.themeName
          })
        }]
      };
    }
    
    if (request.params.name === 'list_tokens') {
      const args = request.params.arguments as { category?: string; theme?: string };
      let tokens = designSystem.tokens;
      
      if (args.category) {
        tokens = tokens.filter(t => t.category === args.category);
      }
      if (args.theme) {
        tokens = tokens.filter(t => 
          t.themeName.toLowerCase() === args.theme!.toLowerCase()
        );
      }
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            count: tokens.length,
            tokens: tokens.map(t => ({
              path: t.path,
              name: t.name,
              cssVariable: t.css_variable,
              category: t.category,
              value: formatValueForDisplay(t.value)
            }))
          })
        }]
      };
    }
    
    if (request.params.name === 'search_tokens') {
      const args = request.params.arguments as { query?: string; pattern?: string };
      const query = args.query || args.pattern;
      
      if (!query) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ error: 'Search query is required' })
          }],
          isError: true
        };
      }
      
      const q = query.toLowerCase();
      const matches = designSystem.tokens.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.path.toLowerCase().includes(q) ||
        t.css_variable.toLowerCase().includes(q)
      );
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            query,
            count: matches.length,
            tokens: matches.slice(0, 20).map(t => ({
              path: t.path,
              name: t.name,
              cssVariable: t.css_variable,
              category: t.category
            }))
          })
        }]
      };
    }
    
    if (request.params.name === 'get_theme') {
      const args = request.params.arguments as { name: string };
      
      if (!args.name) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ error: 'Theme name is required' })
          }],
          isError: true
        };
      }
      
      const theme = designSystem.themes.find(t => 
        t.name.toLowerCase() === args.name.toLowerCase()
      );
      
      if (!theme) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ error: `Theme not found: ${args.name}` })
          }],
          isError: true
        };
      }
      
      const themeTokens = designSystem.tokens.filter(t => 
        t.themeName.toLowerCase() === theme.name.toLowerCase()
      );
      
      const categoryCounts: Record<string, number> = {};
      for (const token of themeTokens) {
        categoryCounts[token.category] = (categoryCounts[token.category] || 0) + 1;
      }
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            name: theme.name,
            slug: theme.slug,
            isDefault: theme.isDefault,
            tokenCount: themeTokens.length,
            categories: categoryCounts
          })
        }]
      };
    }
    
    // Component tools
    // get_component - Get a component by name or slug
    if (request.params.name === 'get_component') {
      const args = request.params.arguments as { name: string; includeCode?: boolean };
      
      if (!args.name) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ error: 'Component name is required' })
          }],
          isError: true
        };
      }
      
      const component = findComponentByName(designSystem.components, args.name);
      
      if (!component) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ error: `Component not found: ${args.name}` })
          }],
          isError: true
        };
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
      
      if (args.includeCode !== false) {
        result.code = component.code;
      }
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result)
        }]
      };
    }
    
    // list_components - List all components with optional category filter
    if (request.params.name === 'list_components') {
      const args = request.params.arguments as { category?: string };
      let components = designSystem.components;
      
      if (args.category) {
        components = components.filter(c => 
          c.category === args.category || 
          c.category.toLowerCase() === args.category.toLowerCase()
        );
      }
      
      // Get unique categories for reference
      const categories = [...new Set(designSystem.components.map(c => c.category))];
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
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
          })
        }]
      };
    }
    
    // get_component_code - Get component source code
    if (request.params.name === 'get_component_code') {
      const args = request.params.arguments as { name: string };
      
      if (!args.name) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ error: 'Component name is required' })
          }],
          isError: true
        };
      }
      
      const component = findComponentByName(designSystem.components, args.name);
      
      if (!component) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ error: `Component not found: ${args.name}` })
          }],
          isError: true
        };
      }
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            name: component.name,
            slug: component.slug,
            code: component.code || ''
          })
        }]
      };
    }
    
    // get_component_props - Get component prop definitions
    if (request.params.name === 'get_component_props') {
      const args = request.params.arguments as { name: string };
      
      if (!args.name) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ error: 'Component name is required' })
          }],
          isError: true
        };
      }
      
      const component = findComponentByName(designSystem.components, args.name);
      
      if (!component) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ error: `Component not found: ${args.name}` })
          }],
          isError: true
        };
      }
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            name: component.name,
            slug: component.slug,
            props: component.props?.map(p => ({
              name: p.name,
              type: p.type,
              required: p.required,
              default: p.default,
              description: p.description
            })) || []
          })
        }]
      };
    }
    
    // search_components - Search components by name or description
    if (request.params.name === 'search_components') {
      const args = request.params.arguments as { query: string };
      
      if (!args.query) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ error: 'Search query is required' })
          }],
          isError: true
        };
      }
      
      const q = args.query.toLowerCase();
      const matches = designSystem.components.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      );
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            query: args.query,
            count: matches.length,
            components: matches.map(c => ({
              name: c.name,
              slug: c.slug,
              description: c.description?.substring(0, 100),
              category: c.category
            }))
          })
        }]
      };
    }
    
    return null;
  });
  
  // Register tool definitions
  // Note: This will merge with token tools. Both token and component tools are included.
  server.setRequestHandler('tools/list', async (request) => {
    // Component tools
    const componentTools = [
      {
        name: 'get_component',
        description: 'Get a component definition with props, variants, code, and examples',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Component name or slug'
            },
            includeCode: {
              type: 'boolean',
              description: 'Include component source code (default: true)'
            }
          },
          required: ['name']
        }
      },
      {
        name: 'list_components',
        description: 'List all available components with optional category filter',
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description: 'Filter by category: buttons, forms, layout, navigation, feedback, data-display, overlay'
            }
          }
        }
      },
      {
        name: 'get_component_code',
        description: 'Get the source code for a component',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Component name or slug'
            }
          },
          required: ['name']
        }
      },
      {
        name: 'get_component_props',
        description: 'Get component prop definitions',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Component name or slug'
            }
          },
          required: ['name']
        }
      },
      {
        name: 'search_components',
        description: 'Search components by name or description',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query'
            }
          },
          required: ['query']
        }
      }
    ];
    
    // Token tools (included to ensure all tools are available)
    // Note: Token tools are also registered separately, but we include them here
    // to ensure tools/list returns all available tools
    const tokenTools = [
      {
        name: 'get_token',
        description: 'Get a design token by name or path',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Token name or path (e.g., "color/primary" or "--color-primary")'
            },
            path: {
              type: 'string',
              description: 'Token path (alternative to name)'
            }
          },
          required: []
        }
      },
      {
        name: 'list_tokens',
        description: 'List all design tokens, optionally filtered by category or theme',
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description: 'Filter by category: color, typography, spacing, shadow, radius, grid, other'
            },
            theme: {
              type: 'string',
              description: 'Filter by theme name'
            }
          }
        }
      },
      {
        name: 'search_tokens',
        description: 'Search design tokens by name, path, or CSS variable',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query'
            },
            pattern: {
              type: 'string',
              description: 'Search pattern (alternative to query)'
            }
          },
          required: []
        }
      },
      {
        name: 'get_theme',
        description: 'Get a theme by name with summary of its tokens',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Theme name'
            }
          },
          required: ['name']
        }
      }
    ];
    
    // Return all tools (token + component)
    return {
      tools: [...tokenTools, ...componentTools]
    };
  });
}

function findComponentByName(components: Component[], name: string): Component | undefined {
  const normalizedName = name.toLowerCase();
  
  // Try exact name match
  let component = components.find(c => 
    c.name.toLowerCase() === normalizedName
  );
  if (component) return component;
  
  // Try slug match
  component = components.find(c => 
    c.slug.toLowerCase() === normalizedName
  );
  if (component) return component;
  
  // Try partial name match
  component = components.find(c => 
    c.name.toLowerCase().includes(normalizedName) ||
    normalizedName.includes(c.name.toLowerCase())
  );
  
  return component;
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
    const normalizedPath = path.replace(/\//g, '-');
    token = tokens.find(t => t.css_variable === `--${normalizedPath}`);
  }
  
  // Try name match
  if (!token) {
    token = tokens.find(t => t.name.toLowerCase() === path.toLowerCase());
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
