/**
 * @chunk 2.27 - Preview Components
 * 
 * Button preview section showing button variants using the theme's
 * actual button color tokens.
 */

/**
 * Extract color value from token
 */
function getColorValue(token) {
  if (!token) return null;
  const { value } = token;
  if (typeof value === 'string') return value;
  if (value?.hex) return value.hex;
  return null;
}

/**
 * Preview button variants with theme styles applied
 */
export default function PreviewButtons({ theme }) {
  const tokens = theme?.tokens || [];
  const colorTokens = tokens.filter(t => t.category === 'color');
  
  // Find button tokens by css_variable name
  const findToken = (cssVar) => colorTokens.find(t => t.css_variable === cssVar);
  
  // Primary button tokens
  const primaryBg = getColorValue(findToken('--button-primary-bg'));
  const primaryText = getColorValue(findToken('--button-primary-text'));
  const primaryHoverBg = getColorValue(findToken('--button-primary-hover-bg'));
  const primaryDisabledBg = getColorValue(findToken('--button-primary-disabled-bg'));
  
  // Secondary button tokens
  const secondaryBg = getColorValue(findToken('--button-secondary-bg'));
  const secondaryText = getColorValue(findToken('--button-secondary-text'));
  const secondaryBorder = getColorValue(findToken('--button-secondary-border'));
  const secondaryHoverBg = getColorValue(findToken('--button-secondary-hover-bg'));
  
  // Ghost button tokens
  const ghostBg = getColorValue(findToken('--button-ghost-bg'));
  const ghostText = getColorValue(findToken('--button-ghost-text'));
  const ghostHoverBg = getColorValue(findToken('--button-ghost-hover-bg'));
  
  // Fallback colors if no button tokens exist
  const hasPrimaryTokens = primaryBg || primaryText;
  const hasSecondaryTokens = secondaryBg || secondaryText || secondaryBorder;
  const hasGhostTokens = ghostText || ghostHoverBg;
  
  // Use theme's general colors as fallbacks
  const fallbackPrimary = getColorValue(findToken('--background-button')) || 
                          getColorValue(findToken('--background-brand')) || 
                          'var(--background-button, var(--background-brand, transparent))';
  const fallbackPrimaryText = 'var(--foreground-on-primary, var(--foreground-body-inverse, currentColor))';
  const fallbackBorder = getColorValue(findToken('--foreground-stroke-default')) || 'var(--foreground-stroke-default, currentColor)';
  const fallbackText = getColorValue(findToken('--foreground-body')) || 'var(--foreground-body, currentColor)';
  
  // Common button styles
  const baseButtonStyle = {
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    fontWeight: 500,
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  };

  // If no button tokens at all, show a message
  if (!hasPrimaryTokens && !hasSecondaryTokens && !hasGhostTokens) {
    return (
      <div className="preview-buttons-container">
        <p style={{ color: 'var(--foreground-caption, var(--foreground-muted, currentColor))', fontSize: '14px', marginBottom: '16px' }}>
          No button-specific tokens found. Showing buttons with theme colors.
        </p>
        
        {/* Show generic buttons using available colors */}
        <div className="preview-button-row" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--foreground-caption, var(--foreground-muted, currentColor))', minWidth: '80px' }}>Primary</span>
            <button style={{ ...baseButtonStyle, backgroundColor: fallbackPrimary, color: fallbackPrimaryText }}>
              Button
            </button>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--foreground-caption, var(--foreground-muted, currentColor))', minWidth: '80px' }}>Secondary</span>
            <button style={{ ...baseButtonStyle, backgroundColor: 'var(--background-white, transparent)', color: fallbackText, border: `1px solid ${fallbackBorder}` }}>
              Button
            </button>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--foreground-caption, var(--foreground-muted, currentColor))', minWidth: '80px' }}>Ghost</span>
            <button style={{ ...baseButtonStyle, backgroundColor: 'transparent', color: fallbackText }}>
              Button
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="preview-buttons-container">
      {/* Primary buttons */}
      {hasPrimaryTokens && (
        <div className="preview-button-row" style={{ marginBottom: '16px' }}>
          <span style={{ fontSize: '13px', color: 'var(--foreground-caption, var(--foreground-muted, currentColor))', display: 'block', marginBottom: '8px' }}>Primary</span>
          <div className="preview-button-variants" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              style={{
                ...baseButtonStyle,
                backgroundColor: primaryBg || fallbackPrimary,
                color: primaryText || fallbackPrimaryText,
              }}
            >
              Primary
            </button>
            {primaryHoverBg && (
              <button 
                style={{
                  ...baseButtonStyle,
                  backgroundColor: primaryHoverBg,
                  color: primaryText || fallbackPrimaryText,
                }}
              >
                Hover
              </button>
            )}
            {primaryDisabledBg && (
              <button 
                disabled
                style={{
                  ...baseButtonStyle,
                  backgroundColor: primaryDisabledBg,
                  color: primaryText || fallbackPrimaryText,
                  opacity: 0.5,
                  cursor: 'not-allowed',
                }}
              >
                Disabled
              </button>
            )}
          </div>
        </div>
      )}

      {/* Secondary buttons */}
      {hasSecondaryTokens && (
        <div className="preview-button-row" style={{ marginBottom: '16px' }}>
          <span style={{ fontSize: '13px', color: 'var(--foreground-caption, var(--foreground-muted, currentColor))', display: 'block', marginBottom: '8px' }}>Secondary</span>
          <div className="preview-button-variants" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              style={{
                ...baseButtonStyle,
                backgroundColor: secondaryBg || 'var(--background-white, transparent)',
                color: secondaryText || fallbackText,
                border: secondaryBorder ? `1px solid ${secondaryBorder}` : `1px solid ${fallbackBorder}`,
              }}
            >
              Secondary
            </button>
            {secondaryHoverBg && (
              <button 
                style={{
                  ...baseButtonStyle,
                  backgroundColor: secondaryHoverBg,
                  color: secondaryText || fallbackText,
                  border: secondaryBorder ? `1px solid ${secondaryBorder}` : `1px solid ${fallbackBorder}`,
                }}
              >
                Hover
              </button>
            )}
          </div>
        </div>
      )}

      {/* Ghost buttons */}
      {hasGhostTokens && (
        <div className="preview-button-row" style={{ marginBottom: '16px' }}>
          <span style={{ fontSize: '13px', color: 'var(--foreground-caption, var(--foreground-muted, currentColor))', display: 'block', marginBottom: '8px' }}>Ghost</span>
          <div className="preview-button-variants" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              style={{
                ...baseButtonStyle,
                backgroundColor: ghostBg || 'transparent',
                color: ghostText || fallbackText,
              }}
            >
              Ghost
            </button>
            {ghostHoverBg && (
              <button 
                style={{
                  ...baseButtonStyle,
                  backgroundColor: ghostHoverBg,
                  color: ghostText || fallbackText,
                }}
              >
                Hover
              </button>
            )}
          </div>
        </div>
      )}

      {/* Button sizes showcase */}
      <div className="preview-button-row">
        <span style={{ fontSize: '13px', color: 'var(--foreground-caption, var(--foreground-muted, currentColor))', display: 'block', marginBottom: '8px' }}>Sizes</span>
        <div className="preview-button-variants preview-button-sizes" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button 
            style={{
              ...baseButtonStyle,
              backgroundColor: primaryBg || fallbackPrimary,
              color: primaryText || fallbackPrimaryText,
              padding: '4px 8px',
              fontSize: '12px',
              borderRadius: '4px',
            }}
          >
            Small
          </button>
          <button 
            style={{
              ...baseButtonStyle,
              backgroundColor: primaryBg || fallbackPrimary,
              color: primaryText || fallbackPrimaryText,
            }}
          >
            Medium
          </button>
          <button 
            style={{
              ...baseButtonStyle,
              backgroundColor: primaryBg || fallbackPrimary,
              color: primaryText || fallbackPrimaryText,
              padding: '12px 24px',
              fontSize: '16px',
              borderRadius: '8px',
            }}
          >
            Large
          </button>
        </div>
      </div>
    </div>
  );
}
