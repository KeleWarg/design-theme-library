import React from 'react';

interface BadgeProps {
  /** The content to display inside the badge */
  children?: React.ReactNode;
  /** The visual variant of the badge */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  /** The size of the badge */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to render as a dot-only indicator */
  dot?: boolean;
  /** Additional CSS class name */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
  style = {},
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: 'var(--color-primary-500)',
          color: 'var(--color-neutral-0)',
        };
      case 'success':
        return {
          backgroundColor: 'var(--color-success)',
          color: 'var(--color-neutral-0)',
        };
      case 'warning':
        return {
          backgroundColor: 'var(--color-warning)',
          color: 'var(--color-neutral-0)',
        };
      case 'error':
        return {
          backgroundColor: 'var(--color-error)',
          color: 'var(--color-neutral-0)',
        };
      default:
        return {
          backgroundColor: 'var(--color-neutral-100)',
          color: 'var(--color-text-primary)',
        };
    }
  };

  const getSizeStyles = () => {
    if (dot) {
      switch (size) {
        case 'sm':
          return {
            width: 'var(--space-2)',
            height: 'var(--space-2)',
          };
        case 'lg':
          return {
            width: 'var(--space-4)',
            height: 'var(--space-4)',
          };
        default:
          return {
            width: 'var(--space-3)',
            height: 'var(--space-3)',
          };
      }
    }

    switch (size) {
      case 'sm':
        return {
          padding: `var(--space-1) var(--space-2)`,
          fontSize: 'var(--font-size-xs)',
          minHeight: 'var(--space-4)',
        };
      case 'lg':
        return {
          padding: `var(--space-2) var(--space-4)`,
          fontSize: 'var(--font-size-base)',
          minHeight: 'var(--space-8)',
        };
      default:
        return {
          padding: `var(--space-1) var(--space-3)`,
          fontSize: 'var(--font-size-sm)',
          minHeight: 'var(--space-6)',
        };
    }
  };

  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-family-sans)',
    fontWeight: 'var(--font-weight-medium)',
    lineHeight: 'var(--line-height-tight)',
    borderRadius: dot ? 'var(--radius-full)' : 'var(--radius-full)',
    border: 'none',
    whiteSpace: 'nowrap',
    textAlign: 'center',
    verticalAlign: 'middle',
    ...getVariantStyles(),
    ...getSizeStyles(),
    ...style,
  };

  return (
    <span
      className={className}
      style={baseStyles}
      role="status"
      aria-label={dot ? `${variant} indicator` : undefined}
      {...props}
    >
      {!dot && children}
    </span>
  );
};

export default Badge;