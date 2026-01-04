/**
 * @chunk 2.19 - RadiusEditor
 * 
 * Editor component for border-radius tokens with visual preview.
 * Features preset values, unit selection, corner preview, and slider control.
 */

import { useState, useEffect, useCallback } from 'react';
import { Input, Select, Slider } from '../../ui';
import { cn } from '../../../lib/utils';

/**
 * Preset radius values for common use cases
 */
const PRESETS = [
  { label: 'None', value: 0 },
  { label: 'SM', value: 4 },
  { label: 'MD', value: 8 },
  { label: 'LG', value: 12 },
  { label: 'XL', value: 16 },
  { label: 'Full', value: 9999 }
];

/**
 * Unit options for radius values
 */
const UNIT_OPTIONS = [
  { value: 'px', label: 'px' },
  { value: 'rem', label: 'rem' },
  { value: '%', label: '%' }
];

/**
 * Parse token value to extract radius data
 */
function parseTokenValue(value) {
  if (!value) {
    return { value: 8, unit: 'px' };
  }
  
  // Handle object format { value, unit }
  if (typeof value === 'object') {
    return {
      value: value.value ?? 8,
      unit: value.unit || 'px'
    };
  }
  
  // Handle string format (e.g., "8px", "0.5rem", "50%")
  if (typeof value === 'string') {
    const match = value.match(/^([\d.]+)(px|rem|%)?$/);
    if (match) {
      return {
        value: parseFloat(match[1]) || 8,
        unit: match[2] || 'px'
      };
    }
  }
  
  // Handle number format
  if (typeof value === 'number') {
    return { value, unit: 'px' };
  }
  
  return { value: 8, unit: 'px' };
}

/**
 * RadiusEditor component
 * @param {Object} props
 * @param {Object} props.token - Token being edited
 * @param {Function} props.onUpdate - Callback when radius changes
 */
export default function RadiusEditor({ token, onUpdate }) {
  const [value, setValue] = useState(() => parseTokenValue(token?.value).value);
  const [unit, setUnit] = useState(() => parseTokenValue(token?.value).unit);
  
  // Reset values when token changes
  useEffect(() => {
    const parsed = parseTokenValue(token?.value);
    setValue(parsed.value);
    setUnit(parsed.unit);
  }, [token?.id]);
  
  // Save radius to token
  const handleSave = useCallback(() => {
    onUpdate?.({
      value: { value, unit }
    });
  }, [value, unit, onUpdate]);
  
  // Handle value input change
  const handleValueChange = (e) => {
    const newValue = parseFloat(e.target.value) || 0;
    setValue(newValue);
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
      onUpdate?.({
        value: { value: presetValue, unit }
      });
    }, 0);
  };
  
  // Handle slider change
  const handleSliderChange = (newValue) => {
    setValue(newValue);
  };
  
  // Handle slider change end
  const handleSliderChangeEnd = () => {
    handleSave();
  };
  
  // Calculate preview border radius
  const getPreviewRadius = () => {
    if (value === 9999) {
      return '50%';
    }
    return `${value}${unit}`;
  };
  
  // Calculate preview size for slider (capped at 100)
  const sliderValue = Math.min(value === 9999 ? 100 : value, 100);
  
  return (
    <div className="radius-editor">
      {/* Visual Preview */}
      <div className="radius-preview">
        <div className="radius-preview-container">
          <div 
            className="radius-preview-box" 
            style={{ borderRadius: getPreviewRadius() }}
          />
        </div>
        <span className="radius-preview-label">
          {value === 9999 ? 'Full' : `${value}${unit}`}
        </span>
      </div>
      
      {/* Value Input */}
      <div className="radius-value-input">
        <Input
          type="number"
          label="Value"
          value={value === 9999 ? '' : value}
          onChange={handleValueChange}
          onBlur={handleSave}
          min={0}
          step={1}
          placeholder={value === 9999 ? '9999' : ''}
        />
        <Select
          label="Unit"
          value={unit}
          onChange={handleUnitChange}
          options={UNIT_OPTIONS}
          placeholder=""
        />
      </div>
      
      {/* Slider Control */}
      <div className="radius-slider-section">
        <label className="radius-slider-label">Adjust</label>
        <div className="radius-slider-row">
          <Slider
            min={0}
            max={100}
            value={sliderValue}
            onChange={handleSliderChange}
            onChangeEnd={handleSliderChangeEnd}
          />
          <span className="radius-slider-value">{sliderValue}px</span>
        </div>
      </div>
      
      {/* Preset Scale */}
      <div className="radius-presets">
        <label className="radius-presets-label">Presets</label>
        <div className="radius-preset-grid">
          {PRESETS.map(preset => (
            <button
              key={preset.label}
              type="button"
              className={cn('radius-preset-btn', { 
                active: value === preset.value 
              })}
              onClick={() => handlePresetClick(preset.value)}
            >
              <div 
                className="radius-preset-preview"
                style={{ 
                  borderRadius: preset.value === 9999 ? '50%' : `${preset.value}px` 
                }}
              />
              <span className="radius-preset-label">{preset.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Corner Indicators */}
      <div className="radius-corners-section">
        <label className="radius-corners-label">Corners Preview</label>
        <div className="radius-corners-grid">
          <div className="radius-corner-item">
            <div 
              className="radius-corner-preview tl"
              style={{ borderTopLeftRadius: getPreviewRadius() }}
            />
            <span>TL</span>
          </div>
          <div className="radius-corner-item">
            <div 
              className="radius-corner-preview tr"
              style={{ borderTopRightRadius: getPreviewRadius() }}
            />
            <span>TR</span>
          </div>
          <div className="radius-corner-item">
            <div 
              className="radius-corner-preview bl"
              style={{ borderBottomLeftRadius: getPreviewRadius() }}
            />
            <span>BL</span>
          </div>
          <div className="radius-corner-item">
            <div 
              className="radius-corner-preview br"
              style={{ borderBottomRightRadius: getPreviewRadius() }}
            />
            <span>BR</span>
          </div>
        </div>
      </div>
      
      {/* Token Info */}
      <div className="radius-editor-footer">
        <div className="token-css-var">
          <span className="label">CSS Variable:</span>
          <code>{token?.css_variable}</code>
        </div>
      </div>
    </div>
  );
}


