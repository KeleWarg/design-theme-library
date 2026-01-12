/**
 * @chunk 1.01 - Supabase Setup
 * 
 * Initializes the Supabase client for database and storage operations.
 * No RLS policies are used (single-user tool).
 */

import { createClient } from '@supabase/supabase-js';

function safeLocalStorageGet(key) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

// Allow overrides only in non-production to prevent stale/bad keys in prod.
const allowOverrides = import.meta.env.MODE !== 'production';

const supabaseUrl = allowOverrides
  ? safeLocalStorageGet('ds-admin-supabase-url') || import.meta.env.VITE_SUPABASE_URL
  : import.meta.env.VITE_SUPABASE_URL;

const supabaseAnonKey = allowOverrides
  ? safeLocalStorageGet('ds-admin-supabase-key') || import.meta.env.VITE_SUPABASE_ANON_KEY
  : import.meta.env.VITE_SUPABASE_ANON_KEY;

const missingMsg = 'Missing Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const supabaseConfigError = isSupabaseConfigured ? null : missingMsg;

function createMissingSupabaseProxy(message) {
  return new Proxy(
    {},
    {
      get(_target, prop) {
        // Allow basic introspection without throwing.
        if (prop === '__isMissingConfig') return true;
        if (prop === '__missingConfigMessage') return message;

        // Make failures explicit and actionable.
        throw new Error(message);
      },
    },
  );
}

if (!isSupabaseConfigured) {
  // Never hard-crash the whole app at import-time — show a helpful UI instead.
  // (App-level guard renders a config screen in production.)
  console.error(missingMsg);
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMissingSupabaseProxy(missingMsg);


