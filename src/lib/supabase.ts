import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ygtiglamlshayptycdxu.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlndGlnbGFtbHNoYXlwdHljZHh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MzU2MDMsImV4cCI6MjA5MjQxMTYwM30.g5E_x97J0MJGjYjOkaNSSr78NvhAy9Z8FkJBF3JTk6c";

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase URL or Key in .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
