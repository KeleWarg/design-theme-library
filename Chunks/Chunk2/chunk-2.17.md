# Chunk 2.17 — SpacingEditor

## Purpose
Editor for spacing tokens with visual scale.

---

## Inputs
- Selected spacing token
- onUpdate callback

## Outputs
- SpacingEditor component
- Visual spacing preview
- Scale presets (4px base)

---

## Dependencies
- Chunk 2.14 must be complete

---

## Implementation Notes

### Component Structure

```jsx
// src/components/themes/editor/SpacingEditor.jsx
const PRESETS = [0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96];

export default function SpacingEditor({ token, onUpdate }) {
  const [value, setValue] = useState(token.value?.value || 16);
  const [unit, setUnit] = useState(token.value?.unit || 'px');

  useEffect(() => {
    setValue(token.value?.value || 16);
    setUnit(token.value?.unit || 'px');
  }, [token.id]);

  const handleSave = () => {
    onUpdate({ value: { value, unit } });
  };

  return (
    <div className="spacing-editor">
      <div className="spacing-preview">
        <div className="preview-box">
          <div 
            className="spacing-indicator" 
            style={{ width: `${value}${unit}`, height: `${value}${unit}` }}
          />
        </div>
        <span className="preview-label">{value}{unit}</span>
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
          options={['px', 'rem', 'em'].map(u => ({ value: u, label: u }))}
        />
      </div>

      <div className="presets">
        <label>Scale</label>
        <div className="preset-grid">
          {PRESETS.map(preset => (
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

      <div className="scale-visualization">
        {PRESETS.slice(1, 8).map(size => (
          <div 
            key={size} 
            className="scale-bar"
            style={{ width: `${size}px` }}
            title={`${size}px`}
          />
        ))}
      </div>
    </div>
  );
}
```

---

## Files Created
- `src/components/themes/editor/SpacingEditor.jsx` — Spacing editor

---

## Tests

### Unit Tests
- [ ] Loads token value correctly
- [ ] Value input updates
- [ ] Presets set correct value
- [ ] Visual preview updates

---

## Time Estimate
1.5 hours
