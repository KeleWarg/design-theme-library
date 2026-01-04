/**
 * @chunk 5.09 - FontFace Generator Tests
 */

import { describe, it, expect } from 'vitest';
import { generateFontFaceCss, getFontFilesToInclude } from '../../src/services/generators/fontFaceGenerator';

describe('fontFaceGenerator', () => {
  describe('generateFontFaceCss', () => {
    it('generates @font-face rules for custom fonts', () => {
      const typefaces = [
        {
          source_type: 'custom',
          family: 'Inter',
          role: 'text',
          font_files: [
            { storage_path: 'theme1/text/inter-400.woff2', format: 'woff2', weight: 400, style: 'normal' },
            { storage_path: 'theme1/text/inter-700.woff2', format: 'woff2', weight: 700, style: 'normal' },
          ],
        },
      ];

      const css = generateFontFaceCss(typefaces);

      expect(css).toContain('@font-face');
      expect(css).toContain("font-family: 'Inter'");
      expect(css).toContain("url('./fonts/inter-400.woff2')");
      expect(css).toContain("url('./fonts/inter-700.woff2')");
      expect(css).toContain('font-weight: 400');
      expect(css).toContain('font-weight: 700');
      expect(css).toContain('font-style: normal');
      expect(css).toContain('font-display: swap');
    });

    it('groups multiple formats per font-face rule', () => {
      const typefaces = [
        {
          source_type: 'custom',
          family: 'Inter',
          role: 'text',
          font_files: [
            { storage_path: 'theme1/text/inter-400.woff2', format: 'woff2', weight: 400, style: 'normal' },
            { storage_path: 'theme1/text/inter-400.woff', format: 'woff', weight: 400, style: 'normal' },
            { storage_path: 'theme1/text/inter-400.ttf', format: 'ttf', weight: 400, style: 'normal' },
          ],
        },
      ];

      const css = generateFontFaceCss(typefaces);

      // Should have one @font-face rule for weight 400
      const ruleCount = (css.match(/@font-face/g) || []).length;
      expect(ruleCount).toBe(1);
      
      // Should contain all three formats
      expect(css).toContain("url('./fonts/inter-400.woff2') format('woff2')");
      expect(css).toContain("url('./fonts/inter-400.woff') format('woff')");
      expect(css).toContain("url('./fonts/inter-400.ttf') format('truetype')");
    });

    it('generates separate @font-face rules for different weights/styles', () => {
      const typefaces = [
        {
          source_type: 'custom',
          family: 'Inter',
          role: 'text',
          font_files: [
            { storage_path: 'theme1/text/inter-400.woff2', format: 'woff2', weight: 400, style: 'normal' },
            { storage_path: 'theme1/text/inter-700.woff2', format: 'woff2', weight: 700, style: 'normal' },
            { storage_path: 'theme1/text/inter-400-italic.woff2', format: 'woff2', weight: 400, style: 'italic' },
          ],
        },
      ];

      const css = generateFontFaceCss(typefaces);

      // Should have three @font-face rules
      const ruleCount = (css.match(/@font-face/g) || []).length;
      expect(ruleCount).toBe(3);
      
      expect(css).toContain('font-weight: 400');
      expect(css).toContain('font-weight: 700');
      expect(css).toContain('font-style: normal');
      expect(css).toContain('font-style: italic');
    });

    it('generates @import for Google Fonts', () => {
      const typefaces = [
        {
          source_type: 'google',
          family: 'Inter',
          weights: [400, 700],
        },
        {
          source_type: 'google',
          family: 'Roboto',
          weights: [500],
        },
      ];

      const css = generateFontFaceCss(typefaces);

      expect(css).toContain('@import url(');
      expect(css).toContain('fonts.googleapis.com/css2');
      expect(css).toContain('Inter');
      expect(css).toContain('Roboto');
      expect(css).toContain('wght@400;700');
      expect(css).toContain('wght@500');
      expect(css).toContain('display=swap');
    });

    it('handles both custom and Google Fonts', () => {
      const typefaces = [
        {
          source_type: 'custom',
          family: 'Custom Font',
          role: 'display',
          font_files: [
            { storage_path: 'theme1/display/custom-400.woff2', format: 'woff2', weight: 400, style: 'normal' },
          ],
        },
        {
          source_type: 'google',
          family: 'Inter',
          weights: [400, 700],
        },
      ];

      const css = generateFontFaceCss(typefaces);

      // Should have @import for Google Fonts at the beginning
      expect(css).toContain('@import url(');
      // Should have @font-face for custom fonts
      expect(css).toContain('@font-face');
      expect(css).toContain("font-family: 'Custom Font'");
    });

    it('maps font format names correctly', () => {
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

    it('uses custom fontPath option', () => {
      const typefaces = [
        {
          source_type: 'custom',
          family: 'Inter',
          role: 'text',
          font_files: [
            { storage_path: 'theme1/text/inter-400.woff2', format: 'woff2', weight: 400, style: 'normal' },
          ],
        },
      ];

      const css = generateFontFaceCss(typefaces, { fontPath: '/assets/fonts' });

      expect(css).toContain("url('/assets/fonts/inter-400.woff2')");
    });

    it('excludes Google Fonts when includeGoogleFonts is false', () => {
      const typefaces = [
        {
          source_type: 'google',
          family: 'Inter',
          weights: [400, 700],
        },
      ];

      const css = generateFontFaceCss(typefaces, { includeGoogleFonts: false });

      expect(css).not.toContain('@import');
      expect(css).toBe('');
    });

    it('returns empty string for no typefaces', () => {
      const css = generateFontFaceCss([]);
      expect(css).toBe('');
    });

    it('returns empty string for non-custom fonts without Google Fonts', () => {
      const typefaces = [
        { source_type: 'system', family: 'Arial' },
        { source_type: 'adobe', family: 'Source Sans Pro' },
      ];

      const css = generateFontFaceCss(typefaces, { includeGoogleFonts: false });
      expect(css).toBe('');
    });

    it('handles typefaces without font_files', () => {
      const typefaces = [
        {
          source_type: 'custom',
          family: 'Inter',
          role: 'text',
          font_files: [],
        },
      ];

      const css = generateFontFaceCss(typefaces);
      expect(css).toBe('');
    });
  });

  describe('getFontFilesToInclude', () => {
    it('returns font files for custom typefaces', () => {
      const typefaces = [
        {
          source_type: 'custom',
          family: 'Inter',
          role: 'text',
          font_files: [
            { storage_path: 'theme1/text/inter-400.woff2', format: 'woff2', weight: 400, style: 'normal' },
            { storage_path: 'theme1/text/inter-700.woff2', format: 'woff2', weight: 700, style: 'normal' },
          ],
        },
      ];

      const files = getFontFilesToInclude(typefaces);

      expect(files).toHaveLength(2);
      expect(files[0]).toEqual({
        storagePath: 'theme1/text/inter-400.woff2',
        outputPath: 'fonts/inter-400.woff2',
        format: 'woff2',
        weight: 400,
        style: 'normal',
      });
      expect(files[1]).toEqual({
        storagePath: 'theme1/text/inter-700.woff2',
        outputPath: 'fonts/inter-700.woff2',
        format: 'woff2',
        weight: 700,
        style: 'normal',
      });
    });

    it('excludes Google Fonts', () => {
      const typefaces = [
        {
          source_type: 'google',
          family: 'Inter',
          weights: [400, 700],
        },
        {
          source_type: 'custom',
          family: 'Custom Font',
          role: 'text',
          font_files: [
            { storage_path: 'theme1/text/custom-400.woff2', format: 'woff2', weight: 400, style: 'normal' },
          ],
        },
      ];

      const files = getFontFilesToInclude(typefaces);

      expect(files).toHaveLength(1);
      expect(files[0].storagePath).toBe('theme1/text/custom-400.woff2');
    });

    it('handles italic style', () => {
      const typefaces = [
        {
          source_type: 'custom',
          family: 'Inter',
          role: 'text',
          font_files: [
            { storage_path: 'theme1/text/inter-400-italic.woff2', format: 'woff2', weight: 400, style: 'italic' },
          ],
        },
      ];

      const files = getFontFilesToInclude(typefaces);

      expect(files[0].style).toBe('italic');
    });

    it('defaults style to normal if missing', () => {
      const typefaces = [
        {
          source_type: 'custom',
          family: 'Inter',
          role: 'text',
          font_files: [
            { storage_path: 'theme1/text/inter-400.woff2', format: 'woff2', weight: 400 },
          ],
        },
      ];

      const files = getFontFilesToInclude(typefaces);

      expect(files[0].style).toBe('normal');
    });

    it('returns empty array for no custom fonts', () => {
      const typefaces = [
        { source_type: 'google', family: 'Inter', weights: [400] },
        { source_type: 'system', family: 'Arial' },
      ];

      const files = getFontFilesToInclude(typefaces);
      expect(files).toEqual([]);
    });

    it('returns empty array for empty typefaces', () => {
      const files = getFontFilesToInclude([]);
      expect(files).toEqual([]);
    });
  });
});





