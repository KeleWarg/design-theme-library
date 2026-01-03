/**
 * @chunk 2.25 - Font Loader Tests
 * 
 * Unit tests for the font loading system.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
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
} from '../../src/lib/fontLoader';

// Mock the typefaceService
vi.mock('../../src/services/typefaceService', () => ({
  typefaceService: {
    getFontUrl: vi.fn((path) => `https://storage.supabase.co/fonts/${path}`),
  },
}));

describe('fontLoader', () => {
  beforeEach(() => {
    // Clear the document head before each test
    document.head.innerHTML = '';
    
    // Mock document.fonts
    Object.defineProperty(document, 'fonts', {
      value: {
        ready: Promise.resolve(),
        check: vi.fn(() => true),
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('loadGoogleFont', () => {
    it('creates a link element with correct Google Fonts URL', async () => {
      await loadGoogleFont('Roboto', [400, 700]);
      
      const link = document.querySelector('link[href*="fonts.googleapis.com"]');
      expect(link).toBeTruthy();
      expect(link.href).toContain('family=Roboto');
      expect(link.href).toContain('wght@400;700');
      expect(link.href).toContain('display=swap');
    });

    it('handles multiple weights correctly', async () => {
      await loadGoogleFont('Open Sans', [300, 400, 500, 600, 700]);
      
      const link = document.querySelector('link[href*="fonts.googleapis.com"]');
      expect(link.href).toContain('wght@300;400;500;600;700');
    });

    it('sorts weights in ascending order', async () => {
      await loadGoogleFont('Roboto', [700, 400, 300]);
      
      const link = document.querySelector('link[href*="fonts.googleapis.com"]');
      expect(link.href).toContain('wght@300;400;700');
    });

    it('does not add duplicate links for same font', async () => {
      await loadGoogleFont('Roboto', [400]);
      await loadGoogleFont('Roboto', [700]);
      
      const links = document.querySelectorAll('link[href*="Roboto"]');
      expect(links.length).toBe(1);
    });

    it('defaults to weight 400 if no weights provided', async () => {
      await loadGoogleFont('Roboto');
      
      const link = document.querySelector('link[href*="fonts.googleapis.com"]');
      expect(link.href).toContain('wght@400');
    });
  });

  describe('loadGoogleFontFull', () => {
    it('includes italic variants when specified', async () => {
      await loadGoogleFontFull('Roboto', [400, 700], true);
      
      const link = document.querySelector('link[href*="fonts.googleapis.com"]');
      expect(link.href).toContain('ital,wght@');
      expect(link.href).toContain('0,400');
      expect(link.href).toContain('1,400');
      expect(link.href).toContain('0,700');
      expect(link.href).toContain('1,700');
    });

    it('does not include italics by default', async () => {
      await loadGoogleFontFull('Roboto', [400, 700], false);
      
      const link = document.querySelector('link[href*="fonts.googleapis.com"]');
      expect(link.href).not.toContain('ital');
    });
  });

  describe('loadThemeFonts', () => {
    it('handles empty typefaces array', async () => {
      await loadThemeFonts({ typefaces: [] });
      const links = document.querySelectorAll('link');
      expect(links.length).toBe(0);
    });

    it('handles theme without typefaces', async () => {
      await loadThemeFonts({});
      const links = document.querySelectorAll('link');
      expect(links.length).toBe(0);
    });

    it('loads Google Fonts from theme', async () => {
      const theme = {
        typefaces: [
          { source_type: 'google', family: 'Roboto', weights: [400, 700] },
          { source_type: 'google', family: 'Open Sans', weights: [400] },
        ],
      };

      // Mock link onload to fire immediately
      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        const el = originalCreateElement(tag);
        if (tag === 'link') {
          // Simulate immediate load
          setTimeout(() => el.onload?.(), 0);
        }
        return el;
      });

      await loadThemeFonts(theme);

      const link = document.getElementById('google-fonts');
      expect(link).toBeTruthy();
      expect(link.href).toContain('family=Roboto');
      expect(link.href).toContain('family=Open%20Sans');
      
      document.createElement.mockRestore();
    });

    it('injects @font-face rules for custom fonts', async () => {
      const theme = {
        typefaces: [
          {
            source_type: 'custom',
            family: 'Custom Font',
            font_files: [
              { storage_path: 'theme1/display/custom-400.woff2', format: 'woff2', weight: 400, style: 'normal' },
            ],
          },
        ],
      };

      await loadThemeFonts(theme);

      const styleEl = document.getElementById('custom-fonts');
      expect(styleEl).toBeTruthy();
      expect(styleEl.textContent).toContain('@font-face');
      expect(styleEl.textContent).toContain("font-family: 'Custom Font'");
      expect(styleEl.textContent).toContain('font-weight: 400');
      expect(styleEl.textContent).toContain("format('woff2')");
    });

    it('skips system fonts (no loading needed)', async () => {
      const theme = {
        typefaces: [
          { source_type: 'system', family: 'Arial' },
        ],
      };

      await loadThemeFonts(theme);

      const links = document.querySelectorAll('link');
      const styles = document.querySelectorAll('style');
      expect(links.length).toBe(0);
      expect(styles.length).toBe(0);
    });
  });

  describe('clearThemeFonts', () => {
    it('removes custom font style element', async () => {
      const style = document.createElement('style');
      style.id = 'custom-fonts';
      document.head.appendChild(style);

      clearThemeFonts();

      expect(document.getElementById('custom-fonts')).toBeNull();
    });

    it('removes Google Fonts link', async () => {
      const link = document.createElement('link');
      link.id = 'google-fonts';
      link.href = 'https://fonts.googleapis.com/css2';
      document.head.appendChild(link);

      clearThemeFonts();

      expect(document.getElementById('google-fonts')).toBeNull();
    });

    it('removes Adobe Fonts script', async () => {
      const script = document.createElement('script');
      script.id = 'adobe-fonts';
      document.head.appendChild(script);

      clearThemeFonts();

      expect(document.getElementById('adobe-fonts')).toBeNull();
    });

    it('removes legacy theme-fonts style element', async () => {
      const style = document.createElement('style');
      style.id = 'theme-fonts';
      document.head.appendChild(style);

      clearThemeFonts();

      expect(document.getElementById('theme-fonts')).toBeNull();
    });
  });

  describe('generateFontFaceCss', () => {
    it('generates @font-face rules for custom fonts', () => {
      const typefaces = [
        {
          source_type: 'custom',
          family: 'Custom Font',
          role: 'display',
          font_files: [
            { storage_path: 'theme1/display/custom-400.woff2', format: 'woff2', weight: 400, style: 'normal' },
            { storage_path: 'theme1/display/custom-700.woff2', format: 'woff2', weight: 700, style: 'normal' },
          ],
        },
      ];

      const css = generateFontFaceCss(typefaces);

      expect(css).toContain('@font-face');
      expect(css).toContain("font-family: 'Custom Font'");
      expect(css).toContain("src: url('./fonts/display/custom-400.woff2')");
      expect(css).toContain("src: url('./fonts/display/custom-700.woff2')");
      expect(css).toContain('font-weight: 400');
      expect(css).toContain('font-weight: 700');
      expect(css).toContain('font-display: swap');
    });

    it('returns empty string for non-custom fonts', () => {
      const typefaces = [
        { source_type: 'google', family: 'Roboto', weights: [400] },
        { source_type: 'system', family: 'Arial' },
      ];

      const css = generateFontFaceCss(typefaces);

      expect(css).toBe('');
    });

    it('handles different font formats correctly', () => {
      const typefaces = [
        {
          source_type: 'custom',
          family: 'Test Font',
          role: 'text',
          font_files: [
            { storage_path: 'theme1/text/test.woff2', format: 'woff2', weight: 400, style: 'normal' },
            { storage_path: 'theme1/text/test.woff', format: 'woff', weight: 400, style: 'normal' },
            { storage_path: 'theme1/text/test.ttf', format: 'ttf', weight: 400, style: 'normal' },
            { storage_path: 'theme1/text/test.otf', format: 'otf', weight: 400, style: 'normal' },
          ],
        },
      ];

      const css = generateFontFaceCss(typefaces);

      expect(css).toContain("format('woff2')");
      expect(css).toContain("format('woff')");
      expect(css).toContain("format('truetype')");
      expect(css).toContain("format('opentype')");
    });
  });

  describe('getGoogleFontsImport', () => {
    it('generates @import URL for Google fonts', () => {
      const typefaces = [
        { source_type: 'google', family: 'Roboto', weights: [400, 700] },
        { source_type: 'google', family: 'Open Sans', weights: [400] },
      ];

      const importStatement = getGoogleFontsImport(typefaces);

      expect(importStatement).toContain("@import url('https://fonts.googleapis.com/css2?");
      expect(importStatement).toContain('family=Roboto');
      expect(importStatement).toContain('family=Open%20Sans');
      expect(importStatement).toContain('display=swap');
    });

    it('returns null if no Google fonts', () => {
      const typefaces = [
        { source_type: 'custom', family: 'Custom Font' },
        { source_type: 'system', family: 'Arial' },
      ];

      const importStatement = getGoogleFontsImport(typefaces);

      expect(importStatement).toBeNull();
    });

    it('defaults to weight 400 if no weights specified', () => {
      const typefaces = [
        { source_type: 'google', family: 'Roboto' },
      ];

      const importStatement = getGoogleFontsImport(typefaces);

      expect(importStatement).toContain('wght@400');
    });

    it('includes multiple weights in URL', () => {
      const typefaces = [
        { source_type: 'google', family: 'Roboto', weights: [300, 400, 500, 700] },
      ];

      const importStatement = getGoogleFontsImport(typefaces);

      expect(importStatement).toContain('wght@300;400;500;700');
    });
  });

  describe('isFontLoaded', () => {
    it('returns true when font is loaded', () => {
      document.fonts.check = vi.fn(() => true);
      expect(isFontLoaded('Roboto')).toBe(true);
      expect(document.fonts.check).toHaveBeenCalledWith('12px "Roboto"');
    });

    it('returns false when font is not loaded', () => {
      document.fonts.check = vi.fn(() => false);
      expect(isFontLoaded('Unknown Font')).toBe(false);
    });
  });

  describe('waitForFont', () => {
    it('returns true when font loads within timeout', async () => {
      let callCount = 0;
      document.fonts.check = vi.fn(() => {
        callCount++;
        return callCount > 2; // Return true after 2 checks
      });

      const result = await waitForFont('Roboto', 1000);
      expect(result).toBe(true);
    });

    it('returns false when font does not load within timeout', async () => {
      document.fonts.check = vi.fn(() => false);

      const result = await waitForFont('Unknown Font', 200);
      expect(result).toBe(false);
    });
  });

  describe('preloadFonts', () => {
    it('adds preconnect link for Google Fonts', () => {
      preloadFonts(['Roboto']);

      const preconnect = document.querySelector('link[rel="preconnect"][href="https://fonts.gstatic.com"]');
      expect(preconnect).toBeTruthy();
      expect(preconnect.crossOrigin).toBe('anonymous');
    });

    it('adds preconnect for Google Fonts API', () => {
      preloadFonts(['Roboto']);

      const preconnect = document.querySelector('link[rel="preconnect"][href="https://fonts.googleapis.com"]');
      expect(preconnect).toBeTruthy();
    });

    it('does not add duplicate preconnect links', () => {
      preloadFonts(['Roboto']);
      preloadFonts(['Open Sans']);

      const preconnects = document.querySelectorAll('link[rel="preconnect"][href="https://fonts.gstatic.com"]');
      expect(preconnects.length).toBe(1);
    });
  });

  describe('getFontLoadingStatus', () => {
    it('returns complete status for empty typefaces', () => {
      const status = getFontLoadingStatus({ typefaces: [] });
      expect(status).toEqual({ loaded: 0, total: 0, complete: true });
    });

    it('returns complete status for theme without typefaces', () => {
      const status = getFontLoadingStatus({});
      expect(status).toEqual({ loaded: 0, total: 0, complete: true });
    });

    it('counts loaded fonts correctly', () => {
      document.fonts.check = vi.fn((str) => str.includes('Roboto'));

      const theme = {
        typefaces: [
          { source_type: 'google', family: 'Roboto' },
          { source_type: 'google', family: 'Open Sans' },
        ],
      };

      const status = getFontLoadingStatus(theme);
      expect(status.loaded).toBe(1);
      expect(status.total).toBe(2);
      expect(status.complete).toBe(false);
    });

    it('skips system fonts in count', () => {
      document.fonts.check = vi.fn(() => true);

      const theme = {
        typefaces: [
          { source_type: 'google', family: 'Roboto' },
          { source_type: 'system', family: 'Arial' },
        ],
      };

      const status = getFontLoadingStatus(theme);
      expect(status.total).toBe(1);
    });
  });
});

