# Chunk 2.26 — ThemePreview Panel

## Purpose
Collapsible preview panel showing live component samples.

---

## Inputs
- ThemeContext CSS variables (from chunk 2.06)
- Token data

## Outputs
- ThemePreview component (consumed by ThemeEditor)

---

## Dependencies
- Chunk 2.06 must be complete

---

## Implementation Notes

### Component Structure

```jsx
// src/components/themes/preview/ThemePreview.jsx
import { useState } from 'react';
import { useThemeContext } from '../../../contexts/ThemeContext';
import { 
  MonitorIcon, TabletIcon, SmartphoneIcon,
  ChevronUpIcon, ChevronDownIcon 
} from 'lucide-react';
import { SegmentedControl } from '../../ui';
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

export default function ThemePreview({ collapsed, onToggle }) {
  const { fontsLoaded } = useThemeContext();
  const [viewMode, setViewMode] = useState('desktop');

  return (
    <div className={cn('theme-preview', { collapsed })}>
      <div className="preview-header">
        <h3>Preview</h3>
        <div className="preview-controls">
          <SegmentedControl
            value={viewMode}
            onChange={setViewMode}
            options={[
              { value: 'desktop', icon: MonitorIcon, label: 'Desktop' },
              { value: 'tablet', icon: TabletIcon, label: 'Tablet' },
              { value: 'mobile', icon: SmartphoneIcon, label: 'Mobile' },
            ]}
            size="sm"
          />
          <button 
            className="collapse-toggle"
            onClick={onToggle}
            aria-label={collapsed ? 'Expand preview' : 'Collapse preview'}
          >
            {collapsed ? <ChevronUpIcon size={18} /> : <ChevronDownIcon size={18} />}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div 
          className="preview-viewport"
          style={{ maxWidth: VIEWPORTS[viewMode].width }}
        >
          {!fontsLoaded && (
            <div className="fonts-loading">
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
      )}
    </div>
  );
}

function PreviewSection({ title, children }) {
  return (
    <div className="preview-section">
      <h4 className="section-title">{title}</h4>
      <div className="section-content">
        {children}
      </div>
    </div>
  );
}
```

### Styling
```css
.theme-preview {
  border-top: 1px solid var(--color-border);
  background: #fafafa;
  transition: height 0.3s ease;
}

.theme-preview.collapsed {
  height: 48px;
  overflow: hidden;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-border);
}

.preview-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.collapse-toggle {
  padding: 0.25rem;
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}

.collapse-toggle:hover {
  background: #e2e8f0;
}

.preview-viewport {
  margin: 0 auto;
  padding: 1.5rem;
  transition: max-width 0.3s ease;
}

.fonts-loading {
  padding: 1rem;
  text-align: center;
  color: #64748b;
  font-size: 0.875rem;
}

.preview-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
  margin-bottom: 0.75rem;
}
```

---

## Files Created
- `src/components/themes/preview/ThemePreview.jsx` — Preview panel
- `src/components/ui/SegmentedControl.jsx` — Viewport selector

---

## Tests

### Unit Tests
- [ ] Renders all preview sections
- [ ] Collapse/expand toggle works
- [ ] Viewport size changes preview width
- [ ] Shows fonts loading state
- [ ] Responsive to CSS variable changes

---

## Time Estimate
2 hours

---

## Notes
The preview panel gives immediate visual feedback when editing tokens. The responsive viewport selector helps test themes at different breakpoints.
