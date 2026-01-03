/**
 * @chunk 1.11 - App Shell & Routing
 * Figma import page placeholder
 */
import { FigmaIcon, Upload, RefreshCw } from 'lucide-react'

export default function FigmaImportPage() {
  return (
    <div className="page figma-import-page">
      <header className="page-header">
        <h1>Figma Import</h1>
        <button className="btn btn-secondary">
          <RefreshCw size={16} />
          Refresh Connection
        </button>
      </header>
      
      <main className="page-content">
        {/* Figma import wizard - will be implemented in Phase 4 */}
        <div className="import-status">
          <div className="connection-card card">
            <div className="connection-icon">
              <FigmaIcon size={32} />
            </div>
            <div className="connection-info">
              <h3>Figma Plugin</h3>
              <p className="connection-status disconnected">
                Waiting for connection...
              </p>
            </div>
          </div>
          
          <div className="import-instructions card">
            <h3>How to Import</h3>
            <ol>
              <li>Open your Figma file</li>
              <li>Run the Design System Admin plugin</li>
              <li>Select components to export</li>
              <li>Click "Send to Admin"</li>
            </ol>
            <p className="hint">
              The plugin will send component data to this page for review and import.
            </p>
          </div>
        </div>
        
        <div className="empty-state">
          <Upload size={48} className="empty-state-icon" />
          <h3 className="empty-state-title">No pending imports</h3>
          <p className="empty-state-description">
            Use the Figma plugin to send components here for import.
          </p>
        </div>
      </main>
      
      <style>{`
        .import-status {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-xl);
        }
        
        .connection-card {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }
        
        .connection-icon {
          width: 64px;
          height: 64px;
          border-radius: var(--radius-lg);
          background: var(--color-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-muted-foreground);
        }
        
        .connection-info h3 {
          margin: 0 0 var(--spacing-xs);
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
        }
        
        .connection-status {
          margin: 0;
          font-size: var(--font-size-sm);
        }
        
        .connection-status.disconnected {
          color: var(--color-warning);
        }
        
        .connection-status.connected {
          color: var(--color-success);
        }
        
        .import-instructions h3 {
          margin: 0 0 var(--spacing-md);
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
        }
        
        .import-instructions ol {
          margin: 0 0 var(--spacing-md);
          padding-left: var(--spacing-lg);
        }
        
        .import-instructions li {
          margin-bottom: var(--spacing-xs);
          font-size: var(--font-size-sm);
        }
        
        .hint {
          margin: 0;
          font-size: var(--font-size-sm);
          color: var(--color-muted-foreground);
          font-style: italic;
        }
      `}</style>
    </div>
  )
}

