import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qrtgdfabdmxqywxrkymf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFydGdkZmFiZG14cXl3eHJrbXlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0MDI3OTcsImV4cCI6MjA5Njk3ODc5N30.H6YRQwQmfTvDhMkpiVAY77gWjKNnu-HtF69Lk-QzHyQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
