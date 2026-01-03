/**
 * @chunk 1.08 - Token Service Tests
 * 
 * Unit tests for tokenService module.
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
      upsert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
    })),
  },
}));

import { tokenService } from '../../src/services/tokenService';
import { supabase } from '../../src/lib/supabase';

describe('tokenService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTokensByTheme', () => {
    it('returns tokens grouped by category', async () => {
      const mockTokens = [
        { id: '1', name: 'Primary', category: 'color', sort_order: 0 },
        { id: '2', name: 'Secondary', category: 'color', sort_order: 1 },
        { id: '3', name: 'Small', category: 'spacing', sort_order: 0 },
        { id: '4', name: 'Medium', category: 'spacing', sort_order: 1 },
        { id: '5', name: 'Body', category: 'typography', sort_order: 0 },
      ];

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockTokens, error: null }),
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await tokenService.getTokensByTheme('theme-1');

      expect(supabase.from).toHaveBeenCalledWith('tokens');
      expect(mockChain.eq).toHaveBeenCalledWith('theme_id', 'theme-1');
      expect(result.color).toHaveLength(2);
      expect(result.spacing).toHaveLength(2);
      expect(result.typography).toHaveLength(1);
    });

    it('returns empty object when no tokens', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await tokenService.getTokensByTheme('theme-1');

      expect(result).toEqual({});
    });

    it('throws error on failure', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: new Error('DB Error') }),
      };
      supabase.from.mockReturnValue(mockChain);

      await expect(tokenService.getTokensByTheme('theme-1')).rejects.toThrow('DB Error');
    });
  });

  describe('getTokensByThemeFlat', () => {
    it('returns flat array of tokens', async () => {
      const mockTokens = [
        { id: '1', name: 'Primary', category: 'color' },
        { id: '2', name: 'Secondary', category: 'color' },
      ];

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockTokens, error: null }),
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await tokenService.getTokensByThemeFlat('theme-1');

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
    });
  });

  describe('getToken', () => {
    it('returns single token by id', async () => {
      const mockToken = { id: '1', name: 'Primary', category: 'color' };

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockToken, error: null }),
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await tokenService.getToken('1');

      expect(mockChain.eq).toHaveBeenCalledWith('id', '1');
      expect(result.name).toBe('Primary');
    });
  });

  describe('getTokenByPath', () => {
    it('finds token by path within theme', async () => {
      const mockToken = { id: '1', name: 'Primary', path: 'Color/Primary/500' };

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockToken, error: null }),
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await tokenService.getTokenByPath('theme-1', 'Color/Primary/500');

      expect(mockChain.eq).toHaveBeenCalledWith('theme_id', 'theme-1');
      expect(mockChain.eq).toHaveBeenCalledWith('path', 'Color/Primary/500');
      expect(result.path).toBe('Color/Primary/500');
    });
  });

  describe('createToken', () => {
    it('creates token and returns created data', async () => {
      const mockToken = { 
        id: '1', 
        name: 'Primary', 
        theme_id: 'theme-1',
        category: 'color',
        value: { hex: '#657E79' }
      };

      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockToken, error: null }),
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await tokenService.createToken('theme-1', {
        name: 'Primary',
        category: 'color',
        value: { hex: '#657E79' }
      });

      expect(mockChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          theme_id: 'theme-1',
          name: 'Primary',
          category: 'color',
        })
      );
      expect(result.id).toBe('1');
    });
  });

  describe('updateToken', () => {
    it('updates token and returns updated data', async () => {
      const mockToken = { id: '1', name: 'Primary Updated', value: { hex: '#000000' } };

      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockToken, error: null }),
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await tokenService.updateToken('1', { value: { hex: '#000000' } });

      expect(mockChain.update).toHaveBeenCalledWith({ value: { hex: '#000000' } });
      expect(mockChain.eq).toHaveBeenCalledWith('id', '1');
      expect(result.value.hex).toBe('#000000');
    });
  });

  describe('bulkCreateTokens', () => {
    it('creates multiple tokens with theme_id and sort_order', async () => {
      const mockTokens = [
        { id: '1', name: 'Primary', theme_id: 'theme-1', sort_order: 0 },
        { id: '2', name: 'Secondary', theme_id: 'theme-1', sort_order: 1 },
      ];

      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({ data: mockTokens, error: null }),
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await tokenService.bulkCreateTokens('theme-1', [
        { name: 'Primary', category: 'color' },
        { name: 'Secondary', category: 'color' },
      ]);

      expect(mockChain.insert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ theme_id: 'theme-1', sort_order: 0 }),
          expect.objectContaining({ theme_id: 'theme-1', sort_order: 1 }),
        ])
      );
      expect(result).toHaveLength(2);
    });

    it('preserves existing sort_order if provided', async () => {
      const mockTokens = [
        { id: '1', name: 'Primary', sort_order: 5 },
        { id: '2', name: 'Secondary', sort_order: 10 },
      ];

      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({ data: mockTokens, error: null }),
      };
      supabase.from.mockReturnValue(mockChain);

      await tokenService.bulkCreateTokens('theme-1', [
        { name: 'Primary', sort_order: 5 },
        { name: 'Secondary', sort_order: 10 },
      ]);

      expect(mockChain.insert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ sort_order: 5 }),
          expect.objectContaining({ sort_order: 10 }),
        ])
      );
    });
  });

  describe('bulkUpdateTokens', () => {
    it('updates multiple tokens', async () => {
      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn()
          .mockResolvedValueOnce({ data: { id: '1', name: 'Updated 1' }, error: null })
          .mockResolvedValueOnce({ data: { id: '2', name: 'Updated 2' }, error: null }),
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await tokenService.bulkUpdateTokens([
        { id: '1', name: 'Updated 1' },
        { id: '2', name: 'Updated 2' },
      ]);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Updated 1');
      expect(result[1].name).toBe('Updated 2');
    });
  });

  describe('deleteToken', () => {
    it('deletes token and returns true', async () => {
      const mockChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await tokenService.deleteToken('1');

      expect(supabase.from).toHaveBeenCalledWith('tokens');
      expect(mockChain.eq).toHaveBeenCalledWith('id', '1');
      expect(result).toBe(true);
    });
  });

  describe('deleteTokensByCategory', () => {
    it('deletes all tokens in category for theme', async () => {
      const mockChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockImplementation(function() { 
          // Return the chain itself for chaining, but resolve to { error: null } when awaited
          const self = this;
          return {
            eq: vi.fn().mockResolvedValue({ error: null }),
            then: (resolve) => resolve({ error: null })
          };
        }),
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await tokenService.deleteTokensByCategory('theme-1', 'color');

      expect(supabase.from).toHaveBeenCalledWith('tokens');
      expect(mockChain.delete).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('deleteTokensByTheme', () => {
    it('deletes all tokens for a theme', async () => {
      const mockChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await tokenService.deleteTokensByTheme('theme-1');

      expect(mockChain.eq).toHaveBeenCalledWith('theme_id', 'theme-1');
      expect(result).toBe(true);
    });
  });

  describe('searchTokens', () => {
    it('finds tokens by path or name', async () => {
      const mockTokens = [
        { id: '1', name: 'Primary', path: 'Color/Primary/500' },
        { id: '2', name: 'Primary Light', path: 'Color/Primary/300' },
      ];

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockResolvedValue({ data: mockTokens, error: null }),
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await tokenService.searchTokens('theme-1', 'Primary');

      expect(mockChain.eq).toHaveBeenCalledWith('theme_id', 'theme-1');
      expect(mockChain.or).toHaveBeenCalledWith('path.ilike.%Primary%,name.ilike.%Primary%');
      expect(result).toHaveLength(2);
    });
  });

  describe('reorderTokens', () => {
    it('updates sort_order for tokens', async () => {
      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn()
          .mockResolvedValueOnce({ data: { id: '3', sort_order: 0 }, error: null })
          .mockResolvedValueOnce({ data: { id: '1', sort_order: 1 }, error: null })
          .mockResolvedValueOnce({ data: { id: '2', sort_order: 2 }, error: null }),
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await tokenService.reorderTokens('theme-1', 'color', ['3', '1', '2']);

      expect(result).toHaveLength(3);
      expect(result[0].sort_order).toBe(0);
      expect(result[1].sort_order).toBe(1);
      expect(result[2].sort_order).toBe(2);
    });
  });

  describe('getTokenCountsByCategory', () => {
    it('returns count by category', async () => {
      const mockTokens = [
        { category: 'color' },
        { category: 'color' },
        { category: 'color' },
        { category: 'spacing' },
        { category: 'spacing' },
        { category: 'typography' },
      ];

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: mockTokens, error: null }),
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await tokenService.getTokenCountsByCategory('theme-1');

      expect(result.color).toBe(3);
      expect(result.spacing).toBe(2);
      expect(result.typography).toBe(1);
    });
  });

  describe('upsertTokens', () => {
    it('upserts tokens based on theme_id and path', async () => {
      const mockTokens = [
        { id: '1', name: 'Primary', path: 'Color/Primary/500', theme_id: 'theme-1' },
        { id: '2', name: 'Secondary', path: 'Color/Secondary/500', theme_id: 'theme-1' },
      ];

      const mockChain = {
        upsert: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({ data: mockTokens, error: null }),
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await tokenService.upsertTokens('theme-1', [
        { name: 'Primary', path: 'Color/Primary/500' },
        { name: 'Secondary', path: 'Color/Secondary/500' },
      ]);

      expect(mockChain.upsert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ theme_id: 'theme-1' }),
        ]),
        { onConflict: 'theme_id,path', ignoreDuplicates: false }
      );
      expect(result).toHaveLength(2);
    });
  });
});

