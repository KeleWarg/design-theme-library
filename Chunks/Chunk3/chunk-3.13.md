# Chunk 3.13 — PreviewTab

## Purpose
Live preview of component with prop controls.

---

## Inputs
- Component data with code
- ThemeContext

## Outputs
- Interactive component preview

---

## Dependencies
- Chunk 3.12 must be complete
- Chunk 2.04 must be complete

---

## Implementation Notes

```jsx
// src/components/components/detail/PreviewTab.jsx
import { useState, useEffect } from 'react';
import { useThemeContext } from '../../../contexts/ThemeContext';
import { Select, SegmentedControl } from '../../ui';
import ComponentRenderer from './ComponentRenderer';
import PropControl from './PropControl';
import { MonitorIcon, TabletIcon, SmartphoneIcon } from 'lucide-react';

export default function PreviewTab({ component }) {
  const { activeTheme } = useThemeContext();
  const [propValues, setPropValues] = useState({});
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [viewMode, setViewMode] = useState('desktop');

  // Initialize prop values from defaults
  useEffect(() => {
    const defaults = {};
    component.props?.forEach(prop => {
      defaults[prop.name] = prop.default;
    });
    setPropValues(defaults);
  }, [component.props]);

  // Apply variant props
  useEffect(() => {
    if (selectedVariant) {
      const variant = component.variants?.find(v => v.name === selectedVariant);
      if (variant?.props) {
        setPropValues(prev => ({ ...prev, ...variant.props }));
      }
    }
  }, [selectedVariant, component.variants]);

  return (
    <div className="preview-tab">
      <div className="preview-controls">
        {component.variants?.length > 0 && (
          <Select
            label="Variant"
            value={selectedVariant || ''}
            onChange={(e) => setSelectedVariant(e.target.value || null)}
            options={[
              { value: '', label: 'Default' },
              ...component.variants.map(v => ({ value: v.name, label: v.name }))
            ]}
          />
        )}
        
        <SegmentedControl
          value={viewMode}
          onChange={setViewMode}
          options={[
            { value: 'desktop', icon: MonitorIcon, label: 'Desktop' },
            { value: 'tablet', icon: TabletIcon, label: 'Tablet' },
            { value: 'mobile', icon: SmartphoneIcon, label: 'Mobile' },
          ]}
        />
      </div>

      <div className="preview-viewport" data-mode={viewMode}>
        <ComponentRenderer
          code={component.code}
          props={propValues}
        />
      </div>

      {component.props?.length > 0 && (
        <div className="prop-controls">
          <h4>Props</h4>
          {component.props.map(prop => (
            <PropControl
              key={prop.name}
              prop={prop}
              value={propValues[prop.name]}
              onChange={(value) => setPropValues(prev => ({
                ...prev,
                [prop.name]: value
              }))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

### ComponentRenderer
```jsx
// src/components/components/detail/ComponentRenderer.jsx
import { useState, useEffect } from 'react';
import React from 'react';

export default function ComponentRenderer({ code, props }) {
  const [error, setError] = useState(null);
  const [Component, setComponent] = useState(null);

  useEffect(() => {
    if (!code) {
      setComponent(null);
      return;
    }

    try {
      // Create component from code string
      // In production, use react-live or similar for safer evaluation
      const fn = new Function('React', `
        const { useState, useEffect, useRef, useMemo, useCallback } = React;
        ${code}
        return typeof exports !== 'undefined' ? exports.default : 
               typeof module !== 'undefined' ? module.exports : 
               (() => {
                 const match = \`${code}\`.match(/(?:function|const)\\s+(\\w+)/);
                 return match ? eval(match[1]) : null;
               })();
      `);
      
      setComponent(() => fn(React));
      setError(null);
    } catch (e) {
      setError(e.message);
      setComponent(null);
    }
  }, [code]);

  if (error) {
    return (
      <div className="render-error">
        <strong>Render Error:</strong>
        <pre>{error}</pre>
      </div>
    );
  }

  if (!Component) {
    return <div className="render-loading">No component to render</div>;
  }

  try {
    return <Component {...props} />;
  } catch (e) {
    return (
      <div className="render-error">
        <strong>Runtime Error:</strong>
        <pre>{e.message}</pre>
      </div>
    );
  }
}
```

### PropControl
```jsx
// src/components/components/detail/PropControl.jsx
import { Input, Select, Checkbox } from '../../ui';

export default function PropControl({ prop, value, onChange }) {
  switch (prop.type) {
    case 'boolean':
      return (
        <div className="prop-control">
          <label>{prop.name}</label>
          <Checkbox
            checked={Boolean(value)}
            onChange={onChange}
          />
        </div>
      );
    
    case 'enum':
      return (
        <div className="prop-control">
          <label>{prop.name}</label>
          <Select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            options={prop.options?.map(o => ({ value: o, label: o })) || []}
          />
        </div>
      );
    
    case 'number':
      return (
        <div className="prop-control">
          <label>{prop.name}</label>
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(Number(e.target.value))}
          />
        </div>
      );
    
    default:
      return (
        <div className="prop-control">
          <label>{prop.name}</label>
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );
  }
}
```

---

## Files Created
- `src/components/components/detail/PreviewTab.jsx` — Preview tab
- `src/components/components/detail/ComponentRenderer.jsx` — Safe component renderer
- `src/components/components/detail/PropControl.jsx` — Prop input controls

---

## Tests

### Unit Tests
- [ ] Renders component from code
- [ ] Prop controls update preview
- [ ] Variant selection applies props
- [ ] Error state shows for invalid code

---

## Time Estimate
3 hours
