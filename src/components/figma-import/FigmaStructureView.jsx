/**
 * @chunk 4.09 - FigmaStructureView
 * 
 * Visual tree view of Figma component structure.
 * Shows node hierarchy with type icons, layout modes, padding/gap values,
 * and highlights nodes with bound variables.
 */

import { useState, useMemo } from 'react';
import { cn } from '../../lib/utils';
import { 
  ChevronRight, 
  Frame, 
  Type, 
  Square,
  Circle,
  Component,
  Layout,
  Layers
} from 'lucide-react';

const MAX_RENDER_DEPTH = 10;
const VIRTUALIZATION_THRESHOLD = 100;

export default function FigmaStructureView({ structure, boundVariables = [] }) {
  const [expandedPaths, setExpandedPaths] = useState(new Set([''])); // Root is expanded by default
  
  // Build a map of node paths to bound variables for quick lookup
  const boundVariablesByPath = useMemo(() => {
    const map = new Map();
    if (!boundVariables || boundVariables.length === 0) return map;
    
    boundVariables.forEach(bv => {
      const path = bv.nodePath || bv.node_path || '';
      if (!map.has(path)) {
        map.set(path, []);
      }
      map.get(path).push(bv);
    });
    
    return map;
  }, [boundVariables]);

  // Count total nodes for virtualization check
  const totalNodes = useMemo(() => {
    if (!structure) return 0;
    let count = 0;
    const countNodes = (node) => {
      count++;
      if (node.children) {
        node.children.forEach(countNodes);
      }
    };
    countNodes(structure);
    return count;
  }, [structure]);

  const toggleExpand = (path) => {
    setExpandedPaths(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  if (!structure) {
    return (
      <div className="figma-structure-view-empty">
        <p>No structure data available for this component.</p>
      </div>
    );
  }

  return (
    <div className="figma-structure-view">
      <div className="structure-header">
        <p>
          This shows the Figma layer structure. Use this to understand 
          the component hierarchy and how it maps to React elements.
        </p>
        {totalNodes > VIRTUALIZATION_THRESHOLD && (
          <p className="structure-warning">
            ⚠️ Large structure ({totalNodes} nodes). Consider using virtualization for better performance.
          </p>
        )}
      </div>
      
      <div className="structure-tree">
        <StructureNode 
          node={structure} 
          path=""
          depth={0}
          expandedPaths={expandedPaths}
          onToggleExpand={toggleExpand}
          boundVariablesByPath={boundVariablesByPath}
        />
      </div>

      <div className="structure-legend">
        <h4>Legend</h4>
        <div className="legend-items">
          <span><Frame size={14} /> Frame/Group</span>
          <span><Type size={14} /> Text</span>
          <span><Square size={14} /> Rectangle</span>
          <span><Component size={14} /> Instance</span>
          <span className="legend-highlight">
            <Layers size={14} /> Has bound variables
          </span>
        </div>
      </div>
    </div>
  );
}

function StructureNode({ 
  node, 
  path, 
  depth, 
  expandedPaths, 
  onToggleExpand,
  boundVariablesByPath 
}) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedPaths.has(path);
  const nodeBoundVars = boundVariablesByPath.get(path) || [];
  const hasBoundVariables = nodeBoundVars.length > 0;
  
  // Prevent rendering beyond max depth
  if (depth >= MAX_RENDER_DEPTH) {
    return (
      <div className="structure-node structure-node-depth-limit">
        <div 
          className="node-header" 
          style={{ paddingLeft: `calc(var(--spacing-md) * ${depth})` }}
        >
          <span className="expand-placeholder" />
          <span className="node-name" style={{ fontStyle: 'italic' }}>
            ... (max depth reached)
          </span>
        </div>
      </div>
    );
  }

  const TypeIcon = getTypeIcon(node.type);

  const handleToggle = () => {
    if (hasChildren) {
      onToggleExpand(path);
    }
  };

  return (
    <div className="structure-node">
      <div 
        className={cn(
          'node-header',
          { 
            'has-bound-variables': hasBoundVariables,
            'has-children': hasChildren,
            'expanded': isExpanded
          }
        )}
        style={{ paddingLeft: `calc(var(--spacing-md) * ${depth})` }}
        onClick={handleToggle}
      >
        {hasChildren ? (
          <ChevronRight 
            className={cn('expand-icon', { expanded: isExpanded })} 
            size={14}
          />
        ) : (
          <span className="expand-placeholder" />
        )}
        
        <TypeIcon className="type-icon" size={14} />
        <span className="node-name">{node.name || 'Unnamed'}</span>
        <span className="node-type">{node.type}</span>
        
        {node.layoutMode && node.layoutMode !== 'NONE' && (
          <span 
            className="layout-badge" 
            title={`Auto-layout: ${node.layoutMode}`}
          >
            {node.layoutMode === 'HORIZONTAL' ? '→' : '↓'}
          </span>
        )}
        
        {node.gap !== undefined && node.gap !== null && (
          <span className="gap-badge" title={`Gap: ${node.gap}px`}>
            gap: {node.gap}
          </span>
        )}

        {node.padding && (
          <span 
            className="padding-badge" 
            title={`Padding: ${formatPadding(node.padding)}`}
          >
            pad
          </span>
        )}

        {hasBoundVariables && (
          <span 
            className="bound-variables-badge" 
            title={`${nodeBoundVars.length} bound variable(s)`}
          >
            <Layers size={12} /> {nodeBoundVars.length}
          </span>
        )}
      </div>

      {isExpanded && hasChildren && (
        <div className="node-children">
          {node.children.map((child, i) => {
            const childPath = path ? `${path}/${child.name || i}` : (child.name || String(i));
            return (
              <StructureNode 
                key={child.id || childPath || i}
                node={child} 
                path={childPath}
                depth={depth + 1}
                expandedPaths={expandedPaths}
                onToggleExpand={onToggleExpand}
                boundVariablesByPath={boundVariablesByPath}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function getTypeIcon(type) {
  const icons = {
    FRAME: Frame,
    GROUP: Layout,
    TEXT: Type,
    RECTANGLE: Square,
    ELLIPSE: Circle,
    VECTOR: Square,
    COMPONENT: Component,
    INSTANCE: Component,
    LINE: Square,
    POLYGON: Square,
    STAR: Square,
    BOOLEAN_OPERATION: Square,
  };
  return icons[type] || Layers;
}

function formatPadding(padding) {
  if (typeof padding === 'object' && padding !== null) {
    const { top, right, bottom, left } = padding;
    if (top === right && right === bottom && bottom === left) {
      return `${top}px`;
    }
    return `${top}px ${right}px ${bottom}px ${left}px`;
  }
  return String(padding);
}
