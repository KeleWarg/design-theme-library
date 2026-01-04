/**
 * @chunk 3.17 - ExamplesTab
 * 
 * Examples tab for component detail page.
 * Manages usage examples for LLMS.txt export.
 * 
 * Features:
 * - List existing examples
 * - Add example form (title, description, code)
 * - Edit/delete examples
 * - Delete confirmation (critical)
 */

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
      console.error('Failed to add example:', error);
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
      console.error('Failed to update example:', error);
      toast.error('Failed to update example');
    }
  };

  const handleDeleteExample = async (exampleId) => {
    if (!confirm('Delete this example? This cannot be undone.')) return;
    
    try {
      await componentService.deleteExample(exampleId);
      onUpdate();
      toast.success('Example deleted');
    } catch (error) {
      console.error('Failed to delete example:', error);
      toast.error('Failed to delete example');
    }
  };

  const examples = component.component_examples || [];

  return (
    <div className="examples-tab">
      <div className="examples-tab-header">
        <div className="examples-tab-header-content">
          <h3 className="examples-tab-title">Usage Examples</h3>
          <p className="examples-tab-description">
            These examples will be included in the LLMS.txt export to help AI understand how to use this component.
          </p>
        </div>
        <Button size="small" onClick={() => setShowForm(true)}>
          <PlusIcon size={16} />
          Add Example
        </Button>
      </div>

      {examples.length === 0 ? (
        <div className="examples-empty-state">
          <div className="examples-empty-icon">
            <PlusIcon size={32} />
          </div>
          <h3 className="examples-empty-title">No examples yet</h3>
          <p className="examples-empty-description">
            Add examples to help AI understand how to use this component. Examples should show common usage patterns.
          </p>
          <Button size="small" onClick={() => setShowForm(true)}>
            <PlusIcon size={16} />
            Add First Example
          </Button>
        </div>
      ) : (
        <div className="examples-list">
          {examples.map(example => (
            <div key={example.id} className="example-card">
              <div className="example-header">
                <h4 className="example-title">{example.title}</h4>
                <div className="example-actions">
                  <Button 
                    variant="ghost" 
                    size="small"
                    onClick={() => setEditingExample(example)}
                    aria-label="Edit example"
                  >
                    <EditIcon size={16} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="small"
                    onClick={() => handleDeleteExample(example.id)}
                    aria-label="Delete example"
                  >
                    <TrashIcon size={16} />
                  </Button>
                </div>
              </div>
              {example.description && (
                <p className="example-description">{example.description}</p>
              )}
              <pre className="example-code"><code>{example.code}</code></pre>
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

      <style>{`
        .examples-tab {
          display: flex;
          flex-direction: column;
          flex: 1;
          gap: var(--spacing-lg);
        }

        .examples-tab-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: var(--spacing-md);
        }

        .examples-tab-header-content {
          flex: 1;
        }

        .examples-tab-title {
          margin: 0 0 var(--spacing-sm);
          font-size: var(--font-size-xl);
          font-weight: var(--font-weight-semibold);
          color: var(--color-foreground);
        }

        .examples-tab-description {
          margin: 0;
          font-size: var(--font-size-base);
          color: var(--color-muted-foreground);
        }

        /* Empty State */
        .examples-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          flex: 1;
          padding: var(--spacing-2xl);
          border: 2px dashed var(--color-border);
          border-radius: var(--radius-lg);
          background: var(--color-muted);
        }

        .examples-empty-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          border-radius: var(--radius-full);
          background: var(--color-background);
          color: var(--color-muted-foreground);
          margin-bottom: var(--spacing-lg);
        }

        .examples-empty-title {
          margin: 0 0 var(--spacing-sm);
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          color: var(--color-foreground);
        }

        .examples-empty-description {
          margin: 0 0 var(--spacing-lg);
          font-size: var(--font-size-base);
          color: var(--color-muted-foreground);
          max-width: 400px;
        }

        /* Examples List */
        .examples-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .example-card {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
          padding: var(--spacing-md);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          background: var(--color-background);
        }

        .example-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: var(--spacing-md);
        }

        .example-title {
          margin: 0;
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          color: var(--color-foreground);
          flex: 1;
        }

        .example-actions {
          display: flex;
          gap: var(--spacing-xs);
          flex-shrink: 0;
        }

        .example-description {
          margin: 0;
          font-size: var(--font-size-sm);
          color: var(--color-muted-foreground);
          line-height: 1.5;
        }

        .example-code {
          margin: 0;
          padding: var(--spacing-md);
          background: var(--color-muted);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          font-family: var(--font-family-mono);
          font-size: var(--font-size-sm);
          color: var(--color-foreground);
          overflow-x: auto;
          line-height: 1.5;
        }

        .example-code code {
          font-family: inherit;
          font-size: inherit;
          color: inherit;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .examples-tab-header {
            flex-direction: column;
            gap: var(--spacing-md);
          }

          .example-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .example-actions {
            align-self: flex-end;
          }
        }
      `}</style>
    </div>
  );
}

function ExampleFormModal({ example, onClose, onSave }) {
  const [title, setTitle] = useState(example?.title || '');
  const [description, setDescription] = useState(example?.description || '');
  const [code, setCode] = useState(example?.code || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !code.trim()) {
      toast.error('Title and code are required');
      return;
    }
    onSave({ title: title.trim(), description: description.trim(), code: code.trim() });
  };

  return (
    <Modal 
      open 
      onClose={onClose} 
      title={example ? 'Edit Example' : 'Add Example'}
      size="large"
    >
      <form onSubmit={handleSubmit} className="example-form">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Basic Usage"
          required
          autoFocus
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
          rows={8}
          className="font-mono"
          required
        />
        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {example ? 'Update' : 'Add'} Example
          </Button>
        </div>
      </form>

      <style>{`
        .example-form {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--spacing-sm);
          margin-top: var(--spacing-md);
          padding-top: var(--spacing-md);
          border-top: 1px solid var(--color-border);
        }

        .font-mono textarea {
          font-family: var(--font-family-mono);
          font-size: var(--font-size-sm);
        }
      `}</style>
    </Modal>
  );
}

