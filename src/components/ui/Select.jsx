/**
 * @chunk 2.09 - MappingStep
 * 
 * Select dropdown component with customizable options.
 */

import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(function Select({
  label,
  error,
  id,
  options = [],
  value,
  onChange,
  placeholder = 'Select...',
  size = 'default', // 'sm' | 'default' | 'lg'
  className = '',
  disabled = false,
  ...props
}, ref) {
  const selectId = id || `select-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  const sizeClasses = {
    sm: 'form-select--sm',
    default: '',
    lg: 'form-select--lg'
  };

  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className={`form-field ${className}`}>
      {label && (
        <label htmlFor={selectId} className="form-label">
          {label}
          {props.required && <span className="form-required">*</span>}
        </label>
      )}
      <div className="form-select-wrapper">
        <select
          ref={ref}
          id={selectId}
          className={`form-select ${sizeClasses[size]} ${error ? 'form-select-error' : ''}`}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="form-select-icon" size={16} />
      </div>
      {error && <span className="form-error">{error}</span>}
    </div>
  );
});

export default Select;


