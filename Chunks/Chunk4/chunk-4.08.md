# Chunk 4.08 — ImportReviewModal

## Purpose
Detailed review modal with tabs for all component aspects.

---

## Inputs
- Full component data from import

## Outputs
- Editable review interface

---

## Dependencies
- Chunk 4.07 must be complete

---

## Implementation Notes

```jsx
// src/components/figma-import/ImportReviewModal.jsx
import { useState } from 'react';
import { Modal, Tabs, Button } from '../ui';
import FigmaStructureView from './FigmaStructureView';
import ImageManager from './ImageManager';
import { SparklesIcon } from 'lucide-react';

export default function ImportReviewModal({ component, images, onClose, onImport }) {
  const [activeTab, setActiveTab] = useState('figma');
  const [editedComponent, setEditedComponent] = useState(component);
  const [editedProps, setEditedProps] = useState(
    convertFigmaPropsToAppProps(component.properties)
  );
  const [linkedTokens, setLinkedTokens] = useState(
    component.bound_variables?.map(bv => bv.variableName) || []
  );
  const [selectedImages, setSelectedImages] = useState(images);

  const handleImport = async () => {
    const result = await handleImportAndGenerate({
      ...editedComponent,
      props: editedProps,
      linked_tokens: linkedTokens,
    }, selectedImages);
    onImport(result);
  };

  const componentImages = images.filter(i => 
    i.node_id.startsWith(component.figma_id)
  );

  return (
    <Modal 
      open 
      onClose={onClose} 
      size="xl" 
      title={`Review: ${component.name}`}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Trigger value="figma">Figma Structure</Tabs.Trigger>
          <Tabs.Trigger value="props">Props ({editedProps.length})</Tabs.Trigger>
          <Tabs.Trigger value="variants">Variants ({component.variants?.length || 0})</Tabs.Trigger>
          <Tabs.Trigger value="tokens">Tokens ({linkedTokens.length})</Tabs.Trigger>
          <Tabs.Trigger value="images">Images ({componentImages.length})</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="figma">
          <FigmaStructureView structure={component.structure} />
        </Tabs.Content>
        
        <Tabs.Content value="props">
          <PropsEditor 
            props={editedProps} 
            onChange={setEditedProps}
          />
        </Tabs.Content>
        
        <Tabs.Content value="variants">
          <VariantsList variants={component.variants || []} />
        </Tabs.Content>
        
        <Tabs.Content value="tokens">
          <TokenLinker 
            boundVariables={component.bound_variables || []}
            linkedTokens={linkedTokens}
            onChange={setLinkedTokens}
          />
        </Tabs.Content>
        
        <Tabs.Content value="images">
          <ImageManager 
            images={componentImages} 
            onUpdate={setSelectedImages}
          />
        </Tabs.Content>
      </Tabs>

      <div className="modal-footer">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={handleImport}>
          <SparklesIcon size={16} /> Import & Generate Code
        </Button>
      </div>
    </Modal>
  );
}

function convertFigmaPropsToAppProps(figmaProps) {
  return (figmaProps || []).map(p => ({
    name: p.name,
    type: figmaTypeToAppType(p.type),
    default: p.defaultValue,
    required: false,
    description: '',
    options: p.options,
  }));
}

function figmaTypeToAppType(figmaType) {
  const mapping = {
    'BOOLEAN': 'boolean',
    'TEXT': 'string',
    'INSTANCE_SWAP': 'node',
    'VARIANT': 'enum',
  };
  return mapping[figmaType] || 'string';
}
```

---

## Files Created
- `src/components/figma-import/ImportReviewModal.jsx` — Review modal

---

## Tests

### Unit Tests
- [ ] All tabs render
- [ ] Props editable
- [ ] Token linking works
- [ ] Import triggers generation

---

## Time Estimate
2 hours
