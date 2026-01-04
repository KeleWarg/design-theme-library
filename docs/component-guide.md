# Component Guide

## Overview

Components are reusable React components that use your design tokens. They can be created manually, generated with AI, or imported from Figma.

## Creating Components

### Manual Creation

1. Navigate to **Components** page
2. Click **Add Component** > **Create Manually**
3. **Basic Info**: Name, category, description
4. **Props**: Define component props with types
5. **Variants**: Create named variations
6. **Token Linking**: Connect to design tokens
7. **Code**: Write or paste component code
8. **Examples**: Add usage examples
9. **Publish**: Mark as published when ready

### AI Generation

Describe your component in natural language:
- "A button with primary and secondary variants"
- "A card component with image, title, and description"
- "An input field with label, error state, and helper text"

The AI will generate code using your design tokens.

**Requirements:**
- Claude API key configured (Settings page)
- At least one theme with tokens
- Clear component description

**Tips for Better AI Generation:**
- Be specific about variants and states
- Mention required props
- Describe the visual style
- Reference token categories you want to use

### From Figma

1. Install the [Figma plugin](./figma-plugin.md)
2. Select components in Figma
3. Click **Export to Admin Tool**
4. Review component structure
5. Confirm import

## Component Structure

### Recommended Structure

```jsx
import { cn } from '@/lib/utils';

export default function Button({ 
  variant = 'primary',
  size = 'md',
  children,
  disabled = false,
  loading = false,
  ...props 
}) {
  return (
    <button 
      className={cn('button', `button-${variant}`, `button-${size}`)}
      style={{
        backgroundColor: 'var(--color-primary)',
        padding: 'var(--space-sm) var(--space-md)',
        borderRadius: 'var(--radius-md)',
        fontSize: 'var(--font-size-base)',
        fontWeight: 'var(--font-weight-medium)',
      }}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}
```

### Using CSS Variables

**✅ Always use CSS variables:**
```jsx
style={{
  backgroundColor: 'var(--color-primary)',
  padding: 'var(--space-md)',
  borderRadius: 'var(--radius-md)',
}}
```

**❌ Never hardcode values:**
```jsx
style={{
  backgroundColor: '#3B82F6',  // ❌ Hardcoded
  padding: '16px',              // ❌ Hardcoded
  borderRadius: '8px',          // ❌ Hardcoded
}}
```

## Props Best Practices

### Define Props Clearly

```jsx
// Props definition in component wizard
{
  name: 'variant',
  type: 'string',
  required: false,
  defaultValue: 'primary',
  description: 'Visual style variant',
  options: ['primary', 'secondary', 'ghost', 'danger']
}
```

### Use TypeScript Types (Optional)

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}
```

### Provide Sensible Defaults

Always provide default values for optional props:
```jsx
variant = 'primary'
size = 'md'
disabled = false
```

## Variants

Variants are named variations of your component:

### Example: Button Variants

```jsx
// Primary variant
<Button variant="primary">Click me</Button>

// Secondary variant
<Button variant="secondary">Cancel</Button>

// Ghost variant
<Button variant="ghost">Skip</Button>
```

### Creating Variants

1. In the component wizard, go to **Variants** step
2. Click **Add Variant**
3. Name the variant (e.g., "primary", "secondary")
4. Optionally link to different tokens
5. The variant will appear in the preview

## Token Linking

Link component props to design tokens:

### Example: Button Size → Spacing Tokens

```jsx
// Small button
size="sm" → padding: var(--space-xs) var(--space-sm)

// Medium button
size="md" → padding: var(--space-sm) var(--space-md)

// Large button
size="lg" → padding: var(--space-md) var(--space-lg)
```

### Example: Button Variant → Color Tokens

```jsx
// Primary variant
variant="primary" → backgroundColor: var(--color-primary)

// Secondary variant
variant="secondary" → backgroundColor: var(--color-secondary)

// Danger variant
variant="danger" → backgroundColor: var(--color-error)
```

## Examples

Add usage examples to help users understand your component:

### Basic Usage

```jsx
// Example 1: Basic button
<Button>Click me</Button>
```

### With Variants

```jsx
// Example 2: Primary button
<Button variant="primary">Submit</Button>

// Example 3: Secondary button
<Button variant="secondary">Cancel</Button>
```

### With States

```jsx
// Example 4: Disabled state
<Button disabled>Cannot click</Button>

// Example 5: Loading state
<Button loading>Saving...</Button>
```

### In Context

```jsx
// Example 6: Form buttons
<form>
  <Button variant="primary" type="submit">Save</Button>
  <Button variant="secondary" type="button">Cancel</Button>
</form>
```

## Component Status

Components have three statuses:

- **Draft**: Work in progress, not included in exports
- **Published**: Complete, included in all exports
- **Archived**: Hidden from UI, excluded from exports

## Component Categories

Organize components by category:
- **Form**: Inputs, buttons, selects, checkboxes
- **Layout**: Containers, grids, cards
- **Navigation**: Menus, breadcrumbs, pagination
- **Feedback**: Alerts, toasts, modals
- **Data Display**: Tables, lists, badges
- **Other**: Custom components

## Code Editor

The component detail page includes a Monaco code editor:
- Syntax highlighting
- Auto-completion
- Error detection
- Format on save

### Editing Tips

1. Always use CSS variables
2. Keep components simple and focused
3. Use the `cn()` utility for conditional classes
4. Follow React best practices
5. Test in the preview tab

## Preview Tab

The preview tab shows:
- All variants side-by-side
- Interactive props panel
- Real-time updates as you edit code
- Responsive viewport sizes

## Related Documentation

- [Theme Guide](./theme-guide.md) - Understanding design tokens
- [Export Guide](./export-guide.md) - Exporting components
- [Figma Plugin Guide](./figma-plugin.md) - Importing from Figma





