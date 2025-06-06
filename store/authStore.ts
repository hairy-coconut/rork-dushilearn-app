import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type User = {
  name: string;
  email: string;
  avatarUrl?: string;
};

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      
      login: (user: User) => {
        set({ user, isAuthenticated: true });
        AsyncStorage.setItem('user_authenticated', 'true');
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false });
        AsyncStorage.setItem('user_authenticated', 'false');
      },
      
      updateUser: (userData: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },
    }),
    {
      name: 'dushilearn-auth',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);