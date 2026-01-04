/**
 * @chunk 1.06 - Seed Data
 * 
 * Creates default theme, sample tokens, typefaces, typography roles, and sample component.
 * This script is IDEMPOTENT - can be re-run safely.
 */

-- ============================================================================
-- CLEANUP (for idempotency)
-- ============================================================================

-- Delete existing seed data by slug/name (preserves user-created data)
DELETE FROM component_examples WHERE component_id IN (
  SELECT id FROM components WHERE slug = 'button'
);
DELETE FROM component_images WHERE component_id IN (
  SELECT id FROM components WHERE slug = 'button'
);
DELETE FROM components WHERE slug = 'button';

DELETE FROM typography_roles WHERE theme_id IN (
  SELECT id FROM themes WHERE slug = 'system-default'
);
DELETE FROM font_files WHERE typeface_id IN (
  SELECT id FROM typefaces WHERE theme_id IN (
    SELECT id FROM themes WHERE slug = 'system-default'
  )
);
DELETE FROM typefaces WHERE theme_id IN (
  SELECT id FROM themes WHERE slug = 'system-default'
);
DELETE FROM tokens WHERE theme_id IN (
  SELECT id FROM themes WHERE slug = 'system-default'
);
DELETE FROM themes WHERE slug = 'system-default';

-- ============================================================================
-- DEFAULT THEME
-- ============================================================================

INSERT INTO themes (name, slug, description, status, is_default, source)
VALUES (
  'System Default',
  'system-default',
  'Clean, modern default theme with neutral colors and readable typography',
  'published',
  true,
  'manual'
);

-- ============================================================================
-- TOKENS - Colors
-- ============================================================================

INSERT INTO tokens (theme_id, name, path, category, type, value, css_variable, sort_order)
SELECT 
  t.id,
  'Primary',
  'color/primary',
  'color',
  'color',
  '{"hex": "#3B82F6", "rgb": {"r": 59, "g": 130, "b": 246}, "opacity": 1}'::jsonb,
  '--color-primary',
  1
FROM themes t WHERE t.slug = 'system-default';

INSERT INTO tokens (theme_id, name, path, category, type, value, css_variable, sort_order)
SELECT 
  t.id,
  'Primary Hover',
  'color/primary-hover',
  'color',
  'color',
  '{"hex": "#2563EB", "rgb": {"r": 37, "g": 99, "b": 235}, "opacity": 1}'::jsonb,
  '--color-primary-hover',
  2
FROM themes t WHERE t.slug = 'system-default';

INSERT INTO tokens (theme_id, name, path, category, type, value, css_variable, sort_order)
SELECT 
  t.id,
  'Secondary',
  'color/secondary',
  'color',
  'color',
  '{"hex": "#64748B", "rgb": {"r": 100, "g": 116, "b": 139}, "opacity": 1}'::jsonb,
  '--color-secondary',
  3
FROM themes t WHERE t.slug = 'system-default';

INSERT INTO tokens (theme_id, name, path, category, type, value, css_variable, sort_order)
SELECT 
  t.id,
  'Background',
  'color/background',
  'color',
  'color',
  '{"hex": "#FFFFFF", "rgb": {"r": 255, "g": 255, "b": 255}, "opacity": 1}'::jsonb,
  '--color-background',
  4
FROM themes t WHERE t.slug = 'system-default';

INSERT INTO tokens (theme_id, name, path, category, type, value, css_variable, sort_order)
SELECT 
  t.id,
  'Foreground',
  'color/foreground',
  'color',
  'color',
  '{"hex": "#0F172A", "rgb": {"r": 15, "g": 23, "b": 42}, "opacity": 1}'::jsonb,
  '--color-foreground',
  5
FROM themes t WHERE t.slug = 'system-default';

INSERT INTO tokens (theme_id, name, path, category, type, value, css_variable, sort_order)
SELECT 
  t.id,
  'Muted',
  'color/muted',
  'color',
  'color',
  '{"hex": "#F1F5F9", "rgb": {"r": 241, "g": 245, "b": 249}, "opacity": 1}'::jsonb,
  '--color-muted',
  6
FROM themes t WHERE t.slug = 'system-default';

INSERT INTO tokens (theme_id, name, path, category, type, value, css_variable, sort_order)
SELECT 
  t.id,
  'Success',
  'color/success',
  'color',
  'color',
  '{"hex": "#22C55E", "rgb": {"r": 34, "g": 197, "b": 94}, "opacity": 1}'::jsonb,
  '--color-success',
  7
FROM themes t WHERE t.slug = 'system-default';

INSERT INTO tokens (theme_id, name, path, category, type, value, css_variable, sort_order)
SELECT 
  t.id,
  'Error',
  'color/error',
  'color',
  'color',
  '{"hex": "#EF4444", "rgb": {"r": 239, "g": 68, "b": 68}, "opacity": 1}'::jsonb,
  '--color-error',
  8
FROM themes t WHERE t.slug = 'system-default';

INSERT INTO tokens (theme_id, name, path, category, type, value, css_variable, sort_order)
SELECT 
  t.id,
  'Warning',
  'color/warning',
  'color',
  'color',
  '{"hex": "#F59E0B", "rgb": {"r": 245, "g": 158, "b": 11}, "opacity": 1}'::jsonb,
  '--color-warning',
  9
FROM themes t WHERE t.slug = 'system-default';

INSERT INTO tokens (theme_id, name, path, category, type, value, css_variable, sort_order)
SELECT 
  t.id,
  'Border',
  'color/border',
  'color',
  'color',
  '{"hex": "#E2E8F0", "rgb": {"r": 226, "g": 232, "b": 240}, "opacity": 1}'::jsonb,
  '--color-border',
  10
FROM themes t WHERE t.slug = 'system-default';

-- ============================================================================
-- TOKENS - Typography
-- ============================================================================

INSERT INTO tokens (theme_id, name, path, category, type, value, css_variable, sort_order)
SELECT 
  t.id,
  'Font Size XS',
  'typography/size/xs',
  'typography',
  'dimension',
  '{"value": 12, "unit": "px"}'::jsonb,
  '--font-size-xs',
  1
FROM themes t WHERE t.slug = 'system-default';

INSERT INTO tokens (theme_id, name, path, category, type, value, css_variable, sort_order)
SELECT 
  t.id,
  'Font Size SM',
  'typography/size/sm',
  'typography',
  'dimension',
  '{"value": 14, "unit": "px"}'::jsonb,
  '--font-size-sm',
  2
FROM themes t WHERE t.slug = 'system-default';

INSERT INTO tokens (theme_id, name, path, category, type, value, css_variable, sort_order)
SELECT 
  t.id,
  'Font Size Base',
  'typography/size/base',
  'typography',
  'dimension',
  '{"value": 16, "unit": "px"}'::jsonb,
  '--font-size-base',
  3
FROM themes t WHERE t.slug = 'system-default';

INSERT INTO tokens (theme_id, name, path, category, type, value, css_variable, sort_order)
SELECT 
  t.id,
  'Font Size LG',
  'typography/size/lg',
  'typography',
  'dimension',
  '{"value": 18, "unit": "px"}'::jsonb,
  '--font-size-lg',
  4
FROM themes t WHERE t.slug = 'system-default';

INSERT INTO tokens (theme_id, name, path, category, type, value, css_variable, sort_order)
SELECT 
  t.id,
  'Font Size XL',
  'typography/size/xl',
  'typography',
  'dimension',
  '{"value": 24, "unit": "px"}'::jsonb,
  '--font-size-xl',
  5
FROM themes t WHERE t.slug = 'system-default';

INSERT INTO tokens (theme_id, name, path, category, type, value, css_variable, sort_order)
SELECT 
  t.id,
  'Font Size 2XL',
  'typography/size/2xl',
  'typography',
  'dimension',
  '{"value": 30, "unit": "px"}'::jsonb,
  '--font-size-2xl',
  6
FROM themes t WHERE t.slug = 'system-default';

INSERT INTO tokens (theme_id, name, path, category, type, value, css_variable, sort_order)
SELECT 
  t.id,
  'Font Size 3XL',
  'typography/size/3xl',
  'typography',
  'dimension',
  '{"value": 36, "unit": "px"}'::jsonb,
  '--font-size-3xl',
  7
FROM themes t WHERE t.slug = 'system-default';

INSERT INTO tokens (theme_id, name, path, category, type, value, css_variable, sort_order)
SELECT 
  t.id,
  'Line Height Tight',
  'typography/lineheight/tight',
  'typography',
  'dimension',
  '{"value": 1.25, "unit": ""}'::jsonb,
  '--line-height-tight',
  8
FROM themes t WHERE t.slug = 'system-default';

INSERT INTO tokens (theme_id, name, path, category, type, value, css_variable, sort_order)
SELECT 
  t.id,
  'Line Height Normal',
  'typography/lineheight/normal',
  'typography',
  'dimension',
  '{"value": 1.5, "unit": ""}'::jsonb,
  '--line-height-normal',
  9
FROM themes t WHERE t.slug = 'system-default';

INSERT INTO tokens (theme_id, name, path, category, type, value, css_variable, sort_order)
SELECT 
  t.id,
  'Line Height Relaxed',
  'typography/lineheight/relaxed',
  'typography',
  'dimension',
  '{"value": 1.75, "unit": ""}'::jsonb,
  '--line-height-relaxed',
  10
FROM themes t WHERE t.slug = 'system-default';

-- ============================================================================
-- TOKENS - Spacing
-- ============================================================================

INSERT INTO tokens (theme_id, name, path, category, type, value, css_variable, sort_order)
SELECT 
  t.id,
  'Space XS',
  'spacing/xs',
  'spacing',
  'dimension',
  '{"value": 4, "unit": "px"}'::jsonb,
  '--space-xs',
  1
FROM themes t WHERE t.slug = 'system-default';

INSERT INTO tokens (theme_id, name, path, category, type, value, css_variable, sort_order)
SELECT 
  t.id,
  'Space SM',
  'spacing/sm',
  'spacing',
  'dimension',
  '{"value": 8, "unit": "px"}'::jsonb,
  '--space-sm',
  2
FROM themes t WHERE t.slug = 'system-default';

INSERT INTO tokens (theme_id, name, path, category, type, value, css_variable, sort_order)
SELECT 
  t.id,
  'Space MD',
  'spacing/md',
  'spacing',
  'dimension',
  '{"value": 16, "unit": "px"}'::jsonb,
  '--space-md',
  3
FROM themes t WHERE t.slug = 'system-default';

INSERT INTO tokens (theme_id, name, path, category, type, value, css_variable, sort_order)
SELECT 
  t.id,
  'Space LG',
  'spacing/lg',
  'spacing',
  'dimension',
  '{"value": 24, "unit": "px"}'::jsonb,
  '--space-lg',
  4
FROM themes t WHERE t.slug = 'system-default';

INSERT INTO tokens (theme_id, name, path, category, type, value, css_variable, sort_order)
SELECT 
  t.id,
  'Space XL',
  'spacing/xl',
  'spacing',
  'dimension',
  '{"value": 32, "unit": "px"}'::jsonb,
  '--space-xl',
  5
FROM themes t WHERE t.slug = 'system-default';

INSERT INTO tokens (theme_id, name, path, category, type, value, css_variable, sort_order)
SELECT 
  t.id,
  'Space 2XL',
  'spacing/2xl',
  'spacing',
  'dimension',
  '{"value": 48, "unit": "px"}'::jsonb,
  '--space-2xl',
  6
FROM themes t WHERE t.slug = 'system-default';

INSERT INTO tokens (theme_id, name, path, category, type, value, css_variable, sort_order)
SELECT 
  t.id,
  'Space 3XL',
  'spacing/3xl',
  'spacing',
  'dimension',
  '{"value": 64, "unit": "px"}'::jsonb,
  '--space-3xl',
  7
FROM themes t WHERE t.slug = 'system-default';

-- ============================================================================
-- TOKENS - Shadows
-- ============================================================================

INSERT INTO tokens (theme_id, name, path, category, type, value, css_variable, sort_order)
SELECT 
  t.id,
  'Shadow SM',
  'shadow/sm',
  'shadow',
  'shadow',
  '{"shadows": [{"x": 0, "y": 1, "blur": 2, "spread": 0, "color": "rgba(0,0,0,0.05)"}]}'::jsonb,
  '--shadow-sm',
  1
FROM themes t WHERE t.slug = 'system-default';

INSERT INTO tokens (theme_id, name, path, category, type, value, css_variable, sort_order)
SELECT 
  t.id,
  'Shadow MD',
  'shadow/md',
  'shadow',
  'shadow',
  '{"shadows": [{"x": 0, "y": 4, "blur": 6, "spread": -1, "color": "rgba(0,0,0,0.1)"}]}'::jsonb,
  '--shadow-md',
  2
FROM themes t WHERE t.slug = 'system-default';

INSERT INTO tokens (theme_id, name, path, category, type, value, css_variable, sort_order)
SELECT 
  t.id,
  'Shadow LG',
  'shadow/lg',
  'shadow',
  'shadow',
  '{"shadows": [{"x": 0, "y": 10, "blur": 15, "spread": -3, "color": "rgba(0,0,0,0.1)"}, {"x": 0, "y": 4, "blur": 6, "spread": -2, "color": "rgba(0,0,0,0.05)"}]}'::jsonb,
  '--shadow-lg',
  3
FROM themes t WHERE t.slug = 'system-default';

INSERT INTO tokens (theme_id, name, path, category, type, value, css_variable, sort_order)
SELECT 
  t.id,
  'Shadow XL',
  'shadow/xl',
  'shadow',
  'shadow',
  '{"shadows": [{"x": 0, "y": 20, "blur": 25, "spread": -5, "color": "rgba(0,0,0,0.1)"}, {"x": 0, "y": 10, "blur": 10, "spread": -5, "color": "rgba(0,0,0,0.04)"}]}'::jsonb,
  '--shadow-xl',
  4
FROM themes t WHERE t.slug = 'system-default';

-- ============================================================================
-- TOKENS - Radius
-- ============================================================================

INSERT INTO tokens (theme_id, name, path, category, type, value, css_variable, sort_order)
SELECT 
  t.id,
  'Radius None',
  'radius/none',
  'radius',
  'dimension',
  '{"value": 0, "unit": "px"}'::jsonb,
  '--radius-none',
  1
FROM themes t WHERE t.slug = 'system-default';

INSERT INTO tokens (theme_id, name, path, category, type, value, css_variable, sort_order)
SELECT 
  t.id,
  'Radius SM',
  'radius/sm',
  'radius',
  'dimension',
  '{"value": 4, "unit": "px"}'::jsonb,
  '--radius-sm',
  2
FROM themes t WHERE t.slug = 'system-default';

INSERT INTO tokens (theme_id, name, path, category, type, value, css_variable, sort_order)
SELECT 
  t.id,
  'Radius MD',
  'radius/md',
  'radius',
  'dimension',
  '{"value": 8, "unit": "px"}'::jsonb,
  '--radius-md',
  3
FROM themes t WHERE t.slug = 'system-default';

INSERT INTO tokens (theme_id, name, path, category, type, value, css_variable, sort_order)
SELECT 
  t.id,
  'Radius LG',
  'radius/lg',
  'radius',
  'dimension',
  '{"value": 12, "unit": "px"}'::jsonb,
  '--radius-lg',
  4
FROM themes t WHERE t.slug = 'system-default';

INSERT INTO tokens (theme_id, name, path, category, type, value, css_variable, sort_order)
SELECT 
  t.id,
  'Radius XL',
  'radius/xl',
  'radius',
  'dimension',
  '{"value": 16, "unit": "px"}'::jsonb,
  '--radius-xl',
  5
FROM themes t WHERE t.slug = 'system-default';

INSERT INTO tokens (theme_id, name, path, category, type, value, css_variable, sort_order)
SELECT 
  t.id,
  'Radius Full',
  'radius/full',
  'radius',
  'dimension',
  '{"value": 9999, "unit": "px"}'::jsonb,
  '--radius-full',
  6
FROM themes t WHERE t.slug = 'system-default';

-- ============================================================================
-- TYPEFACES
-- ============================================================================

-- Display font (for headlines)
INSERT INTO typefaces (theme_id, role, family, fallback, source_type, weights, is_variable)
SELECT 
  t.id,
  'display',
  'Inter',
  'system-ui, sans-serif',
  'google',
  '[400, 500, 600, 700]'::jsonb,
  false
FROM themes t WHERE t.slug = 'system-default';

-- Text font (for body copy)
INSERT INTO typefaces (theme_id, role, family, fallback, source_type, weights, is_variable)
SELECT 
  t.id,
  'text',
  'Inter',
  'system-ui, sans-serif',
  'google',
  '[400, 500, 600]'::jsonb,
  false
FROM themes t WHERE t.slug = 'system-default';

-- Mono font (for code)
INSERT INTO typefaces (theme_id, role, family, fallback, source_type, weights, is_variable)
SELECT 
  t.id,
  'mono',
  'JetBrains Mono',
  'ui-monospace, monospace',
  'google',
  '[400, 500, 700]'::jsonb,
  false
FROM themes t WHERE t.slug = 'system-default';

-- ============================================================================
-- TYPOGRAPHY ROLES (semantic mapping)
-- ============================================================================

-- Display (largest headlines)
INSERT INTO typography_roles (theme_id, role_name, typeface_role, font_size, font_weight, line_height, letter_spacing)
SELECT 
  t.id,
  'display',
  'display',
  '3rem',
  700,
  '1.1',
  '-0.02em'
FROM themes t WHERE t.slug = 'system-default';

-- Heading XL
INSERT INTO typography_roles (theme_id, role_name, typeface_role, font_size, font_weight, line_height, letter_spacing)
SELECT 
  t.id,
  'heading-xl',
  'display',
  '2.25rem',
  700,
  '1.2',
  '-0.01em'
FROM themes t WHERE t.slug = 'system-default';

-- Heading LG
INSERT INTO typography_roles (theme_id, role_name, typeface_role, font_size, font_weight, line_height, letter_spacing)
SELECT 
  t.id,
  'heading-lg',
  'display',
  '1.875rem',
  600,
  '1.25',
  '-0.01em'
FROM themes t WHERE t.slug = 'system-default';

-- Heading MD
INSERT INTO typography_roles (theme_id, role_name, typeface_role, font_size, font_weight, line_height, letter_spacing)
SELECT 
  t.id,
  'heading-md',
  'display',
  '1.5rem',
  600,
  '1.3',
  'normal'
FROM themes t WHERE t.slug = 'system-default';

-- Heading SM
INSERT INTO typography_roles (theme_id, role_name, typeface_role, font_size, font_weight, line_height, letter_spacing)
SELECT 
  t.id,
  'heading-sm',
  'display',
  '1.25rem',
  600,
  '1.4',
  'normal'
FROM themes t WHERE t.slug = 'system-default';

-- Body LG
INSERT INTO typography_roles (theme_id, role_name, typeface_role, font_size, font_weight, line_height, letter_spacing)
SELECT 
  t.id,
  'body-lg',
  'text',
  '1.125rem',
  400,
  '1.6',
  'normal'
FROM themes t WHERE t.slug = 'system-default';

-- Body MD (default)
INSERT INTO typography_roles (theme_id, role_name, typeface_role, font_size, font_weight, line_height, letter_spacing)
SELECT 
  t.id,
  'body-md',
  'text',
  '1rem',
  400,
  '1.5',
  'normal'
FROM themes t WHERE t.slug = 'system-default';

-- Body SM
INSERT INTO typography_roles (theme_id, role_name, typeface_role, font_size, font_weight, line_height, letter_spacing)
SELECT 
  t.id,
  'body-sm',
  'text',
  '0.875rem',
  400,
  '1.5',
  'normal'
FROM themes t WHERE t.slug = 'system-default';

-- Label
INSERT INTO typography_roles (theme_id, role_name, typeface_role, font_size, font_weight, line_height, letter_spacing)
SELECT 
  t.id,
  'label',
  'text',
  '0.875rem',
  500,
  '1.4',
  '0.01em'
FROM themes t WHERE t.slug = 'system-default';

-- Caption
INSERT INTO typography_roles (theme_id, role_name, typeface_role, font_size, font_weight, line_height, letter_spacing)
SELECT 
  t.id,
  'caption',
  'text',
  '0.75rem',
  400,
  '1.4',
  '0.02em'
FROM themes t WHERE t.slug = 'system-default';

-- Code (mono)
INSERT INTO typography_roles (theme_id, role_name, typeface_role, font_size, font_weight, line_height, letter_spacing)
SELECT 
  t.id,
  'mono',
  'mono',
  '0.875rem',
  400,
  '1.6',
  'normal'
FROM themes t WHERE t.slug = 'system-default';

-- ============================================================================
-- SAMPLE COMPONENT - Button
-- ============================================================================

INSERT INTO components (name, slug, description, category, status, code, props, variants, linked_tokens)
VALUES (
  'Button',
  'button',
  'Primary action button with multiple variants and sizes. Supports disabled state and custom onClick handlers.',
  'buttons',
  'published',
  'export default function Button({ 
  children, 
  variant = ''primary'',
  size = ''md'',
  disabled = false,
  onClick,
  type = ''button'',
  className = '''',
  ...props 
}) {
  const baseStyles = {
    display: ''inline-flex'',
    alignItems: ''center'',
    justifyContent: ''center'',
    fontWeight: 500,
    borderRadius: ''var(--radius-md)'',
    transition: ''all 150ms ease'',
    cursor: disabled ? ''not-allowed'' : ''pointer'',
    opacity: disabled ? 0.5 : 1,
    border: ''none'',
    outline: ''none'',
  };

  const variantStyles = {
    primary: {
      backgroundColor: ''var(--color-primary)'',
      color: ''white'',
    },
    secondary: {
      backgroundColor: ''transparent'',
      color: ''var(--color-foreground)'',
      border: ''1px solid var(--color-border)'',
    },
    ghost: {
      backgroundColor: ''transparent'',
      color: ''var(--color-foreground)'',
    },
    danger: {
      backgroundColor: ''var(--color-error)'',
      color: ''white'',
    },
  };

  const sizeStyles = {
    sm: {
      padding: ''var(--space-xs) var(--space-sm)'',
      fontSize: ''var(--font-size-sm)'',
      gap: ''var(--space-xs)'',
    },
    md: {
      padding: ''var(--space-sm) var(--space-md)'',
      fontSize: ''var(--font-size-base)'',
      gap: ''var(--space-sm)'',
    },
    lg: {
      padding: ''var(--space-md) var(--space-lg)'',
      fontSize: ''var(--font-size-lg)'',
      gap: ''var(--space-sm)'',
    },
  };

  return (
    <button 
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        ...baseStyles,
        ...variantStyles[variant],
        ...sizeStyles[size],
      }}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}',
  '[
    {"name": "variant", "type": "enum", "options": ["primary", "secondary", "ghost", "danger"], "default": "primary", "description": "Visual style variant"},
    {"name": "size", "type": "enum", "options": ["sm", "md", "lg"], "default": "md", "description": "Button size"},
    {"name": "disabled", "type": "boolean", "default": false, "description": "Disable button interaction"},
    {"name": "onClick", "type": "function", "description": "Click handler function"},
    {"name": "type", "type": "enum", "options": ["button", "submit", "reset"], "default": "button", "description": "HTML button type"},
    {"name": "className", "type": "string", "default": "", "description": "Additional CSS classes"}
  ]'::jsonb,
  '[
    {"name": "Primary", "props": {"variant": "primary"}},
    {"name": "Secondary", "props": {"variant": "secondary"}},
    {"name": "Ghost", "props": {"variant": "ghost"}},
    {"name": "Danger", "props": {"variant": "danger"}},
    {"name": "Small", "props": {"size": "sm"}},
    {"name": "Large", "props": {"size": "lg"}},
    {"name": "Disabled", "props": {"disabled": true}}
  ]'::jsonb,
  '["color/primary", "color/foreground", "color/border", "color/error", "radius/md", "spacing/xs", "spacing/sm", "spacing/md", "spacing/lg", "typography/size/sm", "typography/size/base", "typography/size/lg"]'::jsonb
);

-- ============================================================================
-- COMPONENT EXAMPLES
-- ============================================================================

INSERT INTO component_examples (component_id, title, code, description, sort_order)
SELECT 
  c.id,
  'Basic Usage',
  '<Button>Click me</Button>',
  'Simple button with default primary variant',
  1
FROM components c WHERE c.slug = 'button';

INSERT INTO component_examples (component_id, title, code, description, sort_order)
SELECT 
  c.id,
  'Variants',
  '<div style={{ display: ''flex'', gap: ''8px'' }}>
  <Button variant="primary">Primary</Button>
  <Button variant="secondary">Secondary</Button>
  <Button variant="ghost">Ghost</Button>
  <Button variant="danger">Danger</Button>
</div>',
  'All available button variants',
  2
FROM components c WHERE c.slug = 'button';

INSERT INTO component_examples (component_id, title, code, description, sort_order)
SELECT 
  c.id,
  'Sizes',
  '<div style={{ display: ''flex'', alignItems: ''center'', gap: ''8px'' }}>
  <Button size="sm">Small</Button>
  <Button size="md">Medium</Button>
  <Button size="lg">Large</Button>
</div>',
  'All available button sizes',
  3
FROM components c WHERE c.slug = 'button';

INSERT INTO component_examples (component_id, title, code, description, sort_order)
SELECT 
  c.id,
  'With Click Handler',
  '<Button onClick={() => alert(''Clicked!'')}>
  Click to Alert
</Button>',
  'Button with onClick handler',
  4
FROM components c WHERE c.slug = 'button';

INSERT INTO component_examples (component_id, title, code, description, sort_order)
SELECT 
  c.id,
  'Disabled State',
  '<Button disabled>Disabled Button</Button>',
  'Button in disabled state',
  5
FROM components c WHERE c.slug = 'button';

-- ============================================================================
-- VERIFICATION QUERIES (optional - uncomment to check seed data)
-- ============================================================================

-- SELECT 'Themes:', COUNT(*) FROM themes WHERE slug = 'system-default';
-- SELECT 'Tokens:', COUNT(*) FROM tokens WHERE theme_id IN (SELECT id FROM themes WHERE slug = 'system-default');
-- SELECT 'Typefaces:', COUNT(*) FROM typefaces WHERE theme_id IN (SELECT id FROM themes WHERE slug = 'system-default');
-- SELECT 'Typography Roles:', COUNT(*) FROM typography_roles WHERE theme_id IN (SELECT id FROM themes WHERE slug = 'system-default');
-- SELECT 'Components:', COUNT(*) FROM components WHERE slug = 'button';
-- SELECT 'Component Examples:', COUNT(*) FROM component_examples;


