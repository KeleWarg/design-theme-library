# Chunk 3.04 — AddComponentDropdown

## Purpose
Dropdown menu for different component creation methods.

---

## Inputs
- Navigation

## Outputs
- Dropdown with creation options

---

## Dependencies
- Chunk 3.01 must be complete

---

## Implementation Notes

```jsx
// src/components/components/AddComponentDropdown.jsx
import { useNavigate } from 'react-router-dom';
import { DropdownMenu, Button } from '../ui';
import { PlusIcon, ChevronDownIcon, PencilIcon, SparklesIcon, FigmaIcon } from 'lucide-react';

export default function AddComponentDropdown() {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button>
          <PlusIcon size={16} /> Add Component
          <ChevronDownIcon size={16} />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        <DropdownMenu.Item onClick={() => navigate('/components/new?mode=manual')}>
          <PencilIcon size={16} />
          <div className="item-content">
            <span className="item-title">Create Manually</span>
            <span className="item-description">Define props and code by hand</span>
          </div>
        </DropdownMenu.Item>
        <DropdownMenu.Item onClick={() => navigate('/components/new?mode=ai')}>
          <SparklesIcon size={16} />
          <div className="item-content">
            <span className="item-title">Generate with AI</span>
            <span className="item-description">Describe your component</span>
          </div>
        </DropdownMenu.Item>
        <DropdownMenu.Item onClick={() => navigate('/components/import')}>
          <FigmaIcon size={16} />
          <div className="item-content">
            <span className="item-title">Import from Figma</span>
            <span className="item-description">Import via Figma plugin</span>
          </div>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}
```

---

## Files Created
- `src/components/components/AddComponentDropdown.jsx` — Add dropdown

---

## Tests

### Unit Tests
- [ ] Dropdown opens
- [ ] All three options present
- [ ] Navigation works for each option

---

## Time Estimate
1 hour
