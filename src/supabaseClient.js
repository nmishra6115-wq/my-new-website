import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qbketxxorhcaqpglgmaw.supabase.co';
// Use the key you copied from your Project Settings > API page
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFia2V0eHhvcmhjYXFwZ2xnbWF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3Nzg2NDEsImV4cCI6MjA5NTM1NDY0MX0.AqXhtIREnU7SuZ7c-liestHKn_DMp6BqP7aapMui7zw'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);