/**
 * @chunk 5.19 - Package Builder
 * 
 * Orchestrates all generators and creates complete export folder structure.
 * Handles format mapping, font files, and package metadata.
 */

import { generateMultiThemeCSS } from './generators/cssGenerator.js';
import { generateJSON } from './generators/jsonGenerator.js';
import { generateTailwind } from './generators/tailwindGenerator.js';
import { generateSCSS } from './generators/scssGenerator.js';
import { generateFontFaceCss, getFontFilesToInclude } from './generators/fontFaceGenerator.js';
import { generateLLMSTxt } from './generators/llmsTxtGenerator.js';
import { generateCursorRules } from './generators/cursorRulesGenerator.js';
import { generateClaudeMd } from './generators/claudeMdGenerator.js';
import { generateProjectKnowledge } from './generators/projectKnowledgeGenerator.js';
import { generateMCPServer } from './generators/mcpServerGenerator.js';
import { generateClaudeSkill } from './generators/claudeSkillGenerator.js';
import { themeService } from './themeService.js';
import { componentService } from './componentService.js';
import { typefaceService } from './typefaceService.js';

export const exportService = {
  /**
   * Build complete export package with all requested formats
   * @param {Object} params - Package parameters
   * @param {Array<string>} params.themes - Array of theme IDs
   * @param {Array<string>} params.components - Array of component IDs
   * @param {Array<string>} params.formats - Array of format strings (css, json, tailwind, scss, cursor, claude, mcp, skill, all, components, fonts)
   * @param {Object} params.options - Additional options
   * @param {string} params.options.projectName - Project name (default: 'design-system')
   * @param {string} params.options.version - Version string (default: '1.0.0')
   * @returns {Promise<Object>} - Package object with files map, projectName, version, fileCount
   */
  async buildPackage({ themes, components, formats, options = {} }) {
    // Fetch full data for selected items with error handling
    const themeResults = await Promise.allSettled(
      themes.map(id => themeService.getTheme(id))
    );

    const componentResults = await Promise.allSettled(
      components.map(id => componentService.getComponent(id))
    );

    // Filter successful results and log failures
    const fullThemes = [];
    themeResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        fullThemes.push(result.value);
      } else {
        console.warn(`Failed to fetch theme ${themes[index]}:`, result.reason || 'Theme not found');
      }
    });

    const fullComponents = [];
    componentResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        fullComponents.push(result.value);
      } else {
        console.warn(`Failed to fetch component ${components[index]}:`, result.reason || 'Component not found');
      }
    });

    // Ensure we have at least some data to export
    if (fullThemes.length === 0 && fullComponents.length === 0) {
      throw new Error('No valid themes or components found for export');
    }

    const projectName = options.projectName || 'design-system';
    const version = options.version || '1.0.0';
    
    const files = {};

    // Always include LLMS.txt
    files['LLMS.txt'] = await generateLLMSTxt(fullThemes, fullComponents, { projectName, version });

    // Check if 'all' format is selected
    const includeAll = formats.includes('all');

    // Token formats
    if (formats.includes('css') || includeAll) {
      files['dist/tokens.css'] = generateMultiThemeCSS(fullThemes);
      
      // Include font-face CSS if there are typefaces
      const allTypefaces = fullThemes.flatMap(t => t.typefaces || []);
      if (allTypefaces.length > 0) {
        files['dist/fonts.css'] = generateFontFaceCss(allTypefaces);
      }
    }

    if (formats.includes('json') || includeAll) {
      const allTokens = fullThemes.flatMap(t => t.tokens || []);
      files['dist/tokens.json'] = generateJSON(allTokens, { format: 'nested', includeMetadata: true });
      files['dist/tokens.flat.json'] = generateJSON(allTokens, { format: 'flat' });
    }

    if (formats.includes('tailwind') || includeAll) {
      const allTokens = fullThemes.flatMap(t => t.tokens || []);
      files['dist/tailwind.config.js'] = generateTailwind(allTokens);
    }

    if (formats.includes('scss') || includeAll) {
      const allTokens = fullThemes.flatMap(t => t.tokens || []);
      files['dist/_tokens.scss'] = generateSCSS(allTokens, { useMaps: false });
      files['dist/_tokens-maps.scss'] = generateSCSS(allTokens, { useMaps: true });
    }

    // AI platform formats
    if (formats.includes('cursor') || includeAll) {
      files['.cursor/rules/design-system.mdc'] = generateCursorRules(fullThemes, fullComponents, { projectName });
    }

    if (formats.includes('claude') || includeAll) {
      const claudeFiles = generateClaudeMd(fullThemes, fullComponents, { projectName });
      Object.assign(files, claudeFiles);
    }

    if (formats.includes('project-knowledge') || includeAll) {
      files['project-knowledge.txt'] = generateProjectKnowledge(fullThemes, fullComponents, { projectName, version });
    }

    // MCP Server
    if (formats.includes('mcp') || includeAll) {
      const mcpFiles = generateMCPServer(fullThemes, fullComponents, { projectName });
      for (const [path, content] of Object.entries(mcpFiles)) {
        files[`mcp-server/${path}`] = content;
      }
    }

    // Claude Skill
    if (formats.includes('skill') || includeAll) {
      const skillFiles = generateClaudeSkill(fullThemes, fullComponents, { projectName });
      for (const [path, content] of Object.entries(skillFiles)) {
        files[`skill/${path}`] = content;
      }
    }

    // Component code
    if (formats.includes('components') || includeAll) {
      for (const component of fullComponents) {
        if (component.code) {
          const slug = component.slug || component.name.toLowerCase().replace(/\s+/g, '-');
          files[`components/${slug}.jsx`] = component.code;
        }
      }
    }

    // Font files (reference for ZIP)
    if (formats.includes('fonts') || includeAll) {
      const allTypefaces = fullThemes.flatMap(t => t.typefaces || []);
      const fontFiles = getFontFilesToInclude(allTypefaces);
      for (const font of fontFiles) {
        const url = typefaceService.getFontUrl(font.storagePath);
        files[font.outputPath] = { url, type: 'binary' };
      }
    }

    // Add package.json
    files['package.json'] = JSON.stringify({
      name: projectName,
      version,
      description: `${projectName} design system`,
      exports: {
        './tokens.css': './dist/tokens.css',
        './tokens.json': './dist/tokens.json',
        './tailwind.config': './dist/tailwind.config.js',
      },
    }, null, 2);

    // Add README
    files['README.md'] = generateReadme(projectName, version, formats);

    return {
      projectName,
      version,
      files,
      fileCount: Object.keys(files).length,
    };
  }
};

/**
 * Generate README.md content for the export package
 * @param {string} projectName - Project name
 * @param {string} version - Version string
 * @param {Array<string>} formats - Selected formats
 * @returns {string} - README content
 */
function generateReadme(projectName, version, formats) {
  const includeAll = formats.includes('all');
  
  let contents = '';
  
  if (formats.includes('css') || includeAll) {
    contents += '- `dist/tokens.css` - CSS custom properties\n';
    contents += '- `dist/fonts.css` - Font face declarations\n';
  }
  
  if (formats.includes('json') || includeAll) {
    contents += '- `dist/tokens.json` - JSON token data (nested)\n';
    contents += '- `dist/tokens.flat.json` - JSON token data (flat)\n';
  }
  
  if (formats.includes('tailwind') || includeAll) {
    contents += '- `dist/tailwind.config.js` - Tailwind configuration\n';
  }
  
  if (formats.includes('scss') || includeAll) {
    contents += '- `dist/_tokens.scss` - SCSS variables\n';
    contents += '- `dist/_tokens-maps.scss` - SCSS maps\n';
  }
  
  if (formats.includes('mcp') || includeAll) {
    contents += '- `mcp-server/` - MCP server for Claude Desktop\n';
  }
  
  if (formats.includes('skill') || includeAll) {
    contents += '- `skill/` - Claude.ai Project skill\n';
  }
  
  if (formats.includes('components') || includeAll) {
    contents += '- `components/` - React component code\n';
  }
  
  if (formats.includes('fonts') || includeAll) {
    contents += '- `fonts/` - Custom font files\n';
  }
  
  contents += '- `LLMS.txt` - AI-readable documentation\n';
  
  if (formats.includes('cursor') || includeAll) {
    contents += '- `.cursor/rules/design-system.mdc` - Cursor AI rules\n';
  }
  
  if (formats.includes('claude') || includeAll) {
    contents += '- `CLAUDE.md` - Claude AI documentation\n';
    contents += '- `.claude/rules/tokens.md` - Claude AI token rules\n';
  }
  
  if (formats.includes('project-knowledge') || includeAll) {
    contents += '- `project-knowledge.txt` - Condensed project knowledge\n';
  }

  return `# ${projectName} Design System

Version: ${version}

## Contents

${contents}

## Usage

### CSS
\`\`\`html
<link rel="stylesheet" href="./dist/tokens.css">
<link rel="stylesheet" href="./dist/fonts.css">
\`\`\`

### Tailwind
\`\`\`js
// tailwind.config.js
module.exports = {
  presets: [require('./dist/tailwind.config.js')]
}
\`\`\`

### SCSS
\`\`\`scss
@import './dist/tokens';
@import './dist/tokens-maps';
\`\`\`

See LLMS.txt for complete documentation.
`;
}

