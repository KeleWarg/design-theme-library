/**
 * Quick role coverage helper.
 *
 * Compares:
 * - Universal registry roles (what the app supports everywhere)
 * - Role titles present in Figma token JSON files (Desktop/Tablet/Mobile)
 *
 * Usage:
 *   node scripts/check-typography-role-coverage.js /path/to/Desktop.tokens.json /path/to/Tablet.tokens.json /path/to/Mobile.tokens.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve registry from source (no build step needed)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const registryPath = path.resolve(__dirname, '../src/lib/typographyRoleRegistry.js');
const { TYPOGRAPHY_ROLE_REGISTRY } = await import(registryPath);

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function extractRoleTitlesFromFigmaTokens(json) {
  const roles = new Set();
  const fontSizeRoot = json?.['Font Size'];
  if (!fontSizeRoot || typeof fontSizeRoot !== 'object') return roles;

  // Font Size groups are theme/mode specific (e.g. "SEM", "Forbes Media")
  for (const group of Object.values(fontSizeRoot)) {
    if (!group || typeof group !== 'object') continue;
    for (const key of Object.keys(group)) {
      roles.add(key);
    }
  }
  return roles;
}

function main(args) {
  const files = args.slice(2);
  if (files.length === 0) {
    console.log('Provide one or more *.tokens.json files.');
    process.exit(1);
  }

  const registry = new Set(TYPOGRAPHY_ROLE_REGISTRY.map(r => r.name));
  const figmaRoles = new Set();

  for (const file of files) {
    const json = readJson(file);
    const roles = extractRoleTitlesFromFigmaTokens(json);
    for (const r of roles) figmaRoles.add(r);
  }

  const missingInRegistry = [...figmaRoles].filter(r => !registry.has(r)).sort();
  const extraInRegistry = [...registry].filter(r => !figmaRoles.has(r)).sort();

  console.log('\n=== Typography Role Coverage ===\n');
  console.log(`Registry roles: ${registry.size}`);
  console.log(`Figma roles (union): ${figmaRoles.size}\n`);

  if (missingInRegistry.length) {
    console.log('Missing in registry (present in Figma, not in app):');
    for (const r of missingInRegistry) console.log(`- ${r}`);
    console.log('');
  } else {
    console.log('Missing in registry: (none)\n');
  }

  if (extraInRegistry.length) {
    console.log('Extra in registry (present in app, not in Figma union):');
    for (const r of extraInRegistry) console.log(`- ${r}`);
    console.log('');
  } else {
    console.log('Extra in registry: (none)\n');
  }
}

main(process.argv);


