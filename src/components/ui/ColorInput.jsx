/**
 * @chunk 2.18 - ShadowEditor
 * 
 * Color input component with native color picker and text input.
 * Supports various color formats (hex, rgba).
 */

import { useState, useEffect, useCallback } from 'react';
import { isValidHex } from '../../lib/colorUtils';

/**
 * Parse color string to hex for the native picker
 */
function parseToHex(color) {
  if (!color) return '#000000';
  
  // Already hex
  if (color.startsWith('#')) {
    return isValidHex(color) ? color : '#000000';
  }
  
  // RGBA format
  const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1]).toString(16).padStart(2, '0');
    const g = parseInt(rgbaMatch[2]).toString(16).padStart(2, '0');
    const b = parseInt(rgbaMatch[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }
  
  return '#000000';
}

/**
 * ColorInput component
 * @param {Object} props
 * @param {string} props.label - Input label
 * @param {string} props.value - Color value (hex or rgba)
 * @param {Function} props.onChange - Callback when color changes
 * @param {string} props.className - Additional CSS class
 */
export default function ColorInput({ 
  label, 
  value = 'rgba(0,0,0,0.1)', 
  onChange,
  className = ''
}) {
  const [localValue, setLocalValue] = useState(value);
  
  // Sync with external value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);
  
  // Handle native color picker change
  const handlePickerChange = useCallback((e) => {
    const hex = e.target.value;
    // Preserve alpha if it was rgba
    const alphaMatch = localValue.match(/rgba?\([^)]+,\s*([\d.]+)\)/);
    const alpha = alphaMatch ? parseFloat(alphaMatch[1]) : 1;
    
    let newValue;
    if (alpha < 1) {
      // Convert hex to rgba with preserved alpha
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      newValue = `rgba(${r},${g},${b},${alpha})`;
    } else {
      newValue = hex;
    }
    
    setLocalValue(newValue);
    onChange?.(newValue);
  }, [localValue, onChange]);
  
  // Handle text input change
  const handleInputChange = useCallback((e) => {
    setLocalValue(e.target.value);
  }, []);
  
  // Handle blur - validate and emit
  const handleBlur = useCallback(() => {
    onChange?.(localValue);
  }, [localValue, onChange]);
  
  const hexValue = parseToHex(localValue);
  
  return (
    <div className={`color-input ${className}`}>
      {label && <label className="color-input-label">{label}</label>}
      <div className="color-input-row">
        <input
          type="color"
          value={hexValue}
          onChange={handlePickerChange}
          className="color-input-picker"
          aria-label={label || 'Color picker'}
        />
        <input
          type="text"
          value={localValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className="color-input-text"
          placeholder="rgba(0,0,0,0.1)"
        />
      </div>
    </div>
  );
}

