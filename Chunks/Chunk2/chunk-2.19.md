# Chunk 2.19 — RadiusEditor

## Purpose
Editor for border-radius tokens with visual preview.

---

## Inputs
- Selected radius token
- onUpdate callback

## Outputs
- RadiusEditor component
- Corner preview
- Common presets

---

## Dependencies
- Chunk 2.14 must be complete

---

## Implementation Notes

### Component Structure

```jsx
// src/components/themes/editor/RadiusEditor.jsx
const PRESETS = [
  { label: 'None', value: 0 },
  { label: 'SM', value: 4 },
  { label: 'MD', value: 8 },
  { label: 'LG', value: 12 },
  { label: 'XL', value: 16 },
  { label: 'Full', value: 9999 }
];

export default function RadiusEditor({ token, onUpdate }) {
  const [value, setValue] = useState(token.value?.value || 8);
  const [unit, setUnit] = useState(token.value?.unit || 'px');

  useEffect(() => {
    setValue(token.value?.value || 8);
    setUnit(token.value?.unit || 'px');
  }, [token.id]);

  const handleSave = () => {
    onUpdate({ value: { value, unit } });
  };

  return (
    <div className="radius-editor">
      <div className="radius-preview">
        <div 
          className="preview-box" 
          style={{ borderRadius: `${value}${unit}` }}
        />
      </div>

      <div className="value-input">
        <Input
          type="number"
          label="Value"
          value={value}
          onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
          onBlur={handleSave}
          min={0}
        />
        <Select
          label="Unit"
          value={unit}
          onChange={(e) => { setUnit(e.target.value); handleSave(); }}
          options={['px', 'rem', '%'].map(u => ({ value: u, label: u }))}
        />
      </div>

      <div className="presets">
        <label>Presets</label>
        <div className="preset-buttons">
          {PRESETS.map(preset => (
            <button
              key={preset.label}
              className={cn('preset-btn', { active: value === preset.value })}
              onClick={() => { setValue(preset.value); handleSave(); }}
            >
              <div 
                className="preset-preview"
                style={{ borderRadius: preset.value === 9999 ? '50%' : `${preset.value}px` }}
              />
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="slider-control">
        <Slider
          min={0}
          max={100}
          value={Math.min(value, 100)}
          onChange={(v) => setValue(v)}
          onChangeEnd={handleSave}
        />
      </div>
    </div>
  );
}
```

---

## Files Created
- `src/components/themes/editor/RadiusEditor.jsx` — Radius editor

---

## Tests

### Unit Tests
- [ ] Loads token value correctly
- [ ] Value input updates
- [ ] Unit select updates
- [ ] Presets set correct value
- [ ] Visual preview updates
- [ ] Slider controls value

---

## Time Estimate
1.5 hours
