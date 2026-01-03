/**
 * @chunk 2.27 - Preview Components
 * 
 * Color preview section showing color swatches from theme tokens.
 */

import { useThemeContext } from '../../../contexts/ThemeContext';

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
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

/**
 * Group colors by their path/category
 */
function groupColors(tokens) {
  const groups = {};
  
  tokens.forEach(token => {
    // Extract group from path or name
    const pathParts = token.path?.split('/') || token.name.split('/');
    const groupName = pathParts[0] || 'Colors';
    
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
export default function PreviewColors() {
  const { tokens } = useThemeContext();
  
  const colorTokens = tokens.color || [];
  
  if (colorTokens.length === 0) {
    return (
      <div className="preview-colors-empty">
        <p>No color tokens defined</p>
      </div>
    );
  }

  const groupedColors = groupColors(colorTokens);
  const groupNames = Object.keys(groupedColors);

  return (
    <div className="preview-colors-container">
      {groupNames.map(groupName => (
        <div key={groupName} className="preview-color-group">
          <span className="preview-color-group-label">{groupName}</span>
          <div className="preview-color-swatches">
            {groupedColors[groupName].slice(0, 12).map(token => {
              const colorValue = getColorValue(token);
              const isLight = isLightColor(colorValue);
              
              return (
                <div 
                  key={token.id} 
                  className="preview-color-swatch-item"
                  title={`${token.name}: ${colorValue}`}
                >
                  <div 
                    className="preview-color-swatch-box"
                    style={{ 
                      backgroundColor: colorValue,
                      color: isLight ? '#000' : '#fff',
                    }}
                  >
                    <span className="preview-color-hex">{colorValue}</span>
                  </div>
                  <span className="preview-color-name">{token.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Color combinations preview */}
      <div className="preview-color-combinations">
        <span className="preview-color-group-label">Combinations</span>
        <div className="preview-combinations-grid">
          <div 
            className="preview-combination-card"
            style={{
              backgroundColor: 'var(--color-background, #ffffff)',
              color: 'var(--color-foreground, #1a1a1a)',
              borderColor: 'var(--color-border, #e5e7eb)',
            }}
          >
            <span className="combination-label">Primary on Background</span>
            <span 
              className="combination-accent"
              style={{ color: 'var(--color-primary, #3b82f6)' }}
            >
              Accent Text
            </span>
          </div>
          
          <div 
            className="preview-combination-card preview-combination-inverted"
            style={{
              backgroundColor: 'var(--color-primary, #3b82f6)',
              color: 'var(--color-primary-foreground, #ffffff)',
            }}
          >
            <span className="combination-label">Text on Primary</span>
            <span className="combination-accent">Inverted</span>
          </div>

          <div 
            className="preview-combination-card"
            style={{
              backgroundColor: 'var(--color-muted, #f5f5f5)',
              color: 'var(--color-muted-foreground, #6b7280)',
            }}
          >
            <span className="combination-label">Muted Text</span>
            <span className="combination-accent">Secondary</span>
          </div>
        </div>
      </div>
    </div>
  );
}

