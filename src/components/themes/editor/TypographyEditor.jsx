/**
 * @chunk 2.16 - TypographyEditor
 * 
 * Editor component for typography tokens (font size, weight, line height, letter spacing).
 * Features unit selection, preset values, and live preview.
 */

import { useState, useEffect, useCallback } from 'react';
import { Input, Select } from '../../ui';
import { cn } from '../../../lib/utils';

/**
 * Unit options for typography values
 */
const UNIT_OPTIONS = [
  { value: 'px', label: 'px' },
  { value: 'rem', label: 'rem' },
  { value: 'em', label: 'em' },
  { value: '%', label: '%' }
];

/**
 * Preset values based on token type
 */
const PRESETS = {
  'font-size': [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64],
  'line-height': [1, 1.125, 1.25, 1.375, 1.5, 1.625, 1.75, 2],
  'letter-spacing': [-0.05, -0.025, 0, 0.025, 0.05, 0.1, 0.15, 0.2],
  'font-weight': [100, 200, 300, 400, 500, 600, 700, 800, 900]
};

/**
 * Font weight labels for display
 */
const WEIGHT_LABELS = {
  100: 'Thin',
  200: 'Extra Light',
  300: 'Light',
  400: 'Regular',
  500: 'Medium',
  600: 'Semi Bold',
  700: 'Bold',
  800: 'Extra Bold',
  900: 'Black'
};

/**
 * Parse token value to extract typography data
 */
function parseTokenValue(value) {
  if (!value) {
    return { value: 16, unit: 'px' };
  }
  
  // Handle object format { value, unit }
  if (typeof value === 'object') {
    return {
      value: value.value ?? 16,
      unit: value.unit || 'px'
    };
  }
  
  // Handle string format (e.g., "16px", "1.5rem", "1.5")
  if (typeof value === 'string') {
    const match = value.match(/^(-?[\d.]+)(px|rem|em|%)?$/);
    if (match) {
      return {
        value: parseFloat(match[1]) || 16,
        unit: match[2] || 'px'
      };
    }
  }
  
  // Handle number format
  if (typeof value === 'number') {
    return { value, unit: 'px' };
  }
  
  return { value: 16, unit: 'px' };
}

/**
 * Detect token type from path
 */
function detectTokenType(path) {
  if (!path) return 'font-size';
  
  const lowerPath = path.toLowerCase();
  
  if (lowerPath.includes('size') || lowerPath.includes('font-size')) {
    return 'font-size';
  }
  if (lowerPath.includes('line-height') || lowerPath.includes('lineheight') || lowerPath.includes('leading')) {
    return 'line-height';
  }
  if (lowerPath.includes('letter-spacing') || lowerPath.includes('letterspacing') || lowerPath.includes('tracking')) {
    return 'letter-spacing';
  }
  if (lowerPath.includes('weight') || lowerPath.includes('font-weight')) {
    return 'font-weight';
  }
  
  return 'font-size';
}

/**
 * Get step value based on unit and type
 */
function getStepValue(unit, tokenType) {
  if (tokenType === 'line-height') {
    return 0.125;
  }
  if (tokenType === 'letter-spacing') {
    return 0.025;
  }
  if (tokenType === 'font-weight') {
    return 100;
  }
  
  // For font-size
  switch (unit) {
    case 'px':
      return 1;
    case 'rem':
    case 'em':
      return 0.125;
    case '%':
      return 5;
    default:
      return 1;
  }
}

/**
 * Format preset value for display
 */
function formatPresetValue(value, tokenType) {
  if (tokenType === 'font-weight') {
    return WEIGHT_LABELS[value] || value;
  }
  if (tokenType === 'letter-spacing') {
    return value >= 0 ? `+${value}` : value;
  }
  return value;
}

/**
 * TypographyEditor component
 * @param {Object} props
 * @param {Object} props.token - Token being edited
 * @param {Function} props.onUpdate - Callback when typography value changes
 */
export default function TypographyEditor({ token, onUpdate }) {
  const [value, setValue] = useState(() => parseTokenValue(token?.value).value);
  const [unit, setUnit] = useState(() => parseTokenValue(token?.value).unit);
  
  const tokenType = detectTokenType(token?.path || token?.name);
  const isWeightToken = tokenType === 'font-weight';
  const isLineHeight = tokenType === 'line-height';
  const isLetterSpacing = tokenType === 'letter-spacing';
  
  // Reset values when token changes
  useEffect(() => {
    const parsed = parseTokenValue(token?.value);
    setValue(parsed.value);
    setUnit(parsed.unit);
  }, [token?.id]);
  
  // Save typography to token
  const handleSave = useCallback(() => {
    // For font-weight, just save the numeric value
    if (isWeightToken) {
      onUpdate?.({ value: value });
    } else {
      onUpdate?.({ value: { value, unit } });
    }
  }, [value, unit, onUpdate, isWeightToken]);
  
  // Handle value input change
  const handleValueChange = (e) => {
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue)) {
      setValue(newValue);
    }
  };
  
  // Handle unit change
  const handleUnitChange = (newUnit) => {
    setUnit(newUnit);
    // Save immediately when unit changes
    setTimeout(() => {
      onUpdate?.({
        value: { value, unit: newUnit }
      });
    }, 0);
  };
  
  // Handle preset click
  const handlePresetClick = (presetValue) => {
    setValue(presetValue);
    // Save immediately when preset is selected
    setTimeout(() => {
      if (isWeightToken) {
        onUpdate?.({ value: presetValue });
      } else {
        onUpdate?.({ value: { value: presetValue, unit } });
      }
    }, 0);
  };
  
  // Get presets for current token type
  const currentPresets = PRESETS[tokenType] || PRESETS['font-size'];
  
  // Calculate preview style
  const getPreviewStyle = () => {
    const baseStyle = {};
    
    switch (tokenType) {
      case 'font-size':
        baseStyle.fontSize = `${Math.min(value, 64)}${unit}`;
        break;
      case 'line-height':
        baseStyle.fontSize = '16px';
        baseStyle.lineHeight = value;
        break;
      case 'letter-spacing':
        baseStyle.fontSize = '16px';
        baseStyle.letterSpacing = `${value}em`;
        break;
      case 'font-weight':
        baseStyle.fontSize = '24px';
        baseStyle.fontWeight = value;
        break;
      default:
        baseStyle.fontSize = `${Math.min(value, 64)}${unit}`;
    }
    
    return baseStyle;
  };
  
  // Format the output value for CSS display
  const formatCSSValue = () => {
    if (isWeightToken) {
      return value;
    }
    if (isLineHeight && unit === 'px') {
      return value; // Line-height can be unitless
    }
    return `${value}${unit}`;
  };
  
  return (
    <div className="typography-editor">
      {/* Live Preview */}
      <div className="typography-preview">
        <div className="typography-preview-box">
          <p className="typography-preview-text" style={getPreviewStyle()}>
            The quick brown fox jumps over the lazy dog
          </p>
          {isLineHeight && (
            <p className="typography-preview-text typography-preview-multiline" style={getPreviewStyle()}>
              Typography is the art and technique of arranging type to make written language legible, readable, and appealing when displayed.
            </p>
          )}
        </div>
        <span className="typography-preview-label">{formatCSSValue()}</span>
      </div>
      
      {/* Value Input */}
      <div className={cn('typography-value-input', { 'weight-only': isWeightToken })}>
        <Input
          type="number"
          label={isWeightToken ? 'Weight' : 'Value'}
          value={value}
          onChange={handleValueChange}
          onBlur={handleSave}
          min={isWeightToken ? 100 : (isLetterSpacing ? -1 : 0)}
          max={isWeightToken ? 900 : undefined}
          step={getStepValue(unit, tokenType)}
        />
        {!isWeightToken && (
          <Select
            label="Unit"
            value={unit}
            onChange={handleUnitChange}
            options={isLineHeight 
              ? [{ value: 'px', label: 'unitless' }, ...UNIT_OPTIONS.slice(1)]
              : UNIT_OPTIONS
            }
            placeholder=""
          />
        )}
      </div>
      
      {/* Preset Scale */}
      <div className="typography-presets">
        <label className="typography-presets-label">
          {isWeightToken ? 'Weight Scale' : 'Presets'}
        </label>
        <div className={cn('typography-preset-grid', { 'weight-grid': isWeightToken })}>
          {currentPresets.map(preset => (
            <button
              key={preset}
              type="button"
              className={cn('typography-preset-btn', { 
                active: value === preset,
                'weight-btn': isWeightToken
              })}
              onClick={() => handlePresetClick(preset)}
              title={isWeightToken ? `${preset} - ${WEIGHT_LABELS[preset]}` : String(preset)}
            >
              {isWeightToken ? (
                <span className="weight-preset-content">
                  <span className="weight-value">{preset}</span>
                  <span className="weight-label">{WEIGHT_LABELS[preset]}</span>
                </span>
              ) : (
                formatPresetValue(preset, tokenType)
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* Type Scale Visualization (for font-size) */}
      {tokenType === 'font-size' && (
        <div className="typography-scale-visualization">
          <label className="typography-scale-label">Type Scale</label>
          <div className="typography-scale-samples">
            {[12, 14, 16, 18, 24, 32].map(size => (
              <div 
                key={size}
                className={cn('typography-scale-sample', { active: Math.abs(value - size) < 0.5 })}
              >
                <span 
                  className="scale-sample-text" 
                  style={{ fontSize: `${size}px` }}
                >
                  Aa
                </span>
                <span className="scale-sample-size">{size}px</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* CSS Output */}
      <div className="typography-editor-footer">
        <div className="token-css-var">
          <span className="label">CSS Variable:</span>
          <code>{token?.css_variable}</code>
        </div>
        <div className="css-output">
          <span className="label">Output:</span>
          <code>{token?.css_variable}: {formatCSSValue()};</code>
        </div>
      </div>
    </div>
  );
}

