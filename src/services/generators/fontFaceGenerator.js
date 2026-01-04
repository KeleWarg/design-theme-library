/**
 * @chunk 5.09 - FontFace Generator
 * 
 * Generates @font-face CSS rules for custom fonts and Google Fonts imports.
 * Groups font files by family/weight/style and creates optimized @font-face rules.
 */

/**
 * Generate @font-face CSS rules for typefaces
 * @param {Array} typefaces - Array of typeface objects with font_files
 * @param {Object} options - Generation options
 * @param {string} options.fontPath - Base path for font files (default: './fonts')
 * @param {boolean} options.includeGoogleFonts - Include Google Fonts @import (default: true)
 * @returns {string} - Generated CSS @font-face rules and imports
 */
export function generateFontFaceCss(typefaces, options = {}) {
  const {
    fontPath = './fonts',
    includeGoogleFonts = true,
  } = options;

  let css = '';
  const googleFonts = [];

  // Process custom fonts
  const customFonts = [];
  for (const typeface of typefaces) {
    if (typeface.source_type === 'google') {
      googleFonts.push(typeface);
      continue;
    }

    if (typeface.source_type === 'custom' && typeface.font_files?.length) {
      customFonts.push(typeface);
    }
  }

  // Group font files by family/weight/style and generate @font-face rules
  if (customFonts.length > 0) {
    const groupedRules = groupFontFilesByStyle(customFonts, fontPath);
    
    for (const rule of groupedRules) {
      css += `@font-face {
  font-family: '${rule.family}';
  font-style: ${rule.style};
  font-weight: ${rule.weight};
  font-display: swap;
  src: ${rule.srcs.join(',\n       ')};
}

`;
    }
  }

  // Add Google Fonts import at the beginning
  if (includeGoogleFonts && googleFonts.length > 0) {
    const googleUrl = buildGoogleFontsUrl(googleFonts);
    css = `@import url('${googleUrl}');

` + css;
  }

  return css.trim();
}

/**
 * Group font files by family/weight/style and build src URLs
 * @param {Array} typefaces - Array of typeface objects with font_files
 * @param {string} fontPath - Base path for font files
 * @returns {Array} - Array of grouped font face rules
 */
function groupFontFilesByStyle(typefaces, fontPath) {
  const grouped = new Map();

  for (const typeface of typefaces) {
    if (!typeface.font_files?.length) continue;

    for (const fontFile of typeface.font_files) {
      const key = `${typeface.family}|${fontFile.weight}|${fontFile.style || 'normal'}`;
      
      if (!grouped.has(key)) {
        grouped.set(key, {
          family: typeface.family,
          weight: fontFile.weight,
          style: fontFile.style || 'normal',
          srcs: [],
        });
      }

      const filename = fontFile.storage_path.split('/').pop();
      const formatName = getFormatString(fontFile.format);
      const url = `url('${fontPath}/${filename}') format('${formatName}')`;
      
      grouped.get(key).srcs.push(url);
    }
  }

  return Array.from(grouped.values());
}

/**
 * Convert font format to CSS format string
 * @param {string} format - Font format (woff2, woff, ttf, otf, etc.)
 * @returns {string} - CSS format string
 */
function getFormatString(format) {
  const formats = {
    woff2: 'woff2',
    woff: 'woff',
    ttf: 'truetype',
    otf: 'opentype',
    eot: 'embedded-opentype',
    svg: 'svg',
  };
  return formats[format?.toLowerCase()] || format;
}

/**
 * Build Google Fonts URL for @import
 * @param {Array} typefaces - Array of Google Font typeface objects
 * @returns {string} - Google Fonts CSS URL
 */
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

/**
 * Get list of font files to include in export package
 * @param {Array} typefaces - Array of typeface objects with font_files
 * @returns {Array} - Array of font file metadata for packaging
 */
export function getFontFilesToInclude(typefaces) {
  const files = [];
  
  for (const typeface of typefaces) {
    if (typeface.source_type === 'custom' && typeface.font_files?.length) {
      for (const fontFile of typeface.font_files) {
        const filename = fontFile.storage_path.split('/').pop();
        files.push({
          storagePath: fontFile.storage_path,
          outputPath: `fonts/${filename}`,
          format: fontFile.format,
          weight: fontFile.weight,
          style: fontFile.style || 'normal',
        });
      }
    }
  }
  
  return files;
}
