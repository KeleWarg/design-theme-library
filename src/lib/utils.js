/**
 * @chunk 2.05 - ThemeSelector
 * @chunk 4.06 - FigmaImportPage
 * 
 * Utility functions for the design system admin.
 */

/**
 * Combine class names conditionally (clsx/classnames alternative)
 * @param  {...any} inputs - Class names or conditional objects
 * @returns {string} - Combined class names
 * 
 * @example
 * cn('base', { active: true, disabled: false }) // => 'base active'
 * cn('foo', 'bar', null, undefined) // => 'foo bar'
 */
export function cn(...inputs) {
  const classes = [];
  
  for (const input of inputs) {
    if (!input) continue;
    
    if (typeof input === 'string') {
      classes.push(input);
    } else if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) {
          classes.push(key);
        }
      }
    }
  }
  
  return classes.join(' ');
}

/**
 * Format a date for display
 * @param {string|Date} date - Date string or Date object
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date string
 * 
 * @example
 * formatDate('2024-01-15T10:30:00Z') // => 'Jan 15, 2024, 10:30 AM'
 * formatDate(new Date(), { dateStyle: 'short' }) // => '1/15/24'
 */
export function formatDate(date, options = {}) {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    ...options
  };
  
  return new Intl.DateTimeFormat('en-US', defaultOptions).format(dateObj);
}

export default { cn, formatDate };
