/**
 * @chunk 1.11 - App Shell & Routing
 * Theme editor page placeholder
 */
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'

export default function ThemeEditorPage() {
  const { id } = useParams()
  
  return (
    <div className="page theme-editor-page">
      <header className="page-header">
        <div className="page-header-left">
          <Link to="/themes" className="btn btn-ghost">
            <ArrowLeft size={16} />
            Back
          </Link>
          <h1>Edit Theme</h1>
          <span className="theme-id">ID: {id}</span>
        </div>
        <button className="btn btn-primary">
          <Save size={16} />
          Save Changes
        </button>
      </header>
      
      <main className="page-content">
        {/* Theme editor layout - will be implemented in Phase 2 */}
        <div className="editor-placeholder">
          <p>Theme editor will be implemented in Phase 2</p>
          <p>This page will include:</p>
          <ul>
            <li>Token category sidebar</li>
            <li>Token list view</li>
            <li>Token editors (Color, Typography, Spacing, etc.)</li>
            <li>Live preview panel</li>
          </ul>
        </div>
      </main>
      
      <style>{`
        .page-header-left {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }
        
        .theme-id {
          font-size: var(--font-size-sm);
          color: var(--color-muted-foreground);
          padding: var(--spacing-xs) var(--spacing-sm);
          background: var(--color-muted);
          border-radius: var(--radius-sm);
        }
        
        .editor-placeholder {
          padding: var(--spacing-xl);
          background: var(--color-muted);
          border-radius: var(--radius-lg);
          text-align: center;
        }
        
        .editor-placeholder ul {
          text-align: left;
          max-width: 300px;
          margin: var(--spacing-md) auto;
        }
      `}</style>
    </div>
  )
}

