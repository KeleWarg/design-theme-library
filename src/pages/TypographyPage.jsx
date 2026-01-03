/**
 * @chunk 1.11 - App Shell & Routing
 * Typography management page placeholder
 */
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Type, Plus } from 'lucide-react'

export default function TypographyPage() {
  const { id } = useParams()
  
  return (
    <div className="page typography-page">
      <header className="page-header">
        <div className="page-header-left">
          <Link to={`/themes/${id}`} className="btn btn-ghost">
            <ArrowLeft size={16} />
            Back to Theme
          </Link>
          <h1>Typography</h1>
        </div>
        <button className="btn btn-primary">
          <Plus size={16} />
          Add Typeface
        </button>
      </header>
      
      <main className="page-content">
        {/* Typography management - will be implemented in Phase 2 */}
        <div className="empty-state">
          <Type size={48} className="empty-state-icon" />
          <h3 className="empty-state-title">No typefaces configured</h3>
          <p className="empty-state-description">
            Add typefaces and configure typography roles for this theme.
          </p>
          <button className="btn btn-primary">
            <Plus size={16} />
            Add Typeface
          </button>
        </div>
      </main>
      
      <style>{`
        .page-header-left {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }
      `}</style>
    </div>
  )
}

