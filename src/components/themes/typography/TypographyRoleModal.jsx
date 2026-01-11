/**
 * @chunk 2.24 - TypographyRoleEditor
 * 
 * Modal for editing typography role properties.
 * Allows customizing font size, weight, line height, and letter spacing.
 */

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';

/**
 * Type scale presets - combined size/weight/line-height/letter-spacing
 */
const TYPE_SCALE_PRESETS = [
  { label: 'Display', size: '3rem', weight: 700, lineHeight: '1.1', letterSpacing: '-0.02em' },
  { label: 'Heading XL', size: '2.25rem', weight: 700, lineHeight: '1.2', letterSpacing: '-0.01em' },
  { label: 'Heading LG', size: '1.875rem', weight: 600, lineHeight: '1.25', letterSpacing: '-0.01em' },
  { label: 'Heading MD', size: '1.5rem', weight: 600, lineHeight: '1.3', letterSpacing: 'normal' },
  { label: 'Heading SM', size: '1.25rem', weight: 600, lineHeight: '1.4', letterSpacing: 'normal' },
  { label: 'Body Large', size: '1.125rem', weight: 400, lineHeight: '1.6', letterSpacing: 'normal' },
  { label: 'Body', size: '1rem', weight: 400, lineHeight: '1.5', letterSpacing: 'normal' },
  { label: 'Body Small', size: '0.875rem', weight: 400, lineHeight: '1.5', letterSpacing: 'normal' },
  { label: 'Label', size: '0.875rem', weight: 500, lineHeight: '1.4', letterSpacing: '0.01em' },
  { label: 'Caption', size: '0.75rem', weight: 400, lineHeight: '1.4', letterSpacing: '0.02em' },
  { label: 'Code', size: '0.875rem', weight: 400, lineHeight: '1.6', letterSpacing: 'normal' },
];

/**
 * Available font weights
 */
const FONT_WEIGHTS = [
  { value: 100, label: 'Thin' },
  { value: 200, label: 'Extra Light' },
  { value: 300, label: 'Light' },
  { value: 400, label: 'Regular' },
  { value: 500, label: 'Medium' },
  { value: 600, label: 'Semibold' },
  { value: 700, label: 'Bold' },
  { value: 800, label: 'Extra Bold' },
  { value: 900, label: 'Black' },
];

/**
 * Typeface role options
 */
const TYPEFACE_ROLES = [
  { value: 'display', label: 'Display', description: 'Headlines and large text' },
  { value: 'text', label: 'Text', description: 'Body copy and UI text' },
  { value: 'mono', label: 'Mono', description: 'Code and technical text' },
  { value: 'accent', label: 'Accent', description: 'Special emphasis text' },
];

/**
 * TypographyRoleModal component
 * @param {Object} props
 * @param {Object} props.role - Typography role to edit
 * @param {Array} props.typefaces - Available typefaces
 * @param {string} [props.defaultTypefaceRole] - Suggested default if role.typeface_role is missing
 * @param {Function} props.onClose - Close modal callback
 * @param {Function} props.onSave - Save role callback
 * @param {Function} [props.onDelete] - Delete role callback (only for existing roles)
 */
export default function TypographyRoleModal({ role, typefaces, defaultTypefaceRole, onClose, onSave, onDelete }) {
  const [formData, setFormData] = useState({
    role_name: role.role_name || '',
    typeface_role: role.typeface_role || defaultTypefaceRole || 'text',
    font_size: role.font_size || '1rem',
    font_weight: role.font_weight || 400,
    line_height: role.line_height || '1.5',
    letter_spacing: role.letter_spacing || 'normal',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Get typeface by role
   */
  const getTypeface = (typefaceRole) => {
    return typefaces?.find(t => t.role === typefaceRole);
  };

  /**
   * Get available weights for current typeface
   */
  const getAvailableWeights = () => {
    const typeface = getTypeface(formData.typeface_role);
    if (typeface?.weights?.length) {
      return FONT_WEIGHTS.filter(w => typeface.weights.includes(w.value));
    }
    return FONT_WEIGHTS;
  };

  /**
   * Update form field
   */
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  /**
   * Find matching preset for current values
   */
  const getCurrentPreset = () => {
    return TYPE_SCALE_PRESETS.find(
      p => p.size === formData.font_size && p.weight === parseInt(formData.font_weight, 10)
    )?.label || '';
  };

  /**
   * Apply preset values
   */
  const handlePresetChange = (presetLabel) => {
    const preset = TYPE_SCALE_PRESETS.find(p => p.label === presetLabel);
    if (preset) {
      setFormData(prev => ({
        ...prev,
        font_size: preset.size,
        font_weight: preset.weight,
        line_height: preset.lineHeight,
        letter_spacing: preset.letterSpacing,
      }));
    }
    setError(null);
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.role_name?.trim()) {
      setError('Role name is required');
      return;
    }
    if (!/^[a-z][a-z0-9-]*$/.test(formData.role_name.trim())) {
      setError('Role name must be lowercase and use dashes only (e.g., body-md, heading-xl)');
      return;
    }
    if (!formData.font_size) {
      setError('Font size is required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave({
        ...formData,
        font_weight: parseInt(formData.font_weight, 10)
      });
    } catch (err) {
      setError(err.message || 'Failed to save typography role');
    } finally {
      setIsSaving(false);
    }
  };

  const currentTypeface = getTypeface(formData.typeface_role);
  const availableWeights = getAvailableWeights();

  // Build preview font family
  const previewFontFamily = currentTypeface 
    ? `'${currentTypeface.family}', ${currentTypeface.fallback || 'sans-serif'}` 
    : 'inherit';

  return (
    <Modal 
      open={true} 
      onClose={onClose}
      title={`${role?.id ? 'Edit' : 'Create'} "${formData.role_name || 'new-role'}" Role`}
    >
      <form onSubmit={handleSubmit} className="typography-role-form">
        {/* Role Name */}
        <div className="form-group">
          <label htmlFor="role_name">Role name</label>
          <input
            id="role_name"
            type="text"
            value={formData.role_name}
            onChange={(e) => handleChange('role_name', e.target.value)}
            placeholder="e.g., body-md, hero, button-sm"
            disabled={isSaving}
          />
          <p className="form-hint">
            Lowercase with dashes. This becomes the token: <code>--typography-&lt;role&gt;</code>
          </p>
        </div>

        {/* Live Preview */}
        <div className="typography-role-preview-section">
          <label className="form-label">Preview</label>
          <div 
            className="typography-role-preview-text"
            style={{
              fontFamily: previewFontFamily,
              fontSize: formData.font_size,
              fontWeight: formData.font_weight,
              lineHeight: formData.line_height,
              letterSpacing: formData.letter_spacing !== 'normal' ? formData.letter_spacing : undefined
            }}
          >
            The quick brown fox jumps over the lazy dog
          </div>
        </div>

        {/* Typeface Role */}
        <div className="form-group">
          <label htmlFor="typeface_role">Typeface</label>
          <select
            id="typeface_role"
            value={formData.typeface_role}
            onChange={(e) => handleChange('typeface_role', e.target.value)}
          >
            {TYPEFACE_ROLES.map(role => {
              const typeface = getTypeface(role.value);
              return (
                <option key={role.value} value={role.value}>
                  {role.label} {typeface ? `(${typeface.family})` : '(not configured)'}
                </option>
              );
            })}
          </select>
          {currentTypeface && (
            <p className="form-hint">
              Using {currentTypeface.family} from {currentTypeface.source_type || 'custom'} fonts
            </p>
          )}
          {!currentTypeface && (
            <p className="form-hint">
              No typeface configured for this role yet. Add it in <strong>Typefaces</strong> above to enable accurate previews.
            </p>
          )}
        </div>

        {/* Type Scale Preset */}
        <div className="form-group">
          <label htmlFor="preset">Type Scale Preset</label>
          <select
            id="preset"
            value={getCurrentPreset()}
            onChange={(e) => handlePresetChange(e.target.value)}
          >
            <option value="">Custom...</option>
            {TYPE_SCALE_PRESETS.map(preset => (
              <option key={preset.label} value={preset.label}>
                {preset.label} — {preset.size} / {preset.weight}
              </option>
            ))}
          </select>
          <p className="form-hint">
            Select a preset to set size, weight, and line height together
          </p>
        </div>

        {/* Font Size */}
        <div className="form-group">
          <label htmlFor="font_size">Font Size</label>
          <div className="input-with-unit">
            <input
              id="font_size"
              type="text"
              value={formData.font_size}
              onChange={(e) => handleChange('font_size', e.target.value)}
              placeholder="1rem"
            />
          </div>
          <p className="form-hint">
            Use rem, em, or px (e.g., 1rem, 16px, 1.125rem)
          </p>
        </div>

        {/* Font Weight */}
        <div className="form-group">
          <label htmlFor="font_weight">Font Weight</label>
          <select
            id="font_weight"
            value={formData.font_weight}
            onChange={(e) => handleChange('font_weight', e.target.value)}
          >
            {availableWeights.map(weight => (
              <option key={weight.value} value={weight.value}>
                {weight.value} - {weight.label}
              </option>
            ))}
          </select>
        </div>

        {/* Line Height */}
        <div className="form-group">
          <label htmlFor="line_height">Line Height</label>
          <input
            id="line_height"
            type="text"
            value={formData.line_height}
            onChange={(e) => handleChange('line_height', e.target.value)}
            placeholder="1.5"
          />
          <p className="form-hint">
            Unitless value recommended (e.g., 1.5, 1.25)
          </p>
        </div>

        {/* Letter Spacing */}
        <div className="form-group">
          <label htmlFor="letter_spacing">Letter Spacing</label>
          <input
            id="letter_spacing"
            type="text"
            value={formData.letter_spacing}
            onChange={(e) => handleChange('letter_spacing', e.target.value)}
            placeholder="normal"
          />
          <p className="form-hint">
            Use "normal" or a value like -0.02em, 0.05em
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="modal-footer">
          {role?.id && onDelete && (
            <Button
              type="button"
              variant="danger"
              onClick={async () => {
                if (!window.confirm(`Delete "${role.role_name}" role? This will remove its generated token too.`)) return;
                try {
                  setIsSaving(true);
                  await onDelete(role);
                } finally {
                  setIsSaving(false);
                }
              }}
              disabled={isSaving}
            >
              Delete Role
            </Button>
          )}
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}


