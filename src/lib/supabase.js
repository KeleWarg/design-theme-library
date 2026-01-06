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

if (!supabaseUrl || !supabaseAnonKey) {
  if (import.meta.env.MODE === 'production') {
    throw new Error(missingMsg);
  } else {
    console.error(missingMsg);
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


