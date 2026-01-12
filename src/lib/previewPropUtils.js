/**
 * @chunk 3.13 - Preview Prop Utils
 *
 * Utilities for making Preview tab interactions coherent:
 * - Coerce prop values based on prop definitions (boolean/number/etc)
 * - Compute a simple diagnostics report about which props are referenced by code
 */

const DEFAULT_IGNORED_PROP_NAMES = new Set(['children', 'className', 'style', 'ref', 'key']);

function isBooleanString(v) {
  return v === 'true' || v === 'false';
}

function coerceBoolean(v) {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string' && isBooleanString(v)) return v === 'true';
  return Boolean(v);
}

function coerceNumber(v) {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const trimmed = v.trim();
    if (trimmed === '') return undefined;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

/**
 * Coerce a single prop value based on prop definition
 * @param {Object} propDef
 * @param {any} value
 * @returns {any}
 */
export function coercePropValue(propDef, value) {
  const type = propDef?.type;

  if (type === 'boolean') return coerceBoolean(value);
  if (type === 'number') return coerceNumber(value);

  // Treat legacy 'node' same as ReactNode in preview
  if (type === 'ReactNode' || type === 'node') return value ?? '';

  // enum/icon/string: keep as string-ish
  return value ?? '';
}

/**
 * Coerce an object of prop values based on prop definitions
 * @param {Array} propDefs
 * @param {Object} values
 * @returns {Object}
 */
export function coercePropValues(propDefs, values) {
  const defs = Array.isArray(propDefs) ? propDefs : [];
  const src = values && typeof values === 'object' ? values : {};

  const coerced = { ...src };

  for (const def of defs) {
    if (!def?.name) continue;
    coerced[def.name] = coercePropValue(def, src[def.name]);
  }

  return coerced;
}

/**
 * Compute a simple preview diagnostics report.
 * @param {Object} params
 * @param {Array} params.propDefs
 * @param {Set<string>} params.usedPropNames
 * @param {string} params.code
 * @returns {Object}
 */
export function computePreviewPropDiagnostics({ propDefs, usedPropNames, code }) {
  const defs = Array.isArray(propDefs) ? propDefs : [];
  const used = usedPropNames instanceof Set ? usedPropNames : new Set();
  const src = String(code || '');

  // If code spreads props/rest into JSX, we can't be confident about usage of many props.
  const hasPropsSpread =
    /\{\s*\.\.\.(props|rest)\s*\}/.test(src) ||
    /\.\.\.(props|rest)\b/.test(src);

  const unused = defs
    .filter((d) => d?.name)
    .filter((d) => !DEFAULT_IGNORED_PROP_NAMES.has(d.name))
    .filter((d) => !used.has(d.name))
    .map((d) => d.name);

  return {
    hasPropsSpread,
    unusedPropNames: unused,
  };
}


