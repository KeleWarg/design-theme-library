/**
 * @chunk 2.18 - ShadowEditor
 * 
 * Editor component for shadow tokens with multiple shadow layers.
 * Features multi-layer support, visual preview, and CSS output.
 */

import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '../../ui';
import ColorInput from '../../ui/ColorInput';
import { cn } from '../../../lib/utils';

/**
 * Default shadow layer
 */
const DEFAULT_SHADOW = {
  x: 0,
  y: 4,
  blur: 6,
  spread: 0,
  color: 'rgba(0,0,0,0.1)'
};

/**
 * Parse token value to extract shadow data
 */
function parseTokenValue(value) {
  if (!value) {
    return { shadows: [{ ...DEFAULT_SHADOW }] };
  }
  
  // Handle object format { shadows: [...] }
  if (typeof value === 'object' && value.shadows) {
    return { shadows: value.shadows.map(s => ({ ...DEFAULT_SHADOW, ...s })) };
  }
  
  // Handle string format (CSS box-shadow)
  if (typeof value === 'string') {
    const shadows = parseCssShadow(value);
    return { shadows: shadows.length > 0 ? shadows : [{ ...DEFAULT_SHADOW }] };
  }
  
  return { shadows: [{ ...DEFAULT_SHADOW }] };
}

/**
 * Parse CSS box-shadow string to shadow objects
 */
function parseCssShadow(cssValue) {
  const shadows = [];
  // Split by comma but not inside rgba()
  const parts = cssValue.split(/,(?![^(]*\))/);
  
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    
    // Extract values (simplified parser)
    const values = trimmed.match(/(-?\d+\.?\d*)px/g);
    const colorMatch = trimmed.match(/(rgba?\([^)]+\)|#[0-9a-fA-F]{3,8})/);
    
    if (values && values.length >= 2) {
      shadows.push({
        x: parseInt(values[0]) || 0,
        y: parseInt(values[1]) || 0,
        blur: parseInt(values[2]) || 0,
        spread: parseInt(values[3]) || 0,
        color: colorMatch ? colorMatch[1] : 'rgba(0,0,0,0.1)'
      });
    }
  }
  
  return shadows;
}

/**
 * Convert shadows array to CSS box-shadow string
 */
function shadowsToCss(shadows) {
  return shadows
    .map(s => `${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${s.color}`)
    .join(', ');
}

/**
 * ShadowEditor component
 * @param {Object} props
 * @param {Object} props.token - Token being edited
 * @param {Function} props.onUpdate - Callback when shadow changes
 */
export default function ShadowEditor({ token, onUpdate }) {
  const [shadows, setShadows] = useState(() => parseTokenValue(token?.value).shadows);
  
  // Reset shadows when token changes
  useEffect(() => {
    setShadows(parseTokenValue(token?.value).shadows);
  }, [token?.id]);
  
  // Save shadows to token
  const handleSave = useCallback(() => {
    onUpdate?.({
      value: { shadows }
    });
  }, [shadows, onUpdate]);
  
  // Update a single shadow layer
  const updateShadow = useCallback((index, updates) => {
    setShadows(prev => {
      const newShadows = [...prev];
      newShadows[index] = { ...newShadows[index], ...updates };
      return newShadows;
    });
  }, []);
  
  // Add new shadow layer
  const addShadow = useCallback(() => {
    setShadows(prev => [...prev, { ...DEFAULT_SHADOW }]);
  }, []);
  
  // Remove shadow layer
  const removeShadow = useCallback((index) => {
    setShadows(prev => prev.filter((_, i) => i !== index));
  }, []);
  
  // Move shadow layer
  const moveShadow = useCallback((fromIndex, toIndex) => {
    setShadows(prev => {
      const newShadows = [...prev];
      const [removed] = newShadows.splice(fromIndex, 1);
      newShadows.splice(toIndex, 0, removed);
      return newShadows;
    });
  }, []);
  
  // Generate CSS output
  const shadowCss = shadowsToCss(shadows);
  
  return (
    <div className="shadow-editor">
      {/* Preview Box */}
      <div className="shadow-preview">
        <div className="shadow-preview-container">
          <div 
            className="shadow-preview-box" 
            style={{ boxShadow: shadowCss }}
          >
            Preview
          </div>
        </div>
      </div>
      
      {/* Shadow Layers */}
      <div className="shadow-layers">
        <div className="shadow-layers-header">
          <span className="shadow-layers-title">Shadow Layers</span>
          <Button 
            variant="ghost" 
            size="small" 
            onClick={addShadow}
            className="add-layer-btn"
          >
            <Plus size={14} />
            Add Layer
          </Button>
        </div>
        
        <div className="shadow-layers-list">
          {shadows.map((shadow, index) => (
            <ShadowLayer
              key={index}
              shadow={shadow}
              index={index}
              onUpdate={(updates) => updateShadow(index, updates)}
              onRemove={() => removeShadow(index)}
              onSave={handleSave}
              canRemove={shadows.length > 1}
              canMoveUp={index > 0}
              canMoveDown={index < shadows.length - 1}
              onMoveUp={() => moveShadow(index, index - 1)}
              onMoveDown={() => moveShadow(index, index + 1)}
            />
          ))}
        </div>
      </div>
      
      {/* CSS Output */}
      <div className="shadow-css-output">
        <label className="shadow-css-label">CSS Output</label>
        <code className="shadow-css-code">
          box-shadow: {shadowCss};
        </code>
      </div>
      
      {/* Token Info */}
      <div className="shadow-editor-footer">
        <div className="token-css-var">
          <span className="label">CSS Variable:</span>
          <code>{token?.css_variable}</code>
        </div>
      </div>
    </div>
  );
}

/**
 * Single shadow layer controls
 */
function ShadowLayer({ 
  shadow, 
  index, 
  onUpdate, 
  onRemove, 
  onSave,
  canRemove,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown
}) {
  const handleNumberChange = (field) => (e) => {
    const value = parseInt(e.target.value) || 0;
    onUpdate({ [field]: value });
  };
  
  const handleColorChange = (color) => {
    onUpdate({ color });
    onSave();
  };
  
  return (
    <div className="shadow-layer">
      <div className="shadow-layer-header">
        <div className="shadow-layer-drag">
          <GripVertical size={14} />
        </div>
        <span className="shadow-layer-title">Layer {index + 1}</span>
        <div className="shadow-layer-actions">
          {(canMoveUp || canMoveDown) && (
            <div className="shadow-layer-move">
              <button 
                type="button"
                className="shadow-move-btn"
                onClick={onMoveUp}
                disabled={!canMoveUp}
                title="Move up"
              >
                ↑
              </button>
              <button 
                type="button"
                className="shadow-move-btn"
                onClick={onMoveDown}
                disabled={!canMoveDown}
                title="Move down"
              >
                ↓
              </button>
            </div>
          )}
          {canRemove && (
            <button 
              type="button"
              className="shadow-remove-btn btn btn-ghost btn-sm"
              onClick={onRemove}
              title="Remove layer"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
      
      <div className="shadow-layer-controls">
        <div className="shadow-control-row">
          <div className="shadow-control-group">
            <label className="shadow-control-label">X Offset</label>
            <input
              type="number"
              value={shadow.x}
              onChange={handleNumberChange('x')}
              onBlur={onSave}
              className="shadow-control-input"
            />
            <span className="shadow-control-unit">px</span>
          </div>
          
          <div className="shadow-control-group">
            <label className="shadow-control-label">Y Offset</label>
            <input
              type="number"
              value={shadow.y}
              onChange={handleNumberChange('y')}
              onBlur={onSave}
              className="shadow-control-input"
            />
            <span className="shadow-control-unit">px</span>
          </div>
        </div>
        
        <div className="shadow-control-row">
          <div className="shadow-control-group">
            <label className="shadow-control-label">Blur</label>
            <input
              type="number"
              min={0}
              value={shadow.blur}
              onChange={handleNumberChange('blur')}
              onBlur={onSave}
              className="shadow-control-input"
            />
            <span className="shadow-control-unit">px</span>
          </div>
          
          <div className="shadow-control-group">
            <label className="shadow-control-label">Spread</label>
            <input
              type="number"
              value={shadow.spread}
              onChange={handleNumberChange('spread')}
              onBlur={onSave}
              className="shadow-control-input"
            />
            <span className="shadow-control-unit">px</span>
          </div>
        </div>
        
        <div className="shadow-control-row shadow-control-color">
          <ColorInput
            label="Color"
            value={shadow.color}
            onChange={handleColorChange}
          />
        </div>
      </div>
    </div>
  );
}


