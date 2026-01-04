/**
 * @chunk 4.08 - ImportReviewModal
 * 
 * Props editor for reviewing and editing component props from Figma import.
 */

import { Button } from '../ui';
import { PlusIcon, TrashIcon } from 'lucide-react';
import PropEditor from '../components/wizard/PropEditor';

function createEmptyProp() {
  return {
    name: '',
    type: 'string',
    default: '',
    required: false,
    description: '',
    options: [],
  };
}

export default function PropsEditor({ props, onChange }) {
  const addProp = () => {
    onChange([...props, createEmptyProp()]);
  };

  const updateProp = (index, updates) => {
    const newProps = [...props];
    newProps[index] = { ...newProps[index], ...updates };
    onChange(newProps);
  };

  const removeProp = (index) => {
    onChange(props.filter((_, i) => i !== index));
  };

  const movePropUp = (index) => {
    if (index === 0) return;
    const newProps = [...props];
    [newProps[index - 1], newProps[index]] = [newProps[index], newProps[index - 1]];
    onChange(newProps);
  };

  const movePropDown = (index) => {
    if (index === props.length - 1) return;
    const newProps = [...props];
    [newProps[index], newProps[index + 1]] = [newProps[index + 1], newProps[index]];
    onChange(newProps);
  };

  return (
    <div className="props-editor-review">
      <div className="props-editor-header">
        <p>
          Review and edit component properties extracted from Figma.
          These will become the component's props in React.
        </p>
        <Button variant="secondary" size="sm" onClick={addProp}>
          <PlusIcon size={16} /> Add Prop
        </Button>
      </div>

      {props.length === 0 ? (
        <div className="empty-state">
          <p>No properties found. Add props manually or they will be empty.</p>
          <Button variant="secondary" onClick={addProp}>
            <PlusIcon size={16} /> Add First Prop
          </Button>
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
    </div>
  );
}





