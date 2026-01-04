/**
 * @chunk 2.22 - TypefaceForm
 * 
 * Google Fonts API utilities for searching and loading fonts.
 */

// Common system fonts for fallback
export const SYSTEM_FONTS = [
  { family: 'system-ui', category: 'sans-serif' },
  { family: '-apple-system', category: 'sans-serif' },
  { family: 'BlinkMacSystemFont', category: 'sans-serif' },
  { family: 'Segoe UI', category: 'sans-serif' },
  { family: 'Helvetica Neue', category: 'sans-serif' },
  { family: 'Arial', category: 'sans-serif' },
  { family: 'Georgia', category: 'serif' },
  { family: 'Times New Roman', category: 'serif' },
  { family: 'Courier New', category: 'monospace' },
  { family: 'Monaco', category: 'monospace' },
  { family: 'Menlo', category: 'monospace' },
  { family: 'Consolas', category: 'monospace' },
];

// Popular Google Fonts with their available weights
// This list is used for offline search / quick suggestions
export const POPULAR_GOOGLE_FONTS = [
  { family: 'Inter', variants: [100, 200, 300, 400, 500, 600, 700, 800, 900], category: 'sans-serif' },
  { family: 'Roboto', variants: [100, 300, 400, 500, 700, 900], category: 'sans-serif' },
  { family: 'Open Sans', variants: [300, 400, 500, 600, 700, 800], category: 'sans-serif' },
  { family: 'Poppins', variants: [100, 200, 300, 400, 500, 600, 700, 800, 900], category: 'sans-serif' },
  { family: 'Montserrat', variants: [100, 200, 300, 400, 500, 600, 700, 800, 900], category: 'sans-serif' },
  { family: 'Lato', variants: [100, 300, 400, 700, 900], category: 'sans-serif' },
  { family: 'Nunito', variants: [200, 300, 400, 500, 600, 700, 800, 900], category: 'sans-serif' },
  { family: 'Raleway', variants: [100, 200, 300, 400, 500, 600, 700, 800, 900], category: 'sans-serif' },
  { family: 'Work Sans', variants: [100, 200, 300, 400, 500, 600, 700, 800, 900], category: 'sans-serif' },
  { family: 'Source Sans 3', variants: [200, 300, 400, 500, 600, 700, 800, 900], category: 'sans-serif' },
  { family: 'DM Sans', variants: [400, 500, 700], category: 'sans-serif' },
  { family: 'Plus Jakarta Sans', variants: [200, 300, 400, 500, 600, 700, 800], category: 'sans-serif' },
  { family: 'Space Grotesk', variants: [300, 400, 500, 600, 700], category: 'sans-serif' },
  { family: 'Playfair Display', variants: [400, 500, 600, 700, 800, 900], category: 'serif' },
  { family: 'Merriweather', variants: [300, 400, 700, 900], category: 'serif' },
  { family: 'Lora', variants: [400, 500, 600, 700], category: 'serif' },
  { family: 'Source Serif 4', variants: [200, 300, 400, 500, 600, 700, 800, 900], category: 'serif' },
  { family: 'Libre Baskerville', variants: [400, 700], category: 'serif' },
  { family: 'JetBrains Mono', variants: [100, 200, 300, 400, 500, 600, 700, 800], category: 'monospace' },
  { family: 'Fira Code', variants: [300, 400, 500, 600, 700], category: 'monospace' },
  { family: 'Source Code Pro', variants: [200, 300, 400, 500, 600, 700, 800, 900], category: 'monospace' },
  { family: 'IBM Plex Mono', variants: [100, 200, 300, 400, 500, 600, 700], category: 'monospace' },
  { family: 'Roboto Mono', variants: [100, 200, 300, 400, 500, 600, 700], category: 'monospace' },
  { family: 'Inconsolata', variants: [200, 300, 400, 500, 600, 700, 800, 900], category: 'monospace' },
];

// Standard font weights
export const FONT_WEIGHTS = [
  { value: 100, label: 'Thin', name: 'thin' },
  { value: 200, label: 'Extra Light', name: 'extralight' },
  { value: 300, label: 'Light', name: 'light' },
  { value: 400, label: 'Regular', name: 'regular' },
  { value: 500, label: 'Medium', name: 'medium' },
  { value: 600, label: 'Semi Bold', name: 'semibold' },
  { value: 700, label: 'Bold', name: 'bold' },
  { value: 800, label: 'Extra Bold', name: 'extrabold' },
  { value: 900, label: 'Black', name: 'black' },
];

/**
 * Search Google Fonts using local cache for quick results
 * @param {string} query - Search query
 * @returns {Array} - Matching fonts
 */
export function searchGoogleFonts(query) {
  if (!query || query.length < 2) {
    return POPULAR_GOOGLE_FONTS.slice(0, 10);
  }
  
  const lowerQuery = query.toLowerCase();
  
  return POPULAR_GOOGLE_FONTS.filter(font => 
    font.family.toLowerCase().includes(lowerQuery)
  ).slice(0, 10);
}

/**
 * Get available weights for a font family
 * @param {string} family - Font family name
 * @returns {Array<number>|null} - Available weights or null if unknown
 */
export function getAvailableWeights(family) {
  const font = POPULAR_GOOGLE_FONTS.find(
    f => f.family.toLowerCase() === family.toLowerCase()
  );
  return font?.variants || null;
}

/**
 * Get category suggestion based on typeface role
 * @param {string} role - Typeface role (display, text, mono, accent)
 * @returns {string} - Suggested fallback category
 */
export function getSuggestedFallback(role) {
  const suggestions = {
    display: 'sans-serif',
    text: 'sans-serif',
    mono: 'monospace',
    accent: 'cursive',
  };
  return suggestions[role] || 'sans-serif';
}

/**
 * Build Google Fonts CSS link URL
 * @param {string} family - Font family name
 * @param {Array<number>} weights - Weights to include
 * @param {boolean} includeItalic - Include italic variants
 * @returns {string} - Google Fonts CSS URL
 */
export function buildGoogleFontsUrl(family, weights = [400], includeItalic = false) {
  const encodedFamily = encodeURIComponent(family);
  
  if (weights.length === 0) {
    return `https://fonts.googleapis.com/css2?family=${encodedFamily}&display=swap`;
  }
  
  const sortedWeights = [...weights].sort((a, b) => a - b);
  
  if (includeItalic) {
    // Format: family=Inter:ital,wght@0,400;0,700;1,400;1,700
    const weightPairs = [];
    sortedWeights.forEach(w => {
      weightPairs.push(`0,${w}`);
      weightPairs.push(`1,${w}`);
    });
    return `https://fonts.googleapis.com/css2?family=${encodedFamily}:ital,wght@${weightPairs.join(';')}&display=swap`;
  }
  
  // Format: family=Inter:wght@400;700
  return `https://fonts.googleapis.com/css2?family=${encodedFamily}:wght@${sortedWeights.join(';')}&display=swap`;
}

/**
 * Inject Google Font into document head
 * @param {string} family - Font family name  
 * @param {Array<number>} weights - Weights to load
 * @returns {Promise<void>}
 */
export function loadGoogleFont(family, weights = [400]) {
  return new Promise((resolve, reject) => {
    const existingLink = document.querySelector(`link[data-font="${family}"]`);
    
    if (existingLink) {
      // Font already loaded
      resolve();
      return;
    }
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = buildGoogleFontsUrl(family, weights);
    link.setAttribute('data-font', family);
    
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to load font: ${family}`));
    
    document.head.appendChild(link);
  });
}

/**
 * Get font category by family name
 * @param {string} family - Font family name
 * @returns {string} - Font category
 */
export function getFontCategory(family) {
  const font = POPULAR_GOOGLE_FONTS.find(
    f => f.family.toLowerCase() === family.toLowerCase()
  );
  return font?.category || 'sans-serif';
}


