/**
 * @chunk 3.00 - Component Categories
 *
 * Single source of truth for component category values/labels.
 * Keep this in sync with any UX copy changes and with DB usage.
 */

/**
 * Canonical component categories (no "all" option here).
 * Note: we intentionally keep both `modals` and `overlay` for now to avoid
 * breaking existing data and to eliminate UI→service validation mismatches.
 */
export const COMPONENT_CATEGORIES = [
  { value: 'buttons', label: 'Buttons' },
  { value: 'forms', label: 'Forms' },
  { value: 'cards', label: 'Cards' },
  { value: 'modals', label: 'Modals' },
  { value: 'navigation', label: 'Navigation' },
  { value: 'data-display', label: 'Data Display' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'layout', label: 'Layout' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'other', label: 'Other' },
];

/**
 * Values only (for validation).
 */
export const COMPONENT_CATEGORY_VALUES = COMPONENT_CATEGORIES.map((c) => c.value);

/**
 * Options for filters that include an "All Categories" entry.
 */
export const COMPONENT_CATEGORY_OPTIONS_ALL = [
  { value: 'all', label: 'All Categories' },
  ...COMPONENT_CATEGORIES,
];



