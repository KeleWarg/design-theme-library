import React from 'react';

interface ButtonProps {
  /** The button content */
  children: React.ReactNode;
  /** Button variant style */
  variant?: 'primary' | 'secondary' | 'outline';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether the button is in loading state */
  loading?: boolean;
  /** Click event handler */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Button type attribute */
  type?: 'button' | 'submit' | 'reset';
  /** Additional CSS class name */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  style = {},
}) => {
  const getVariantStyles = () => {
    const baseStyles = {
      border: '1px solid transparent',
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      transition: 'var(--transition-normal)',
      fontFamily: 'var(--font-family-sans)',
      fontWeight: 'var(--font-weight-medium)',
      borderRadius: 'var(--radius-md)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--space-2)',
      opacity: disabled ? 0.6 : 1,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyles,
          backgroundColor: loading ? 'var(--color-primary-400)' : 'var(--color-primary-500)',
          color: 'var(--color-text-inverse)',
          borderColor: loading ? 'var(--color-primary-400)' : 'var(--color-primary-500)',
          ':hover': !disabled && !loading ? {
            backgroundColor: 'var(--color-primary-600)',
            borderColor: 'var(--color-primary-600)',
          } : {},
        };
      case 'secondary':
        return {
          ...baseStyles,
          backgroundColor: loading ? 'var(--color-secondary-400)' : 'var(--color-secondary-500)',
          color: 'var(--color-text-inverse)',
          borderColor: loading ? 'var(--color-secondary-400)' : 'var(--color-secondary-500)',
          ':hover': !disabled && !loading ? {
            backgroundColor: 'var(--color-secondary-700)',
            borderColor: 'var(--color-secondary-700)',
          } : {},
        };
      case 'outline':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          color: 'var(--color-primary-500)',
          borderColor: 'var(--color-primary-500)',
          ':hover': !disabled && !loading ? {
            backgroundColor: 'var(--color-primary-50)',
            borderColor: 'var(--color-primary-600)',
            color: 'var(--color-primary-600)',
          } : {},
        };
      default:
        return baseStyles;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          padding: 'var(--space-2) var(--space-3)',
          fontSize: 'var(--font-size-sm)',
          lineHeight: 'var(--line-height-tight)',
          minHeight: '32px',
        };
      case 'md':
        return {
          padding: 'var(--space-3) var(--space-4)',
          fontSize: 'var(--font-size-base)',
          lineHeight: 'var(--line-height-normal)',
          minHeight: '40px',
        };
      case 'lg':
        return {
          padding: 'var(--space-4) var(--space-6)',
          fontSize: 'var(--font-size-lg)',
          lineHeight: 'var(--line-height-normal)',
          minHeight: '48px',
        };
      default:
        return {};
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  const handleMouseEnter = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    
    const button = event.currentTarget;
    const variantStyles = getVariantStyles();
    
    if (variant === 'primary') {
      button.style.backgroundColor = 'var(--color-primary-600)';
      button.style.borderColor = 'var(--color-primary-600)';
    } else if (variant === 'secondary') {
      button.style.backgroundColor = 'var(--color-secondary-700)';
      button.style.borderColor = 'var(--color-secondary-700)';
    } else if (variant === 'outline') {
      button.style.backgroundColor = 'var(--color-primary-50)';
      button.style.borderColor = 'var(--color-primary-600)';
      button.style.color = 'var(--color-primary-600)';
    }
  };

  const handleMouseLeave = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    
    const button = event.currentTarget;
    
    if (variant === 'primary') {
      button.style.backgroundColor = loading ? 'var(--color-primary-400)' : 'var(--color-primary-500)';
      button.style.borderColor = loading ? 'var(--color-primary-400)' : 'var(--color-primary-500)';
    } else if (variant === 'secondary') {
      button.style.backgroundColor = loading ? 'var(--color-secondary-400)' : 'var(--color-secondary-500)';
      button.style.borderColor = loading ? 'var(--color-secondary-400)' : 'var(--color-secondary-500)';
    } else if (variant === 'outline') {
      button.style.backgroundColor = 'transparent';
      button.style.borderColor = 'var(--color-primary-500)';
      button.style.color = 'var(--color-primary-500)';
    }
  };

  const LoadingSpinner = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      style={{
        animation: 'spin 1s linear infinite',
      }}
    >
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="31.416"
        strokeDashoffset="23.562"
      />
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </svg>
  );

  const buttonStyles = {
    ...getVariantStyles(),
    ...getSizeStyles(),
    ...style,
  };

  return (
    <button
      type={type}
      className={className}
      style={buttonStyles}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      aria-busy={loading}
    >
      {loading && <LoadingSpinner />}
      {children}
    </button>
  );
};

export default Button;