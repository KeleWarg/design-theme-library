/**
 * @chunk 2.09 - MappingStep
 * 
 * Token value preview component.
 * Displays a visual preview of the token value based on its type.
 */

import { cn } from '../../../lib/utils';

/**
 * Get the displayable value from a token
 */
function getDisplayValue(token) {
  const { value, type } = token;

  if (value === null || value === undefined) {
    return '—';
  }

  // Color tokens
  if (type === 'color') {
    if (typeof value === 'object') {
      return value.hex || `rgba(${value.rgb?.r || 0}, ${value.rgb?.g || 0}, ${value.rgb?.b || 0}, ${value.opacity ?? 1})`;
    }
    return String(value);
  }

  // Dimension tokens
  if (type === 'dimension') {
    if (typeof value === 'object') {
      return `${value.value}${value.unit || 'px'}`;
    }
    return String(value);
  }

  // Shadow tokens
  if (type === 'shadow') {
    const shadows = Array.isArray(value) ? value : [value];
    return `${shadows.length} shadow${shadows.length > 1 ? 's' : ''}`;
  }

  // Typography tokens
  if (type === 'typography') {
    if (typeof value === 'object') {
      return value.fontFamily || value.fontSize || JSON.stringify(value);
    }
    return String(value);
  }

  // Number tokens
  if (type === 'number') {
    return String(value);
  }

  // String and other tokens
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}

/**
 * Get the hex color from a token value
 */
function getColorHex(value) {
  if (!value) return null;

  if (typeof value === 'string') {
    if (value.startsWith('#')) return value;
    return null;
  }

  if (typeof value === 'object') {
    return value.hex || null;
  }

  return null;
}

export default function TokenPreview({ token }) {
  const { type, value } = token;
  const displayValue = getDisplayValue(token);
  const colorHex = type === 'color' ? getColorHex(value) : null;

  return (
    <div className={cn('token-preview', `token-preview--${type}`)}>
      {colorHex && (
        <span
          className="token-preview__color-swatch"
          style={{ backgroundColor: colorHex }}
          title={colorHex}
        />
      )}
      <span className="token-preview__value" title={displayValue}>
        {displayValue}
      </span>
    </div>
  );
}

