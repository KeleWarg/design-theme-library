/**
 * @chunk 2.03 - CreateThemeModal
 * 
 * Form textarea component with label and character count support.
 */

import { forwardRef } from 'react';

const Textarea = forwardRef(function Textarea({
  label,
  error,
  id,
  className = '',
  maxLength,
  value,
  showCount = false,
  ...props
}, ref) {
  const textareaId = id || `textarea-${label?.toLowerCase().replace(/\s+/g, '-')}`;
  const charCount = value?.length || 0;

  return (
    <div className={`form-field ${className}`}>
      {label && (
        <label htmlFor={textareaId} className="form-label">
          {label}
          {props.required && <span className="form-required">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        className={`form-textarea ${error ? 'form-textarea-error' : ''}`}
        maxLength={maxLength}
        value={value}
        {...props}
      />
      <div className="form-textarea-footer">
        {error && <span className="form-error">{error}</span>}
        {maxLength && (showCount || charCount > maxLength * 0.8) && (
          <span className={`form-char-count ${charCount >= maxLength ? 'form-char-count-max' : ''}`}>
            {charCount}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
});

export default Textarea;


