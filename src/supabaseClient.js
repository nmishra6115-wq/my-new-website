import { createClient } from '@supabase/supabase-js';

// Using your URL directly here ensures it never crashes
const supabaseUrl = 'https://qbketxxorhcaqpglgmaw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);