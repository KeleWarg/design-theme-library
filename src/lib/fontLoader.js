/**
 * @chunk 2.25 - Font Loading System
 * 
 * Comprehensive font loading for Google Fonts, Adobe Fonts, system fonts, and custom uploads.
 * Supports loading fonts at runtime and generating CSS for export.
 */

import { typefaceService } from '../services/typefaceService';

/**
 * Load all fonts for a theme
 * Handles Google Fonts, Adobe Fonts, custom fonts, and system fonts.
 * Also injects CSS variables for font-family based on typeface roles.
 * @param {Object} theme - Theme object with typefaces array
 * @returns {Promise<void>}
 */
export async function loadThemeFonts(theme) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/cedf6f1e-83a3-4c87-b2f6-ee5968ab2749',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'prefix-1',hypothesisId:'H4',location:'fontLoader.js:loadThemeFonts',message:'loadThemeFonts start',data:{themeId:theme?.id,themeName:theme?.name,typefaceCount:theme?.typefaces?.length || 0},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  if (!theme.typefaces?.length) return;

  const googleFonts = [];
  const fontFaceRules = [];

  for (const typeface of theme.typefaces) {
    switch (typeface.source_type) {
      case 'google':
        googleFonts.push({
          family: typeface.family,
          weights: typeface.weights || [400]
        });
        break;

      case 'custom':
        if (typeface.font_files?.length) {
          for (const fontFile of typeface.font_files) {
            const url = typefaceService.getFontUrl(fontFile.storage_path);
            fontFaceRules.push(`
@font-face {
  font-family: '${typeface.family}';
  src: url('${url}') format('${getFormatString(fontFile.format)}');
  font-weight: ${fontFile.weight};
  font-style: ${fontFile.style};
  font-display: swap;
}`);
          }
        }
        break;

      case 'adobe':
        // Adobe Fonts loaded via TypeKit script
        if (typeface.adobe_kit_id) {
          await loadAdobeKit(typeface.adobe_kit_id);
        }
        break;

      // System fonts don't need loading
      case 'system':
      default:
        break;
    }
  }

  // Load Google Fonts (batched into single request)
  if (googleFonts.length > 0) {
    await loadGoogleFonts(googleFonts);
  }

  // Inject custom @font-face rules
  if (fontFaceRules.length > 0) {
    injectFontFaceRules(fontFaceRules);
  }

  // Inject font-family CSS variables for each typeface role
  injectFontFamilyVariables(theme.typefaces);

  // Wait for all fonts to load
  await document.fonts.ready;

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/cedf6f1e-83a3-4c87-b2f6-ee5968ab2749',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'prefix-1',hypothesisId:'H4',location:'fontLoader.js:loadThemeFonts',message:'loadThemeFonts success',data:{themeId:theme?.id,googleFontsCount:googleFonts.length,fontFaceRuleCount:fontFaceRules.length},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
}

/**
 * Load multiple Google Fonts in a single request
 * @param {Array<{family: string, weights: number[]}>} fonts - Array of font configs
 * @returns {Promise<void>}
 */
async function loadGoogleFonts(fonts) {
  return new Promise((resolve, reject) => {
    // Remove existing Google Fonts link
    const existing = document.getElementById('google-fonts');
    if (existing) existing.remove();

    // Build URL with all fonts
    const families = fonts.map(f => {
      const weights = f.weights.join(';');
      return `family=${encodeURIComponent(f.family)}:wght@${weights}`;
    }).join('&');

    const link = document.createElement('link');
    link.id = 'google-fonts';
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
    link.onload = resolve;
    link.onerror = (e) => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/cedf6f1e-83a3-4c87-b2f6-ee5968ab2749',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'prefix-1',hypothesisId:'H4',location:'fontLoader.js:loadGoogleFonts',message:'google fonts load error',data:{fonts},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      reject(e);
    };
    document.head.appendChild(link);
  });
}

/**
 * Load Adobe Fonts via TypeKit
 * @param {string} kitId - Adobe TypeKit ID
 * @returns {Promise<void>}
 */
async function loadAdobeKit(kitId) {
  return new Promise((resolve, reject) => {
    const existing = document.getElementById('adobe-fonts');
    if (existing) existing.remove();

    const script = document.createElement('script');
    script.id = 'adobe-fonts';
    script.src = `https://use.typekit.net/${kitId}.js`;
    script.onload = () => {
      try {
        if (window.Typekit) {
          window.Typekit.load({ async: true });
        }
        resolve();
      } catch (e) {
        reject(e);
      }
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * Load a single Google Font (for individual font loading)
 * @param {string} family - Font family name
 * @param {Array<number>} weights - Array of font weights
 * @returns {Promise<void>}
 */
export async function loadGoogleFont(family, weights = [400]) {
  // Build weight string for Google Fonts API
  const weightStr = [...weights].sort((a, b) => a - b).join(';');
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weightStr}&display=swap`;
  
  // Check if already loaded
  const existing = document.querySelector(`link[href^="https://fonts.googleapis.com"][href*="${encodeURIComponent(family)}"]`);
  if (existing) return;
  
  // Create and inject link element
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  document.head.appendChild(link);
  
  // Wait for font to load
  await document.fonts.ready;
}

/**
 * Load a Google Font with italic variants
 * @param {string} family - Font family name
 * @param {Array<number>} weights - Array of font weights
 * @param {boolean} includeItalic - Whether to include italic variants
 * @returns {Promise<void>}
 */
export async function loadGoogleFontFull(family, weights = [400], includeItalic = false) {
  const sortedWeights = [...weights].sort((a, b) => a - b);
  
  let url;
  if (includeItalic) {
    // Format: family=Font:ital,wght@0,400;0,700;1,400;1,700
    const variants = [];
    for (const weight of sortedWeights) {
      variants.push(`0,${weight}`); // Regular
      variants.push(`1,${weight}`); // Italic
    }
    url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:ital,wght@${variants.join(';')}&display=swap`;
  } else {
    const weightStr = sortedWeights.join(';');
    url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weightStr}&display=swap`;
  }
  
  // Check if already loaded
  const existing = document.querySelector(`link[href^="https://fonts.googleapis.com"][href*="${encodeURIComponent(family)}"]`);
  if (existing) {
    existing.href = url; // Update with new weights if needed
    await document.fonts.ready;
    return;
  }
  
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  document.head.appendChild(link);
  
  await document.fonts.ready;
}

/**
 * Inject @font-face rules into the document
 * @param {Array<string>} rules - Array of @font-face rule strings
 */
function injectFontFaceRules(rules) {
  let styleEl = document.getElementById('custom-fonts');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'custom-fonts';
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = rules.join('\n');
}

/**
 * Inject font-family CSS variables based on typeface roles
 * Creates variables like --font-family-display, --font-family-text, etc.
 * @param {Array} typefaces - Array of typeface objects with role, family, fallback
 */
function injectFontFamilyVariables(typefaces) {
  const root = document.documentElement;
  
  // Clear previous font-family variables
  ['display', 'text', 'mono', 'accent'].forEach(role => {
    root.style.removeProperty(`--font-family-${role}`);
  });
  
  // Inject new font-family variables based on typefaces
  for (const typeface of typefaces) {
    if (!typeface.role || !typeface.family) continue;
    
    // Build font stack with fallback
    const fontStack = typeface.family.includes(' ') 
      ? `"${typeface.family}"` 
      : typeface.family;
    const fallback = typeface.fallback || 'sans-serif';
    const cssValue = `${fontStack}, ${fallback}`;
    
    root.style.setProperty(`--font-family-${typeface.role}`, cssValue);
  }
}

/**
 * Clear all injected font rules and CSS variables
 */
export function clearThemeFonts() {
  // Remove custom font styles
  const customStyleEl = document.getElementById('custom-fonts');
  if (customStyleEl) {
    customStyleEl.remove();
  }
  
  // Also check old ID for backwards compatibility
  const themeStyleEl = document.getElementById('theme-fonts');
  if (themeStyleEl) {
    themeStyleEl.remove();
  }
  
  // Remove Google Font links
  const googleLink = document.getElementById('google-fonts');
  if (googleLink) {
    googleLink.remove();
  }
  
  // Remove any other Google font links
  const otherGoogleLinks = document.querySelectorAll('link[href^="https://fonts.googleapis.com"]');
  otherGoogleLinks.forEach(link => link.remove());
  
  // Remove Adobe Fonts script
  const adobeScript = document.getElementById('adobe-fonts');
  if (adobeScript) {
    adobeScript.remove();
  }
  
  // Clear font-family CSS variables
  const root = document.documentElement;
  ['display', 'text', 'mono', 'accent'].forEach(role => {
    root.style.removeProperty(`--font-family-${role}`);
  });
}

/**
 * Get format string for @font-face src
 * @param {string} format - File extension (woff2, woff, ttf, otf)
 * @returns {string} - Format string for CSS
 */
function getFormatString(format) {
  const formats = {
    woff2: 'woff2',
    woff: 'woff',
    ttf: 'truetype',
    otf: 'opentype',
    eot: 'embedded-opentype',
    svg: 'svg'
  };
  return formats[format?.toLowerCase()] || format;
}

/**
 * Generate @font-face CSS for export
 * Creates portable CSS with relative font paths for custom fonts
 * @param {Array} typefaces - Array of typeface objects with font_files
 * @returns {string} - CSS @font-face rules
 */
export function generateFontFaceCss(typefaces) {
  const rules = [];
  
  for (const typeface of typefaces) {
    if (typeface.source_type === 'custom' && typeface.font_files?.length) {
      for (const fontFile of typeface.font_files) {
        const filename = fontFile.storage_path.split('/').pop();
        rules.push(`
@font-face {
  font-family: '${typeface.family}';
  src: url('./fonts/${typeface.role}/${filename}') format('${getFormatString(fontFile.format)}');
  font-weight: ${fontFile.weight};
  font-style: ${fontFile.style};
  font-display: swap;
}`);
      }
    }
  }
  
  return rules.join('\n');
}

/**
 * Get Google Fonts @import URL for export
 * @param {Array} typefaces - Array of typeface objects
 * @returns {string|null} - CSS @import statement or null if no Google fonts
 */
export function getGoogleFontsImport(typefaces) {
  const googleFonts = typefaces.filter(t => t.source_type === 'google');
  if (googleFonts.length === 0) return null;

  const families = googleFonts.map(f => {
    const weights = (f.weights || [400]).join(';');
    return `family=${encodeURIComponent(f.family)}:wght@${weights}`;
  }).join('&');

  return `@import url('https://fonts.googleapis.com/css2?${families}&display=swap');`;
}

/**
 * Check if a font is available in the browser
 * @param {string} fontFamily - Font family name to check
 * @returns {boolean} - True if font is loaded
 */
export function isFontLoaded(fontFamily) {
  return document.fonts.check(`12px "${fontFamily}"`);
}

/**
 * Wait for a specific font to load
 * @param {string} fontFamily - Font family name
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<boolean>} - True if font loaded, false if timed out
 */
export async function waitForFont(fontFamily, timeout = 5000) {
  const start = Date.now();
  
  while (Date.now() - start < timeout) {
    if (isFontLoaded(fontFamily)) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return false;
}

/**
 * Preload fonts for a list of families
 * Used for preloading common fonts before they're needed
 * @param {Array<string>} families - Array of font family names
 */
export function preloadFonts(families) {
  // Add preconnect for Google Fonts (only once)
  if (!document.querySelector('link[href="https://fonts.gstatic.com"]')) {
    const preconnect = document.createElement('link');
    preconnect.rel = 'preconnect';
    preconnect.href = 'https://fonts.gstatic.com';
    preconnect.crossOrigin = 'anonymous';
    document.head.appendChild(preconnect);
  }
  
  // Also preconnect to Google Fonts API
  if (!document.querySelector('link[href="https://fonts.googleapis.com"]')) {
    const preconnectApi = document.createElement('link');
    preconnectApi.rel = 'preconnect';
    preconnectApi.href = 'https://fonts.googleapis.com';
    document.head.appendChild(preconnectApi);
  }
}

/**
 * Get font loading status for all theme fonts
 * @param {Object} theme - Theme object with typefaces array
 * @returns {Object} - Status object with loaded/total counts
 */
export function getFontLoadingStatus(theme) {
  if (!theme.typefaces?.length) {
    return { loaded: 0, total: 0, complete: true };
  }
  
  let loaded = 0;
  let total = 0;
  
  for (const typeface of theme.typefaces) {
    if (typeface.source_type === 'system') continue;
    
    total++;
    if (isFontLoaded(typeface.family)) {
      loaded++;
    }
  }
  
  return {
    loaded,
    total,
    complete: loaded === total
  };
}

export default {
  loadThemeFonts,
  loadGoogleFont,
  loadGoogleFontFull,
  clearThemeFonts,
  isFontLoaded,
  waitForFont,
  preloadFonts,
  generateFontFaceCss,
  getGoogleFontsImport,
  getFontLoadingStatus,
};
