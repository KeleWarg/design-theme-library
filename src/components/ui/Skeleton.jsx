/**
 * @chunk 2.01 - ThemesPage Layout
 * 
 * Skeleton loading components for better UX during data fetching.
 */

export function Skeleton({ className = '', width, height, style = {} }) {
  return (
    <div 
      className={`skeleton ${className}`}
      style={{ 
        width, 
        height,
        ...style 
      }}
    />
  );
}

export function ThemeCardSkeleton() {
  return (
    <div className="theme-card-skeleton">
      <div className="theme-card-skeleton-header">
        <Skeleton className="skeleton-avatar" width={40} height={40} />
        <div className="theme-card-skeleton-info">
          <Skeleton width="60%" height={20} />
          <Skeleton width="40%" height={14} style={{ marginTop: 8 }} />
        </div>
      </div>
      <div className="theme-card-skeleton-colors">
        <Skeleton className="skeleton-circle" width={24} height={24} />
        <Skeleton className="skeleton-circle" width={24} height={24} />
        <Skeleton className="skeleton-circle" width={24} height={24} />
        <Skeleton className="skeleton-circle" width={24} height={24} />
        <Skeleton className="skeleton-circle" width={24} height={24} />
      </div>
      <div className="theme-card-skeleton-footer">
        <Skeleton width="30%" height={12} />
        <Skeleton width="20%" height={12} />
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

export default Skeleton;

