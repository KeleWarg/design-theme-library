# Chunk 4.09 — FigmaStructureView

## Purpose
Visual tree view of Figma component structure.

---

## Inputs
- Simplified structure from extraction

## Outputs
- Interactive tree view

---

## Dependencies
- Chunk 4.08 must be complete

---

## Implementation Notes

```jsx
// src/components/figma-import/FigmaStructureView.jsx
import { useState } from 'react';
import { cn } from '../../lib/utils';
import { 
  ChevronRightIcon, 
  FrameIcon, 
  TypeIcon, 
  BoxIcon,
  CircleIcon,
  ComponentIcon,
  LayoutIcon
} from 'lucide-react';

export default function FigmaStructureView({ structure }) {
  return (
    <div className="figma-structure-view">
      <div className="structure-header">
        <p>
          This shows the Figma layer structure. Use this to understand 
          the component hierarchy and how it maps to React elements.
        </p>
      </div>
      
      <div className="structure-tree">
        <StructureNode node={structure} depth={0} />
      </div>

      <div className="structure-legend">
        <h4>Legend</h4>
        <div className="legend-items">
          <span><FrameIcon size={14} /> Frame/Group</span>
          <span><TypeIcon size={14} /> Text</span>
          <span><BoxIcon size={14} /> Rectangle</span>
          <span><ComponentIcon size={14} /> Instance</span>
        </div>
      </div>
    </div>
  );
}

function StructureNode({ node, depth }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children?.length > 0;

  const TypeIcon = getTypeIcon(node.type);

  return (
    <div className="structure-node">
      <div 
        className="node-header" 
        style={{ paddingLeft: depth * 16 }}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren && (
          <ChevronRightIcon 
            className={cn('expand-icon', { expanded })} 
            size={14}
          />
        )}
        {!hasChildren && <span className="expand-placeholder" />}
        
        <TypeIcon className="type-icon" size={14} />
        <span className="node-name">{node.name}</span>
        <span className="node-type">{node.type}</span>
        
        {node.layoutMode && (
          <span className="layout-badge" title={`Auto-layout: ${node.layoutMode}`}>
            {node.layoutMode === 'HORIZONTAL' ? '→' : '↓'}
          </span>
        )}
        
        {node.gap && (
          <span className="gap-badge" title={`Gap: ${node.gap}px`}>
            gap: {node.gap}
          </span>
        )}
      </div>

      {expanded && hasChildren && (
        <div className="node-children">
          {node.children.map((child, i) => (
            <StructureNode key={i} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function getTypeIcon(type) {
  const icons = {
    FRAME: FrameIcon,
    GROUP: LayoutIcon,
    TEXT: TypeIcon,
    RECTANGLE: BoxIcon,
    ELLIPSE: CircleIcon,
    VECTOR: BoxIcon,
    COMPONENT: ComponentIcon,
    INSTANCE: ComponentIcon,
  };
  return icons[type] || BoxIcon;
}
```

### Styling
```css
.figma-structure-view {
  padding: 1rem;
}

.structure-tree {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.5rem;
  max-height: 400px;
  overflow-y: auto;
}

.node-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
  cursor: pointer;
  border-radius: var(--radius-sm);
}

.node-header:hover {
  background: var(--color-muted);
}

.expand-icon {
  transition: transform 0.15s;
  color: var(--color-muted-foreground);
}

.expand-icon.expanded {
  transform: rotate(90deg);
}

.expand-placeholder {
  width: 14px;
}

.type-icon {
  color: var(--color-primary);
}

.node-name {
  font-weight: 500;
}

.node-type {
  color: var(--color-muted-foreground);
  font-size: 0.75rem;
}

.layout-badge, .gap-badge {
  font-size: 0.625rem;
  padding: 0.125rem 0.25rem;
  background: var(--color-primary-muted);
  color: var(--color-primary);
  border-radius: var(--radius-sm);
}

.structure-legend {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.legend-items {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: var(--color-muted-foreground);
}

.legend-items span {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
```

---

## Files Created
- `src/components/figma-import/FigmaStructureView.jsx` — Structure tree

---

## Tests

### Unit Tests
- [ ] Renders tree structure
- [ ] Expand/collapse works
- [ ] Type icons correct
- [ ] Layout indicators show
- [ ] Gap values displayed

---

## Time Estimate
2.5 hours
