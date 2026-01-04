/**
 * @chunk 3.13 - PreviewTab
 * 
 * Prop control component that renders appropriate input based on prop type.
 */

import { Input, Select, Checkbox, Textarea } from '../../ui';

export default function PropControl({ prop, value, onChange }) {
  switch (prop.type) {
    case 'boolean':
      return (
        <div className="prop-control">
          <Checkbox
            checked={Boolean(value)}
            onChange={onChange}
            label={prop.name}
          />
        </div>
      );
    
    case 'enum':
      return (
        <div className="prop-control">
          <Select
            label={prop.name}
            value={value || ''}
            onChange={(val) => onChange(val)}
            options={prop.options?.map(o => ({ value: o, label: o })) || []}
            placeholder={`Select ${prop.name}...`}
          />
        </div>
      );
    
    case 'number':
      return (
        <div className="prop-control">
          <Input
            label={prop.name}
            type="number"
            value={value !== undefined && value !== null ? value : ''}
            onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
          />
        </div>
      );
    
    case 'ReactNode':
    case 'string':
      // For ReactNode, use textarea for multiline input
      if (prop.type === 'ReactNode') {
        return (
          <div className="prop-control">
            <Textarea
              label={prop.name}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              rows={4}
            />
          </div>
        );
      }
      return (
        <div className="prop-control">
          <Input
            label={prop.name}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );
    
    default:
      return (
        <div className="prop-control">
          <Input
            label={prop.name}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );
  }
}





