/**
 * @chunk 3.13 - PreviewTab
 * 
 * Preview tab for component detail page.
 * Provides live preview with prop controls, viewport sizing, theme switching, and background options.
 */

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useThemeContext } from '../../../contexts/ThemeContext';
import { useThemes, useTheme } from '../../../hooks/useThemes';
import { useIcons } from '../../../hooks/useIcons';
import { Select, SegmentedControl, Button } from '../../ui';
import ComponentRenderer from './ComponentRenderer';
import PropControl from './PropControl';
import { Monitor, Tablet, Smartphone, Palette, ExternalLink } from 'lucide-react';
import { isCompositeTypographyToken, expandCompositeTypographyToken, tokenToCssValue } from '../../../lib/cssVariableInjector';
import { detectPropNamesFromCode } from '../../../lib/propGenerator';
import { coercePropValues, computePreviewPropDiagnostics } from '../../../lib/previewPropUtils';

function deriveSemanticColorAliases(vars) {
  const pick = (keys) => {
    for (const k of keys) {
      const v = vars[k];
      if (typeof v === 'string' && v.trim() !== '') return v;
    }
    return undefined;
  };

  const aliases = {};

  // Backgrounds
  aliases['--color-background'] = pick(['--color-background', '--background-white', '--background-default', '--background-neutral-subtle']);
  aliases['--color-surface'] = pick(['--color-surface', '--background-white', '--background-default', '--color-background']);
  aliases['--color-muted'] = pick(['--color-muted', '--background-neutral-subtle', '--background-neutral-light', '--background-neutral']);

  // Foregrounds
  aliases['--color-foreground'] = pick(['--color-foreground', '--foreground-heading', '--foreground-body']);
  aliases['--color-muted-foreground'] = pick(['--color-muted-foreground', '--foreground-caption', '--foreground-body']);

  // Borders
  aliases['--color-border'] = pick(['--color-border', '--foreground-divider', '--foreground-stroke-default', '--foreground-table-border']);

  // Primary/secondary (buttons/brand)
  aliases['--color-primary'] = pick(['--color-primary', '--background-brand', '--button-primary-bg']);
  aliases['--color-primary-hover'] = pick(['--color-primary-hover', '--button-primary-hover-bg', '--button-primary-pressed-bg']);
  aliases['--color-secondary'] = pick(['--color-secondary', '--button-secondary-bg', '--background-secondary']);

  // Status
  aliases['--color-success'] = pick(['--color-success', '--foreground-feedback-success']);
  aliases['--color-warning'] = pick(['--color-warning', '--foreground-feedback-warning']);
  aliases['--color-error'] = pick(['--color-error', '--foreground-feedback-error']);

  // Drop undefined entries
  Object.keys(aliases).forEach((k) => {
    if (aliases[k] === undefined) delete aliases[k];
  });

  return aliases;
}

/**
 * Get localStorage key for persisting preview theme per component
 */
function getPreviewThemeKey(componentId) {
  return `component-preview-theme-${componentId}`;
}

export default function PreviewTab({ component }) {
  const { activeTheme } = useThemeContext();
  const { data: themes } = useThemes('all');
  const { data: icons } = useIcons();
  
  // Initialize preview theme from localStorage or active theme
  const [previewThemeId, setPreviewThemeId] = useState(() => {
    const saved = localStorage.getItem(getPreviewThemeKey(component.id));
    return saved || activeTheme?.id || '';
  });
  
  const { data: previewTheme } = useTheme(previewThemeId);
  const [propValues, setPropValues] = useState({});
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [viewMode, setViewMode] = useState('desktop');
  const [backgroundMode, setBackgroundMode] = useState('light');
  const variantPropDef = useMemo(() => {
    return (component?.props || []).find(
      (p) =>
        p?.name === 'variant' &&
        p?.type === 'enum' &&
        Array.isArray(p?.options) &&
        p.options.length > 0
    );
  }, [component?.props]);

  // Persist preview theme selection to localStorage
  const handleThemeChange = (themeId) => {
    setPreviewThemeId(themeId);
    if (themeId) {
      localStorage.setItem(getPreviewThemeKey(component.id), themeId);
    } else {
      localStorage.removeItem(getPreviewThemeKey(component.id));
    }
  };

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

  // Keep the selected preset in sync with the `variant` prop (when present)
  // This avoids showing two "variant" controls in the Preview tab.
  useEffect(() => {
    if (!variantPropDef) return;
    const current = propValues?.variant;
    setSelectedVariant(current ? String(current) : null);
  }, [variantPropDef, propValues?.variant]);

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
      t.status === 'published' || t.id === activeTheme?.id || t.id === previewThemeId
    );
  }, [themes, activeTheme, previewThemeId]);

  // Keep local preview selection in sync when activeTheme changes (e.g. first load)
  useEffect(() => {
    if (activeTheme?.id && !previewThemeId) {
      setPreviewThemeId(activeTheme.id);
    }
  }, [activeTheme?.id, previewThemeId]);

  const themeForPreview = previewTheme || activeTheme;

  const usedPropNames = useMemo(() => {
    return new Set(detectPropNamesFromCode(component?.code || ''));
  }, [component?.code]);

  const diagnostics = useMemo(() => {
    return computePreviewPropDiagnostics({
      propDefs: component?.props || [],
      usedPropNames,
      code: component?.code || '',
    });
  }, [component?.props, usedPropNames, component?.code]);

  const scopedCssVariables = useMemo(() => {
    if (!themeForPreview?.tokens) return {};

    const rawVars = themeForPreview.tokens.reduce((vars, token) => {
      if (!token.css_variable) return vars;
      if (isCompositeTypographyToken(token)) {
        Object.assign(vars, expandCompositeTypographyToken(token));
        return vars;
      }
      vars[token.css_variable] = tokenToCssValue(token);
      return vars;
    }, {});

    const aliasVars = deriveSemanticColorAliases(rawVars);
    return { ...aliasVars, ...rawVars };
  }, [themeForPreview]);

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

  // Coerce preview prop values to correct runtime types (booleans, numbers, etc.)
  const coercedPropValues = useMemo(() => {
    return coercePropValues(component?.props || [], propValues);
  }, [component?.props, propValues]);

  return (
    <div className="preview-tab">
      <div className="preview-controls">
        {(variantPropDef || (component.variants && component.variants.length > 0)) && (
          <Select
            label="Variant"
            value={selectedVariant || ''}
            onChange={(val) => {
              const next = val || null;
              setSelectedVariant(next);
              if (variantPropDef) {
                setPropValues((prev) => ({
                  ...prev,
                  variant: next || undefined,
                }));
              }
            }}
            options={[
              { value: '', label: 'Default' },
              ...(variantPropDef
                ? variantPropDef.options.map((o) => ({ value: o, label: o }))
                : component.variants.map(v => ({ value: v.name, label: v.name })))
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
          <div className="preview-theme-control">
            <Select
              label="Theme"
              value={previewThemeId || activeTheme?.id || ''}
              onChange={handleThemeChange}
              options={availableThemes.map(t => ({ 
                value: t.id, 
                label: t.name 
              }))}
            />
            {previewThemeId && (
              <Link 
                to={`/themes/${previewThemeId}`} 
                className="preview-edit-tokens-link"
                title="Edit theme tokens"
              >
                <ExternalLink size={14} />
                Edit Tokens
              </Link>
            )}
          </div>
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

      {/* Diagnostics: help explain why controls might not change output */}
      {component?.props?.length > 0 && diagnostics.unusedPropNames.length > 0 && (
        <div className="preview-diagnostics">
          <div className="preview-diagnostics-title">
            Preview inputs may not affect output
          </div>
          <div className="preview-diagnostics-body">
            <div className="preview-diagnostics-text">
              The component code does not appear to reference these props:
              <span className="preview-diagnostics-props">
                {diagnostics.unusedPropNames.slice(0, 8).join(', ')}
                {diagnostics.unusedPropNames.length > 8 ? ` (+${diagnostics.unusedPropNames.length - 8} more)` : ''}
              </span>
              {diagnostics.hasPropsSpread && (
                <span className="preview-diagnostics-note">
                  Note: code spreads <code>{'{...props}'}</code>/<code>{'{...rest}'}</code>, so this list may be incomplete.
                </span>
              )}
            </div>
            <div className="preview-diagnostics-hints">
              <div>
                <strong>Icons:</strong> your component must render <code>{'<Icon name={icon} />'}</code> (or matching prop name).
              </div>
              <div>
                <strong>Variants:</strong> selecting a variant only changes output if the component reads those props (e.g. <code>variant</code>, <code>size</code>).
              </div>
            </div>
          </div>
        </div>
      )}

      <div 
        className="preview-viewport" 
        data-mode={viewMode}
        data-background={backgroundMode}
        style={{ maxWidth: viewportWidth, ...scopedCssVariables }}
      >
        <div className="preview-viewport-content">
          <ComponentRenderer
            code={component.code}
            props={coercedPropValues}
            icons={icons || []}
          />
        </div>
      </div>

      {component.props && component.props.length > 0 && (
        <div className="prop-controls">
          <h4>Props</h4>
          <div className="prop-controls-grid">
            {component.props
              .filter((p) => !(variantPropDef && p?.name === 'variant'))
              .map(prop => (
              <PropControl
                key={prop.name}
                prop={prop}
                value={coercedPropValues[prop.name]}
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

        .preview-diagnostics {
          padding: var(--spacing-md, 16px);
          border: 1px solid var(--color-warning, #f59e0b);
          background: var(--color-warning-light, #fffbeb);
          border-radius: var(--radius-lg, 8px);
          color: var(--color-warning-foreground, #92400e);
        }

        .preview-diagnostics-title {
          font-weight: var(--font-weight-semibold, 600);
          margin-bottom: var(--spacing-xs, 4px);
        }

        .preview-diagnostics-body {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm, 8px);
          font-size: var(--font-size-sm, 14px);
          line-height: 1.4;
        }

        .preview-diagnostics-props {
          margin-left: var(--spacing-xs, 4px);
          font-family: var(--font-family-mono);
          font-size: var(--font-size-xs, 12px);
        }

        .preview-diagnostics-note {
          display: block;
          margin-top: var(--spacing-xs, 4px);
          opacity: 0.9;
        }

        .preview-diagnostics-hints {
          display: grid;
          gap: var(--spacing-xs, 4px);
        }

        .preview-theme-control {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs, 4px);
        }

        .preview-edit-tokens-link {
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-xs, 4px);
          font-size: var(--font-size-xs, 12px);
          color: var(--color-primary, #3b82f6);
          text-decoration: none;
          transition: color 0.15s;
        }

        .preview-edit-tokens-link:hover {
          color: var(--color-primary-hover, #2563eb);
          text-decoration: underline;
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

        .prop-control-description {
          margin-top: var(--spacing-xs, 4px);
          font-size: var(--font-size-xs, 12px);
          color: var(--color-muted-foreground, #6b7280);
          line-height: 1.4;
        }

        .prop-control-desc-text {
          display: block;
        }

        .prop-control-type-hint {
          display: block;
          font-style: italic;
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
}
