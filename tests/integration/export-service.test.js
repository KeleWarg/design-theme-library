/**
 * @chunk 6.04 - Integration Tests
 * 
 * Integration tests for exportService.
 * Tests package building with mocked services.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock theme and component services
vi.mock('../../src/services/themeService', () => ({
  themeService: {
    getTheme: vi.fn(),
  },
}));

vi.mock('../../src/services/componentService', () => ({
  componentService: {
    getComponent: vi.fn(),
  },
}));

vi.mock('../../src/services/typefaceService', () => ({
  typefaceService: {
    getFontUrl: vi.fn(() => 'https://example.com/font.woff2'),
  },
}));

// Mock generators
vi.mock('../../src/services/generators/cssGenerator', () => ({
  generateMultiThemeCSS: vi.fn(() => ':root {\n  --color-primary: #3b82f6;\n}'),
}));

vi.mock('../../src/services/generators/jsonGenerator', () => ({
  generateJSON: vi.fn(() => '{"color":{"primary":"#3b82f6"}}'),
}));

vi.mock('../../src/services/generators/tailwindGenerator', () => ({
  generateTailwind: vi.fn(() => 'module.exports = { theme: { extend: {} } };'),
}));

vi.mock('../../src/services/generators/scssGenerator', () => ({
  generateSCSS: vi.fn(() => '$color-primary: #3b82f6;'),
}));

vi.mock('../../src/services/generators/fontFaceGenerator', () => ({
  generateFontFaceCss: vi.fn(() => '@font-face { font-family: Inter; }'),
  getFontFilesToInclude: vi.fn(() => []),
}));

vi.mock('../../src/services/generators/llmsTxtGenerator', () => ({
  generateLLMSTxt: vi.fn(() => '# Design System\n## Colors\n'),
}));

vi.mock('../../src/services/generators/cursorRulesGenerator', () => ({
  generateCursorRules: vi.fn(() => '# Cursor Rules'),
}));

vi.mock('../../src/services/generators/claudeMdGenerator', () => ({
  generateClaudeMd: vi.fn(() => ({ 'CLAUDE.md': '# Claude Docs' })),
}));

vi.mock('../../src/services/generators/projectKnowledgeGenerator', () => ({
  generateProjectKnowledge: vi.fn(() => '# Project Knowledge'),
}));

vi.mock('../../src/services/generators/mcpServerGenerator', () => ({
  generateMCPServer: vi.fn(() => ({
    'index.ts': 'export function getToken() {}',
    'types.ts': 'export type Token = {}',
    'package.json': '{}',
  })),
}));

vi.mock('../../src/services/generators/claudeSkillGenerator', () => ({
  generateClaudeSkill: vi.fn(() => ({
    'skill.json': '{}',
  })),
}));

import { exportService } from '../../src/services/exportService';
import { themeService } from '../../src/services/themeService';
import { componentService } from '../../src/services/componentService';

describe('Export Service Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default theme mock
    themeService.getTheme.mockResolvedValue({
      id: 'theme-1',
      name: 'Test Theme',
      tokens: [
        {
          id: 't1',
          name: 'Primary',
          path: 'color/primary',
          category: 'color',
          type: 'color',
          value: { hex: '#3b82f6' },
          css_variable: '--color-primary',
        },
      ],
      typefaces: [],
      typography_roles: [],
    });

    // Default component mock
    componentService.getComponent.mockResolvedValue({
      id: 'comp-1',
      name: 'Button',
      slug: 'button',
      code: 'export default function Button() { return <button>Click</button>; }',
      props: [],
      variants: [],
      status: 'published',
    });
  });

  describe('buildPackage', () => {
    it('generates all requested formats', async () => {
      const packageResult = await exportService.buildPackage({
        themes: ['theme-1'],
        components: ['comp-1'],
        formats: ['css', 'json', 'tailwind'],
        options: {
          projectName: 'test-project',
          version: '1.0.0',
        },
      });

      expect(packageResult.projectName).toBe('test-project');
      expect(packageResult.version).toBe('1.0.0');
      expect(packageResult.files).toBeDefined();
      expect(typeof packageResult.files).toBe('object');
      expect(packageResult.fileCount).toBeGreaterThan(0);

      // Should include LLMS.txt
      expect(packageResult.files['LLMS.txt']).toBeDefined();

      // Should include requested formats
      expect(packageResult.files['dist/tokens.css']).toBeDefined();
      expect(packageResult.files['dist/tokens.json']).toBeDefined();
      expect(packageResult.files['dist/tailwind.config.js']).toBeDefined();
    });

    it('includes LLMS.txt with themes and components', async () => {
      const { generateLLMSTxt } = await import('../../src/services/generators/llmsTxtGenerator');

      await exportService.buildPackage({
        themes: ['theme-1'],
        components: ['comp-1'],
        formats: ['css'],
        options: {
          projectName: 'test-project',
          version: '1.0.0',
        },
      });

      expect(generateLLMSTxt).toHaveBeenCalled();
      const callArgs = generateLLMSTxt.mock.calls[0];
      expect(callArgs[0]).toHaveLength(1); // themes
      expect(callArgs[1]).toHaveLength(1); // components
      expect(callArgs[2].projectName).toBe('test-project');
    });

    it('generates MCP server files that are valid', async () => {
      const { generateMCPServer } = await import('../../src/services/generators/mcpServerGenerator');

      const packageResult = await exportService.buildPackage({
        themes: ['theme-1'],
        components: ['comp-1'],
        formats: ['mcp'],
        options: {
          projectName: 'test-project',
        },
      });

      expect(generateMCPServer).toHaveBeenCalled();

      // Check that MCP files are included
      expect(packageResult.files['mcp-server/index.ts']).toBeDefined();
      expect(packageResult.files['mcp-server/types.ts']).toBeDefined();
      expect(packageResult.files['mcp-server/package.json']).toBeDefined();

      // Check that TypeScript files contain valid code structure
      const indexContent = packageResult.files['mcp-server/index.ts'];
      expect(typeof indexContent).toBe('string');
      expect(indexContent.length).toBeGreaterThan(0);
    });

    it('handles empty themes and components', async () => {
      themeService.getTheme.mockResolvedValue({
        id: 'theme-1',
        name: 'Empty Theme',
        tokens: [],
        typefaces: [],
        typography_roles: [],
      });

      const packageResult = await exportService.buildPackage({
        themes: ['theme-1'],
        components: [],
        formats: ['css', 'json'],
        options: {
          projectName: 'test-project',
        },
      });

      expect(packageResult.files).toBeDefined();
      expect(packageResult.files['LLMS.txt']).toBeDefined();
      expect(packageResult.files['dist/tokens.css']).toBeDefined();
    });

    it('includes package.json and README', async () => {
      const packageResult = await exportService.buildPackage({
        themes: ['theme-1'],
        components: ['comp-1'],
        formats: ['css'],
        options: {
          projectName: 'test-project',
          version: '1.0.0',
        },
      });

      expect(packageResult.files['package.json']).toBeDefined();
      expect(packageResult.files['README.md']).toBeDefined();

      const packageJson = JSON.parse(packageResult.files['package.json']);
      expect(packageJson.name).toBe('test-project');
      expect(packageJson.version).toBe('1.0.0');
    });
  });
});





