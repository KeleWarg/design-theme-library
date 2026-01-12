# Chunk 3.08 — VariantsStep

## Purpose
Define component variants with prop combinations.

---

## Inputs
- Wizard data (with props)

## Outputs
- Variants array definition

---

## Dependencies
- Chunk 3.05 must be complete

---

## Implementation Notes

```jsx
// src/components/components/create/VariantsStep.jsx
import { Input, Textarea, Select, Checkbox, Button } from '../../ui';
import { PlusIcon, TrashIcon } from 'lucide-react';

export default function VariantsStep({ data, onUpdate }) {
  const addVariant = () => {
    onUpdate({
      variants: [...data.variants, {
        name: '',
        description: '',
        props: {}
      }]
    });
  };

  const updateVariant = (index, updates) => {
    const newVariants = [...data.variants];
    newVariants[index] = { ...newVariants[index], ...updates };
    onUpdate({ variants: newVariants });
  };

  const removeVariant = (index) => {
    onUpdate({ variants: data.variants.filter((_, i) => i !== index) });
  };

  return (
    <div className="variants-step">
      <div className="step-header">
        <div>
          <h3>Component Variants</h3>
          <p className="step-description">
            Variants are predefined prop combinations that showcase different states.
          </p>
        </div>
        <Button size="sm" onClick={addVariant}>
          <PlusIcon size={16} /> Add Variant
        </Button>
      </div>

      {data.variants.length === 0 ? (
        <div className="empty-variants">
          <p>No variants defined. Variants help document different component states.</p>
        </div>
      ) : (
        <div className="variants-list">
          {data.variants.map((variant, index) => (
            <div key={index} className="variant-card">
              <div className="variant-header">
                <Input
                  value={variant.name}
                  onChange={(e) => updateVariant(index, { name: e.target.value })}
                  placeholder="Variant Name (e.g., Primary, Large)"
                />
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => removeVariant(index)}
                >
                  <TrashIcon size={16} />
                </Button>
              </div>
              
              <Textarea
                value={variant.description}
                onChange={(e) => updateVariant(index, { description: e.target.value })}
                placeholder="When to use this variant"
                rows={2}
              />

              {data.props.length > 0 && (
                <div className="variant-props">
                  <h4>Prop Values</h4>
                  {data.props.map(prop => (
                    <div key={prop.name} className="variant-prop">
                      <label>{prop.name}</label>
                      {prop.type === 'boolean' ? (
                        <Checkbox
                          checked={variant.props[prop.name] || false}
                          onChange={(checked) => updateVariant(index, {
                            props: { ...variant.props, [prop.name]: checked }
                          })}
                        />
                      ) : prop.type === 'enum' ? (
                        <Select
                          value={variant.props[prop.name] || ''}
                          onChange={(e) => updateVariant(index, {
                            props: { ...variant.props, [prop.name]: e.target.value }
                          })}
                          options={[
                            { value: '', label: 'Default' },
                            ...prop.options?.map(o => ({ value: o, label: o })) || []
                          ]}
                        />
                      ) : (
                        <Input
                          value={variant.props[prop.name] || ''}
                          onChange={(e) => updateVariant(index, {
                            props: { ...variant.props, [prop.name]: e.target.value }
                          })}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
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
- `src/components/components/create/VariantsStep.jsx` — Variants form

---

## Tests

### Unit Tests
- [ ] Add variant works
- [ ] Variant name/description work
- [ ] Prop value inputs match prop types
- [ ] Remove variant works

---

## Time Estimate
2 hours
