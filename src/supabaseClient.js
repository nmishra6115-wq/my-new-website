import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

const hasValidConfig =
  /^https?:\/\//i.test(supabaseUrl) && supabaseAnonKey.length > 0;

export const supabase = hasValidConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
