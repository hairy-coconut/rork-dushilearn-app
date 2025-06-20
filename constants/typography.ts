import { Platform } from 'react-native';
import Colors from './colors';

// Font families - optimized for readability and playfulness
const fonts = {
  // Primary font family - friendly and modern
  primary: Platform.select({
    ios: 'System', // SF Pro on iOS
    android: 'Roboto',
    web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  }),
  
  // Display font for headers - more personality
  display: Platform.select({
    ios: 'System', // SF Pro Display on iOS 
    android: 'Roboto',
    web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  }),
  
  // Rounded font for playful elements
  rounded: Platform.select({
    ios: 'System', // SF Pro Rounded on iOS
    android: 'Roboto',
    web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  }),
};

// Typography scale - optimized for mobile and web
export const typography = {
  // Display styles - for hero sections and major headings
  display: {
    large: {
      fontFamily: fonts.display,
      fontSize: 32,
      lineHeight: 40,
      fontWeight: '800',
      letterSpacing: -0.5,
    },
    medium: {
      fontFamily: fonts.display,
      fontSize: 28,
      lineHeight: 34,
      fontWeight: '700',
      letterSpacing: -0.3,
    },
    small: {
      fontFamily: fonts.display,
      fontSize: 24,
      lineHeight: 30,
      fontWeight: '700',
      letterSpacing: -0.2,
    },
  },

  // Heading styles
  heading: {
    h1: {
      fontFamily: fonts.primary,
      fontSize: 22,
      lineHeight: 28,
      fontWeight: '700',
      letterSpacing: -0.1,
    },
    h2: {
      fontFamily: fonts.primary,
      fontSize: 20,
      lineHeight: 26,
      fontWeight: '600',
      letterSpacing: 0,
    },
    h3: {
      fontFamily: fonts.primary,
      fontSize: 18,
      lineHeight: 24,
      fontWeight: '600',
      letterSpacing: 0,
    },
    h4: {
      fontFamily: fonts.primary,
      fontSize: 16,
      lineHeight: 22,
      fontWeight: '600',
      letterSpacing: 0,
    },
  },

  // Body text styles
  body: {
    large: {
      fontFamily: fonts.primary,
      fontSize: 17,
      lineHeight: 26,
      fontWeight: '400',
      letterSpacing: 0,
    },
    medium: {
      fontFamily: fonts.primary,
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400',
      letterSpacing: 0,
    },
    small: {
      fontFamily: fonts.primary,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400',
      letterSpacing: 0,
    },
  },

  // Caption and small text
  caption: {
    large: {
      fontFamily: fonts.primary,
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '500',
      letterSpacing: 0.1,
    },
    medium: {
      fontFamily: fonts.primary,
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '500',
      letterSpacing: 0.2,
    },
    small: {
      fontFamily: fonts.primary,
      fontSize: 11,
      lineHeight: 14,
      fontWeight: '500',
      letterSpacing: 0.3,
    },
  },

  // Button styles
  button: {
    large: {
      fontFamily: fonts.rounded,
      fontSize: 18,
      lineHeight: 22,
      fontWeight: '700',
      letterSpacing: 0.1,
    },
    medium: {
      fontFamily: fonts.rounded,
      fontSize: 16,
      lineHeight: 20,
      fontWeight: '600',
      letterSpacing: 0.1,
    },
    small: {
      fontFamily: fonts.rounded,
      fontSize: 14,
      lineHeight: 18,
      fontWeight: '600',
      letterSpacing: 0.2,
    },
  },

  // Playful styles for gamification elements
  playful: {
    large: {
      fontFamily: fonts.rounded,
      fontSize: 20,
      lineHeight: 24,
      fontWeight: '800',
      letterSpacing: 0,
    },
    medium: {
      fontFamily: fonts.rounded,
      fontSize: 16,
      lineHeight: 20,
      fontWeight: '700',
      letterSpacing: 0.1,
    },
    small: {
      fontFamily: fonts.rounded,
      fontSize: 14,
      lineHeight: 18,
      fontWeight: '600',
      letterSpacing: 0.2,
    },
  },

  // Special styles for specific contexts
  lesson: {
    question: {
      fontFamily: fonts.primary,
      fontSize: 20,
      lineHeight: 28,
      fontWeight: '700',
      letterSpacing: -0.1,
    },
    option: {
      fontFamily: fonts.primary,
      fontSize: 17,
      lineHeight: 24,
      fontWeight: '500',
      letterSpacing: 0,
    },
    explanation: {
      fontFamily: fonts.primary,
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400',
      letterSpacing: 0,
    },
  },

  // Stats and numbers
  stats: {
    large: {
      fontFamily: fonts.display,
      fontSize: 24,
      lineHeight: 28,
      fontWeight: '800',
      letterSpacing: -0.2,
    },
    medium: {
      fontFamily: fonts.display,
      fontSize: 20,
      lineHeight: 24,
      fontWeight: '700',
      letterSpacing: -0.1,
    },
    small: {
      fontFamily: fonts.display,
      fontSize: 16,
      lineHeight: 20,
      fontWeight: '600',
      letterSpacing: 0,
    },
  },
};

// Color variants for text
export const textColors = {
  primary: Colors.text,
  secondary: Colors.textLight,
  white: Colors.textWhite,
  success: Colors.success,
  error: Colors.error,
  warning: Colors.warning,
  info: Colors.info,
  accent: Colors.accent,
  brand: Colors.primary,
};

// Helper function to get complete text style
export const getTextStyle = (
  variant: keyof typeof typography,
  size: string,
  color: keyof typeof textColors = 'primary'
) => {
  const baseStyle = (typography as any)[variant]?.[size] || typography.body.medium;
  return {
    ...baseStyle,
    color: textColors[color],
  };
};

export default typography;