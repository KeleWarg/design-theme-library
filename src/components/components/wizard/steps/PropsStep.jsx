/**
 * @chunk 3.07 - PropsStep
 * 
 * Second step of the component creation wizard.
 * Allows users to define component props with types and defaults.
 * 
 * Features:
 * - Add new props
 * - Remove existing props
 * - Reorder props (move up/down)
 * - Edit prop name (camelCase), type, default value, required toggle, and description
 * - Enum type shows options input instead of default value
 */

import { Button } from '../../../ui';
import { PlusIcon, HelpCircleIcon } from 'lucide-react';
import PropEditor from '../PropEditor';

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

export default function PropsStep({ data, onUpdate }) {
  const addProp = () => {
    onUpdate({
      props: [...data.props, createEmptyProp()],
    });
  };

  const updateProp = (index, updates) => {
    const newProps = [...data.props];
    newProps[index] = { ...newProps[index], ...updates };
    onUpdate({ props: newProps });
  };

  const removeProp = (index) => {
    onUpdate({
      props: data.props.filter((_, i) => i !== index),
    });
  };

  const movePropUp = (index) => {
    if (index === 0) return;
    const newProps = [...data.props];
    [newProps[index - 1], newProps[index]] = [newProps[index], newProps[index - 1]];
    onUpdate({ props: newProps });
  };

  const movePropDown = (index) => {
    if (index === data.props.length - 1) return;
    const newProps = [...data.props];
    [newProps[index], newProps[index + 1]] = [newProps[index + 1], newProps[index]];
    onUpdate({ props: newProps });
  };

  return (
    <div className="props-step">
      <div className="props-step-header">
        <div className="props-step-header-content">
          <h2 className="props-step-title">Define Props</h2>
          <p className="props-step-description">
            Add the props your component will accept. Each prop should have a name, type, and optional default value.
          </p>
        </div>
        <Button size="small" onClick={addProp} className="props-add-btn">
          <PlusIcon size={16} />
          Add Prop
        </Button>
      </div>

      {data.props.length === 0 ? (
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

          <div className="props-empty-hint">
            <strong>Tip:</strong> Common props include <code>children</code> (ReactNode), 
            <code>className</code> (string), <code>variant</code> (enum), and <code>disabled</code> (boolean).
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
            {data.props.map((prop, index) => (
              <PropEditor
                key={index}
                prop={prop}
                index={index}
                totalProps={data.props.length}
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


