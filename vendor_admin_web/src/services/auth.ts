import api from './api';

export interface LoginResponse {
    access_token: string;
    refresh_token: string;
    user: {
        email: string;
        role: string;
        // Add other user fields as needed
    };
}

export const authService = {
    login: async (email: string, password: string): Promise<LoginResponse> => {
        const response = await api.post('/auth/executive/login', { email, password });

        if (response.data.tokens) {
            localStorage.setItem('access_token', response.data.tokens.access);
            localStorage.setItem('refresh_token', response.data.tokens.refresh);
            localStorage.setItem('user', JSON.stringify(response.data.user || { email }));
        }

        return response.data;
    },

    logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    },

    isAuthenticated: (): boolean => {
        return !!localStorage.getItem('access_token');
    },

    getUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }
};
