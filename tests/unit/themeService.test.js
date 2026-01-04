/**
 * @chunk 1.07 - Theme Service Tests
 * 
 * Unit tests for themeService module.
 * Uses mocked Supabase client.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase client
vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
    })),
  },
}));

import { themeService } from '../../src/services/themeService';
import { supabase } from '../../src/lib/supabase';

describe('themeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getThemes', () => {
    it('returns array of themes with token counts', async () => {
      const mockThemes = [
        { id: '1', name: 'Theme 1', slug: 'theme-1', tokens: [{ count: 10 }] },
        { id: '2', name: 'Theme 2', slug: 'theme-2', tokens: [{ count: 5 }] },
      ];

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockThemes, error: null }),
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await themeService.getThemes();

      expect(supabase.from).toHaveBeenCalledWith('themes');
      expect(result).toHaveLength(2);
      expect(result[0].tokenCount).toBe(10);
      expect(result[1].tokenCount).toBe(5);
    });

    it('throws error on failure', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: new Error('DB Error') }),
      };
      supabase.from.mockReturnValue(mockChain);

      await expect(themeService.getThemes()).rejects.toThrow('DB Error');
    });
  });

  describe('getTheme', () => {
    it('returns theme with tokens, typefaces, and typography roles', async () => {
      const mockTheme = {
        id: '1',
        name: 'Theme 1',
        slug: 'theme-1',
        tokens: [{ id: 't1', name: 'Primary' }],
        typefaces: [{ id: 'tf1', family: 'Inter' }],
        typography_roles: [{ id: 'tr1', role_name: 'body-md' }],
      };

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockTheme, error: null }),
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await themeService.getTheme('1');

      expect(supabase.from).toHaveBeenCalledWith('themes');
      expect(result.tokens).toHaveLength(1);
      expect(result.typefaces).toHaveLength(1);
      expect(result.typography_roles).toHaveLength(1);
    });
  });

  describe('getThemeBySlug', () => {
    it('returns theme by slug', async () => {
      const mockTheme = { id: '1', name: 'Theme 1', slug: 'theme-1' };

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockTheme, error: null }),
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await themeService.getThemeBySlug('theme-1');

      expect(mockChain.eq).toHaveBeenCalledWith('slug', 'theme-1');
      expect(result.slug).toBe('theme-1');
    });
  });

  describe('getDefaultTheme', () => {
    it('returns default theme', async () => {
      const mockTheme = { id: '1', name: 'Default', is_default: true };

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockTheme, error: null }),
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await themeService.getDefaultTheme();

      expect(mockChain.eq).toHaveBeenCalledWith('is_default', true);
      expect(result.is_default).toBe(true);
    });

    it('returns null if no default theme', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ 
          data: null, 
          error: { code: 'PGRST116', message: 'No rows found' } 
        }),
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await themeService.getDefaultTheme();

      expect(result).toBeNull();
    });
  });

  describe('createTheme', () => {
    it('creates theme with generated slug', async () => {
      const mockTheme = { id: '1', name: 'My New Theme', slug: 'my-new-theme' };

      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockTheme, error: null }),
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await themeService.createTheme({
        name: 'My New Theme',
        description: 'A test theme',
      });

      expect(mockChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'My New Theme',
          slug: 'my-new-theme',
          description: 'A test theme',
          source: 'manual',
          status: 'draft',
        })
      );
      expect(result.slug).toBe('my-new-theme');
    });

    it('generates correct slug from name with special characters', async () => {
      const mockTheme = { id: '1', name: 'Test Theme! @2024', slug: 'test-theme-2024' };

      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockTheme, error: null }),
      };
      supabase.from.mockReturnValue(mockChain);

      await themeService.createTheme({ name: 'Test Theme! @2024' });

      expect(mockChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: 'test-theme-2024',
        })
      );
    });
  });

  describe('updateTheme', () => {
    it('updates theme and regenerates slug if name changed', async () => {
      const mockTheme = { id: '1', name: 'Updated Theme', slug: 'updated-theme' };

      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockTheme, error: null }),
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await themeService.updateTheme('1', { name: 'Updated Theme' });

      expect(mockChain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Updated Theme',
          slug: 'updated-theme',
        })
      );
      expect(result.slug).toBe('updated-theme');
    });

    it('updates theme without changing slug if name not provided', async () => {
      const mockTheme = { id: '1', description: 'New description' };

      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockTheme, error: null }),
      };
      supabase.from.mockReturnValue(mockChain);

      await themeService.updateTheme('1', { description: 'New description' });

      expect(mockChain.update).toHaveBeenCalledWith({ description: 'New description' });
    });
  });

  describe('deleteTheme', () => {
    it('deletes theme and returns true', async () => {
      const mockChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await themeService.deleteTheme('1');

      expect(supabase.from).toHaveBeenCalledWith('themes');
      expect(mockChain.eq).toHaveBeenCalledWith('id', '1');
      expect(result).toBe(true);
    });
  });

  describe('setDefaultTheme', () => {
    it('unsets other defaults and sets new default', async () => {
      const mockTheme = { id: '1', name: 'New Default', is_default: true };

      // First call: unset all defaults
      const unsetChain = {
        update: vi.fn().mockReturnThis(),
        neq: vi.fn().mockResolvedValue({ error: null }),
      };
      
      // Second call: set new default
      const setChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockTheme, error: null }),
      };

      supabase.from
        .mockReturnValueOnce(unsetChain)
        .mockReturnValueOnce(setChain);

      const result = await themeService.setDefaultTheme('1');

      expect(unsetChain.update).toHaveBeenCalledWith({ is_default: false });
      expect(setChain.update).toHaveBeenCalledWith({ is_default: true });
      expect(result.is_default).toBe(true);
    });
  });

  describe('publishTheme', () => {
    it('updates theme status to published', async () => {
      const mockTheme = { id: '1', status: 'published' };

      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockTheme, error: null }),
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await themeService.publishTheme('1');

      expect(mockChain.update).toHaveBeenCalledWith({ status: 'published' });
      expect(result.status).toBe('published');
    });
  });

  describe('duplicateTheme', () => {
    it('copies tokens, typefaces, and typography roles to new theme', async () => {
      const sourceTheme = {
        id: '1',
        name: 'Source Theme',
        description: 'Original',
        tokens: [{ id: 't1', name: 'Primary', path: 'color/primary', category: 'color', type: 'color', value: {}, css_variable: '--color-primary' }],
        typefaces: [{ id: 'tf1', role: 'text', family: 'Inter', fallback: 'sans-serif', source_type: 'google', weights: [400], is_variable: false }],
        typography_roles: [{ id: 'tr1', role_name: 'body-md', typeface_role: 'text', font_size: '1rem', font_weight: 400, line_height: '1.5', letter_spacing: 'normal' }],
      };
      
      const newTheme = { id: '2', name: 'Copied Theme', slug: 'copied-theme', status: 'draft' };
      const fullNewTheme = { ...newTheme, tokens: sourceTheme.tokens, typefaces: sourceTheme.typefaces, typography_roles: sourceTheme.typography_roles };

      // Mock getTheme (first call for source, second call for result)
      const getThemeChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn()
          .mockResolvedValueOnce({ data: sourceTheme, error: null })
          .mockResolvedValueOnce({ data: fullNewTheme, error: null }),
      };

      // Mock createTheme
      const createChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: newTheme, error: null }),
      };

      // Mock token/typeface/role inserts
      const insertChain = {
        insert: vi.fn().mockResolvedValue({ error: null }),
      };

      supabase.from
        .mockReturnValueOnce(getThemeChain)  // getTheme (source)
        .mockReturnValueOnce(createChain)     // createTheme
        .mockReturnValueOnce(insertChain)     // insert tokens
        .mockReturnValueOnce(insertChain)     // insert typefaces
        .mockReturnValueOnce(insertChain)     // insert typography_roles
        .mockReturnValueOnce(getThemeChain);  // getTheme (result)

      const result = await themeService.duplicateTheme('1', 'Copied Theme');

      // Verify tokens were copied
      expect(supabase.from).toHaveBeenCalledWith('tokens');
      // Verify typefaces were copied
      expect(supabase.from).toHaveBeenCalledWith('typefaces');
      // Verify typography_roles were copied
      expect(supabase.from).toHaveBeenCalledWith('typography_roles');
      
      expect(result).toBeDefined();
    });
  });
});


