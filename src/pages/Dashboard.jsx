/**
 * @chunk 1.11 - App Shell & Routing
 * Dashboard page - overview of design system
 */
import { Palette, Box, Download, Activity } from 'lucide-react'

export default function Dashboard() {
  return (
    <div className="page dashboard-page">
      <header className="page-header">
        <h1>Dashboard</h1>
      </header>
      
      <main className="page-content">
        {/* Stats Grid */}
        <div className="dashboard-stats">
          <div className="card stat-card">
            <div className="stat-icon" style={{ background: 'var(--color-primary)' }}>
              <Palette size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-value">0</span>
              <span className="stat-label">Themes</span>
            </div>
          </div>
          
          <div className="card stat-card">
            <div className="stat-icon" style={{ background: 'var(--color-secondary)' }}>
              <Box size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-value">0</span>
              <span className="stat-label">Components</span>
            </div>
          </div>
          
          <div className="card stat-card">
            <div className="stat-icon" style={{ background: 'var(--color-accent)' }}>
              <Activity size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-value">0</span>
              <span className="stat-label">Tokens</span>
            </div>
          </div>
          
          <div className="card stat-card">
            <div className="stat-icon" style={{ background: 'var(--color-info)' }}>
              <Download size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-value">0</span>
              <span className="stat-label">Exports</span>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <section className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <a href="/themes" className="card action-card">
              <Palette size={32} />
              <h3>Create Theme</h3>
              <p>Start a new design theme from scratch</p>
            </a>
            <a href="/figma-import" className="card action-card">
              <Box size={32} />
              <h3>Import from Figma</h3>
              <p>Sync components from your Figma files</p>
            </a>
            <a href="/components" className="card action-card">
              <Activity size={32} />
              <h3>Manage Components</h3>
              <p>View and edit your component library</p>
            </a>
          </div>
        </section>
      </main>
      
      <style>{`
        .dashboard-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-xl);
        }
        
        .stat-card {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }
        
        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        
        .stat-content {
          display: flex;
          flex-direction: column;
        }
        
        .stat-value {
          font-size: var(--font-size-2xl);
          font-weight: var(--font-weight-bold);
          line-height: var(--line-height-tight);
        }
        
        .stat-label {
          font-size: var(--font-size-sm);
          color: var(--color-muted-foreground);
        }
        
        .dashboard-section {
          margin-bottom: var(--spacing-xl);
        }
        
        .dashboard-section h2 {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          margin: 0 0 var(--spacing-md);
        }
        
        .quick-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--spacing-md);
        }
        
        .action-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-decoration: none;
          color: inherit;
          transition: transform var(--transition-fast), box-shadow var(--transition-fast);
        }
        
        .action-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        
        .action-card svg {
          color: var(--color-primary);
          margin-bottom: var(--spacing-sm);
        }
        
        .action-card h3 {
          margin: 0 0 var(--spacing-xs);
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
        }
        
        .action-card p {
          margin: 0;
          font-size: var(--font-size-sm);
          color: var(--color-muted-foreground);
        }
      `}</style>
    </div>
  )
}

