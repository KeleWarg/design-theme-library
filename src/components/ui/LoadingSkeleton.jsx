/**
 * @chunk 6.05 - Error States & Loading
 * 
 * Skeleton loading components for various UI elements.
 */

import { cn } from '../../lib/utils';

/**
 * Base skeleton component with pulse animation
 */
export function Skeleton({ className, ...props }) {
  return (
    <div 
      className={cn(
        'skeleton',
        'animate-pulse',
        'bg-muted',
        'rounded',
        className
      )}
      style={{
        backgroundColor: 'var(--color-muted)'
      }}
      {...props}
    />
  );
}

/**
 * Theme card skeleton
 */
export function ThemeCardSkeleton() {
  return (
    <div className="theme-card skeleton-card">
      <Skeleton className="h-10 w-full rounded-t-lg rounded-b-none" />
      <div className="p-4" style={{ padding: 'var(--spacing-md)' }}>
        <Skeleton 
          className="h-5 w-3/4 mb-2" 
          style={{ marginBottom: 'var(--spacing-sm)' }}
        />
        <Skeleton 
          className="h-4 w-full mb-4" 
          style={{ marginBottom: 'var(--spacing-md)' }}
        />
        <div className="flex gap-2" style={{ gap: 'var(--spacing-sm)' }}>
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * Theme grid skeleton
 */
export function ThemeGridSkeleton({ count = 6 }) {
  return (
    <div className="theme-grid">
      {Array.from({ length: count }).map((_, i) => (
        <ThemeCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Component card skeleton
 */
export function ComponentCardSkeleton() {
  return (
    <div className="component-card skeleton-card">
      <Skeleton className="h-32 w-full rounded-t-lg" />
      <div className="p-4" style={{ padding: 'var(--spacing-md)' }}>
        <Skeleton 
          className="h-5 w-2/3 mb-2" 
          style={{ marginBottom: 'var(--spacing-sm)' }}
        />
        <Skeleton 
          className="h-4 w-full mb-4" 
          style={{ marginBottom: 'var(--spacing-md)' }}
        />
        <div className="flex gap-2" style={{ gap: 'var(--spacing-sm)' }}>
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * Component grid skeleton
 */
export function ComponentGridSkeleton({ count = 8 }) {
  return (
    <div className="component-grid">
      {Array.from({ length: count }).map((_, i) => (
        <ComponentCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Editor skeleton (for theme/component editors)
 */
export function EditorSkeleton() {
  return (
    <div className="editor-skeleton">
      <Skeleton 
        className="h-12 w-full mb-4" 
        style={{ 
          height: '3rem',
          marginBottom: 'var(--spacing-md)'
        }}
      />
      <div className="flex gap-4" style={{ gap: 'var(--spacing-md)' }}>
        <Skeleton 
          className="h-[calc(100vh-200px)] w-48" 
          style={{ width: '12rem' }}
        />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-3/4" />
        </div>
        <Skeleton 
          className="h-[calc(100vh-200px)] w-80" 
          style={{ width: '20rem' }}
        />
      </div>
    </div>
  );
}

/**
 * Token list skeleton
 */
export function TokenListSkeleton({ count = 5 }) {
  return (
    <div className="token-list-skeleton space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton 
          key={i} 
          className="h-12 w-full" 
          style={{ height: '3rem' }}
        />
      ))}
    </div>
  );
}

/**
 * Table skeleton
 */
export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="table-skeleton">
      <div 
        className="flex gap-4 mb-4" 
        style={{ 
          gap: 'var(--spacing-md)',
          marginBottom: 'var(--spacing-md)'
        }}
      >
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-8 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div 
          key={i} 
          className="flex gap-4 mb-2"
          style={{ 
            gap: 'var(--spacing-md)',
            marginBottom: 'var(--spacing-sm)'
          }}
        >
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-10 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Text skeleton (for paragraphs)
 */
export function TextSkeleton({ lines = 3, className }) {
  return (
    <div className={cn('text-skeleton space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={i === lines - 1 ? 'w-3/4' : 'w-full'}
          style={{ height: '1rem' }}
        />
      ))}
    </div>
  );
}

/**
 * Avatar skeleton
 */
export function AvatarSkeleton({ size = 'md' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <Skeleton 
      className={cn('rounded-full', sizeClasses[size])}
    />
  );
}

/**
 * List skeleton (for lists of items)
 */
export function ListSkeleton({ items = 5, showAvatar = false }) {
  return (
    <div className="list-skeleton space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div 
          key={i} 
          className="flex items-center gap-3"
          style={{ gap: 'var(--spacing-md)' }}
        >
          {showAvatar && <AvatarSkeleton size="md" />}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}





