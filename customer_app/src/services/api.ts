import axios from 'axios/dist/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, LOG_API_CALLS } from '../config/env';

// ─── Axios Instance ─────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor ────────────────────────────────────────────────────
api.interceptors.request.use(
  async config => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      if (LOG_API_CALLS) {
        console.log(`[API] → ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
      }
    } catch (error) {
      console.warn('[API] Error reading token:', error);
    }
    return config;
  },
  error => Promise.reject(error),
);

// ─── Response Interceptor + JWT Refresh ─────────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  response => {
    if (LOG_API_CALLS) {
      console.log(`[API] ← ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        const res = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = res.data.access;
        await AsyncStorage.setItem('access_token', newAccessToken);
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Clear all tokens — user must log in again
        await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user_data']);
        if (LOG_API_CALLS) console.warn('[API] Refresh token failed — logged out');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (LOG_API_CALLS) {
      console.warn(`[API] ← ERROR ${error.response?.status} ${error.config?.url}`, error.response?.data);
    }
    return Promise.reject(error);
  },
);

// ─── Auth Service ────────────────────────────────────────────────────────────
export const authService = {
  sendOtp: async (phoneNumber: string) => {
    const response = await api.post('/auth/send-otp', { phone_number: phoneNumber });
    return response.data;
  },

  verifyOtp: async (phoneNumber: string, otp: string) => {
    const response = await api.post('/auth/verify-otp-whatsapp', {
      phone_number: phoneNumber,
      otp,
    });
    if (response.data.tokens) {
      await AsyncStorage.setItem('access_token', response.data.tokens.access);
      await AsyncStorage.setItem('refresh_token', response.data.tokens.refresh);
      await AsyncStorage.setItem('user_data', JSON.stringify(response.data.player));
    }
    return response.data;
  },

  googleSignIn: async (idToken: string) => {
    const response = await api.post('/auth/google/', { id_token: idToken });
    if (response.data.tokens) {
      await AsyncStorage.setItem('access_token', response.data.tokens.access);
      await AsyncStorage.setItem('refresh_token', response.data.tokens.refresh);
      await AsyncStorage.setItem('user_data', JSON.stringify(response.data.player));
    }
    return response.data;
  },

  logout: async () => {
    await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user_data']);
  },

  isAuthenticated: async () => {
    const token = await AsyncStorage.getItem('access_token');
    return !!token;
  },

  getStoredUser: async () => {
    const data = await AsyncStorage.getItem('user_data');
    return data ? JSON.parse(data) : null;
  },
};

// ─── Player / Profile Service ─────────────────────────────────────────────────
export const playerService = {
  getProfile: async () => {
    const cached = await AsyncStorage.getItem('user_data');
    if (cached) return JSON.parse(cached);
    const response = await api.get('/players/me/');
    await AsyncStorage.setItem('user_data', JSON.stringify(response.data));
    return response.data;
  },

  getProfileFresh: async () => {
    const response = await api.get('/players/me/');
    await AsyncStorage.setItem('user_data', JSON.stringify(response.data));
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await api.patch('/players/update_profile/', data);
    await AsyncStorage.setItem('user_data', JSON.stringify(response.data));
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

  getLeaderboard: async (city?: string) => {
    const response = await api.get('/players/leaderboard/', { params: { city } });
    return response.data;
  },
};

// ─── Banner / Hero Slider Service ─────────────────────────────────────────────
export const bannerService = {
  getActive: async () => {
    const response = await api.get('/banners/');
    return response.data;
  },
};

// ─── Venue Service ─────────────────────────────────────────────────────────────
export const venueService = {
  getAll: async (params?: any) => {
    const response = await api.get('/venues/', { params });
    return response.data;
  },

  getById: async (id: string | number) => {
    const response = await api.get(`/venues/${id}/`);
    return response.data;
  },

  getNearby: async (latitude: number, longitude: number, radius: number = 10) => {
    const response = await api.get('/venues/', {
      params: { lat: latitude, lng: longitude, radius },
    });
    return response.data;
  },

  search: async (query: string) => {
    const response = await api.get('/venues/', { params: { search: query } });
    return response.data;
  },

  getEquipment: async (venueId: string | number) => {
    const response = await api.get(`/venues/${venueId}/equipment/`);
    return response.data;
  },
};

// ─── Court Service ─────────────────────────────────────────────────────────────
export const courtService = {
  getByVenue: async (venueId: string | number) => {
    const response = await api.get(`/venues/${venueId}/courts/`);
    return response.data;
  },

  getAvailability: async (courtId: string | number, date: string) => {
    const response = await api.get(`/venues/courts/${courtId}/availability/`, {
      params: { date },
    });
    return response.data;
  },
};

// ─── Booking Service ───────────────────────────────────────────────────────────
export const bookingService = {
  create: async (data: any) => {
    const response = await api.post('/bookings/', data);
    return response.data;
  },

  getMyBookings: async (params?: any) => {
    const response = await api.get('/bookings/', { params });
    return response.data;
  },

  getById: async (id: string | number) => {
    const response = await api.get(`/bookings/${id}/`);
    return response.data;
  },

  cancel: async (id: string | number) => {
    const response = await api.post(`/bookings/${id}/cancel/`);
    return response.data;
  },
};

// ─── Tournament Service ────────────────────────────────────────────────────────
export const tournamentService = {
  getAll: async (params?: any) => {
    const response = await api.get('/tournaments/', { params });
    return response.data;
  },

  getById: async (id: string | number) => {
    const response = await api.get(`/tournaments/${id}/`);
    return response.data;
  },

  register: async (tournamentId: string | number) => {
    const response = await api.post(`/tournaments/${tournamentId}/register/`);
    return response.data;
  },

  getMyTournaments: async () => {
    const response = await api.get('/tournaments/my-tournaments/');
    return response.data;
  },

  getMatches: async (tournamentId: string | number) => {
    const response = await api.get(`/tournaments/${tournamentId}/matches/`);
    return response.data;
  },
};

// ─── Local Tournament Service ──────────────────────────────────────────────────
export const localTournamentService = {
  create: async (data: {
    name: string;
    sport: number;
    participants: Array<{ name: string; email?: string; mobile: string; role?: string }>;
  }) => {
    const response = await api.post('/tournaments/local-tournaments/', data);
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/tournaments/local-tournaments/');
    return response.data;
  },

  getById: async (id: string | number) => {
    const response = await api.get(`/tournaments/local-tournaments/${id}/`);
    return response.data;
  },

  getMyActive: async () => {
    const response = await api.get('/tournaments/local-tournaments/active/');
    return response.data;
  },

  updateScoreboard: async (id: string | number, scoreboard: object) => {
    const response = await api.patch(
      `/tournaments/local-tournaments/${id}/update_scoreboard/`,
      { scoreboard },
    );
    return response.data;
  },

  updateParticipantScore: async (
    tournamentId: string | number,
    participantId: string | number,
    score: object,
  ) => {
    const response = await api.patch(
      `/tournaments/local-tournaments/${tournamentId}/participant/${participantId}/score/`,
      { score },
    );
    return response.data;
  },

  close: async (id: string | number) => {
    const response = await api.post(`/tournaments/local-tournaments/${id}/close/`);
    return response.data;
  },
};

// ─── Scoreboard / Match Service ────────────────────────────────────────────────
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

  getMatchDetails: async (matchId: string | number) => {
    const response = await api.get(`/tournaments/matches/${matchId}/`);
    return response.data;
  },

  getMatchEvents: async (matchId: string | number) => {
    const response = await api.get(`/tournaments/match-events/?match=${matchId}`);
    return response.data;
  },

  updateScore: async (matchId: string | number, data: object) => {
    const response = await api.post(`/tournaments/matches/${matchId}/update_score/`, data);
    return response.data;
  },
};

// ─── Open Matches (PLAYO-style) ────────────────────────────────────────────────
export const openMatchService = {
  getAll: async (params?: any) => {
    const response = await api.get('/tournaments/open-matches/', { params });
    return response.data;
  },

  getById: async (id: string | number) => {
    const response = await api.get(`/tournaments/open-matches/${id}/`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/tournaments/open-matches/', data);
    return response.data;
  },

  join: async (id: string | number, paymentData?: any) => {
    const response = await api.post(`/tournaments/open-matches/${id}/join/`, paymentData);
    return response.data;
  },
};

// ─── Payment Service ───────────────────────────────────────────────────────────
export const paymentService = {
  createOrder: async (data: {
    amount: number;
    booking_id?: string | number;
    open_match_id?: string | number;
    notes?: object;
  }) => {
    const response = await api.post('/payments/create-order/', data);
    return response.data; // Returns { razorpay_order_id, amount, currency }
  },

  verifyPayment: async (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    booking_id?: string | number;
    open_match_id?: string | number;
  }) => {
    const response = await api.post('/payments/verify/', data);
    return response.data;
  },
};

export default api;
