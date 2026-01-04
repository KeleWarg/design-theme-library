/**
 * @chunk 2.01 - ThemesPage Layout
 * @chunk 6.05 - Error States & Loading
 * 
 * Error message component for displaying errors with multiple variants.
 */

import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Main error message component
 * @param {Object} props
 * @param {Error|Object} props.error - Error object
 * @param {string} props.title - Error title
 * @param {Function} props.onRetry - Optional retry callback
 * @param {string} props.className - Additional CSS classes
 */
export default function ErrorMessage({ 
  error, 
  title = 'Something went wrong',
  onRetry,
  className
}) {
  const message = error?.message || 'An unexpected error occurred';
  
  return (
    <div className={cn('error-message', className)}>
      <AlertCircle 
        size={32} 
        className="error-message-icon"
        style={{ color: 'var(--color-error)' }}
      />
      <h3 className="error-message-title">{title}</h3>
      <p className="error-message-text">{message}</p>
      {onRetry && (
        <button 
          type="button"
          className="btn btn-secondary" 
          onClick={onRetry}
        >
          <RefreshCw size={16} />
          Try again
        </button>
      )}
    </div>
  );
}

/**
 * Inline error message (for forms)
 */
export function InlineError({ message, className }) {
  if (!message) return null;
  
  return (
    <p 
      className={cn(
        'inline-error',
        'text-sm',
        'mt-1',
        className
      )}
      style={{ 
        color: 'var(--color-error)',
        marginTop: 'var(--spacing-xs)'
      }}
    >
      {message}
    </p>
  );
}

/**
 * Form error display (for multiple field errors)
 */
export function FormError({ errors, className }) {
  if (!errors || Object.keys(errors).length === 0) return null;
  
  return (
    <div 
      className={cn(
        'form-errors',
        'rounded-md',
        'p-3',
        'mb-4',
        className
      )}
      style={{
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid var(--color-error)',
        padding: 'var(--spacing-md)',
        marginBottom: 'var(--spacing-md)'
      }}
    >
      <ul 
        className="list-disc list-inside text-sm"
        style={{ color: 'var(--color-error)' }}
      >
        {Object.entries(errors).map(([field, message]) => (
          <li key={field}>{message}</li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Full-page error message
 */
export function FullPageError({ error, onRetry, title }) {
  return (
    <div className="full-page-error">
      <ErrorMessage 
        error={error}
        title={title}
        onRetry={onRetry}
      />
    </div>
  );
}


