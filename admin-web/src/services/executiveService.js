import api from './api';

const executiveService = {
  // Get all executives
  getAll: async () => {
    const response = await api.get('/admin/executives');
    return response.data;
  },

  // Get executive by ID
  getById: async (id) => {
    const response = await api.get(`/admin/executives/${id}`);
    return response.data;
  },

  // Create new executive
  create: async (data) => {
    const response = await api.post('/admin/executives', data);
    return response.data;
  },

  // Update executive
  update: async (id, data) => {
    const response = await api.put(`/admin/executives/${id}`, data);
    return response.data;
  },

  // Delete executive
  delete: async (id) => {
    const response = await api.delete(`/admin/executives/${id}`);
    return response.data;
  },

  // Activate/deactivate executive
  toggleStatus: async (id, isActive) => {
    const response = await api.patch(`/admin/executives/${id}/status`, { is_active: isActive });
    return response.data;
  },
};

export default executiveService;

