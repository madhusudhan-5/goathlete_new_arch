import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// CHANGE THIS to your machine's IP address (e.g. 192.168.1.5:8000) for physical device testing
// For iOS Simulator, 'http://localhost:8000' works
// For Android Emulator, 'http://10.0.2.2:8000' works
const BASE_URL = 'http://10.0.2.2:8000/api';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await SecureStore.getItemAsync('access_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.log('Error getting token', error);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Auth Service
export const authService = {
    sendOtp: async (phoneNumber: string) => {
        const response = await api.post('/auth/send-otp', { phone_number: phoneNumber });
        return response.data;
    },

    verifyOtp: async (phoneNumber: string, otp: string) => {
        const response = await api.post('/auth/verify-otp-whatsapp', {
            phone_number: phoneNumber,
            otp: otp,
        });

        if (response.data.tokens) {
            await SecureStore.setItemAsync('access_token', response.data.tokens.access);
            await SecureStore.setItemAsync('refresh_token', response.data.tokens.refresh);
            await SecureStore.setItemAsync('user_data', JSON.stringify(response.data.player));
        }

        return response.data;
    },

    logout: async () => {
        await SecureStore.deleteItemAsync('access_token');
        await SecureStore.deleteItemAsync('refresh_token');
        await SecureStore.deleteItemAsync('user_data');
    },

    isAuthenticated: async () => {
        const token = await SecureStore.getItemAsync('access_token');
        return !!token;
    }
};

// Scoreboard Service
export const scoreboardService = {
    getSports: async () => {
        const response = await api.get('/tournaments/sports/');
        return response.data;
    },

    getSportTemplate: async (sportId: number) => {
        const response = await api.get(`/tournaments/sports/${sportId}/template/`);
        return response.data;
    },

    getLiveMatches: async () => {
        const response = await api.get('/tournaments/matches/?status=LIVE');
        return response.data;
    },

    getMatchDetails: async (matchId: string) => {
        const response = await api.get(`/tournaments/matches/${matchId}/`);
        return response.data;
    },

    getMatchEvents: async (matchId: string) => {
        const response = await api.get(`/tournaments/match-events/?match=${matchId}`);
        return response.data;
    }
};

// Venue Service
export const venueService = {
    getAll: async (params?: any) => {
        const response = await api.get('/venues/', { params });
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(`/venues/${id}/`);
        return response.data;
    },

    search: async (query: string) => {
        const response = await api.get('/venues/', { params: { search: query } });
        return response.data;
    },

    getNearby: async (latitude: number, longitude: number, radius: number = 10) => {
        const response = await api.get('/venues/', {
            params: { lat: latitude, lng: longitude, radius }
        });
        return response.data;
    }
};

// Court Service
export const courtService = {
    getByVenue: async (venueId: string) => {
        const response = await api.get(`/venues/${venueId}/courts/`);
        return response.data;
    },

    getAvailability: async (courtId: string, date: string) => {
        const response = await api.get(`/venues/courts/${courtId}/availability/`, {
            params: { date }
        });
        return response.data;
    }
};

// Booking Service
export const bookingService = {
    create: async (data: any) => {
        const response = await api.post('/bookings/', data);
        return response.data;
    },

    getMyBookings: async (params?: any) => {
        const response = await api.get('/bookings/', { params });
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(`/bookings/${id}/`);
        return response.data;
    },

    cancel: async (id: string) => {
        const response = await api.post(`/bookings/${id}/cancel/`);
        return response.data;
    }
};

// Tournament Service
export const tournamentService = {
    getAll: async (params?: any) => {
        const response = await api.get('/tournaments/', { params });
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(`/tournaments/${id}/`);
        return response.data;
    },

    register: async (tournamentId: string) => {
        const response = await api.post(`/tournaments/${tournamentId}/register/`);
        return response.data;
    },

    getMyTournaments: async () => {
        const response = await api.get('/tournaments/my-tournaments/');
        return response.data;
    },

    getMatches: async (tournamentId: string) => {
        const response = await api.get(`/tournaments/${tournamentId}/matches/`);
        return response.data;
    }
};

// Player/User Service
export const playerService = {
    getProfile: async () => {
        const userData = await SecureStore.getItemAsync('user_data');
        if (userData) {
            return JSON.parse(userData);
        }
        const response = await api.get('/players/me/');
        await SecureStore.setItemAsync('user_data', JSON.stringify(response.data));
        return response.data;
    },

    updateProfile: async (data: any) => {
        const response = await api.patch('/players/me/', data);
        await SecureStore.setItemAsync('user_data', JSON.stringify(response.data));
        return response.data;
    },

    getStats: async () => {
        const response = await api.get('/players/me/stats/');
        return response.data;
    }
};

export default api;
