/**
 * @chunk 6.05 - Error States & Loading
 * 
 * Loading spinner component with multiple sizes and variants.
 */

import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Loading spinner component
 * @param {Object} props
 * @param {'sm'|'md'|'lg'} props.size - Size of the spinner
 * @param {string} props.label - Optional label text
 * @param {boolean} props.centered - Whether to center the spinner
 * @param {string} props.className - Additional CSS classes
 */
export function LoadingSpinner({ 
  size = 'md', 
  label, 
  centered = false,
  className 
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const labelSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const spinner = (
    <Loader2 
      className={cn(
        'animate-spin',
        sizeClasses[size],
        className
      )}
      style={{ color: 'var(--color-primary)' }}
    />
  );

  if (label) {
    return (
      <div className={cn(
        'loading-spinner-with-label',
        centered && 'loading-spinner-centered',
        'flex flex-col items-center gap-2'
      )}>
        {spinner}
        <span className={cn(
          'loading-spinner-label',
          labelSizeClasses[size],
          'text-muted-foreground'
        )}>
          {label}
        </span>
      </div>
    );
  }

  if (centered) {
    return (
      <div className="loading-spinner-centered flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
}

/**
 * Full-page loading spinner
 */
export function FullPageSpinner({ label = 'Loading...' }) {
  return (
    <div className="full-page-spinner">
      <LoadingSpinner size="lg" label={label} centered />
    </div>
  );
}





