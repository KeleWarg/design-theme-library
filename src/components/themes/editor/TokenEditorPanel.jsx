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

import { Settings } from 'lucide-react';
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
 * @param {Function} props.onUpdate - Update handler
 */
export default function TokenEditorPanel({ token, category, onUpdate }) {
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
        return <TypographyEditor token={token} onUpdate={onUpdate} />;
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
        <h3 className="token-editor-title">{token.name}</h3>
        <span className="token-editor-type">{token.type || category}</span>
      </div>
      {renderEditor()}
    </div>
  );
}

