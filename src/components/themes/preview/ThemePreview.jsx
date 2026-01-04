/**
 * @chunk 2.27 - ThemePreview
 * 
 * Full-featured theme preview panel with:
 * - Collapsible/expandable panel
 * - Viewport width controls (mobile/tablet/desktop)
 * - Font loading indicator
 * - Dark/light mode preview toggle
 * - Multiple preview sections (typography, colors, buttons, cards, forms)
 */

import { useState, useCallback } from 'react';
import { ChevronDown, ChevronUp, Monitor, Tablet, Smartphone, Sun, Moon } from 'lucide-react';
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
  initialCollapsed = false,
  initialViewport = 'desktop',
  showControls = true 
}) {
  const { fontsLoading } = useThemeContext();
  
  // Theme prop is passed from ThemeEditorPage for live preview
  // The actual tokens are applied via CSS variables by ThemeContext
  
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
  const [viewport, setViewport] = useState(initialViewport);
  const [darkMode, setDarkMode] = useState(false);

  /**
   * Toggle collapsed state
   */
  const handleToggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
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

  return (
    <div className={`theme-preview ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Header with toggle and controls */}
      <div className="theme-preview-header">
        {/* Collapse/Expand Toggle */}
        <button 
          className="theme-preview-toggle"
          onClick={handleToggleCollapse}
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? 'Expand preview' : 'Collapse preview'}
        >
          {isCollapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          <span className="theme-preview-title">Preview</span>
        </button>

        {/* Controls - only shown when expanded and showControls is true */}
        {showControls && !isCollapsed && (
          <div className="theme-preview-controls">
            {/* Viewport Size Selector */}
            <div className="segmented-control segmented-control-sm">
              {Object.entries(VIEWPORT_SIZES).map(([key, { label, icon: Icon }]) => (
                <button
                  key={key}
                  className={`segmented-option ${viewport === key ? 'selected' : ''}`}
                  onClick={() => setViewport(key)}
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
                onClick={() => setDarkMode(false)}
                title="Light mode"
                aria-label="Light mode preview"
              >
                <Sun size={14} />
              </button>
              <button
                className={`segmented-option ${darkMode ? 'selected' : ''}`}
                onClick={() => setDarkMode(true)}
                title="Dark mode"
                aria-label="Dark mode preview"
              >
                <Moon size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

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
  );
}
