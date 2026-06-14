import { createClient } from '@supabase/supabase-js';

// The verified base URL (with NO double dots and NO extra 'i')
const supabaseUrl = 'https://qrtgdfabdmxqywxrkymf.supabase.co';

// The verified public anon cryptographic key string
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFydGdkZmFiZG14cXl3eHJrbXlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0MDI3OTcsImV4cCI6MjA5Njk3ODc5N30.H6YRQwQmfTvDhMkpiVAY77gWjKNnu-HtF69Lk-QzHyQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
