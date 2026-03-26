import { createClient } from "@supabase/supabase-js";

// Directly put your URL and anon key here
const supabaseUrl = "https://tjycytaqieqspnuumqwv.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqeWN5dGFxaWVxc3BudXVtcXd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NjYzMzQsImV4cCI6MjA5MDA0MjMzNH0.JwuzoZ9jkomXWuKiA1rep_pFxDEOKpzQtax3aeRDd78";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);