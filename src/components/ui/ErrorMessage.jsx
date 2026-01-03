/**
 * @chunk 2.01 - ThemesPage Layout
 * 
 * Error message component for displaying errors.
 */

import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorMessage({ 
  error, 
  title = 'Something went wrong',
  onRetry 
}) {
  const message = error?.message || 'An unexpected error occurred';
  
  return (
    <div className="error-message">
      <AlertCircle size={32} className="error-message-icon" />
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

