# Chunk 2.27 — Preview Components

## Purpose
Sample UI components that demonstrate theme tokens in action.

---

## Inputs
- CSS variables from ThemeContext

## Outputs
- PreviewTypography, PreviewColors, PreviewButtons, PreviewCard, PreviewForm

---

## Dependencies
- Chunk 2.26 must be complete

---

## Implementation Notes

### PreviewTypography
```jsx
// src/components/themes/preview/PreviewTypography.jsx
export default function PreviewTypography() {
  return (
    <div className="preview-typography">
      <div style={{ 
        fontFamily: 'var(--font-display, inherit)',
        fontSize: 'var(--font-size-display, 3rem)',
        fontWeight: 'var(--font-weight-bold, 700)',
        lineHeight: 1.1,
        marginBottom: '1rem'
      }}>
        Display Heading
      </div>
      
      <h2 style={{ 
        fontFamily: 'var(--font-display, inherit)',
        fontSize: 'var(--font-size-heading-lg, 1.875rem)',
        marginBottom: '0.75rem'
      }}>
        Large Heading
      </h2>
      
      <h3 style={{ 
        fontFamily: 'var(--font-display, inherit)',
        fontSize: 'var(--font-size-heading-md, 1.5rem)',
        marginBottom: '0.75rem'
      }}>
        Medium Heading
      </h3>
      
      <p style={{ 
        fontFamily: 'var(--font-text, inherit)',
        fontSize: 'var(--font-size-body-md, 1rem)',
        lineHeight: 'var(--line-height-body, 1.6)',
        marginBottom: '0.75rem',
        maxWidth: '60ch'
      }}>
        This is body text demonstrating the default font size, line height, 
        and letter spacing. It should be comfortable to read in longer paragraphs 
        with proper rhythm and spacing.
      </p>
      
      <p style={{ 
        fontFamily: 'var(--font-text, inherit)',
        fontSize: 'var(--font-size-body-sm, 0.875rem)',
        color: 'var(--color-muted-foreground, #64748b)',
        marginBottom: '0.75rem'
      }}>
        This is smaller secondary text for captions and hints.
      </p>
      
      <code style={{ 
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: 'var(--font-size-mono, 0.875rem)',
        backgroundColor: 'var(--color-muted, #f1f5f9)',
        padding: '0.25rem 0.5rem',
        borderRadius: 'var(--radius-sm, 4px)'
      }}>
        const code = 'monospace font';
      </code>
    </div>
  );
}
```

### PreviewColors
```jsx
// src/components/themes/preview/PreviewColors.jsx
import { useThemeContext } from '../../../contexts/ThemeContext';

export default function PreviewColors() {
  const { tokens } = useThemeContext();
  const colorTokens = tokens.color || [];

  return (
    <div className="preview-colors">
      <div className="color-grid">
        {colorTokens.slice(0, 12).map(token => (
          <div key={token.id} className="color-swatch-labeled">
            <div 
              className="swatch"
              style={{ backgroundColor: `var(${token.css_variable})` }}
            />
            <span className="label">{token.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### PreviewButtons
```jsx
// src/components/themes/preview/PreviewButtons.jsx
export default function PreviewButtons() {
  return (
    <div className="preview-buttons" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      <button style={{
        backgroundColor: 'var(--color-primary, #3b82f6)',
        color: 'white',
        borderRadius: 'var(--radius-md, 8px)',
        padding: 'var(--space-sm, 8px) var(--space-md, 16px)',
        border: 'none',
        fontWeight: 500,
        cursor: 'pointer'
      }}>
        Primary Button
      </button>
      
      <button style={{
        backgroundColor: 'var(--color-secondary, #64748b)',
        color: 'white',
        borderRadius: 'var(--radius-md, 8px)',
        padding: 'var(--space-sm, 8px) var(--space-md, 16px)',
        border: 'none',
        fontWeight: 500,
        cursor: 'pointer'
      }}>
        Secondary
      </button>
      
      <button style={{
        backgroundColor: 'transparent',
        color: 'var(--color-primary, #3b82f6)',
        borderRadius: 'var(--radius-md, 8px)',
        padding: 'var(--space-sm, 8px) var(--space-md, 16px)',
        border: '1px solid var(--color-border, #e2e8f0)',
        fontWeight: 500,
        cursor: 'pointer'
      }}>
        Ghost
      </button>
    </div>
  );
}
```

### PreviewCard
```jsx
// src/components/themes/preview/PreviewCard.jsx
export default function PreviewCard() {
  return (
    <div style={{
      backgroundColor: 'var(--color-card, white)',
      borderRadius: 'var(--radius-lg, 12px)',
      boxShadow: 'var(--shadow-md, 0 4px 6px -1px rgba(0,0,0,0.1))',
      padding: 'var(--space-lg, 24px)',
      maxWidth: '320px'
    }}>
      <h4 style={{ 
        marginBottom: 'var(--space-sm, 8px)',
        fontWeight: 600 
      }}>
        Card Title
      </h4>
      <p style={{ 
        color: 'var(--color-muted-foreground, #64748b)', 
        marginBottom: 'var(--space-md, 16px)',
        fontSize: 'var(--font-size-body-sm, 0.875rem)'
      }}>
        This card shows how shadows, colors, and spacing work together.
      </p>
      <button style={{
        backgroundColor: 'var(--color-primary, #3b82f6)',
        color: 'white',
        borderRadius: 'var(--radius-md, 8px)',
        padding: 'var(--space-xs, 4px) var(--space-sm, 8px)',
        border: 'none',
        fontSize: 'var(--font-size-body-sm, 0.875rem)',
        cursor: 'pointer'
      }}>
        Action
      </button>
    </div>
  );
}
```

### PreviewForm
```jsx
// src/components/themes/preview/PreviewForm.jsx
export default function PreviewForm() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md, 16px)', maxWidth: '320px' }}>
      <div>
        <label style={{ 
          display: 'block', 
          marginBottom: 'var(--space-xs, 4px)',
          fontSize: 'var(--font-size-label, 0.875rem)',
          fontWeight: 500
        }}>
          Email Address
        </label>
        <input 
          type="email" 
          placeholder="you@example.com"
          style={{
            width: '100%',
            padding: 'var(--space-sm, 8px)',
            borderRadius: 'var(--radius-md, 8px)',
            border: '1px solid var(--color-border, #e2e8f0)',
            backgroundColor: 'var(--color-input, white)',
            fontSize: 'var(--font-size-body-md, 1rem)'
          }}
        />
      </div>
      <div>
        <label style={{ 
          display: 'block', 
          marginBottom: 'var(--space-xs, 4px)',
          fontSize: 'var(--font-size-label, 0.875rem)',
          fontWeight: 500
        }}>
          Password
        </label>
        <input 
          type="password"
          placeholder="••••••••"
          style={{
            width: '100%',
            padding: 'var(--space-sm, 8px)',
            borderRadius: 'var(--radius-md, 8px)',
            border: '1px solid var(--color-border, #e2e8f0)',
            backgroundColor: 'var(--color-input, white)',
            fontSize: 'var(--font-size-body-md, 1rem)'
          }}
        />
      </div>
    </div>
  );
}
```

---

## Files Created
- `src/components/themes/preview/PreviewTypography.jsx`
- `src/components/themes/preview/PreviewColors.jsx`
- `src/components/themes/preview/PreviewButtons.jsx`
- `src/components/themes/preview/PreviewCard.jsx`
- `src/components/themes/preview/PreviewForm.jsx`

---

## Tests

### Unit Tests
- [ ] All components render without error
- [ ] CSS variables applied correctly
- [ ] Fallback values work when variables missing
- [ ] Updates immediately when tokens change

---

## Time Estimate
3 hours

---

## Notes
Preview components use inline styles with CSS variables for immediate feedback. Fallback values ensure components render even if some tokens are missing.
