/**
 * @chunk 2.22 - TypefaceForm
 * 
 * Weight selector component for choosing font weights.
 */

import { FONT_WEIGHTS } from '../../../lib/googleFonts';

/**
 * WeightSelector component
 * @param {Object} props
 * @param {Array<number>} props.selected - Currently selected weights
 * @param {Array<number>|null} props.available - Available weights (null = all)
 * @param {function} props.onChange - Callback when selection changes
 * @param {boolean} props.disabled - Whether selector is disabled
 */
export default function WeightSelector({ 
  selected = [400], 
  available = null, 
  onChange,
  disabled = false 
}) {
  const availableWeights = available || FONT_WEIGHTS.map(w => w.value);
  
  const handleToggle = (weight) => {
    if (disabled) return;
    
    const isSelected = selected.includes(weight);
    let newWeights;
    
    if (isSelected) {
      // Don't allow deselecting if it's the only weight
      if (selected.length === 1) return;
      newWeights = selected.filter(w => w !== weight);
    } else {
      newWeights = [...selected, weight].sort((a, b) => a - b);
    }
    
    onChange(newWeights);
  };

  const handleSelectAll = () => {
    if (disabled) return;
    onChange([...availableWeights].sort((a, b) => a - b));
  };

  const handleSelectNone = () => {
    if (disabled) return;
    // Always keep at least one weight (400 or first available)
    const defaultWeight = availableWeights.includes(400) ? 400 : availableWeights[0];
    onChange([defaultWeight]);
  };

  return (
    <div className={`weight-selector ${disabled ? 'weight-selector--disabled' : ''}`}>
      <div className="weight-selector-header">
        <label className="form-label">Font Weights</label>
        <div className="weight-selector-actions">
          <button 
            type="button" 
            className="btn-link" 
            onClick={handleSelectAll}
            disabled={disabled || selected.length === availableWeights.length}
          >
            All
          </button>
          <span className="weight-selector-divider">|</span>
          <button 
            type="button" 
            className="btn-link" 
            onClick={handleSelectNone}
            disabled={disabled || selected.length === 1}
          >
            Reset
          </button>
        </div>
      </div>
      
      <div className="weight-selector-grid">
        {FONT_WEIGHTS.map(({ value, label }) => {
          const isAvailable = availableWeights.includes(value);
          const isSelected = selected.includes(value);
          
          return (
            <button
              key={value}
              type="button"
              className={`weight-chip ${isSelected ? 'weight-chip--selected' : ''} ${!isAvailable ? 'weight-chip--unavailable' : ''}`}
              onClick={() => isAvailable && handleToggle(value)}
              disabled={disabled || !isAvailable}
              title={isAvailable ? label : `${label} not available`}
            >
              <span className="weight-chip-value">{value}</span>
              <span className="weight-chip-label">{label}</span>
            </button>
          );
        })}
      </div>
      
      <p className="weight-selector-hint">
        {selected.length} weight{selected.length !== 1 ? 's' : ''} selected
        {available && ` (${available.length} available)`}
      </p>
    </div>
  );
}

