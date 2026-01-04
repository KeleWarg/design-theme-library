/**
 * @chunk 5.15 - MCP Token Tools
 * 
 * Token query tools for MCP server.
 * Provides get_token, list_tokens, search_tokens, and get_theme tools.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/index.js";
import type { DesignSystem, Token } from '../types.js';

export function registerTokenTools(server: McpServer, designSystem: DesignSystem) {
  
  // get_token - Get a specific token by path or name
  server.setRequestHandler('tools/call', async (request) => {
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
    
    return null;
  });
  
  // Register tool definitions
  server.setRequestHandler('tools/list', async () => {
    return {
      tools: [
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
      ]
    };
  });
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

