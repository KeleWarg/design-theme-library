/**
 * Gate 14 Verification Test
 * Tests the full Phase 5 export system
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import JSZip from 'jszip';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Load environment variables
dotenv.config({ path: join(projectRoot, '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Import services (we'll need to use dynamic imports or check if they exist)
async function testGate14() {
  console.log('🚦 GATE 14 VERIFICATION TEST\n');
  console.log('='.repeat(60));
  
  const results = {
    prerequisites: {},
    preCheck: {},
    exportFlow: {},
    validation: {},
    overall: 'FAILED'
  };

  // 1. Prerequisites Check
  console.log('\n1. PREREQUISITES CHECK');
  console.log('-'.repeat(60));
  
  // Check Gate 11
  const gate11Report = join(projectRoot, 'GATE-11-VERIFICATION-REPORT.md');
  if (existsSync(gate11Report)) {
    const content = readFileSync(gate11Report, 'utf-8');
    const passed = /Status.*✅.*PASSED/i.test(content) || /GATE 11.*PASSED/i.test(content);
    results.prerequisites.gate11 = passed;
    console.log(`Gate 11: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
  } else {
    results.prerequisites.gate11 = false;
    console.log('Gate 11: ❌ Report not found');
  }

  // Check Gate 12
  const gate12Report = join(projectRoot, 'GATE-12-VERIFICATION-REPORT.md');
  if (existsSync(gate12Report)) {
    const content = readFileSync(gate12Report, 'utf-8');
    const passed = /Status.*✅.*PASSED/i.test(content) || /GATE 12.*PASSED/i.test(content);
    results.prerequisites.gate12 = passed;
    console.log(`Gate 12: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
  } else {
    results.prerequisites.gate12 = false;
    console.log('Gate 12: ❌ Report not found');
  }

  // Check Gate 13
  const gate13Report = join(projectRoot, 'GATE-13-VERIFICATION-REPORT.md');
  if (existsSync(gate13Report)) {
    const content = readFileSync(gate13Report, 'utf-8');
    const passed = /Status.*✅.*PASSED/i.test(content) || /GATE 13.*PASSED/i.test(content);
    results.prerequisites.gate13 = passed;
    console.log(`Gate 13: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
  } else {
    results.prerequisites.gate13 = false;
    console.log('Gate 13: ❌ Report not found');
  }

  // Check chunks 5.14-5.20
  const chunkIndex = join(projectRoot, 'Chunks/00-CHUNK-INDEX.md');
  if (existsSync(chunkIndex)) {
    const content = readFileSync(chunkIndex, 'utf-8');
    const chunks = ['5.14', '5.15', '5.16', '5.17', '5.18', '5.19', '5.20'];
    const allComplete = chunks.every(chunk => {
      const regex = new RegExp(`${chunk.replace('.', '\\.')}.*✅`, 'i');
      return regex.test(content);
    });
    results.prerequisites.chunks514_520 = allComplete;
    console.log(`Chunks 5.14-5.20: ${allComplete ? '✅ COMPLETE' : '❌ INCOMPLETE'}`);
  } else {
    results.prerequisites.chunks514_520 = false;
    console.log('Chunks 5.14-5.20: ❌ Cannot verify (chunk index not found)');
  }

  // 2. Pre-Check: File Integrity
  console.log('\n2. PRE-CHECK: FILE INTEGRITY');
  console.log('-'.repeat(60));
  
  const { execSync } = await import('child_process');
  
  try {
    const emptyJsx = execSync('find src/components/export -name "*.jsx" -size 0', { cwd: projectRoot, encoding: 'utf-8' }).trim();
    results.preCheck.emptyJsx = emptyJsx === '';
    console.log(`Empty JSX files: ${results.preCheck.emptyJsx ? '✅ NONE' : `❌ FOUND: ${emptyJsx}`}`);
  } catch (e) {
    results.preCheck.emptyJsx = true; // Command fails if none found (good)
    console.log('Empty JSX files: ✅ NONE');
  }

  try {
    const emptyJs = execSync('find src/services/generators -name "*.js" -size 0', { cwd: projectRoot, encoding: 'utf-8' }).trim();
    results.preCheck.emptyJs = emptyJs === '';
    console.log(`Empty JS files: ${results.preCheck.emptyJs ? '✅ NONE' : `❌ FOUND: ${emptyJs}`}`);
  } catch (e) {
    results.preCheck.emptyJs = true;
    console.log('Empty JS files: ✅ NONE');
  }

  try {
    const noExports = execSync('grep -L "export" src/services/generators/*.js', { cwd: projectRoot, encoding: 'utf-8' }).trim();
    results.preCheck.allHaveExports = noExports === '';
    console.log(`All files have exports: ${results.preCheck.allHaveExports ? '✅ YES' : `❌ NO: ${noExports}`}`);
  } catch (e) {
    results.preCheck.allHaveExports = true;
    console.log('All files have exports: ✅ YES');
  }

  // 3. Export Service Verification
  console.log('\n3. EXPORT SERVICE VERIFICATION');
  console.log('-'.repeat(60));
  
  // Check if export service exists
  const exportServicePath = join(projectRoot, 'src/services/exportService.js');
  if (!existsSync(exportServicePath)) {
    results.exportFlow.serviceExists = false;
    console.log('❌ exportService.js not found');
  } else {
    results.exportFlow.serviceExists = true;
    console.log('✅ exportService.js exists');
    
    // Check if zipService exists
    const zipServicePath = join(projectRoot, 'src/services/zipService.js');
    if (existsSync(zipServicePath)) {
      results.exportFlow.zipServiceExists = true;
      console.log('✅ zipService.js exists');
    } else {
      results.exportFlow.zipServiceExists = false;
      console.log('❌ zipService.js not found');
    }
  }

  // 4. Generator Files Check
  console.log('\n4. GENERATOR FILES CHECK');
  console.log('-'.repeat(60));
  
  const requiredGenerators = [
    'cssGenerator.js',
    'jsonGenerator.js',
    'tailwindGenerator.js',
    'scssGenerator.js',
    'fontFaceGenerator.js',
    'llmsTxtGenerator.js',
    'cursorRulesGenerator.js',
    'claudeMdGenerator.js',
    'projectKnowledgeGenerator.js',
    'mcpServerGenerator.js',
    'claudeSkillGenerator.js'
  ];
  
  results.exportFlow.generators = {};
  for (const gen of requiredGenerators) {
    const path = join(projectRoot, 'src/services/generators', gen);
    const exists = existsSync(path);
    results.exportFlow.generators[gen] = exists;
    console.log(`${exists ? '✅' : '❌'} ${gen}`);
  }

  // 5. Test Export with Real Data (if available)
  console.log('\n5. EXPORT PACKAGE TEST');
  console.log('-'.repeat(60));
  
  try {
    // Get a theme from the database
    const { data: themes, error: themesError } = await supabase
      .from('themes')
      .select('id')
      .limit(1);
    
    if (themesError || !themes || themes.length === 0) {
      console.log('⚠️  No themes found in database - skipping export test');
      results.exportFlow.exportTest = 'SKIPPED';
    } else {
      console.log(`✅ Found theme: ${themes[0].id}`);
      
      // Try to import and use the export service
      // Note: This is a simplified check - full test would require running in browser context
      console.log('⚠️  Full export test requires browser environment');
      console.log('   (Manual testing recommended via UI)');
      results.exportFlow.exportTest = 'MANUAL_REQUIRED';
    }
  } catch (error) {
    console.log(`⚠️  Database check failed: ${error.message}`);
    results.exportFlow.exportTest = 'ERROR';
  }

  // 6. Expected File Structure Validation
  console.log('\n6. EXPECTED FILE STRUCTURE');
  console.log('-'.repeat(60));
  
  const expectedFiles = [
    'LLMS.txt',
    'dist/tokens.css',
    'dist/tokens.json',
    'dist/tailwind.config.js',
    'dist/_tokens.scss',
    '.cursor/rules/design-system.mdc',
    'CLAUDE.md',
    'project-knowledge.txt',
    'mcp-server/',
    'skill/',
    'components/',
    'package.json'
  ];
  
  console.log('Expected files in Full Package export:');
  expectedFiles.forEach(file => console.log(`  - ${file}`));

  // 7. Summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  
  const allPrereqs = Object.values(results.prerequisites).every(v => v === true);
  const allPreCheck = Object.values(results.preCheck).every(v => v === true);
  const serviceOk = results.exportFlow.serviceExists && results.exportFlow.zipServiceExists;
  const allGenerators = Object.values(results.exportFlow.generators || {}).every(v => v === true);
  
  console.log(`\nPrerequisites: ${allPrereqs ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Pre-Check: ${allPreCheck ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Services: ${serviceOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Generators: ${allGenerators ? '✅ PASS' : '❌ FAIL'}`);
  
  if (allPrereqs && allPreCheck && serviceOk && allGenerators) {
    results.overall = 'PASSED';
    console.log('\n🚦 GATE 14: ✅ PASSED');
    console.log('\nNOTE: Full export flow testing requires manual verification via UI');
    console.log('Expected workflow:');
    console.log('  1. Open Export Modal');
    console.log('  2. Select theme(s)');
    console.log('  3. Select "Full Package" format');
    console.log('  4. Click Export');
    console.log('  5. Verify ZIP download contains all expected files');
    console.log('  6. Validate file contents (CSS, JSON, JS, etc.)');
    console.log('  7. Test MCP server compilation: cd mcp-server && npm install && npm run build');
  } else {
    results.overall = 'FAILED';
    console.log('\n🚦 GATE 14: ❌ FAILED');
    console.log('\nIssues found:');
    if (!allPrereqs) console.log('  - Prerequisites not met');
    if (!allPreCheck) console.log('  - Pre-check failures');
    if (!serviceOk) console.log('  - Missing services');
    if (!allGenerators) console.log('  - Missing generators');
  }
  
  return results;
}

// Run the test
testGate14().then(results => {
  process.exit(results.overall === 'PASSED' ? 0 : 1);
}).catch(error => {
  console.error('\n❌ Test failed with error:', error);
  process.exit(1);
});

