/**
 * @chunk 3.13 - PreviewTab
 * 
 * Preview tab for component detail page.
 * Provides live preview with prop controls, viewport sizing, theme switching, and background options.
 */

import { useState, useEffect, useMemo } from 'react';
import { useThemeContext } from '../../../contexts/ThemeContext';
import { useThemes } from '../../../hooks/useThemes';
import { Select, SegmentedControl } from '../../ui';
import ComponentRenderer from './ComponentRenderer';
import PropControl from './PropControl';
import { Monitor, Tablet, Smartphone, Palette } from 'lucide-react';

export default function PreviewTab({ component }) {
  const { activeTheme, setActiveTheme } = useThemeContext();
  const { data: themes } = useThemes('all');
  const [propValues, setPropValues] = useState({});
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [viewMode, setViewMode] = useState('desktop');
  const [backgroundMode, setBackgroundMode] = useState('light');

  // Initialize prop values from defaults
  useEffect(() => {
    const defaults = {};
    component.props?.forEach(prop => {
      if (prop.default !== undefined) {
        defaults[prop.name] = prop.default;
      }
    });
    setPropValues(defaults);
  }, [component.props]);

  // Apply variant props when variant is selected
  useEffect(() => {
    if (selectedVariant && component.variants) {
      const variant = component.variants.find(v => v.name === selectedVariant);
      if (variant?.props) {
        setPropValues(prev => ({ ...prev, ...variant.props }));
      }
    } else if (!selectedVariant) {
      // Reset to defaults when no variant selected
      const defaults = {};
      component.props?.forEach(prop => {
        if (prop.default !== undefined) {
          defaults[prop.name] = prop.default;
        }
      });
      setPropValues(defaults);
    }
  }, [selectedVariant, component.variants, component.props]);

  // Filter available themes (published + current active)
  const availableThemes = useMemo(() => {
    if (!themes) return [];
    return themes.filter(t => 
      t.status === 'published' || t.id === activeTheme?.id
    );
  }, [themes, activeTheme]);

  const viewportWidth = useMemo(() => {
    switch (viewMode) {
      case 'mobile':
        return 'var(--viewport-mobile, 375px)';
      case 'tablet':
        return 'var(--viewport-tablet, 768px)';
      default:
        return '100%';
    }
  }, [viewMode]);

  return (
    <div className="preview-tab">
      <div className="preview-controls">
        {component.variants && component.variants.length > 0 && (
          <Select
            label="Variant"
            value={selectedVariant || ''}
            onChange={(val) => setSelectedVariant(val || null)}
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
            { value: 'desktop', icon: Monitor, label: 'Desktop' },
            { value: 'tablet', icon: Tablet, label: 'Tablet' },
            { value: 'mobile', icon: Smartphone, label: 'Mobile' },
          ]}
        />

        {availableThemes.length > 1 && (
          <Select
            label="Theme"
            value={activeTheme?.id || ''}
            onChange={(themeId) => setActiveTheme(themeId)}
            options={availableThemes.map(t => ({ 
              value: t.id, 
              label: t.name 
            }))}
          />
        )}

        <SegmentedControl
          value={backgroundMode}
          onChange={setBackgroundMode}
          options={[
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'checkered', label: 'Checkered' },
          ]}
        />
      </div>

      <div 
        className="preview-viewport" 
        data-mode={viewMode}
        data-background={backgroundMode}
        style={{ maxWidth: viewportWidth }}
      >
        <div className="preview-viewport-content">
          <ComponentRenderer
            code={component.code}
            props={propValues}
          />
        </div>
      </div>

      {component.props && component.props.length > 0 && (
        <div className="prop-controls">
          <h4>Props</h4>
          <div className="prop-controls-grid">
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
        </div>
      )}

      <style>{`
        .preview-tab {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg, 24px);
        }

        .preview-controls {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-md, 16px);
          align-items: flex-end;
          padding: var(--spacing-md, 16px);
          background: var(--color-background, #ffffff);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: var(--radius-lg, 8px);
        }

        .preview-viewport {
          width: 100%;
          margin: 0 auto;
          background: var(--color-background, #ffffff);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: var(--radius-lg, 8px);
          overflow: hidden;
          box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
          transition: max-width 0.2s ease;
        }

        .preview-viewport[data-mode="mobile"] {
          max-width: var(--viewport-mobile, 375px);
        }

        .preview-viewport[data-mode="tablet"] {
          max-width: var(--viewport-tablet, 768px);
        }

        .preview-viewport[data-mode="desktop"] {
          max-width: 100%;
        }

        .preview-viewport-content {
          padding: var(--spacing-xl, 32px);
          min-height: 200px;
        }

        /* Background modes */
        .preview-viewport[data-background="light"] .preview-viewport-content {
          background: var(--color-background, #ffffff);
        }

        .preview-viewport[data-background="dark"] .preview-viewport-content {
          background: var(--color-muted, #f3f4f6);
        }

        .preview-viewport[data-background="checkered"] .preview-viewport-content {
          background-image: 
            linear-gradient(45deg, var(--color-border, #e5e7eb) 25%, transparent 25%),
            linear-gradient(-45deg, var(--color-border, #e5e7eb) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, var(--color-border, #e5e7eb) 75%),
            linear-gradient(-45deg, transparent 75%, var(--color-border, #e5e7eb) 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
          background-color: var(--color-background, #ffffff);
        }

        /* Render error/loading styles */
        .render-error {
          padding: var(--spacing-md, 16px);
          background: var(--color-error-light, #fee2e2);
          border: 1px solid var(--color-error, #ef4444);
          border-radius: var(--radius-md, 6px);
          color: var(--color-error, #ef4444);
        }

        .render-error strong {
          display: block;
          margin-bottom: var(--spacing-xs, 4px);
        }

        .render-error pre {
          margin: 0;
          font-size: var(--font-size-sm, 14px);
          white-space: pre-wrap;
          word-break: break-word;
        }

        .render-loading {
          padding: var(--spacing-xl, 32px);
          text-align: center;
          color: var(--color-muted-foreground, #6b7280);
          font-size: var(--font-size-sm, 14px);
        }

        .prop-controls {
          padding: var(--spacing-md, 16px);
          background: var(--color-background, #ffffff);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: var(--radius-lg, 8px);
        }

        .prop-controls h4 {
          margin: 0 0 var(--spacing-md, 16px) 0;
          font-size: var(--font-size-lg, 18px);
          font-weight: var(--font-weight-semibold, 600);
          color: var(--color-foreground, #1a1a1a);
        }

        .prop-controls-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: var(--spacing-md, 16px);
        }

        .prop-control {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs, 4px);
        }
      `}</style>
    </div>
  );
}
