/**
 * @chunk 1.11 - App Shell & Routing
 * Dashboard page - overview of design system
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Palette, Box, Download, Activity } from 'lucide-react'
import { themeService } from '../services/themeService'
import { componentService } from '../services/componentService'

export default function Dashboard() {
  const [stats, setStats] = useState({
    themes: 0,
    components: 0,
    tokens: 0,
    exports: 0,
  })

  useEffect(() => {
    let cancelled = false

    async function loadStats() {
      try {
        const [themes, components] = await Promise.all([
          themeService.getThemes(),
          componentService.getComponents(),
        ])

        if (cancelled) return

        const tokenCount = (themes || []).reduce((sum, theme) => {
          return sum + (theme?.tokenCount || 0)
        }, 0)

        setStats((prev) => ({
          ...prev,
          themes: themes?.length || 0,
          components: components?.length || 0,
          tokens: tokenCount,
        }))
      } catch (error) {
        console.error('Failed to load dashboard stats:', error)
      }
    }

    loadStats()
    return () => {
      cancelled = true
    }
  }, [])

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
              <span className="stat-value" data-testid="stat-themes">{stats.themes}</span>
              <span className="stat-label">Themes</span>
            </div>
          </div>
          
          <div className="card stat-card">
            <div className="stat-icon" style={{ background: 'var(--color-secondary)' }}>
              <Box size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-value" data-testid="stat-components">{stats.components}</span>
              <span className="stat-label">Components</span>
            </div>
          </div>
          
          <div className="card stat-card">
            <div className="stat-icon" style={{ background: 'var(--color-accent)' }}>
              <Activity size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-value" data-testid="stat-tokens">{stats.tokens}</span>
              <span className="stat-label">Tokens</span>
            </div>
          </div>
          
          <div className="card stat-card">
            <div className="stat-icon" style={{ background: 'var(--color-info)' }}>
              <Download size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-value" data-testid="stat-exports">{stats.exports}</span>
              <span className="stat-label">Exports</span>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <section className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <Link to="/themes" className="card action-card">
              <Palette size={32} />
              <h3>Create Theme</h3>
              <p>Start a new design theme from scratch</p>
            </Link>
            <Link to="/components/new?mode=ai" className="card action-card">
              <Box size={32} />
              <h3>Generate Component</h3>
              <p>Use AI to create a new component</p>
            </Link>
            <Link to="/components" className="card action-card">
              <Activity size={32} />
              <h3>Manage Components</h3>
              <p>View and edit your component library</p>
            </Link>
          </div>
        </section>
      </main>
      
      <style>{`
        .dashboard-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--spacing-md, 16px);
          margin-bottom: var(--spacing-xl, 32px);
        }
        
        .stat-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: var(--spacing-md, 16px);
        }
        
        .stat-icon {
          width: 48px;
          height: 48px;
          min-width: 48px;
          border-radius: var(--radius-lg, 12px);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }
        
        .stat-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        
        .stat-value {
          font-size: 28px;
          font-weight: 700;
          line-height: 1;
          color: var(--color-foreground, #1a1a1a);
        }
        
        .stat-label {
          font-size: 14px;
          color: var(--color-muted-foreground, #6b7280);
          line-height: 1.4;
        }
        
        .dashboard-section {
          margin-bottom: var(--spacing-xl, 32px);
        }
        
        .dashboard-section h2 {
          font-size: var(--font-size-lg, 18px);
          font-weight: 600;
          margin: 0 0 var(--spacing-md, 16px);
        }
        
        .quick-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--spacing-md, 16px);
        }
        
        .action-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-decoration: none;
          color: inherit;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        
        .action-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
        }
        
        .action-card svg {
          color: var(--color-primary, #3b82f6);
          margin-bottom: var(--spacing-sm, 8px);
        }
        
        .action-card h3 {
          margin: 0 0 var(--spacing-xs, 4px);
          font-size: 16px;
          font-weight: 600;
        }
        
        .action-card p {
          margin: 0;
          font-size: 14px;
          color: var(--color-muted-foreground, #6b7280);
        }
      `}</style>
    </div>
  )
}

