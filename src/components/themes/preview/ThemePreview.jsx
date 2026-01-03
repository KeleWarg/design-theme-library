/**
 * @chunk 2.27 - ThemePreview Panel
 * 
 * Collapsible preview panel showing live component samples.
 * Provides responsive viewport controls and organized preview sections.
 * Supports 3 states: collapsed, normal, expanded
 */

import { useState } from 'react';
import { useThemeContext } from '../../../contexts/ThemeContext';
import { 
  Monitor, Tablet, Smartphone,
  ChevronUp, ChevronDown, Maximize2, Minimize2 
} from 'lucide-react';
import SegmentedControl from '../../ui/SegmentedControl';
import PreviewTypography from './PreviewTypography';
import PreviewColors from './PreviewColors';
import PreviewButtons from './PreviewButtons';
import PreviewCard from './PreviewCard';
import PreviewForm from './PreviewForm';
import { cn } from '../../../lib/utils';

const VIEWPORTS = {
  desktop: { width: '100%', label: 'Desktop' },
  tablet: { width: '768px', label: 'Tablet' },
  mobile: { width: '375px', label: 'Mobile' },
};

// Preview panel states
const PREVIEW_STATES = {
  collapsed: 'collapsed',
  normal: 'normal',
  expanded: 'expanded',
};

/**
 * Preview Section wrapper component
 */
function PreviewSection({ title, children }) {
  return (
    <div className="theme-preview-section">
      <h4 className="theme-preview-section-title">{title}</h4>
      <div className="theme-preview-section-content">
        {children}
      </div>
    </div>
  );
}

/**
 * Theme Preview Panel
 * 
 * @param {Object} props
 * @param {string} props.previewState - Current state: 'collapsed' | 'normal' | 'expanded'
 * @param {function} props.onStateChange - State change callback
 * @param {Object} props.theme - Optional theme override (for ThemeEditor)
 * @param {boolean} props.collapsed - Legacy prop for backwards compatibility
 * @param {function} props.onToggle - Legacy prop for backwards compatibility
 */
export default function ThemePreview({ 
  previewState: externalState, 
  onStateChange,
  theme,
  collapsed: legacyCollapsed,
  onToggle: legacyOnToggle
}) {
  const { fontsLoaded } = useThemeContext();
  const [viewMode, setViewMode] = useState('desktop');
  
  // Internal state management
  const [internalState, setInternalState] = useState(PREVIEW_STATES.normal);
  
  // Determine current state (support both new and legacy props)
  const getCurrentState = () => {
    if (externalState !== undefined) return externalState;
    if (legacyCollapsed !== undefined) {
      return legacyCollapsed ? PREVIEW_STATES.collapsed : PREVIEW_STATES.normal;
    }
    return internalState;
  };
  
  const currentState = getCurrentState();
  const isCollapsed = currentState === PREVIEW_STATES.collapsed;
  const isExpanded = currentState === PREVIEW_STATES.expanded;
  
  // Handle state changes
  const handleStateChange = (newState) => {
    if (onStateChange) {
      onStateChange(newState);
    } else if (legacyOnToggle && (newState === PREVIEW_STATES.collapsed || currentState === PREVIEW_STATES.collapsed)) {
      // Legacy toggle support
      legacyOnToggle();
    } else {
      setInternalState(newState);
    }
  };
  
  // Cycle through states: collapsed -> normal -> expanded -> collapsed
  const cycleState = () => {
    const nextState = {
      [PREVIEW_STATES.collapsed]: PREVIEW_STATES.normal,
      [PREVIEW_STATES.normal]: PREVIEW_STATES.expanded,
      [PREVIEW_STATES.expanded]: PREVIEW_STATES.collapsed,
    };
    handleStateChange(nextState[currentState]);
  };
  
  // Toggle between collapsed and normal/expanded
  const toggleCollapse = () => {
    if (isCollapsed) {
      handleStateChange(PREVIEW_STATES.normal);
    } else {
      handleStateChange(PREVIEW_STATES.collapsed);
    }
  };
  
  // Toggle between normal and expanded
  const toggleExpand = () => {
    if (isExpanded) {
      handleStateChange(PREVIEW_STATES.normal);
    } else {
      handleStateChange(PREVIEW_STATES.expanded);
    }
  };

  return (
    <div className={cn(
      'theme-preview',
      { 
        collapsed: isCollapsed,
        expanded: isExpanded 
      }
    )}>
      <div className="theme-preview-header">
        <button 
          className="theme-preview-toggle"
          onClick={toggleCollapse}
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? 'Expand preview' : 'Collapse preview'}
        >
          {isCollapsed ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          <span className="theme-preview-title">Preview</span>
        </button>
        
        <div className="theme-preview-controls">
          {!isCollapsed && (
            <>
              <SegmentedControl
                value={viewMode}
                onChange={setViewMode}
                options={[
                  { value: 'desktop', icon: Monitor, label: 'Desktop' },
                  { value: 'tablet', icon: Tablet, label: 'Tablet' },
                  { value: 'mobile', icon: Smartphone, label: 'Mobile' },
                ]}
                size="sm"
              />
              <button
                className="btn btn-ghost btn-sm"
                onClick={toggleExpand}
                aria-label={isExpanded ? 'Minimize preview' : 'Maximize preview'}
                title={isExpanded ? 'Minimize' : 'Maximize'}
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            </>
          )}
        </div>
      </div>

      {!isCollapsed && (
        <div className="theme-preview-body">
          <div 
            className="theme-preview-viewport"
            style={{ maxWidth: VIEWPORTS[viewMode].width }}
          >
            {!fontsLoaded && (
              <div className="theme-preview-fonts-loading">
                <span className="loading-spinner" />
                <span>Loading fonts...</span>
              </div>
            )}
            
            <PreviewSection title="Typography">
              <PreviewTypography />
            </PreviewSection>

            <PreviewSection title="Colors">
              <PreviewColors />
            </PreviewSection>

            <PreviewSection title="Buttons">
              <PreviewButtons />
            </PreviewSection>

            <PreviewSection title="Cards">
              <PreviewCard />
            </PreviewSection>

            <PreviewSection title="Form Elements">
              <PreviewForm />
            </PreviewSection>
          </div>
        </div>
      )}
    </div>
  );
}

// Export preview states for external use
export { PREVIEW_STATES };
