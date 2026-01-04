/**
 * @chunk 2.14 - TokenList
 * 
 * Individual token item in the token list.
 * Displays token preview, name, path, and delete action.
 */

import { MoreHorizontal, Trash2, Copy, Edit3 } from 'lucide-react';
import { DropdownMenu } from '../../ui';
import { cn } from '../../../lib/utils';

/**
 * Get display value for a token based on its type
 */
function getTokenPreview(token) {
  if (!token?.value) return null;
  
  const value = typeof token.value === 'object' 
    ? token.value.hex || token.value.value || JSON.stringify(token.value)
    : token.value;

  // Color tokens show a swatch
  if (token.category === 'color') {
    const colorValue = typeof value === 'string' && (value.startsWith('#') || value.startsWith('rgb') || value.startsWith('hsl'))
      ? value
      : null;
    
    if (colorValue) {
      return (
        <span 
          className="token-color-swatch" 
          style={{ backgroundColor: colorValue }}
          aria-label={`Color: ${colorValue}`}
        />
      );
    }
  }

  // Typography tokens show font info
  if (token.category === 'typography') {
    const fontValue = typeof token.value === 'object' 
      ? token.value.fontFamily || token.value.fontSize
      : value;
    return <span className="token-value-text">{fontValue}</span>;
  }

  // Spacing tokens show the value
  if (token.category === 'spacing') {
    return <span className="token-value-text">{value}</span>;
  }

  // Shadow tokens show a preview box
  if (token.category === 'shadow') {
    return (
      <span 
        className="token-shadow-preview"
        style={{ boxShadow: value }}
      />
    );
  }

  // Radius tokens show a preview box
  if (token.category === 'radius') {
    return (
      <span 
        className="token-radius-preview"
        style={{ borderRadius: value }}
      />
    );
  }

  // Default: show text value
  return <span className="token-value-text">{String(value).slice(0, 20)}</span>;
}

/**
 * Copy text to clipboard
 */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Individual token list item
 * @param {Object} props
 * @param {Object} props.token - Token data
 * @param {boolean} props.isSelected - Whether this token is selected
 * @param {Function} props.onSelect - Selection handler
 * @param {Function} props.onDelete - Delete handler
 */
export default function TokenListItem({ token, isSelected, onSelect, onDelete }) {
  const handleCopyVariable = (e) => {
    e.stopPropagation();
    copyToClipboard(`var(${token.css_variable})`);
  };

  const handleCopyValue = (e) => {
    e.stopPropagation();
    const value = typeof token.value === 'object' 
      ? JSON.stringify(token.value) 
      : String(token.value);
    copyToClipboard(value);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Delete token "${token.name}"? This action cannot be undone.`)) {
      onDelete?.();
    }
  };

  return (
    <li className="token-list-item-wrapper" role="option" aria-selected={isSelected}>
      <button
        className={cn('token-list-item', { selected: isSelected })}
        onClick={onSelect}
        type="button"
      >
        <div className="token-list-item-preview">
          {getTokenPreview(token)}
        </div>
        <div className="token-list-item-info">
          <span className="token-list-item-name">{token.name}</span>
          <span className="token-list-item-path">{token.css_variable}</span>
        </div>
      </button>
      
      <div className="token-list-item-actions">
        <DropdownMenu
          trigger={
            <button 
              className="btn btn-ghost btn-icon btn-sm token-actions-btn"
              aria-label="Token actions"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal size={14} />
            </button>
          }
          align="right"
        >
          <DropdownMenu.Item onClick={handleCopyVariable}>
            <Copy size={14} /> Copy CSS Variable
          </DropdownMenu.Item>
          <DropdownMenu.Item onClick={handleCopyValue}>
            <Copy size={14} /> Copy Value
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item danger onClick={handleDelete}>
            <Trash2 size={14} /> Delete Token
          </DropdownMenu.Item>
        </DropdownMenu>
      </div>
    </li>
  );
}


