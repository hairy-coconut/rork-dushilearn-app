import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '../utils/supabase';

type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
};

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  resetError: () => void;
};

// Get storage based on platform
const getStorage = () => {
  if (typeof window !== 'undefined') {
    return window.localStorage;
  } else {
    return require('@react-native-async-storage/async-storage').default;
  }
};

const storage = getStorage();

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          console.log('Attempting login with:', email);
          
          // For testing purposes, allow a test login
          if (email === 'test@example.com' && password === 'password') {
            console.log('Using test login credentials');
            const testUser: User = {
              id: 'test-user-id',
              email: 'test@example.com',
              name: 'Test User',
              avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
            };
            
            set({ user: testUser, isAuthenticated: true, isLoading: false });
            if (typeof window !== 'undefined') {
              storage.setItem('user_authenticated', 'true');
            } else {
              await storage.setItem('user_authenticated', 'true');
            }
            console.log('Test login successful');
            return;
          }
          
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (error) {
            console.error('Supabase auth error:', error);
            throw error;
          }
          
          console.log('Supabase auth response:', data);
          
          if (data.user) {
            // Fetch user profile from profiles table
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();
              
            if (profileError) {
              console.error('Profile fetch error:', profileError);
              if (profileError.code !== 'PGRST116') {
                throw profileError;
              }
            }
            
            console.log('Profile data:', profileData);
            
            const user: User = {
              id: data.user.id,
              email: data.user.email || '',
              name: profileData?.name || data.user.email?.split('@')[0] || 'User',
              avatarUrl: profileData?.avatar_url,
            };
            
            set({ user, isAuthenticated: true, isLoading: false });
            if (typeof window !== 'undefined') {
              storage.setItem('user_authenticated', 'true');
            } else {
              await storage.setItem('user_authenticated', 'true');
            }
            console.log('Login successful');
          }
        } catch (error: any) {
          console.error('Login error:', error.message);
          set({ error: error.message || 'Login failed. Please try again.', isLoading: false });
        }
      },
      
      signUp: async (email: string, password: string, name: string) => {
        set({ isLoading: true, error: null });
        try {
          console.log('Attempting signup with:', email);
          
          // For testing purposes, allow a test signup
          if (email === 'test@example.com') {
            console.log('Using test signup credentials');
            const testUser: User = {
              id: 'test-user-id',
              email: 'test@example.com',
              name: name || 'Test User',
              avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
            };
            
            set({ user: testUser, isAuthenticated: true, isLoading: false });
            if (typeof window !== 'undefined') {
              storage.setItem('user_authenticated', 'true');
            } else {
              await storage.setItem('user_authenticated', 'true');
            }
            console.log('Test signup successful');
            return;
          }
          
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          });
          
          if (error) {
            console.error('Supabase signup error:', error);
            throw error;
          }
          
          console.log('Supabase signup response:', data);
          
          if (data.user) {
            // Create a profile entry
            const { error: profileError } = await supabase
              .from('profiles')
              .insert([
                {
                  id: data.user.id,
                  name,
                  email,
                  created_at: new Date().toISOString(),
                }
              ]);
              
            if (profileError) {
              console.error('Profile creation error:', profileError);
              throw profileError;
            }
            
            const user: User = {
              id: data.user.id,
              email: data.user.email || '',
              name,
            };
            
            set({ user, isAuthenticated: true, isLoading: false });
            if (typeof window !== 'undefined') {
              storage.setItem('user_authenticated', 'true');
            } else {
              await storage.setItem('user_authenticated', 'true');
            }
            console.log('Signup successful');
          }
        } catch (error: any) {
          console.error('Signup error:', error.message);
          set({ error: error.message || 'Signup failed. Please try again.', isLoading: false });
        }
      },
      
      logout: async () => {
        set({ isLoading: true });
        try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          
          set({ user: null, isAuthenticated: false, isLoading: false });
          if (typeof window !== 'undefined') {
            storage.setItem('user_authenticated', 'false');
          } else {
            await storage.setItem('user_authenticated', 'false');
          }
        } catch (error: any) {
          console.error('Logout error:', error.message);
          set({ error: error.message, isLoading: false });
        }
      },
      
      updateUser: async (userData: Partial<User>) => {
        const { user } = get();
        if (!user) return;
        
        set({ isLoading: true });
        try {
          // Update auth metadata if email is being updated
          if (userData.email) {
            const { error } = await supabase.auth.updateUser({
              email: userData.email,
            });
            
            if (error) throw error;
          }
          
          // Update profile in the profiles table
          const { error } = await supabase
            .from('profiles')
            .update({
              name: userData.name,
              avatar_url: userData.avatarUrl,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);
            
          if (error) throw error;
          
          set({
            user: { ...user, ...userData },
            isLoading: false,
          });
        } catch (error: any) {
          console.error('Update user error:', error.message);
          set({ error: error.message, isLoading: false });
        }
      },
      
      resetError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return window.localStorage;
        } else {
          return require('@react-native-async-storage/async-storage').default;
        }
      }),
    }
  )
);