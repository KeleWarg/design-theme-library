/**
 * @chunk 3.15 - Prop Generator (Hybrid A+B)
 *
 * Hybrid prop generation:
 * - Option A: category-based templates (design-system conventions)
 * - Option B: code-based inference (detect prop names from component code)
 * - Merge: preserve existing user edits (never overwrite existing prop definitions)
 */

const RESERVED = new Set(['props', 'children', 'className', 'style', 'ref', 'key']);

const COMMON_ENUMS = {
  size: ['xs', 'sm', 'md', 'lg', 'xl'],
  variant: ['primary', 'secondary', 'tertiary', 'ghost', 'link'],
  tone: ['neutral', 'brand', 'success', 'warning', 'danger'],
  align: ['left', 'center', 'right'],
  intent: ['default', 'info', 'success', 'warning', 'danger'],
  iconPosition: ['left', 'right'],
};

function uniq(arr) {
  return [...new Set((arr || []).filter(Boolean))];
}

function normalizeName(name) {
  return String(name || '').trim();
}

function guessType(name) {
  const n = name.toLowerCase();

  if (name === 'children') return 'ReactNode';
  if (n.includes('icon')) return 'icon';
  if (n === 'classname') return 'string';

  if (
    n === 'disabled' ||
    n === 'loading' ||
    n === 'checked' ||
    n === 'open' ||
    n.startsWith('is') ||
    n.startsWith('has') ||
    n.startsWith('can') ||
    n.startsWith('should')
  ) {
    return 'boolean';
  }

  if (COMMON_ENUMS[n]) return 'enum';

  if (
    n.includes('width') ||
    n.includes('height') ||
    n.includes('count') ||
    n.includes('max') ||
    n.includes('min')
  ) {
    return 'number';
  }

  return 'string';
}

function defaultForType(type) {
  if (type === 'boolean') return 'false';
  return '';
}

function optionsForName(name) {
  const n = name.toLowerCase();
  return COMMON_ENUMS[n] || [];
}

function templatePropsForCategory(category) {
  const c = (category || '').toLowerCase();

  // Baseline template (scales across components)
  const base = [
    {
      name: 'children',
      type: 'ReactNode',
      default: '',
      required: false,
      description: 'Content rendered inside the component',
      options: [],
    },
    {
      name: 'className',
      type: 'string',
      default: '',
      required: false,
      description: 'Additional CSS class names',
      options: [],
    },
  ];

  if (c.includes('button')) {
    return [
      ...base,
      {
        name: 'variant',
        type: 'enum',
        default: 'primary',
        required: false,
        description: 'Visual style variant',
        options: COMMON_ENUMS.variant,
      },
      {
        name: 'size',
        type: 'enum',
        default: 'md',
        required: false,
        description: 'Size of the component',
        options: ['sm', 'md', 'lg'],
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        required: false,
        description: 'Disable interaction',
        options: [],
      },
      {
        name: 'loading',
        type: 'boolean',
        default: 'false',
        required: false,
        description: 'Show loading state',
        options: [],
      },
      {
        name: 'icon',
        type: 'icon',
        default: '',
        required: false,
        description: 'Optional icon from icon library',
        options: [],
      },
      {
        name: 'iconPosition',
        type: 'enum',
        default: 'left',
        required: false,
        description: 'Where to place the icon',
        options: COMMON_ENUMS.iconPosition,
      },
    ];
  }

  if (c.includes('form') || c.includes('input')) {
    return [
      ...base,
      {
        name: 'label',
        type: 'string',
        default: '',
        required: false,
        description: 'Field label',
        options: [],
      },
      {
        name: 'placeholder',
        type: 'string',
        default: '',
        required: false,
        description: 'Placeholder text',
        options: [],
      },
      {
        name: 'value',
        type: 'string',
        default: '',
        required: false,
        description: 'Controlled value',
        options: [],
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        required: false,
        description: 'Disable interaction',
        options: [],
      },
      {
        name: 'error',
        type: 'string',
        default: '',
        required: false,
        description: 'Error message to display',
        options: [],
      },
    ];
  }

  return base;
}

export function detectPropNamesFromCode(code) {
  const src = String(code || '');
  const found = [];

  // 1) Destructured params: ({ a, b, c = 1 })
  // Covers: function X({a,b}) {} and const X = ({a,b}) => {}
  const destructuredMatches = src.matchAll(/\(\s*\{\s*([^}]+)\}\s*\)/g);
  for (const m of destructuredMatches) {
    const inside = m[1] || '';
    const names = inside
      .split(',')
      .map((s) => s.trim())
      .map((s) => s.replace(/=.*$/, '').trim()) // drop defaults
      .map((s) => s.replace(/:.+$/, '').trim()) // drop aliases: a: alias
      .filter(Boolean);

    found.push(...names);
  }

  // 2) props.foo
  const dotMatches = src.matchAll(/\bprops\.([a-zA-Z_$][\w$]*)\b/g);
  for (const m of dotMatches) found.push(m[1]);

  // 3) props['foo'] or props["foo"]
  const bracketMatches = src.matchAll(/\bprops\[\s*['"]([^'"]+)['"]\s*\]/g);
  for (const m of bracketMatches) found.push(m[1]);

  return uniq(found)
    .map(normalizeName)
    .filter((n) => n && !RESERVED.has(n));
}

function mergePropsPreserveEdits(existingProps, generatedProps) {
  const existing = Array.isArray(existingProps) ? existingProps : [];
  const gen = Array.isArray(generatedProps) ? generatedProps : [];

  const byName = new Map(existing.map((p) => [p.name, p]));

  // Only add missing props. Never overwrite existing definitions.
  for (const p of gen) {
    if (!p?.name) continue;
    if (!byName.has(p.name)) byName.set(p.name, p);
  }

  // keep original order, append new ones at end
  const existingNames = existing.map((p) => p.name);
  const added = [...byName.keys()].filter((n) => !existingNames.includes(n));
  return [...existing, ...added.map((n) => byName.get(n))];
}

/**
 * Hybrid generator:
 * - starts with category template (A)
 * - adds inferred prop names from code (B)
 * - merges without overwriting user edits
 */
export function generatePropsForComponent({ category, code, existingProps }) {
  const template = templatePropsForCategory(category);
  const detectedNames = detectPropNamesFromCode(code);

  const inferred = detectedNames.map((name) => {
    const type = guessType(name);
    return {
      name,
      type,
      default: defaultForType(type),
      required: false,
      description: '',
      options: type === 'enum' ? optionsForName(name) : [],
    };
  });

  const merged = mergePropsPreserveEdits(existingProps, [...template, ...inferred]);

  return {
    props: merged,
    report: {
      templateCount: template.length,
      detectedCount: detectedNames.length,
      addedCount: merged.length - (Array.isArray(existingProps) ? existingProps.length : 0),
      detectedNames,
    },
  };
}


