/**
 * @chunk 2.24 - Typography Composite Token Sync Tests
 *
 * Unit tests for typographyTokenService module.
 * Uses mocked Supabase client.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase client
vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from '../../src/lib/supabase';
import { typographyTokenService } from '../../src/services/typographyTokenService';

describe('typographyTokenService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('skips when no typography roles exist', async () => {
    const rolesChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: [], error: null }),
    };

    const typefacesChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: [], error: null }),
    };

    supabase.from.mockImplementation((table) => {
      if (table === 'typography_roles') return rolesChain;
      if (table === 'typefaces') return typefacesChain;
      throw new Error(`Unexpected table: ${table}`);
    });

    const res = await typographyTokenService.syncCompositeTypographyTokensForTheme('theme-1');
    expect(res).toEqual({ themeId: 'theme-1', upserted: 0, skipped: true });
  });

  it('upserts composite typography tokens wired to font-family CSS variables', async () => {
    const mockRoles = [
      { theme_id: 'theme-1', role_name: 'body-md', typeface_role: 'text', font_size: '1rem', font_weight: 400, line_height: '1.5', letter_spacing: 'normal' },
      { theme_id: 'theme-1', role_name: 'heading-lg', typeface_role: 'display', font_size: '1.875rem', font_weight: 600, line_height: '1.25', letter_spacing: '-0.01em' },
    ];

    const rolesChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: mockRoles, error: null }),
    };

    const typefacesChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: [
          { role: 'display', family: 'Inter', fallback: 'system-ui, sans-serif' },
          { role: 'text', family: 'Inter', fallback: 'system-ui, sans-serif' },
        ],
        error: null,
      }),
    };

    const tokensChain = {
      upsert: vi.fn().mockReturnThis(),
      select: vi.fn().mockResolvedValue({ data: [{ id: 't1' }, { id: 't2' }], error: null }),
    };

    supabase.from.mockImplementation((table) => {
      if (table === 'typography_roles') return rolesChain;
      if (table === 'typefaces') return typefacesChain;
      if (table === 'tokens') return tokensChain;
      throw new Error(`Unexpected table: ${table}`);
    });

    const res = await typographyTokenService.syncCompositeTypographyTokensForTheme('theme-1');

    expect(tokensChain.upsert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          theme_id: 'theme-1',
          category: 'typography',
          type: 'typography-composite',
          path: 'typography/role/heading-lg',
          css_variable: '--typography-heading-lg',
          value: expect.objectContaining({
            fontFamily: 'Inter, system-ui, sans-serif',
          }),
        }),
        expect.objectContaining({
          theme_id: 'theme-1',
          category: 'typography',
          type: 'typography-composite',
          path: 'typography/role/body-md',
          css_variable: '--typography-body-md',
          value: expect.objectContaining({
            fontFamily: 'Inter, system-ui, sans-serif',
          }),
        }),
      ]),
      { onConflict: 'theme_id,path' }
    );

    expect(res).toEqual({ themeId: 'theme-1', upserted: 2, skipped: false });
  });

  it('normalizes unknown typeface roles to text', async () => {
    const mockRoles = [
      { theme_id: 'theme-1', role_name: 'caption', typeface_role: 'weird', font_size: '0.75rem', font_weight: 400, line_height: '1.4', letter_spacing: '0.02em' },
    ];

    const rolesChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: mockRoles, error: null }),
    };

    const typefacesChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: [{ role: 'text', family: 'Inter', fallback: 'system-ui, sans-serif' }],
        error: null,
      }),
    };

    const tokensChain = {
      upsert: vi.fn().mockReturnThis(),
      select: vi.fn().mockResolvedValue({ data: [{ id: 't1' }], error: null }),
    };

    supabase.from.mockImplementation((table) => {
      if (table === 'typography_roles') return rolesChain;
      if (table === 'typefaces') return typefacesChain;
      if (table === 'tokens') return tokensChain;
      throw new Error(`Unexpected table: ${table}`);
    });

    await typographyTokenService.syncCompositeTypographyTokensForTheme('theme-1');

    const upsertArg = tokensChain.upsert.mock.calls[0][0][0];
    expect(upsertArg.value.fontFamily).toBe('Inter, system-ui, sans-serif');
  });
});


