# Chunk 3.07 — PropsStep

## Purpose
Define component props with types and defaults.

---

## Inputs
- Wizard data

## Outputs
- Props array definition

---

## Dependencies
- Chunk 3.05 must be complete

---

## Implementation Notes

### Prop Types
- `string` — Text value
- `number` — Numeric value
- `boolean` — True/false toggle
- `enum` — Select from options
- `node` — React children

```jsx
// src/components/components/create/PropsStep.jsx
import { useState } from 'react';
import { Input, Select, Checkbox, Button } from '../../ui';
import { PlusIcon, TrashIcon } from 'lucide-react';

const PROP_TYPES = [
  { value: 'string', label: 'String' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'enum', label: 'Enum' },
  { value: 'node', label: 'Node' },
];

export default function PropsStep({ data, onUpdate }) {
  const addProp = () => {
    onUpdate({
      props: [...data.props, {
        name: '',
        type: 'string',
        default: '',
        required: false,
        description: '',
        options: [] // for enum type
      }]
    });
  };

  const updateProp = (index, updates) => {
    const newProps = [...data.props];
    newProps[index] = { ...newProps[index], ...updates };
    onUpdate({ props: newProps });
  };

  const removeProp = (index) => {
    onUpdate({ props: data.props.filter((_, i) => i !== index) });
  };

  return (
    <div className="props-step">
      <div className="step-header">
        <div>
          <h3>Component Props</h3>
          <p className="step-description">
            Define the props your component accepts.
          </p>
        </div>
        <Button size="sm" onClick={addProp}>
          <PlusIcon size={16} /> Add Prop
        </Button>
      </div>

      {data.props.length === 0 ? (
        <div className="empty-props">
          <p>No props defined yet. Add props to make your component configurable.</p>
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
          
          {data.props.map((prop, index) => (
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
                  placeholder="opt1, opt2, opt3"
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
- `src/components/components/create/PropsStep.jsx` — Props definition form

---

## Tests

### Unit Tests
- [ ] Add prop works
- [ ] Edit prop fields work
- [ ] Remove prop works
- [ ] Enum type shows options input

---

## Time Estimate
2.5 hours
