# Chunk 4.03 — ImageExporter Module

## Purpose
Export images from component nodes.

---

## Inputs
- Component nodes
- Plugin PoC learnings (from chunk 0.03)

## Outputs
- Base64 encoded images
- Image metadata

---

## Dependencies
- Chunk 0.03 must be complete

---

## Implementation Notes

### Type Definitions
```typescript
// figma-plugin/src/types/images.ts
export interface ExportedImage {
  nodeId: string;
  nodeName: string;
  data: string; // base64
  format: 'PNG' | 'SVG';
  width: number;
  height: number;
  hash: string;
}
```

### Image Exporter
```typescript
// figma-plugin/src/extractors/images.ts
import { ExportedImage } from '../types/images';

export async function exportComponentImages(
  node: ComponentNode | ComponentSetNode
): Promise<ExportedImage[]> {
  const images: ExportedImage[] = [];
  const imageNodes = findImageNodes(node);

  // Export individual image/vector nodes
  for (const imageNode of imageNodes) {
    try {
      const image = await exportNode(imageNode);
      if (image) {
        images.push(image);
      }
    } catch (error) {
      console.warn(`Failed to export image from ${imageNode.name}:`, error);
    }
  }

  // Export the component itself as a preview (2x scale)
  try {
    const preview = await exportNode(node, { scale: 2, format: 'PNG' });
    if (preview) {
      preview.nodeName = `${node.name}_preview`;
      images.unshift(preview); // Put preview first
    }
  } catch (error) {
    console.warn('Failed to export component preview:', error);
  }

  return images;
}

function findImageNodes(node: SceneNode): SceneNode[] {
  const nodes: SceneNode[] = [];

  function traverse(n: SceneNode) {
    // Check if this node has image fills
    if ('fills' in n) {
      const fills = n.fills as Paint[];
      if (Array.isArray(fills) && fills.some(f => f.type === 'IMAGE')) {
        nodes.push(n);
      }
    }

    // Check for vector nodes (icons)
    if (n.type === 'VECTOR' || n.type === 'STAR' || n.type === 'POLYGON') {
      nodes.push(n);
    }

    // Traverse children
    if ('children' in n) {
      for (const child of n.children) {
        traverse(child);
      }
    }
  }

  traverse(node);
  return nodes;
}

async function exportNode(
  node: SceneNode,
  options: { scale?: number; format?: 'PNG' | 'SVG' } = {}
): Promise<ExportedImage | null> {
  const { scale = 2, format = 'PNG' } = options;

  // Determine best format - use SVG for vectors
  let exportFormat: 'PNG' | 'SVG' = format;
  if (node.type === 'VECTOR' || node.type === 'STAR' || node.type === 'POLYGON') {
    exportFormat = 'SVG';
  }

  const settings: ExportSettings = exportFormat === 'SVG'
    ? { format: 'SVG' }
    : { format: 'PNG', constraint: { type: 'SCALE', value: scale } };

  const bytes = await node.exportAsync(settings);
  const base64 = uint8ArrayToBase64(bytes);
  const hash = await generateHash(bytes);

  return {
    nodeId: node.id,
    nodeName: node.name,
    data: base64,
    format: exportFormat,
    width: Math.round(node.width * (exportFormat === 'PNG' ? scale : 1)),
    height: Math.round(node.height * (exportFormat === 'PNG' ? scale : 1)),
    hash,
  };
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function generateHash(bytes: Uint8Array): Promise<string> {
  // Simple hash for deduplication
  let hash = 0;
  for (let i = 0; i < bytes.length; i++) {
    hash = ((hash << 5) - hash) + bytes[i];
    hash = hash & hash;
  }
  return hash.toString(16);
}
```

---

## Files Created
- `figma-plugin/src/types/images.ts` — Image type definitions
- `figma-plugin/src/extractors/images.ts` — Image export logic

---

## Tests

### Unit Tests
- [ ] Finds image fill nodes
- [ ] Finds vector/icon nodes
- [ ] Exports PNG at correct scale
- [ ] Exports SVG for vectors
- [ ] Generates base64 correctly
- [ ] Hash generation works for deduplication
- [ ] Preview image created for component

---

## Time Estimate
3 hours
