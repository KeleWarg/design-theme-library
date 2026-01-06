/**
 * @chunk 2.27 - ThemePreview
 * 
 * Floating expandable theme preview panel with:
 * - Collapsible floating panel (bottom-right)
 * - Expandable to full modal view
 * - Viewport width controls (mobile/tablet/desktop)
 * - Font loading indicator
 * - Dark/light mode preview toggle
 * - Multiple preview sections (typography, colors, buttons, cards, forms)
 */

import { useState, useCallback, useEffect } from 'react';
import { ChevronDown, ChevronUp, Monitor, Tablet, Smartphone, Sun, Moon, Maximize2, Minimize2, X } from 'lucide-react';
import { useThemeContext } from '../../../contexts/ThemeContext';
import PreviewTypography from './PreviewTypography';
import PreviewColors from './PreviewColors';
import PreviewButtons from './PreviewButtons';
import PreviewCard from './PreviewCard';
import PreviewForm from './PreviewForm';
import '../../../styles/theme-preview.css';

// Viewport width presets
const VIEWPORT_SIZES = {
  mobile: { label: 'Mobile', width: '375px', icon: Smartphone },
  tablet: { label: 'Tablet', width: '768px', icon: Tablet },
  desktop: { label: 'Desktop', width: '100%', icon: Monitor }
};

// Preview states for export
export const PREVIEW_STATES = ['all', 'typography', 'colors', 'buttons', 'card', 'form'];

export default function ThemePreview({ 
  theme,
  initialCollapsed = false, // Start open as modal overlay
  initialViewport = 'desktop',
  showControls = true 
}) {
  const { fontsLoaded } = useThemeContext();
  const fontsLoading = !fontsLoaded;
  
  // Theme prop is passed from ThemeEditorPage for live preview
  // The actual tokens are applied via CSS variables by ThemeContext
  
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
  const [isExpanded, setIsExpanded] = useState(false); // Full modal expanded state
  const [viewport, setViewport] = useState(initialViewport);
  const [darkMode, setDarkMode] = useState(false);

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
      // Prevent body scroll when expanded
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
    if (isExpanded) return; // Don't collapse when in expanded mode
    setIsCollapsed(prev => !prev);
  }, [isExpanded]);

  /**
   * Toggle expanded modal state
   */
  const handleToggleExpand = useCallback((e) => {
    e.stopPropagation();
    setIsExpanded(prev => !prev);
    // Uncollapse when expanding
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
   * Toggle dark mode preview
   */
  const handleToggleDarkMode = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

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
   * Render font loading indicator
   */
  const renderFontsLoading = () => {
    if (!fontsLoading) return null;
    
    return (
      <div className="theme-preview-fonts-loading">
        <div className="loading-spinner" />
        <span>Loading fonts...</span>
      </div>
    );
  };

  /**
   * Render preview sections
   */
  const renderPreviewSections = () => (
    <>
      {/* Typography Section */}
      <div className="theme-preview-section">
        <h4 className="theme-preview-section-title">Typography</h4>
        <div className="theme-preview-section-content">
          <PreviewTypography />
        </div>
      </div>

      {/* Colors Section */}
      <div className="theme-preview-section">
        <h4 className="theme-preview-section-title">Colors</h4>
        <div className="theme-preview-section-content">
          <PreviewColors />
        </div>
      </div>

      {/* Buttons Section */}
      <div className="theme-preview-section">
        <h4 className="theme-preview-section-title">Buttons</h4>
        <div className="theme-preview-section-content">
          <PreviewButtons />
        </div>
      </div>

      {/* Card Section */}
      <div className="theme-preview-section">
        <h4 className="theme-preview-section-title">Card</h4>
        <div className="theme-preview-section-content">
          <PreviewCard />
        </div>
      </div>

      {/* Form Section */}
      <div className="theme-preview-section">
        <h4 className="theme-preview-section-title">Form</h4>
        <div className="theme-preview-section-content">
          <PreviewForm />
        </div>
      </div>
    </>
  );

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
            {/* Font loading indicator */}
            {renderFontsLoading()}

            {/* Viewport container with width control */}
            <div 
              className="theme-preview-viewport"
              style={{
                ...getViewportStyle(),
                backgroundColor: darkMode ? 'var(--color-foreground)' : 'var(--color-background)',
                color: darkMode ? 'var(--color-background)' : 'var(--color-foreground)'
              }}
            >
              {renderPreviewSections()}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
