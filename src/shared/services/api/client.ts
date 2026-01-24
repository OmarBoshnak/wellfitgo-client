import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define API URL - defaulting to the one found in AuthContext
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://wellfitgo-backend-97b72a680866.herokuapp.com';
const API_URL = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Add Token
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle Auth Errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            // Token expired or invalid
            // We could attempt refresh here if backend supports it
            // For now, just reject, and let the UI/AuthService handle logout/redirect
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
        }

        return Promise.reject(error);
    }
);

export default api;
