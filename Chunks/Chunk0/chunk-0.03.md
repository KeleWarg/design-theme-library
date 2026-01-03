# Chunk 0.03 — Figma Plugin PoC - Image Export

## Purpose
Test exportAsync API for extracting images from components.

---

## Inputs
- Figma plugin scaffold (from chunk 0.01)
- Test components with images/fills

## Outputs
- ImageExporter module (consumed by chunk 4.03)
- Documentation of image export capabilities
- Sample exported images

---

## Dependencies
- Chunk 0.01 must be complete

---

## Implementation Notes

### Key Considerations
- Test PNG and SVG export formats
- Test different scales (1x, 2x, 3x)
- Check file size limits
- Test on various node types (Frame, Image, Vector)

### Gotchas
- exportAsync returns Uint8Array, needs conversion for transmission
- Large images may timeout
- SVG export may not preserve all effects
- Must have exportSettings permission in manifest

### Algorithm/Approach
1. Find image nodes within component
2. Test exportAsync with options:
   - format: 'PNG' | 'SVG' | 'JPG'
   - constraint: { type: 'SCALE', value: 2 }
3. Convert Uint8Array to base64 for transmission
4. Measure export times and sizes

### Export Configuration Matrix
| Node Type | Recommended Format | Scale | Notes |
|-----------|-------------------|-------|-------|
| Vector graphic | SVG | 1x | Best for icons |
| Photo/raster | PNG | 2x | Balance quality/size |
| Complex frame | PNG | 2x | Fallback for mixed content |
| Icon | SVG | 1x | Scalable, small file |
| Illustration | SVG | 1x | If vector; PNG if effects |

### Base64 Conversion
```typescript
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
```

### Size Benchmarking
Document for each test:
- Node dimensions (px)
- Export format
- Scale factor
- Result file size (bytes)
- Export time (ms)

---

## Files Created
- `figma-plugin/src/extractors/images.ts` — Image export logic
- `figma-plugin/docs/image-export-capabilities.md` — Documentation

---

## Tests

### Unit Tests
- [ ] Can export node as PNG
- [ ] Can export node as SVG
- [ ] Can set scale factor
- [ ] Returns valid base64 data

### Verification
- [ ] Exported images are valid and viewable
- [ ] Document size/time benchmarks
- [ ] Document any limitations

---

## Time Estimate
3 hours

---

## Notes
Image export is required for component thumbnails and visual documentation. If SVG export fails for complex components, PNG fallback is acceptable.
