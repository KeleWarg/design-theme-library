/**
 * @chunk 2.27 - Preview Components
 * 
 * Typography preview section showing text samples using the theme's
 * actual typography tokens. Dynamically renders based on available tokens.
 * 
 * Font priority:
 * 1. Font-family tokens (if defined)
 * 2. Typefaces (display/text/mono)
 * 3. System fallbacks
 * 
 * Supports composite typography tokens (type: 'typography-composite')
 */

/**
 * Check if a token is a composite typography token
 */
function isCompositeTypographyToken(token) {
  return token.category === 'typography' && 
         token.type === 'typography-composite' &&
         typeof token.value === 'object' &&
         token.value !== null &&
         (token.value.fontFamily !== undefined || 
          token.value.fontSize !== undefined || 
          token.value.fontWeight !== undefined);
}

/**
 * Get composite typography token values for display
 */
function getCompositeValues(token) {
  if (!isCompositeTypographyToken(token)) return null;
  
  const { value } = token;
  return {
    fontFamily: value.fontFamily || null,
    fontSize: formatDimensionValue(value.fontSize),
    fontWeight: value.fontWeight || 400,
    lineHeight: formatLineHeightValue(value.lineHeight),
    letterSpacing: formatLetterSpacingValue(value.letterSpacing),
  };
}

/**
 * Format dimension value for display
 */
function formatDimensionValue(value) {
  if (!value) return '1rem';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return `${value}px`;
  if (typeof value === 'object' && value.value !== undefined) {
    return `${value.value}${value.unit ?? 'rem'}`;
  }
  return '1rem';
}

/**
 * Convert a dimension string/object into a px number for sorting.
 * Best-effort: supports px/rem/em. Unknown units fall back to numeric value.
 */
function dimensionToPx(value) {
  if (value === undefined || value === null) return 0;

  // { value, unit }
  if (typeof value === 'object' && value !== null && value.value !== undefined) {
    const n = Number(value.value);
    if (!Number.isFinite(n)) return 0;
    const unit = String(value.unit ?? 'rem').toLowerCase();
    if (unit === 'px') return n;
    if (unit === 'rem' || unit === 'em') return n * 16;
    return n;
  }

  if (typeof value === 'number') return value;

  const str = String(value).trim();
  const match = str.match(/^(-?\d*\.?\d+)\s*(px|rem|em)?$/i);
  if (!match) return 0;
  const n = Number(match[1]);
  const unit = (match[2] || 'px').toLowerCase();
  if (!Number.isFinite(n)) return 0;
  if (unit === 'px') return n;
  if (unit === 'rem' || unit === 'em') return n * 16;
  return n;
}

/**
 * Format line height value for display
 */
function formatLineHeightValue(value) {
  if (value === undefined || value === null) return 1.5;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value) || 1.5;
  if (typeof value === 'object' && value.value !== undefined) {
    return value.value;
  }
  return 1.5;
}

/**
 * Format letter spacing value for display
 */
function formatLetterSpacingValue(value) {
  if (!value || value === 'normal') return 'normal';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return `${value}em`;
  if (typeof value === 'object' && value.value !== undefined) {
    if (value.isNormal) return 'normal';
    return `${value.value}${value.unit ?? 'em'}`;
  }
  return 'normal';
}

/**
 * Get token value as CSS-compatible string
 */
function getTokenValue(token) {
  if (!token) return null;
  const { value } = token;
  
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (value?.value !== undefined) {
    // Handle {value, unit} format
    if (value.unit === '') return String(value.value);
    if (value.unit) return `${value.value}${value.unit}`;
    // Check if unitless (like line-height which is typically 1.0-3.0)
    const numVal = parseFloat(value.value);
    if (!isNaN(numVal) && numVal > 0 && numVal < 10) {
      return String(value.value);
    }
    return `${value.value}px`;
  }
  return String(value);
}

/**
 * Get font family value from token - handles various value formats
 */
function getFontFamilyValue(token) {
  if (!token) return null;
  const { value } = token;
  
  // String value (direct font name)
  if (typeof value === 'string') return value;
  
  // Array of font names
  if (Array.isArray(value)) {
    return value.map(f => f.includes(' ') ? `"${f}"` : f).join(', ');
  }
  
  // Object with fontFamily property
  if (value?.fontFamily) return value.fontFamily;

  // Object with family property (common in imports)
  if (value?.family) return value.family;
  
  // Object with value property
  if (value?.value) {
    if (typeof value.value === 'string') return value.value;
    if (Array.isArray(value.value)) {
      return value.value.map(f => f.includes(' ') ? `"${f}"` : f).join(', ');
    }
  }
  
  return null;
}

/**
 * Get color value from token
 */
function getColorValue(token) {
  if (!token) return null;
  const { value } = token;
  if (typeof value === 'string') return value;
  if (value?.hex) return value.hex;
  return null;
}

/**
 * Build font-family string for a typeface
 */
function buildFontFamily(typeface) {
  if (!typeface) return null;
  const fontName = typeface.google_font_name || typeface.name || typeface.family;
  if (!fontName) return null;
  const fallback = typeface.fallback_stack || 'sans-serif';
  return `"${fontName}", ${fallback}`;
}

/**
 * Extract display name from token
 */
function getDisplayName(token) {
  if (!token) return '';
  if (token.name) return token.name;
  if (token.css_variable) {
    return token.css_variable
      .replace(/^--/, '')
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  if (token.path) {
    return token.path.split('/').pop() || token.path;
  }
  return 'Unknown';
}

/**
 * Preview typography samples with theme fonts applied
 * Dynamically renders based on available tokens
 */
export default function PreviewTypography({ theme }) {
  const tokens = theme?.tokens || [];
  const typefaces = theme?.typefaces || [];
  
  // Filter typography tokens
  const typographyTokens = tokens.filter(t => t.category === 'typography');
  
  // Separate composite tokens from simple tokens
  const compositeTokens = typographyTokens.filter(isCompositeTypographyToken);
  const simpleTypographyTokens = typographyTokens.filter(t => !isCompositeTypographyToken(t));
  
  // Find font-family tokens FIRST (these take priority)
  const fontFamilyTokens = simpleTypographyTokens.filter(t => 
    t.path?.toLowerCase().includes('family') ||
    t.css_variable?.toLowerCase().includes('family') ||
    t.type === 'fontFamily'
  );
  
  // Group other simple typography tokens by type
  const fontSizes = simpleTypographyTokens.filter(t => 
    (t.path?.toLowerCase().includes('size') || 
     t.css_variable?.toLowerCase().includes('size') ||
     t.type === 'dimension') &&
    !t.path?.toLowerCase().includes('family') &&
    !t.css_variable?.toLowerCase().includes('family')
  );

  // Sort preview scales largest -> smallest for better scanning
  const sortedCompositeTokens = [...compositeTokens].sort((a, b) => {
    const aSize = a?.value?.fontSize;
    const bSize = b?.value?.fontSize;
    return dimensionToPx(bSize) - dimensionToPx(aSize);
  });

  const sortedFontSizes = [...fontSizes].sort((a, b) => {
    return dimensionToPx(b?.value) - dimensionToPx(a?.value);
  });
  
  const fontWeights = simpleTypographyTokens.filter(t => 
    t.path?.toLowerCase().includes('weight') ||
    t.css_variable?.toLowerCase().includes('weight') ||
    t.type === 'fontWeight'
  );
  
  const lineHeights = simpleTypographyTokens.filter(t => 
    t.path?.toLowerCase().includes('height') ||
    t.css_variable?.toLowerCase().includes('height') ||
    t.type === 'lineHeight'
  );
  
  // ============================================
  // FONT RESOLUTION - Tokens take priority over typefaces
  // ============================================
  
  // Try to get fonts from font-family tokens first
  let primaryFont = null;
  let secondaryFont = null;
  let monoFont = 'monospace';
  
  // Look for specific font roles in tokens
  const displayFamilyToken = fontFamilyTokens.find(t => 
    t.css_variable?.toLowerCase().includes('display') ||
    t.path?.toLowerCase().includes('display') ||
    t.name?.toLowerCase().includes('display')
  );
  const headingFamilyToken = fontFamilyTokens.find(t => 
    t.css_variable?.toLowerCase().includes('heading') ||
    t.path?.toLowerCase().includes('heading') ||
    t.name?.toLowerCase().includes('heading')
  );
  const bodyFamilyToken = fontFamilyTokens.find(t => 
    t.css_variable?.toLowerCase().includes('body') ||
    t.css_variable?.toLowerCase().includes('text') ||
    t.path?.toLowerCase().includes('body') ||
    t.path?.toLowerCase().includes('text') ||
    t.name?.toLowerCase().includes('body') ||
    t.name?.toLowerCase().includes('text')
  );
  const monoFamilyToken = fontFamilyTokens.find(t => 
    t.css_variable?.toLowerCase().includes('mono') ||
    t.css_variable?.toLowerCase().includes('code') ||
    t.path?.toLowerCase().includes('mono') ||
    t.path?.toLowerCase().includes('code') ||
    t.name?.toLowerCase().includes('mono') ||
    t.name?.toLowerCase().includes('code')
  );
  
  // Use font-family tokens if available
  if (displayFamilyToken || headingFamilyToken || fontFamilyTokens[0]) {
    const token = displayFamilyToken || headingFamilyToken || fontFamilyTokens[0];
    primaryFont = getFontFamilyValue(token);
  }
  
  if (bodyFamilyToken || fontFamilyTokens[1]) {
    const token = bodyFamilyToken || fontFamilyTokens[1];
    secondaryFont = getFontFamilyValue(token);
  }
  
  if (monoFamilyToken) {
    monoFont = getFontFamilyValue(monoFamilyToken) || 'monospace';
  }
  
  // Fall back to typefaces if no font-family tokens
  const displayTypeface = typefaces.find(t => t.role === 'display');
  const textTypeface = typefaces.find(t => t.role === 'text');
  const monoTypeface = typefaces.find(t => t.role === 'mono');
  
  if (!primaryFont) {
    primaryFont = buildFontFamily(displayTypeface) || buildFontFamily(textTypeface);
  }
  if (!secondaryFont) {
    secondaryFont = buildFontFamily(textTypeface) || buildFontFamily(displayTypeface);
  }
  if (monoFont === 'monospace' && monoTypeface) {
    monoFont = buildFontFamily(monoTypeface) || 'monospace';
  }
  
  // Final fallbacks
  const displayFont = primaryFont || secondaryFont || 'system-ui, sans-serif';
  const textFont = secondaryFont || primaryFont || 'system-ui, sans-serif';
  
  // Find color tokens for text
  const colorTokens = tokens.filter(t => t.category === 'color');
  const findColorToken = (cssVar) => colorTokens.find(t => t.css_variable === cssVar);
  
  const headingColor = getColorValue(findColorToken('--foreground-heading')) || 'var(--foreground-heading, var(--foreground-body, currentColor))';
  const bodyColor = getColorValue(findColorToken('--foreground-body')) || 'var(--foreground-body, currentColor)';
  const captionColor = getColorValue(findColorToken('--foreground-caption')) || 'var(--foreground-caption, var(--foreground-muted, currentColor))';
  
  // Check if we have any typography data
  const hasTypographyTokens = typographyTokens.length > 0;
  const hasCompositeTokens = compositeTokens.length > 0;
  const hasTypefaces = typefaces.length > 0;
  const hasFontFamilyTokens = fontFamilyTokens.length > 0;
  
  if (!hasTypographyTokens && !hasTypefaces) {
    return (
      <div className="preview-typography-empty">
        <p style={{ color: 'var(--foreground-caption, var(--foreground-muted, currentColor))', fontSize: '14px' }}>
          No typography tokens or typefaces defined for this theme.
        </p>
      </div>
    );
  }

  return (
    <div className="preview-typography-samples" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Font Families Section - Show what fonts are being used */}
      {(hasFontFamilyTokens || hasTypefaces) && (
        <div className="preview-typography-section">
          <h5 style={{ 
            fontSize: '11px', 
            color: captionColor, 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em',
            marginBottom: '12px',
            fontWeight: 600
          }}>
            {hasFontFamilyTokens ? 'Font Family Tokens' : 'Typefaces'}
          </h5>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '16px',
            padding: '16px',
            backgroundColor: 'rgba(0,0,0,0.02)',
            borderRadius: '8px'
          }}>
            {/* Show font-family tokens if available */}
            {hasFontFamilyTokens ? (
              fontFamilyTokens.map(token => {
                const familyValue = getFontFamilyValue(token);
                return (
                  <div key={token.id}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'baseline',
                      marginBottom: '4px'
                    }}>
                      <span style={{ fontSize: '12px', color: captionColor }}>
                        {getDisplayName(token)}
                      </span>
                      <code style={{ fontSize: '11px', color: captionColor, fontFamily: 'monospace' }}>
                        {token.css_variable}
                      </code>
                    </div>
                    <p style={{ 
                      fontFamily: familyValue, 
                      fontSize: '20px', 
                      fontWeight: 500,
                      color: headingColor,
                      margin: 0
                    }}>
                      {familyValue} — The quick brown fox jumps over the lazy dog.
                    </p>
                  </div>
                );
              })
            ) : (
              /* Fall back to showing typefaces */
              <>
                {displayTypeface && (
                  <div>
                    <span style={{ fontSize: '12px', color: captionColor }}>Display:</span>
                    <p style={{ 
                      fontFamily: displayFont, 
                      fontSize: '24px', 
                      fontWeight: 700,
                      color: headingColor,
                      margin: '4px 0 0 0'
                    }}>
                      {displayTypeface.name || displayTypeface.google_font_name}
                    </p>
                  </div>
                )}
                {textTypeface && (
                  <div>
                    <span style={{ fontSize: '12px', color: captionColor }}>Text:</span>
                    <p style={{ 
                      fontFamily: textFont, 
                      fontSize: '16px',
                      color: bodyColor,
                      margin: '4px 0 0 0'
                    }}>
                      {textTypeface.name || textTypeface.google_font_name} — The quick brown fox jumps over the lazy dog.
                    </p>
                  </div>
                )}
                {monoTypeface && (
                  <div>
                    <span style={{ fontSize: '12px', color: captionColor }}>Mono:</span>
                    <code style={{ 
                      fontFamily: monoFont, 
                      fontSize: '14px',
                      color: bodyColor,
                      display: 'block',
                      margin: '4px 0 0 0'
                    }}>
                      {monoTypeface.name || monoTypeface.google_font_name} — const code = true;
                    </code>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Composite Typography Tokens Section */}
      {hasCompositeTokens && (
        <div className="preview-typography-section">
          <h5 style={{ 
            fontSize: '11px', 
            color: captionColor, 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em',
            marginBottom: '12px',
            fontWeight: 600
          }}>
            Typography Scale ({compositeTokens.length})
          </h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {sortedCompositeTokens.map(token => {
              const values = getCompositeValues(token);
              if (!values) return null;
              
              const previewStyle = {
                fontFamily: values.fontFamily || displayFont,
                fontSize: values.fontSize,
                fontWeight: values.fontWeight,
                lineHeight: values.lineHeight,
                letterSpacing: values.letterSpacing !== 'normal' ? values.letterSpacing : undefined,
                color: headingColor,
                margin: 0,
              };
              
              return (
                <div key={token.id} className="preview-composite-token">
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'baseline',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: bodyColor }}>
                      {getDisplayName(token)}
                    </span>
                    <code style={{ 
                      fontSize: '11px', 
                      color: captionColor,
                      fontFamily: 'monospace'
                    }}>
                      {token.css_variable}
                    </code>
                  </div>
                  
                  {/* Preview text */}
                  <p style={previewStyle}>
                    The quick brown fox jumps over the lazy dog
                  </p>
                  
                  {/* Token properties */}
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '12px',
                    marginTop: '8px',
                    padding: '8px 12px',
                    backgroundColor: 'rgba(0,0,0,0.03)',
                    borderRadius: '6px',
                    fontSize: '11px',
                    color: captionColor
                  }}>
                    {values.fontFamily && (
                      <span>
                        <strong>Family:</strong> {values.fontFamily}
                      </span>
                    )}
                    <span>
                      <strong>Size:</strong> {values.fontSize}
                    </span>
                    <span>
                      <strong>Weight:</strong> {values.fontWeight}
                    </span>
                    <span>
                      <strong>Line Height:</strong> {values.lineHeight}
                    </span>
                    <span>
                      <strong>Letter Spacing:</strong> {values.letterSpacing}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Font Sizes Section */}
      {fontSizes.length > 0 && (
        <div className="preview-typography-section">
          <h5 style={{ 
            fontSize: '11px', 
            color: captionColor, 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em',
            marginBottom: '12px',
            fontWeight: 600
          }}>
            Font Sizes ({fontSizes.length})
          </h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {sortedFontSizes.map(token => {
              const sizeValue = getTokenValue(token);
              // Check if this token has its own fontFamily in the value
              const tokenFont = token.value?.fontFamily || displayFont;
              return (
                <div key={token.id} className="preview-font-size-item">
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'baseline',
                    marginBottom: '4px'
                  }}>
                    <span style={{ fontSize: '12px', color: captionColor }}>
                      {getDisplayName(token)}
                    </span>
                    <code style={{ 
                      fontSize: '11px', 
                      color: captionColor,
                      fontFamily: 'monospace'
                    }}>
                      {token.css_variable}: {sizeValue}
                    </code>
                  </div>
                  <p style={{ 
                    fontSize: sizeValue,
                    fontFamily: tokenFont,
                    fontWeight: 600,
                    color: headingColor,
                    margin: 0,
                    lineHeight: 1.2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    The quick brown fox
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Font Weights Section */}
      {fontWeights.length > 0 && (
        <div className="preview-typography-section">
          <h5 style={{ 
            fontSize: '11px', 
            color: captionColor, 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em',
            marginBottom: '12px',
            fontWeight: 600
          }}>
            Font Weights ({fontWeights.length})
          </h5>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '16px' 
          }}>
            {fontWeights.map(token => {
              const weightValue = getTokenValue(token);
              return (
                <div key={token.id} style={{ minWidth: '100px' }}>
                  <span style={{ 
                    fontSize: '11px', 
                    color: captionColor,
                    display: 'block',
                    marginBottom: '4px'
                  }}>
                    {getDisplayName(token)}
                  </span>
                  <span style={{ 
                    fontSize: '18px',
                    fontFamily: textFont,
                    fontWeight: weightValue,
                    color: bodyColor
                  }}>
                    Aa {weightValue}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Line Heights Section */}
      {lineHeights.length > 0 && (
        <div className="preview-typography-section">
          <h5 style={{ 
            fontSize: '11px', 
            color: captionColor, 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em',
            marginBottom: '12px',
            fontWeight: 600
          }}>
            Line Heights ({lineHeights.length})
          </h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {lineHeights.map(token => {
              const lineHeightValue = getTokenValue(token);
              return (
                <div key={token.id}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'baseline',
                    marginBottom: '4px'
                  }}>
                    <span style={{ fontSize: '12px', color: captionColor }}>
                      {getDisplayName(token)}
                    </span>
                    <code style={{ 
                      fontSize: '11px', 
                      color: captionColor,
                      fontFamily: 'monospace'
                    }}>
                      {token.css_variable}: {lineHeightValue}
                    </code>
                  </div>
                  <p style={{ 
                    fontSize: '14px',
                    fontFamily: textFont,
                    lineHeight: lineHeightValue,
                    color: bodyColor,
                    margin: 0,
                    padding: '8px',
                    backgroundColor: 'rgba(0,0,0,0.02)',
                    borderRadius: '4px'
                  }}>
                    This paragraph demonstrates line-height: {lineHeightValue}. 
                    Typography is the art and technique of arranging type.
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Show message if only typefaces exist but no tokens */}
      {hasTypefaces && !hasTypographyTokens && (
        <div style={{ 
          padding: '12px',
          backgroundColor: 'rgba(0,0,0,0.02)',
          borderRadius: '8px',
          fontSize: '13px',
          color: captionColor
        }}>
          No typography tokens defined. Add font-size, font-weight, or line-height tokens to see them here.
        </div>
      )}
    </div>
  );
}
