/**
 * @chunk 2.15 - ColorEditor
 * 
 * Editor component for color tokens with HEX/RGB/HSL inputs and opacity.
 * Features multiple format support, live preview, and color picker.
 */

import { useState, useEffect, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import { Input, Button } from '../../ui';
import Slider from '../../ui/Slider';
import { 
  hexToRgb, 
  rgbToHex, 
  rgbToHsl, 
  hslToRgb, 
  isValidHex,
  getContrastColor,
  formatColor
} from '../../../lib/colorUtils';
import { cn } from '../../../lib/utils';

/**
 * Parse token value to extract color data
 */
function parseTokenValue(value) {
  if (!value) {
    return { hex: '#000000', opacity: 1 };
  }
  
  // Handle object format
  if (typeof value === 'object') {
    return {
      hex: value.hex || '#000000',
      rgb: value.rgb || null,
      hsl: value.hsl || null,
      opacity: value.opacity ?? 1
    };
  }
  
  // Handle string format (hex)
  if (typeof value === 'string') {
    const hex = value.startsWith('#') ? value : `#${value}`;
    return {
      hex: isValidHex(hex) ? hex : '#000000',
      opacity: 1
    };
  }
  
  return { hex: '#000000', opacity: 1 };
}

/**
 * Initialize color state from token value
 */
function initializeColor(tokenValue) {
  const parsed = parseTokenValue(tokenValue);
  const rgb = parsed.rgb || hexToRgb(parsed.hex);
  const hsl = parsed.hsl || rgbToHsl(rgb.r, rgb.g, rgb.b);
  
  return {
    hex: parsed.hex,
    rgb,
    hsl,
    opacity: parsed.opacity
  };
}

/**
 * ColorEditor component
 * @param {Object} props
 * @param {Object} props.token - Token being edited
 * @param {Function} props.onUpdate - Callback when color changes
 */
export default function ColorEditor({ token, onUpdate }) {
  const [format, setFormat] = useState('hex');
  const [color, setColor] = useState(() => initializeColor(token?.value));
  const [copied, setCopied] = useState(false);
  
  // Reset color when token changes
  useEffect(() => {
    setColor(initializeColor(token?.value));
  }, [token?.id]);
  
  // Update color and sync all formats
  const updateColor = useCallback((updates) => {
    setColor(prev => {
      const newColor = { ...prev };
      
      if (updates.hex !== undefined) {
        if (isValidHex(updates.hex)) {
          newColor.hex = updates.hex.startsWith('#') ? updates.hex : `#${updates.hex}`;
          newColor.rgb = hexToRgb(newColor.hex);
          newColor.hsl = rgbToHsl(newColor.rgb.r, newColor.rgb.g, newColor.rgb.b);
        } else {
          // Keep invalid hex in field for editing, don't sync
          newColor.hex = updates.hex;
        }
      } else if (updates.rgb !== undefined) {
        newColor.rgb = { ...prev.rgb, ...updates.rgb };
        newColor.hex = rgbToHex(newColor.rgb.r, newColor.rgb.g, newColor.rgb.b);
        newColor.hsl = rgbToHsl(newColor.rgb.r, newColor.rgb.g, newColor.rgb.b);
      } else if (updates.hsl !== undefined) {
        newColor.hsl = { ...prev.hsl, ...updates.hsl };
        newColor.rgb = hslToRgb(newColor.hsl.h, newColor.hsl.s, newColor.hsl.l);
        newColor.hex = rgbToHex(newColor.rgb.r, newColor.rgb.g, newColor.rgb.b);
      }
      
      if (updates.opacity !== undefined) {
        newColor.opacity = updates.opacity;
      }
      
      return newColor;
    });
  }, []);
  
  // Save color to token
  const handleSave = useCallback(() => {
    if (!isValidHex(color.hex)) return;
    
    onUpdate?.({
      value: {
        hex: color.hex,
        rgb: color.rgb,
        hsl: color.hsl,
        opacity: color.opacity
      }
    });
  }, [color, onUpdate]);
  
  // Copy color value to clipboard
  const handleCopy = async () => {
    const text = formatColor(color, format);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  // Calculate preview color with opacity
  const previewColor = color.opacity < 1
    ? `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.opacity})`
    : color.hex;
  
  // Contrast color for text on preview
  const contrastColor = getContrastColor(color.hex);
  
  return (
    <div className="color-editor">
      {/* Large Color Preview */}
      <div className="color-preview-large">
        <div className="checkerboard" />
        <div 
          className="preview-swatch" 
          style={{ backgroundColor: previewColor }}
        >
          <span 
            className="preview-hex-label"
            style={{ color: contrastColor }}
          >
            {color.hex.toUpperCase()}
          </span>
        </div>
      </div>
      
      {/* Format Tabs */}
      <div className="format-tabs">
        {['hex', 'rgb', 'hsl'].map(f => (
          <button
            key={f}
            type="button"
            className={cn('format-tab', { active: format === f })}
            onClick={() => setFormat(f)}
          >
            {f.toUpperCase()}
          </button>
        ))}
        <button
          type="button"
          className="copy-btn"
          onClick={handleCopy}
          title="Copy color value"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      
      {/* HEX Input */}
      {format === 'hex' && (
        <div className="hex-input-group">
          <div className="hex-input-row">
            <input
              type="color"
              value={isValidHex(color.hex) ? color.hex : '#000000'}
              onChange={(e) => {
                updateColor({ hex: e.target.value });
                // Immediate save on color picker change
                setTimeout(() => handleSave(), 0);
              }}
              className="native-color-picker"
              aria-label="Color picker"
            />
            <Input
              label="HEX"
              value={color.hex}
              onChange={(e) => updateColor({ hex: e.target.value })}
              onBlur={handleSave}
              placeholder="#000000"
              className="hex-text-input"
            />
          </div>
        </div>
      )}
      
      {/* RGB Sliders */}
      {format === 'rgb' && (
        <div className="color-sliders">
          {[
            { channel: 'r', label: 'Red', max: 255, color: '#ef4444' },
            { channel: 'g', label: 'Green', max: 255, color: '#22c55e' },
            { channel: 'b', label: 'Blue', max: 255, color: '#3b82f6' }
          ].map(({ channel, label, max, color: trackColor }) => (
            <div key={channel} className="slider-row">
              <label className="slider-label">{label}</label>
              <Slider
                min={0}
                max={max}
                value={color.rgb[channel]}
                onChange={(v) => updateColor({ rgb: { [channel]: v } })}
                onChangeEnd={handleSave}
                trackColor={trackColor}
              />
              <input
                type="number"
                min={0}
                max={max}
                value={color.rgb[channel]}
                onChange={(e) => updateColor({ rgb: { [channel]: parseInt(e.target.value) || 0 } })}
                onBlur={handleSave}
                className="slider-value-input"
              />
            </div>
          ))}
        </div>
      )}
      
      {/* HSL Sliders */}
      {format === 'hsl' && (
        <div className="color-sliders">
          <div className="slider-row">
            <label className="slider-label">Hue</label>
            <Slider
              min={0}
              max={360}
              value={color.hsl.h}
              onChange={(v) => updateColor({ hsl: { h: v } })}
              onChangeEnd={handleSave}
              showGradient
            />
            <span className="slider-value">{color.hsl.h}°</span>
          </div>
          <div className="slider-row">
            <label className="slider-label">Saturation</label>
            <Slider
              min={0}
              max={100}
              value={color.hsl.s}
              onChange={(v) => updateColor({ hsl: { s: v } })}
              onChangeEnd={handleSave}
            />
            <span className="slider-value">{color.hsl.s}%</span>
          </div>
          <div className="slider-row">
            <label className="slider-label">Lightness</label>
            <Slider
              min={0}
              max={100}
              value={color.hsl.l}
              onChange={(v) => updateColor({ hsl: { l: v } })}
              onChangeEnd={handleSave}
            />
            <span className="slider-value">{color.hsl.l}%</span>
          </div>
        </div>
      )}
      
      {/* Opacity Slider */}
      <div className="opacity-section">
        <div className="slider-row">
          <label className="slider-label">Opacity</label>
          <Slider
            min={0}
            max={100}
            value={Math.round(color.opacity * 100)}
            onChange={(v) => updateColor({ opacity: v / 100 })}
            onChangeEnd={handleSave}
          />
          <span className="slider-value">{Math.round(color.opacity * 100)}%</span>
        </div>
      </div>
      
      {/* Token Info */}
      <div className="color-editor-footer">
        <div className="token-css-var">
          <span className="label">CSS Variable:</span>
          <code>{token?.css_variable}</code>
        </div>
      </div>
    </div>
  );
}


