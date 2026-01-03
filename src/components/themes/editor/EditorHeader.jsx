/**
 * @chunk 2.12 - ThemeEditor Layout
 * 
 * Editor header component with theme name, status, save button, and preview toggle.
 */

import { Link } from 'react-router-dom';
import { ArrowLeft, Save, Eye, EyeOff, MoreHorizontal } from 'lucide-react';

/**
 * Theme editor header with navigation and controls
 * @param {Object} props
 * @param {Object} props.theme - Theme object with name and status
 * @param {boolean} props.hasChanges - Whether there are unsaved changes
 * @param {boolean} props.showPreview - Whether preview panel is visible
 * @param {Function} props.onTogglePreview - Toggle preview visibility
 * @param {Function} props.onSave - Save handler (optional)
 */
export default function EditorHeader({ 
  theme, 
  hasChanges = false, 
  showPreview = true, 
  onTogglePreview,
  onSave 
}) {
  const statusColor = theme?.status === 'published' 
    ? 'var(--color-success)' 
    : 'var(--color-warning)';

  return (
    <header className="editor-header">
      <div className="editor-header-left">
        <Link to="/themes" className="btn btn-ghost btn-icon">
          <ArrowLeft size={18} />
        </Link>
        
        <div className="editor-header-info">
          <h1 className="editor-header-title">
            {theme?.name || 'Loading...'}
          </h1>
          <div className="editor-header-meta">
            <span 
              className="status-badge"
              style={{ 
                backgroundColor: statusColor + '20', 
                color: statusColor 
              }}
            >
              {theme?.status || 'draft'}
            </span>
            {theme?.source && (
              <span className="source-badge">
                {theme.source}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="editor-header-right">
        <button 
          className="btn btn-ghost btn-icon"
          onClick={onTogglePreview}
          title={showPreview ? 'Hide Preview' : 'Show Preview'}
          aria-label={showPreview ? 'Hide Preview' : 'Show Preview'}
        >
          {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>

        <button 
          className="btn btn-ghost btn-icon"
          title="More options"
          aria-label="More options"
        >
          <MoreHorizontal size={18} />
        </button>

        {onSave && (
          <button 
            className={`btn btn-primary ${hasChanges ? 'btn-has-changes' : ''}`}
            onClick={onSave}
            disabled={!hasChanges}
          >
            <Save size={16} />
            {hasChanges ? 'Save Changes' : 'Saved'}
          </button>
        )}
      </div>
    </header>
  );
}

