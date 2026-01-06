/**
 * @chunk 1.11 - App Shell & Routing
 * Settings page with functional form for API keys and preferences
 */
import { useState, useEffect } from 'react';
import { Save, Key, Database, Palette, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useThemes } from '../hooks/useThemes';

// Storage keys for localStorage
const STORAGE_KEYS = {
  FIGMA_TOKEN: 'ds-admin-figma-token',
  CLAUDE_KEY: 'ds-admin-claude-key',
  SUPABASE_URL: 'ds-admin-supabase-url',
  SUPABASE_KEY: 'ds-admin-supabase-key',
  DEFAULT_THEME: 'ds-admin-default-theme',
};

/**
 * Load settings from localStorage
 */
function loadSettings() {
  return {
    figmaToken: localStorage.getItem(STORAGE_KEYS.FIGMA_TOKEN) || '',
    claudeKey: localStorage.getItem(STORAGE_KEYS.CLAUDE_KEY) || '',
    supabaseUrl: localStorage.getItem(STORAGE_KEYS.SUPABASE_URL) || '',
    supabaseKey: localStorage.getItem(STORAGE_KEYS.SUPABASE_KEY) || '',
    defaultTheme: localStorage.getItem(STORAGE_KEYS.DEFAULT_THEME) || '',
  };
}

/**
 * Save settings to localStorage
 */
function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEYS.FIGMA_TOKEN, settings.figmaToken);
  localStorage.setItem(STORAGE_KEYS.CLAUDE_KEY, settings.claudeKey);
  localStorage.setItem(STORAGE_KEYS.SUPABASE_URL, settings.supabaseUrl);
  localStorage.setItem(STORAGE_KEYS.SUPABASE_KEY, settings.supabaseKey);
  localStorage.setItem(STORAGE_KEYS.DEFAULT_THEME, settings.defaultTheme);
}

export default function SettingsPage() {
  const { data: themes, isLoading: themesLoading } = useThemes();

  // Form state
  const [settings, setSettings] = useState(loadSettings);
  const [originalSettings, setOriginalSettings] = useState(loadSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Track changes
  useEffect(() => {
    const changed = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasChanges(changed);
  }, [settings, originalSettings]);

  // Update a single setting
  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Handle save
  const handleSave = async () => {
    setIsSaving(true);
    try {
      saveSettings(settings);
      setOriginalSettings({ ...settings });
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle reset
  const handleReset = () => {
    setSettings({ ...originalSettings });
    toast.info('Changes discarded');
  };

  // Mask API key for display
  const maskKey = (key) => {
    if (!key || key.length < 8) return key;
    return key.substring(0, 4) + '••••••••' + key.substring(key.length - 4);
  };

  return (
    <div className="page settings-page">
      <header className="page-header">
        <div className="page-header-content">
          <h1>Settings</h1>
          <p className="page-header-description">
            Configure API keys, database connection, and preferences
          </p>
        </div>
        <div className="page-header-actions">
          {hasChanges && (
            <button
              className="btn btn-ghost"
              onClick={handleReset}
              disabled={isSaving}
            >
              Discard
            </button>
          )}
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? (
              <>Saving...</>
            ) : (
              <>
                <Save size={16} />
                {hasChanges ? 'Save Changes' : 'Saved'}
              </>
            )}
          </button>
        </div>
      </header>

      <main className="page-content">
        <div className="settings-sections">
          {/* Unsaved changes warning */}
          {hasChanges && (
            <div className="settings-warning">
              <AlertCircle size={16} />
              <span>You have unsaved changes</span>
            </div>
          )}

          {/* API Keys Section */}
          <section className="settings-section card">
            <div className="section-header">
              <Key size={20} />
              <div>
                <h2>API Keys</h2>
                <p className="section-description">
                  Configure external service integrations
                </p>
              </div>
            </div>
            <div className="section-content">
              <div className="form-group">
                <label htmlFor="figma-token">Figma Access Token</label>
                <div className="input-with-status">
                  <input
                    type="password"
                    id="figma-token"
                    placeholder="Enter your Figma access token"
                    className="form-input"
                    value={settings.figmaToken}
                    onChange={(e) => updateSetting('figmaToken', e.target.value)}
                  />
                  {settings.figmaToken && (
                    <span className="input-status input-status--set">
                      <Check size={14} />
                      Set
                    </span>
                  )}
                </div>
                <p className="form-hint">
                  Required for Figma API access. Get yours from Figma Settings → Personal Access Tokens.
                </p>
              </div>
              <div className="form-group">
                <label htmlFor="claude-key">Claude API Key</label>
                <div className="input-with-status">
                  <input
                    type="password"
                    id="claude-key"
                    placeholder="Enter your Claude API key"
                    className="form-input"
                    value={settings.claudeKey}
                    onChange={(e) => updateSetting('claudeKey', e.target.value)}
                  />
                  {settings.claudeKey && (
                    <span className="input-status input-status--set">
                      <Check size={14} />
                      Set
                    </span>
                  )}
                </div>
                <p className="form-hint">
                  Required for AI-powered component generation. Get yours from the Anthropic Console.
                </p>
              </div>
            </div>
          </section>

          {/* Database Section */}
          <section className="settings-section card">
            <div className="section-header">
              <Database size={20} />
              <div>
                <h2>Database</h2>
                <p className="section-description">
                  Supabase connection settings (optional override)
                </p>
              </div>
            </div>
            <div className="section-content">
              <div className="form-group">
                <label htmlFor="supabase-url">Supabase URL</label>
                <input
                  type="text"
                  id="supabase-url"
                  placeholder="https://your-project.supabase.co"
                  className="form-input"
                  value={settings.supabaseUrl}
                  onChange={(e) => updateSetting('supabaseUrl', e.target.value)}
                />
                <p className="form-hint">
                  Leave empty to use default configuration from environment variables.
                </p>
              </div>
              <div className="form-group">
                <label htmlFor="supabase-key">Supabase Anon Key</label>
                <input
                  type="password"
                  id="supabase-key"
                  placeholder="Enter your Supabase anon key"
                  className="form-input"
                  value={settings.supabaseKey}
                  onChange={(e) => updateSetting('supabaseKey', e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Preferences Section */}
          <section className="settings-section card">
            <div className="section-header">
              <Palette size={20} />
              <div>
                <h2>Preferences</h2>
                <p className="section-description">
                  Customize your experience
                </p>
              </div>
            </div>
            <div className="section-content">
              <div className="form-group">
                <label htmlFor="default-theme">Default Theme</label>
                <select
                  id="default-theme"
                  className="form-input"
                  value={settings.defaultTheme}
                  onChange={(e) => updateSetting('defaultTheme', e.target.value)}
                  disabled={themesLoading}
                >
                  <option value="">Select a theme...</option>
                  {themes?.map(theme => (
                    <option key={theme.id} value={theme.id}>
                      {theme.name}
                    </option>
                  ))}
                </select>
                <p className="form-hint">
                  The theme used for previewing components by default.
                </p>
              </div>
            </div>
          </section>

          {/* Storage Info */}
          <section className="settings-section card settings-section--muted">
            <div className="section-header">
              <AlertCircle size={20} />
              <div>
                <h2>Storage Information</h2>
              </div>
            </div>
            <div className="section-content">
              <p className="storage-info">
                Settings are stored locally in your browser. API keys are not transmitted
                to any server except when making API calls to their respective services.
              </p>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  if (confirm('Clear all saved settings? This cannot be undone.')) {
                    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
                    setSettings(loadSettings());
                    setOriginalSettings(loadSettings());
                    toast.success('All settings cleared');
                  }
                }}
              >
                Clear All Settings
              </button>
            </div>
          </section>
        </div>
      </main>

      <style>{`
        .settings-page .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: var(--spacing-md);
        }

        .page-header-content {
          flex: 1;
        }

        .page-header-description {
          margin: var(--spacing-xs) 0 0;
          color: var(--color-muted-foreground);
          font-size: var(--font-size-sm);
        }

        .page-header-actions {
          display: flex;
          gap: var(--spacing-sm);
        }

        .settings-sections {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
          max-width: 700px;
        }

        .settings-warning {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) var(--spacing-md);
          background: var(--color-warning-light, #fef3c7);
          border: 1px solid var(--color-warning, #f59e0b);
          border-radius: var(--radius-md);
          color: var(--color-warning-foreground, #92400e);
          font-size: var(--font-size-sm);
        }

        .settings-section {
          padding: var(--spacing-lg);
        }

        .settings-section--muted {
          background: var(--color-muted);
        }

        .section-header {
          display: flex;
          align-items: flex-start;
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

        .section-description {
          margin: var(--spacing-xs) 0 0;
          font-size: var(--font-size-sm);
          color: var(--color-muted-foreground);
        }

        .section-header > svg {
          color: var(--color-primary);
          flex-shrink: 0;
          margin-top: 2px;
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

        .input-with-status {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-with-status .form-input {
          flex: 1;
          padding-right: 70px;
        }

        .input-status {
          position: absolute;
          right: var(--spacing-sm);
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-medium);
        }

        .input-status--set {
          color: var(--color-success, #22c55e);
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

        .form-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        select.form-input {
          cursor: pointer;
        }

        .form-hint {
          margin: 0;
          font-size: var(--font-size-xs);
          color: var(--color-muted-foreground);
        }

        .storage-info {
          margin: 0 0 var(--spacing-md);
          font-size: var(--font-size-sm);
          color: var(--color-muted-foreground);
          line-height: 1.5;
        }

        .btn-sm {
          padding: var(--spacing-xs) var(--spacing-sm);
          font-size: var(--font-size-xs);
        }

        @media (max-width: 640px) {
          .settings-page .page-header {
            flex-direction: column;
            gap: var(--spacing-md);
          }

          .page-header-actions {
            width: 100%;
          }

          .page-header-actions .btn {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
}
