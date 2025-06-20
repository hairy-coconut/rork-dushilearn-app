import { Platform } from 'react-native';

export const colors = {
  // Primary Colors
  aqua: '#4FD1C5',
  coral: '#FF9770',
  banana: '#FFE066',
  cream: '#FAF8F1',
  purple: '#C084FC',
  jungle: '#34D399',

  // Gradients
  sunset: ['#FF9770', '#FFD93D'],
  ocean: ['#4FD1C5', '#34D399'],
  tropical: ['#C084FC', '#FF9770'],

  // UI Colors
  background: '#FAF8F1',
  surface: '#FFFFFF',
  text: {
    primary: '#2D3748',
    secondary: '#718096',
    accent: '#4FD1C5',
  },
  border: '#E2E8F0',
  error: '#FF6B6B',
  success: '#34D399',
  warning: '#FFD93D',

  // Dark Mode Colors
  dark: {
    background: '#1A202C',
    surface: '#2D3748',
    text: {
      primary: '#F7FAFC',
      secondary: '#A0AEC0',
      accent: '#4FD1C5',
    },
    border: '#4A5568',
  },
};

export const typography = {
  fontFamily: {
    regular: Platform.select({
      ios: 'Nunito-Regular',
      android: 'Nunito-Regular',
    }),
    medium: Platform.select({
      ios: 'Nunito-Medium',
      android: 'Nunito-Medium',
    }),
    bold: Platform.select({
      ios: 'Nunito-Bold',
      android: 'Nunito-Bold',
    }),
    display: Platform.select({
      ios: 'Baloo2-Regular',
      android: 'Baloo2-Regular',
    }),
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  base: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

export const borderRadius = {
  sm: 4,
  base: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

export const animation = {
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  easing: {
    easeInOut: 'ease-in-out',
    easeOut: 'ease-out',
    easeIn: 'ease-in',
  },
};

export const layout = {
  maxWidth: 1200,
  containerPadding: spacing.base,
  screenPadding: spacing.base,
};

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1060,
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animation,
  layout,
  zIndex,
}; 