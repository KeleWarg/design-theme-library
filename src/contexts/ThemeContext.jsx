/**
 * @chunk 2.04 - ThemeContext Provider
 * 
 * Global theme state management and CSS variable injection.
 * Provides active theme, tokens, and font loading state to the entire app.
 */

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { themeService } from '../services/themeService';
import { loadThemeFonts } from '../lib/fontLoader';

const ThemeContext = createContext(null);

/**
 * Theme Provider Component
 * Manages global theme state and injects CSS variables
 */
export function ThemeProvider({ children }) {
  const [activeTheme, setActiveTheme] = useState(null);
  const [tokens, setTokens] = useState({});
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load initial theme on mount
  useEffect(() => {
    const loadInitialTheme = async () => {
      try {
        setError(null);

        // Check localStorage for saved active theme and user's default preference from Settings
        const savedThemeId = localStorage.getItem('activeThemeId');
        const userDefaultThemeId = localStorage.getItem('ds-admin-default-theme');

        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/cedf6f1e-83a3-4c87-b2f6-ee5968ab2749',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'prefix-1',hypothesisId:'H1',location:'ThemeContext.jsx:loadInitialTheme',message:'localStorage theme ids read',data:{savedThemeId,userDefaultThemeId},timestamp:Date.now()})}).catch(()=>{});
        // #endregion

        // Get all themes
        const themes = await themeService.getThemes();

        if (!themes.length) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/cedf6f1e-83a3-4c87-b2f6-ee5968ab2749',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'prefix-1',hypothesisId:'H3',location:'ThemeContext.jsx:loadInitialTheme',message:'no themes found',data:{savedThemeId,userDefaultThemeId},timestamp:Date.now()})}).catch(()=>{});
          // #endregion
          setIsLoading(false);
          return;
        }

        // Find theme to load (saved > user preference > database default > first)
        const defaultTheme = themes.find(t => t.is_default);
        const firstTheme = themes[0];

        let themeToLoad =
          themes.find(t => t.id === savedThemeId) ||
          themes.find(t => t.id === userDefaultThemeId) ||
          defaultTheme ||
          firstTheme;

        let selectionSource = 'first';
        if (themeToLoad?.id === savedThemeId) selectionSource = 'saved';
        else if (themeToLoad?.id === userDefaultThemeId) selectionSource = 'user-default';
        else if (themeToLoad?.id === defaultTheme?.id) selectionSource = 'db-default';

        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/cedf6f1e-83a3-4c87-b2f6-ee5968ab2749',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'prefix-1',hypothesisId:'H1',location:'ThemeContext.jsx:loadInitialTheme',message:'theme selection decision',data:{themesCount:themes.length,themeIds:themes.map(t=>t.id),savedThemeId,userDefaultThemeId,selectedThemeId:themeToLoad?.id,isDefaultMatch:Boolean(themes.find(t=>t.is_default)),selectionSource,defaultThemeId:defaultTheme?.id,firstThemeId:firstTheme?.id},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        
        if (themeToLoad) {
          await loadThemeInternal(themeToLoad.id);
        }
      } catch (err) {
        console.error('Failed to load initial theme:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialTheme();
  }, []);

  /**
   * Internal function to load a theme by ID
   */
  const loadThemeInternal = async (themeId) => {
    setFontsLoaded(false);
    setError(null);
    
    try {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/cedf6f1e-83a3-4c87-b2f6-ee5968ab2749',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'prefix-1',hypothesisId:'H2',location:'ThemeContext.jsx:loadThemeInternal',message:'loadThemeInternal start',data:{themeId},timestamp:Date.now()})}).catch(()=>{});
      // #endregion

      const theme = await themeService.getTheme(themeId);
      setActiveTheme(theme);
      setTokens(groupTokensByCategory(theme.tokens || []));
      localStorage.setItem('activeThemeId', themeId);
      
      // Load custom fonts
      if (theme.typefaces?.length) {
        await loadThemeFonts(theme);
      }
      setFontsLoaded(true);

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/cedf6f1e-83a3-4c87-b2f6-ee5968ab2749',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'prefix-1',hypothesisId:'H2',location:'ThemeContext.jsx:loadThemeInternal',message:'loadThemeInternal success',data:{loadedThemeId:themeId,themeName:theme.name,tokenCount:theme.tokens?.length || 0,typefaceCount:theme.typefaces?.length || 0},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
    } catch (err) {
      console.error('Failed to load theme:', err);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/cedf6f1e-83a3-4c87-b2f6-ee5968ab2749',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'prefix-1',hypothesisId:'H2',location:'ThemeContext.jsx:loadThemeInternal',message:'loadThemeInternal error',data:{themeId,error:err?.message},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      setError(err.message);
      throw err;
    }
  };

  /**
   * Load a theme by ID (public method)
   */
  const loadTheme = useCallback(async (themeId) => {
    await loadThemeInternal(themeId);
  }, []);

  /**
   * Refresh current theme (after edits)
   */
  const refreshTheme = useCallback(async () => {
    if (activeTheme?.id) {
      await loadThemeInternal(activeTheme.id);
    }
  }, [activeTheme?.id]);

  /**
   * Clear active theme
   */
  const clearTheme = useCallback(() => {
    setActiveTheme(null);
    setTokens({});
    setFontsLoaded(false);
    localStorage.removeItem('activeThemeId');
  }, []);

  // Compute CSS variables from tokens
  const cssVariables = useMemo(() => {
    if (!activeTheme?.tokens) return {};
    
    return activeTheme.tokens.reduce((vars, token) => {
      if (token.css_variable) {
        vars[token.css_variable] = tokenToCssValue(token);
      }
      return vars;
    }, {});
  }, [activeTheme]);

  // Inject CSS variables into :root
  useEffect(() => {
    if (!activeTheme) return;

    const root = document.documentElement;
    const failedVariables = [];

    // Set new variables with error handling
    Object.entries(cssVariables).forEach(([key, value]) => {
      try {
        // Validate the CSS variable name format
        if (!key.startsWith('--')) {
          console.warn(`Invalid CSS variable name: ${key} (must start with --)`);
          failedVariables.push(key);
          return;
        }
        // Validate value is not undefined/null
        if (value === undefined || value === null) {
          console.warn(`Skipping CSS variable ${key}: value is ${value}`);
          failedVariables.push(key);
          return;
        }
        root.style.setProperty(key, value);
      } catch (err) {
        console.warn(`Failed to set CSS variable ${key}:`, err);
        failedVariables.push(key);
      }
    });

    if (failedVariables.length > 0) {
      console.warn(`Failed to inject ${failedVariables.length} CSS variables:`, failedVariables);
    }

    // Cleanup: remove variables when theme changes or unmounts
    return () => {
      Object.keys(cssVariables).forEach(key => {
        try {
          root.style.removeProperty(key);
        } catch (err) {
          // Silently ignore cleanup errors
        }
      });
    };
  }, [cssVariables, activeTheme]);

  const value = {
    // State
    activeTheme,
    tokens,
    cssVariables,
    fontsLoaded,
    isLoading,
    error,
    
    // Actions
    setActiveTheme: loadTheme,
    loadTheme,
    refreshTheme,
    clearTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context
 * @throws {Error} If used outside ThemeProvider
 */
export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }
  return context;
}

/**
 * Helper: Group tokens by category
 * @param {Array} tokens - Flat array of tokens
 * @returns {Object} - Tokens grouped by category
 */
function groupTokensByCategory(tokens) {
  return tokens.reduce((acc, token) => {
    const cat = token.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(token);
    return acc;
  }, {});
}

/**
 * Helper: Convert token to CSS value string
 * @param {Object} token - Token object with category and value
 * @returns {string} - CSS-compatible value string
 */
function tokenToCssValue(token) {
  const { category, value } = token;
  
  // Handle null/undefined values
  if (value === null || value === undefined) {
    return '';
  }
  
  switch (category) {
    case 'color':
      return colorToCss(value);
    
    case 'spacing':
    case 'radius':
      return dimensionToCss(value);
    
    case 'typography':
      return typographyToCss(value);
    
    case 'shadow':
      return shadowToCss(value);
    
    default:
      return defaultToCss(value);
  }
}

/**
 * Convert color token value to CSS
 */
function colorToCss(value) {
  if (typeof value === 'string') {
    return value;
  }
  
  if (value.opacity !== undefined && value.opacity < 1) {
    // Handle rgba colors
    if (value.rgb) {
      const { r, g, b } = value.rgb;
      return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${value.opacity})`;
    }
    // Handle hex with alpha
    if (value.hex) {
      return hexToRgba(value.hex, value.opacity);
    }
  }
  
  return value.hex || '#000000';
}

/**
 * Convert hex color to rgba
 */
function hexToRgba(hex, opacity) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return hex;
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Convert dimension token value to CSS (spacing, radius, etc.)
 */
function dimensionToCss(value) {
  if (typeof value === 'string') {
    return value;
  }
  
  if (typeof value === 'number') {
    return `${value}px`;
  }
  
  if (typeof value === 'object' && value.value !== undefined) {
    return `${value.value}${value.unit || 'px'}`;
  }
  
  return String(value);
}

/**
 * Convert typography token value to CSS
 * Handles unitless values (like line-height) vs values with units (like font-size)
 */
function typographyToCss(value) {
  if (typeof value === 'string') {
    return value;
  }
  
  if (typeof value === 'object' && value.value !== undefined) {
    // If unit is explicitly empty string, use no unit (unitless values like line-height)
    if (value.unit === '') {
      return String(value.value);
    }
    // If unit is specified and not empty, use it
    if (value.unit) {
      return `${value.value}${value.unit}`;
    }
    // No unit specified - check if value looks like a unitless ratio
    // (common for line-height which is typically between 1.0-3.0)
    const numVal = parseFloat(value.value);
    if (!isNaN(numVal) && numVal > 0 && numVal < 10) {
      return String(value.value);
    }
    // Default to px for larger values (likely font-size, etc.)
    return `${value.value}px`;
  }
  
  return String(value);
}

/**
 * Convert shadow token value to CSS
 */
function shadowToCss(value) {
  if (typeof value === 'string') {
    return value;
  }
  
  if (value.shadows && Array.isArray(value.shadows)) {
    return value.shadows
      .map(s => {
        const x = s.x ?? s.offsetX ?? 0;
        const y = s.y ?? s.offsetY ?? 0;
        const blur = s.blur ?? s.blurRadius ?? 0;
        const spread = s.spread ?? s.spreadRadius ?? 0;
        const color = s.color ?? 'rgba(0, 0, 0, 0.1)';
        const inset = s.inset ? 'inset ' : '';
        return `${inset}${x}px ${y}px ${blur}px ${spread}px ${color}`;
      })
      .join(', ');
  }
  
  // Handle single shadow object
  if (value.x !== undefined || value.offsetX !== undefined) {
    const x = value.x ?? value.offsetX ?? 0;
    const y = value.y ?? value.offsetY ?? 0;
    const blur = value.blur ?? value.blurRadius ?? 0;
    const spread = value.spread ?? value.spreadRadius ?? 0;
    const color = value.color ?? 'rgba(0, 0, 0, 0.1)';
    const inset = value.inset ? 'inset ' : '';
    return `${inset}${x}px ${y}px ${blur}px ${spread}px ${color}`;
  }
  
  return 'none';
}

/**
 * Default conversion for other token types
 */
function defaultToCss(value) {
  if (typeof value === 'object') {
    if (value.value !== undefined) {
      return `${value.value}${value.unit || ''}`;
    }
    return JSON.stringify(value);
  }
  return String(value);
}

export default ThemeProvider;

