/**
 * @chunk 2.27 - Preview Components
 * 
 * Form elements preview section showing inputs, selects, etc.
 * using the theme's actual tokens.
 */

import { useState } from 'react';
import { Check, ChevronDown, AlertCircle } from 'lucide-react';

/**
 * Extract color value from token
 */
function getColorValue(token) {
  if (!token) return null;
  const { value } = token;
  if (typeof value === 'string') return value;
  if (value?.hex) return value.hex;
  return null;
}

/**
 * Extract dimension value from token
 */
function getDimensionValue(token, defaultValue) {
  if (!token) return defaultValue;
  const { value } = token;
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return `${value}px`;
  if (value?.value !== undefined) return `${value.value}${value.unit || 'px'}`;
  return defaultValue;
}

/**
 * Preview form elements with theme styles applied
 */
export default function PreviewForm({ theme }) {
  const [checkboxChecked, setCheckboxChecked] = useState(true);
  const [radioValue, setRadioValue] = useState('option1');

  const tokens = theme?.tokens || [];
  
  // Find tokens by css_variable
  const findToken = (cssVar) => tokens.find(t => t.css_variable === cssVar);
  
  // Background colors
  const bgWhite = getColorValue(findToken('--background-white')) || 'var(--background-white, transparent)';
  const bgNeutralSubtle = getColorValue(findToken('--background-neutral-subtle')) || 'var(--background-neutral-subtle, var(--background-muted, transparent))';
  const bgBrand = getColorValue(findToken('--background-brand')) || 
                  getColorValue(findToken('--button-primary-bg')) || 
                  getColorValue(findToken('--background-button')) || 'var(--background-brand, var(--background-button, transparent))';
  
  // Foreground colors
  const fgBody = getColorValue(findToken('--foreground-body')) || 'var(--foreground-body, currentColor)';
  const fgCaption = getColorValue(findToken('--foreground-caption')) || 'var(--foreground-caption, var(--foreground-muted, currentColor))';
  const fgStroke = getColorValue(findToken('--foreground-stroke-default')) || 
                   getColorValue(findToken('--foreground-stroke-ui')) || 
                   getColorValue(findToken('--foreground-divider')) || 'var(--foreground-stroke-default, currentColor)';
  
  // Error color (fallback to standard red)
  const colorError = 'var(--foreground-error, var(--color-error, currentColor))';
  
  // Radius tokens
  const radiusSm = getDimensionValue(findToken('--radius-sm'), '4px');
  const radiusMd = getDimensionValue(findToken('--radius-md'), '6px');

  // Common input styles
  const inputStyle = {
    width: '100%',
    padding: '8px 16px',
    fontSize: '14px',
    border: `1px solid ${fgStroke}`,
    borderRadius: radiusMd,
    backgroundColor: bgWhite,
    color: fgBody,
    boxSizing: 'border-box',
  };

  const labelStyle = {
    fontSize: '14px',
    fontWeight: 500,
    color: fgBody,
    marginBottom: '4px',
    display: 'block',
  };

  return (
    <div className="preview-form-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Text input */}
      <div className="preview-form-group">
        <label style={labelStyle}>Text Input</label>
        <input
          type="text"
          placeholder="Enter text..."
          style={inputStyle}
        />
      </div>

      {/* Input with error */}
      <div className="preview-form-group">
        <label style={labelStyle}>With Error</label>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            defaultValue="Invalid value"
            style={{
              ...inputStyle,
              paddingRight: '36px',
              borderColor: colorError,
            }}
          />
          <AlertCircle 
            size={16} 
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: colorError,
            }}
          />
        </div>
        <span style={{ fontSize: '12px', color: colorError, marginTop: '4px', display: 'block' }}>
          This field is required
        </span>
      </div>

      {/* Select */}
      <div className="preview-form-group">
        <label style={labelStyle}>Select</label>
        <div style={{ position: 'relative' }}>
          <select
            style={{
              ...inputStyle,
              paddingRight: '36px',
              appearance: 'none',
              cursor: 'pointer',
            }}
          >
            <option>Select an option</option>
            <option>Option 1</option>
            <option>Option 2</option>
            <option>Option 3</option>
          </select>
          <ChevronDown 
            size={16} 
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: fgCaption,
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>

      {/* Textarea */}
      <div className="preview-form-group">
        <label style={labelStyle}>Textarea</label>
        <textarea
          placeholder="Enter longer text..."
          rows={3}
          style={{
            ...inputStyle,
            resize: 'vertical',
            fontFamily: 'inherit',
          }}
        />
      </div>

      {/* Checkbox and Radio */}
      <div style={{ display: 'flex', gap: '24px' }}>
        {/* Checkbox */}
        <div className="preview-form-group" style={{ flex: 1 }}>
          <span style={{ ...labelStyle, marginBottom: '8px' }}>Checkbox</span>
          <label 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
            }}
          >
            <div
              onClick={() => setCheckboxChecked(!checkboxChecked)}
              style={{
                width: '18px',
                height: '18px',
                borderRadius: radiusSm,
                border: checkboxChecked ? 'none' : `2px solid ${fgStroke}`,
                backgroundColor: checkboxChecked ? bgBrand : bgWhite,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {checkboxChecked && <Check size={12} color="var(--foreground-on-brand, var(--foreground-body-inverse, currentColor))" strokeWidth={3} />}
            </div>
            <span style={{ fontSize: '14px', color: fgBody }}>Checked option</span>
          </label>
        </div>

        {/* Radio */}
        <div className="preview-form-group" style={{ flex: 1 }}>
          <span style={{ ...labelStyle, marginBottom: '8px' }}>Radio</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {['option1', 'option2'].map((option) => (
              <label 
                key={option}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                }}
              >
                <div
                  onClick={() => setRadioValue(option)}
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    border: `2px solid ${radioValue === option ? bgBrand : fgStroke}`,
                    backgroundColor: bgWhite,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {radioValue === option && (
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: bgBrand,
                      }}
                    />
                  )}
                </div>
                <span style={{ fontSize: '14px', color: fgBody }}>
                  {option === 'option1' ? 'Option One' : 'Option Two'}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Disabled state */}
      <div className="preview-form-group">
        <label style={{ ...labelStyle, color: fgCaption }}>Disabled Input</label>
        <input
          type="text"
          disabled
          placeholder="Cannot edit"
          style={{
            ...inputStyle,
            backgroundColor: bgNeutralSubtle,
            color: fgCaption,
            cursor: 'not-allowed',
          }}
        />
      </div>
    </div>
  );
}
