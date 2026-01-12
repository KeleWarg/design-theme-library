# Chunk 5.09 — FontFace Generator

## Purpose
Generate @font-face CSS for custom fonts.

---

## Inputs
- Typefaces with font files

## Outputs
- @font-face CSS string

---

## Dependencies
- Chunk 1.09 must be complete

---

## Implementation Notes

```javascript
// src/services/generators/fontFaceGenerator.js

export function generateFontFaceCss(typefaces, options = {}) {
  const {
    fontPath = './fonts',
    includeGoogleFonts = true,
  } = options;

  let css = '';
  const googleFonts = [];

  for (const typeface of typefaces) {
    if (typeface.source_type === 'google') {
      googleFonts.push(typeface);
      continue;
    }

    if (typeface.source_type === 'custom' && typeface.font_files?.length) {
      for (const fontFile of typeface.font_files) {
        const filename = fontFile.storage_path.split('/').pop();
        css += `@font-face {
  font-family: '${typeface.family}';
  src: url('${fontPath}/${typeface.role}/${filename}') format('${formatName(fontFile.format)}');
  font-weight: ${fontFile.weight};
  font-style: ${fontFile.style};
  font-display: swap;
}

`;
      }
    }
  }

  // Add Google Fonts import
  if (includeGoogleFonts && googleFonts.length > 0) {
    const googleUrl = buildGoogleFontsUrl(googleFonts);
    css = `/* Google Fonts */
@import url('${googleUrl}');

` + css;
  }

  return css;
}

function formatName(format) {
  const formats = {
    woff2: 'woff2',
    woff: 'woff',
    ttf: 'truetype',
    otf: 'opentype',
    eot: 'embedded-opentype',
  };
  return formats[format] || format;
}

function buildGoogleFontsUrl(typefaces) {
  const families = typefaces.map(tf => {
    const weights = tf.weights?.length 
      ? tf.weights.join(';') 
      : '400';
    const family = tf.family.replace(/ /g, '+');
    return `family=${family}:wght@${weights}`;
  });
  
  return `https://fonts.googleapis.com/css2?${families.join('&')}&display=swap`;
}

// Export list of required font files for packaging
export function getFontFilesToInclude(typefaces) {
  const files = [];
  
  for (const typeface of typefaces) {
    if (typeface.source_type === 'custom' && typeface.font_files?.length) {
      for (const fontFile of typeface.font_files) {
        files.push({
          storagePath: fontFile.storage_path,
          outputPath: `fonts/${typeface.role}/${fontFile.storage_path.split('/').pop()}`,
          format: fontFile.format,
          weight: fontFile.weight,
          style: fontFile.style,
        });
      }
    }
  }
  
  return files;
}
```

---

## Files Created
- `src/services/generators/fontFaceGenerator.js` — Font face generation

---

## Tests

### Unit Tests
- [ ] Custom fonts generate @font-face
- [ ] Google Fonts generate @import
- [ ] Font paths correct
- [ ] Format names mapped correctly
- [ ] getFontFilesToInclude returns correct list

---

## Time Estimate
2 hours
