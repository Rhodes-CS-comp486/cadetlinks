import { useColorScheme } from 'react-native';

// central definitions for all app colors in light and dark modes

export const LightColors = {
  // background surfaces
  background: '#FFFFFF',
  card: '#F9F9F9',
  overlay: 'rgba(0,0,0,0.5)',

  // text
  text: '#333333',
  muted: '#999999',

  // primary/brand
  primary: '#1e90ff',
  secondary: '#2196F3',
  accent: '#FF9800',

  // semantic
  success: '#4CAF50',
  danger: '#ff3a3a',
  warning: '#FFC107',

  // borders and dividers
  border: '#E0E0E0',
};

export const DarkColors: typeof LightColors = {
  background: '#000000',
  card: '#121212',
  overlay: 'rgba(0,0,0,0.5)',

  text: '#FFFFFF',
  muted: '#999999',

  primary: '#1e90ff',
  secondary: '#2196F3',
  accent: '#FF9800',

  success: '#4CAF50',
  danger: '#ff3a3a',
  warning: '#FFC107',

  border: '#272727',
};

export type AppColors = typeof LightColors;

/**
 * Returns the appropriate color set for the requested scheme.
 */
export function getColors(scheme: 'light' | 'dark'): AppColors {
  return scheme === 'dark' ? DarkColors : LightColors;
}

/**
 * A React hook that reads the system color scheme and returns the matching
 * palette.  Useful in components and stylesheets.
 */
export function useColors(): AppColors {
  const scheme = useColorScheme() || 'light';
  return getColors(scheme as 'light' | 'dark');
}