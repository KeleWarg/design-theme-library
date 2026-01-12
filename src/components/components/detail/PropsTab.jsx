/**
 * @chunk 3.15 - PropsTab
 * 
 * Props tab for component detail page.
 * Allows editing component prop definitions with explicit Save/Cancel pattern.
 * 
 * Features:
 * - Add/edit/remove props
 * - Same UI pattern as PropsStep (3.07)
 * - Explicit Save/Cancel (no auto-save)
 * - Tracks changes and shows save bar when needed
 */

import { useState, useEffect, useRef } from 'react';
import { Button } from '../../ui';
import { PlusIcon, HelpCircleIcon, RotateCcw, Save, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import PropEditor from '../wizard/PropEditor';
import { generatePropsForComponent } from '../../../lib/propGenerator';

/**
 * Create a new empty prop object
 */
function createEmptyProp() {
  return {
    name: '',
    type: 'string',
    default: '',
    required: false,
    description: '',
    options: [], // for enum type
  };
}

/**
 * Deep compare two prop arrays
 */
function propsEqual(props1, props2) {
  if (!props1 && !props2) return true;
  if (!props1 || !props2) return false;
  if (props1.length !== props2.length) return false;
  
  return JSON.stringify(props1) === JSON.stringify(props2);
}

export default function PropsTab({ component, onSave }) {
  const [props, setProps] = useState(component?.props || []);
  const originalPropsRef = useRef(component?.props || []);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Reset when component changes
  useEffect(() => {
    const componentProps = component?.props || [];
    setProps(componentProps);
    originalPropsRef.current = JSON.parse(JSON.stringify(componentProps));
    setHasChanges(false);
  }, [component?.id]);

  // Track changes
  useEffect(() => {
    const hasChangesNow = !propsEqual(props, originalPropsRef.current);
    setHasChanges(hasChangesNow);
  }, [props]);

  const addProp = () => {
    setProps([...props, createEmptyProp()]);
  };

  const generateProps = () => {
    const { props: nextProps, report } = generatePropsForComponent({
      category: component?.category,
      code: component?.code,
      existingProps: props,
    });
    setProps(nextProps);
    toast.success(`Generated props (added ${report.addedCount})`);
  };

  const updateProp = (index, updates) => {
    const newProps = [...props];
    newProps[index] = { ...newProps[index], ...updates };
    setProps(newProps);
  };

  const removeProp = (index) => {
    setProps(props.filter((_, i) => i !== index));
  };

  const movePropUp = (index) => {
    if (index === 0) return;
    const newProps = [...props];
    [newProps[index - 1], newProps[index]] = [newProps[index], newProps[index - 1]];
    setProps(newProps);
  };

  const movePropDown = (index) => {
    if (index === props.length - 1) return;
    const newProps = [...props];
    [newProps[index], newProps[index + 1]] = [newProps[index + 1], newProps[index]];
    setProps(newProps);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(props);
      originalPropsRef.current = JSON.parse(JSON.stringify(props));
      setHasChanges(false);
      toast.success('Props saved');
    } catch (error) {
      console.error('Failed to save props:', error);
      toast.error('Failed to save props');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setProps(JSON.parse(JSON.stringify(originalPropsRef.current)));
    setHasChanges(false);
    toast.info('Changes cancelled');
  };

  return (
    <div className="props-tab">
      <div className="props-tab-header">
        <div className="props-tab-header-content">
          <h3 className="props-tab-title">Component Props</h3>
          <p className="props-tab-description">
            Define the props your component accepts. Each prop should have a name, type, and optional default value.
          </p>
        </div>
        <div className="props-tab-header-actions">
          <Button size="small" variant="secondary" onClick={generateProps} className="props-generate-btn">
            <Sparkles size={16} />
            Generate Props
          </Button>
          <Button size="small" onClick={addProp} className="props-add-btn">
            <PlusIcon size={16} />
            Add Prop
          </Button>
        </div>
      </div>

      {props.length === 0 ? (
        <div className="props-empty-state">
          <div className="props-empty-icon">
            <HelpCircleIcon size={32} />
          </div>
          <h3 className="props-empty-title">No props defined yet</h3>
          <p className="props-empty-description">
            Props make your component configurable. Add props to define what values
            your component accepts.
          </p>
          <Button size="small" onClick={addProp}>
            <PlusIcon size={16} />
            Add First Prop
          </Button>
          <Button size="small" variant="secondary" onClick={generateProps}>
            <Sparkles size={16} />
            Generate Props
          </Button>

          <div className="props-empty-hint">
            <strong>Tip:</strong> Common props include <code>children</code> (ReactNode), 
            <code>className</code> (string), <code>variant</code> (enum), and <code>disabled</code> (boolean).
          </div>
          <div className="props-empty-hint props-empty-hint--secondary">
            <strong>Best Practice:</strong> Use <code>enum</code> type for props like 
            <code>size</code> and <code>variant</code>, and <code>icon</code> type for icon props to show a picker in the preview.
            Free text fields should only be used for truly open-ended values.
          </div>
        </div>
      ) : (
        <div className="props-list">
          <div className="props-list-header">
            <span className="props-list-col props-list-col-drag"></span>
            <span className="props-list-col props-list-col-name">Name</span>
            <span className="props-list-col props-list-col-type">Type</span>
            <span className="props-list-col props-list-col-default">Default / Options</span>
            <span className="props-list-col props-list-col-required">Required</span>
            <span className="props-list-col props-list-col-actions"></span>
          </div>

          <div className="props-list-items">
            {props.map((prop, index) => (
              <PropEditor
                key={index}
                prop={prop}
                index={index}
                totalProps={props.length}
                onUpdate={(updates) => updateProp(index, updates)}
                onRemove={() => removeProp(index)}
                onMoveUp={() => movePropUp(index)}
                onMoveDown={() => movePropDown(index)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Save/Cancel bar - shown when there are changes */}
      {hasChanges && (
        <div className="props-tab-save-bar">
          <div className="props-tab-save-hint">
            You have unsaved changes
          </div>
          <div className="props-tab-save-buttons">
            <Button 
              variant="secondary" 
              size="small"
              onClick={handleCancel}
              disabled={isSaving}
            >
              <RotateCcw size={14} />
              Cancel
            </Button>
            <Button 
              variant="primary" 
              size="small"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save size={14} />
              {isSaving ? 'Saving...' : 'Save Props'}
            </Button>
          </div>
        </div>
      )}

      <style>{`
        .props-tab {
          display: flex;
          flex-direction: column;
          flex: 1;
          gap: var(--spacing-lg);
        }

        .props-tab-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: var(--spacing-md);
        }

        .props-tab-header-actions {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          flex-shrink: 0;
        }

        .props-tab-header-content {
          flex: 1;
        }

        .props-tab-title {
          margin: 0 0 var(--spacing-sm);
          font-size: var(--font-size-xl);
          font-weight: var(--font-weight-semibold);
          color: var(--color-foreground);
        }

        .props-tab-description {
          margin: 0;
          font-size: var(--font-size-base);
          color: var(--color-muted-foreground);
        }

        .props-add-btn {
          flex-shrink: 0;
        }

        /* Props Empty State */
        .props-empty-state {
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

        .props-empty-icon {
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

        .props-empty-title {
          margin: 0 0 var(--spacing-sm);
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          color: var(--color-foreground);
        }

        .props-empty-description {
          margin: 0 0 var(--spacing-lg);
          font-size: var(--font-size-base);
          color: var(--color-muted-foreground);
          max-width: 400px;
        }

        .props-empty-hint {
          margin-top: var(--spacing-xl);
          padding: var(--spacing-md);
          background: var(--color-background);
          border-radius: var(--radius-md);
          font-size: var(--font-size-sm);
          color: var(--color-muted-foreground);
          max-width: 450px;
        }

        .props-empty-hint code {
          padding: var(--spacing-xs);
          margin: 0 var(--spacing-xs);
          background: var(--color-muted);
          border-radius: var(--radius-sm);
          font-family: var(--font-family-mono);
          font-size: var(--font-size-xs);
          color: var(--color-primary);
        }

        .props-empty-hint--secondary {
          margin-top: var(--spacing-sm);
          background: var(--color-primary-light, #eff6ff);
          border-left: 3px solid var(--color-primary, #3b82f6);
        }

        /* Props List */
        .props-list {
          display: flex;
          flex-direction: column;
          flex: 1;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .props-list-header {
          display: grid;
          grid-template-columns: 48px 1fr 120px 1.2fr 80px 48px;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) var(--spacing-md);
          background: var(--color-muted);
          border-bottom: 1px solid var(--color-border);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-semibold);
          color: var(--color-muted-foreground);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .props-list-col {
          display: flex;
          align-items: center;
        }

        .props-list-items {
          display: flex;
          flex-direction: column;
        }

        /* Save Bar */
        .props-tab-save-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--spacing-md);
          padding: var(--spacing-md) var(--spacing-lg);
          background: var(--color-muted);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          margin-top: var(--spacing-md);
        }

        .props-tab-save-hint {
          font-size: var(--font-size-sm);
          color: var(--color-muted-foreground);
        }

        .props-tab-save-buttons {
          display: flex;
          gap: var(--spacing-sm);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .props-tab-header {
            flex-direction: column;
            gap: var(--spacing-md);
          }

          .props-add-btn {
            align-self: flex-start;
          }

          .props-list-header {
            display: none;
          }

          .props-tab-save-bar {
            flex-direction: column;
            align-items: stretch;
          }

          .props-tab-save-buttons {
            width: 100%;
          }

          .props-tab-save-buttons button {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
}
