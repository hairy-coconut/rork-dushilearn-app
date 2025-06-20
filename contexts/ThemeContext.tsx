import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useColorScheme } from 'react-native';

interface ThemeColorsScheme {
    primary: string;
    secondary: string;
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    error: string;
}

interface Theme {
    colors: ThemeColorsScheme;
    isDark: boolean;
}

const lightTheme: Theme = {
    colors: {
        primary: '#FF6B6B',
        secondary: '#4ECDC4',
        background: '#FFFFFF',
        card: '#F8F9FA',
        text: '#212529',
        textSecondary: '#6C757D',
        border: '#DEE2E6',
        success: '#28A745',
        error: '#DC3545',
    },
    isDark: false,
};

const darkTheme: Theme = {
    colors: {
        primary: '#FF6B6B',
        secondary: '#4ECDC4',
        background: '#212529',
        card: '#343A40',
        text: '#F8F9FA',
        textSecondary: '#ADB5BD',
        border: '#495057',
        success: '#28A745',
        error: '#DC3545',
    },
    isDark: true,
};

export type ThemeMode = 'light' | 'dark';

interface ThemeContextProps {
  theme: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<ThemeMode>(systemColorScheme === 'dark' ? 'dark' : 'light');

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 