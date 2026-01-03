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
 */

import { useState, useEffect } from 'react';
import { Settings, Edit3, Check, X } from 'lucide-react';
import ColorEditor from './ColorEditor';
import TypographyEditor from './TypographyEditor';
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
 * @param {Function} props.onUpdate - Update handler
 */
export default function TokenEditorPanel({ token, category, themeId, onUpdate }) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');

  // Reset editing state when token changes
  useEffect(() => {
    setIsEditingName(false);
    setEditedName(token?.name || '');
  }, [token?.id]);

  // Start editing the name
  const handleStartEditName = () => {
    setEditedName(token.name || '');
    setIsEditingName(true);
  };

  // Save the edited name
  const handleSaveName = () => {
    if (editedName.trim() && editedName !== token.name) {
      onUpdate?.({ name: editedName.trim() });
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

  // Render category-specific editor
  const renderEditor = () => {
    switch (category) {
      case 'color':
        return <ColorEditor token={token} onUpdate={onUpdate} />;
      case 'typography':
        return <TypographyEditor token={token} themeId={themeId} onUpdate={onUpdate} />;
      case 'spacing':
        return <SpacingEditor token={token} onUpdate={onUpdate} />;
      case 'shadow':
        return <ShadowEditor token={token} onUpdate={onUpdate} />;
      case 'radius':
        return <RadiusEditor token={token} onUpdate={onUpdate} />;
      case 'grid':
        return <GridEditor token={token} onUpdate={onUpdate} />;
      default:
        return renderGenericEditor();
    }
  };

  // Generic editor for categories without specialized editors yet
  const renderGenericEditor = () => {
    // Get the raw value for display
    const displayValue = typeof token.value === 'object' 
      ? JSON.stringify(token.value, null, 2)
      : token.value;

    return (
      <div className="token-editor-content">
        {/* Basic token info */}
        <div className="token-editor-field">
          <label className="token-editor-label">Name</label>
          <input
            type="text"
            className="token-editor-input"
            value={token.name || ''}
            onChange={(e) => onUpdate?.({ name: e.target.value })}
          />
        </div>

        <div className="token-editor-field">
          <label className="token-editor-label">CSS Variable</label>
          <input
            type="text"
            className="token-editor-input"
            value={token.css_variable || ''}
            disabled
            readOnly
          />
        </div>

        <div className="token-editor-field">
          <label className="token-editor-label">Path</label>
          <input
            type="text"
            className="token-editor-input"
            value={token.path || ''}
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
                onUpdate?.({ value: parsed });
              } catch {
                // If not valid JSON, treat as string
                onUpdate?.({ value: e.target.value });
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
    <div className="token-editor-panel">
      <div className="token-editor-header">
        {isEditingName ? (
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
            <h3 className="token-editor-title">{token.name}</h3>
            <button 
              className="btn btn-ghost btn-icon btn-xs token-name-edit-btn"
              onClick={handleStartEditName}
              title="Edit token name"
            >
              <Edit3 size={14} />
            </button>
          </div>
        )}
        <span className="token-editor-type">{token.type || category}</span>
      </div>
      {renderEditor()}
    </div>
  );
}

