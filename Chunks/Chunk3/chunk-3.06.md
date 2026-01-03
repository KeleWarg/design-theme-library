# Chunk 3.06 — BasicInfoStep

## Purpose
First step: name, description, category.

---

## Inputs
- Wizard data

## Outputs
- Basic component info

---

## Dependencies
- Chunk 3.05 must be complete

---

## Implementation Notes

```jsx
// src/components/components/create/BasicInfoStep.jsx
import { Input, Select, Textarea } from '../../ui';

const CATEGORIES = [
  { value: 'buttons', label: 'Buttons' },
  { value: 'forms', label: 'Forms' },
  { value: 'layout', label: 'Layout' },
  { value: 'navigation', label: 'Navigation' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'data-display', label: 'Data Display' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'other', label: 'Other' },
];

export default function BasicInfoStep({ data, onUpdate }) {
  return (
    <div className="basic-info-step">
      <Input
        label="Component Name"
        value={data.name}
        onChange={(e) => onUpdate({ name: e.target.value })}
        maxLength={50}
        placeholder="e.g., PrimaryButton"
        required
        helperText="Use PascalCase for component names"
      />

      <Select
        label="Category"
        value={data.category}
        onChange={(e) => onUpdate({ category: e.target.value })}
        options={CATEGORIES}
      />

      <Textarea
        label="Description"
        value={data.description}
        onChange={(e) => onUpdate({ description: e.target.value })}
        maxLength={200}
        placeholder="Briefly describe this component's purpose"
        rows={3}
      />
    </div>
  );
}
```

---

## Files Created
- `src/components/components/create/BasicInfoStep.jsx` — Basic info form

---

## Tests

### Unit Tests
- [ ] Name input with max length
- [ ] Category selector works
- [ ] Description textarea works

---

## Time Estimate
1.5 hours
