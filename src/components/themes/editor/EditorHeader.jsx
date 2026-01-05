/**
 * @chunk 2.12 - ThemeEditor Layout
 *
 * Editor header component with theme name, status, save button, and preview toggle.
 */

import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Eye, EyeOff, MoreHorizontal, Palette, Type, Copy, Trash2, Download, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { themeService } from '../../../services/themeService';

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
  const location = useLocation();
  const navigate = useNavigate();
  const themeId = theme?.id;
  const isTypographyPage = location.pathname.includes('/typography');

  // Dropdown menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const statusColor = theme?.status === 'published'
    ? 'var(--color-success)'
    : 'var(--color-warning)';

  // Menu actions
  const handleDuplicate = async () => {
    setIsMenuOpen(false);
    try {
      const newTheme = await themeService.duplicateTheme(themeId);
      toast.success(`Duplicated as "${newTheme.name}"`);
      navigate(`/themes/${newTheme.id}`);
    } catch (error) {
      console.error('Failed to duplicate theme:', error);
      toast.error('Failed to duplicate theme');
    }
  };

  const handleSetDefault = async () => {
    setIsMenuOpen(false);
    try {
      await themeService.setDefaultTheme(themeId);
      toast.success('Set as default theme');
    } catch (error) {
      console.error('Failed to set default theme:', error);
      toast.error('Failed to set default theme');
    }
  };

  const handleDelete = async () => {
    setIsMenuOpen(false);
    if (!confirm(`Delete "${theme?.name}"? This cannot be undone.`)) return;
    try {
      await themeService.deleteTheme(themeId);
      toast.success('Theme deleted');
      navigate('/themes');
    } catch (error) {
      console.error('Failed to delete theme:', error);
      toast.error('Failed to delete theme');
    }
  };

  const handleExport = () => {
    setIsMenuOpen(false);
    // Navigate to export or trigger export modal
    toast.info('Use the Export button from the Themes page for full export options');
  };

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
        
        {/* Sub-navigation tabs */}
        {themeId && (
          <nav className="editor-nav-tabs" aria-label="Theme editor sections">
            <NavLink 
              to={`/themes/${themeId}`}
              end
              className={({ isActive }) => 
                `editor-nav-tab ${isActive && !isTypographyPage ? 'active' : ''}`
              }
            >
              <Palette size={14} />
              Tokens
            </NavLink>
            <NavLink 
              to={`/themes/${themeId}/typography`}
              className={({ isActive }) => 
                `editor-nav-tab ${isActive ? 'active' : ''}`
              }
            >
              <Type size={14} />
              Typography
            </NavLink>
          </nav>
        )}
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

        <div className="editor-header-menu" ref={menuRef}>
          <button
            className="btn btn-ghost btn-icon"
            title="More options"
            aria-label="More options"
            aria-expanded={isMenuOpen}
            aria-haspopup="true"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <MoreHorizontal size={18} />
          </button>

          {isMenuOpen && (
            <div className="editor-header-dropdown">
              <button onClick={handleDuplicate} className="dropdown-item">
                <Copy size={16} />
                Duplicate Theme
              </button>
              <button onClick={handleSetDefault} className="dropdown-item">
                <CheckCircle size={16} />
                Set as Default
              </button>
              <button onClick={handleExport} className="dropdown-item">
                <Download size={16} />
                Export Theme
              </button>
              <div className="dropdown-divider" />
              <button onClick={handleDelete} className="dropdown-item dropdown-item--danger">
                <Trash2 size={16} />
                Delete Theme
              </button>
            </div>
          )}
        </div>

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

