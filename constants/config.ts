// Supabase configuration using environment variables
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://zjugdontxtmuqaiufikq.supabase.co';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqdWdkb250eHRtdXFhaXVmaWtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNDI1NzUsImV4cCI6MjA2NDgxODU3NX0.P9vWrMtiKBhPWImHTrx-Rw8OPXy38o4XOxbroZlkkK0';

// App configuration
export const APP_CONFIG = {
  name: process.env.EXPO_PUBLIC_APP_NAME || 'DushiLearn',
  version: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
};

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return SUPABASE_URL !== 'https://your-project-ref.supabase.co' && 
         SUPABASE_ANON_KEY !== 'your-anon-key-here' &&
         SUPABASE_URL.includes('supabase.co') &&
         SUPABASE_ANON_KEY.length > 20;
};

// API configuration
export const API_CONFIG = {
  baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000',
  timeout: 10000,
}; 