# Chunk 3.15 — PropsTab

## Purpose
Edit component prop definitions.

---

## Inputs
- Component props array

## Outputs
- Updated props

---

## Dependencies
- Chunk 3.12 must be complete

---

## Implementation Notes

Reuses the same UI pattern from PropsStep (chunk 3.07) but with save functionality.

```jsx
// src/components/components/detail/PropsTab.jsx
import { useState, useEffect } from 'react';
import { Input, Select, Checkbox, Button } from '../../ui';
import { PlusIcon, TrashIcon } from 'lucide-react';

const PROP_TYPES = [
  { value: 'string', label: 'String' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'enum', label: 'Enum' },
  { value: 'node', label: 'Node' },
];

export default function PropsTab({ component, onSave }) {
  const [props, setProps] = useState(component.props || []);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setProps(component.props || []);
    setHasChanges(false);
  }, [component.props]);

  const addProp = () => {
    setProps([...props, {
      name: '',
      type: 'string',
      default: '',
      required: false,
      description: '',
      options: []
    }]);
    setHasChanges(true);
  };

  const updateProp = (index, updates) => {
    const newProps = [...props];
    newProps[index] = { ...newProps[index], ...updates };
    setProps(newProps);
    setHasChanges(true);
  };

  const removeProp = (index) => {
    setProps(props.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(props);
    setHasChanges(false);
  };

  return (
    <div className="props-tab">
      <div className="tab-header">
        <div>
          <h3>Component Props</h3>
          <p>Define the props your component accepts.</p>
        </div>
        <div className="tab-actions">
          <Button size="sm" variant="ghost" onClick={addProp}>
            <PlusIcon size={16} /> Add Prop
          </Button>
          {hasChanges && (
            <Button size="sm" onClick={handleSave}>
              Save Props
            </Button>
          )}
        </div>
      </div>

      {props.length === 0 ? (
        <div className="empty-state">
          <p>No props defined. Add props to make your component configurable.</p>
        </div>
      ) : (
        <div className="props-table">
          <div className="table-header">
            <span>Name</span>
            <span>Type</span>
            <span>Default/Options</span>
            <span>Required</span>
            <span>Description</span>
            <span></span>
          </div>
          
          {props.map((prop, index) => (
            <div key={index} className="prop-row">
              <Input
                value={prop.name}
                onChange={(e) => updateProp(index, { name: e.target.value })}
                placeholder="propName"
              />
              <Select
                value={prop.type}
                onChange={(e) => updateProp(index, { type: e.target.value })}
                options={PROP_TYPES}
              />
              {prop.type === 'enum' ? (
                <Input
                  value={prop.options?.join(', ') || ''}
                  onChange={(e) => updateProp(index, { 
                    options: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  placeholder="opt1, opt2"
                />
              ) : (
                <Input
                  value={prop.default}
                  onChange={(e) => updateProp(index, { default: e.target.value })}
                  placeholder="default"
                />
              )}
              <Checkbox
                checked={prop.required}
                onChange={(checked) => updateProp(index, { required: checked })}
              />
              <Input
                value={prop.description}
                onChange={(e) => updateProp(index, { description: e.target.value })}
                placeholder="Description"
              />
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => removeProp(index)}
              >
                <TrashIcon size={16} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Files Created
- `src/components/components/detail/PropsTab.jsx` — Props editor tab

---

## Tests

### Unit Tests
- [ ] Loads existing props
- [ ] Add/edit/remove props
- [ ] Save persists changes

---

## Time Estimate
2 hours
