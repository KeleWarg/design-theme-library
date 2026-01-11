/**
 * @chunk 2.12 - ThemeEditor Layout
 * @chunk 2.15 - ColorEditor
 * @chunk 2.16 - TypographyEditor
 * @chunk 2.17 - SpacingEditor
 * @chunk 2.18 - ShadowEditor
 * @chunk 2.19 - RadiusEditor
 * @chunk 2.20 - GridEditor
 * 
 * Token editor panel that routes to category-specific editors.
 * Features explicit Save/Cancel buttons for changes.
 */

import { useState, useEffect, useCallback } from 'react';
import { Settings, Edit3, Check, X, Save, RotateCcw } from 'lucide-react';
import ColorEditor from './ColorEditor';
import CompositeTypographyEditor from './CompositeTypographyEditor';
import SpacingEditor from './SpacingEditor';
import ShadowEditor from './ShadowEditor';
import RadiusEditor from './RadiusEditor';
import GridEditor from './GridEditor';

/**
 * Panel for editing the selected token
 * Routes to category-specific editors based on token category
 * 
 * @param {Object} props
 * @param {Object} props.token - Selected token to edit
 * @param {string} props.category - Token category
 * @param {string} props.themeId - Theme ID for fetching typefaces
 * @param {Function} props.onUpdate - Update handler (saves to DB)
 * @param {Function} props.onClose - Close handler for mobile view
 */
export default function TokenEditorPanel({ token, category, themeId, onUpdate, onClose }) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  
  // Pending changes state - accumulates changes until Save is clicked
  const [pendingChanges, setPendingChanges] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Reset editing state and pending changes when token changes
  useEffect(() => {
    setIsEditingName(false);
    setEditedName(token?.name || '');
    setPendingChanges({});
    setHasChanges(false);
  }, [token?.id]);

  // Warn user before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges]);

  /**
   * Handle local change - accumulates changes without saving
   * Changes are only persisted when Save is clicked
   */
  const handleLocalChange = useCallback((updates) => {
    setPendingChanges(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  }, []);

  /**
   * Save all pending changes
   */
  const handleSaveChanges = useCallback(async () => {
    if (!hasChanges || Object.keys(pendingChanges).length === 0) return;
    
    setIsSaving(true);
    try {
      await onUpdate?.(pendingChanges);
      setPendingChanges({});
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save changes:', error);
    } finally {
      setIsSaving(false);
    }
  }, [hasChanges, pendingChanges, onUpdate]);

  /**
   * Cancel all pending changes
   */
  const handleCancelChanges = useCallback(() => {
    setPendingChanges({});
    setHasChanges(false);
  }, []);

  /**
   * Get the current value for display, merging original token with pending changes
   */
  const getDisplayToken = useCallback(() => {
    if (!token) return null;
    return { ...token, ...pendingChanges };
  }, [token, pendingChanges]);

  // Role-derived composite tokens are generated from Typography Scale and should be read-only here.
  const isReadOnlyToken =
    category === 'typography' &&
    token?.type === 'typography-composite' &&
    typeof token?.path === 'string' &&
    token.path.startsWith('typography/role/');

  // Start editing the name
  const handleStartEditName = () => {
    if (isReadOnlyToken) return;
    setEditedName(token.name || '');
    setIsEditingName(true);
  };

  // Save the edited name (adds to pending changes)
  const handleSaveName = () => {
    if (editedName.trim() && editedName !== token.name) {
      handleLocalChange({ name: editedName.trim() });
    }
    setIsEditingName(false);
  };

  // Cancel editing
  const handleCancelEditName = () => {
    setEditedName(token.name || '');
    setIsEditingName(false);
  };

  // Handle keydown in name input
  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      handleCancelEditName();
    }
  };

  if (!token) {
    return (
      <div className="token-editor-panel token-editor-empty">
        <div className="token-editor-empty-content">
          <Settings size={48} strokeWidth={1} />
          <h3>Select a token</h3>
          <p>Choose a token from the list to edit its properties</p>
        </div>
      </div>
    );
  }

  // Get the display token with pending changes merged
  const displayToken = getDisplayToken();

  const isGeneratedTypographyRoleToken =
    category === 'typography' &&
    displayToken?.type === 'typography-composite' &&
    typeof displayToken?.path === 'string' &&
    displayToken.path.startsWith('typography/role/');

  // Render category-specific editor - uses handleLocalChange for pending changes
  const renderEditor = () => {
    switch (category) {
      case 'color':
        return <ColorEditor token={displayToken} onUpdate={handleLocalChange} />;
      case 'typography':
        // Role-derived composite tokens are generated from Typography Scale (typography_roles).
        // Treat them as read-only in the token editor to prevent drift/confusion.
        if (isGeneratedTypographyRoleToken) {
          const roleName = displayToken.path.split('/').pop();
          const composite = displayToken.value || {};
          const previewStyle = {
            fontFamily: composite.fontFamily || 'var(--font-family-text, system-ui, sans-serif)',
            fontSize: typeof composite.fontSize === 'string'
              ? composite.fontSize
              : (composite.fontSize?.value !== undefined
                ? `${composite.fontSize.value}${composite.fontSize.unit ?? 'rem'}`
                : '1rem'),
            fontWeight: composite.fontWeight ?? 400,
            lineHeight: composite.lineHeight ?? 1.5,
            letterSpacing:
              composite.letterSpacing && composite.letterSpacing !== 'normal'
                ? (typeof composite.letterSpacing === 'string'
                  ? composite.letterSpacing
                  : (composite.letterSpacing?.value !== undefined
                    ? `${composite.letterSpacing.value}${composite.letterSpacing.unit ?? 'em'}`
                    : undefined))
                : undefined,
            color: 'var(--foreground-heading, var(--foreground-body, currentColor))',
            margin: 0,
          };

          return (
            <div className="token-editor-content">
              <div className="token-editor-placeholder-notice">
                <p style={{ margin: 0 }}>
                  This is a <strong>generated</strong> composite typography token sourced from <strong>Typography Scale</strong>.
                  Edit it on the Typography page and it will sync back here automatically.
                </p>
              </div>

              <div className="token-editor-field">
                <label className="token-editor-label">Preview</label>
                <div
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(0,0,0,0.03)',
                    border: '1px solid rgba(0,0,0,0.06)',
                  }}
                >
                  <p style={previewStyle}>The quick brown fox jumps over the lazy dog</p>
                </div>
              </div>

              <div className="token-editor-field">
                <label className="token-editor-label">Role</label>
                <input
                  type="text"
                  className="token-editor-input"
                  value={roleName || ''}
                  disabled
                  readOnly
                />
              </div>

              <div className="token-editor-field">
                <label className="token-editor-label">Font Family</label>
                <input
                  type="text"
                  className="token-editor-input"
                  value={composite.fontFamily || ''}
                  disabled
                  readOnly
                />
              </div>

              <div className="token-editor-field">
                <label className="token-editor-label">Font Size</label>
                <input
                  type="text"
                  className="token-editor-input"
                  value={typeof composite.fontSize === 'string' ? composite.fontSize : JSON.stringify(composite.fontSize ?? '')}
                  disabled
                  readOnly
                />
              </div>

              <div className="token-editor-field">
                <label className="token-editor-label">Font Weight</label>
                <input
                  type="text"
                  className="token-editor-input"
                  value={composite.fontWeight ?? ''}
                  disabled
                  readOnly
                />
              </div>

              <div className="token-editor-field">
                <label className="token-editor-label">Line Height</label>
                <input
                  type="text"
                  className="token-editor-input"
                  value={composite.lineHeight ?? ''}
                  disabled
                  readOnly
                />
              </div>

              <div className="token-editor-field">
                <label className="token-editor-label">Letter Spacing</label>
                <input
                  type="text"
                  className="token-editor-input"
                  value={typeof composite.letterSpacing === 'string' ? composite.letterSpacing : JSON.stringify(composite.letterSpacing ?? '')}
                  disabled
                  readOnly
                />
              </div>
            </div>
          );
        }

        // For non-generated typography tokens, use the composite editor (it can convert legacy simple tokens).
        return <CompositeTypographyEditor token={displayToken} themeId={themeId} onUpdate={handleLocalChange} />;
      case 'spacing':
        return <SpacingEditor token={displayToken} onUpdate={handleLocalChange} />;
      case 'shadow':
        return <ShadowEditor token={displayToken} onUpdate={handleLocalChange} />;
      case 'radius':
        return <RadiusEditor token={displayToken} onUpdate={handleLocalChange} />;
      case 'grid':
        return <GridEditor token={displayToken} onUpdate={handleLocalChange} />;
      default:
        return renderGenericEditor();
    }
  };

  // Generic editor for categories without specialized editors yet
  const renderGenericEditor = () => {
    // Get the raw value for display
    const displayValue = typeof displayToken.value === 'object' 
      ? JSON.stringify(displayToken.value, null, 2)
      : displayToken.value;

    return (
      <div className="token-editor-content">
        {/* Basic token info */}
        <div className="token-editor-field">
          <label className="token-editor-label">Name</label>
          <input
            type="text"
            className="token-editor-input"
            value={displayToken.name || ''}
            onChange={(e) => handleLocalChange({ name: e.target.value })}
          />
        </div>

        <div className="token-editor-field">
          <label className="token-editor-label">CSS Variable</label>
          <input
            type="text"
            className="token-editor-input"
            value={displayToken.css_variable || ''}
            disabled
            readOnly
          />
        </div>

        <div className="token-editor-field">
          <label className="token-editor-label">Path</label>
          <input
            type="text"
            className="token-editor-input"
            value={displayToken.path || ''}
            disabled
            readOnly
          />
        </div>

        <div className="token-editor-field">
          <label className="token-editor-label">Value</label>
          <textarea
            className="token-editor-textarea"
            value={displayValue}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleLocalChange({ value: parsed });
              } catch {
                // If not valid JSON, treat as string
                handleLocalChange({ value: e.target.value });
              }
            }}
            rows={4}
          />
        </div>

        <div className="token-editor-placeholder-notice">
          <p>
            Using generic editor for this token category.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className={`token-editor-panel ${hasChanges ? 'has-changes' : ''}`}>
      <div className="token-editor-header">
        {/* Close button */}
        <button 
          className="token-editor-close"
          onClick={onClose}
          aria-label="Close editor"
        >
          <X size={18} />
        </button>
        {isReadOnlyToken ? (
          <div className="token-name-display-row">
            <h3 className="token-editor-title">{displayToken.name}</h3>
          </div>
        ) : isEditingName ? (
          <div className="token-name-edit-row">
            <input
              type="text"
              className="token-name-input"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onKeyDown={handleNameKeyDown}
              autoFocus
            />
            <button 
              className="btn btn-ghost btn-icon btn-xs token-name-action"
              onClick={handleSaveName}
              title="Save name"
            >
              <Check size={14} />
            </button>
            <button 
              className="btn btn-ghost btn-icon btn-xs token-name-action"
              onClick={handleCancelEditName}
              title="Cancel"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="token-name-display-row">
            <h3 className="token-editor-title">{displayToken.name}</h3>
            <button 
              className="btn btn-ghost btn-icon btn-xs token-name-edit-btn"
              onClick={handleStartEditName}
              title="Edit token name"
            >
              <Edit3 size={14} />
            </button>
          </div>
        )}
        <span className="token-editor-type">{displayToken.type || category}</span>
      </div>
      
      {renderEditor()}
      
      {/* Save/Cancel buttons - shown when there are pending changes */}
      {hasChanges && !isReadOnlyToken && (
        <div className="token-editor-actions">
          <div className="token-editor-actions-hint">
            You have unsaved changes
          </div>
          <div className="token-editor-actions-buttons">
            <button 
              className="btn btn-secondary btn-sm"
              onClick={handleCancelChanges}
              disabled={isSaving}
            >
              <RotateCcw size={14} />
              Cancel
            </button>
            <button 
              className="btn btn-primary btn-sm"
              onClick={handleSaveChanges}
              disabled={isSaving}
            >
              <Save size={14} />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

