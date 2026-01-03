/**
 * @chunk 1.11 - App Shell & Routing
 * Component detail page placeholder
 */
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Edit, Code, Eye, Settings } from 'lucide-react'

export default function ComponentDetailPage() {
  const { id } = useParams()
  
  return (
    <div className="page component-detail-page">
      <header className="page-header">
        <div className="page-header-left">
          <Link to="/components" className="btn btn-ghost">
            <ArrowLeft size={16} />
            Back
          </Link>
          <h1>Component Details</h1>
          <span className="component-id">ID: {id}</span>
        </div>
        <button className="btn btn-primary">
          <Edit size={16} />
          Edit Component
        </button>
      </header>
      
      <main className="page-content">
        {/* Component detail tabs - will be implemented in Phase 3 */}
        <div className="tabs-placeholder">
          <div className="tab-list">
            <button className="tab active">
              <Eye size={16} />
              Preview
            </button>
            <button className="tab">
              <Code size={16} />
              Code
            </button>
            <button className="tab">
              <Settings size={16} />
              Props
            </button>
          </div>
          
          <div className="tab-content">
            <p>Component detail view will be implemented in Phase 3</p>
            <p>This page will include:</p>
            <ul>
              <li>Live preview with theme tokens</li>
              <li>Code view with syntax highlighting</li>
              <li>Props documentation</li>
              <li>Linked tokens</li>
              <li>Usage examples</li>
            </ul>
          </div>
        </div>
      </main>
      
      <style>{`
        .page-header-left {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }
        
        .component-id {
          font-size: var(--font-size-sm);
          color: var(--color-muted-foreground);
          padding: var(--spacing-xs) var(--spacing-sm);
          background: var(--color-muted);
          border-radius: var(--radius-sm);
        }
        
        .tabs-placeholder {
          background: var(--color-background);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }
        
        .tab-list {
          display: flex;
          border-bottom: 1px solid var(--color-border);
          background: var(--color-muted);
        }
        
        .tab {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          padding: var(--spacing-sm) var(--spacing-md);
          background: none;
          border: none;
          cursor: pointer;
          font-size: var(--font-size-sm);
          color: var(--color-muted-foreground);
          border-bottom: 2px solid transparent;
          margin-bottom: -1px;
        }
        
        .tab:hover {
          color: var(--color-foreground);
        }
        
        .tab.active {
          color: var(--color-primary);
          border-bottom-color: var(--color-primary);
          background: var(--color-background);
        }
        
        .tab-content {
          padding: var(--spacing-xl);
          text-align: center;
        }
        
        .tab-content ul {
          text-align: left;
          max-width: 300px;
          margin: var(--spacing-md) auto;
        }
      `}</style>
    </div>
  )
}

