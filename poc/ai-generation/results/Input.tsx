import React, { forwardRef, useState } from 'react';

/**
 * Props for the Input component
 */
interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Label text for the input */
  label?: string;
  /** Helper text displayed below the input */
  helperText?: string;
  /** Error message to display when input is in error state */
  error?: string;
  /** Icon to display on the left side of the input */
  leftIcon?: React.ReactNode;
  /** Icon to display on the right side of the input */
  rightIcon?: React.ReactNode;
  /** Size variant of the input */
  size?: 'sm' | 'md' | 'lg';
  /** Whether the input is in an error state */
  hasError?: boolean;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Whether the input is required */
  required?: boolean;
}

/**
 * A flexible text input component with label, icons, and error states
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  helperText,
  error,
  leftIcon,
  rightIcon,
  size = 'md',
  hasError = false,
  disabled = false,
  required = false,
  className = '',
  id,
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false);
  const isError = hasError || !!error;
  
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const sizeStyles = {
    sm: {
      height: 'var(--space-8)',
      fontSize: 'var(--font-size-sm)',
      padding: '0 var(--space-3)',
    },
    md: {
      height: 'var(--space-10)',
      fontSize: 'var(--font-size-base)',
      padding: '0 var(--space-4)',
    },
    lg: {
      height: 'var(--space-12)',
      fontSize: 'var(--font-size-lg)',
      padding: '0 var(--space-5)',
    },
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-1)',
    width: '100%',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-medium)',
    color: disabled ? 'var(--color-text-disabled)' : 'var(--color-text-primary)',
    fontFamily: 'var(--font-family-sans)',
    lineHeight: 'var(--line-height-normal)',
  };

  const inputWrapperStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: sizeStyles[size].height,
    fontSize: sizeStyles[size].fontSize,
    fontFamily: 'var(--font-family-sans)',
    lineHeight: 'var(--line-height-normal)',
    padding: sizeStyles[size].padding,
    paddingLeft: leftIcon ? 'var(--space-10)' : sizeStyles[size].padding.split(' ')[1],
    paddingRight: rightIcon ? 'var(--space-10)' : sizeStyles[size].padding.split(' ')[1],
    border: `1px solid ${
      isError 
        ? 'var(--color-error)' 
        : focused 
          ? 'var(--color-primary-500)' 
          : 'var(--color-border-default)'
    }`,
    borderRadius: 'var(--radius-md)',
    backgroundColor: disabled ? 'var(--color-bg-muted)' : 'var(--color-bg-default)',
    color: disabled ? 'var(--color-text-disabled)' : 'var(--color-text-primary)',
    outline: 'none',
    transition: 'var(--transition-fast)',
    boxShadow: focused && !isError ? `0 0 0 2px var(--color-primary-100)` : 'none',
  };

  const iconStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    color: disabled ? 'var(--color-text-disabled)' : 'var(--color-text-secondary)',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'var(--space-4)',
    height: 'var(--space-4)',
  };

  const leftIconStyle: React.CSSProperties = {
    ...iconStyle,
    left: 'var(--space-3)',
  };

  const rightIconStyle: React.CSSProperties = {
    ...iconStyle,
    right: 'var(--space-3)',
  };

  const messageStyle: React.CSSProperties = {
    fontSize: 'var(--font-size-sm)',
    fontFamily: 'var(--font-family-sans)',
    lineHeight: 'var(--line-height-normal)',
    color: isError ? 'var(--color-error)' : 'var(--color-text-secondary)',
    marginTop: 'var(--space-1)',
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(false);
    props.onBlur?.(e);
  };

  return (
    <div style={containerStyle} className={className}>
      {label && (
        <label htmlFor={inputId} style={labelStyle}>
          {label}
          {required && (
            <span style={{ color: 'var(--color-error)', marginLeft: 'var(--space-1)' }}>
              *
            </span>
          )}
        </label>
      )}
      
      <div style={inputWrapperStyle}>
        {leftIcon && (
          <div style={leftIconStyle} aria-hidden="true">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          style={inputStyle}
          disabled={disabled}
          required={required}
          aria-invalid={isError}
          aria-describedby={
            error || helperText ? `${inputId}-message` : undefined
          }
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        
        {rightIcon && (
          <div style={rightIconStyle} aria-hidden="true">
            {rightIcon}
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <div id={`${inputId}-message`} style={messageStyle} role={isError ? 'alert' : undefined}>
          {error || helperText}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';