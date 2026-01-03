# Chunk 4.05 — Plugin Integration Testing

## Purpose
Full integration test of the plugin export flow.

---

## Inputs
- All plugin modules (chunks 4.01-4.04)
- Test Figma file

## Outputs
- Working plugin export
- Integration test results

---

## Dependencies
- Chunks 4.01-4.04 must be complete

---

## Implementation Notes

### Test Scenarios

1. **Simple Component Export**
   - Single component with no variants
   - Verify metadata extracted
   - Verify preview image exported

2. **ComponentSet Export**
   - Component with variants
   - Verify all variants extracted
   - Verify properties parsed

3. **Component with Bound Variables**
   - Component using design tokens
   - Verify bound variables found
   - Verify variable names/collections

4. **Component with Images**
   - Component containing image fills
   - Component containing vector icons
   - Verify all images exported

5. **Batch Export**
   - Multiple components at once
   - Verify chunking works
   - Verify progress updates

### Main Plugin Entry Point
```typescript
// figma-plugin/src/main.ts
import { extractComponent } from './extractors/component';
import { exportComponentImages } from './extractors/images';

figma.showUI(__html__, { width: 400, height: 600 });

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'scan-components') {
    const components = figma.currentPage.findAll(n => 
      n.type === 'COMPONENT' || n.type === 'COMPONENT_SET'
    );
    
    const componentInfo = components.map(c => ({
      id: c.id,
      name: c.name,
      type: c.type,
      variantCount: c.type === 'COMPONENT_SET' ? c.children.length : 0,
    }));
    
    figma.ui.postMessage({ 
      type: 'components-scanned', 
      data: { components: componentInfo } 
    });
  }

  if (msg.type === 'export-components') {
    const { componentIds, apiUrl } = msg;
    
    const exportedComponents = [];
    const exportedImages = [];
    
    for (let i = 0; i < componentIds.length; i++) {
      const node = figma.getNodeById(componentIds[i]);
      if (!node || (node.type !== 'COMPONENT' && node.type !== 'COMPONENT_SET')) {
        continue;
      }
      
      // Update progress (0-50% for extraction)
      figma.ui.postMessage({ 
        type: 'export-progress', 
        data: { progress: (i / componentIds.length) * 50 }
      });
      
      const extracted = await extractComponent(node as ComponentNode | ComponentSetNode);
      const images = await exportComponentImages(node as ComponentNode | ComponentSetNode);
      
      exportedComponents.push(extracted);
      exportedImages.push(...images);
    }
    
    // Send to UI for API call (50-100% handled by API client)
    figma.ui.postMessage({
      type: 'api-request',
      apiUrl,
      payload: {
        components: exportedComponents,
        images: exportedImages,
        metadata: {
          fileKey: figma.fileKey || '',
          fileName: figma.root.name,
          exportedAt: new Date().toISOString(),
        }
      }
    });
  }
};
```

### Integration Test Checklist
```markdown
## Manual Testing Checklist

### Setup
- [ ] Plugin loads in Figma
- [ ] UI displays correctly

### Scanning
- [ ] "Scan Document" finds all components
- [ ] Component count is accurate
- [ ] Variant counts shown correctly

### Selection
- [ ] Individual selection works
- [ ] Select all works
- [ ] Deselect works

### Export
- [ ] Progress bar updates
- [ ] Components extracted successfully
- [ ] Images exported correctly
- [ ] API receives payload
- [ ] Success message shown

### Error Cases
- [ ] Invalid API URL handled
- [ ] Network errors handled
- [ ] Large payload chunking works
```

---

## Files Created
- `figma-plugin/src/main.ts` — Main plugin entry (enhanced)
- `figma-plugin/tests/integration-checklist.md` — Test documentation

---

## Tests

### Integration Tests
- [ ] Scan finds all components
- [ ] Export extracts all data
- [ ] Images exported correctly
- [ ] API call succeeds
- [ ] Progress updates work
- [ ] Error handling works

---

## Time Estimate
2 hours
