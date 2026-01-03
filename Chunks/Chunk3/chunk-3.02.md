# Chunk 3.02 — ComponentCard

## Purpose
Individual component card with preview and quick actions.

---

## Inputs
- Component data
- ComponentsPage container

## Outputs
- ComponentCard component

---

## Dependencies
- Chunk 3.01 must be complete

---

## Implementation Notes

```jsx
// src/components/components/ComponentCard.jsx
import { useNavigate } from 'react-router-dom';
import { useSWRConfig } from 'swr';
import { componentService, getImageUrl } from '../../services/componentService';
import { DropdownMenu, StatusBadge } from '../ui';
import { BoxIcon, MoreVerticalIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function ComponentCard({ component }) {
  const navigate = useNavigate();
  const { mutate } = useSWRConfig();

  const handleDuplicate = async (e) => {
    e.stopPropagation();
    try {
      await componentService.duplicateComponent(component.id);
      mutate(['components']);
      toast.success('Component duplicated');
    } catch (error) {
      toast.error('Failed to duplicate');
    }
  };

  const handlePublish = async (e) => {
    e.stopPropagation();
    try {
      await componentService.updateComponent(component.id, { status: 'published' });
      mutate(['components']);
      toast.success('Component published');
    } catch (error) {
      toast.error('Failed to publish');
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirm(`Delete "${component.name}"?`)) return;
    try {
      await componentService.deleteComponent(component.id);
      mutate(['components']);
      toast.success('Component deleted');
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div 
      className="component-card"
      onClick={() => navigate(`/components/${component.id}`)}
    >
      <div className="card-preview">
        {component.component_images?.[0] ? (
          <img 
            src={getImageUrl(component.component_images[0].storage_path)}
            alt={component.name}
          />
        ) : (
          <div className="no-preview">
            <BoxIcon size={32} />
          </div>
        )}
      </div>

      <div className="card-content">
        <div className="card-header">
          <h3>{component.name}</h3>
          <StatusBadge status={component.status} />
        </div>
        
        <p className="description">
          {component.description || 'No description'}
        </p>

        <div className="card-meta">
          <span className="category-tag">{component.category}</span>
          <span className="token-count">
            {component.linked_tokens?.length || 0} tokens
          </span>
        </div>
      </div>

      <DropdownMenu
        trigger={<button className="actions-trigger" onClick={e => e.stopPropagation()}><MoreVerticalIcon size={16} /></button>}
      >
        <DropdownMenu.Item onClick={() => navigate(`/components/${component.id}`)}>
          Edit
        </DropdownMenu.Item>
        <DropdownMenu.Item onClick={handleDuplicate}>
          Duplicate
        </DropdownMenu.Item>
        {component.status === 'draft' && (
          <DropdownMenu.Item onClick={handlePublish}>
            Publish
          </DropdownMenu.Item>
        )}
        <DropdownMenu.Separator />
        <DropdownMenu.Item danger onClick={handleDelete}>
          Delete
        </DropdownMenu.Item>
      </DropdownMenu>
    </div>
  );
}
```

---

## Files Created
- `src/components/components/ComponentCard.jsx` — Card component

---

## Tests

### Unit Tests
- [ ] Shows component name
- [ ] Shows preview image or placeholder
- [ ] Shows status badge
- [ ] Shows category tag
- [ ] Actions menu works

---

## Time Estimate
2 hours
