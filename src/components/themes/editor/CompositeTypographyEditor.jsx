/**
 * @chunk 2.16 - CompositeTypographyEditor
 * 
 * Editor component for composite typography tokens that bundle all typography
 * properties together (fontFamily, fontSize, fontWeight, lineHeight, letterSpacing).
 * 
 * This enables LLMs and exports to retrieve complete typography specs
 * with a single token reference.
 */

import { useState, useEffect, useCallback } from 'react';
// Intentionally no deep links into Typography management from here:
// we keep a single clear entry point via the Theme editor header tab.
import { Type } from 'lucide-react';
import { Input, Select } from '../../ui';
import { useTypefaces } from '../../../hooks/useTypefaces';

/**
 * Type scale presets - combined size/weight/line-height/letter-spacing
 * Reused from TypographyRoleModal for consistency
 */
const TYPE_SCALE_PRESETS = [
  { label: 'Display', size: '3rem', weight: 700, lineHeight: 1.1, letterSpacing: '-0.02em' },
  { label: 'Heading XL', size: '2.25rem', weight: 700, lineHeight: 1.2, letterSpacing: '-0.01em' },
  { label: 'Heading LG', size: '1.875rem', weight: 600, lineHeight: 1.25, letterSpacing: '-0.01em' },
  { label: 'Heading MD', size: '1.5rem', weight: 600, lineHeight: 1.3, letterSpacing: 'normal' },
  { label: 'Heading SM', size: '1.25rem', weight: 600, lineHeight: 1.4, letterSpacing: 'normal' },
  { label: 'Body Large', size: '1.125rem', weight: 400, lineHeight: 1.6, letterSpacing: 'normal' },
  { label: 'Body', size: '1rem', weight: 400, lineHeight: 1.5, letterSpacing: 'normal' },
  { label: 'Body Small', size: '0.875rem', weight: 400, lineHeight: 1.5, letterSpacing: 'normal' },
  { label: 'Label', size: '0.875rem', weight: 500, lineHeight: 1.4, letterSpacing: '0.01em' },
  { label: 'Caption', size: '0.75rem', weight: 400, lineHeight: 1.4, letterSpacing: '0.02em' },
  { label: 'Code', size: '0.875rem', weight: 400, lineHeight: 1.6, letterSpacing: 'normal' },
];

/**
 * Font weight options
 */
const FONT_WEIGHTS = [
  { value: 100, label: '100 - Thin' },
  { value: 200, label: '200 - Extra Light' },
  { value: 300, label: '300 - Light' },
  { value: 400, label: '400 - Regular' },
  { value: 500, label: '500 - Medium' },
  { value: 600, label: '600 - Semibold' },
  { value: 700, label: '700 - Bold' },
  { value: 800, label: '800 - Extra Bold' },
  { value: 900, label: '900 - Black' },
];

/**
 * Font size unit options
 */
const SIZE_UNITS = [
  { value: 'rem', label: 'rem' },
  { value: 'px', label: 'px' },
  { value: 'em', label: 'em' },
];

/**
 * Letter spacing unit options
 */
const SPACING_UNITS = [
  { value: 'em', label: 'em' },
  { value: 'px', label: 'px' },
  { value: '', label: 'normal' },
];

/**
 * Detect token type from path/name to determine which property the value represents
 */
function detectTokenType(token) {
  const path = (token?.path || token?.name || '').toLowerCase();
  const type = (token?.type || '').toLowerCase();
  
  // Check for composite type first
  if (type === 'typography-composite') return 'composite';
  
  // Detect from path/name
  if (path.includes('family') || type === 'fontfamily') return 'font-family';
  if (path.includes('weight') || type === 'fontweight') return 'font-weight';
  if (path.includes('line-height') || path.includes('lineheight') || path.includes('leading') || type === 'lineheight') return 'line-height';
  if (path.includes('letter-spacing') || path.includes('letterspacing') || path.includes('tracking') || type === 'letterspacing') return 'letter-spacing';
  if (path.includes('size') || type === 'fontsize' || type === 'dimension') return 'font-size';
  
  return 'font-size'; // Default
}

/**
 * Parse ANY typography token value - handles both composite and simple formats
 * Auto-detects the token type and maps the value to the appropriate field
 */
function parseCompositeValue(value, token) {
  const defaultResult = {
    fontFamily: '',
    fontSize: { value: 1, unit: 'rem' },
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: { value: 0, unit: '', isNormal: true },
  };

  if (!value) return defaultResult;

  // Check if it's already a composite object (has fontFamily, fontSize, etc.)
  if (typeof value === 'object' && (value.fontFamily !== undefined || value.fontSize !== undefined || value.fontWeight !== undefined)) {
    return {
      fontFamily: value.fontFamily || '',
      fontSize: parseDimension(value.fontSize, defaultResult.fontSize),
      fontWeight: value.fontWeight || 400,
      lineHeight: parseLineHeight(value.lineHeight),
      letterSpacing: parseLetterSpacing(value.letterSpacing),
    };
  }

  // Otherwise, detect what type of simple token this is and map accordingly
  const tokenType = detectTokenType(token);
  
  switch (tokenType) {
    case 'font-family': {
      // Value is a font family string
      const family = typeof value === 'string' ? value : (value?.fontFamily || '');
      return { ...defaultResult, fontFamily: family };
    }
    
    case 'font-weight': {
      // Value is a weight number
      let weight = 400;
      if (typeof value === 'number') weight = value;
      else if (typeof value === 'string') weight = parseInt(value, 10) || 400;
      else if (typeof value === 'object' && value.value !== undefined) weight = value.value;
      return { ...defaultResult, fontWeight: weight };
    }
    
    case 'line-height': {
      // Value is a line-height number
      return { ...defaultResult, lineHeight: parseLineHeight(value) };
    }
    
    case 'letter-spacing': {
      // Value is a letter-spacing value
      return { ...defaultResult, letterSpacing: parseLetterSpacing(value) };
    }
    
    case 'font-size':
    default: {
      // Value is a dimension object or string
      return { ...defaultResult, fontSize: parseDimension(value, defaultResult.fontSize) };
    }
  }
}

/**
 * Parse dimension value (fontSize)
 */
function parseDimension(value, defaultVal) {
  if (!value) return defaultVal;
  if (typeof value === 'string') {
    const match = value.match(/^(-?[\d.]+)(rem|px|em|%)?$/);
    if (match) {
      return { value: parseFloat(match[1]), unit: match[2] || 'rem' };
    }
    return defaultVal;
  }
  if (typeof value === 'object' && value.value !== undefined) {
    return { value: value.value, unit: value.unit || 'rem' };
  }
  if (typeof value === 'number') {
    return { value, unit: 'rem' };
  }
  return defaultVal;
}

/**
 * Parse line height (can be unitless number or string)
 */
function parseLineHeight(value) {
  if (value === undefined || value === null) return 1.5;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const num = parseFloat(value);
    return isNaN(num) ? 1.5 : num;
  }
  if (typeof value === 'object' && value.value !== undefined) {
    return parseFloat(value.value) || 1.5;
  }
  return 1.5;
}

/**
 * Parse letter spacing
 */
function parseLetterSpacing(value) {
  if (!value || value === 'normal') {
    return { value: 0, unit: '', isNormal: true };
  }
  if (typeof value === 'string') {
    const match = value.match(/^(-?[\d.]+)(em|px)?$/);
    if (match) {
      return { value: parseFloat(match[1]), unit: match[2] || 'em', isNormal: false };
    }
    return { value: 0, unit: '', isNormal: true };
  }
  if (typeof value === 'object' && value.value !== undefined) {
    return { value: value.value, unit: value.unit || 'em', isNormal: false };
  }
  if (typeof value === 'number') {
    return { value, unit: 'em', isNormal: false };
  }
  return { value: 0, unit: '', isNormal: true };
}

/**
 * CompositeTypographyEditor component
 * 
 * @param {Object} props
 * @param {Object} props.token - Token being edited
 * @param {string} props.themeId - Theme ID for fetching typefaces
 * @param {Function} props.onUpdate - Callback when value changes
 */
export default function CompositeTypographyEditor({ token, themeId, onUpdate }) {
  const [formData, setFormData] = useState(() => {
    return parseCompositeValue(token?.value, token);
  });
  
  // Fetch typefaces for font family picker
  const { data: typefaces } = useTypefaces(themeId);
  
  // Detect if this was originally a simple token (for UI hints)
  const originalTokenType = detectTokenType(token);
  const isSimpleToken = originalTokenType !== 'composite';
  
  // Reset form when token changes
  useEffect(() => {
    setFormData(parseCompositeValue(token?.value, token));
  }, [token?.id]);

  /**
   * Build composite value object from form data
   * Also returns type update if converting from simple token
   */
  const buildCompositeValue = useCallback((data) => {
    const compositeValue = {
      fontFamily: data.fontFamily || undefined,
      fontSize: {
        value: data.fontSize.value,
        unit: data.fontSize.unit,
      },
      fontWeight: data.fontWeight,
      lineHeight: data.lineHeight,
      letterSpacing: data.letterSpacing.isNormal
        ? 'normal'
        : {
            value: data.letterSpacing.value,
            unit: data.letterSpacing.unit || 'em',
          },
    };
    return compositeValue;
  }, []);

  /**
   * Build the update payload - includes type conversion if needed
   */
  const buildUpdatePayload = useCallback((data) => {
    const payload = { value: buildCompositeValue(data) };
    // Convert simple tokens to composite type
    if (isSimpleToken) {
      payload.type = 'typography-composite';
    }
    return payload;
  }, [buildCompositeValue, isSimpleToken]);

  /**
   * Handle form field change and update token
   */
  const handleChange = useCallback((field, value) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      // Trigger update with new composite value (and type conversion if needed)
      onUpdate?.(buildUpdatePayload(next));
      return next;
    });
  }, [onUpdate, buildUpdatePayload]);

  /**
   * Handle nested field change (fontSize, letterSpacing)
   */
  const handleNestedChange = useCallback((field, subField, value) => {
    setFormData(prev => {
      const next = {
        ...prev,
        [field]: { ...prev[field], [subField]: value },
      };
      onUpdate?.(buildUpdatePayload(next));
      return next;
    });
  }, [onUpdate, buildUpdatePayload]);

  /**
   * Apply type scale preset
   */
  const handlePresetChange = useCallback((presetLabel) => {
    if (!presetLabel) return;
    
    const preset = TYPE_SCALE_PRESETS.find(p => p.label === presetLabel);
    if (!preset) return;

    // Parse preset values
    const sizeMatch = preset.size.match(/^([\d.]+)(rem|px|em)$/);
    const letterMatch = preset.letterSpacing.match(/^(-?[\d.]+)(em|px)?$/);
    
    const newData = {
      ...formData,
      fontSize: sizeMatch 
        ? { value: parseFloat(sizeMatch[1]), unit: sizeMatch[2] }
        : formData.fontSize,
      fontWeight: preset.weight,
      lineHeight: preset.lineHeight,
      letterSpacing: preset.letterSpacing === 'normal'
        ? { value: 0, unit: '', isNormal: true }
        : letterMatch
          ? { value: parseFloat(letterMatch[1]), unit: letterMatch[2] || 'em', isNormal: false }
          : formData.letterSpacing,
    };

    setFormData(newData);
    onUpdate?.(buildUpdatePayload(newData));
  }, [formData, onUpdate, buildUpdatePayload]);

  /**
   * Find matching preset for current values
   */
  const getCurrentPreset = () => {
    const sizeStr = `${formData.fontSize.value}${formData.fontSize.unit}`;
    const preset = TYPE_SCALE_PRESETS.find(
      p => p.size === sizeStr && p.weight === formData.fontWeight
    );
    return preset?.label || '';
  };

  /**
   * Build font family options from typefaces
   */
  const fontFamilyOptions = [
    { value: '', label: 'Select a font...' },
    ...(typefaces?.map(t => ({
      value: t.family,
      label: `${t.family} (${t.role})`,
    })) || []),
  ];

  /**
   * Get preview style
   */
  const getPreviewStyle = () => {
    const style = {
      fontFamily: formData.fontFamily || 'inherit',
      fontSize: `${Math.min(formData.fontSize.value, 4)}${formData.fontSize.unit}`,
      fontWeight: formData.fontWeight,
      lineHeight: formData.lineHeight,
    };
    
    if (!formData.letterSpacing.isNormal) {
      style.letterSpacing = `${formData.letterSpacing.value}${formData.letterSpacing.unit || 'em'}`;
    }
    
    return style;
  };

  /**
   * Format CSS output for display
   */
  const formatCSSOutput = () => {
    const baseVar = token?.css_variable || '--typography-token';
    const lines = [];
    
    if (formData.fontFamily) {
      lines.push(`${baseVar}-family: ${formData.fontFamily};`);
    }
    lines.push(`${baseVar}-size: ${formData.fontSize.value}${formData.fontSize.unit};`);
    lines.push(`${baseVar}-weight: ${formData.fontWeight};`);
    lines.push(`${baseVar}-line-height: ${formData.lineHeight};`);
    
    const letterSpacing = formData.letterSpacing.isNormal
      ? 'normal'
      : `${formData.letterSpacing.value}${formData.letterSpacing.unit || 'em'}`;
    lines.push(`${baseVar}-letter-spacing: ${letterSpacing};`);
    
    return lines;
  };

  /**
   * Get friendly name for original token type
   */
  const getOriginalTypeName = () => {
    switch (originalTokenType) {
      case 'font-family': return 'font family';
      case 'font-weight': return 'font weight';
      case 'font-size': return 'font size';
      case 'line-height': return 'line height';
      case 'letter-spacing': return 'letter spacing';
      default: return 'typography';
    }
  };

  return (
    <div className="composite-typography-editor">
      {/* Conversion notice for simple tokens */}
      {isSimpleToken && (
        <div className="composite-typography-notice">
          <p>
            This token was originally a <strong>{getOriginalTypeName()}</strong> token.
            Editing will convert it to a <strong>composite typography token</strong> with all properties.
          </p>
        </div>
      )}
      
      {/* Live Preview */}
      <div className="composite-typography-preview">
        <div className="composite-typography-preview-box">
          <p className="composite-typography-preview-text" style={getPreviewStyle()}>
            The quick brown fox jumps over the lazy dog
          </p>
          <p className="composite-typography-preview-text composite-typography-preview-multiline" style={getPreviewStyle()}>
            Typography is the art and technique of arranging type to make written language legible, readable, and appealing when displayed.
          </p>
        </div>
      </div>

      {/* Type Scale Preset */}
      <div className="composite-typography-field">
        <label className="composite-typography-label">
          <Type size={14} />
          Type Scale Preset
        </label>
        <Select
          value={getCurrentPreset()}
          onChange={handlePresetChange}
          options={[
            { value: '', label: 'Custom...' },
            ...TYPE_SCALE_PRESETS.map(p => ({
              value: p.label,
              label: `${p.label} — ${p.size} / ${p.weight}`,
            })),
          ]}
        />
        <p className="composite-typography-hint">
          Select a preset to set size, weight, and line height together
        </p>
      </div>

      {/* Font Family */}
      <div className="composite-typography-field">
        <label className="composite-typography-label">Font Family</label>
        <Select
          value={formData.fontFamily}
          onChange={(val) => handleChange('fontFamily', val)}
          options={fontFamilyOptions}
        />
        {fontFamilyOptions.length <= 1 && themeId && (
          <p className="composite-typography-hint">
            No typefaces configured. Use the <strong>Typography</strong> tab for this theme to add fonts.
          </p>
        )}
      </div>

      {/* Font Size */}
      <div className="composite-typography-field composite-typography-field-row">
        <div className="composite-typography-field-main">
          <label className="composite-typography-label">Font Size</label>
          <Input
            type="number"
            value={formData.fontSize.value}
            onChange={(e) => handleNestedChange('fontSize', 'value', parseFloat(e.target.value) || 1)}
            min={0.25}
            step={0.125}
          />
        </div>
        <div className="composite-typography-field-unit">
          <label className="composite-typography-label">Unit</label>
          <Select
            value={formData.fontSize.unit}
            onChange={(val) => handleNestedChange('fontSize', 'unit', val)}
            options={SIZE_UNITS}
          />
        </div>
      </div>

      {/* Font Weight */}
      <div className="composite-typography-field">
        <label className="composite-typography-label">Font Weight</label>
        <Select
          value={String(formData.fontWeight)}
          onChange={(val) => handleChange('fontWeight', parseInt(val, 10))}
          options={FONT_WEIGHTS.map(w => ({
            value: String(w.value),
            label: w.label,
          }))}
        />
      </div>

      {/* Line Height */}
      <div className="composite-typography-field">
        <label className="composite-typography-label">Line Height</label>
        <Input
          type="number"
          value={formData.lineHeight}
          onChange={(e) => handleChange('lineHeight', parseFloat(e.target.value) || 1.5)}
          min={0.5}
          max={4}
          step={0.05}
        />
        <p className="composite-typography-hint">Unitless ratio (e.g., 1.5 = 150% of font size)</p>
      </div>

      {/* Letter Spacing */}
      <div className="composite-typography-field composite-typography-field-row">
        <div className="composite-typography-field-main">
          <label className="composite-typography-label">Letter Spacing</label>
          <Input
            type="number"
            value={formData.letterSpacing.isNormal ? 0 : formData.letterSpacing.value}
            onChange={(e) => {
              const val = parseFloat(e.target.value) || 0;
              handleNestedChange('letterSpacing', 'value', val);
              if (val !== 0) {
                handleNestedChange('letterSpacing', 'isNormal', false);
              }
            }}
            step={0.01}
            disabled={formData.letterSpacing.isNormal}
          />
        </div>
        <div className="composite-typography-field-unit">
          <label className="composite-typography-label">Unit</label>
          <Select
            value={formData.letterSpacing.isNormal ? '' : formData.letterSpacing.unit}
            onChange={(val) => {
              if (val === '') {
                setFormData(prev => {
                  const next = {
                    ...prev,
                    letterSpacing: { value: 0, unit: '', isNormal: true },
                  };
                  onUpdate?.(buildUpdatePayload(next));
                  return next;
                });
              } else {
                setFormData(prev => {
                  const next = {
                    ...prev,
                    letterSpacing: { ...prev.letterSpacing, unit: val, isNormal: false },
                  };
                  onUpdate?.(buildUpdatePayload(next));
                  return next;
                });
              }
            }}
            options={SPACING_UNITS}
          />
        </div>
      </div>

      {/* CSS Output */}
      <div className="composite-typography-output">
        <label className="composite-typography-label">CSS Output</label>
        <div className="composite-typography-output-code">
          {formatCSSOutput().map((line, i) => (
            <code key={i}>{line}</code>
          ))}
        </div>
      </div>
    </div>
  );
}
