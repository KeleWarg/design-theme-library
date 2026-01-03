# Chunk 1.06 — Seed Data

## Purpose
Create seed data for development and testing.

---

## Inputs
- All schema migrations (from chunk 1.02, 1.03, 1.04)
- Sample Figma token export

## Outputs
- Seed script (consumed by development workflow)
- Default theme with tokens
- Sample component

---

## Dependencies
- Chunks 1.02, 1.03, 1.04 must be complete

---

## Implementation Notes

### Key Considerations
- Create one complete theme with all token categories
- Include realistic token values
- Add one sample component for testing
- Make script idempotent (can re-run safely)

### Default Theme
```javascript
const defaultTheme = {
  name: 'System Default',
  slug: 'system-default',
  description: 'Clean, modern default theme with neutral colors and readable typography',
  status: 'published',
  is_default: true,
  source: 'manual'
};
```

### Sample Tokens
```javascript
const sampleTokens = [
  // Colors
  { name: 'Primary', path: 'color/primary', category: 'color', type: 'color', 
    value: { hex: '#3B82F6', rgb: {r:59,g:130,b:246}, opacity: 1 },
    css_variable: '--color-primary' },
  { name: 'Primary Hover', path: 'color/primary-hover', category: 'color', type: 'color',
    value: { hex: '#2563EB', rgb: {r:37,g:99,b:235}, opacity: 1 },
    css_variable: '--color-primary-hover' },
  { name: 'Secondary', path: 'color/secondary', category: 'color', type: 'color',
    value: { hex: '#64748B', rgb: {r:100,g:116,b:139}, opacity: 1 },
    css_variable: '--color-secondary' },
  { name: 'Background', path: 'color/background', category: 'color', type: 'color',
    value: { hex: '#FFFFFF', rgb: {r:255,g:255,b:255}, opacity: 1 },
    css_variable: '--color-background' },
  { name: 'Foreground', path: 'color/foreground', category: 'color', type: 'color',
    value: { hex: '#0F172A', rgb: {r:15,g:23,b:42}, opacity: 1 },
    css_variable: '--color-foreground' },
  { name: 'Muted', path: 'color/muted', category: 'color', type: 'color',
    value: { hex: '#F1F5F9', rgb: {r:241,g:245,b:249}, opacity: 1 },
    css_variable: '--color-muted' },
  { name: 'Success', path: 'color/success', category: 'color', type: 'color',
    value: { hex: '#22C55E', rgb: {r:34,g:197,b:94}, opacity: 1 },
    css_variable: '--color-success' },
  { name: 'Error', path: 'color/error', category: 'color', type: 'color',
    value: { hex: '#EF4444', rgb: {r:239,g:68,b:68}, opacity: 1 },
    css_variable: '--color-error' },
  
  // Typography
  { name: 'Font Size XS', path: 'typography/size/xs', category: 'typography', type: 'dimension',
    value: { value: 12, unit: 'px' }, css_variable: '--font-size-xs' },
  { name: 'Font Size SM', path: 'typography/size/sm', category: 'typography', type: 'dimension',
    value: { value: 14, unit: 'px' }, css_variable: '--font-size-sm' },
  { name: 'Font Size Base', path: 'typography/size/base', category: 'typography', type: 'dimension',
    value: { value: 16, unit: 'px' }, css_variable: '--font-size-base' },
  { name: 'Font Size LG', path: 'typography/size/lg', category: 'typography', type: 'dimension',
    value: { value: 18, unit: 'px' }, css_variable: '--font-size-lg' },
  { name: 'Font Size XL', path: 'typography/size/xl', category: 'typography', type: 'dimension',
    value: { value: 24, unit: 'px' }, css_variable: '--font-size-xl' },
  
  // Spacing
  { name: 'Space XS', path: 'spacing/xs', category: 'spacing', type: 'dimension',
    value: { value: 4, unit: 'px' }, css_variable: '--space-xs' },
  { name: 'Space SM', path: 'spacing/sm', category: 'spacing', type: 'dimension',
    value: { value: 8, unit: 'px' }, css_variable: '--space-sm' },
  { name: 'Space MD', path: 'spacing/md', category: 'spacing', type: 'dimension',
    value: { value: 16, unit: 'px' }, css_variable: '--space-md' },
  { name: 'Space LG', path: 'spacing/lg', category: 'spacing', type: 'dimension',
    value: { value: 24, unit: 'px' }, css_variable: '--space-lg' },
  { name: 'Space XL', path: 'spacing/xl', category: 'spacing', type: 'dimension',
    value: { value: 32, unit: 'px' }, css_variable: '--space-xl' },
  
  // Shadows
  { name: 'Shadow SM', path: 'shadow/sm', category: 'shadow', type: 'shadow',
    value: { shadows: [{ x: 0, y: 1, blur: 2, spread: 0, color: 'rgba(0,0,0,0.05)' }] },
    css_variable: '--shadow-sm' },
  { name: 'Shadow MD', path: 'shadow/md', category: 'shadow', type: 'shadow',
    value: { shadows: [{ x: 0, y: 4, blur: 6, spread: -1, color: 'rgba(0,0,0,0.1)' }] },
    css_variable: '--shadow-md' },
  { name: 'Shadow LG', path: 'shadow/lg', category: 'shadow', type: 'shadow',
    value: { shadows: [
      { x: 0, y: 10, blur: 15, spread: -3, color: 'rgba(0,0,0,0.1)' },
      { x: 0, y: 4, blur: 6, spread: -2, color: 'rgba(0,0,0,0.05)' }
    ]},
    css_variable: '--shadow-lg' },
  
  // Radius
  { name: 'Radius None', path: 'radius/none', category: 'radius', type: 'dimension',
    value: { value: 0, unit: 'px' }, css_variable: '--radius-none' },
  { name: 'Radius SM', path: 'radius/sm', category: 'radius', type: 'dimension',
    value: { value: 4, unit: 'px' }, css_variable: '--radius-sm' },
  { name: 'Radius MD', path: 'radius/md', category: 'radius', type: 'dimension',
    value: { value: 8, unit: 'px' }, css_variable: '--radius-md' },
  { name: 'Radius LG', path: 'radius/lg', category: 'radius', type: 'dimension',
    value: { value: 12, unit: 'px' }, css_variable: '--radius-lg' },
  { name: 'Radius Full', path: 'radius/full', category: 'radius', type: 'dimension',
    value: { value: 9999, unit: 'px' }, css_variable: '--radius-full' },
];
```

### Sample Component
```javascript
const sampleComponent = {
  name: 'Button',
  slug: 'button',
  description: 'Primary action button with multiple variants',
  category: 'buttons',
  status: 'published',
  code: `export default function Button({ 
  children, 
  variant = 'primary',
  size = 'md',
  disabled = false,
  ...props 
}) {
  return (
    <button 
      className={\`btn btn-\${variant} btn-\${size}\`}
      disabled={disabled}
      style={{
        backgroundColor: variant === 'primary' ? 'var(--color-primary)' : 'transparent',
        color: variant === 'primary' ? 'white' : 'var(--color-foreground)',
        borderRadius: 'var(--radius-md)',
        padding: size === 'sm' ? 'var(--space-xs) var(--space-sm)' : 'var(--space-sm) var(--space-md)',
        border: variant === 'secondary' ? '1px solid var(--color-secondary)' : 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1
      }}
      {...props}
    >
      {children}
    </button>
  );
}`,
  props: [
    { name: 'variant', type: 'enum', options: ['primary', 'secondary', 'ghost'], default: 'primary', description: 'Visual style variant' },
    { name: 'size', type: 'enum', options: ['sm', 'md', 'lg'], default: 'md', description: 'Button size' },
    { name: 'disabled', type: 'boolean', default: false, description: 'Disable button interaction' }
  ],
  linked_tokens: ['color/primary', 'color/secondary', 'color/foreground', 'radius/md', 'spacing/xs', 'spacing/sm', 'spacing/md']
};
```

---

## Files Created
- `supabase/seed.sql` — SQL seed file
- `scripts/seed.js` — Node.js seed script (alternative)

---

## Tests

### Verification
- [ ] Running seed creates expected data
- [ ] Default theme appears in queries
- [ ] Sample component appears in queries
- [ ] Can be re-run safely (idempotent)
- [ ] Token values match design spec

---

## Time Estimate
2 hours

---

## Notes
Seed data should be representative of real-world usage. Include enough tokens to test all categories but not so many that it becomes unwieldy.
