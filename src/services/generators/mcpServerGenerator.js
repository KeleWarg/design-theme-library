/**
 * @chunk 5.17 - MCP Package Generator
 * 
 * Generate complete MCP server package from themes and components.
 * Combines scaffold + token tools + component tools into a runnable package.
 */

// Template constants (embedded for browser compatibility)
const INDEX_TEMPLATE = `export * from './server.js';
`;

const SERVER_TEMPLATE = `import { McpServer, StdioServerTransport } from "@modelcontextprotocol/sdk/server/index.js";
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
`;

const TYPES_TEMPLATE = `export interface DesignSystem {
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
`;

const PACKAGE_JSON_TEMPLATE = `{
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
`;

const TSCONFIG_TEMPLATE = `{
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
`;

const TOKEN_TOOLS_TEMPLATE = `/**
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
            text: JSON.stringify({ error: \`Token not found: \${identifier}\` })
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
            text: JSON.stringify({ error: \`Theme not found: \${args.name}\` })
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
    const normalizedPath = path.replace(/\\//g, '-');
    token = tokens.find(t => t.css_variable === \`--\${normalizedPath}\`);
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
      return \`\${value.value}\${value.unit}\`;
    }
    return JSON.stringify(value);
  }
  return String(value);
}
`;

const COMPONENT_TOOLS_TEMPLATE = `/**
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
            text: JSON.stringify({ error: \`Token not found: \${identifier}\` })
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
            text: JSON.stringify({ error: \`Theme not found: \${args.name}\` })
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
            text: JSON.stringify({ error: \`Component not found: \${args.name}\` })
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
            text: JSON.stringify({ error: \`Component not found: \${args.name}\` })
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
            text: JSON.stringify({ error: \`Component not found: \${args.name}\` })
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
    const normalizedPath = path.replace(/\\//g, '-');
    token = tokens.find(t => t.css_variable === \`--\${normalizedPath}\`);
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
      return \`\${value.value}\${value.unit}\`;
    }
    return JSON.stringify(value);
  }
  return String(value);
}
`;

/**
 * Generate MCP server package from themes and components
 * @param {Array} themes - Array of theme objects with tokens
 * @param {Array} components - Array of component objects
 * @param {Object} options - Generation options
 * @param {string} options.projectName - Project name for package (default: 'design-system')
 * @returns {Object} - Object mapping file paths to content strings
 */
export function generateMCPServer(themes, components, options = {}) {
  const { projectName = 'design-system' } = options;
  
  // Prepare design system data
  const designSystemData = {
    name: projectName,
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    themes: themes.map(theme => ({
      name: theme.name,
      slug: theme.slug,
      isDefault: theme.is_default || false,
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
    components: (components || []).map(comp => ({
      name: comp.name,
      slug: comp.slug || comp.name.toLowerCase().replace(/\s+/g, '-'),
      description: comp.description || '',
      category: comp.category || '',
      props: comp.props || [],
      variants: comp.variants || [],
      code: comp.code || '',
      linked_tokens: comp.linked_tokens || [],
      examples: comp.component_examples?.map(ex => ({
        title: ex.title,
        code: ex.code,
        description: ex.description,
      })) || [],
    })),
  };
  
  // Prepare separate data files
  const tokensData = designSystemData.tokens;
  const componentsData = designSystemData.components;
  
  // Update server.ts to use project name
  const serverContent = SERVER_TEMPLATE
    .replace(/"design-system-mcp"/g, `"${projectName}-mcp"`)
    .replace(/Design System MCP server running/g, `${projectName} MCP server running`);
  
  // Update package.json to use project name
  const packageJsonContent = PACKAGE_JSON_TEMPLATE.replace(
    /"design-system-mcp"/g,
    `"${projectName}-mcp"`
  );
  
  // Generate all files
  const files = {
    'package.json': packageJsonContent,
    'tsconfig.json': TSCONFIG_TEMPLATE,
    'src/index.ts': INDEX_TEMPLATE,
    'src/server.ts': serverContent,
    'src/types.ts': TYPES_TEMPLATE,
    'src/tools/tokenTools.ts': TOKEN_TOOLS_TEMPLATE,
    'src/tools/componentTools.ts': COMPONENT_TOOLS_TEMPLATE,
    'src/data/tokens.json': JSON.stringify(tokensData, null, 2),
    'src/data/components.json': JSON.stringify(componentsData, null, 2),
    'design-system.json': JSON.stringify(designSystemData, null, 2),
    'README.md': generateMCPReadme(projectName),
    '.gitignore': 'node_modules/\ndist/\n',
  };
  
  return files;
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
- \`get_component_code\` - Get the source code for a component
- \`get_component_props\` - Get component prop definitions
- \`search_components\` - Search components by name or description

## Example Usage

In Claude Desktop, you can ask:
- "What color tokens are available?"
- "Show me the Button component"
- "Search for tokens containing 'primary'"
- "List all form components"

## Design System Data

The design system data is embedded in \`design-system.json\` and includes:
- Themes
- Tokens (with CSS variables)
- Components

Separate data files are also available:
- \`src/data/tokens.json\` - All tokens
- \`src/data/components.json\` - All components

Generated: ${new Date().toISOString()}
`;
}
