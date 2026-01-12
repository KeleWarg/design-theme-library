# Chunk 2.25 — Font Loading System

## Purpose
Comprehensive font loading for Google Fonts, Adobe Fonts, system fonts, and custom uploads.

---

## Inputs
- Theme typefaces data
- typefaceService (from chunk 1.09)

## Outputs
- Enhanced fontLoader module
- @font-face CSS generation

---

## Dependencies
- Chunk 2.23 must be complete

---

## Implementation Notes

### Font Loading Strategy
| Source | Strategy |
|--------|----------|
| Google | Inject `<link>` to Google Fonts CSS |
| Adobe | User provides kit ID |
| System | No loading needed |
| Custom | Generate @font-face rules |

### Enhanced Font Loader

```javascript
// src/lib/fontLoader.js
import { typefaceService } from '../services/typefaceService';

export async function loadThemeFonts(theme) {
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
        // Adobe Fonts loaded via kit script
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

  // Load Google Fonts
  if (googleFonts.length > 0) {
    await loadGoogleFonts(googleFonts);
  }

  // Inject custom @font-face rules
  if (fontFaceRules.length > 0) {
    injectFontFaceRules(fontFaceRules);
  }

  // Wait for all fonts to load
  await document.fonts.ready;
}

async function loadGoogleFonts(fonts) {
  return new Promise((resolve, reject) => {
    // Remove existing
    const existing = document.getElementById('google-fonts');
    if (existing) existing.remove();

    // Build URL
    const families = fonts.map(f => {
      const weights = f.weights.join(';');
      return `family=${encodeURIComponent(f.family)}:wght@${weights}`;
    }).join('&');

    const link = document.createElement('link');
    link.id = 'google-fonts';
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
    link.onload = resolve;
    link.onerror = reject;
    document.head.appendChild(link);
  });
}

async function loadAdobeKit(kitId) {
  return new Promise((resolve, reject) => {
    const existing = document.getElementById('adobe-fonts');
    if (existing) existing.remove();

    const script = document.createElement('script');
    script.id = 'adobe-fonts';
    script.src = `https://use.typekit.net/${kitId}.js`;
    script.onload = () => {
      try {
        window.Typekit.load({ async: true });
        resolve();
      } catch (e) {
        reject(e);
      }
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function injectFontFaceRules(rules) {
  let styleEl = document.getElementById('custom-fonts');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'custom-fonts';
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = rules.join('\n');
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

// Generate @font-face CSS for export
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

// Get Google Fonts import URL for export
export function getGoogleFontsImport(typefaces) {
  const googleFonts = typefaces.filter(t => t.source_type === 'google');
  if (googleFonts.length === 0) return null;

  const families = googleFonts.map(f => {
    const weights = (f.weights || [400]).join(';');
    return `family=${encodeURIComponent(f.family)}:wght@${weights}`;
  }).join('&');

  return `@import url('https://fonts.googleapis.com/css2?${families}&display=swap');`;
}
```

---

## Files Created
- `src/lib/fontLoader.js` — Font loading utilities (enhanced)

---

## Tests

### Unit Tests
- [ ] Google Fonts URL generated correctly
- [ ] Multiple weights in URL
- [ ] @font-face rules generated correctly
- [ ] Custom fonts inject into DOM
- [ ] Adobe kit loads script
- [ ] document.fonts.ready awaited
- [ ] Export CSS generated correctly

---

## Time Estimate
2 hours

---

## Notes
Font loading is async and should show a loading state in the UI. The `font-display: swap` ensures text is visible while fonts load.
