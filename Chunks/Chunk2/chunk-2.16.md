# Chunk 2.16 — TypographyEditor

## Purpose
Editor for typography tokens (font size, weight, line height, letter spacing).

---

## Inputs
- Selected typography token
- onUpdate callback

## Outputs
- TypographyEditor component
- Unit selection (px, rem, em)
- Live preview

---

## Dependencies
- Chunk 2.14 must be complete

---

## Implementation Notes

### Component Structure

```jsx
// src/components/themes/editor/TypographyEditor.jsx
import { useState, useEffect } from 'react';
import { Input, Select } from '../../ui';

const UNITS = ['px', 'rem', 'em', '%'];
const PRESETS = {
  'font-size': [12, 14, 16, 18, 20, 24, 32, 48],
  'line-height': [1, 1.25, 1.5, 1.75, 2],
  'letter-spacing': [-0.05, 0, 0.025, 0.05, 0.1]
};

export default function TypographyEditor({ token, onUpdate }) {
  const [value, setValue] = useState(token.value?.value || 16);
  const [unit, setUnit] = useState(token.value?.unit || 'px');

  useEffect(() => {
    setValue(token.value?.value || 16);
    setUnit(token.value?.unit || 'px');
  }, [token.id]);

  const handleSave = () => {
    onUpdate({ value: { value, unit } });
  };

  const getPresets = () => {
    if (token.path.includes('size')) return PRESETS['font-size'];
    if (token.path.includes('line-height')) return PRESETS['line-height'];
    if (token.path.includes('letter-spacing')) return PRESETS['letter-spacing'];
    return PRESETS['font-size'];
  };

  return (
    <div className="typography-editor">
      <div className="preview-text" style={{ fontSize: `${value}${unit}` }}>
        The quick brown fox jumps over the lazy dog
      </div>

      <div className="value-input">
        <Input
          type="number"
          label="Value"
          value={value}
          onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
          onBlur={handleSave}
          step={unit === 'px' ? 1 : 0.125}
        />
        <Select
          label="Unit"
          value={unit}
          onChange={(e) => { setUnit(e.target.value); handleSave(); }}
          options={UNITS.map(u => ({ value: u, label: u }))}
        />
      </div>

      <div className="presets">
        <label>Presets</label>
        <div className="preset-buttons">
          {getPresets().map(preset => (
            <button
              key={preset}
              className={cn('preset-btn', { active: value === preset })}
              onClick={() => { setValue(preset); handleSave(); }}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      <div className="css-output">
        <code>{token.css_variable}: {value}{unit};</code>
      </div>
    </div>
  );
}
```

---

## Files Created
- `src/components/themes/editor/TypographyEditor.jsx` — Typography editor

---

## Tests

### Unit Tests
- [ ] Loads token value correctly
- [ ] Value input updates
- [ ] Unit select updates
- [ ] Presets set correct value
- [ ] Preview updates live
- [ ] CSS output shows current value

---

## Time Estimate
2 hours
