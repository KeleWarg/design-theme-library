/**
 * @chunk 1.01 - Required Env Helpers
 *
 * Centralizes required environment variable checks so we can:
 * - show a helpful UI in production instead of a blank screen
 * - unit test the logic without relying on `import.meta.env` in tests
 */

export function getSupabaseEnvStatus(env) {
  const supabaseUrl = env?.VITE_SUPABASE_URL;
  const supabaseAnonKey = env?.VITE_SUPABASE_ANON_KEY;

  const missingKeys = [];
  if (!supabaseUrl) missingKeys.push('VITE_SUPABASE_URL');
  if (!supabaseAnonKey) missingKeys.push('VITE_SUPABASE_ANON_KEY');

  return {
    supabaseUrl,
    supabaseAnonKey,
    isMissing: missingKeys.length > 0,
    missingKeys,
  };
}


