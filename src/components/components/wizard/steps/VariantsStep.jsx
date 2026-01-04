/**
 * @chunk 3.08 - VariantsStep
 * 
 * Third step of the component creation wizard.
 * Allows users to define component variants (visual styles and sizes).
 * 
 * Features:
 * - Add predefined variants (primary, secondary, outline, ghost, etc.)
 * - Add size variants (sm, md, lg, xl)
 * - Custom variants with prop combinations
 * - Preview grid showing variant combinations
 * - Uses tokens from current theme for colors
 */

import { useMemo } from 'react';
import { Button, Input, Textarea, Select } from '../../../ui';
import { PlusIcon, TrashIcon, PaletteIcon, RulerIcon, SparklesIcon, EyeIcon } from 'lucide-react';
import { useThemeContext } from '../../../../contexts/ThemeContext';

/**
 * Predefined visual variant templates
 */
const VISUAL_VARIANT_TEMPLATES = [
  { name: 'primary', description: 'Primary action, main call-to-action' },
  { name: 'secondary', description: 'Secondary action, less emphasis' },
  { name: 'outline', description: 'Bordered style with transparent background' },
  { name: 'ghost', description: 'Minimal style, text only appearance' },
  { name: 'destructive', description: 'Destructive/danger action' },
  { name: 'link', description: 'Styled as inline link' },
];

/**
 * Predefined size variant templates
 */
const SIZE_VARIANT_TEMPLATES = [
  { name: 'xs', description: 'Extra small size' },
  { name: 'sm', description: 'Small size' },
  { name: 'md', description: 'Medium size (default)' },
  { name: 'lg', description: 'Large size' },
  { name: 'xl', description: 'Extra large size' },
];

/**
 * Create a new variant object
 */
function createVariant(name = '', description = '', type = 'visual') {
  return {
    name,
    description,
    type, // 'visual' | 'size' | 'custom'
    props: {},
  };
}

export default function VariantsStep({ data, onUpdate }) {
  const { tokens } = useThemeContext();
  
  // Get color tokens for preview
  const colorTokens = useMemo(() => {
    return tokens?.color || [];
  }, [tokens]);

  // Separate variants by type for display
  const { visualVariants, sizeVariants, customVariants } = useMemo(() => {
    const visual = [];
    const size = [];
    const custom = [];
    
    (data.variants || []).forEach((v, idx) => {
      const item = { ...v, originalIndex: idx };
      if (v.type === 'size') {
        size.push(item);
      } else if (v.type === 'visual') {
        visual.push(item);
      } else {
        custom.push(item);
      }
    });
    
    return { visualVariants: visual, sizeVariants: size, customVariants: custom };
  }, [data.variants]);

  /**
   * Add a variant from template
   */
  const addVariantFromTemplate = (template, type) => {
    // Check if already exists
    const exists = data.variants.some(v => v.name === template.name && v.type === type);
    if (exists) return;
    
    onUpdate({
      variants: [...data.variants, createVariant(template.name, template.description, type)],
    });
  };

  /**
   * Add a custom variant
   */
  const addCustomVariant = () => {
    onUpdate({
      variants: [...data.variants, createVariant('', '', 'custom')],
    });
  };

  /**
   * Update a variant at specific index
   */
  const updateVariant = (index, updates) => {
    const newVariants = [...data.variants];
    newVariants[index] = { ...newVariants[index], ...updates };
    onUpdate({ variants: newVariants });
  };

  /**
   * Remove a variant
   */
  const removeVariant = (index) => {
    onUpdate({
      variants: data.variants.filter((_, i) => i !== index),
    });
  };

  /**
   * Update prop value for a variant
   */
  const updateVariantProp = (index, propName, value) => {
    const newVariants = [...data.variants];
    newVariants[index] = {
      ...newVariants[index],
      props: {
        ...newVariants[index].props,
        [propName]: value,
      },
    };
    onUpdate({ variants: newVariants });
  };

  // Get available templates (not yet added)
  const availableVisualTemplates = VISUAL_VARIANT_TEMPLATES.filter(
    t => !data.variants.some(v => v.name === t.name && v.type === 'visual')
  );
  const availableSizeTemplates = SIZE_VARIANT_TEMPLATES.filter(
    t => !data.variants.some(v => v.name === t.name && v.type === 'size')
  );

  const hasVariants = data.variants.length > 0;

  return (
    <div className="variants-step">
      <div className="variants-step-header">
        <div className="variants-step-header-content">
          <h2 className="variants-step-title">Define Variants</h2>
          <p className="variants-step-description">
            Variants define different visual styles and sizes for your component. 
            Add predefined variants or create custom ones with specific prop combinations.
          </p>
        </div>
      </div>

      {/* Quick Add Section */}
      <div className="variants-quick-add">
        {/* Visual Variants Quick Add */}
        <div className="variants-quick-add-section">
          <div className="variants-quick-add-header">
            <PaletteIcon size={16} />
            <span>Visual Variants</span>
          </div>
          <div className="variants-quick-add-buttons">
            {availableVisualTemplates.length > 0 ? (
              availableVisualTemplates.map(template => (
                <button
                  key={template.name}
                  type="button"
                  className="variants-quick-add-btn"
                  onClick={() => addVariantFromTemplate(template, 'visual')}
                  title={template.description}
                >
                  <PlusIcon size={12} />
                  {template.name}
                </button>
              ))
            ) : (
              <span className="variants-quick-add-empty">All visual variants added</span>
            )}
          </div>
        </div>

        {/* Size Variants Quick Add */}
        <div className="variants-quick-add-section">
          <div className="variants-quick-add-header">
            <RulerIcon size={16} />
            <span>Size Variants</span>
          </div>
          <div className="variants-quick-add-buttons">
            {availableSizeTemplates.length > 0 ? (
              availableSizeTemplates.map(template => (
                <button
                  key={template.name}
                  type="button"
                  className="variants-quick-add-btn"
                  onClick={() => addVariantFromTemplate(template, 'size')}
                  title={template.description}
                >
                  <PlusIcon size={12} />
                  {template.name}
                </button>
              ))
            ) : (
              <span className="variants-quick-add-empty">All size variants added</span>
            )}
          </div>
        </div>

        {/* Custom Variant Add */}
        <div className="variants-quick-add-section">
          <div className="variants-quick-add-header">
            <SparklesIcon size={16} />
            <span>Custom Variants</span>
          </div>
          <Button size="small" onClick={addCustomVariant} className="variants-add-custom-btn">
            <PlusIcon size={14} />
            Add Custom
          </Button>
        </div>
      </div>

      {/* Variants List */}
      {!hasVariants ? (
        <div className="variants-empty-state">
          <div className="variants-empty-icon">
            <EyeIcon size={32} />
          </div>
          <h3 className="variants-empty-title">No variants defined yet</h3>
          <p className="variants-empty-description">
            Variants let you showcase different styles and sizes of your component.
            Click the buttons above to add predefined variants or create custom ones.
          </p>
        </div>
      ) : (
        <div className="variants-sections">
          {/* Visual Variants Section */}
          {visualVariants.length > 0 && (
            <VariantSection
              title="Visual Variants"
              icon={<PaletteIcon size={16} />}
              variants={visualVariants}
              props={data.props}
              colorTokens={colorTokens}
              onUpdate={updateVariant}
              onRemove={removeVariant}
              onUpdateProp={updateVariantProp}
            />
          )}

          {/* Size Variants Section */}
          {sizeVariants.length > 0 && (
            <VariantSection
              title="Size Variants"
              icon={<RulerIcon size={16} />}
              variants={sizeVariants}
              props={data.props}
              colorTokens={colorTokens}
              onUpdate={updateVariant}
              onRemove={removeVariant}
              onUpdateProp={updateVariantProp}
            />
          )}

          {/* Custom Variants Section */}
          {customVariants.length > 0 && (
            <VariantSection
              title="Custom Variants"
              icon={<SparklesIcon size={16} />}
              variants={customVariants}
              props={data.props}
              colorTokens={colorTokens}
              onUpdate={updateVariant}
              onRemove={removeVariant}
              onUpdateProp={updateVariantProp}
              isCustom
            />
          )}
        </div>
      )}

      {/* Preview Grid */}
      {hasVariants && data.props.length > 0 && (
        <VariantPreviewGrid
          visualVariants={visualVariants}
          sizeVariants={sizeVariants}
          componentName={data.name || 'Component'}
          colorTokens={colorTokens}
        />
      )}
    </div>
  );
}

/**
 * Section for a group of variants
 */
function VariantSection({
  title,
  icon,
  variants,
  props,
  colorTokens,
  onUpdate,
  onRemove,
  onUpdateProp,
  isCustom = false,
}) {
  return (
    <div className="variants-section">
      <div className="variants-section-header">
        {icon}
        <span>{title}</span>
        <span className="variants-section-count">{variants.length}</span>
      </div>
      <div className="variants-section-list">
        {variants.map(variant => (
          <VariantCard
            key={variant.originalIndex}
            variant={variant}
            props={props}
            colorTokens={colorTokens}
            onUpdate={(updates) => onUpdate(variant.originalIndex, updates)}
            onRemove={() => onRemove(variant.originalIndex)}
            onUpdateProp={(propName, value) => onUpdateProp(variant.originalIndex, propName, value)}
            isCustom={isCustom}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Individual variant card
 */
function VariantCard({
  variant,
  props,
  colorTokens,
  onUpdate,
  onRemove,
  onUpdateProp,
  isCustom,
}) {
  // Get primary color for visual preview
  const primaryColor = useMemo(() => {
    const primaryToken = colorTokens.find(t => 
      t.name?.toLowerCase().includes('primary') || 
      t.path?.toLowerCase().includes('primary')
    );
    if (primaryToken?.value) {
      return typeof primaryToken.value === 'string' 
        ? primaryToken.value 
        : primaryToken.value.hex || 'var(--color-primary)';
    }
    return 'var(--color-primary)';
  }, [colorTokens]);

  return (
    <div className="variant-card">
      <div className="variant-card-header">
        <div className="variant-card-preview" style={{ backgroundColor: primaryColor }} />
        <div className="variant-card-info">
          {isCustom ? (
            <Input
              value={variant.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="Variant name"
              className="variant-name-input"
            />
          ) : (
            <span className="variant-card-name">{variant.name}</span>
          )}
        </div>
        <button
          type="button"
          className="variant-remove-btn"
          onClick={onRemove}
          title="Remove variant"
        >
          <TrashIcon size={14} />
        </button>
      </div>

      <Textarea
        value={variant.description}
        onChange={(e) => onUpdate({ description: e.target.value })}
        placeholder="When to use this variant..."
        rows={2}
        className="variant-description-input"
      />

      {/* Prop values for this variant */}
      {props.length > 0 && (
        <div className="variant-props">
          <div className="variant-props-header">Prop Overrides</div>
          <div className="variant-props-grid">
            {props.map(prop => (
              <VariantPropInput
                key={prop.name}
                prop={prop}
                value={variant.props[prop.name]}
                onChange={(value) => onUpdateProp(prop.name, value)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Prop input for variant override
 */
function VariantPropInput({ prop, value, onChange }) {
  if (prop.type === 'boolean') {
    return (
      <div className="variant-prop-field">
        <label className="variant-prop-checkbox">
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span className="variant-prop-label">{prop.name}</span>
        </label>
      </div>
    );
  }

  if (prop.type === 'enum' && prop.options?.length > 0) {
    return (
      <div className="variant-prop-field">
        <Select
          label={prop.name}
          value={value || ''}
          onChange={(val) => onChange(val)}
          options={[
            { value: '', label: '(default)' },
            ...prop.options.map(o => ({ value: o, label: o })),
          ]}
          size="sm"
        />
      </div>
    );
  }

  return (
    <div className="variant-prop-field">
      <Input
        label={prop.name}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={prop.default || '(default)'}
      />
    </div>
  );
}

/**
 * Preview grid showing variant combinations
 */
function VariantPreviewGrid({ visualVariants, sizeVariants, componentName, colorTokens }) {
  const hasVisual = visualVariants.length > 0;
  const hasSize = sizeVariants.length > 0;

  if (!hasVisual && !hasSize) return null;

  // Get colors from tokens
  const getVariantColor = (variantName) => {
    // Map variant names to color token patterns
    const colorMap = {
      primary: 'primary',
      secondary: 'secondary',
      destructive: 'destructive',
      outline: 'border',
      ghost: 'muted',
      link: 'primary',
    };

    const tokenPattern = colorMap[variantName] || 'primary';
    const token = colorTokens.find(t => 
      t.name?.toLowerCase().includes(tokenPattern) || 
      t.path?.toLowerCase().includes(tokenPattern)
    );

    if (token?.value) {
      return typeof token.value === 'string' 
        ? token.value 
        : token.value.hex || 'var(--color-primary)';
    }
    return 'var(--color-primary)';
  };

  // Get size scale from tokens or use defaults
  const getSizeScale = (sizeName) => {
    const sizeMap = {
      xs: { padding: 'var(--spacing-xs, 4px)', fontSize: 'var(--font-size-xs, 12px)' },
      sm: { padding: 'var(--spacing-sm, 8px)', fontSize: 'var(--font-size-sm, 14px)' },
      md: { padding: 'var(--spacing-md, 12px)', fontSize: 'var(--font-size-base, 16px)' },
      lg: { padding: 'var(--spacing-lg, 16px)', fontSize: 'var(--font-size-lg, 18px)' },
      xl: { padding: 'var(--spacing-xl, 20px)', fontSize: 'var(--font-size-xl, 20px)' },
    };
    return sizeMap[sizeName] || sizeMap.md;
  };

  return (
    <div className="variant-preview">
      <div className="variant-preview-header">
        <EyeIcon size={16} />
        <span>Preview Grid</span>
      </div>
      <div className="variant-preview-grid">
        {/* Column headers (sizes) */}
        <div className="variant-preview-cell variant-preview-corner"></div>
        {hasSize ? (
          sizeVariants.map(size => (
            <div key={size.name} className="variant-preview-cell variant-preview-header-cell">
              {size.name}
            </div>
          ))
        ) : (
          <div className="variant-preview-cell variant-preview-header-cell">default</div>
        )}

        {/* Rows (visual variants) */}
        {hasVisual ? (
          visualVariants.map(visual => (
            <>
              <div key={`${visual.name}-label`} className="variant-preview-cell variant-preview-row-label">
                {visual.name}
              </div>
              {hasSize ? (
                sizeVariants.map(size => (
                  <div key={`${visual.name}-${size.name}`} className="variant-preview-cell">
                    <div
                      className="variant-preview-sample"
                      style={{
                        backgroundColor: visual.name === 'ghost' || visual.name === 'link' || visual.name === 'outline'
                          ? 'transparent'
                          : getVariantColor(visual.name),
                        border: visual.name === 'outline' 
                          ? `2px solid ${getVariantColor(visual.name)}`
                          : 'none',
                        color: visual.name === 'ghost' || visual.name === 'link' || visual.name === 'outline'
                          ? getVariantColor(visual.name)
                          : 'white',
                        ...getSizeScale(size.name),
                        textDecoration: visual.name === 'link' ? 'underline' : 'none',
                      }}
                    >
                      {componentName}
                    </div>
                  </div>
                ))
              ) : (
                <div key={`${visual.name}-default`} className="variant-preview-cell">
                  <div
                    className="variant-preview-sample"
                    style={{
                      backgroundColor: visual.name === 'ghost' || visual.name === 'link' || visual.name === 'outline'
                        ? 'transparent'
                        : getVariantColor(visual.name),
                      border: visual.name === 'outline' 
                        ? `2px solid ${getVariantColor(visual.name)}`
                        : 'none',
                      color: visual.name === 'ghost' || visual.name === 'link' || visual.name === 'outline'
                        ? getVariantColor(visual.name)
                        : 'white',
                      ...getSizeScale('md'),
                      textDecoration: visual.name === 'link' ? 'underline' : 'none',
                    }}
                  >
                    {componentName}
                  </div>
                </div>
              )}
            </>
          ))
        ) : (
          <>
            <div className="variant-preview-cell variant-preview-row-label">default</div>
            {sizeVariants.map(size => (
              <div key={`default-${size.name}`} className="variant-preview-cell">
                <div
                  className="variant-preview-sample"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    ...getSizeScale(size.name),
                  }}
                >
                  {componentName}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}


