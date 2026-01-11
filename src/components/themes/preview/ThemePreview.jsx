/**
 * @chunk 2.27 - ThemePreview
 * 
 * Theme-local preview panel that renders with the actual theme's tokens.
 * CSS variables are injected into a scoped container, not globally.
 * 
 * Features:
 * - Collapsible floating panel (bottom-right when collapsed)
 * - Expandable to full modal view
 * - Viewport width controls (mobile/tablet/desktop)
 * - Dark/light mode preview toggle
 * - Multiple preview sections (typography, colors, buttons, cards, forms)
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronUp, Monitor, Tablet, Smartphone, Sun, Moon, Maximize2, Minimize2, X } from 'lucide-react';
import PreviewTypography from './PreviewTypography';
import PreviewColors from './PreviewColors';
import PreviewButtons from './PreviewButtons';
import PreviewCard from './PreviewCard';
import PreviewForm from './PreviewForm';
import { isCompositeTypographyToken, expandCompositeTypographyToken, tokenToCssValue } from '../../../lib/cssVariableInjector';
import '../../../styles/theme-preview.css';

// Viewport width presets
const VIEWPORT_SIZES = {
  mobile: { label: 'Mobile', width: '375px', icon: Smartphone },
  tablet: { label: 'Tablet', width: '768px', icon: Tablet },
  desktop: { label: 'Desktop', width: '100%', icon: Monitor }
};

// Preview states for export
export const PREVIEW_STATES = ['all', 'typography', 'colors', 'buttons', 'card', 'form'];

/**
 * Build font-family string for a typeface
 */
function buildFontFamily(typeface) {
  if (!typeface) return null;

  const familyRaw = typeface.family || typeface.google_font_name || typeface.name;
  if (!familyRaw) return null;

  // If the "family" already looks like a full stack, don't try to re-quote/re-append.
  const trimmed = String(familyRaw).trim();
  if (trimmed.includes(',')) return trimmed;

  const family = trimmed.includes(' ') && !(trimmed.startsWith('"') && trimmed.endsWith('"'))
    ? `"${trimmed}"`
    : trimmed;

  // Different parts of the codebase have used different field names historically.
  const fallback = typeface.fallback || typeface.fallback_stack || 'sans-serif';

  return `${family}, ${fallback}`;
}

export default function ThemePreview({ 
  theme,
  initialCollapsed = false,
  initialViewport = 'desktop',
  showControls = true 
}) {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
  const [isExpanded, setIsExpanded] = useState(false);
  const [viewport, setViewport] = useState(initialViewport);
  const [darkMode, setDarkMode] = useState(false);

  /**
   * Convert theme tokens to CSS variable object for scoped injection
   */
  const scopedCssVariables = useMemo(() => {
    if (!theme?.tokens) return {};
    
    const vars = {};
    
    // Convert all tokens to CSS variables
    theme.tokens.forEach(token => {
      if (token.css_variable) {
        // Composite typography tokens expand into multiple variables
        if (isCompositeTypographyToken(token)) {
          Object.assign(vars, expandCompositeTypographyToken(token));
          return;
        }

        vars[token.css_variable] = tokenToCssValue(token);
      }
    });
    
    // Add typeface font families
    if (theme.typefaces?.length) {
      // Current schema uses `role` (display/text/mono). Older code sometimes used `type`.
      const displayTypeface = theme.typefaces.find(t => (t.role || t.type) === 'display');
      const textTypeface = theme.typefaces.find(t => (t.role || t.type) === 'text');
      const monoTypeface = theme.typefaces.find(t => (t.role || t.type) === 'mono');

      // Only add these if tokens didn't already define them
      if (!vars['--font-family-display'] && displayTypeface) {
        vars['--font-family-display'] = buildFontFamily(displayTypeface);
      }
      if (!vars['--font-family-text'] && textTypeface) {
        vars['--font-family-text'] = buildFontFamily(textTypeface);
      }
      if (!vars['--font-family-mono'] && monoTypeface) {
        vars['--font-family-mono'] = buildFontFamily(monoTypeface);
      }
    }
    
    return vars;
  }, [theme]);

  /**
   * Handle escape key to close expanded view
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };
    
    if (isExpanded) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isExpanded]);

  /**
   * Toggle collapsed state
   */
  const handleToggleCollapse = useCallback(() => {
    if (isExpanded) return;
    setIsCollapsed(prev => !prev);
  }, [isExpanded]);

  /**
   * Toggle expanded modal state
   */
  const handleToggleExpand = useCallback((e) => {
    e.stopPropagation();
    setIsExpanded(prev => !prev);
    if (isCollapsed) {
      setIsCollapsed(false);
    }
  }, [isCollapsed]);

  /**
   * Close expanded view
   */
  const handleCloseExpanded = useCallback(() => {
    setIsExpanded(false);
  }, []);

  /**
   * Handle backdrop click - collapse the preview
   */
  const handleBackdropClick = useCallback(() => {
    if (isExpanded) {
      setIsExpanded(false);
    } else {
      setIsCollapsed(true);
    }
  }, [isExpanded]);

  /**
   * Get viewport max-width style
   */
  const getViewportStyle = () => {
    const size = VIEWPORT_SIZES[viewport];
    return {
      maxWidth: size?.width || '100%'
    };
  };

  /**
   * Build inline style object with all scoped CSS variables
   */
  const viewportStyleWithVars = useMemo(() => {
    const baseStyle = {
      ...getViewportStyle(),
      backgroundColor: darkMode 
        ? 'var(--background-neutral-strong, var(--background-body, inherit))' 
        : 'var(--background-white, var(--background-body, inherit))',
      color: darkMode 
        ? 'var(--foreground-body-inverse, var(--foreground-body, inherit))' 
        : 'var(--foreground-body, inherit)'
    };
    
    // Inject all CSS variables as inline styles (scoped to this container)
    Object.entries(scopedCssVariables).forEach(([key, value]) => {
      baseStyle[key] = value;
    });
    
    return baseStyle;
  }, [scopedCssVariables, darkMode, viewport]);

  /**
   * Render preview sections with theme prop
   */
  const renderPreviewSections = () => (
    <>
      {/* Typography Section */}
      <div className="theme-preview-section">
        <h4 className="theme-preview-section-title">Typography</h4>
        <div className="theme-preview-section-content">
          <PreviewTypography theme={theme} />
        </div>
      </div>

      {/* Colors Section */}
      <div className="theme-preview-section">
        <h4 className="theme-preview-section-title">Colors</h4>
        <div className="theme-preview-section-content">
          <PreviewColors theme={theme} />
        </div>
      </div>

      {/* Buttons Section */}
      <div className="theme-preview-section">
        <h4 className="theme-preview-section-title">Buttons</h4>
        <div className="theme-preview-section-content">
          <PreviewButtons theme={theme} />
        </div>
      </div>

      {/* Card Section */}
      <div className="theme-preview-section">
        <h4 className="theme-preview-section-title">Card</h4>
        <div className="theme-preview-section-content">
          <PreviewCard theme={theme} />
        </div>
      </div>

      {/* Form Section */}
      <div className="theme-preview-section">
        <h4 className="theme-preview-section-title">Form</h4>
        <div className="theme-preview-section-content">
          <PreviewForm theme={theme} />
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Backdrop - shown when preview is open (not collapsed) */}
      {!isCollapsed && (
        <div 
          className="theme-preview-backdrop visible"
          onClick={handleBackdropClick}
          aria-hidden="true"
        />
      )}

      <div className={`theme-preview ${isCollapsed ? 'collapsed' : ''} ${isExpanded ? 'expanded' : ''}`}>
        {/* Header with toggle and controls */}
        <div className="theme-preview-header" onClick={handleToggleCollapse}>
          {/* Collapse/Expand Toggle */}
          <div className="theme-preview-toggle">
            {isCollapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            <span className="theme-preview-title">Preview</span>
            {theme?.name && (
              <span className="theme-preview-theme-name">— {theme.name}</span>
            )}
          </div>

          {/* Header actions - expand/close buttons */}
          <div className="theme-preview-header-actions">
            <button
              className="theme-preview-expand-btn"
              onClick={handleToggleExpand}
              title={isExpanded ? 'Minimize' : 'Expand'}
              aria-label={isExpanded ? 'Minimize preview' : 'Expand preview'}
            >
              {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            {isExpanded && (
              <button
                className="theme-preview-close-btn"
                onClick={handleCloseExpanded}
                title="Close"
                aria-label="Close expanded preview"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Controls - only shown when not collapsed and showControls is true */}
        {showControls && !isCollapsed && (
          <div className="theme-preview-controls">
            {/* Viewport Size Selector */}
            <div className="segmented-control segmented-control-sm">
              {Object.entries(VIEWPORT_SIZES).map(([key, { label, icon: Icon }]) => (
                <button
                  key={key}
                  className={`segmented-option ${viewport === key ? 'selected' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewport(key);
                  }}
                  title={label}
                  aria-label={`${label} viewport`}
                >
                  <Icon size={14} />
                </button>
              ))}
            </div>

            {/* Dark/Light Mode Toggle */}
            <div className="segmented-control segmented-control-sm">
              <button
                className={`segmented-option ${!darkMode ? 'selected' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setDarkMode(false);
                }}
                title="Light mode"
                aria-label="Light mode preview"
              >
                <Sun size={14} />
              </button>
              <button
                className={`segmented-option ${darkMode ? 'selected' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setDarkMode(true);
                }}
                title="Dark mode"
                aria-label="Dark mode preview"
              >
                <Moon size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Body - scrollable preview area */}
        {!isCollapsed && (
          <div className="theme-preview-body">
            {/* Viewport container with scoped CSS variables */}
            <div 
              className="theme-preview-viewport"
              style={viewportStyleWithVars}
            >
              {renderPreviewSections()}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
