/**
 * @chunk 1.11 - App Shell & Routing
 * Components list page placeholder
 */
import { Plus, Box } from 'lucide-react'

export default function ComponentsPage() {
  return (
    <div className="page components-page">
      <header className="page-header">
        <h1>Components</h1>
        <button className="btn btn-primary">
          <Plus size={16} />
          Add Component
        </button>
      </header>
      
      <main className="page-content">
        {/* Empty state - will be replaced with component list in Phase 3 */}
        <div className="empty-state">
          <Box size={48} className="empty-state-icon" />
          <h3 className="empty-state-title">No components yet</h3>
          <p className="empty-state-description">
            Add components manually or import them from Figma.
          </p>
          <div className="empty-state-actions">
            <button className="btn btn-primary">
              <Plus size={16} />
              Add Component
            </button>
            <a href="/figma-import" className="btn btn-secondary">
              Import from Figma
            </a>
          </div>
        </div>
      </main>
      
      <style>{`
        .empty-state-actions {
          display: flex;
          gap: var(--spacing-sm);
        }
      `}</style>
    </div>
  )
}

