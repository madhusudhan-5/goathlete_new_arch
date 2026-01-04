import api from './api';
import storage from '../utils/storage';

export const authService = {
  // Request OTP
  requestOTP: async (email) => {
    const response = await api.post('/auth/executive/login', { email });
    return response.data;
  },

  // Verify OTP
  verifyOTP: async (email, otp) => {
    const response = await api.post('/auth/executive/verify-otp', { email, otp });
    if (response.data.access) {
      await storage.setItem('token', response.data.access);
      await storage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const userStr = await storage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Logout
  logout: async () => {
    await storage.deleteItem('token');
    await storage.deleteItem('user');
  },

  // Check if authenticated
  isAuthenticated: async () => {
    const token = await storage.getItem('token');
    return !!token;
  },
};

