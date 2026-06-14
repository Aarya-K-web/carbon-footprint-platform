import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://upuzbkfdktvxzevgoubx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwdXpia2Zka3R2eHpldmdvdWJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0MjcyNDAsImV4cCI6MjA5NzAwMzI0MH0.DRWN0kOYvfBFz7wxgdPpj2WG3f-DSoZaGsC-G9EoiXA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
