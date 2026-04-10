import { createClient } from '@supabase/supabase-js';

// .env has the property named VITE_SUPABASE_PUBLISHABLE_KEY, so we must bind specifically to that!
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);