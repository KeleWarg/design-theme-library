/**
 * @chunk 2.05 - ThemeSelector
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

export default { cn };

