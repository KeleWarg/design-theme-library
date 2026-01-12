/**
 * @chunk 3.13 - PreviewTab
 * 
 * Prop control component that renders appropriate input based on prop type.
 * Shows descriptions, required indicators, and meaningful placeholders.
 */

import { Input, Select, Checkbox, Textarea, IconPicker } from '../../ui';

/**
 * Get a helpful placeholder based on prop type and name
 */
function getPlaceholder(prop) {
  const name = prop.name || 'value';
  
  switch (prop.type) {
    case 'string':
      if (name.toLowerCase().includes('class')) return 'e.g. my-custom-class';
      if (name.toLowerCase().includes('label')) return 'Enter label text...';
      if (name.toLowerCase().includes('title')) return 'Enter title...';
      if (name.toLowerCase().includes('text')) return 'Enter text...';
      if (name.toLowerCase().includes('url')) return 'https://...';
      if (name.toLowerCase().includes('href')) return 'https://...';
      return `Enter ${name}...`;
    case 'number':
      if (name.toLowerCase().includes('size')) return 'e.g. 16';
      if (name.toLowerCase().includes('width')) return 'e.g. 100';
      if (name.toLowerCase().includes('height')) return 'e.g. 100';
      if (name.toLowerCase().includes('count')) return 'e.g. 5';
      return 'Enter number...';
    case 'ReactNode':
      return 'Enter text or JSX content...';
    default:
      return `Enter ${name}...`;
  }
}

/**
 * Get type hint text for the description
 */
function getTypeHint(prop) {
  switch (prop.type) {
    case 'boolean':
      return 'Toggle on/off';
    case 'enum':
      return prop.options?.length 
        ? `Options: ${prop.options.join(', ')}`
        : 'Select from options';
    case 'number':
      return 'Numeric value';
    case 'ReactNode':
      return 'Text or React content (renders as text in preview)';
    case 'string':
      return 'Text value';
    case 'icon':
      return 'Select an icon from your icon library';
    default:
      return null;
  }
}

export default function PropControl({ prop, value, onChange }) {
  const description = prop.description;
  const typeHint = getTypeHint(prop);
  const placeholder = getPlaceholder(prop);
  
  // Build the label with required indicator
  const labelText = prop.name + (prop.required ? ' *' : '');

  // Render description helper
  const renderDescription = () => {
    if (!description && !typeHint) return null;
    
    return (
      <div className="prop-control-description">
        {description && <span className="prop-control-desc-text">{description}</span>}
        {typeHint && !description && <span className="prop-control-type-hint">{typeHint}</span>}
      </div>
    );
  };

  switch (prop.type) {
    case 'boolean':
      return (
        <div className="prop-control prop-control--boolean">
          <Checkbox
            checked={Boolean(value)}
            onChange={onChange}
            label={labelText}
          />
          {renderDescription()}
        </div>
      );
    
    case 'enum':
      return (
        <div className="prop-control prop-control--enum">
          <Select
            label={prop.name}
            required={prop.required}
            value={value || ''}
            onChange={(val) => onChange(val)}
            options={prop.options?.map(o => ({ value: o, label: o })) || []}
            placeholder={`Select ${prop.name}...`}
          />
          {renderDescription()}
        </div>
      );
    
    case 'number':
      return (
        <div className="prop-control prop-control--number">
          <Input
            label={prop.name}
            required={prop.required}
            type="number"
            value={value !== undefined && value !== null ? value : ''}
            onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
            placeholder={placeholder}
          />
          {renderDescription()}
        </div>
      );
    
    case 'ReactNode':
      return (
        <div className="prop-control prop-control--reactnode">
          <Textarea
            label={prop.name}
            required={prop.required}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            placeholder={placeholder}
          />
          {renderDescription()}
        </div>
      );

    case 'icon':
      return (
        <div className="prop-control prop-control--icon">
          <IconPicker
            label={prop.name}
            required={prop.required}
            value={value || ''}
            onChange={onChange}
            placeholder="Select icon..."
          />
          {renderDescription()}
        </div>
      );

    case 'string':
      return (
        <div className="prop-control prop-control--string">
          <Input
            label={prop.name}
            required={prop.required}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
          />
          {renderDescription()}
        </div>
      );
    
    default:
      return (
        <div className="prop-control prop-control--default">
          <Input
            label={prop.name}
            required={prop.required}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
          />
          {renderDescription()}
        </div>
      );
  }
}

