# Chunk 4.02 — ComponentExtractor Module

## Purpose
Extract component metadata from Figma nodes.

---

## Inputs
- Selected Figma component nodes
- Plugin PoC learnings (from chunk 0.02)

## Outputs
- Structured component data
- ComponentExtractor module

---

## Dependencies
- Chunk 0.02 must be complete

---

## Implementation Notes

### Type Definitions
```typescript
// figma-plugin/src/types/component.ts
export interface ExtractedComponent {
  id: string;
  name: string;
  description: string;
  type: 'COMPONENT' | 'COMPONENT_SET';
  properties: ExtractedProperty[];
  variants: ExtractedVariant[];
  structure: SimplifiedNode;
  boundVariables: BoundVariable[];
}

export interface ExtractedProperty {
  name: string;
  type: 'BOOLEAN' | 'TEXT' | 'INSTANCE_SWAP' | 'VARIANT';
  defaultValue: any;
  options?: string[];
}

export interface ExtractedVariant {
  name: string;
  props: Record<string, string>;
  nodeId: string;
}

export interface SimplifiedNode {
  name: string;
  type: string;
  layoutMode?: string;
  padding?: { top: number; right: number; bottom: number; left: number };
  gap?: number;
  children?: SimplifiedNode[];
}

export interface BoundVariable {
  nodePath: string;
  field: string;
  variableId: string;
  variableName: string;
  collectionName: string;
}
```

### Extractor Module
```typescript
// figma-plugin/src/extractors/component.ts
import { ExtractedComponent, ExtractedProperty, ExtractedVariant, SimplifiedNode, BoundVariable } from '../types/component';

export async function extractComponent(
  node: ComponentNode | ComponentSetNode
): Promise<ExtractedComponent> {
  return {
    id: node.id,
    name: node.name,
    description: node.description || '',
    type: node.type as 'COMPONENT' | 'COMPONENT_SET',
    properties: extractProperties(node),
    variants: node.type === 'COMPONENT_SET' ? extractVariants(node) : [],
    structure: simplifyStructure(node),
    boundVariables: extractBoundVariables(node),
  };
}

function extractProperties(node: ComponentNode | ComponentSetNode): ExtractedProperty[] {
  const props: ExtractedProperty[] = [];
  
  if ('componentPropertyDefinitions' in node) {
    const defs = node.componentPropertyDefinitions;
    
    for (const [key, def] of Object.entries(defs || {})) {
      props.push({
        name: key,
        type: def.type,
        defaultValue: def.defaultValue,
        options: def.type === 'VARIANT' ? def.variantOptions : undefined,
      });
    }
  }
  
  return props;
}

function extractVariants(node: ComponentSetNode): ExtractedVariant[] {
  return node.children
    .filter(child => child.type === 'COMPONENT')
    .map(child => ({
      name: child.name,
      props: parseVariantName(child.name),
      nodeId: child.id,
    }));
}

function simplifyStructure(node: SceneNode, depth = 0): SimplifiedNode {
  const MAX_DEPTH = 5;
  
  const simplified: SimplifiedNode = {
    name: node.name,
    type: node.type,
  };

  if ('layoutMode' in node && node.layoutMode !== 'NONE') {
    simplified.layoutMode = node.layoutMode;
    simplified.padding = {
      top: node.paddingTop,
      right: node.paddingRight,
      bottom: node.paddingBottom,
      left: node.paddingLeft,
    };
    simplified.gap = node.itemSpacing;
  }

  if ('children' in node && depth < MAX_DEPTH) {
    simplified.children = node.children.map(child => 
      simplifyStructure(child, depth + 1)
    );
  }

  return simplified;
}

function extractBoundVariables(node: SceneNode): BoundVariable[] {
  const variables: BoundVariable[] = [];
  
  function traverse(n: SceneNode, path: string = '') {
    if ('boundVariables' in n) {
      for (const [field, binding] of Object.entries(n.boundVariables || {})) {
        if (binding) {
          const variable = figma.variables.getVariableById(binding.id);
          if (variable) {
            variables.push({
              nodePath: path || n.name,
              field,
              variableId: binding.id,
              variableName: variable.name,
              collectionName: figma.variables.getVariableCollectionById(
                variable.variableCollectionId
              )?.name || '',
            });
          }
        }
      }
    }
    
    if ('children' in n) {
      for (const child of n.children) {
        traverse(child, `${path}/${child.name}`);
      }
    }
  }
  
  traverse(node);
  return variables;
}

function parseVariantName(name: string): Record<string, string> {
  const props: Record<string, string> = {};
  const parts = name.split(', ');
  
  for (const part of parts) {
    const [key, value] = part.split('=');
    if (key && value) {
      props[key.trim()] = value.trim();
    }
  }
  
  return props;
}
```

---

## Files Created
- `figma-plugin/src/types/component.ts` — Type definitions
- `figma-plugin/src/extractors/component.ts` — Component extraction logic

---

## Tests

### Unit Tests
- [ ] Extracts basic component info
- [ ] Extracts properties from componentPropertyDefinitions
- [ ] Extracts variants from ComponentSet
- [ ] Simplifies structure correctly (respects MAX_DEPTH)
- [ ] Finds bound variables recursively
- [ ] Parses variant names correctly

---

## Time Estimate
3 hours
