/**
 * @chunk 2.17 - SpacingEditor
 * 
 * Editor component for spacing tokens with visual scale.
 * Features preset values, unit selection, and visual preview.
 */

import { useState, useEffect, useCallback } from 'react';
import { Input, Select } from '../../ui';
import { cn } from '../../../lib/utils';

/**
 * Preset spacing values based on 4px base scale
 */
const PRESETS = [0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96];

/**
 * Unit options for spacing values
 */
const UNIT_OPTIONS = [
  { value: 'px', label: 'px' },
  { value: 'rem', label: 'rem' },
  { value: 'em', label: 'em' }
];

/**
 * Parse token value to extract spacing data
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
  
  // Handle string format (e.g., "16px", "1rem")
  if (typeof value === 'string') {
    const match = value.match(/^([\d.]+)(px|rem|em)?$/);
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
 * SpacingEditor component
 * @param {Object} props
 * @param {Object} props.token - Token being edited
 * @param {Function} props.onUpdate - Callback when spacing changes
 */
export default function SpacingEditor({ token, onUpdate }) {
  const [value, setValue] = useState(() => parseTokenValue(token?.value).value);
  const [unit, setUnit] = useState(() => parseTokenValue(token?.value).unit);
  
  // Reset values when token changes
  useEffect(() => {
    const parsed = parseTokenValue(token?.value);
    setValue(parsed.value);
    setUnit(parsed.unit);
  }, [token?.id]);
  
  // Save spacing to token
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
  
  // Calculate display size (capped for preview)
  const displaySize = Math.min(value, 120);
  
  return (
    <div className="spacing-editor">
      {/* Visual Preview */}
      <div className="spacing-preview">
        <div className="spacing-preview-box">
          <div 
            className="spacing-indicator" 
            style={{ 
              width: `${displaySize}px`, 
              height: `${displaySize}px` 
            }}
          />
        </div>
        <span className="spacing-preview-label">{value}{unit}</span>
      </div>
      
      {/* Value Input */}
      <div className="spacing-value-input">
        <Input
          type="number"
          label="Value"
          value={value}
          onChange={handleValueChange}
          onBlur={handleSave}
          min={0}
          step={1}
        />
        <Select
          label="Unit"
          value={unit}
          onChange={handleUnitChange}
          options={UNIT_OPTIONS}
          placeholder=""
        />
      </div>
      
      {/* Preset Scale */}
      <div className="spacing-presets">
        <label className="spacing-presets-label">Scale</label>
        <div className="spacing-preset-grid">
          {PRESETS.map(preset => (
            <button
              key={preset}
              type="button"
              className={cn('spacing-preset-btn', { active: value === preset })}
              onClick={() => handlePresetClick(preset)}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>
      
      {/* Scale Visualization */}
      <div className="spacing-scale-visualization">
        <label className="spacing-scale-label">Visual Scale</label>
        <div className="spacing-scale-bars">
          {PRESETS.slice(1, 8).map(size => (
            <div 
              key={size} 
              className={cn('spacing-scale-bar', { active: value === size })}
              style={{ width: `${size}px` }}
              title={`${size}px`}
            />
          ))}
        </div>
        <div className="spacing-scale-legend">
          {PRESETS.slice(1, 8).map(size => (
            <span key={size} className="spacing-scale-legend-item">{size}</span>
          ))}
        </div>
      </div>
      
      {/* Token Info */}
      <div className="spacing-editor-footer">
        <div className="token-css-var">
          <span className="label">CSS Variable:</span>
          <code>{token?.css_variable}</code>
        </div>
      </div>
    </div>
  );
}

