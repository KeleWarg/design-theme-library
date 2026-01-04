/**
 * @chunk 2.03 - CreateThemeModal
 * 
 * Form input component with label and validation support.
 */

import { forwardRef } from 'react';

const Input = forwardRef(function Input({
  label,
  error,
  id,
  className = '',
  ...props
}, ref) {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={`form-field ${className}`}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {props.required && <span className="form-required">*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`form-input ${error ? 'form-input-error' : ''}`}
        {...props}
      />
      {error && <span className="form-error">{error}</span>}
    </div>
  );
});

export default Input;


