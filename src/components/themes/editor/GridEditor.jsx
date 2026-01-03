/**
 * @chunk 2.20 - GridEditor
 * 
 * Editor component for grid/layout tokens (breakpoints, columns, margins, gutters).
 * Features breakpoint configuration and grid visualization.
 */

import { useState, useEffect, useCallback } from 'react';
import { Input } from '../../ui';
import { cn } from '../../../lib/utils';

/**
 * Default breakpoints based on common responsive design patterns
 */
const DEFAULT_BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280
};

/**
 * Breakpoint labels for display
 */
const BREAKPOINT_LABELS = {
  xs: 'Extra Small',
  sm: 'Small',
  md: 'Medium',
  lg: 'Large',
  xl: 'Extra Large'
};

/**
 * Parse token value to extract grid data
 */
function parseGridValue(value) {
  if (!value) {
    return {
      breakpoints: { ...DEFAULT_BREAKPOINTS },
      columns: 12,
      margin: 16,
      gutter: 24
    };
  }

  // Handle object format
  if (typeof value === 'object') {
    return {
      breakpoints: value.breakpoints || { ...DEFAULT_BREAKPOINTS },
      columns: value.columns ?? 12,
      margin: value.margin ?? 16,
      gutter: value.gutter ?? 24
    };
  }

  return {
    breakpoints: { ...DEFAULT_BREAKPOINTS },
    columns: 12,
    margin: 16,
    gutter: 24
  };
}

/**
 * GridEditor component
 * @param {Object} props
 * @param {Object} props.token - Token being edited
 * @param {Function} props.onUpdate - Callback when grid changes
 */
export default function GridEditor({ token, onUpdate }) {
  const [grid, setGrid] = useState(() => parseGridValue(token?.value));

  // Reset values when token changes
  useEffect(() => {
    setGrid(parseGridValue(token?.value));
  }, [token?.id]);

  // Save grid to token
  const handleSave = useCallback(() => {
    onUpdate?.({ value: grid });
  }, [grid, onUpdate]);

  // Update grid property
  const updateGrid = (updates) => {
    setGrid(prev => ({ ...prev, ...updates }));
  };

  // Update specific breakpoint
  const updateBreakpoint = (key, value) => {
    setGrid(prev => ({
      ...prev,
      breakpoints: { ...prev.breakpoints, [key]: value }
    }));
  };

  // Handle breakpoint input change
  const handleBreakpointChange = (key, e) => {
    const value = parseInt(e.target.value) || 0;
    updateBreakpoint(key, value);
  };

  // Handle columns change
  const handleColumnsChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    const clamped = Math.max(1, Math.min(24, value));
    updateGrid({ columns: clamped });
  };

  // Handle margin change
  const handleMarginChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    updateGrid({ margin: Math.max(0, value) });
  };

  // Handle gutter change
  const handleGutterChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    updateGrid({ gutter: Math.max(0, value) });
  };

  // Reset to defaults
  const handleReset = () => {
    const defaultGrid = {
      breakpoints: { ...DEFAULT_BREAKPOINTS },
      columns: 12,
      margin: 16,
      gutter: 24
    };
    setGrid(defaultGrid);
    onUpdate?.({ value: defaultGrid });
  };

  return (
    <div className="grid-editor">
      {/* Grid Preview */}
      <div className="grid-preview-section">
        <div className="grid-preview-container">
          <div className="grid-preview-margins" style={{ padding: `0 ${grid.margin}px` }}>
            <div 
              className="grid-visualization" 
              style={{ 
                display: 'grid',
                gridTemplateColumns: `repeat(${grid.columns}, 1fr)`,
                gap: `${grid.gutter}px`
              }}
            >
              {Array.from({ length: grid.columns }).map((_, i) => (
                <div key={i} className="grid-column" />
              ))}
            </div>
          </div>
          <div className="grid-margin-indicator grid-margin-left" style={{ width: `${grid.margin}px` }}>
            <span className="grid-margin-label">{grid.margin}px</span>
          </div>
          <div className="grid-margin-indicator grid-margin-right" style={{ width: `${grid.margin}px` }}>
            <span className="grid-margin-label">{grid.margin}px</span>
          </div>
        </div>
        <div className="grid-preview-legend">
          <span className="grid-preview-stat">
            <strong>{grid.columns}</strong> columns
          </span>
          <span className="grid-preview-divider">•</span>
          <span className="grid-preview-stat">
            <strong>{grid.gutter}px</strong> gutter
          </span>
          <span className="grid-preview-divider">•</span>
          <span className="grid-preview-stat">
            <strong>{grid.margin}px</strong> margin
          </span>
        </div>
      </div>

      {/* Grid Settings */}
      <div className="grid-settings">
        <div className="grid-settings-header">
          <h4 className="grid-settings-title">Grid Settings</h4>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleReset}
          >
            Reset to Defaults
          </button>
        </div>
        
        <div className="grid-controls">
          <div className="grid-control-field">
            <Input
              label="Columns"
              type="number"
              min={1}
              max={24}
              value={grid.columns}
              onChange={handleColumnsChange}
              onBlur={handleSave}
            />
            <span className="grid-control-hint">1-24 columns</span>
          </div>
          
          <div className="grid-control-field">
            <Input
              label="Margin"
              type="number"
              min={0}
              value={grid.margin}
              onChange={handleMarginChange}
              onBlur={handleSave}
            />
            <span className="grid-control-hint">Edge spacing (px)</span>
          </div>
          
          <div className="grid-control-field">
            <Input
              label="Gutter"
              type="number"
              min={0}
              value={grid.gutter}
              onChange={handleGutterChange}
              onBlur={handleSave}
            />
            <span className="grid-control-hint">Column gap (px)</span>
          </div>
        </div>
      </div>

      {/* Breakpoints */}
      <div className="grid-breakpoints">
        <div className="grid-breakpoints-header">
          <h4 className="grid-settings-title">Breakpoints</h4>
        </div>
        
        <div className="breakpoint-list">
          {Object.entries(grid.breakpoints).map(([key, value]) => (
            <div key={key} className="breakpoint-row">
              <div className="breakpoint-info">
                <span className="breakpoint-key">{key}</span>
                <span className="breakpoint-label">{BREAKPOINT_LABELS[key]}</span>
              </div>
              <div className="breakpoint-input-group">
                <input
                  type="number"
                  className="breakpoint-input"
                  min={0}
                  value={value}
                  onChange={(e) => handleBreakpointChange(key, e)}
                  onBlur={handleSave}
                />
                <span className="breakpoint-unit">px</span>
              </div>
              <div className="breakpoint-bar-container">
                <div 
                  className={cn('breakpoint-bar', { 'breakpoint-bar-zero': value === 0 })}
                  style={{ width: `${Math.min((value / 1280) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Breakpoint Visualization */}
        <div className="breakpoint-visualization">
          <div className="breakpoint-scale">
            {Object.entries(grid.breakpoints).map(([key, value], index, arr) => {
              const nextValue = arr[index + 1]?.[1] || 1536;
              const widthPercent = ((nextValue - value) / 1536) * 100;
              
              return (
                <div 
                  key={key} 
                  className="breakpoint-segment"
                  style={{ width: `${widthPercent}%` }}
                  title={`${key}: ${value}px - ${nextValue - 1}px`}
                >
                  <span className="breakpoint-segment-label">{key}</span>
                </div>
              );
            })}
          </div>
          <div className="breakpoint-scale-labels">
            <span>0px</span>
            <span>640px</span>
            <span>1024px</span>
            <span>1536px</span>
          </div>
        </div>
      </div>

      {/* Token Info */}
      <div className="grid-editor-footer">
        <div className="token-css-var">
          <span className="label">CSS Variable:</span>
          <code>{token?.css_variable}</code>
        </div>
      </div>
    </div>
  );
}

