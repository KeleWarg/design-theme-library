# Chunk 2.20 — GridEditor

## Purpose
Editor for grid/layout tokens (breakpoints, columns, margins, gutters).

---

## Inputs
- Selected grid token
- onUpdate callback

## Outputs
- GridEditor component
- Breakpoint configuration
- Grid visualization

---

## Dependencies
- Chunk 2.14 must be complete

---

## Implementation Notes

### Grid Value Structure
```typescript
interface GridValue {
  breakpoints: {
    xs: number;  // 0
    sm: number;  // 640
    md: number;  // 768
    lg: number;  // 1024
    xl: number;  // 1280
  };
  columns: number;     // 12
  margin: number;      // 16
  gutter: number;      // 24
}
```

### Component Structure

```jsx
// src/components/themes/editor/GridEditor.jsx
const DEFAULT_BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280
};

export default function GridEditor({ token, onUpdate }) {
  const [grid, setGrid] = useState({
    breakpoints: token.value?.breakpoints || DEFAULT_BREAKPOINTS,
    columns: token.value?.columns || 12,
    margin: token.value?.margin || 16,
    gutter: token.value?.gutter || 24
  });

  useEffect(() => {
    setGrid({
      breakpoints: token.value?.breakpoints || DEFAULT_BREAKPOINTS,
      columns: token.value?.columns || 12,
      margin: token.value?.margin || 16,
      gutter: token.value?.gutter || 24
    });
  }, [token.id]);

  const handleSave = () => {
    onUpdate({ value: grid });
  };

  const updateGrid = (updates) => {
    setGrid(prev => ({ ...prev, ...updates }));
  };

  const updateBreakpoint = (key, value) => {
    setGrid(prev => ({
      ...prev,
      breakpoints: { ...prev.breakpoints, [key]: value }
    }));
  };

  return (
    <div className="grid-editor">
      <div className="grid-preview">
        <div className="grid-visualization" style={{ 
          gridTemplateColumns: `repeat(${grid.columns}, 1fr)`,
          gap: `${grid.gutter}px`,
          padding: `0 ${grid.margin}px`
        }}>
          {Array.from({ length: grid.columns }).map((_, i) => (
            <div key={i} className="grid-column" />
          ))}
        </div>
      </div>

      <div className="grid-controls">
        <h4>Grid Settings</h4>
        <div className="control-row">
          <Input
            label="Columns"
            type="number"
            min={1}
            max={24}
            value={grid.columns}
            onChange={(e) => updateGrid({ columns: parseInt(e.target.value) || 12 })}
            onBlur={handleSave}
          />
          <Input
            label="Margin (px)"
            type="number"
            min={0}
            value={grid.margin}
            onChange={(e) => updateGrid({ margin: parseInt(e.target.value) || 0 })}
            onBlur={handleSave}
          />
          <Input
            label="Gutter (px)"
            type="number"
            min={0}
            value={grid.gutter}
            onChange={(e) => updateGrid({ gutter: parseInt(e.target.value) || 0 })}
            onBlur={handleSave}
          />
        </div>

        <h4>Breakpoints</h4>
        <div className="breakpoint-list">
          {Object.entries(grid.breakpoints).map(([key, value]) => (
            <div key={key} className="breakpoint-row">
              <span className="breakpoint-label">{key}</span>
              <Input
                type="number"
                min={0}
                value={value}
                onChange={(e) => updateBreakpoint(key, parseInt(e.target.value) || 0)}
                onBlur={handleSave}
                suffix="px"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## Files Created
- `src/components/themes/editor/GridEditor.jsx` — Grid editor

---

## Tests

### Unit Tests
- [ ] Loads grid value correctly
- [ ] Column count updates
- [ ] Margin updates
- [ ] Gutter updates
- [ ] Breakpoints update
- [ ] Grid preview visualizes settings

---

## Time Estimate
2 hours

---

## Notes
Grid editor handles complex structured data. The visualization helps users understand the grid system visually.
