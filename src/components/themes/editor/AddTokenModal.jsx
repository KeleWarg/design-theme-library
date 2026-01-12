/**
 * @chunk 2.14 - TokenList
 * 
 * Modal for adding a new token to the current category.
 * Includes validation and category-specific default values.
 */

import { useState, useEffect } from 'react';
import { Modal, Input, Button, Select } from '../../ui';

/**
 * Generate CSS variable name from token name and category
 */
function generateCSSVariable(name, category) {
  if (!name) return '';
  
  // Convert to lowercase, replace spaces and special chars with dashes
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  return `--${category}-${slug}`;
}

/**
 * Get default value for a token based on its category and type
 */
function getDefaultValue(category, type) {
  // For composite typography tokens, return the structured default
  if (category === 'typography' && type === 'typography-composite') {
    return DEFAULT_COMPOSITE_TYPOGRAPHY;
  }
  
  switch (category) {
    case 'color':
      return '#000000';
    case 'typography':
      return { value: 16, unit: 'px' };
    case 'spacing':
      return '16px';
    case 'shadow':
      return '0 1px 3px rgba(0, 0, 0, 0.1)';
    case 'radius':
      return '4px';
    case 'grid':
      return { columns: 12, gutter: '16px' };
    default:
      return '';
  }
}

/**
 * Token type options by category
 */
const TOKEN_TYPES = {
  color: ['color', 'gradient'],
  typography: ['typography-composite', 'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing'],
  spacing: ['spacing', 'margin', 'padding', 'gap'],
  shadow: ['shadow', 'boxShadow', 'textShadow'],
  radius: ['borderRadius'],
  grid: ['columns', 'gutter', 'container'],
  other: ['custom']
};

/**
 * Type labels for display
 */
const TYPE_LABELS = {
  'typography-composite': 'Composite (All Properties)',
  'fontFamily': 'Font Family',
  'fontSize': 'Font Size',
  'fontWeight': 'Font Weight',
  'lineHeight': 'Line Height',
  'letterSpacing': 'Letter Spacing',
};

/**
 * Default composite typography value
 */
const DEFAULT_COMPOSITE_TYPOGRAPHY = {
  fontFamily: 'Inter, sans-serif',
  fontSize: { value: 1, unit: 'rem' },
  fontWeight: 400,
  lineHeight: 1.5,
  letterSpacing: 'normal',
};

/**
 * Add Token Modal
 * @param {Object} props
 * @param {boolean} props.open - Whether modal is open
 * @param {string} props.category - Token category
 * @param {Function} props.onClose - Close handler
 * @param {Function} props.onAdd - Add token handler
 */
export default function AddTokenModal({ open, category, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    value: '',
    path: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or category changes
  useEffect(() => {
    if (open) {
      const defaultType = TOKEN_TYPES[category]?.[0] || 'custom';
      const defaultValue = getDefaultValue(category, defaultType);
      
      setFormData({
        name: '',
        type: defaultType,
        value: typeof defaultValue === 'object' ? JSON.stringify(defaultValue, null, 2) : defaultValue,
        path: ''
      });
      setErrors({});
    }
  }, [open, category]);

  // Update default value when type changes
  const handleTypeChange = (newType) => {
    const defaultValue = getDefaultValue(category, newType);
    setFormData(prev => ({
      ...prev,
      type: newType,
      value: typeof defaultValue === 'object' ? JSON.stringify(defaultValue, null, 2) : defaultValue,
    }));
  };

  // Update CSS variable preview when name changes
  const cssVariable = generateCSSVariable(formData.name, category);

  // Handle input changes
  const handleChange = (field) => (e) => {
    const value = e.target?.value ?? e;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Validate form
  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Token name is required';
    } else if (!/^[a-zA-Z][a-zA-Z0-9\s-]*$/.test(formData.name)) {
      newErrors.name = 'Name must start with a letter and contain only letters, numbers, spaces, and dashes';
    }
    
    if (!formData.value.trim()) {
      newErrors.value = 'Token value is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      // Parse value if it looks like JSON
      let parsedValue = formData.value;
      if (formData.value.trim().startsWith('{') || formData.value.trim().startsWith('[')) {
        try {
          parsedValue = JSON.parse(formData.value);
        } catch {
          // Keep as string if not valid JSON
        }
      }
      
      const tokenData = {
        name: formData.name.trim(),
        type: formData.type,
        value: parsedValue,
        path: formData.path || `${category}/${formData.name.toLowerCase().replace(/\s+/g, '-')}`,
        css_variable: cssVariable,
        category
      };
      
      await onAdd(tokenData);
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to add token' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const typeOptions = (TOKEN_TYPES[category] || TOKEN_TYPES.other).map(type => ({
    value: type,
    label: TYPE_LABELS[type] || type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1')
  }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Add ${category?.charAt(0).toUpperCase() + category?.slice(1)} Token`}
      size="default"
    >
      <form onSubmit={handleSubmit} className="add-token-form">
        <Input
          label="Token Name"
          placeholder="e.g., Primary Blue, Body Text"
          value={formData.name}
          onChange={handleChange('name')}
          error={errors.name}
          required
          autoFocus
        />
        
        {cssVariable && (
          <div className="css-variable-preview">
            <span className="css-variable-label">CSS Variable:</span>
            <code className="css-variable-value">{cssVariable}</code>
          </div>
        )}

        <div className="form-field">
          <label className="form-label">Type</label>
          <Select
            options={typeOptions}
            value={formData.type}
            onChange={handleTypeChange}
          />
          {category === 'typography' && formData.type === 'typography-composite' && (
            <p className="form-hint" style={{ marginTop: '4px', fontSize: '12px', color: 'var(--color-muted-foreground)' }}>
              Composite tokens bundle font family, size, weight, line height, and letter spacing together.
            </p>
          )}
        </div>

        {category === 'color' ? (
          <div className="form-field">
            <label className="form-label">Value</label>
            <div className="color-value-input">
              <input
                type="color"
                value={formData.value.startsWith('#') ? formData.value : '#000000'}
                onChange={(e) => handleChange('value')(e.target.value)}
                className="color-picker-input"
              />
              <input
                type="text"
                value={formData.value}
                onChange={handleChange('value')}
                placeholder="#000000"
                className="form-input"
              />
            </div>
            {errors.value && <span className="form-error">{errors.value}</span>}
          </div>
        ) : (
          <div className="form-field">
            <label className="form-label">Value</label>
            <textarea
              value={formData.value}
              onChange={handleChange('value')}
              placeholder={getValuePlaceholder(category, formData.type)}
              className="form-textarea"
              rows={(category === 'typography' && formData.type === 'typography-composite') ? 8 : (category === 'typography' || category === 'grid' ? 4 : 2)}
            />
            {errors.value && <span className="form-error">{errors.value}</span>}
          </div>
        )}

        <Input
          label="Path (optional)"
          placeholder={`e.g., ${category}/primary`}
          value={formData.path}
          onChange={handleChange('path')}
          error={errors.path}
        />

        {errors.submit && (
          <div className="form-error-message">{errors.submit}</div>
        )}

        <div className="modal-actions">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary"
            loading={isSubmitting}
          >
            Add Token
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/**
 * Get placeholder text for value input based on category and type
 */
function getValuePlaceholder(category, type) {
  // Handle composite typography
  if (category === 'typography' && type === 'typography-composite') {
    return '{\n  "fontFamily": "Inter, sans-serif",\n  "fontSize": {"value": 1, "unit": "rem"},\n  "fontWeight": 400,\n  "lineHeight": 1.5,\n  "letterSpacing": "normal"\n}';
  }
  
  switch (category) {
    case 'color':
      return '#3b82f6 or rgb(59, 130, 246)';
    case 'typography':
      return '{"value": 16, "unit": "px"}';
    case 'spacing':
      return '16px or 1rem';
    case 'shadow':
      return '0 4px 6px rgba(0, 0, 0, 0.1)';
    case 'radius':
      return '8px or 0.5rem';
    case 'grid':
      return '{"columns": 12, "gutter": "16px"}';
    default:
      return 'Enter token value';
  }
}


