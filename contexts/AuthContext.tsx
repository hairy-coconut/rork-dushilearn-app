import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading user from storage or API
    const loadUser = async () => {
      setLoading(true);
      // TODO: Replace with real auth logic
      setTimeout(() => {
        setUser(null); // No user by default
        setLoading(false);
      }, 500);
    };
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    // TODO: Replace with real login logic
    await new Promise(res => setTimeout(res, 500));
    setUser({ id: '1', name: 'Test User', email });
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 