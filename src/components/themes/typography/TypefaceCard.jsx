/**
 * @chunk 2.21 - TypefaceManager
 * @chunk 2.23 - FontUploader integration
 * 
 * TypefaceCard displays a single typeface role slot.
 * Shows assigned typeface or empty state for unassigned roles.
 * For custom typefaces, shows FontUploader to upload font files.
 */

import { useState } from 'react';
import { Type, Edit2, Trash2, Plus, Upload, ChevronDown, ChevronUp } from 'lucide-react';
import FontUploader from './FontUploader';

/**
 * Role metadata for display
 */
const roleInfo = {
  display: {
    label: 'Display',
    description: 'Headlines, hero text',
    icon: '🎯'
  },
  text: {
    label: 'Text',
    description: 'Body copy, paragraphs',
    icon: '📝'
  },
  mono: {
    label: 'Mono',
    description: 'Code, technical content',
    icon: '💻'
  },
  accent: {
    label: 'Accent',
    description: 'Special callouts, decorative',
    icon: '✨'
  }
};

/**
 * TypefaceCard component
 * @param {Object} props
 * @param {string} props.role - Typeface role (display, text, mono, accent)
 * @param {Object|null} props.typeface - Typeface data or null if unassigned
 * @param {Function} props.onEdit - Called when edit is clicked
 * @param {Function} props.onDelete - Called when delete is clicked
 * @param {Function} props.onUpdate - Called when typeface data changes (e.g., font upload)
 */
export default function TypefaceCard({ role, typeface, onEdit, onDelete, onUpdate }) {
  const [showUploader, setShowUploader] = useState(false);
  const info = roleInfo[role] || { label: role, description: '', icon: '🔤' };
  const isAssigned = !!typeface;

  // Generate preview style for the typeface
  const previewStyle = isAssigned ? {
    fontFamily: `"${typeface.family}", ${typeface.fallback || 'sans-serif'}`
  } : {};

  return (
    <div className={`typeface-card ${isAssigned ? 'assigned' : 'empty'}`}>
      <div className="typeface-card-header">
        <div className="typeface-role">
          <span className="typeface-role-icon">{info.icon}</span>
          <div className="typeface-role-info">
            <span className="typeface-role-label">{info.label}</span>
            <span className="typeface-role-desc">{info.description}</span>
          </div>
        </div>
        
        {isAssigned && (
          <div className="typeface-card-actions">
            <button
              className="btn btn-ghost btn-icon"
              onClick={onEdit}
              title="Edit typeface"
              aria-label="Edit typeface"
            >
              <Edit2 size={16} />
            </button>
            <button
              className="btn btn-ghost btn-icon btn-danger"
              onClick={onDelete}
              title="Remove typeface"
              aria-label="Remove typeface"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="typeface-card-content">
        {isAssigned ? (
          <>
            <div className="typeface-preview" style={previewStyle}>
              <span className="typeface-preview-text">
                {typeface.family}
              </span>
            </div>
            <div className="typeface-details">
              <span className="typeface-family">{typeface.family}</span>
              <span className="typeface-meta">
                {typeface.source_type === 'google' ? 'Google Fonts' : 
                 typeface.source_type === 'adobe' ? 'Adobe Fonts' :
                 typeface.source_type === 'system' ? 'System Font' : 'Custom'}
                {typeface.is_variable && ' • Variable'}
              </span>
              {typeface.weights && typeface.weights.length > 0 && (
                <span className="typeface-weights">
                  Weights: {typeface.weights.sort((a, b) => a - b).join(', ')}
                </span>
              )}
            </div>
          </>
        ) : (
          <button
            className="typeface-empty-state"
            onClick={onEdit}
            aria-label={`Assign ${info.label} typeface`}
          >
            <Plus size={24} />
            <span>Assign {info.label} Font</span>
          </button>
        )}
      </div>

      {/* Font files footer - show count or upload prompt for custom fonts */}
      {isAssigned && (
        <div className="typeface-card-footer">
          {typeface.source_type === 'custom' ? (
            <button
              className="typeface-upload-toggle"
              onClick={() => setShowUploader(!showUploader)}
              aria-expanded={showUploader}
            >
              <Upload size={14} />
              <span>
                {typeface.font_files?.length > 0 
                  ? `${typeface.font_files.length} font file${typeface.font_files.length !== 1 ? 's' : ''}`
                  : 'Upload font files'
                }
              </span>
              {showUploader ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          ) : typeface.font_files?.length > 0 ? (
            <>
              <Type size={14} />
              <span>{typeface.font_files.length} font file{typeface.font_files.length !== 1 ? 's' : ''}</span>
            </>
          ) : null}
        </div>
      )}

      {/* FontUploader for custom typefaces */}
      {isAssigned && typeface.source_type === 'custom' && showUploader && (
        <div className="typeface-upload-section">
          <FontUploader
            typefaceId={typeface.id}
            existingFiles={typeface.font_files || []}
            onUploadComplete={() => onUpdate?.()}
            onFileDeleted={() => onUpdate?.()}
          />
        </div>
      )}
    </div>
  );
}

