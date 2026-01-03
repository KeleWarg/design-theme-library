# Chunk 5.19 — Package Builder

## Purpose
Orchestrate all generators and create folder structure.

---

## Inputs
- Selected themes and components
- Selected formats

## Outputs
- Complete export folder structure

---

## Dependencies
- Chunks 5.05-5.18 must be complete

---

## Implementation Notes

```javascript
// src/services/exportService.js
import { generateCSS, generateCSSWithFontFace, generateMultiThemeCSS } from './generators/cssGenerator';
import { generateJSON } from './generators/jsonGenerator';
import { generateTailwind } from './generators/tailwindGenerator';
import { generateSCSS } from './generators/scssGenerator';
import { generateFontFaceCss, getFontFilesToInclude } from './generators/fontFaceGenerator';
import { generateLLMSTxt } from './generators/llmsTxtGenerator';
import { generateCursorRules } from './generators/cursorRulesGenerator';
import { generateClaudeMd } from './generators/claudeMdGenerator';
import { generateProjectKnowledge } from './generators/projectKnowledgeGenerator';
import { generateMCPServer } from './generators/mcpServerGenerator';
import { generateClaudeSkill } from './generators/claudeSkillGenerator';
import { themeService } from './themeService';
import { componentService } from './componentService';
import { typefaceService } from './typefaceService';

export const exportService = {
  async buildPackage({ themes, components, formats, options = {} }) {
    // Fetch full data for selected items
    const fullThemes = await Promise.all(
      themes.map(id => themeService.getTheme(id))
    );
    
    const fullComponents = await Promise.all(
      components.map(id => componentService.getComponent(id))
    );

    const projectName = options.projectName || 'design-system';
    const version = options.version || '1.0.0';
    
    const files = {};

    // Always include LLMS.txt
    files['LLMS.txt'] = await generateLLMSTxt(fullThemes, fullComponents, { projectName, version });

    // Token formats
    if (formats.includes('css') || formats.includes('all')) {
      const allTypefaces = fullThemes.flatMap(t => t.typefaces || []);
      files['dist/tokens.css'] = generateMultiThemeCSS(fullThemes);
      if (allTypefaces.length) {
        files['dist/fonts.css'] = generateFontFaceCss(allTypefaces);
      }
    }

    if (formats.includes('json') || formats.includes('all')) {
      const allTokens = fullThemes.flatMap(t => t.tokens || []);
      files['dist/tokens.json'] = generateJSON(allTokens, { format: 'nested', includeMetadata: true });
      files['dist/tokens.flat.json'] = generateJSON(allTokens, { format: 'flat' });
    }

    if (formats.includes('tailwind') || formats.includes('all')) {
      const allTokens = fullThemes.flatMap(t => t.tokens || []);
      files['dist/tailwind.config.js'] = generateTailwind(allTokens);
    }

    if (formats.includes('scss') || formats.includes('all')) {
      const allTokens = fullThemes.flatMap(t => t.tokens || []);
      files['dist/_tokens.scss'] = generateSCSS(allTokens);
      files['dist/_tokens-maps.scss'] = generateSCSS(allTokens, { useMaps: true });
    }

    // AI platform formats
    if (formats.includes('cursor') || formats.includes('all')) {
      files['.cursor/rules/design-system.mdc'] = generateCursorRules(fullThemes, fullComponents, { projectName });
    }

    if (formats.includes('claude') || formats.includes('all')) {
      const claudeFiles = generateClaudeMd(fullThemes, fullComponents, { projectName });
      Object.assign(files, claudeFiles);
    }

    if (formats.includes('project-knowledge') || formats.includes('all')) {
      files['project-knowledge.txt'] = generateProjectKnowledge(fullThemes, fullComponents, { projectName });
    }

    // MCP Server
    if (formats.includes('mcp') || formats.includes('all')) {
      const mcpFiles = await generateMCPServer(fullThemes, fullComponents, { projectName });
      for (const [path, content] of Object.entries(mcpFiles)) {
        files[`mcp-server/${path}`] = content;
      }
    }

    // Claude Skill
    if (formats.includes('skill') || formats.includes('all')) {
      const skillFiles = generateClaudeSkill(fullThemes, fullComponents, { projectName });
      for (const [path, content] of Object.entries(skillFiles)) {
        files[`skill/${path}`] = content;
      }
    }

    // Component code
    if (formats.includes('components') || formats.includes('all')) {
      for (const component of fullComponents) {
        if (component.code) {
          const slug = component.slug || component.name.toLowerCase().replace(/\s+/g, '-');
          files[`components/${slug}.jsx`] = component.code;
        }
      }
    }

    // Font files (reference for ZIP)
    if (formats.includes('fonts') || formats.includes('all')) {
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

function generateReadme(projectName, version, formats) {
  return `# ${projectName} Design System

Version: ${version}

## Contents

${formats.includes('css') || formats.includes('all') ? '- `dist/tokens.css` - CSS custom properties\n' : ''}${formats.includes('json') || formats.includes('all') ? '- `dist/tokens.json` - JSON token data\n' : ''}${formats.includes('tailwind') || formats.includes('all') ? '- `dist/tailwind.config.js` - Tailwind configuration\n' : ''}${formats.includes('mcp') || formats.includes('all') ? '- `mcp-server/` - MCP server for Claude Desktop\n' : ''}${formats.includes('skill') || formats.includes('all') ? '- `skill/` - Claude.ai Project skill\n' : ''}- \`LLMS.txt\` - AI-readable documentation

## Usage

### CSS
\`\`\`html
<link rel="stylesheet" href="./dist/tokens.css">
\`\`\`

### Tailwind
\`\`\`js
// tailwind.config.js
module.exports = {
  presets: [require('./dist/tailwind.config.js')]
}
\`\`\`

See LLMS.txt for complete documentation.
`;
}
```

---

## Files Created
- `src/services/exportService.js` — Main export service

---

## Tests

### Unit Tests
- [ ] All requested formats generated
- [ ] File paths correct
- [ ] Font files referenced correctly
- [ ] Package.json valid
- [ ] README generated

---

## Time Estimate
3 hours
