import api from './api';

const analyticsService = {
  // Get dashboard analytics
  getDashboardStats: async () => {
    const response = await api.get('/admin/analytics/dashboard');
    return response.data;
  },

  // Get conversion metrics
  getConversionMetrics: async () => {
    const response = await api.get('/admin/analytics/conversion');
    return response.data;
  },
};

export default analyticsService;

