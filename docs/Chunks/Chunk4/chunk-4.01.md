# Chunk 4.01 — Plugin UI - Components Tab

## Purpose
Add Components export tab to Figma plugin UI.

---

## Inputs
- Existing Figma plugin (from Phase 0)

## Outputs
- Components tab UI
- Component selection interface

---

## Dependencies
- Chunk 0.02 (Figma Plugin PoC) must be complete

---

## Implementation Notes

```tsx
// figma-plugin/src/ui/ComponentsTab.tsx
import { useState, useEffect } from 'react';
import ComponentListItem from './ComponentListItem';

interface ComponentInfo {
  id: string;
  name: string;
  type: string;
  variantCount: number;
}

export default function ComponentsTab() {
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
  const [components, setComponents] = useState<ComponentInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiUrl, setApiUrl] = useState('');
  const [exportProgress, setExportProgress] = useState(0);

  useEffect(() => {
    window.onmessage = (event) => {
      const { type, data } = event.data.pluginMessage || {};
      
      if (type === 'components-scanned') {
        setComponents(data.components);
        setIsLoading(false);
      }
      if (type === 'export-progress') {
        setExportProgress(data.progress);
      }
      if (type === 'export-complete') {
        setExportProgress(0);
        // Show success notification
      }
    };
  }, []);

  const handleScan = () => {
    setIsLoading(true);
    parent.postMessage({ pluginMessage: { type: 'scan-components' } }, '*');
  };

  const handleExport = () => {
    if (selectedComponents.length === 0 || !apiUrl) return;
    
    parent.postMessage({
      pluginMessage: {
        type: 'export-components',
        componentIds: selectedComponents,
        apiUrl
      }
    }, '*');
  };

  const toggleComponent = (id: string) => {
    setSelectedComponents(prev => 
      prev.includes(id) 
        ? prev.filter(cid => cid !== id)
        : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedComponents.length === components.length) {
      setSelectedComponents([]);
    } else {
      setSelectedComponents(components.map(c => c.id));
    }
  };

  return (
    <div className="components-tab">
      <div className="tab-header">
        <h2>Export Components</h2>
        <button onClick={handleScan} disabled={isLoading}>
          {isLoading ? 'Scanning...' : 'Scan Document'}
        </button>
      </div>

      <div className="api-config">
        <label>Admin Tool URL</label>
        <input
          type="url"
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          placeholder="https://your-admin-tool.com"
        />
      </div>

      <div className="component-list">
        {components.length === 0 ? (
          <div className="empty-state">
            Click "Scan Document" to find components
          </div>
        ) : (
          <>
            <div className="list-header">
              <label>
                <input 
                  type="checkbox" 
                  checked={selectedComponents.length === components.length}
                  onChange={toggleAll}
                />
                Select All ({components.length})
              </label>
            </div>
            {components.map(comp => (
              <ComponentListItem
                key={comp.id}
                component={comp}
                selected={selectedComponents.includes(comp.id)}
                onToggle={() => toggleComponent(comp.id)}
              />
            ))}
          </>
        )}
      </div>

      {exportProgress > 0 && (
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${exportProgress}%` }} />
        </div>
      )}

      <div className="tab-footer">
        <span>{selectedComponents.length} selected</span>
        <button 
          className="primary"
          onClick={handleExport}
          disabled={selectedComponents.length === 0 || !apiUrl}
        >
          Export Selected
        </button>
      </div>
    </div>
  );
}
```

### ComponentListItem
```tsx
// figma-plugin/src/ui/ComponentListItem.tsx
interface Props {
  component: ComponentInfo;
  selected: boolean;
  onToggle: () => void;
}

export default function ComponentListItem({ component, selected, onToggle }: Props) {
  return (
    <label className="component-list-item">
      <input type="checkbox" checked={selected} onChange={onToggle} />
      <div className="item-info">
        <span className="name">{component.name}</span>
        <span className="meta">
          {component.type === 'COMPONENT_SET' 
            ? `${component.variantCount} variants` 
            : 'Component'}
        </span>
      </div>
    </label>
  );
}
```

---

## Files Created
- `figma-plugin/src/ui/ComponentsTab.tsx` — Components tab UI
- `figma-plugin/src/ui/ComponentListItem.tsx` — List item component

---

## Tests

### Unit Tests
- [ ] Tab renders
- [ ] Scan triggers plugin message
- [ ] Component selection works
- [ ] Select all/none works
- [ ] Export button state correct

---

## Time Estimate
2 hours
