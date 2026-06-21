import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// ─── API Base URL Configuration ────────────────────────────────────────────
// DEV  (Android Emulator): http://10.0.2.2:8000
// DEV  (Physical device):  Replace with your machine's LAN IP e.g. http://192.168.1.5:8000
// PROD (Play Store build): https://api.goathlete.in
//
// __DEV__ is automatically true in debug builds and false in release builds.
// When you run `./gradlew assembleRelease`, __DEV__ is false → uses PROD URL.
const DEV_API_URL = 'http://192.168.1.4:8000/api';
const PROD_API_URL = 'https://api.goathlete.in/api';

// Forcing local testing mode
const BASE_URL = DEV_API_URL;

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 30000, // 30 second timeout for production
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

    getProfileFresh: async () => {
        const response = await api.get('/players/me/');
        await SecureStore.setItemAsync('user_data', JSON.stringify(response.data));
        return response.data;
    },

    updateProfile: async (data: any) => {
        const response = await api.patch('/players/update_profile/', data);
        await SecureStore.setItemAsync('user_data', JSON.stringify(response.data));
        return response.data;
    },

    getStats: async () => {
        const response = await api.get('/players/me/stats/');
        return response.data;
    },

    getSportStats: async () => {
        const response = await api.get('/players/me/sport_stats/');
        return response.data;
    },

    getPerformanceHistory: async () => {
        const response = await api.get('/players/me/performance_history/');
        return response.data;
    },

    getBadges: async () => {
        const response = await api.get('/players/player-badges/');
        return response.data;
    },

    getAllBadges: async () => {
        const response = await api.get('/players/badges/');
        return response.data;
    },
};

export default api;

// Local Tournament Service (Player-created informal tournaments)
export const localTournamentService = {
    create: async (data: {
        name: string;
        sport: number;
        participants: Array<{ name: string; email: string; mobile: string }>;
    }) => {
        const response = await api.post('/tournaments/local-tournaments/', data);
        return response.data;
    },

    getAll: async () => {
        const response = await api.get('/tournaments/local-tournaments/');
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(`/tournaments/local-tournaments/${id}/`);
        return response.data;
    },

    getMyActive: async () => {
        const response = await api.get('/tournaments/local-tournaments/active/');
        return response.data;
    },

    updateScoreboard: async (id: string, scoreboard: object) => {
        const response = await api.patch(`/tournaments/local-tournaments/${id}/update_scoreboard/`, { scoreboard });
        return response.data;
    },

    updateParticipantScore: async (tournamentId: string, participantId: string, score: object) => {
        const response = await api.patch(
            `/tournaments/local-tournaments/${tournamentId}/participant/${participantId}/score/`,
            { score }
        );
        return response.data;
    },

    close: async (id: string) => {
        const response = await api.post(`/tournaments/local-tournaments/${id}/close/`);
        return response.data;
    },
};
