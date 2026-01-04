import api from './api';

export const venueService = {
  // Pre-register venue with base64 encoded images and documents
  preRegisterVenue: async (venueData) => {
    // Send as JSON with base64 encoded data
    const response = await api.post('/venues/pre-register', venueData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  // Get venues by executive
  getMyVenues: async () => {
    const response = await api.get('/venues/by-executive');
    return response.data;
  },
};

