/**
 * @chunk 0.05 - AI Generation Testing
 * 
 * Test runner for evaluating Claude AI component generation quality.
 * Generates React components using Claude API and measures:
 * - JSX compilation success rate
 * - Token usage rate
 * - Props generation rate
 * - React best practices adherence
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration from 04-CONFIG-REFERENCE.md
const CONFIG = {
  model: 'claude-opus-4-5-20250514',
  maxTokens: 4096,
  temperature: 0.3,
  maxRetries: 2,
  timeoutMs: 60000
};

// Load environment variables from .env.local
async function loadEnv() {
  try {
    const envPath = path.join(__dirname, '../../.env.local');
    const envContent = await fs.readFile(envPath, 'utf-8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=');
        process.env[key] = value;
      }
    }
  } catch (error) {
    console.error('Warning: Could not load .env.local file');
  }
}

// Load sample tokens
async function loadTokens() {
  const tokensPath = path.join(__dirname, 'sample-tokens.json');
  const content = await fs.readFile(tokensPath, 'utf-8');
  return JSON.parse(content);
}

// Load component specs
async function loadComponentSpecs() {
  const specsPath = path.join(__dirname, 'component-specs.json');
  const content = await fs.readFile(specsPath, 'utf-8');
  return JSON.parse(content);
}

// Load prompt template
async function loadPromptTemplate() {
  const promptPath = path.join(__dirname, 'prompts/component-prompt.md');
  return await fs.readFile(promptPath, 'utf-8');
}

// Format tokens for prompt (simplified version)
function formatTokensForPrompt(tokens) {
  const cssVariables = [];
  
  function extractVars(obj, prefix = '') {
    for (const [key, value] of Object.entries(obj)) {
      if (value && typeof value === 'object') {
        if (value.cssVariable) {
          cssVariables.push(`${value.cssVariable}: ${value.value}`);
        } else {
          extractVars(value, `${prefix}${key}.`);
        }
      }
    }
  }
  
  extractVars(tokens);
  return cssVariables.join('\n');
}

// Build the prompt for a component
function buildPrompt(template, tokens, component) {
  const tokensList = formatTokensForPrompt(tokens);
  
  return template
    .replace('{tokens_json}', tokensList)
    .replace('{name}', component.name)
    .replace('{description}', component.description)
    .replace('{category}', component.category);
}

// Call Claude API to generate component
async function generateComponent(client, prompt, componentName, retryCount = 0) {
  try {
    const response = await client.messages.create({
      model: CONFIG.model,
      max_tokens: CONFIG.maxTokens,
      temperature: CONFIG.temperature,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });
    
    // Extract the text content
    const content = response.content[0];
    if (content.type === 'text') {
      return {
        success: true,
        code: content.text,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens
        }
      };
    }
    
    return { success: false, error: 'Unexpected response format' };
  } catch (error) {
    if (retryCount < CONFIG.maxRetries) {
      console.log(`  Retrying ${componentName} (attempt ${retryCount + 2}/${CONFIG.maxRetries + 1})...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return generateComponent(client, prompt, componentName, retryCount + 1);
    }
    return { success: false, error: error.message };
  }
}

// Extract code from response (handle markdown code blocks)
function extractCode(response) {
  let code = response;
  
  // Remove markdown code block if present
  const tsxMatch = code.match(/```(?:tsx?|jsx?|typescript|javascript)?\n([\s\S]*?)```/);
  if (tsxMatch) {
    code = tsxMatch[1];
  }
  
  return code.trim();
}

// Validate JSX compilation
function validateJSXCompilation(code) {
  const issues = [];
  
  // Check for basic React component structure
  // Match: export default X, export const X, export function X, const X + export default
  const hasExport = /export\s+(default\s+)?(?:function|const|class|interface)\s+\w+/.test(code) ||
                    /export\s+default\s+\w+/.test(code) ||
                    /export\s*{\s*\w+/.test(code);
  const hasReact = /import\s+.*React.*from\s+['"]react['"]/.test(code) || 
                   /import\s+{[^}]*}.*from\s+['"]react['"]/.test(code) ||
                   /React\./.test(code);
  const hasJSX = /<[A-Za-z][^>]*>/.test(code);
  const hasReturn = /return\s*\(?\s*</.test(code) || /=>\s*\(?\s*</.test(code);
  
  // Check for balanced braces and parentheses (skip string contents)
  const codeWithoutStrings = code.replace(/'[^']*'|"[^"]*"|`[^`]*`/g, '');
  const braceCount = (codeWithoutStrings.match(/{/g) || []).length - (codeWithoutStrings.match(/}/g) || []).length;
  const parenCount = (codeWithoutStrings.match(/\(/g) || []).length - (codeWithoutStrings.match(/\)/g) || []).length;
  
  if (!hasExport) issues.push('Missing export statement');
  if (!hasJSX) issues.push('No JSX elements found');
  if (!hasReturn) issues.push('No return statement with JSX');
  if (braceCount !== 0) issues.push(`Unbalanced braces (${braceCount > 0 ? 'missing }' : 'extra }'})`);
  if (parenCount !== 0) issues.push(`Unbalanced parentheses (${parenCount > 0 ? 'missing )' : 'extra )'})`);
  
  // Check for common syntax issues
  if (/class\s+\w+\s+extends\s+React\.Component/.test(code)) {
    issues.push('Uses class component instead of functional');
  }
  
  return {
    valid: issues.length === 0,
    issues,
    score: Math.max(0, 100 - issues.length * 25)
  };
}

// Validate token usage
function validateTokenUsage(code, tokens) {
  const cssVarPattern = /var\(--[\w-]+\)/g;
  const usedVars = code.match(cssVarPattern) || [];
  const uniqueVars = [...new Set(usedVars)];
  
  // Get all available CSS variables
  const availableVars = [];
  function collectVars(obj) {
    for (const value of Object.values(obj)) {
      if (value && typeof value === 'object') {
        if (value.cssVariable) {
          availableVars.push(value.cssVariable);
        } else {
          collectVars(value);
        }
      }
    }
  }
  collectVars(tokens);
  
  // Check if used vars exist in our token set
  const validVars = uniqueVars.filter(v => {
    const varName = v.replace(/var\((--[\w-]+)\)/, '$1');
    return availableVars.includes(varName);
  });
  
  // Check for hardcoded values (bad practice)
  const hardcodedColors = (code.match(/#[0-9a-fA-F]{3,8}(?![0-9a-fA-F])/g) || []).length;
  const hardcodedPx = (code.match(/:\s*\d+px/g) || []).length;
  
  const usesTokens = uniqueVars.length > 0;
  const tokenAccuracy = uniqueVars.length > 0 ? (validVars.length / uniqueVars.length) * 100 : 0;
  const hardcodedPenalty = Math.min(30, (hardcodedColors + hardcodedPx) * 5);
  
  return {
    usedVariables: uniqueVars.length,
    validVariables: validVars.length,
    hardcodedColors,
    hardcodedPx,
    score: Math.max(0, (usesTokens ? 70 : 0) + (tokenAccuracy * 0.3) - hardcodedPenalty),
    details: {
      usedVars: uniqueVars,
      validVars,
      usesTokens,
      tokenAccuracy: tokenAccuracy.toFixed(1)
    }
  };
}

// Validate props generation
function validatePropsGeneration(code) {
  const issues = [];
  
  // Check for TypeScript interface or type
  const hasInterface = /interface\s+\w*Props\s*{/.test(code) || 
                       /type\s+\w*Props\s*=\s*{/.test(code) ||
                       /export\s+interface\s+\w*Props\s*{/.test(code);
  
  // Check for JSDoc comments (/** ... */)
  const hasJSDoc = /\/\*\*[\s\S]*?\*\//.test(code);
  
  // Check for default props - destructuring with defaults is the modern pattern
  const hasDefaultProps = /\(\s*{\s*[\w\s,='":\[\]{}]+}\s*\)/.test(code) || // destructuring with possible defaults
                          /=\s*['"][^'"]*['"]/.test(code) || // default string value
                          /=\s*\d+/.test(code) || // default number value
                          /=\s*true|=\s*false/.test(code) || // default boolean
                          /=\s*\[\]/.test(code) || // default empty array
                          /defaultProps\s*=/.test(code);
  
  // Check for prop types being used in component - more flexible matching
  const hasTypedProps = /:\s*React\.FC<\w*Props>/.test(code) || // React.FC<Props>
                        /:\s*FC<\w*Props>/.test(code) || // FC<Props>
                        /\(\s*{[^}]*}\s*:\s*\w*Props\s*\)/.test(code) || // destructured props: Props
                        /\(\s*props\s*:\s*\w*Props\s*\)/.test(code); // props: Props
  
  if (!hasInterface) issues.push('Missing Props interface/type');
  if (!hasJSDoc) issues.push('Missing JSDoc comments');
  if (!hasTypedProps) issues.push('Props not properly typed in function signature');
  
  let score = 100;
  if (!hasInterface) score -= 35;
  if (!hasJSDoc) score -= 20;
  if (!hasTypedProps) score -= 25;
  if (!hasDefaultProps) score -= 20;
  
  return {
    hasInterface,
    hasJSDoc,
    hasTypedProps,
    hasDefaultProps,
    issues,
    score: Math.max(0, score)
  };
}

// Validate React best practices
function validateBestPractices(code) {
  const issues = [];
  let score = 100;
  
  // Check for proper hooks usage
  const usesState = /useState/.test(code);
  const usesEffect = /useEffect/.test(code);
  const usesCallback = /useCallback/.test(code);
  const usesMemo = /useMemo/.test(code);
  const usesRef = /useRef/.test(code);
  
  // Check for accessibility
  const hasAriaLabels = /aria-[\w-]+/.test(code);
  const hasRole = /role=/.test(code);
  const hasOnClick = /onClick/.test(code);
  const hasOnKeyDown = /onKeyDown|onKeyPress|onKeyUp/.test(code);
  
  // Accessibility: if interactive, should have keyboard support
  if (hasOnClick && !hasOnKeyDown) {
    issues.push('Interactive element missing keyboard handler');
    score -= 15;
  }
  
  // Check for inline styles using CSS variables (good)
  const usesInlineStyles = /style=\s*{{/.test(code);
  
  // Check for className (acceptable)
  const usesClassName = /className/.test(code);
  
  // Event handlers should be proper functions
  const inlineHandlers = (code.match(/on\w+\s*=\s*{[^}]*\(\)[^}]*}/g) || []).length;
  if (inlineHandlers > 2) {
    issues.push('Multiple inline function handlers (consider useCallback)');
    score -= 10;
  }
  
  return {
    hooks: { usesState, usesEffect, usesCallback, usesMemo, usesRef },
    accessibility: { hasAriaLabels, hasRole, hasKeyboardSupport: hasOnKeyDown },
    styling: { usesInlineStyles, usesClassName },
    issues,
    score
  };
}

// Save generated component to file
async function saveComponent(componentName, code, resultsDir) {
  const fileName = `${componentName}.tsx`;
  const filePath = path.join(resultsDir, fileName);
  await fs.writeFile(filePath, code, 'utf-8');
  return fileName;
}

// Generate the report
function generateReport(results, startTime) {
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(1);
  
  const total = results.length;
  const successful = results.filter(r => r.generated).length;
  
  // Calculate aggregate scores
  const jsxScores = results.filter(r => r.generated).map(r => r.validation.jsx.score);
  const tokenScores = results.filter(r => r.generated).map(r => r.validation.tokens.score);
  const propsScores = results.filter(r => r.generated).map(r => r.validation.props.score);
  const practicesScores = results.filter(r => r.generated).map(r => r.validation.bestPractices.score);
  
  const avg = arr => arr.length > 0 ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : 'N/A';
  
  const avgJSX = avg(jsxScores);
  const avgTokens = avg(tokenScores);
  const avgProps = avg(propsScores);
  const avgPractices = avg(practicesScores);
  
  // Pass/fail thresholds from spec
  const jsxPassRate = jsxScores.filter(s => s >= 80).length / jsxScores.length * 100;
  const tokenPassRate = tokenScores.filter(s => s >= 70).length / tokenScores.length * 100;
  const propsPassRate = propsScores.filter(s => s >= 80).length / propsScores.length * 100;
  
  let report = `# AI Generation Test Report

## Summary

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Components Tested | ${total} | 10 | ${total >= 10 ? '✅' : '⚠️'} |
| Generation Success | ${successful}/${total} (${(successful/total*100).toFixed(0)}%) | ≥90% | ${successful/total >= 0.9 ? '✅' : '❌'} |
| JSX Compilation | ${jsxPassRate.toFixed(0)}% pass | ≥80% | ${jsxPassRate >= 80 ? '✅' : '❌'} |
| Token Usage | ${tokenPassRate.toFixed(0)}% pass | ≥70% | ${tokenPassRate >= 70 ? '✅' : '❌'} |
| Props Generation | ${propsPassRate.toFixed(0)}% pass | ≥80% | ${propsPassRate >= 80 ? '✅' : '❌'} |

**Test Duration:** ${duration}s
**Model:** ${CONFIG.model}
**Temperature:** ${CONFIG.temperature}

---

## Average Scores

| Category | Score |
|----------|-------|
| JSX Compilation | ${avgJSX}/100 |
| Token Usage | ${avgTokens}/100 |
| Props Generation | ${avgProps}/100 |
| Best Practices | ${avgPractices}/100 |

---

## Detailed Results

`;

  for (const result of results) {
    report += `### ${result.component.id}. ${result.component.name}

**Complexity:** ${result.component.complexity} | **Category:** ${result.component.category}

`;

    if (!result.generated) {
      report += `**Status:** ❌ Generation Failed
**Error:** ${result.error}

`;
    } else {
      const jsx = result.validation.jsx;
      const tokens = result.validation.tokens;
      const props = result.validation.props;
      const practices = result.validation.bestPractices;
      
      report += `**Status:** ✅ Generated

| Metric | Score | Details |
|--------|-------|---------|
| JSX Compilation | ${jsx.score}/100 | ${jsx.issues.length > 0 ? jsx.issues.join(', ') : 'Valid'} |
| Token Usage | ${tokens.score}/100 | ${tokens.usedVariables} vars used, ${tokens.validVariables} valid |
| Props Generation | ${props.score}/100 | Interface: ${props.hasInterface ? '✓' : '✗'}, JSDoc: ${props.hasJSDoc ? '✓' : '✗'} |
| Best Practices | ${practices.score}/100 | ${practices.issues.length > 0 ? practices.issues.join(', ') : 'Good'} |

**Token Usage:** ${tokens.details.usedVars.slice(0, 5).join(', ')}${tokens.details.usedVars.length > 5 ? '...' : ''}

`;
    }
    
    report += '---\n\n';
  }

  // Overall assessment
  const overallPass = jsxPassRate >= 80 && tokenPassRate >= 70 && propsPassRate >= 80;
  
  report += `## Overall Assessment

`;

  if (overallPass) {
    report += `### ✅ PASS

AI generation quality meets the minimum thresholds for the design system admin tool. 
The generated components can serve as a starting point for users, with manual refinement expected.

**Recommendation:** Proceed to Phase 1 with confidence in AI generation capability.
`;
  } else {
    report += `### ⚠️ CONDITIONAL PASS

Some metrics are below target thresholds. Consider:
1. Refining the prompt template
2. Adding more specific token usage instructions
3. Running another iteration with adjusted parameters

**Recommendation:** Review failing components and iterate on prompt before Phase 3.
`;
  }

  report += `
---

## Prompt Iteration Notes

### v1 Prompt (Current)
- Basic token context provided
- Explicit TypeScript requirement
- Self-contained component requirement

### Suggested Improvements for v2
1. Add explicit CSS variable examples
2. Include Props interface template
3. Specify accessibility requirements explicitly
4. Add more component structure examples

---

## Files Generated

- \`poc/ai-generation/results/\` — Generated component files
- \`poc/ai-generation/REPORT.md\` — This report

---

*Generated: ${new Date().toISOString()}*
`;

  return report;
}

// Main test runner
async function main() {
  console.log('🧪 AI Generation Test Runner - Chunk 0.05\n');
  console.log('='.repeat(50));
  
  const startTime = Date.now();
  
  // Load environment
  await loadEnv();
  
  const apiKey = process.env.VITE_CLAUDE_API_KEY;
  if (!apiKey) {
    console.error('❌ VITE_CLAUDE_API_KEY not found in .env.local');
    console.error('   Create .env.local with: VITE_CLAUDE_API_KEY=your-api-key');
    process.exit(1);
  }
  
  console.log('✅ API key loaded');
  
  // Initialize Anthropic client
  const client = new Anthropic({ apiKey });
  
  // Load test data
  console.log('📂 Loading test data...');
  const tokens = await loadTokens();
  const componentSpecs = await loadComponentSpecs();
  const promptTemplate = await loadPromptTemplate();
  console.log(`   Loaded ${componentSpecs.length} component specs`);
  
  // Create results directory
  const resultsDir = path.join(__dirname, 'results');
  await fs.mkdir(resultsDir, { recursive: true });
  
  // Run tests
  console.log('\n🚀 Starting component generation tests...\n');
  
  const results = [];
  
  for (const component of componentSpecs) {
    console.log(`[${component.id}/10] Generating ${component.name}...`);
    
    const prompt = buildPrompt(promptTemplate, tokens, component);
    const generation = await generateComponent(client, prompt, component.name);
    
    if (!generation.success) {
      console.log(`   ❌ Failed: ${generation.error}`);
      results.push({
        component,
        generated: false,
        error: generation.error
      });
      continue;
    }
    
    // Extract and validate code
    const code = extractCode(generation.code);
    
    // Run validations
    const jsxValidation = validateJSXCompilation(code);
    const tokenValidation = validateTokenUsage(code, tokens);
    const propsValidation = validatePropsGeneration(code);
    const practicesValidation = validateBestPractices(code);
    
    // Save component
    const fileName = await saveComponent(component.name, code, resultsDir);
    
    console.log(`   ✅ Generated (JSX: ${jsxValidation.score}, Tokens: ${tokenValidation.score.toFixed(0)}, Props: ${propsValidation.score})`);
    
    results.push({
      component,
      generated: true,
      fileName,
      code,
      usage: generation.usage,
      validation: {
        jsx: jsxValidation,
        tokens: tokenValidation,
        props: propsValidation,
        bestPractices: practicesValidation
      }
    });
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Generate report
  console.log('\n📊 Generating report...');
  const report = generateReport(results, startTime);
  
  const reportPath = path.join(__dirname, 'REPORT.md');
  await fs.writeFile(reportPath, report, 'utf-8');
  
  console.log(`\n${'='.repeat(50)}`);
  console.log('✅ Test run complete!');
  console.log(`   Results: ${resultsDir}`);
  console.log(`   Report: ${reportPath}`);
  
  // Print summary
  const successful = results.filter(r => r.generated).length;
  const avgJSX = results.filter(r => r.generated)
    .map(r => r.validation.jsx.score)
    .reduce((a, b) => a + b, 0) / successful || 0;
  
  console.log(`\n📈 Summary:`);
  console.log(`   Generated: ${successful}/${results.length}`);
  console.log(`   Avg JSX Score: ${avgJSX.toFixed(1)}/100`);
}

// Run
main().catch(console.error);

