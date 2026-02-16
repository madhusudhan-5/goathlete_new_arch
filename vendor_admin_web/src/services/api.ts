import axios from 'axios';

// Backend URL - Adjust based on environment or proxy
const BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Refresh (Simplified for MVP)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Check for 401 Unauthorized
        if (error.response?.status === 401) {
            // Clear tokens and redirect to login
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);


export const venueService = {
    getAll: async () => {
        const response = await api.get('/partners/venues/');
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(`/partners/venues/${id}/`);
        return response.data;
    },

    create: async (data: any) => {
        const response = await api.post('/partners/venues/', data);
        return response.data;
    },

    update: async (id: string, data: any) => {
        const response = await api.patch(`/partners/venues/${id}/`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/partners/venues/${id}/`);
        return response.data;
    },

    generateSlots: async (id: string, data: any) => {
        const response = await api.post(`/venues/${id}/generate-slots/`, data);
        return response.data;
    },

    updateStatus: async (id: string, status: string) => {
        const response = await api.patch(`/venues/${id}/status/`, { status });
        return response.data;
    }
};

export const bookingService = {
    getAll: async (params?: any) => {
        const response = await api.get('/bookings/', { params });
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(`/bookings/${id}/`);
        return response.data;
    },

    create: async (data: any) => {
        const response = await api.post('/bookings/', data);
        return response.data;
    },

    update: async (id: string, data: any) => {
        const response = await api.patch(`/bookings/${id}/`, data);
        return response.data;
    },

    cancel: async (id: string) => {
        const response = await api.post(`/bookings/${id}/cancel/`);
        return response.data;
    },

    confirm: async (id: string) => {
        const response = await api.post(`/bookings/${id}/confirm/`);
        return response.data;
    },

    complete: async (id: string) => {
        const response = await api.post(`/bookings/${id}/complete/`);
        return response.data;
    },

    getAnalytics: async (filters: any = {}) => {
        const response = await api.get('/bookings/analytics/reports/', { params: filters });
        return response.data;
    }
};

export const courtService = {
    getByVenueId: async (venueId: string) => {
        const response = await api.get(`/venues/${venueId}/courts/`);
        return response.data;
    },

    create: async (data: any) => {
        const response = await api.post('/venues/courts/', data);
        return response.data;
    },

    getByVenue: async (venueId: string) => {
        const response = await api.get(`/venues/${venueId}/courts/`);
        return response.data;
    }
};

export default api;
