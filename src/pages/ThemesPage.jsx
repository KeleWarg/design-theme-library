/**
 * @chunk 1.11 - App Shell & Routing
 * Themes list page placeholder
 */
import { Plus, Palette } from 'lucide-react'

export default function ThemesPage() {
  return (
    <div className="page themes-page">
      <header className="page-header">
        <h1>Themes</h1>
        <button className="btn btn-primary">
          <Plus size={16} />
          Create Theme
        </button>
      </header>
      
      <main className="page-content">
        {/* Empty state - will be replaced with theme list in Phase 2 */}
        <div className="empty-state">
          <Palette size={48} className="empty-state-icon" />
          <h3 className="empty-state-title">No themes yet</h3>
          <p className="empty-state-description">
            Create your first theme to start building your design system.
          </p>
          <button className="btn btn-primary">
            <Plus size={16} />
            Create Theme
          </button>
        </div>
      </main>
    </div>
  )
}

