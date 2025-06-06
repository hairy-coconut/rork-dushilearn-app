import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration with the provided project details
const supabaseUrl = 'https://zjugdontxtmuqaiufikq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqdWdkb250eHRtdXFhaXVmaWtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNDI1NzUsImV4cCI6MjA2NDgxODU3NX0.P9vWrMtiKBhPWImHTrx-Rw8OPXy38o4XOxbroZlkkK0';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return true; // Now properly configured with real values
};