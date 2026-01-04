/**
 * @chunk 6.04 - Integration Tests
 * 
 * Integration tests for themeService.
 * Tests database operations with mocked Supabase client.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

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

describe('Theme Service Integration', () => {
  let testThemeId;

  beforeEach(() => {
    vi.clearAllMocks();
    testThemeId = 'test-theme-id-123';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getThemes', () => {
    it('returns array of themes', async () => {
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
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(result[0].tokenCount).toBe(10);
    });
  });

  describe('createTheme', () => {
    it('creates and returns theme', async () => {
      const newTheme = {
        id: testThemeId,
        name: 'Integration Test Theme',
        slug: 'integration-test-theme',
        description: 'Created by integration test',
        source: 'manual',
      };

      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: newTheme, error: null }),
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await themeService.createTheme({
        name: 'Integration Test Theme',
        description: 'Created by integration test',
        source: 'manual',
      });

      expect(result.id).toBeDefined();
      expect(result.slug).toBe('integration-test-theme');
      expect(result.name).toBe('Integration Test Theme');
    });
  });

  describe('updateTheme', () => {
    it('updates fields', async () => {
      const updatedTheme = {
        id: testThemeId,
        name: 'Updated Theme',
        slug: 'updated-theme',
        description: 'Updated description',
      };

      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updatedTheme, error: null }),
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await themeService.updateTheme(testThemeId, {
        description: 'Updated description',
      });

      expect(result.description).toBe('Updated description');
      expect(mockChain.update).toHaveBeenCalled();
      expect(mockChain.eq).toHaveBeenCalledWith('id', testThemeId);
    });
  });

  describe('deleteTheme', () => {
    it('removes theme', async () => {
      const mockChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      supabase.from.mockReturnValue(mockChain);

      const result = await themeService.deleteTheme(testThemeId);

      expect(result).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('themes');
      expect(mockChain.delete).toHaveBeenCalled();
      expect(mockChain.eq).toHaveBeenCalledWith('id', testThemeId);
    });
  });
});





