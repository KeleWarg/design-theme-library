import { describe, it, expect } from 'vitest';
import { getSupabaseEnvStatus } from '../../src/lib/requiredEnv';

describe('getSupabaseEnvStatus', () => {
  it('reports missing when both vars are absent', () => {
    const status = getSupabaseEnvStatus({});
    expect(status.isMissing).toBe(true);
    expect(status.missingKeys).toEqual(['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY']);
  });

  it('reports missing when one var is absent', () => {
    const status = getSupabaseEnvStatus({ VITE_SUPABASE_URL: 'https://example.supabase.co' });
    expect(status.isMissing).toBe(true);
    expect(status.missingKeys).toEqual(['VITE_SUPABASE_ANON_KEY']);
  });

  it('reports ok when both vars are present', () => {
    const status = getSupabaseEnvStatus({
      VITE_SUPABASE_URL: 'https://example.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'anon-key',
    });
    expect(status.isMissing).toBe(false);
    expect(status.missingKeys).toEqual([]);
  });
});


