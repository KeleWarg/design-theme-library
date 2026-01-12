/**
 * Issue Generator - Chunk 7.14
 *
 * Convert color and font matches into numbered issues with marker positions.
 * Issues are sorted by severity (fail first, then warn) and re-numbered.
 *
 * Each issue contains:
 * - Unique ID and display number
 * - Type (color or font)
 * - Status (pass, warn, fail)
 * - Human-readable message
 * - Marker position for overlay
 * - Bounds for highlighting
 * - Source value and suggestion for fix
 */

import { ColorMatch } from '../matching/colorMatcher';
import { FontMatch } from '../matching/fontMatcher';
import { Issue } from '../../../types/qa';

/**
 * Issue type discriminator
 */
export type IssueType = 'color' | 'font';

/**
 * Issue status levels
 */
export type IssueStatus = 'pass' | 'warn' | 'fail';

/**
 * Sort order for issue statuses (lower = higher priority)
 */
const STATUS_ORDER: Record<IssueStatus, number> = {
  fail: 0,
  warn: 1,
  pass: 2,
};

/**
 * Generate a human-readable message for a color issue
 *
 * @param match - Color match result
 * @returns Issue message string
 */
function generateColorMessage(match: ColorMatch): string {
  if (match.status === 'fail') {
    return `Color ${match.source.hex} not found in design system (ΔE: ${match.deltaE.toFixed(1)})`;
  }
  if (match.status === 'warn' && match.token) {
    return `Color ${match.source.hex} close to ${match.token.path} (ΔE: ${match.deltaE.toFixed(1)})`;
  }
  if (match.token) {
    return `Color ${match.source.hex} matches ${match.token.path}`;
  }
  return `Color ${match.source.hex} detected`;
}

/**
 * Generate a human-readable message for a font issue
 *
 * @param match - Font match result
 * @returns Issue message string
 */
function generateFontMessage(match: FontMatch): string {
  if (match.issues.length > 0) {
    return match.issues.join('; ');
  }
  if (match.token) {
    return `Font matches ${match.token.role}`;
  }
  return `Font ${match.source.fontFamily} ${match.source.fontSize} detected`;
}

/**
 * Convert a color match to an Issue object
 *
 * @param match - Color match result
 * @param number - Issue number for display
 * @returns Issue object
 */
function colorMatchToIssue(match: ColorMatch, number: number): Issue {
  return {
    id: `issue-${number}`,
    number,
    type: 'color',
    status: match.status,
    message: generateColorMessage(match),
    marker: match.source.centroid,
    bounds: match.source.bounds,
    source: {
      value: match.source.hex,
      rgb: match.source.rgb,
    },
    suggestion: match.token
      ? {
          tokenName: match.token.path,
          cssVariable: match.token.cssVariable,
          value: match.token.hex,
        }
      : undefined,
  };
}

/**
 * Convert a font match to an Issue object
 *
 * @param match - Font match result
 * @param number - Issue number for display
 * @returns Issue object
 */
function fontMatchToIssue(match: FontMatch, number: number): Issue {
  return {
    id: `issue-${number}`,
    number,
    type: 'font',
    status: match.status,
    message: generateFontMessage(match),
    marker: match.source.centroid,
    bounds: match.source.bounds,
    source: {
      value: `${match.source.fontFamily} ${match.source.fontSize}`,
    },
    suggestion: match.token
      ? {
          tokenName: match.token.role,
          cssVariable: match.token.cssVariable,
          value: `${match.token.fontFamily} ${match.token.fontSize}`,
        }
      : undefined,
  };
}

/**
 * Generate issues from color and font matches
 *
 * Filters out passing matches (only warn and fail become issues),
 * sorts by severity (fail first), and assigns sequential numbers.
 *
 * @param colorMatches - Array of color match results
 * @param fontMatches - Array of font match results
 * @returns Array of issues sorted by severity and numbered
 */
export function generateIssues(
  colorMatches: ColorMatch[],
  fontMatches: FontMatch[]
): Issue[] {
  const issues: Issue[] = [];
  let tempNumber = 1;

  // Process color matches (fail and warn only)
  for (const match of colorMatches) {
    if (match.status === 'pass') continue;
    issues.push(colorMatchToIssue(match, tempNumber));
    tempNumber++;
  }

  // Process font matches (fail and warn only)
  for (const match of fontMatches) {
    if (match.status === 'pass') continue;
    issues.push(fontMatchToIssue(match, tempNumber));
    tempNumber++;
  }

  // Sort by severity (fail first, then warn)
  issues.sort((a, b) => {
    return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
  });

  // Re-number after sorting
  issues.forEach((issue, index) => {
    issue.number = index + 1;
    issue.id = `issue-${index + 1}`;
  });

  return issues;
}

/**
 * Generate issues including passing matches
 *
 * Same as generateIssues but includes all matches, not just failures.
 * Useful for displaying a complete audit report.
 *
 * @param colorMatches - Array of color match results
 * @param fontMatches - Array of font match results
 * @returns Array of all issues (including passes) sorted by severity
 */
export function generateAllIssues(
  colorMatches: ColorMatch[],
  fontMatches: FontMatch[]
): Issue[] {
  const issues: Issue[] = [];
  let tempNumber = 1;

  // Process all color matches
  for (const match of colorMatches) {
    issues.push(colorMatchToIssue(match, tempNumber));
    tempNumber++;
  }

  // Process all font matches
  for (const match of fontMatches) {
    issues.push(fontMatchToIssue(match, tempNumber));
    tempNumber++;
  }

  // Sort by severity (fail first, then warn, then pass)
  issues.sort((a, b) => {
    return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
  });

  // Re-number after sorting
  issues.forEach((issue, index) => {
    issue.number = index + 1;
    issue.id = `issue-${index + 1}`;
  });

  return issues;
}

/**
 * Calculate statistics for a set of issues
 *
 * @param issues - Array of issues
 * @returns Statistics object with counts and percentages
 */
export function calculateIssueStats(issues: Issue[]): {
  total: number;
  pass: number;
  warn: number;
  fail: number;
  passRate: number;
  failRate: number;
} {
  const total = issues.length;
  const pass = issues.filter((i) => i.status === 'pass').length;
  const warn = issues.filter((i) => i.status === 'warn').length;
  const fail = issues.filter((i) => i.status === 'fail').length;

  return {
    total,
    pass,
    warn,
    fail,
    passRate: total > 0 ? (pass / total) * 100 : 100,
    failRate: total > 0 ? (fail / total) * 100 : 0,
  };
}

/**
 * Filter issues by type
 *
 * @param issues - Array of issues
 * @param type - Issue type to filter by
 * @returns Filtered array of issues
 */
export function filterIssuesByType(issues: Issue[], type: IssueType): Issue[] {
  return issues.filter((issue) => issue.type === type);
}

/**
 * Filter issues by status
 *
 * @param issues - Array of issues
 * @param status - Status to filter by
 * @returns Filtered array of issues
 */
export function filterIssuesByStatus(
  issues: Issue[],
  status: IssueStatus
): Issue[] {
  return issues.filter((issue) => issue.status === status);
}

/**
 * Get issues that need attention (fail or warn)
 *
 * @param issues - Array of issues
 * @returns Issues that are not passing
 */
export function getActionableIssues(issues: Issue[]): Issue[] {
  return issues.filter((issue) => issue.status !== 'pass');
}

export default {
  generateIssues,
  generateAllIssues,
  calculateIssueStats,
  filterIssuesByType,
  filterIssuesByStatus,
  getActionableIssues,
};
