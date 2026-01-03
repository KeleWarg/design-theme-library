/**
 * @chunk 2.12 - ThemeEditor Layout
 * 
 * Skeleton loading state for the theme editor.
 */

import { Skeleton } from '../../ui/Skeleton';

/**
 * Skeleton loader for the theme editor
 */
export default function EditorSkeleton() {
  return (
    <div className="theme-editor theme-editor-skeleton">
      {/* Header skeleton */}
      <header className="editor-header">
        <div className="editor-header-left">
          <Skeleton width={36} height={36} />
          <div className="editor-header-info">
            <Skeleton width={200} height={24} />
            <Skeleton width={100} height={18} style={{ marginTop: 8 }} />
          </div>
        </div>
        <div className="editor-header-right">
          <Skeleton width={36} height={36} />
          <Skeleton width={36} height={36} />
          <Skeleton width={120} height={36} />
        </div>
      </header>

      {/* Body skeleton */}
      <div className="editor-body">
        {/* Category sidebar skeleton */}
        <aside className="category-sidebar">
          <div className="category-sidebar-header">
            <Skeleton width={80} height={16} />
          </div>
          <nav className="category-nav">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton 
                key={i} 
                width="100%" 
                height={40} 
                style={{ marginBottom: 4 }} 
              />
            ))}
          </nav>
        </aside>

        {/* Main editor skeleton */}
        <div className="editor-main">
          {/* Token list skeleton */}
          <div className="token-list">
            <div className="token-list-header">
              <Skeleton width={120} height={20} />
              <Skeleton width={60} height={28} />
            </div>
            <ul className="token-list-items">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <li key={i} className="token-list-item-wrapper">
                  <div className="token-list-item">
                    <Skeleton width={32} height={32} />
                    <div style={{ flex: 1 }}>
                      <Skeleton width="60%" height={16} />
                      <Skeleton width="40%" height={12} style={{ marginTop: 4 }} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Editor panel skeleton */}
          <div className="token-editor-panel">
            <div className="token-editor-header">
              <Skeleton width={150} height={20} />
              <Skeleton width={60} height={18} />
            </div>
            <div className="token-editor-content">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="token-editor-field">
                  <Skeleton width={80} height={14} style={{ marginBottom: 8 }} />
                  <Skeleton width="100%" height={40} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

