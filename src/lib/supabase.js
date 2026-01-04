/**
 * @chunk 1.01 - Supabase Setup
 * 
 * Initializes the Supabase client for database and storage operations.
 * No RLS policies are used (single-user tool).
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase environment variables. Please copy .env.local.example to .env.local and add your credentials.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


