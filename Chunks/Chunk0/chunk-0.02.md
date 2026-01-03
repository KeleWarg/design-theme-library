# Chunk 0.02 — Figma Plugin PoC - Component Extraction

## Purpose
Test extraction of component properties, variants, and bound variables from Figma components.

---

## Inputs
- Figma plugin scaffold (from chunk 0.01)
- Test Figma file with components

## Outputs
- ComponentExtractor module (consumed by chunk 4.02)
- Documentation of API capabilities and limitations
- Sample extracted data structure

---

## Dependencies
- Chunk 0.01 must be complete

---

## Implementation Notes

### Key Considerations
- Test with ComponentNode and ComponentSetNode
- Check componentPropertyDefinitions availability
- Test boundVariables for token links

### Gotchas
- componentPropertyDefinitions may be empty for simple components
- boundVariables only available on instances, not definitions
- Need to traverse variant children in ComponentSetNode

### Algorithm/Approach
1. Select a component in Figma
2. Log all available properties
3. Test extraction of:
   - name, description
   - componentPropertyDefinitions (props)
   - variant combinations (for ComponentSetNode)
   - boundVariables on children
   - layout properties (layoutMode, padding, etc.)

### Test Cases to Document
| Case | Node Type | Expected Extraction |
|------|-----------|---------------------|
| Simple component | ComponentNode | name, description |
| Boolean property | ComponentNode | componentPropertyDefinitions with BOOLEAN |
| Text property | ComponentNode | componentPropertyDefinitions with TEXT |
| Instance swap | ComponentNode | componentPropertyDefinitions with INSTANCE_SWAP |
| Multiple variants | ComponentSetNode | All variant combinations |
| Bound variables | InstanceNode children | boundVariables mapping |

### Expected Data Structure
```typescript
interface ExtractedComponent {
  id: string;
  name: string;
  description: string;
  type: 'COMPONENT' | 'COMPONENT_SET';
  properties: {
    name: string;
    type: 'BOOLEAN' | 'TEXT' | 'INSTANCE_SWAP' | 'VARIANT';
    defaultValue?: string | boolean;
    variantOptions?: string[];
  }[];
  variants?: {
    name: string;
    properties: Record<string, string>;
  }[];
  boundVariables?: {
    property: string;
    variableId: string;
    variableName: string;
  }[];
  structure: SimplifiedNode;
}
```

---

## Files Created
- `figma-plugin/src/extractors/component.ts` — Component extraction logic
- `figma-plugin/docs/extraction-capabilities.md` — Documentation of findings

---

## Tests

### Unit Tests
- [ ] Can extract component name and description
- [ ] Can extract componentPropertyDefinitions
- [ ] Can detect ComponentSet vs Component
- [ ] Can extract variant combinations

### Integration Tests
- [ ] Full extraction on real component produces valid JSON

### Verification
- [ ] Document all limitations found
- [ ] Sample output matches expected structure

---

## Time Estimate
4 hours

---

## Notes
This chunk is critical for determining Figma import feasibility. Document ALL limitations discovered - this feeds directly into the GO/NO-GO decision in chunk 0.06.
