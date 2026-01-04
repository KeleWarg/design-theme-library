# Image Export Capabilities

**Chunk:** 0.03 - Figma Plugin PoC - Image Export

This document describes the image export capabilities of the Design System Admin Figma plugin.

---

## Overview

The `ImageExporter` module provides functionality to export images from Figma nodes in various formats. It handles the conversion of Figma's `exportAsync` output (Uint8Array) to base64 strings suitable for transmission to the admin tool.

---

## Supported Formats

| Format | Extension | Use Case | Notes |
|--------|-----------|----------|-------|
| PNG | `.png` | General purpose, screenshots | Lossless, supports transparency |
| SVG | `.svg` | Vector graphics, icons | Scalable, smallest for vectors |
| JPG | `.jpg` | Photos, complex gradients | Lossy, no transparency |

---

## Export Configuration by Node Type

The module recommends optimal export settings based on Figma node type:

| Node Type | Recommended Format | Scale | Rationale |
|-----------|-------------------|-------|-----------|
| VECTOR | SVG | 1x | Scalable, small file size |
| STAR | SVG | 1x | Scalable geometry |
| LINE | SVG | 1x | Simple path |
| ELLIPSE | SVG | 1x | Scalable geometry |
| POLYGON | SVG | 1x | Scalable geometry |
| BOOLEAN_OPERATION | SVG | 1x | Vector operations |
| RECTANGLE | PNG | 2x | May have fills/effects |
| FRAME | PNG | 2x | Complex content |
| GROUP | PNG | 2x | Mixed content |
| COMPONENT | PNG | 2x | Design component |
| COMPONENT_SET | PNG | 2x | Variant collection |
| INSTANCE | PNG | 2x | Component instance |
| TEXT | PNG | 2x | Preserve rendering |
| SLICE | PNG | 2x | Export region |

---

## Scale Factors

Supported scale factors: **1x**, **2x**, **3x**

| Scale | Use Case | Typical Output |
|-------|----------|----------------|
| 1x | Preview, web | 100% of design size |
| 2x | Retina, documentation | 200% of design size (default) |
| 3x | High-DPI, print | 300% of design size |

**Note:** SVG exports ignore scale factor (vectors are scalable by nature).

---

## Limitations

### File Size Limits

| Dimension | Maximum |
|-----------|---------|
| Width | 4096px (per scale) |
| Height | 4096px (per scale) |
| Total pixels | ~16.7M (4096 × 4096) |

Attempting to export larger images may result in:
- Timeout errors
- Memory issues
- Figma API failures

### SVG Export Limitations

SVG export may not preserve:
- Blur effects (approximated or rasterized)
- Complex blend modes
- Image fills (embedded as base64)
- Some text effects

**Fallback:** Use PNG for complex designs with effects.

### Performance Considerations

| Factor | Impact |
|--------|--------|
| Node complexity | More children = slower export |
| Effects (shadows, blurs) | Increases processing time |
| High scale factors | Larger output, more memory |
| Multiple exports | Sequential, not parallel |

---

## API Reference

### Core Functions

#### `exportNode(node, options?)`

Export a single node with specified options.

```typescript
const result = await ImageExporter.exportNode(node, {
  format: 'PNG',
  scale: 2
});
```

Returns: `ExportResult`

#### `exportNodeAuto(node)`

Export using recommended settings for the node type.

```typescript
const result = await ImageExporter.exportNodeAuto(node);
```

#### `exportNodes(nodes, options?)`

Batch export multiple nodes with same settings.

```typescript
const results = await ImageExporter.exportNodes(selectedNodes, {
  format: 'PNG',
  scale: 2
});
```

Returns: `BatchExportResult` with `success` and `errors` arrays.

#### `exportNodesAuto(nodes)`

Batch export with auto-detected settings per node.

```typescript
const results = await ImageExporter.exportNodesAuto(selectedNodes);
```

### Utility Functions

#### `canExport(node)`

Check if a node type supports export.

```typescript
if (ImageExporter.canExport(node)) {
  // Safe to export
}
```

#### `isWithinLimits(node, scale)`

Check if dimensions are within safe export limits.

```typescript
if (ImageExporter.isWithinLimits(node, 3)) {
  // Safe to export at 3x
}
```

#### `getRecommendedConfig(nodeType)`

Get recommended export settings for a node type.

```typescript
const config = ImageExporter.getRecommendedConfig('COMPONENT');
// { format: 'PNG', scale: 2 }
```

#### `uint8ArrayToBase64(bytes)`

Convert export bytes to base64 string.

```typescript
const base64 = ImageExporter.uint8ArrayToBase64(bytes);
```

### Benchmarking

#### `benchmarkNode(node)`

Run comprehensive benchmarks on a node.

```typescript
const benchmarks = await ImageExporter.benchmarkNode(node);
```

#### `formatBenchmarkReport(benchmarks)`

Generate human-readable benchmark report.

```typescript
const report = ImageExporter.formatBenchmarkReport(benchmarks);
console.log(report);
```

---

## Result Types

### ExportResult

```typescript
interface ExportResult {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  format: 'PNG' | 'SVG' | 'JPG';
  scale: number;
  base64: string;       // Base64-encoded image data
  mimeType: string;     // e.g., 'image/png'
  sizeBytes: number;    // Output file size
  exportTimeMs: number; // Time to export
  dimensions: {
    width: number;
    height: number;
  };
}
```

### BatchExportResult

```typescript
interface BatchExportResult {
  success: ExportResult[];
  errors: ExportError[];
  totalTimeMs: number;
}
```

---

## Usage Examples

### Export Selection as PNG

```typescript
import { ImageExporter } from './extractors/images';

const selection = figma.currentPage.selection;
const results = await ImageExporter.exportNodes(selection, {
  format: 'PNG',
  scale: 2
});

// Send to admin tool
figma.ui.postMessage({
  type: 'export-complete',
  payload: results
});
```

### Export Component for Thumbnail

```typescript
const component = figma.currentPage.findOne(
  n => n.type === 'COMPONENT' && n.name === 'Button'
);

if (component) {
  const thumbnail = await ImageExporter.exportNode(component, {
    format: 'PNG',
    scale: 1  // 1x for thumbnails
  });
  
  // thumbnail.base64 contains the image data
}
```

### Run Benchmarks

```typescript
const node = figma.currentPage.selection[0];
const benchmarks = await ImageExporter.benchmarkNode(node);
const report = ImageExporter.formatBenchmarkReport(benchmarks);

console.log(report);
// Output:
// === Export Benchmark Report ===
// Node: Button (COMPONENT)
// Dimensions: 120x40px
// | Format | Scale | Size (bytes) | Time (ms) |
// |--------|-------|--------------|-----------|
// | PNG    | 1     |         1234 |        12 |
// | PNG    | 2     |         4567 |        18 |
// ...
```

---

## Best Practices

1. **Use Auto Mode for Mixed Selection**
   ```typescript
   // Let the exporter choose optimal settings
   const results = await ImageExporter.exportNodesAuto(selection);
   ```

2. **Check Limits Before Large Exports**
   ```typescript
   for (const node of nodes) {
     if (!ImageExporter.isWithinLimits(node, scale)) {
       console.warn(`${node.name} too large for ${scale}x export`);
     }
   }
   ```

3. **Handle Errors Gracefully**
   ```typescript
   const { success, errors } = await ImageExporter.exportNodes(nodes);
   
   if (errors.length > 0) {
     figma.notify(`${errors.length} exports failed`);
   }
   ```

4. **Use SVG for Icons**
   ```typescript
   const icons = nodes.filter(n => n.name.startsWith('icon/'));
   const results = await ImageExporter.exportNodes(icons, {
     format: 'SVG'
   });
   ```

---

## Benchmarks (Reference)

Typical export times (varies by machine and Figma state):

| Content | Format | Scale | Size | Time |
|---------|--------|-------|------|------|
| Simple icon (24×24) | SVG | 1x | ~500B | 5-10ms |
| Simple icon (24×24) | PNG | 2x | ~1KB | 8-15ms |
| Button (120×40) | PNG | 2x | ~3KB | 10-20ms |
| Card (320×200) | PNG | 2x | ~15KB | 20-40ms |
| Complex frame (800×600) | PNG | 2x | ~80KB | 50-100ms |
| Full page (1440×900) | PNG | 1x | ~200KB | 100-200ms |

---

## Troubleshooting

### "Node type cannot be exported"

Some node types (like PAGE, DOCUMENT) don't support `exportAsync`. Use `canExport()` to check first.

### "Dimensions exceed safe limits"

Reduce scale factor or export a smaller portion of the design.

### "Export timeout"

- Try a smaller scale factor
- Export fewer nodes at once
- Simplify complex designs

### "SVG doesn't look right"

SVG may not preserve all effects. Use PNG as fallback:

```typescript
const result = await ImageExporter.exportNode(node, {
  format: node.effects?.length ? 'PNG' : 'SVG',
  scale: 2
});
```

---

## Related

- **Chunk 0.01:** Plugin Setup
- **Chunk 0.02:** Component Extraction
- **Chunk 4.03:** Production ImageExporter (consumes this module)


