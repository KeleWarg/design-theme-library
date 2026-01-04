/**
 * @chunk 2.06 - CSS Variable Debugger
 * 
 * Development tool for inspecting CSS variables injected by ThemeContext.
 * Only renders in development mode (import.meta.env.DEV).
 */

import { useState, useMemo } from 'react';
import { useThemeContext } from '../../contexts/ThemeContext';
import '../../styles/css-debugger.css';

/**
 * CSS Variable Debugger Component
 * Displays all CSS variables from the active theme with search and filtering
 */
export function CssVariableDebugger() {
  const { cssVariables, activeTheme, fontsLoaded, isLoading } = useThemeContext();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [copiedVar, setCopiedVar] = useState(null);

  // Only show in development
  if (import.meta.env.PROD) return null;

  const variableEntries = useMemo(() => {
    return Object.entries(cssVariables || {});
  }, [cssVariables]);

  const categories = useMemo(() => {
    const cats = new Set(['all']);
    variableEntries.forEach(([key]) => {
      const cat = inferCategory(key);
      if (cat) cats.add(cat);
    });
    return Array.from(cats);
  }, [variableEntries]);

  const filteredVars = useMemo(() => {
    return variableEntries.filter(([key]) => {
      const matchesSearch = key.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || inferCategory(key) === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [variableEntries, search, categoryFilter]);

  const handleCopy = async (varName, value) => {
    const textToCopy = `var(${varName})`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedVar(varName);
      setTimeout(() => setCopiedVar(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const totalCount = variableEntries.length;

  return (
    <div className="css-debugger">
      <button 
        className="debugger-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Toggle CSS Variable Debugger"
      >
        <span className="debugger-icon">🎨</span>
        <span className="debugger-count">{totalCount}</span>
        {isLoading && <span className="debugger-loading">⏳</span>}
      </button>
      
      {isOpen && (
        <div className="debugger-panel">
          <div className="debugger-header">
            <div className="debugger-title-row">
              <h4 className="debugger-title">
                {activeTheme?.name || 'No theme'}
              </h4>
              <div className="debugger-status">
                {fontsLoaded && <span className="status-badge status-fonts">Fonts ✓</span>}
                <span className="status-badge status-vars">{totalCount} vars</span>
              </div>
            </div>
            
            <input
              type="text"
              className="debugger-search"
              placeholder="Search variables..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            
            <div className="debugger-filters">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`filter-btn ${categoryFilter === cat ? 'active' : ''}`}
                  onClick={() => setCategoryFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          
          <div className="variable-list">
            {filteredVars.length === 0 ? (
              <div className="empty-state">
                {search || categoryFilter !== 'all' 
                  ? 'No matching variables' 
                  : 'No CSS variables defined'}
              </div>
            ) : (
              filteredVars.map(([key, value]) => (
                <div 
                  key={key} 
                  className="variable-item"
                  onClick={() => handleCopy(key, value)}
                  title="Click to copy var() reference"
                >
                  <code className="var-name">{key}</code>
                  <span className="var-value">
                    <span className="var-value-text">{truncateValue(value)}</span>
                    {isColorValue(key, value) && (
                      <span 
                        className="color-preview" 
                        style={{ backgroundColor: value }}
                      />
                    )}
                    {copiedVar === key && (
                      <span className="copied-indicator">Copied!</span>
                    )}
                  </span>
                </div>
              ))
            )}
          </div>
          
          <div className="debugger-footer">
            <span className="footer-hint">Click variable to copy var() reference</span>
            <button 
              className="close-btn"
              onClick={() => setIsOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Infer category from variable name
 */
function inferCategory(name) {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('color') || lowerName.includes('background') || lowerName.includes('foreground')) {
    return 'color';
  }
  if (lowerName.includes('font') || lowerName.includes('text') || lowerName.includes('line-height')) {
    return 'typography';
  }
  if (lowerName.includes('spacing') || lowerName.includes('gap')) {
    return 'spacing';
  }
  if (lowerName.includes('shadow')) {
    return 'shadow';
  }
  if (lowerName.includes('radius')) {
    return 'radius';
  }
  if (lowerName.includes('grid')) {
    return 'grid';
  }
  
  return 'other';
}

/**
 * Check if value represents a color
 */
function isColorValue(key, value) {
  // Check key name
  if (key.toLowerCase().includes('color') || 
      key.toLowerCase().includes('background') || 
      key.toLowerCase().includes('foreground')) {
    return true;
  }
  
  // Check value format
  if (typeof value === 'string') {
    return value.startsWith('#') || 
           value.startsWith('rgb') || 
           value.startsWith('hsl');
  }
  
  return false;
}

/**
 * Truncate long values for display
 */
function truncateValue(value, maxLength = 30) {
  if (typeof value !== 'string') return String(value);
  if (value.length <= maxLength) return value;
  return value.substring(0, maxLength) + '...';
}

export default CssVariableDebugger;


