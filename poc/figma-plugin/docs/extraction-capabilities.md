# Figma Component Extraction Capabilities

Documentation of Figma Plugin API capabilities and limitations for component extraction.

## Summary

| Capability | Status | Notes |
|------------|--------|-------|
| Read component name/description | ✅ Supported | Direct property access |
| Read componentPropertyDefinitions | ✅ Supported | All property types accessible |
| Detect Component vs ComponentSet | ✅ Supported | Via `node.type` |
| Extract variant combinations | ✅ Supported | Via `variantProperties` getter |
| Access boundVariables | ⚠️ Partial | Only on instances, not definitions |
| Read local variables | ✅ Supported | Via `figma.variables` API |
| Read layout properties | ✅ Supported | Auto-layout, padding, spacing |
| Export component structure | ✅ Supported | Full tree traversal |

## Detailed Capabilities

### Component Properties (componentPropertyDefinitions)

The `componentPropertyDefinitions` object is available on both `ComponentNode` and `ComponentSetNode`.

```typescript
node.componentPropertyDefinitions = {
  "PropertyName": {
    type: "BOOLEAN" | "TEXT" | "INSTANCE_SWAP" | "VARIANT",
    defaultValue: string | boolean,
    variantOptions?: string[],  // Only for VARIANT type
    preferredValues?: [...]     // Only for INSTANCE_SWAP
  }
}
```

#### Property Types

| Type | Available Data | Notes |
|------|---------------|-------|
| BOOLEAN | `defaultValue: boolean` | Toggle properties |
| TEXT | `defaultValue: string` | Text override properties |
| INSTANCE_SWAP | `defaultValue: string`, `preferredValues` | Instance swap slots |
| VARIANT | `defaultValue: string`, `variantOptions: string[]` | Variant axes |

### Variants (ComponentSetNode only)

For `ComponentSetNode`, variants are accessed through `node.children`:

```typescript
for (const child of componentSet.children) {
  if (child.type === 'COMPONENT') {
    // child.variantProperties gives parsed variant values
    const properties = child.variantProperties;
    // { "Size": "Large", "State": "Default" }
  }
}
```

### Bound Variables

**Important Limitation:** `boundVariables` is only available on instances and their children, NOT on the component definition itself.

To detect token usage:
1. Check `boundVariables` on each node in the tree
2. Cross-reference with local variables via `figma.variables.getVariableById()`

```typescript
// On nodes that have bound variables:
node.boundVariables = {
  "fills": [{ id: "VariableID:123:456" }],
  "width": { id: "VariableID:789:012" }
}
```

### Local Variables API

```typescript
// Get all variable collections
const collections = figma.variables.getLocalVariableCollections();

// Get variable by ID
const variable = figma.variables.getVariableById(id);

// Variable structure
variable = {
  id: string,
  name: string,
  variableCollectionId: string,
  resolvedType: "BOOLEAN" | "COLOR" | "FLOAT" | "STRING"
}
```

### Layout Properties (Auto-Layout)

Available on frames and components with auto-layout:

```typescript
node.layoutMode        // "NONE" | "HORIZONTAL" | "VERTICAL"
node.primaryAxisAlignItems    // Alignment
node.counterAxisAlignItems    // Cross-axis alignment
node.paddingLeft/Right/Top/Bottom
node.itemSpacing       // Gap between children
```

### Style Properties

```typescript
node.fills     // Paint[] or figma.mixed
node.strokes   // Paint[]
node.cornerRadius  // number or figma.mixed
node.effects   // Effect[]
```

## Limitations & Workarounds

### 1. boundVariables Not on Definitions

**Problem:** Component definitions don't expose which variables they use.

**Workaround:** 
- Create an instance of the component
- Traverse the instance tree to find boundVariables
- Map back to the component structure

```typescript
// Create temporary instance to read bound variables
const instance = component.createInstance();
const boundVars = extractBoundVariables(instance);
instance.remove();
```

### 2. Mixed Values

**Problem:** Properties like `cornerRadius` can be `figma.mixed` when different corners have different values.

**Workaround:** Check for mixed and handle individually:
```typescript
if (node.cornerRadius === figma.mixed) {
  // Access individual corners
  const { topLeftRadius, topRightRadius, ... } = node;
}
```

### 3. Nested Component Instances

**Problem:** Components may contain instances of other components.

**Workaround:** Track instance relationships:
```typescript
if (node.type === 'INSTANCE') {
  const mainComponent = node.mainComponent;
  // Reference the main component ID
}
```

### 4. Private/Team Components

**Problem:** Can't access components from other files/teams.

**Workaround:** Only extract from current document. Document external dependencies separately.

## Test Cases

### Test Case 1: Simple Component
- **Input:** ComponentNode with no properties
- **Expected:** name, description, structure
- **Warning:** "No component properties found"

### Test Case 2: Boolean Property
- **Input:** Component with Boolean property (e.g., "showIcon")
- **Expected:** Property with type BOOLEAN, defaultValue

### Test Case 3: Text Property
- **Input:** Component with text override
- **Expected:** Property with type TEXT, defaultValue

### Test Case 4: Instance Swap
- **Input:** Component with instance swap slot
- **Expected:** Property with type INSTANCE_SWAP, preferredValues

### Test Case 5: Variant Component Set
- **Input:** ComponentSetNode with Size/State variants
- **Expected:** VARIANT properties, all variant combinations

### Test Case 6: Token-Bound Component
- **Input:** Component using design tokens (variables)
- **Expected:** boundVariables array with variable references

## Sample Output

```json
{
  "id": "123:456",
  "name": "Button",
  "description": "Primary action button",
  "type": "COMPONENT_SET",
  "properties": [
    {
      "name": "Size",
      "type": "VARIANT",
      "defaultValue": "Medium",
      "variantOptions": ["Small", "Medium", "Large"]
    },
    {
      "name": "State",
      "type": "VARIANT", 
      "defaultValue": "Default",
      "variantOptions": ["Default", "Hover", "Pressed", "Disabled"]
    },
    {
      "name": "Show Icon",
      "type": "BOOLEAN",
      "defaultValue": false
    }
  ],
  "variants": [
    { "id": "123:457", "name": "Size=Small, State=Default", "properties": { "Size": "Small", "State": "Default" } },
    { "id": "123:458", "name": "Size=Medium, State=Default", "properties": { "Size": "Medium", "State": "Default" } }
  ],
  "boundVariables": [
    {
      "nodeId": "123:460",
      "nodeName": "Background",
      "property": "fills",
      "variableId": "VariableID:1:100",
      "variableName": "color/primary/500",
      "collectionName": "Design Tokens"
    }
  ],
  "structure": {
    "id": "123:456",
    "name": "Button",
    "type": "COMPONENT_SET",
    "width": 200,
    "height": 100,
    "children": [...]
  },
  "extractedAt": "2026-01-03T12:00:00.000Z",
  "warnings": []
}
```

## Recommendations for Production

1. **Always create instance for boundVariables** - Component definitions won't show token bindings
2. **Handle mixed values gracefully** - Check before accessing style properties
3. **Limit tree depth** - Deep component trees can be slow; use depth limit
4. **Cache variable lookups** - Build map once, reuse for all nodes
5. **Document limitations in UI** - Users should know what can't be extracted

## API Version Compatibility

Tested with Figma Plugin API version `1.0.0`.

Key APIs used:
- `figma.currentPage.selection`
- `node.componentPropertyDefinitions`
- `node.variantProperties`
- `node.boundVariables`
- `figma.variables.getLocalVariableCollections()`
- `figma.variables.getVariableById()`

## Next Steps

This PoC confirms:
- ✅ Component extraction is feasible
- ✅ Property definitions are accessible
- ✅ Variant combinations can be parsed
- ⚠️ Bound variables require instance creation workaround

Proceed to:
- **Chunk 0.03:** Image export testing
- **Chunk 0.04:** API communication testing

