/**
 * @chunk 2.05 - ThemeSelector (Header)
 * 
 * Dropdown in app header for switching active theme.
 * Shows current theme with color preview and provides quick access to all themes.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useThemeContext } from '../../contexts/ThemeContext';
import { useThemes } from '../../hooks/useThemes';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/Popover';
import { Palette, ChevronDown, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Theme selector dropdown for the header
 * Allows quick switching between themes
 */
export default function ThemeSelector() {
  const { activeTheme, setActiveTheme, isLoading: isLoadingContext } = useThemeContext();
  const { data: themes, isLoading: isLoadingThemes } = useThemes();
  const [open, setOpen] = useState(false);

  const isLoading = isLoadingContext || isLoadingThemes;

  // Filter to published themes + the currently active theme (even if draft)
  const availableThemes = themes?.filter(t => 
    t.status === 'published' || t.id === activeTheme?.id
  ) || [];

  // Handle theme selection
  const handleSelectTheme = async (themeId) => {
    try {
      await setActiveTheme(themeId);
      setOpen(false);
    } catch (err) {
      console.error('Failed to switch theme:', err);
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="theme-selector-skeleton">
        <div className="skeleton-icon" />
        <div className="skeleton-text" />
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="theme-selector-trigger" type="button">
          <Palette className="trigger-icon" size={18} />
          <span className="trigger-label">
            {activeTheme?.name || 'Select Theme'}
          </span>
          <ChevronDown 
            className={cn('trigger-chevron', { open })} 
            size={16} 
          />
        </button>
      </PopoverTrigger>
      
      <PopoverContent className="theme-selector-content" align="end">
        <div className="theme-list">
          {availableThemes.length === 0 ? (
            <div className="no-themes">
              No themes available
            </div>
          ) : (
            availableThemes.map(theme => (
              <ThemeOption
                key={theme.id}
                theme={theme}
                isActive={theme.id === activeTheme?.id}
                onSelect={() => handleSelectTheme(theme.id)}
              />
            ))
          )}
        </div>
        
        <div className="theme-selector-footer">
          <Link 
            to="/themes" 
            className="manage-link"
            onClick={() => setOpen(false)}
          >
            Manage Themes
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Individual theme option in the dropdown
 */
function ThemeOption({ theme, isActive, onSelect }) {
  // Get first 3 color tokens for mini preview
  const previewColors = theme.tokens
    ?.filter(t => t.category === 'color')
    ?.slice(0, 3)
    ?.map(t => {
      // Handle different token value formats
      if (typeof t.value === 'string') return t.value;
      if (t.value?.hex) return t.value.hex;
      return null;
    })
    .filter(Boolean) || [];

  return (
    <button
      className={cn('theme-option', { active: isActive })}
      onClick={onSelect}
      type="button"
    >
      <div className="theme-colors">
        {previewColors.map((color, i) => (
          <div 
            key={i} 
            className="mini-swatch"
            style={{ backgroundColor: color }}
          />
        ))}
        {previewColors.length === 0 && (
          <div className="mini-swatch empty" />
        )}
      </div>
      
      <div className="theme-info">
        <span className="theme-name">{theme.name}</span>
        {theme.is_default && (
          <span className="default-badge">Default</span>
        )}
      </div>
      
      {isActive && <Check className="check-icon" size={16} />}
    </button>
  );
}


