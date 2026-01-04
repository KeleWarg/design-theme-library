/**
 * @chunk 1.06 - Seed Data (Node.js Script)
 * 
 * Alternative seed script using Node.js and Supabase JS client.
 * Run with: node scripts/seed.js
 * 
 * This script is IDEMPOTENT - can be re-run safely.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables.');
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================================
// SEED DATA DEFINITIONS
// ============================================================================

const defaultTheme = {
  name: 'System Default',
  slug: 'system-default',
  description: 'Clean, modern default theme with neutral colors and readable typography',
  status: 'published',
  is_default: true,
  source: 'manual'
};

const sampleTokens = [
  // Colors
  { name: 'Primary', path: 'color/primary', category: 'color', type: 'color', 
    value: { hex: '#3B82F6', rgb: { r: 59, g: 130, b: 246 }, opacity: 1 },
    css_variable: '--color-primary', sort_order: 1 },
  { name: 'Primary Hover', path: 'color/primary-hover', category: 'color', type: 'color',
    value: { hex: '#2563EB', rgb: { r: 37, g: 99, b: 235 }, opacity: 1 },
    css_variable: '--color-primary-hover', sort_order: 2 },
  { name: 'Secondary', path: 'color/secondary', category: 'color', type: 'color',
    value: { hex: '#64748B', rgb: { r: 100, g: 116, b: 139 }, opacity: 1 },
    css_variable: '--color-secondary', sort_order: 3 },
  { name: 'Background', path: 'color/background', category: 'color', type: 'color',
    value: { hex: '#FFFFFF', rgb: { r: 255, g: 255, b: 255 }, opacity: 1 },
    css_variable: '--color-background', sort_order: 4 },
  { name: 'Foreground', path: 'color/foreground', category: 'color', type: 'color',
    value: { hex: '#0F172A', rgb: { r: 15, g: 23, b: 42 }, opacity: 1 },
    css_variable: '--color-foreground', sort_order: 5 },
  { name: 'Muted', path: 'color/muted', category: 'color', type: 'color',
    value: { hex: '#F1F5F9', rgb: { r: 241, g: 245, b: 249 }, opacity: 1 },
    css_variable: '--color-muted', sort_order: 6 },
  { name: 'Success', path: 'color/success', category: 'color', type: 'color',
    value: { hex: '#22C55E', rgb: { r: 34, g: 197, b: 94 }, opacity: 1 },
    css_variable: '--color-success', sort_order: 7 },
  { name: 'Error', path: 'color/error', category: 'color', type: 'color',
    value: { hex: '#EF4444', rgb: { r: 239, g: 68, b: 68 }, opacity: 1 },
    css_variable: '--color-error', sort_order: 8 },
  { name: 'Warning', path: 'color/warning', category: 'color', type: 'color',
    value: { hex: '#F59E0B', rgb: { r: 245, g: 158, b: 11 }, opacity: 1 },
    css_variable: '--color-warning', sort_order: 9 },
  { name: 'Border', path: 'color/border', category: 'color', type: 'color',
    value: { hex: '#E2E8F0', rgb: { r: 226, g: 232, b: 240 }, opacity: 1 },
    css_variable: '--color-border', sort_order: 10 },
  
  // Typography
  { name: 'Font Size XS', path: 'typography/size/xs', category: 'typography', type: 'dimension',
    value: { value: 12, unit: 'px' }, css_variable: '--font-size-xs', sort_order: 1 },
  { name: 'Font Size SM', path: 'typography/size/sm', category: 'typography', type: 'dimension',
    value: { value: 14, unit: 'px' }, css_variable: '--font-size-sm', sort_order: 2 },
  { name: 'Font Size Base', path: 'typography/size/base', category: 'typography', type: 'dimension',
    value: { value: 16, unit: 'px' }, css_variable: '--font-size-base', sort_order: 3 },
  { name: 'Font Size LG', path: 'typography/size/lg', category: 'typography', type: 'dimension',
    value: { value: 18, unit: 'px' }, css_variable: '--font-size-lg', sort_order: 4 },
  { name: 'Font Size XL', path: 'typography/size/xl', category: 'typography', type: 'dimension',
    value: { value: 24, unit: 'px' }, css_variable: '--font-size-xl', sort_order: 5 },
  { name: 'Font Size 2XL', path: 'typography/size/2xl', category: 'typography', type: 'dimension',
    value: { value: 30, unit: 'px' }, css_variable: '--font-size-2xl', sort_order: 6 },
  { name: 'Font Size 3XL', path: 'typography/size/3xl', category: 'typography', type: 'dimension',
    value: { value: 36, unit: 'px' }, css_variable: '--font-size-3xl', sort_order: 7 },
  { name: 'Line Height Tight', path: 'typography/lineheight/tight', category: 'typography', type: 'dimension',
    value: { value: 1.25, unit: '' }, css_variable: '--line-height-tight', sort_order: 8 },
  { name: 'Line Height Normal', path: 'typography/lineheight/normal', category: 'typography', type: 'dimension',
    value: { value: 1.5, unit: '' }, css_variable: '--line-height-normal', sort_order: 9 },
  { name: 'Line Height Relaxed', path: 'typography/lineheight/relaxed', category: 'typography', type: 'dimension',
    value: { value: 1.75, unit: '' }, css_variable: '--line-height-relaxed', sort_order: 10 },
  
  // Spacing
  { name: 'Space XS', path: 'spacing/xs', category: 'spacing', type: 'dimension',
    value: { value: 4, unit: 'px' }, css_variable: '--space-xs', sort_order: 1 },
  { name: 'Space SM', path: 'spacing/sm', category: 'spacing', type: 'dimension',
    value: { value: 8, unit: 'px' }, css_variable: '--space-sm', sort_order: 2 },
  { name: 'Space MD', path: 'spacing/md', category: 'spacing', type: 'dimension',
    value: { value: 16, unit: 'px' }, css_variable: '--space-md', sort_order: 3 },
  { name: 'Space LG', path: 'spacing/lg', category: 'spacing', type: 'dimension',
    value: { value: 24, unit: 'px' }, css_variable: '--space-lg', sort_order: 4 },
  { name: 'Space XL', path: 'spacing/xl', category: 'spacing', type: 'dimension',
    value: { value: 32, unit: 'px' }, css_variable: '--space-xl', sort_order: 5 },
  { name: 'Space 2XL', path: 'spacing/2xl', category: 'spacing', type: 'dimension',
    value: { value: 48, unit: 'px' }, css_variable: '--space-2xl', sort_order: 6 },
  { name: 'Space 3XL', path: 'spacing/3xl', category: 'spacing', type: 'dimension',
    value: { value: 64, unit: 'px' }, css_variable: '--space-3xl', sort_order: 7 },
  
  // Shadows
  { name: 'Shadow SM', path: 'shadow/sm', category: 'shadow', type: 'shadow',
    value: { shadows: [{ x: 0, y: 1, blur: 2, spread: 0, color: 'rgba(0,0,0,0.05)' }] },
    css_variable: '--shadow-sm', sort_order: 1 },
  { name: 'Shadow MD', path: 'shadow/md', category: 'shadow', type: 'shadow',
    value: { shadows: [{ x: 0, y: 4, blur: 6, spread: -1, color: 'rgba(0,0,0,0.1)' }] },
    css_variable: '--shadow-md', sort_order: 2 },
  { name: 'Shadow LG', path: 'shadow/lg', category: 'shadow', type: 'shadow',
    value: { shadows: [
      { x: 0, y: 10, blur: 15, spread: -3, color: 'rgba(0,0,0,0.1)' },
      { x: 0, y: 4, blur: 6, spread: -2, color: 'rgba(0,0,0,0.05)' }
    ]},
    css_variable: '--shadow-lg', sort_order: 3 },
  { name: 'Shadow XL', path: 'shadow/xl', category: 'shadow', type: 'shadow',
    value: { shadows: [
      { x: 0, y: 20, blur: 25, spread: -5, color: 'rgba(0,0,0,0.1)' },
      { x: 0, y: 10, blur: 10, spread: -5, color: 'rgba(0,0,0,0.04)' }
    ]},
    css_variable: '--shadow-xl', sort_order: 4 },
  
  // Radius
  { name: 'Radius None', path: 'radius/none', category: 'radius', type: 'dimension',
    value: { value: 0, unit: 'px' }, css_variable: '--radius-none', sort_order: 1 },
  { name: 'Radius SM', path: 'radius/sm', category: 'radius', type: 'dimension',
    value: { value: 4, unit: 'px' }, css_variable: '--radius-sm', sort_order: 2 },
  { name: 'Radius MD', path: 'radius/md', category: 'radius', type: 'dimension',
    value: { value: 8, unit: 'px' }, css_variable: '--radius-md', sort_order: 3 },
  { name: 'Radius LG', path: 'radius/lg', category: 'radius', type: 'dimension',
    value: { value: 12, unit: 'px' }, css_variable: '--radius-lg', sort_order: 4 },
  { name: 'Radius XL', path: 'radius/xl', category: 'radius', type: 'dimension',
    value: { value: 16, unit: 'px' }, css_variable: '--radius-xl', sort_order: 5 },
  { name: 'Radius Full', path: 'radius/full', category: 'radius', type: 'dimension',
    value: { value: 9999, unit: 'px' }, css_variable: '--radius-full', sort_order: 6 },
];

const sampleTypefaces = [
  { role: 'display', family: 'Inter', fallback: 'system-ui, sans-serif', source_type: 'google', weights: [400, 500, 600, 700], is_variable: false },
  { role: 'text', family: 'Inter', fallback: 'system-ui, sans-serif', source_type: 'google', weights: [400, 500, 600], is_variable: false },
  { role: 'mono', family: 'JetBrains Mono', fallback: 'ui-monospace, monospace', source_type: 'google', weights: [400, 500, 700], is_variable: false },
];

const sampleTypographyRoles = [
  { role_name: 'display', typeface_role: 'display', font_size: '3rem', font_weight: 700, line_height: '1.1', letter_spacing: '-0.02em' },
  { role_name: 'heading-xl', typeface_role: 'display', font_size: '2.25rem', font_weight: 700, line_height: '1.2', letter_spacing: '-0.01em' },
  { role_name: 'heading-lg', typeface_role: 'display', font_size: '1.875rem', font_weight: 600, line_height: '1.25', letter_spacing: '-0.01em' },
  { role_name: 'heading-md', typeface_role: 'display', font_size: '1.5rem', font_weight: 600, line_height: '1.3', letter_spacing: 'normal' },
  { role_name: 'heading-sm', typeface_role: 'display', font_size: '1.25rem', font_weight: 600, line_height: '1.4', letter_spacing: 'normal' },
  { role_name: 'body-lg', typeface_role: 'text', font_size: '1.125rem', font_weight: 400, line_height: '1.6', letter_spacing: 'normal' },
  { role_name: 'body-md', typeface_role: 'text', font_size: '1rem', font_weight: 400, line_height: '1.5', letter_spacing: 'normal' },
  { role_name: 'body-sm', typeface_role: 'text', font_size: '0.875rem', font_weight: 400, line_height: '1.5', letter_spacing: 'normal' },
  { role_name: 'label', typeface_role: 'text', font_size: '0.875rem', font_weight: 500, line_height: '1.4', letter_spacing: '0.01em' },
  { role_name: 'caption', typeface_role: 'text', font_size: '0.75rem', font_weight: 400, line_height: '1.4', letter_spacing: '0.02em' },
  { role_name: 'mono', typeface_role: 'mono', font_size: '0.875rem', font_weight: 400, line_height: '1.6', letter_spacing: 'normal' },
];

const sampleComponent = {
  name: 'Button',
  slug: 'button',
  description: 'Primary action button with multiple variants and sizes. Supports disabled state and custom onClick handlers.',
  category: 'buttons',
  status: 'published',
  code: `export default function Button({ 
  children, 
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...props 
}) {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 500,
    borderRadius: 'var(--radius-md)',
    transition: 'all 150ms ease',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    border: 'none',
    outline: 'none',
  };

  const variantStyles = {
    primary: {
      backgroundColor: 'var(--color-primary)',
      color: 'white',
    },
    secondary: {
      backgroundColor: 'transparent',
      color: 'var(--color-foreground)',
      border: '1px solid var(--color-border)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--color-foreground)',
    },
    danger: {
      backgroundColor: 'var(--color-error)',
      color: 'white',
    },
  };

  const sizeStyles = {
    sm: {
      padding: 'var(--space-xs) var(--space-sm)',
      fontSize: 'var(--font-size-sm)',
      gap: 'var(--space-xs)',
    },
    md: {
      padding: 'var(--space-sm) var(--space-md)',
      fontSize: 'var(--font-size-base)',
      gap: 'var(--space-sm)',
    },
    lg: {
      padding: 'var(--space-md) var(--space-lg)',
      fontSize: 'var(--font-size-lg)',
      gap: 'var(--space-sm)',
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
}`,
  props: [
    { name: 'variant', type: 'enum', options: ['primary', 'secondary', 'ghost', 'danger'], default: 'primary', description: 'Visual style variant' },
    { name: 'size', type: 'enum', options: ['sm', 'md', 'lg'], default: 'md', description: 'Button size' },
    { name: 'disabled', type: 'boolean', default: false, description: 'Disable button interaction' },
    { name: 'onClick', type: 'function', description: 'Click handler function' },
    { name: 'type', type: 'enum', options: ['button', 'submit', 'reset'], default: 'button', description: 'HTML button type' },
    { name: 'className', type: 'string', default: '', description: 'Additional CSS classes' }
  ],
  variants: [
    { name: 'Primary', props: { variant: 'primary' } },
    { name: 'Secondary', props: { variant: 'secondary' } },
    { name: 'Ghost', props: { variant: 'ghost' } },
    { name: 'Danger', props: { variant: 'danger' } },
    { name: 'Small', props: { size: 'sm' } },
    { name: 'Large', props: { size: 'lg' } },
    { name: 'Disabled', props: { disabled: true } }
  ],
  linked_tokens: [
    'color/primary', 'color/foreground', 'color/border', 'color/error',
    'radius/md', 'spacing/xs', 'spacing/sm', 'spacing/md', 'spacing/lg',
    'typography/size/sm', 'typography/size/base', 'typography/size/lg'
  ]
};

const sampleExamples = [
  { title: 'Basic Usage', code: '<Button>Click me</Button>', description: 'Simple button with default primary variant', sort_order: 1 },
  { title: 'Variants', code: `<div style={{ display: 'flex', gap: '8px' }}>
  <Button variant="primary">Primary</Button>
  <Button variant="secondary">Secondary</Button>
  <Button variant="ghost">Ghost</Button>
  <Button variant="danger">Danger</Button>
</div>`, description: 'All available button variants', sort_order: 2 },
  { title: 'Sizes', code: `<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
  <Button size="sm">Small</Button>
  <Button size="md">Medium</Button>
  <Button size="lg">Large</Button>
</div>`, description: 'All available button sizes', sort_order: 3 },
  { title: 'With Click Handler', code: `<Button onClick={() => alert('Clicked!')}>
  Click to Alert
</Button>`, description: 'Button with onClick handler', sort_order: 4 },
  { title: 'Disabled State', code: '<Button disabled>Disabled Button</Button>', description: 'Button in disabled state', sort_order: 5 },
];

// ============================================================================
// SEED FUNCTIONS
// ============================================================================

async function cleanupExistingData() {
  console.log('🧹 Cleaning up existing seed data...');
  
  // Get theme ID first
  const { data: existingTheme } = await supabase
    .from('themes')
    .select('id')
    .eq('slug', 'system-default')
    .single();
  
  if (existingTheme) {
    // Delete related data
    await supabase.from('typography_roles').delete().eq('theme_id', existingTheme.id);
    await supabase.from('tokens').delete().eq('theme_id', existingTheme.id);
    
    // Delete typefaces (font_files cascade)
    await supabase.from('typefaces').delete().eq('theme_id', existingTheme.id);
    
    // Delete theme
    await supabase.from('themes').delete().eq('id', existingTheme.id);
  }
  
  // Get component ID
  const { data: existingComponent } = await supabase
    .from('components')
    .select('id')
    .eq('slug', 'button')
    .single();
  
  if (existingComponent) {
    // Delete related data (images cascade)
    await supabase.from('component_examples').delete().eq('component_id', existingComponent.id);
    await supabase.from('component_images').delete().eq('component_id', existingComponent.id);
    await supabase.from('components').delete().eq('id', existingComponent.id);
  }
  
  console.log('✓ Cleanup complete');
}

async function seedTheme() {
  console.log('📦 Creating default theme...');
  
  const { data: theme, error } = await supabase
    .from('themes')
    .insert(defaultTheme)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to create theme: ${error.message}`);
  }
  
  console.log(`✓ Created theme: ${theme.name} (${theme.id})`);
  return theme;
}

async function seedTokens(themeId) {
  console.log('🎨 Creating tokens...');
  
  const tokensWithTheme = sampleTokens.map(token => ({
    ...token,
    theme_id: themeId
  }));
  
  const { data: tokens, error } = await supabase
    .from('tokens')
    .insert(tokensWithTheme)
    .select();
  
  if (error) {
    throw new Error(`Failed to create tokens: ${error.message}`);
  }
  
  console.log(`✓ Created ${tokens.length} tokens`);
  return tokens;
}

async function seedTypefaces(themeId) {
  console.log('🔤 Creating typefaces...');
  
  const typefacesWithTheme = sampleTypefaces.map(typeface => ({
    ...typeface,
    theme_id: themeId
  }));
  
  const { data: typefaces, error } = await supabase
    .from('typefaces')
    .insert(typefacesWithTheme)
    .select();
  
  if (error) {
    throw new Error(`Failed to create typefaces: ${error.message}`);
  }
  
  console.log(`✓ Created ${typefaces.length} typefaces`);
  return typefaces;
}

async function seedTypographyRoles(themeId) {
  console.log('📝 Creating typography roles...');
  
  const rolesWithTheme = sampleTypographyRoles.map(role => ({
    ...role,
    theme_id: themeId
  }));
  
  const { data: roles, error } = await supabase
    .from('typography_roles')
    .insert(rolesWithTheme)
    .select();
  
  if (error) {
    throw new Error(`Failed to create typography roles: ${error.message}`);
  }
  
  console.log(`✓ Created ${roles.length} typography roles`);
  return roles;
}

async function seedComponent() {
  console.log('🧩 Creating sample component...');
  
  const { data: component, error } = await supabase
    .from('components')
    .insert(sampleComponent)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to create component: ${error.message}`);
  }
  
  console.log(`✓ Created component: ${component.name} (${component.id})`);
  return component;
}

async function seedExamples(componentId) {
  console.log('📋 Creating component examples...');
  
  const examplesWithComponent = sampleExamples.map(example => ({
    ...example,
    component_id: componentId
  }));
  
  const { data: examples, error } = await supabase
    .from('component_examples')
    .insert(examplesWithComponent)
    .select();
  
  if (error) {
    throw new Error(`Failed to create examples: ${error.message}`);
  }
  
  console.log(`✓ Created ${examples.length} component examples`);
  return examples;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function seed() {
  console.log('\n🌱 Starting seed process...\n');
  
  try {
    // Step 1: Cleanup existing seed data (idempotent)
    await cleanupExistingData();
    
    // Step 2: Create theme
    const theme = await seedTheme();
    
    // Step 3: Create tokens
    await seedTokens(theme.id);
    
    // Step 4: Create typefaces
    await seedTypefaces(theme.id);
    
    // Step 5: Create typography roles
    await seedTypographyRoles(theme.id);
    
    // Step 6: Create component
    const component = await seedComponent();
    
    // Step 7: Create examples
    await seedExamples(component.id);
    
    console.log('\n✅ Seed complete!\n');
    console.log('Summary:');
    console.log('  - 1 default theme (System Default)');
    console.log(`  - ${sampleTokens.length} design tokens`);
    console.log(`  - ${sampleTypefaces.length} typefaces`);
    console.log(`  - ${sampleTypographyRoles.length} typography roles`);
    console.log('  - 1 sample component (Button)');
    console.log(`  - ${sampleExamples.length} component examples`);
    
  } catch (error) {
    console.error('\n❌ Seed failed:', error.message);
    process.exit(1);
  }
}

// Run seed
seed();


