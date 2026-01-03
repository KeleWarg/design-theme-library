# Chunk 6.05 — Error States & Loading

## Purpose
Add comprehensive error handling and loading states.

---

## Inputs
- All page and component files

## Outputs
- Error boundaries
- Loading skeletons
- Error messages

---

## Dependencies
- Phases 2-5 must be complete

---

## Implementation Notes

### Error Boundary

```jsx
// src/components/ui/ErrorBoundary.jsx
import { Component } from 'react';
import { AlertTriangleIcon } from 'lucide-react';
import { Button } from './Button';

export class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Could send to error tracking service
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <AlertTriangleIcon className="error-icon" size={48} />
            <h2>Something went wrong</h2>
            <p className="error-message">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <div className="error-actions">
              <Button onClick={() => window.location.reload()}>
                Reload Page
              </Button>
              <Button variant="ghost" onClick={this.handleReset}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Page-level error boundary with navigation
export function PageErrorBoundary({ children }) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}
```

### Skeleton Components

```jsx
// src/components/ui/Skeleton.jsx
import { cn } from '../../lib/utils';

export function Skeleton({ className, ...props }) {
  return (
    <div 
      className={cn(
        'skeleton animate-pulse bg-gray-200 dark:bg-gray-700 rounded',
        className
      )}
      {...props}
    />
  );
}

export function ThemeCardSkeleton() {
  return (
    <div className="theme-card skeleton-card">
      <Skeleton className="h-10 w-full rounded-t-lg rounded-b-none" />
      <div className="p-4">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-4" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ThemeGridSkeleton({ count = 6 }) {
  return (
    <div className="theme-grid">
      {Array.from({ length: count }).map((_, i) => (
        <ThemeCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ComponentCardSkeleton() {
  return (
    <div className="component-card skeleton-card">
      <Skeleton className="h-32 w-full rounded-t-lg" />
      <div className="p-4">
        <Skeleton className="h-5 w-2/3 mb-2" />
        <Skeleton className="h-4 w-full mb-4" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ComponentGridSkeleton({ count = 8 }) {
  return (
    <div className="component-grid">
      {Array.from({ length: count }).map((_, i) => (
        <ComponentCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function EditorSkeleton() {
  return (
    <div className="editor-skeleton">
      <Skeleton className="h-12 w-full mb-4" />
      <div className="flex gap-4">
        <Skeleton className="h-[calc(100vh-200px)] w-48" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-3/4" />
        </div>
        <Skeleton className="h-[calc(100vh-200px)] w-80" />
      </div>
    </div>
  );
}

export function TokenListSkeleton({ count = 5 }) {
  return (
    <div className="token-list-skeleton space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="table-skeleton">
      <div className="flex gap-4 mb-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-8 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 mb-2">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-10 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
```

### Error Message Component

```jsx
// src/components/ui/ErrorMessage.jsx
import { AlertCircleIcon, RefreshCwIcon } from 'lucide-react';
import { Button } from './Button';

export function ErrorMessage({ error, onRetry, className }) {
  return (
    <div className={cn('error-message', className)}>
      <AlertCircleIcon className="error-icon" size={20} />
      <div className="error-content">
        <p className="error-text">
          {error?.message || 'An error occurred'}
        </p>
        {onRetry && (
          <Button variant="ghost" size="sm" onClick={onRetry}>
            <RefreshCwIcon size={14} /> Try Again
          </Button>
        )}
      </div>
    </div>
  );
}

export function InlineError({ message }) {
  return (
    <p className="inline-error text-red-500 text-sm mt-1">
      {message}
    </p>
  );
}

export function FormError({ errors }) {
  if (!errors || Object.keys(errors).length === 0) return null;
  
  return (
    <div className="form-errors bg-red-50 border border-red-200 rounded-md p-3 mb-4">
      <ul className="list-disc list-inside text-red-600 text-sm">
        {Object.entries(errors).map(([field, message]) => (
          <li key={field}>{message}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Error Handling Hook

```jsx
// src/hooks/useAsyncError.js
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export function useAsyncError() {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleError = useCallback((error) => {
    console.error(error);
    setError(error);
    toast.error(error.message || 'An error occurred');
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const execute = useCallback(async (asyncFn) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await asyncFn();
      return result;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  return { error, isLoading, handleError, clearError, execute };
}
```

### App Integration

```jsx
// src/App.jsx
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { ThemeProvider } from './contexts/ThemeContext';
import { Router } from './router';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
```

---

## Files Created
- `src/components/ui/ErrorBoundary.jsx` — Error boundary
- `src/components/ui/Skeleton.jsx` — Skeleton components
- `src/components/ui/ErrorMessage.jsx` — Error messages
- `src/hooks/useAsyncError.js` — Error handling hook

---

## Tests

### Verification
- [ ] Error boundary catches render errors
- [ ] Skeletons match layout of real components
- [ ] Error messages are user-friendly
- [ ] Retry functionality works
- [ ] Loading states transition smoothly

---

## Time Estimate
3 hours
