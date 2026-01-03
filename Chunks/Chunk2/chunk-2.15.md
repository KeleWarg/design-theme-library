# Chunk 2.15 — ColorEditor

## Purpose
Editor component for color tokens with HEX/RGB/HSL inputs and opacity.

---

## Inputs
- Selected color token
- onUpdate callback

## Outputs
- ColorEditor component
- Color picker with multiple formats
- Live preview

---

## Dependencies
- Chunk 2.14 must be complete

---

## Implementation Notes

### Key Features
- HEX input with color picker
- RGB sliders (0-255)
- HSL sliders (H: 0-360, S/L: 0-100)
- Opacity slider (0-100%)
- Format toggle
- Live preview swatch

### Component Structure

```jsx
// src/components/themes/editor/ColorEditor.jsx
import { useState, useEffect } from 'react';
import { Input, Slider } from '../../ui';
import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb } from '../../../lib/colorUtils';

export default function ColorEditor({ token, onUpdate }) {
  const [format, setFormat] = useState('hex');
  const [color, setColor] = useState({
    hex: token.value?.hex || '#000000',
    rgb: token.value?.rgb || { r: 0, g: 0, b: 0 },
    hsl: { h: 0, s: 0, l: 0 },
    opacity: token.value?.opacity ?? 1
  });

  useEffect(() => {
    const rgb = token.value?.rgb || hexToRgb(token.value?.hex || '#000000');
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    setColor({
      hex: token.value?.hex || '#000000',
      rgb,
      hsl,
      opacity: token.value?.opacity ?? 1
    });
  }, [token.id]);

  const updateColor = (updates) => {
    const newColor = { ...color, ...updates };
    
    // Sync formats
    if (updates.hex) {
      newColor.rgb = hexToRgb(updates.hex);
      newColor.hsl = rgbToHsl(newColor.rgb.r, newColor.rgb.g, newColor.rgb.b);
    } else if (updates.rgb) {
      newColor.hex = rgbToHex(updates.rgb.r, updates.rgb.g, updates.rgb.b);
      newColor.hsl = rgbToHsl(updates.rgb.r, updates.rgb.g, updates.rgb.b);
    } else if (updates.hsl) {
      newColor.rgb = hslToRgb(updates.hsl.h, updates.hsl.s, updates.hsl.l);
      newColor.hex = rgbToHex(newColor.rgb.r, newColor.rgb.g, newColor.rgb.b);
    }
    
    setColor(newColor);
  };

  const handleSave = () => {
    onUpdate({
      value: {
        hex: color.hex,
        rgb: color.rgb,
        hsl: color.hsl,
        opacity: color.opacity
      }
    });
  };

  const previewColor = color.opacity < 1
    ? `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.opacity})`
    : color.hex;

  return (
    <div className="color-editor">
      <div className="color-preview-large">
        <div 
          className="preview-swatch" 
          style={{ backgroundColor: previewColor }}
        />
        <div className="checkerboard" />
      </div>

      <div className="format-tabs">
        {['hex', 'rgb', 'hsl'].map(f => (
          <button
            key={f}
            className={cn('format-tab', { active: format === f })}
            onClick={() => setFormat(f)}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {format === 'hex' && (
        <div className="hex-input">
          <Input
            label="HEX"
            value={color.hex}
            onChange={(e) => updateColor({ hex: e.target.value })}
            onBlur={handleSave}
          />
          <input
            type="color"
            value={color.hex}
            onChange={(e) => {
              updateColor({ hex: e.target.value });
              handleSave();
            }}
            className="native-picker"
          />
        </div>
      )}

      {format === 'rgb' && (
        <div className="rgb-sliders">
          {['r', 'g', 'b'].map(channel => (
            <div key={channel} className="slider-row">
              <label>{channel.toUpperCase()}</label>
              <Slider
                min={0}
                max={255}
                value={color.rgb[channel]}
                onChange={(v) => updateColor({ rgb: { ...color.rgb, [channel]: v }})}
                onChangeEnd={handleSave}
              />
              <Input
                type="number"
                min={0}
                max={255}
                value={color.rgb[channel]}
                onChange={(e) => updateColor({ rgb: { ...color.rgb, [channel]: parseInt(e.target.value) || 0 }})}
                onBlur={handleSave}
                size="sm"
              />
            </div>
          ))}
        </div>
      )}

      {format === 'hsl' && (
        <div className="hsl-sliders">
          <div className="slider-row">
            <label>H</label>
            <Slider min={0} max={360} value={color.hsl.h} onChange={(v) => updateColor({ hsl: { ...color.hsl, h: v }})} onChangeEnd={handleSave} />
            <span>{color.hsl.h}°</span>
          </div>
          <div className="slider-row">
            <label>S</label>
            <Slider min={0} max={100} value={color.hsl.s} onChange={(v) => updateColor({ hsl: { ...color.hsl, s: v }})} onChangeEnd={handleSave} />
            <span>{color.hsl.s}%</span>
          </div>
          <div className="slider-row">
            <label>L</label>
            <Slider min={0} max={100} value={color.hsl.l} onChange={(v) => updateColor({ hsl: { ...color.hsl, l: v }})} onChangeEnd={handleSave} />
            <span>{color.hsl.l}%</span>
          </div>
        </div>
      )}

      <div className="opacity-slider">
        <label>Opacity</label>
        <Slider
          min={0}
          max={100}
          value={Math.round(color.opacity * 100)}
          onChange={(v) => updateColor({ opacity: v / 100 })}
          onChangeEnd={handleSave}
        />
        <span>{Math.round(color.opacity * 100)}%</span>
      </div>
    </div>
  );
}
```

---

## Files Created
- `src/components/themes/editor/ColorEditor.jsx` — Color editor
- `src/lib/colorUtils.js` — Color conversion utilities
- `src/components/ui/Slider.jsx` — Slider component

---

## Tests

### Unit Tests
- [ ] Loads token value correctly
- [ ] HEX input updates color
- [ ] RGB sliders update color
- [ ] HSL sliders update color
- [ ] Opacity slider works
- [ ] Format tabs switch views
- [ ] onUpdate called on blur/change end

---

## Time Estimate
3 hours

---

## Notes
The color editor is the most complex editor due to multiple format support. Color conversion utilities ensure consistency across formats.
