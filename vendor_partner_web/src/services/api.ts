import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth Service
export const authService = {
    login: async (email: string, password: string) => {
        const response = await api.post('/auth/login/', { email, password });
        if (response.data.access) {
            localStorage.setItem('token', response.data.access);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },

    getUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
};

// Partner Service
export const partnerService = {
    getProfile: async () => {
        const response = await api.get('/partners/vendor-partners/me/');
        return response.data;
    },

    getDashboardStats: async () => {
        const response = await api.get('/partners/vendor-partners/dashboard_stats/');
        return response.data;
    }
};

// Court Service
export const courtService = {
    getByVenue: async (venueId: string) => {
        const response = await api.get(`/venues/${venueId}/courts/`);
        return response.data;
    }
};

// Booking Service
export const bookingService = {
    getAll: async (params?: any) => {
        const response = await api.get('/bookings/', { params });
        return response.data;
    },

    create: async (data: any) => {
        const response = await api.post('/bookings/', data);
        return response.data;
    },

    cancel: async (id: string) => {
        const response = await api.post(`/bookings/${id}/cancel/`);
        return response.data;
    }
};

// Slot Block Service
export const slotBlockService = {
    getAll: async (params?: any) => {
        const response = await api.get('/bookings/slot-blocks/', { params });
        return response.data;
    },

    create: async (data: any) => {
        const response = await api.post('/bookings/slot-blocks/', data);
        return response.data;
    },

    deactivate: async (id: string) => {
        const response = await api.post(`/bookings/slot-blocks/${id}/deactivate/`);
        return response.data;
    }
};

export default api;
