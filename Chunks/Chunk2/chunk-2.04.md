# Chunk 2.04 — ThemeContext Provider

## Purpose
Create React context for global theme state and CSS variable injection.

---

## Inputs
- themeService (from chunk 1.07)
- tokenService (from chunk 1.08)

## Outputs
- ThemeContext provider (consumed by entire app)
- useThemeContext hook
- CSS variable injection

---

## Dependencies
- Chunk 1.07 must be complete
- Chunk 1.08 must be complete

---

## Implementation Notes

### Key Considerations
- Load default theme on app init
- Compute CSS variables from tokens
- Handle font loading state
- Persist selection to localStorage

### Context Structure

```jsx
// src/contexts/ThemeContext.jsx
import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { themeService } from '../services/themeService';
import { loadThemeFonts } from '../lib/fontLoader';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [activeTheme, setActiveTheme] = useState(null);
  const [tokens, setTokens] = useState({});
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial theme on mount
  useEffect(() => {
    const loadInitialTheme = async () => {
      try {
        // Check localStorage for saved preference
        const savedThemeId = localStorage.getItem('activeThemeId');
        
        // Get all themes
        const themes = await themeService.getThemes();
        
        if (!themes.length) {
          setIsLoading(false);
          return;
        }
        
        // Find theme to load (saved > default > first)
        let themeToLoad = themes.find(t => t.id === savedThemeId)
          || themes.find(t => t.is_default)
          || themes[0];
        
        if (themeToLoad) {
          await loadTheme(themeToLoad.id);
        }
      } catch (error) {
        console.error('Failed to load initial theme:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialTheme();
  }, []);

  // Load a theme by ID
  const loadTheme = async (themeId) => {
    setFontsLoaded(false);
    
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
    } catch (error) {
      console.error('Failed to load theme:', error);
      throw error;
    }
  };

  // Refresh current theme (after edits)
  const refreshTheme = async () => {
    if (activeTheme?.id) {
      await loadTheme(activeTheme.id);
    }
  };

  // Compute CSS variables from tokens
  const cssVariables = useMemo(() => {
    if (!activeTheme?.tokens) return {};
    
    return activeTheme.tokens.reduce((vars, token) => {
      vars[token.css_variable] = tokenToCssValue(token);
      return vars;
    }, {});
  }, [activeTheme]);

  // Inject CSS variables into :root
  useEffect(() => {
    if (!activeTheme) return;
    
    const root = document.documentElement;
    
    // Set new variables
    Object.entries(cssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    
    // Cleanup: remove variables when theme changes or unmounts
    return () => {
      Object.keys(cssVariables).forEach(key => {
        root.style.removeProperty(key);
      });
    };
  }, [cssVariables]);

  const value = {
    activeTheme,
    setActiveTheme: loadTheme,
    refreshTheme,
    tokens,
    cssVariables,
    fontsLoaded,
    isLoading
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }
  return context;
}

// Helper: Group tokens by category
function groupTokensByCategory(tokens) {
  return tokens.reduce((acc, token) => {
    const cat = token.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(token);
    return acc;
  }, {});
}

// Helper: Convert token to CSS value
function tokenToCssValue(token) {
  const { category, value } = token;
  
  switch (category) {
    case 'color':
      if (value.opacity !== undefined && value.opacity < 1) {
        const { r, g, b } = value.rgb || { r: 0, g: 0, b: 0 };
        return `rgba(${r}, ${g}, ${b}, ${value.opacity})`;
      }
      return value.hex || '#000000';
    
    case 'spacing':
    case 'radius':
    case 'typography':
      if (typeof value === 'object' && value.value !== undefined) {
        return `${value.value}${value.unit || 'px'}`;
      }
      return String(value);
    
    case 'shadow':
      if (value.shadows && Array.isArray(value.shadows)) {
        return value.shadows
          .map(s => `${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${s.color}`)
          .join(', ');
      }
      return 'none';
    
    default:
      if (typeof value === 'object') {
        return JSON.stringify(value);
      }
      return String(value);
  }
}
```

### Font Loader
```javascript
// src/lib/fontLoader.js
import { typefaceService } from '../services/typefaceService';

export async function loadThemeFonts(theme) {
  if (!theme.typefaces?.length) return;

  const fontFaceRules = [];

  for (const typeface of theme.typefaces) {
    // Handle Google Fonts
    if (typeface.source_type === 'google') {
      await loadGoogleFont(typeface.family, typeface.weights);
      continue;
    }

    // Handle custom uploaded fonts
    for (const fontFile of typeface.font_files || []) {
      const url = typefaceService.getFontUrl(fontFile.storage_path);
      
      const rule = `
        @font-face {
          font-family: '${typeface.family}';
          src: url('${url}') format('${getFormatString(fontFile.format)}');
          font-weight: ${fontFile.weight};
          font-style: ${fontFile.style};
          font-display: swap;
        }
      `;
      fontFaceRules.push(rule);
    }
  }

  // Inject @font-face rules
  if (fontFaceRules.length) {
    let styleEl = document.getElementById('theme-fonts');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'theme-fonts';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = fontFaceRules.join('\n');
  }

  // Wait for fonts to load
  await document.fonts.ready;
}

async function loadGoogleFont(family, weights = [400]) {
  const weightStr = weights.join(';');
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weightStr}&display=swap`;
  
  // Check if already loaded
  const existing = document.querySelector(`link[href^="https://fonts.googleapis.com"][href*="${encodeURIComponent(family)}"]`);
  if (existing) return;
  
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  document.head.appendChild(link);
  
  // Wait for font to load
  await document.fonts.ready;
}

function getFormatString(format) {
  const formats = {
    woff2: 'woff2',
    woff: 'woff',
    ttf: 'truetype',
    otf: 'opentype'
  };
  return formats[format] || format;
}
```

---

## Files Created
- `src/contexts/ThemeContext.jsx` — Theme context provider
- `src/lib/fontLoader.js` — Font loading utilities
- `src/lib/tokenToCss.js` — Token to CSS conversion (can be extracted)

---

## Tests

### Unit Tests
- [ ] ThemeProvider renders children
- [ ] Loads default theme on init
- [ ] setActiveTheme updates context
- [ ] CSS variables computed correctly for each token type
- [ ] Variables injected into document.documentElement
- [ ] localStorage persistence works
- [ ] refreshTheme reloads current theme
- [ ] fontsLoaded state tracked correctly

### Integration Tests
- [ ] Changing theme updates all CSS variables
- [ ] Font loading works for Google Fonts
- [ ] Font loading works for custom uploads

---

## Time Estimate
3 hours

---

## Notes
This is one of the most critical chunks - it connects themes to the entire UI through CSS variables. The font loading handles both Google Fonts (via link injection) and custom uploads (via @font-face rules).
