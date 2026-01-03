/**
 * @chunk 2.26 - ThemePreview Panel
 * 
 * Segmented control for selecting between mutually exclusive options.
 * Used for viewport size selection in ThemePreview.
 */

import { cn } from '../../lib/utils';

/**
 * Segmented Control Component
 * 
 * @param {Object} props
 * @param {string} props.value - Currently selected value
 * @param {function} props.onChange - Called with new value on selection
 * @param {Array} props.options - Array of { value, label, icon? }
 * @param {'sm' | 'md' | 'lg'} [props.size='md'] - Control size
 * @param {boolean} [props.disabled] - Whether control is disabled
 * @param {string} [props.className] - Additional class names
 */
export default function SegmentedControl({
  value,
  onChange,
  options,
  size = 'md',
  disabled = false,
  className,
}) {
  return (
    <div 
      className={cn('segmented-control', `segmented-control-${size}`, { disabled }, className)}
      role="radiogroup"
    >
      {options.map((option) => {
        const Icon = option.icon;
        const isSelected = value === option.value;
        
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            className={cn('segmented-option', { selected: isSelected })}
            onClick={() => !disabled && onChange(option.value)}
            disabled={disabled}
            title={option.label}
          >
            {Icon && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />}
            {option.showLabel !== false && !Icon && (
              <span className="segmented-label">{option.label}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

