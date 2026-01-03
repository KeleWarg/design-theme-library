import React from 'react';

interface CardProps {
  /** Content for the card header */
  header?: React.ReactNode;
  /** Main content of the card */
  children: React.ReactNode;
  /** Content for the card footer */
  footer?: React.ReactNode;
  /** Visual variant of the card */
  variant?: 'elevated' | 'outlined';
  /** Padding size for the card content */
  padding?: 'sm' | 'md' | 'lg';
  /** Additional CSS class name */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

const Card: React.FC<CardProps> = ({
  header,
  children,
  footer,
  variant = 'elevated',
  padding = 'md',
  className = '',
  style = {},
}) => {
  const getPaddingValue = () => {
    switch (padding) {
      case 'sm':
        return 'var(--space-4)';
      case 'md':
        return 'var(--space-6)';
      case 'lg':
        return 'var(--space-8)';
      default:
        return 'var(--space-6)';
    }
  };

  const cardStyles: React.CSSProperties = {
    backgroundColor: 'var(--color-bg-default)',
    borderRadius: 'var(--radius-lg)',
    border: variant === 'outlined' ? '1px solid var(--color-border-default)' : 'none',
    boxShadow: variant === 'elevated' ? 'var(--shadow-md)' : 'none',
    overflow: 'hidden',
    transition: 'var(--transition-normal)',
    ...style,
  };

  const headerStyles: React.CSSProperties = {
    padding: getPaddingValue(),
    borderBottom: '1px solid var(--color-border-subtle)',
    backgroundColor: 'var(--color-bg-subtle)',
    fontWeight: 'var(--font-weight-semibold)',
    color: 'var(--color-text-primary)',
  };

  const bodyStyles: React.CSSProperties = {
    padding: getPaddingValue(),
    color: 'var(--color-text-primary)',
  };

  const footerStyles: React.CSSProperties = {
    padding: getPaddingValue(),
    borderTop: '1px solid var(--color-border-subtle)',
    backgroundColor: 'var(--color-bg-subtle)',
    color: 'var(--color-text-secondary)',
  };

  return (
    <div
      className={className}
      style={cardStyles}
      role="article"
    >
      {header && (
        <div style={headerStyles}>
          {header}
        </div>
      )}
      <div style={bodyStyles}>
        {children}
      </div>
      {footer && (
        <div style={footerStyles}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;