/**
 * @chunk 2.27 - Preview Components
 * 
 * Typography preview section showing text samples at different sizes.
 */

import { useThemeContext } from '../../../contexts/ThemeContext';

/**
 * Preview typography samples with theme fonts applied
 */
export default function PreviewTypography() {
  const { tokens } = useThemeContext();
  
  // Get typography tokens for display
  const typographyTokens = tokens.typography || [];
  const fontSizeTokens = typographyTokens.filter(t => 
    t.name.toLowerCase().includes('size') || t.path?.includes('size')
  );

  return (
    <div className="preview-typography-samples">
      {/* Heading samples */}
      <div className="preview-typography-item">
        <span className="preview-type-label">Display</span>
        <h1 
          className="preview-type-text preview-display"
          style={{ 
            fontSize: 'var(--font-size-display, 48px)',
            fontWeight: 'var(--font-weight-bold, 700)',
            lineHeight: 'var(--line-height-tight, 1.1)',
          }}
        >
          Design System
        </h1>
      </div>

      <div className="preview-typography-item">
        <span className="preview-type-label">Heading 1</span>
        <h2 
          className="preview-type-text preview-h1"
          style={{ 
            fontSize: 'var(--font-size-3xl, 32px)',
            fontWeight: 'var(--font-weight-bold, 700)',
            lineHeight: 'var(--line-height-tight, 1.2)',
          }}
        >
          The quick brown fox
        </h2>
      </div>

      <div className="preview-typography-item">
        <span className="preview-type-label">Heading 2</span>
        <h3 
          className="preview-type-text preview-h2"
          style={{ 
            fontSize: 'var(--font-size-2xl, 24px)',
            fontWeight: 'var(--font-weight-semibold, 600)',
            lineHeight: 'var(--line-height-snug, 1.3)',
          }}
        >
          Jumps over the lazy dog
        </h3>
      </div>

      <div className="preview-typography-item">
        <span className="preview-type-label">Heading 3</span>
        <h4 
          className="preview-type-text preview-h3"
          style={{ 
            fontSize: 'var(--font-size-xl, 20px)',
            fontWeight: 'var(--font-weight-semibold, 600)',
            lineHeight: 'var(--line-height-snug, 1.4)',
          }}
        >
          Typography preview heading
        </h4>
      </div>

      {/* Body text samples */}
      <div className="preview-typography-item">
        <span className="preview-type-label">Body Large</span>
        <p 
          className="preview-type-text preview-body-lg"
          style={{ 
            fontSize: 'var(--font-size-lg, 18px)',
            fontWeight: 'var(--font-weight-normal, 400)',
            lineHeight: 'var(--line-height-normal, 1.6)',
          }}
        >
          This is larger body text, perfect for introductions or emphasized content that needs to stand out from the rest.
        </p>
      </div>

      <div className="preview-typography-item">
        <span className="preview-type-label">Body</span>
        <p 
          className="preview-type-text preview-body"
          style={{ 
            fontSize: 'var(--font-size-base, 16px)',
            fontWeight: 'var(--font-weight-normal, 400)',
            lineHeight: 'var(--line-height-relaxed, 1.625)',
          }}
        >
          The standard body text used throughout the interface. It should be highly readable and comfortable for long-form content. Typography is the art and technique of arranging type to make written language legible, readable, and appealing.
        </p>
      </div>

      <div className="preview-typography-item">
        <span className="preview-type-label">Small</span>
        <p 
          className="preview-type-text preview-small"
          style={{ 
            fontSize: 'var(--font-size-sm, 14px)',
            fontWeight: 'var(--font-weight-normal, 400)',
            lineHeight: 'var(--line-height-normal, 1.5)',
            color: 'var(--color-muted-foreground)',
          }}
        >
          Smaller text for captions, metadata, and secondary information.
        </p>
      </div>

      <div className="preview-typography-item">
        <span className="preview-type-label">Extra Small</span>
        <p 
          className="preview-type-text preview-xs"
          style={{ 
            fontSize: 'var(--font-size-xs, 12px)',
            fontWeight: 'var(--font-weight-normal, 400)',
            lineHeight: 'var(--line-height-normal, 1.5)',
            color: 'var(--color-muted-foreground)',
          }}
        >
          Extra small text for labels, timestamps, and fine print.
        </p>
      </div>

      {/* Font weights */}
      <div className="preview-typography-weights">
        <span className="preview-type-label">Font Weights</span>
        <div className="preview-weights-grid">
          <span style={{ fontWeight: 'var(--font-weight-light, 300)' }}>Light 300</span>
          <span style={{ fontWeight: 'var(--font-weight-normal, 400)' }}>Regular 400</span>
          <span style={{ fontWeight: 'var(--font-weight-medium, 500)' }}>Medium 500</span>
          <span style={{ fontWeight: 'var(--font-weight-semibold, 600)' }}>Semibold 600</span>
          <span style={{ fontWeight: 'var(--font-weight-bold, 700)' }}>Bold 700</span>
        </div>
      </div>
    </div>
  );
}

