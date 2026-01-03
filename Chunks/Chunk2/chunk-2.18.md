# Chunk 2.18 — ShadowEditor

## Purpose
Editor for shadow tokens with multiple shadow layers.

---

## Inputs
- Selected shadow token
- onUpdate callback

## Outputs
- ShadowEditor component
- Multi-layer shadow support
- Visual preview box

---

## Dependencies
- Chunk 2.14 must be complete

---

## Implementation Notes

### Shadow Value Structure
```typescript
interface ShadowValue {
  shadows: Array<{
    x: number;      // X offset
    y: number;      // Y offset
    blur: number;   // Blur radius
    spread: number; // Spread radius
    color: string;  // Color (rgba)
  }>;
}
```

### Component Structure

```jsx
// src/components/themes/editor/ShadowEditor.jsx
export default function ShadowEditor({ token, onUpdate }) {
  const [shadows, setShadows] = useState(token.value?.shadows || [
    { x: 0, y: 4, blur: 6, spread: 0, color: 'rgba(0,0,0,0.1)' }
  ]);

  useEffect(() => {
    setShadows(token.value?.shadows || [
      { x: 0, y: 4, blur: 6, spread: 0, color: 'rgba(0,0,0,0.1)' }
    ]);
  }, [token.id]);

  const handleSave = () => {
    onUpdate({ value: { shadows } });
  };

  const updateShadow = (index, updates) => {
    const newShadows = [...shadows];
    newShadows[index] = { ...newShadows[index], ...updates };
    setShadows(newShadows);
  };

  const addShadow = () => {
    setShadows([...shadows, { x: 0, y: 4, blur: 6, spread: 0, color: 'rgba(0,0,0,0.1)' }]);
  };

  const removeShadow = (index) => {
    setShadows(shadows.filter((_, i) => i !== index));
  };

  const shadowCss = shadows
    .map(s => `${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${s.color}`)
    .join(', ');

  return (
    <div className="shadow-editor">
      <div className="shadow-preview">
        <div className="preview-box" style={{ boxShadow: shadowCss }}>
          Preview
        </div>
      </div>

      <div className="shadow-layers">
        {shadows.map((shadow, index) => (
          <ShadowLayer
            key={index}
            shadow={shadow}
            index={index}
            onUpdate={(updates) => updateShadow(index, updates)}
            onRemove={() => removeShadow(index)}
            onBlur={handleSave}
            canRemove={shadows.length > 1}
          />
        ))}
        <Button variant="ghost" size="sm" onClick={addShadow}>
          <PlusIcon size={14} /> Add Shadow Layer
        </Button>
      </div>

      <div className="css-output">
        <code>box-shadow: {shadowCss};</code>
      </div>
    </div>
  );
}

function ShadowLayer({ shadow, index, onUpdate, onRemove, onBlur, canRemove }) {
  return (
    <div className="shadow-layer">
      <div className="layer-header">
        <span>Layer {index + 1}</span>
        {canRemove && (
          <button onClick={onRemove}><TrashIcon size={14} /></button>
        )}
      </div>
      <div className="shadow-controls">
        <Input label="X" type="number" value={shadow.x} onChange={(e) => onUpdate({ x: parseInt(e.target.value) || 0 })} onBlur={onBlur} size="sm" />
        <Input label="Y" type="number" value={shadow.y} onChange={(e) => onUpdate({ y: parseInt(e.target.value) || 0 })} onBlur={onBlur} size="sm" />
        <Input label="Blur" type="number" min={0} value={shadow.blur} onChange={(e) => onUpdate({ blur: parseInt(e.target.value) || 0 })} onBlur={onBlur} size="sm" />
        <Input label="Spread" type="number" value={shadow.spread} onChange={(e) => onUpdate({ spread: parseInt(e.target.value) || 0 })} onBlur={onBlur} size="sm" />
        <ColorInput label="Color" value={shadow.color} onChange={(color) => { onUpdate({ color }); onBlur(); }} />
      </div>
    </div>
  );
}
```

---

## Files Created
- `src/components/themes/editor/ShadowEditor.jsx` — Shadow editor
- `src/components/ui/ColorInput.jsx` — Color input with picker

---

## Tests

### Unit Tests
- [ ] Loads shadow value correctly
- [ ] Single shadow editable
- [ ] Add shadow layer works
- [ ] Remove shadow layer works
- [ ] Preview updates live
- [ ] CSS output correct

---

## Time Estimate
2.5 hours

---

## Notes
Shadow editor is one of the more complex editors due to multi-layer support. Each layer can be individually configured and reordered.
