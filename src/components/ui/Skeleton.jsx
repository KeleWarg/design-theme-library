/**
 * @chunk 2.01 - ThemesPage Layout
 * @chunk 3.01 - ComponentsPage Layout
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

export function ComponentCardSkeleton() {
  return (
    <div className="component-card-skeleton">
      <div className="component-card-skeleton-preview">
        <Skeleton width="100%" height="100%" />
      </div>
      <div className="component-card-skeleton-body">
        <div className="component-card-skeleton-header">
          <Skeleton width="60%" height={18} />
          <Skeleton width={60} height={20} style={{ borderRadius: 'var(--radius-full)' }} />
        </div>
        <Skeleton width="80%" height={14} style={{ marginTop: 8 }} />
        <div className="component-card-skeleton-footer">
          <Skeleton width={50} height={12} />
          <Skeleton width={40} height={12} />
        </div>
      </div>
    </div>
  );
}

export function ComponentGridSkeleton({ count = 6 }) {
  return (
    <div className="component-grid">
      {Array.from({ length: count }).map((_, i) => (
        <ComponentCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * @chunk 3.12 - ComponentDetail Layout
 * Skeleton for component detail page
 */
export function DetailSkeleton() {
  return (
    <div className="component-detail-skeleton">
      <div className="detail-skeleton-header">
        <Skeleton width={120} height={20} />
        <Skeleton width={200} height={32} style={{ marginTop: 8 }} />
        <Skeleton width={80} height={24} style={{ marginTop: 8, borderRadius: 'var(--radius-full)' }} />
      </div>
      <div className="detail-skeleton-tabs">
        <Skeleton width={100} height={40} />
        <Skeleton width={100} height={40} />
        <Skeleton width={100} height={40} />
        <Skeleton width={100} height={40} />
        <Skeleton width={100} height={40} />
      </div>
      <div className="detail-skeleton-content">
        <Skeleton width="100%" height={400} />
      </div>
    </div>
  );
}

export default Skeleton;

