/**
 * @chunk 1.11 - App Shell & Routing
 * Settings page placeholder
 */
import { Save, Key, Database, Palette } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="page settings-page">
      <header className="page-header">
        <h1>Settings</h1>
        <button className="btn btn-primary">
          <Save size={16} />
          Save Changes
        </button>
      </header>
      
      <main className="page-content">
        <div className="settings-sections">
          {/* API Keys Section */}
          <section className="settings-section card">
            <div className="section-header">
              <Key size={20} />
              <h2>API Keys</h2>
            </div>
            <div className="section-content">
              <div className="form-group">
                <label htmlFor="figma-token">Figma Access Token</label>
                <input 
                  type="password" 
                  id="figma-token" 
                  placeholder="Enter your Figma access token"
                  className="form-input"
                />
                <p className="form-hint">
                  Required for Figma API access. Get yours from Figma Settings → Personal Access Tokens.
                </p>
              </div>
              <div className="form-group">
                <label htmlFor="claude-key">Claude API Key</label>
                <input 
                  type="password" 
                  id="claude-key" 
                  placeholder="Enter your Claude API key"
                  className="form-input"
                />
                <p className="form-hint">
                  Required for AI-powered component generation. Get yours from Anthropic Console.
                </p>
              </div>
            </div>
          </section>
          
          {/* Database Section */}
          <section className="settings-section card">
            <div className="section-header">
              <Database size={20} />
              <h2>Database</h2>
            </div>
            <div className="section-content">
              <div className="form-group">
                <label htmlFor="supabase-url">Supabase URL</label>
                <input 
                  type="text" 
                  id="supabase-url" 
                  placeholder="https://your-project.supabase.co"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="supabase-key">Supabase Anon Key</label>
                <input 
                  type="password" 
                  id="supabase-key" 
                  placeholder="Enter your Supabase anon key"
                  className="form-input"
                />
              </div>
            </div>
          </section>
          
          {/* Preferences Section */}
          <section className="settings-section card">
            <div className="section-header">
              <Palette size={20} />
              <h2>Preferences</h2>
            </div>
            <div className="section-content">
              <div className="form-group">
                <label htmlFor="default-theme">Default Theme</label>
                <select id="default-theme" className="form-input">
                  <option value="">Select a theme...</option>
                </select>
                <p className="form-hint">
                  The theme used for previewing components by default.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
      
      <style>{`
        .settings-sections {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
          max-width: 700px;
        }
        
        .settings-section {
          padding: var(--spacing-lg);
        }
        
        .section-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-lg);
          padding-bottom: var(--spacing-md);
          border-bottom: 1px solid var(--color-border);
        }
        
        .section-header h2 {
          margin: 0;
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
        }
        
        .section-header svg {
          color: var(--color-primary);
        }
        
        .section-content {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }
        
        .form-group label {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          color: var(--color-foreground);
        }
        
        .form-input {
          padding: var(--spacing-sm) var(--spacing-md);
          font-size: var(--font-size-sm);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          background: var(--color-background);
          color: var(--color-foreground);
          transition: border-color var(--transition-fast);
        }
        
        .form-input:focus {
          outline: none;
          border-color: var(--color-primary);
        }
        
        .form-hint {
          margin: 0;
          font-size: var(--font-size-xs);
          color: var(--color-muted-foreground);
        }
      `}</style>
    </div>
  )
}


