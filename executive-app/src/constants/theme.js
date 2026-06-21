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
  radius: 16, // Softer curves (was 12)
  buttonRadius: 16, // Changed from 25 for a modern block look
};

// API Base URL - Local Testing Mode
// Uses 10.0.2.2 which is the Android emulator's alias to host localhost, and localhost for iOS
export const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000/api' : 'http://localhost:8000/api';

