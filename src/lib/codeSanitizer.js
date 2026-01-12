/**
 * @chunk 3.11 - Code Sanitizer
 *
 * Utilities to sanitize/generated code so it can be evaluated by the in-browser
 * renderer (which does not transpile TypeScript).
 */

/**
 * Best-effort TypeScript stripping for runtime-evaluated component code.
 * This is intentionally conservative: it targets the most common TS constructs
 * produced by the AI (interfaces/types and simple annotations) and avoids
 * trying to fully parse JS/TS.
 *
 * @param {string} code
 * @returns {string}
 */
export function stripTypeScriptForRenderer(code) {
  if (!code || typeof code !== 'string') return '';

  let out = code;

  // Remove common prop interfaces/types (non-greedy within the block).
  // Example:
  // interface FooProps { ... }
  // type FooProps = { ... }
  out = out.replace(
    /^\s*(?:export\s+)?(?:interface|type)\s+\w+Props\s*(?:=\s*)?\{[\s\S]*?\}\s*;?\s*$/gm,
    ''
  );

  // Remove "as const" assertions
  out = out.replace(/\s+as\s+const\b/g, '');

  // Remove return type annotations: "): Something" / "): React.ReactElement"
  out = out.replace(/\)\s*:\s*[A-Za-z0-9_.<>,\s\[\]]+\s*\{/g, ') {');

  // Remove variable type annotations: "const x: Foo ="
  out = out.replace(/\b(const|let|var)\s+(\w+)\s*:\s*[^=;\n]+=/g, '$1 $2 =');

  // Remove parameter type annotations: "(x: string, y: number)" → "(x, y)"
  // This is intentionally scoped to patterns that end before ",", ")", or "="
  // so we don't accidentally modify object literals like "gap: var(--space-sm)".
  out = out.replace(/(\b\w+\b)\s*:\s*[A-Za-z0-9_.<>,\s\[\]]+(?=\s*[,)=])/g, '$1');

  // Remove destructured param type annotations: "({ a, b }: FooProps)" → "({ a, b })"
  out = out.replace(/\(\s*\{([\s\S]*?)\}\s*:\s*\w+Props\s*\)/g, '({$1})');

  // Fix common AI mistake: using CSS var() inside template placeholders like `${var(--space-sm)}`
  // Convert to literal text inside the template string: `var(--space-sm)`
  out = out.replace(/\$\{\s*var\(\s*(--[^)]+)\s*\)\s*\}/g, 'var($1)');

  // Fix another common mistake: using CSS var() as if it were JS. Example: `gap: var(--space-sm)`
  // Convert property value to a string: `gap: 'var(--space-sm)'`
  out = out.replace(/(:\s*)var\(\s*(--[^)]+)\s*\)/g, "$1'var($2)'");

  // Also fix var() used inside expressions (ternaries, assignments, function args), e.g.:
  // `disabled ? var(--color-muted) : var(--color-primary)` → `disabled ? 'var(--color-muted)' : 'var(--color-primary)'`
  out = out.replace(/([?:=,(]\s*)var\(\s*(--[^)]+)\s*\)/g, "$1'var($2)'");

  // Clean up excessive blank lines introduced by removals
  out = out
    .split('\n')
    .filter((line, idx, arr) => {
      // Keep single blank lines, collapse runs of blanks
      const isBlank = line.trim() === '';
      const prevBlank = idx > 0 && arr[idx - 1].trim() === '';
      return !(isBlank && prevBlank);
    })
    .join('\n')
    .trim();

  return out;
}

/**
 * Convert ESM-style default exports into an evaluable assignment for the in-browser renderer.
 * @param {string} code
 * @returns {string} code that assigns the default export to `__defaultExport`
 */
export function prepareComponentCodeForEval(code) {
  const src = stripTypeScriptForRenderer(code);
  let out = src;

  // Named default export function: export default function Name(...) { ... }
  const namedFn = out.match(/export\s+default\s+function\s+(\w+)\s*\(/);
  if (namedFn) {
    const name = namedFn[1];
    out = out.replace(/export\s+default\s+function\s+(\w+)\s*\(/, 'function $1(');
    out += `\n\n__defaultExport = ${name};\n`;
    return out;
  }

  // Anonymous default export function: export default function (...) { ... }
  if (/export\s+default\s+function\s*\(/.test(out)) {
    out = out.replace(/export\s+default\s+function\b/, '__defaultExport = function');
    return out;
  }

  // Default export identifier: export default Name;
  const ident = out.match(/export\s+default\s+(\w+)\s*;?/);
  if (ident) {
    out = out.replace(/export\s+default\s+(\w+)\s*;?/, '__defaultExport = $1;');
    return out;
  }

  // Fallback: replace first "export default" with assignment
  if (/export\s+default\b/.test(out)) {
    out = out.replace(/export\s+default\s+/, '__defaultExport = ');
    return out;
  }

  // No export default found; try to infer a component symbol name and export it.
  const inferred = out.match(/(?:function|const)\s+(\w+)/);
  if (inferred) {
    out += `\n\n__defaultExport = ${inferred[1]};\n`;
  }

  return out;
}


