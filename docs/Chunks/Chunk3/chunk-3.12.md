# Chunk 3.12 — ComponentDetail Layout

## Purpose
Main component detail/edit page with tabbed interface.

---

## Inputs
- Route /components/:id
- componentService (from chunk 1.10)

## Outputs
- ComponentDetail page layout

---

## Dependencies
- Chunk 3.01 must be complete
- Chunk 1.10 must be complete

---

## Implementation Notes

### Tabs
1. Preview — Live component preview
2. Code — Monaco editor
3. Props — Prop definitions
4. Tokens — Linked tokens
5. Examples — Usage examples

```jsx
// src/pages/ComponentDetail.jsx
import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useComponent } from '../hooks/useComponent';
import { componentService } from '../services/componentService';
import { Tabs, Button, StatusBadge, DropdownMenu } from '../components/ui';
import PreviewTab from '../components/components/detail/PreviewTab';
import CodeTab from '../components/components/detail/CodeTab';
import PropsTab from '../components/components/detail/PropsTab';
import TokensTab from '../components/components/detail/TokensTab';
import ExamplesTab from '../components/components/detail/ExamplesTab';
import { DetailSkeleton } from '../components/ui/Skeleton';
import { ArrowLeftIcon, MoreVerticalIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function ComponentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: component, isLoading, mutate } = useComponent(id);
  const [activeTab, setActiveTab] = useState('preview');
  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = async (updates) => {
    try {
      await componentService.updateComponent(id, updates);
      setHasChanges(false);
      mutate();
      toast.success('Component saved');
    } catch (error) {
      toast.error('Failed to save');
    }
  };

  const handlePublish = async () => {
    try {
      await componentService.updateComponent(id, { status: 'published' });
      mutate();
      toast.success('Component published');
    } catch (error) {
      toast.error('Failed to publish');
    }
  };

  const handleDuplicate = async () => {
    try {
      const newComponent = await componentService.duplicateComponent(id);
      toast.success('Component duplicated');
      navigate(`/components/${newComponent.id}`);
    } catch (error) {
      toast.error('Failed to duplicate');
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${component.name}"?`)) return;
    try {
      await componentService.deleteComponent(id);
      toast.success('Component deleted');
      navigate('/components');
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  if (isLoading) return <DetailSkeleton />;

  return (
    <div className="component-detail">
      <div className="detail-header">
        <div className="header-left">
          <Link to="/components" className="back-link">
            <ArrowLeftIcon size={16} /> Components
          </Link>
          <h1>{component.name}</h1>
          <StatusBadge status={component.status} />
        </div>
        <div className="header-actions">
          {hasChanges && (
            <Button onClick={() => handleSave({})}>
              Save Changes
            </Button>
          )}
          {component.status === 'draft' && (
            <Button variant="primary" onClick={handlePublish}>
              Publish
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenu.Trigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVerticalIcon size={16} />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item onClick={handleDuplicate}>
                Duplicate
              </DropdownMenu.Item>
              <DropdownMenu.Separator />
              <DropdownMenu.Item danger onClick={handleDelete}>
                Delete
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Trigger value="preview">Preview</Tabs.Trigger>
          <Tabs.Trigger value="code">Code</Tabs.Trigger>
          <Tabs.Trigger value="props">Props</Tabs.Trigger>
          <Tabs.Trigger value="tokens">Tokens</Tabs.Trigger>
          <Tabs.Trigger value="examples">Examples</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="preview">
          <PreviewTab component={component} />
        </Tabs.Content>
        <Tabs.Content value="code">
          <CodeTab 
            component={component} 
            onSave={(code) => handleSave({ code })}
            onChangesMade={() => setHasChanges(true)}
          />
        </Tabs.Content>
        <Tabs.Content value="props">
          <PropsTab 
            component={component}
            onSave={(props) => handleSave({ props })}
          />
        </Tabs.Content>
        <Tabs.Content value="tokens">
          <TokensTab 
            component={component}
            onSave={(linked_tokens) => handleSave({ linked_tokens })}
          />
        </Tabs.Content>
        <Tabs.Content value="examples">
          <ExamplesTab component={component} onUpdate={mutate} />
        </Tabs.Content>
      </Tabs>
    </div>
  );
}
```

### useComponent Hook
```javascript
// src/hooks/useComponent.js
import useSWR from 'swr';
import { componentService } from '../services/componentService';

export function useComponent(id) {
  return useSWR(id ? ['component', id] : null, async () => {
    return componentService.getComponent(id);
  });
}
```

---

## Files Created
- `src/pages/ComponentDetail.jsx` — Detail page
- `src/hooks/useComponent.js` — Single component hook

---

## Tests

### Unit Tests
- [ ] Loads component data
- [ ] Tab navigation works
- [ ] Save updates component
- [ ] Publish changes status

---

## Time Estimate
2 hours
