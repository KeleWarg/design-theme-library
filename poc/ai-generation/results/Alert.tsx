import React from 'react';

interface AlertProps {
  /** The severity level of the alert */
  severity?: 'info' | 'success' | 'warning' | 'error';
  /** Optional title for the alert */
  title?: string;
  /** The main message content */
  children: React.ReactNode;
  /** Whether the alert can be dismissed */
  dismissible?: boolean;
  /** Callback function when alert is dismissed */
  onDismiss?: () => void;
  /** Additional CSS class name */
  className?: string;
}

const Alert: React.FC<AlertProps> = ({
  severity = 'info',
  title,
  children,
  dismissible = false,
  onDismiss,
  className = '',
}) => {
  const [isVisible, setIsVisible] = React.useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  const getSeverityStyles = () => {
    switch (severity) {
      case 'success':
        return {
          backgroundColor: 'var(--color-primary-50)',
          borderColor: 'var(--color-success)',
          color: 'var(--color-primary-800)',
        };
      case 'warning':
        return {
          backgroundColor: '#FFF8E1',
          borderColor: 'var(--color-warning)',
          color: '#E65100',
        };
      case 'error':
        return {
          backgroundColor: '#FFEBEE',
          borderColor: 'var(--color-error)',
          color: '#C62828',
        };
      default: // info
        return {
          backgroundColor: 'var(--color-secondary-50)',
          borderColor: 'var(--color-info)',
          color: 'var(--color-secondary-900)',
        };
    }
  };

  const getIcon = () => {
    switch (severity) {
      case 'success':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      default: // info
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const severityStyles = getSeverityStyles();

  return (
    <div
      className={className}
      role="alert"
      style={{
        display: 'flex',
        padding: 'var(--space-4)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid',
        fontFamily: 'var(--font-family-sans)',
        fontSize: 'var(--font-size-sm)',
        lineHeight: 'var(--line-height-normal)',
        ...severityStyles,
      }}
    >
      <div
        style={{
          flexShrink: 0,
          marginRight: 'var(--space-3)',
          marginTop: 'var(--space-1)',
        }}
      >
        {getIcon()}
      </div>
      
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && (
          <div
            style={{
              fontWeight: 'var(--font-weight-semibold)',
              marginBottom: title && children ? 'var(--space-1)' : '0',
            }}
          >
            {title}
          </div>
        )}
        <div>{children}</div>
      </div>

      {dismissible && (
        <button
          onClick={handleDismiss}
          style={{
            flexShrink: 0,
            marginLeft: 'var(--space-3)',
            padding: 'var(--space-1)',
            border: 'none',
            background: 'transparent',
            color: 'inherit',
            cursor: 'pointer',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'var(--transition-fast)',
            opacity: 0.7,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.7';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          aria-label="Dismiss alert"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Alert;