/**
 * @chunk 2.27 - ThemePreview Panel
 * 
 * Collapsible preview panel showing live component samples.
 * Provides responsive viewport controls and organized preview sections.
 */

import { useState } from 'react';
import { useThemeContext } from '../../../contexts/ThemeContext';
import { 
  Monitor, Tablet, Smartphone,
  ChevronUp, ChevronDown 
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
 * @param {boolean} props.collapsed - Whether panel is collapsed
 * @param {function} props.onToggle - Toggle collapse callback
 * @param {Object} props.theme - Optional theme override (for ThemeEditor)
 */
export default function ThemePreview({ collapsed, onToggle, theme }) {
  const { fontsLoaded } = useThemeContext();
  const [viewMode, setViewMode] = useState('desktop');
  const [activeSection, setActiveSection] = useState(null);

  // Use internal state if collapsed/onToggle not provided
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isCollapsed = collapsed !== undefined ? collapsed : internalCollapsed;
  const handleToggle = onToggle || (() => setInternalCollapsed(!internalCollapsed));

  return (
    <div className={cn('theme-preview-panel', { collapsed: isCollapsed })}>
      <div className="theme-preview-header">
        <button 
          className="theme-preview-toggle"
          onClick={handleToggle}
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? 'Expand preview' : 'Collapse preview'}
        >
          {isCollapsed ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          <span className="theme-preview-title">Preview</span>
        </button>
        
        <div className="theme-preview-controls">
          {!isCollapsed && (
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
