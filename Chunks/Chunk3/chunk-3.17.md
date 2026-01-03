# Chunk 3.17 — ExamplesTab

## Purpose
Manage usage examples for LLMS.txt export.

---

## Inputs
- Component examples

## Outputs
- CRUD for examples

---

## Dependencies
- Chunk 3.12 must be complete

---

## Implementation Notes

```jsx
// src/components/components/detail/ExamplesTab.jsx
import { useState } from 'react';
import { componentService } from '../../../services/componentService';
import { Input, Textarea, Button, Modal } from '../../ui';
import { PlusIcon, TrashIcon, EditIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function ExamplesTab({ component, onUpdate }) {
  const [showForm, setShowForm] = useState(false);
  const [editingExample, setEditingExample] = useState(null);

  const handleAddExample = async (example) => {
    try {
      await componentService.addExample(component.id, example);
      onUpdate();
      setShowForm(false);
      toast.success('Example added');
    } catch (error) {
      toast.error('Failed to add example');
    }
  };

  const handleUpdateExample = async (example) => {
    try {
      await componentService.updateExample(editingExample.id, example);
      onUpdate();
      setEditingExample(null);
      toast.success('Example updated');
    } catch (error) {
      toast.error('Failed to update example');
    }
  };

  const handleDeleteExample = async (exampleId) => {
    if (!confirm('Delete this example?')) return;
    try {
      await componentService.deleteExample(exampleId);
      onUpdate();
      toast.success('Example deleted');
    } catch (error) {
      toast.error('Failed to delete example');
    }
  };

  const examples = component.component_examples || [];

  return (
    <div className="examples-tab">
      <div className="tab-header">
        <div>
          <h3>Usage Examples</h3>
          <p>These examples will be included in the LLMS.txt export.</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <PlusIcon size={16} /> Add Example
        </Button>
      </div>

      {examples.length === 0 ? (
        <div className="empty-state">
          <p>No examples yet. Add examples to help AI understand how to use this component.</p>
        </div>
      ) : (
        <div className="examples-list">
          {examples.map(example => (
            <div key={example.id} className="example-card">
              <div className="example-header">
                <h4>{example.title}</h4>
                <div className="example-actions">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setEditingExample(example)}
                  >
                    <EditIcon size={16} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteExample(example.id)}
                  >
                    <TrashIcon size={16} />
                  </Button>
                </div>
              </div>
              {example.description && (
                <p className="example-description">{example.description}</p>
              )}
              <pre className="example-code">{example.code}</pre>
            </div>
          ))}
        </div>
      )}

      {(showForm || editingExample) && (
        <ExampleFormModal
          example={editingExample}
          onClose={() => {
            setShowForm(false);
            setEditingExample(null);
          }}
          onSave={editingExample ? handleUpdateExample : handleAddExample}
        />
      )}
    </div>
  );
}

function ExampleFormModal({ example, onClose, onSave }) {
  const [title, setTitle] = useState(example?.title || '');
  const [description, setDescription] = useState(example?.description || '');
  const [code, setCode] = useState(example?.code || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ title, description, code });
  };

  return (
    <Modal 
      open 
      onClose={onClose} 
      title={example ? 'Edit Example' : 'Add Example'}
    >
      <form onSubmit={handleSubmit}>
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Basic Usage"
          required
        />
        <Textarea
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="When to use this example"
          rows={2}
        />
        <Textarea
          label="Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={`<Button variant="primary">Click me</Button>`}
          rows={6}
          className="font-mono"
          required
        />
        <div className="form-actions">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {example ? 'Update' : 'Add'} Example
          </Button>
        </div>
      </form>
    </Modal>
  );
}
```

---

## Files Created
- `src/components/components/detail/ExamplesTab.jsx` — Examples management

---

## Tests

### Unit Tests
- [ ] Shows existing examples
- [ ] Add example form works
- [ ] Edit example works
- [ ] Delete example works

---

## Time Estimate
2 hours

---

## Notes
Examples are stored in the `component_examples` table and linked to components via `component_id`.
