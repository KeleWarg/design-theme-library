/**
 * @chunk 2.27 - Preview Components
 * 
 * Color preview section showing color swatches from theme tokens.
 * Uses actual token values from the theme prop.
 */

/**
 * Extract color value from token
 */
function getColorValue(token) {
  const { value } = token;
  if (typeof value === 'string') return value;
  if (value?.hex) return value.hex;
  return '#000000';
}

/**
 * Determine if color is light (for contrast)
 */
function isLightColor(hex) {
  if (!hex || typeof hex !== 'string') return true;
  const color = hex.replace('#', '');
  if (color.length !== 6) return true;
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

/**
 * Group colors by their path prefix
 */
function groupColorsByPath(tokens) {
  const groups = {};
  
  tokens.forEach(token => {
    // Extract group from css_variable or path
    let groupName = 'Other';
    
    if (token.css_variable) {
      // Parse css_variable like --button-primary-bg -> button
      // or --foreground-heading -> foreground
      // or --background-white -> background
      const varName = token.css_variable.replace(/^--/, '');
      const parts = varName.split('-');
      if (parts.length > 0) {
        groupName = parts[0];
      }
    } else if (token.path) {
      const pathParts = token.path.split('/');
      groupName = pathParts[0] || 'Other';
    }
    
    // Capitalize first letter
    groupName = groupName.charAt(0).toUpperCase() + groupName.slice(1);
    
    if (!groups[groupName]) {
      groups[groupName] = [];
    }
    groups[groupName].push(token);
  });
  
  return groups;
}

/**
 * Preview color swatches with theme colors applied
 */
export default function PreviewColors({ theme }) {
  const tokens = theme?.tokens || [];
  const colorTokens = tokens.filter(t => t.category === 'color');
  
  if (colorTokens.length === 0) {
    return (
      <div className="preview-colors-empty">
        <p style={{ color: 'var(--foreground-caption, var(--foreground-muted, currentColor))', fontSize: '14px' }}>
          No color tokens defined for this theme.
        </p>
      </div>
    );
  }

  const groupedColors = groupColorsByPath(colorTokens);
  const groupNames = Object.keys(groupedColors).sort();

  return (
    <div className="preview-colors-container">
      {groupNames.map(groupName => {
        const groupTokens = groupedColors[groupName];
        
        return (
          <div key={groupName} className="preview-color-group">
            <span 
              className="preview-color-group-label"
              style={{ 
                fontSize: '11px', 
                color: 'var(--foreground-caption, var(--foreground-muted, currentColor))', 
                textTransform: 'lowercase',
                letterSpacing: '0.02em',
                marginBottom: '8px',
                display: 'block'
              }}
            >
              {groupName.toLowerCase()}
            </span>
            <div 
              className="preview-color-swatches"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                gap: '8px',
              }}
            >
              {groupTokens.map(token => {
                const colorValue = getColorValue(token);
                const isLight = isLightColor(colorValue);
                
                // Extract display name from css_variable or name
                let displayName = token.name;
                if (token.css_variable) {
                  // Convert --button-primary-bg to "Primary Bg"
                  const varName = token.css_variable.replace(/^--/, '');
                  const parts = varName.split('-').slice(1); // Remove first part (group)
                  if (parts.length > 0) {
                    displayName = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
                  }
                }
                
                return (
                  <div 
                    key={token.id} 
                    className="preview-color-swatch-item"
                    title={`${token.name}: ${colorValue}\n${token.css_variable || ''}`}
                    style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
                  >
                    <div 
                      className="preview-color-swatch-box"
                      style={{ 
                        backgroundColor: colorValue,
                        color: isLight ? 'var(--foreground-strong, #000)' : 'var(--foreground-body-inverse, #fff)',
                        height: '48px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontFamily: 'monospace',
                        border: isLight ? '1px solid rgba(0,0,0,0.1)' : 'none',
                      }}
                    >
                      <span className="preview-color-hex">{colorValue}</span>
                    </div>
                    <span 
                      className="preview-color-name"
                      style={{
                        fontSize: '11px',
                        color: 'var(--foreground-caption, var(--foreground-muted, currentColor))',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {displayName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
