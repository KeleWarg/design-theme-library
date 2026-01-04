/**
 * @chunk 3.13 - PreviewTab
 * 
 * Checkbox component for form controls.
 */

import { forwardRef } from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

const Checkbox = forwardRef(function Checkbox({
  checked = false,
  onChange,
  label,
  disabled = false,
  className = '',
  ...props
}, ref) {
  return (
    <label className={cn('checkbox-wrapper', { disabled }, className)}>
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        disabled={disabled}
        className="checkbox-input"
        {...props}
      />
      <div className="checkbox-indicator">
        {checked && <Check size={14} strokeWidth={3} />}
      </div>
      {label && <span className="checkbox-label">{label}</span>}
      <style>{`
        .checkbox-wrapper {
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-sm, 8px);
          cursor: pointer;
          user-select: none;
        }

        .checkbox-wrapper.disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .checkbox-input {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        .checkbox-indicator {
          width: 18px;
          height: 18px;
          border-radius: var(--radius-sm, 4px);
          border: ${checked ? 'none' : '2px solid var(--color-border, #d1d5db)'};
          background-color: ${checked ? 'var(--color-primary, #3b82f6)' : 'var(--color-background, #ffffff)'};
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
          flex-shrink: 0;
          color: ${checked ? 'var(--color-primary-foreground, #ffffff)' : 'transparent'};
        }

        .checkbox-wrapper:hover:not(.disabled) .checkbox-indicator {
          border-color: ${checked ? 'var(--color-primary, #3b82f6)' : 'var(--color-border-hover, #9ca3af)'};
        }

        .checkbox-wrapper.disabled .checkbox-indicator {
          opacity: 0.5;
        }

        .checkbox-label {
          font-size: var(--font-size-sm, 14px);
          color: var(--color-foreground, #1a1a1a);
        }
      `}</style>
    </label>
  );
});

export default Checkbox;





