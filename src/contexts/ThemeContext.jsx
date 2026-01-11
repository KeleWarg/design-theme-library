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

        // Get all themes
        const themes = await themeService.getThemes();

        if (!themes.length) {
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
      const theme = await themeService.getTheme(themeId);
      setActiveTheme(theme);
      setTokens(groupTokensByCategory(theme.tokens || []));
      localStorage.setItem('activeThemeId', themeId);
      
      // Load custom fonts
      if (theme.typefaces?.length) {
        await loadThemeFonts(theme);
      }
      setFontsLoaded(true);
    } catch (err) {
      console.error('Failed to load theme:', err);
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
    
    const rawVars = activeTheme.tokens.reduce((vars, token) => {
      if (token.css_variable) {
        // Check if this is a composite typography token
        if (isCompositeTypographyToken(token)) {
          // Expand composite token into multiple CSS variables
          const compositeVars = expandCompositeTypographyToken(token);
          Object.assign(vars, compositeVars);
        } else {
          vars[token.css_variable] = tokenToCssValue(token);
        }
      }
      return vars;
    }, {});

    // Bridge common token naming schemes to the app’s semantic CSS vars.
    // The app’s base UI primarily uses `--color-*` (see `src/styles/variables.css`).
    // Many imported themes use domain vars like `--background-*`, `--foreground-*`, `--button-*`.
    // These aliases keep the UI themed even when the theme doesn’t define `--color-*` explicitly.
    const aliasVars = deriveSemanticColorAliases(rawVars);

    // Ensure explicit tokens always win over derived aliases.
    return { ...aliasVars, ...rawVars };
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

  if (!value || typeof value !== 'object') return '#000000';

  // Normalize into { hex?, rgb?, opacity? }
  const opacity = clamp01(value.opacity ?? 1);
  const rgb = normalizeRgb(value.rgb) || (value.hex ? hexToRgbSafe(value.hex) : null);
  const hex = value.hex || (rgb ? rgbToHex(rgb) : null);

  if (opacity < 1) {
    if (rgb) {
      return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
    }
    if (hex) {
      return hexToRgba(hex, opacity);
    }
  }

  return hex || '#000000';
}

/**
 * Convert hex color to rgba
 */
function hexToRgba(hex, opacity) {
  const cleaned = String(hex || '').trim().replace(/^#/, '');
  const fullHex = cleaned.length === 3
    ? cleaned.split('').map(c => c + c).join('')
    : cleaned.length === 8
      // If hex includes alpha (#RRGGBBAA), drop alpha here (opacity handled separately)
      ? cleaned.slice(0, 6)
      : cleaned;

  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  if (!result) return hex;
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function clamp01(n) {
  const x = Number(n);
  if (Number.isNaN(x)) return 1;
  return Math.max(0, Math.min(1, x));
}

function normalizeRgb(rgb) {
  if (!rgb || typeof rgb !== 'object') return null;
  if (rgb.r === undefined || rgb.g === undefined || rgb.b === undefined) return null;
  return {
    r: Math.max(0, Math.min(255, Math.round(rgb.r))),
    g: Math.max(0, Math.min(255, Math.round(rgb.g))),
    b: Math.max(0, Math.min(255, Math.round(rgb.b))),
  };
}

function hexToRgbSafe(hex) {
  const cleaned = String(hex || '').trim().replace(/^#/, '');
  const fullHex = cleaned.length === 3
    ? cleaned.split('').map(c => c + c).join('')
    : cleaned.length === 8
      ? cleaned.slice(0, 6)
      : cleaned;

  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  if (!result) return null;
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

function rgbToHex(rgb) {
  const toHex = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

function deriveSemanticColorAliases(vars) {
  const pick = (keys) => {
    for (const k of keys) {
      const v = vars[k];
      if (typeof v === 'string' && v.trim() !== '') return v;
    }
    return undefined;
  };

  const aliases = {};

  // Backgrounds
  aliases['--color-background'] = pick(['--color-background', '--background-white', '--background-default', '--background-neutral-subtle']);
  aliases['--color-surface'] = pick(['--color-surface', '--background-white', '--background-default', '--color-background']);
  aliases['--color-muted'] = pick(['--color-muted', '--background-neutral-subtle', '--background-neutral-light', '--background-neutral']);

  // Foregrounds
  aliases['--color-foreground'] = pick(['--color-foreground', '--foreground-heading', '--foreground-body']);
  aliases['--color-muted-foreground'] = pick(['--color-muted-foreground', '--foreground-caption', '--foreground-body']);

  // Borders
  aliases['--color-border'] = pick(['--color-border', '--foreground-divider', '--foreground-stroke-default', '--foreground-table-border']);

  // Primary/secondary (buttons/brand)
  aliases['--color-primary'] = pick(['--color-primary', '--background-brand', '--button-primary-bg']);
  aliases['--color-primary-hover'] = pick(['--color-primary-hover', '--button-primary-hover-bg', '--button-primary-pressed-bg']);
  aliases['--color-secondary'] = pick(['--color-secondary', '--button-secondary-bg', '--background-secondary']);

  // Status
  aliases['--color-success'] = pick(['--color-success', '--foreground-feedback-success']);
  aliases['--color-warning'] = pick(['--color-warning', '--foreground-feedback-warning']);
  aliases['--color-error'] = pick(['--color-error', '--foreground-feedback-error']);

  // Drop undefined entries to avoid “Skipping CSS variable ... value is undefined”
  Object.keys(aliases).forEach((k) => {
    if (aliases[k] === undefined) delete aliases[k];
  });

  return aliases;
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

/**
 * Check if a token is a composite typography token
 * @param {Object} token - Token object
 * @returns {boolean}
 */
function isCompositeTypographyToken(token) {
  return token.category === 'typography' && 
         token.type === 'typography-composite' &&
         typeof token.value === 'object' &&
         token.value !== null &&
         (token.value.fontFamily !== undefined || 
          token.value.fontSize !== undefined || 
          token.value.fontWeight !== undefined);
}

/**
 * Expand a composite typography token into multiple CSS variables
 * @param {Object} token - Composite typography token
 * @returns {Object} - Map of CSS variable names to values
 */
function expandCompositeTypographyToken(token) {
  const baseVar = token.css_variable;
  const { value } = token;
  const variables = {};

  // Font Family
  if (value.fontFamily) {
    const family = typeof value.fontFamily === 'string' 
      ? value.fontFamily 
      : Array.isArray(value.fontFamily)
        ? value.fontFamily.map(f => f.includes(' ') ? `"${f}"` : f).join(', ')
        : value.fontFamily;
    variables[`${baseVar}-family`] = family;
  }

  // Font Size
  if (value.fontSize !== undefined) {
    variables[`${baseVar}-size`] = formatDimensionForComposite(value.fontSize);
  }

  // Font Weight
  if (value.fontWeight !== undefined) {
    variables[`${baseVar}-weight`] = String(value.fontWeight);
  }

  // Line Height
  if (value.lineHeight !== undefined) {
    variables[`${baseVar}-line-height`] = formatLineHeightForComposite(value.lineHeight);
  }

  // Letter Spacing
  if (value.letterSpacing !== undefined) {
    variables[`${baseVar}-letter-spacing`] = formatLetterSpacingForComposite(value.letterSpacing);
  }

  return variables;
}

/**
 * Format dimension value for composite tokens (fontSize, etc.)
 */
function formatDimensionForComposite(value) {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return `${value}px`;
  if (typeof value === 'object' && value.value !== undefined) {
    return `${value.value}${value.unit ?? 'rem'}`;
  }
  return '1rem';
}

/**
 * Format line height value (unitless or with unit)
 */
function formatLineHeightForComposite(value) {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'object' && value.value !== undefined) {
    // Line height is typically unitless
    if (value.unit === '' || value.unit === undefined) {
      return String(value.value);
    }
    return `${value.value}${value.unit}`;
  }
  return '1.5';
}

/**
 * Format letter spacing value
 */
function formatLetterSpacingForComposite(value) {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return `${value}em`;
  if (value === 'normal') return 'normal';
  if (typeof value === 'object' && value.value !== undefined) {
    return `${value.value}${value.unit ?? 'em'}`;
  }
  return 'normal';
}

export default ThemeProvider;

