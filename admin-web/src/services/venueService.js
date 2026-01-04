import api from './api';

const venueService = {
  // Get all venues
  getAll: async () => {
    const response = await api.get('/admin/venues');
    return response.data;
  },

  // Get venue by ID
  getById: async (id) => {
    const response = await api.get(`/admin/venues/${id}`);
    return response.data;
  },

  // Update venue status
  updateStatus: async (id, status) => {
    const response = await api.patch(`/admin/venues/${id}/status`, { status });
    return response.data;
  },
};

export default venueService;

