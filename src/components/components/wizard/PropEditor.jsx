/**
 * @chunk 3.07 - PropsStep
 * 
 * Individual prop editor component used within PropsStep.
 * Handles editing of a single prop: name, type, default value, required toggle, and description.
 * 
 * For enum type props, shows an options input instead of default value.
 */

import { Input, Select, Textarea } from '../../ui';
import { Button } from '../../ui';
import { TrashIcon, GripVerticalIcon, ChevronUpIcon, ChevronDownIcon } from 'lucide-react';

const PROP_TYPES = [
  { value: 'string', label: 'String' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'enum', label: 'Enum' },
  { value: 'icon', label: 'Icon' },
  { value: 'ReactNode', label: 'ReactNode' },
];

/**
 * Validate prop name is camelCase
 */
function isCamelCase(str) {
  if (!str) return false;
  // camelCase: starts with lowercase, no spaces/special chars
  return /^[a-z][a-zA-Z0-9]*$/.test(str);
}

/**
 * Get validation error for name field
 */
function getNameError(name) {
  if (!name || name.trim() === '') {
    return null;
  }
  if (!isCamelCase(name)) {
    return 'Use camelCase (e.g., onClick, isDisabled)';
  }
  return null;
}

export default function PropEditor({
  prop,
  index,
  totalProps,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}) {
  const nameError = getNameError(prop.name);

  const handleFieldChange = (field, value) => {
    onUpdate({ [field]: value });
  };

  const handleTypeChange = (value) => {
    // Reset relevant fields when type changes
    const updates = { type: value };
    if (value === 'enum') {
      // Clear default, keep options
      updates.default = '';
    } else if (value === 'boolean') {
      // Set boolean default
      updates.default = 'false';
      updates.options = [];
    } else {
      updates.options = [];
    }
    onUpdate(updates);
  };

  const handleOptionsChange = (e) => {
    const options = e.target.value
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    onUpdate({ options });
  };

  return (
    <div className="prop-editor">
      <div className="prop-editor-drag">
        <GripVerticalIcon size={16} className="prop-drag-handle" />
        <div className="prop-reorder-buttons">
          <button
            type="button"
            className="prop-reorder-btn"
            onClick={onMoveUp}
            disabled={index === 0}
            aria-label="Move up"
          >
            <ChevronUpIcon size={14} />
          </button>
          <button
            type="button"
            className="prop-reorder-btn"
            onClick={onMoveDown}
            disabled={index === totalProps - 1}
            aria-label="Move down"
          >
            <ChevronDownIcon size={14} />
          </button>
        </div>
      </div>

      <div className="prop-editor-fields">
        <div className="prop-editor-row">
          <div className="prop-field prop-field-name">
            <Input
              value={prop.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              placeholder="propName"
              error={nameError}
            />
          </div>

          <div className="prop-field prop-field-type">
            <Select
              value={prop.type}
              onChange={handleTypeChange}
              options={PROP_TYPES}
              placeholder="Type..."
              size="sm"
            />
          </div>

          <div className="prop-field prop-field-default">
            {prop.type === 'enum' ? (
              <Input
                value={prop.options?.join(', ') || ''}
                onChange={handleOptionsChange}
                placeholder="option1, option2, ..."
              />
            ) : prop.type === 'boolean' ? (
              <Select
                value={prop.default || 'false'}
                onChange={(value) => handleFieldChange('default', value)}
                options={[
                  { value: 'false', label: 'false' },
                  { value: 'true', label: 'true' },
                ]}
                size="sm"
              />
            ) : (
              <Input
                value={prop.default}
                onChange={(e) => handleFieldChange('default', e.target.value)}
                placeholder="default value"
              />
            )}
          </div>

          <div className="prop-field prop-field-required">
            <label className="prop-required-toggle">
              <input
                type="checkbox"
                checked={prop.required}
                onChange={(e) => handleFieldChange('required', e.target.checked)}
              />
              <span className="prop-required-label">Required</span>
            </label>
          </div>

          <div className="prop-field prop-field-actions">
            <Button 
              variant="ghost" 
              size="small"
              onClick={onRemove}
              className="prop-remove-btn"
              aria-label="Remove prop"
            >
              <TrashIcon size={16} />
            </Button>
          </div>
        </div>

        <div className="prop-editor-row prop-editor-row-description">
          <Input
            value={prop.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            placeholder="Brief description of what this prop does..."
            className="prop-description-input"
          />
        </div>
      </div>
    </div>
  );
}


