/**
 * Fix Generator - Chunk 7.16
 *
 * Generate CSS fix suggestions for each issue.
 * Maps issues to concrete code changes with selectors and CSS variables.
 *
 * Features:
 * - Generates CSS fixes for color issues (background-color, color)
 * - Generates CSS fixes for font issues (font-family, font-size, font-weight)
 * - Links fixes to DOM selectors when available
 * - Produces copy-pasteable CSS code snippets
 */

import { Issue, DOMElement } from '../../../types/qa';

/**
 * Represents a CSS fix for an issue
 */
export interface Fix {
  /** Reference to the issue this fix addresses */
  issueId: string;
  /** CSS selector for the element (if DOM data available) */
  selector?: string;
  /** CSS property to modify */
  property: string;
  /** Original value that should be replaced */
  oldValue: string;
  /** New value (CSS variable) to use */
  newValue: string;
  /** Complete CSS code snippet for copy-paste */
  cssCode: string;
}

/**
 * Determine the CSS property based on issue type and context
 *
 * @param issue - The issue to generate property for
 * @param domElement - Optional DOM element for context
 * @returns CSS property name
 */
function determineProperty(issue: Issue, domElement?: DOMElement): string {
  if (issue.type === 'font') {
    return 'font';
  }

  // For color issues, check if it's a background or text color
  if (domElement) {
    const bgColor = domElement.styles.backgroundColor;
    const textColor = domElement.styles.color;

    // Check if the issue color matches the background color more closely
    if (bgColor && issueMatchesColor(issue, bgColor)) {
      return 'background-color';
    }
    if (textColor && issueMatchesColor(issue, textColor)) {
      return 'color';
    }
  }

  // Default to background-color for color issues
  return 'background-color';
}

/**
 * Check if an issue's source value matches a CSS color string
 *
 * @param issue - The issue to check
 * @param cssColor - CSS color string (e.g., "rgb(255, 0, 0)" or "#ff0000")
 * @returns True if colors match
 */
function issueMatchesColor(issue: Issue, cssColor: string): boolean {
  const issueHex = issue.source.value.toLowerCase();

  // Handle hex colors
  if (cssColor.startsWith('#')) {
    return cssColor.toLowerCase() === issueHex;
  }

  // Handle rgb/rgba colors
  const rgbMatch = cssColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    const hex =
      '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
    return hex.toLowerCase() === issueHex;
  }

  return false;
}

/**
 * Find the DOM element that corresponds to an issue's location
 *
 * @param issue - The issue to find element for
 * @param domElements - Array of DOM elements from capture
 * @returns Matching DOM element or undefined
 */
function findSelector(issue: Issue, domElements?: DOMElement[]): string | undefined {
  if (!domElements || domElements.length === 0) {
    return undefined;
  }

  // Find element at issue bounds (exact match)
  const exactMatch = domElements.find(
    (e) =>
      e.bounds.x === issue.bounds.x &&
      e.bounds.y === issue.bounds.y &&
      e.bounds.width === issue.bounds.width &&
      e.bounds.height === issue.bounds.height
  );

  if (exactMatch) {
    return exactMatch.selector;
  }

  // Find element containing the issue marker point
  const containingElement = domElements.find(
    (e) =>
      issue.marker.x >= e.bounds.x &&
      issue.marker.x <= e.bounds.x + e.bounds.width &&
      issue.marker.y >= e.bounds.y &&
      issue.marker.y <= e.bounds.y + e.bounds.height
  );

  if (containingElement) {
    return containingElement.selector;
  }

  // Fall back to closest element by bounds
  let closest: DOMElement | undefined;
  let closestDistance = Infinity;

  for (const el of domElements) {
    const dx = Math.abs(el.bounds.x - issue.bounds.x);
    const dy = Math.abs(el.bounds.y - issue.bounds.y);
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < closestDistance) {
      closestDistance = distance;
      closest = el;
    }
  }

  return closest?.selector;
}

/**
 * Find the DOM element object for an issue
 *
 * @param issue - The issue to find element for
 * @param domElements - Array of DOM elements
 * @returns Matching DOM element or undefined
 */
function findDOMElement(
  issue: Issue,
  domElements?: DOMElement[]
): DOMElement | undefined {
  if (!domElements || domElements.length === 0) {
    return undefined;
  }

  const selector = findSelector(issue, domElements);
  if (!selector) {
    return undefined;
  }

  return domElements.find((e) => e.selector === selector);
}

/**
 * Generate CSS code snippet for a fix
 *
 * @param selector - CSS selector (optional)
 * @param property - CSS property
 * @param newValue - New CSS value (variable)
 * @returns Formatted CSS code string
 */
function generateCSSCode(
  selector: string | undefined,
  property: string,
  newValue: string
): string {
  if (selector) {
    return `${selector} {\n  ${property}: ${newValue};\n}`;
  }

  return `/* Use: ${newValue} */`;
}

/**
 * Generate fixes for issues that have suggestions
 *
 * Only generates fixes for issues with suggestion.cssVariable.
 * Links to DOM selectors when available for more precise fixes.
 *
 * @param issues - Array of issues to generate fixes for
 * @param domElements - Optional array of DOM elements for selector lookup
 * @returns Array of Fix objects
 */
export function generateFixes(issues: Issue[], domElements?: DOMElement[]): Fix[] {
  return issues
    .filter((issue) => issue.suggestion && issue.suggestion.cssVariable)
    .map((issue) => {
      const selector = findSelector(issue, domElements);
      const domElement = findDOMElement(issue, domElements);
      const property = determineProperty(issue, domElement);
      const newValue = issue.suggestion!.cssVariable;

      return {
        issueId: issue.id,
        selector,
        property,
        oldValue: issue.source.value,
        newValue,
        cssCode: generateCSSCode(selector, property, newValue),
      };
    });
}

/**
 * Generate a consolidated CSS fix for multiple issues with the same selector
 *
 * Groups fixes by selector and combines them into single CSS blocks.
 *
 * @param fixes - Array of fixes to consolidate
 * @returns Consolidated CSS string
 */
export function consolidateFixes(fixes: Fix[]): string {
  // Group fixes by selector
  const grouped = new Map<string, Fix[]>();

  for (const fix of fixes) {
    const key = fix.selector || '__no_selector__';
    const existing = grouped.get(key) || [];
    existing.push(fix);
    grouped.set(key, existing);
  }

  const cssBlocks: string[] = [];

  for (const [selector, selectorFixes] of grouped) {
    if (selector === '__no_selector__') {
      // No selector, output as comments
      for (const fix of selectorFixes) {
        cssBlocks.push(`/* Issue ${fix.issueId}: Use ${fix.newValue} for ${fix.property} */`);
      }
    } else {
      // Combine all properties for this selector
      const properties = selectorFixes
        .map((f) => `  ${f.property}: ${f.newValue};`)
        .join('\n');
      cssBlocks.push(`${selector} {\n${properties}\n}`);
    }
  }

  return cssBlocks.join('\n\n');
}

/**
 * Generate a fix summary report
 *
 * @param fixes - Array of fixes
 * @returns Summary object
 */
export function summarizeFixes(fixes: Fix[]): {
  total: number;
  withSelector: number;
  withoutSelector: number;
  byProperty: Record<string, number>;
} {
  const byProperty: Record<string, number> = {};

  for (const fix of fixes) {
    byProperty[fix.property] = (byProperty[fix.property] || 0) + 1;
  }

  return {
    total: fixes.length,
    withSelector: fixes.filter((f) => f.selector).length,
    withoutSelector: fixes.filter((f) => !f.selector).length,
    byProperty,
  };
}

export default {
  generateFixes,
  consolidateFixes,
  summarizeFixes,
};
