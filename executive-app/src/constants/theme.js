import { Platform } from 'react-native';

export const COLORS = {
  navy: '#0A1F35',
  orange: '#DA6F2B',
  white: '#FFFFFF',
  grey: '#6c757d',
  lightGrey: '#E5E5E5',
  black: '#1A1A1A',
  background: '#F5F5F5',
  error: '#DC3545',
  success: '#28A745',
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
};

export const SIZES = {
  base: 8,
  small: 12,
  font: 14,
  medium: 16,
  large: 18,
  extraLarge: 24,
  h1: 32,
  h2: 28,
  h3: 24,
  
  padding: 16,
  margin: 16,
  radius: 12,
  buttonRadius: 25,
};

// API Base URL - Use production URL for builds, localhost for development
// __DEV__ is true in development, false in production builds
const IS_DEVELOPMENT = __DEV__;

export const API_BASE_URL = IS_DEVELOPMENT
  ? (Platform.OS === 'web' ? 'http://localhost:8000/api' : 'http://192.168.1.8:8000/api')
  : 'https://api.goathlete.in/api';  // Production URL for builds

