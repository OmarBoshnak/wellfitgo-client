import api from '../api/client';
import AppwriteAuth from '../appwrite/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: 'client';
    status?: 'active' | 'pending' | 'rejected';
    avatarUrl?: string;
    onboardingCompleted: boolean;
    // Client specific fields
    height?: number;
    weight?: number;
}

interface ThreadResponse {
    success: boolean;
    data: {
        user: User;
        token: string;
        routing: {
            destination: string;
            reason: string;
        };
    };
}

export const AuthService = {
    // Stage 1: Request OTP via Appwrite
    requestOtp: async (phone: string) => {
        return AppwriteAuth.createPhoneSession(phone);
    },

    // Stage 2: Verify OTP via Appwrite and Sync with Backend
    verifyOtp: async (userId: string, secret: string) => {
        const result = await AppwriteAuth.verifyPhoneSession(userId, secret);
        if (!result.success) {
            throw new Error(result.error);
        }
        return AuthService.syncWithBackend(result.data);
    },

    // OAuth Login
    loginWithOAuth: async (provider: any) => {
        const result = await AppwriteAuth.createOAuth2Session(provider);
        if (!result.success) {
            throw new Error(result.error);
        }
        return AuthService.syncWithBackend(result.data);
    },

    // Shared Sync Logic
    syncWithBackend: async (session: any) => {
        // Get Appwrite User Details
        const appwriteUserResult = await AppwriteAuth.getCurrentUser();

        if (!appwriteUserResult.success || !appwriteUserResult.data) {
            throw new Error("Failed to get Appwrite user");
        }
        const appwriteUser = appwriteUserResult.data;

        // Sync with Backend (Enhanced Sync)
        // Using /auth/oauth-login or similar endpoint if /auth/enhanced-sync is exclusive to doctors
        // However, standardizing on enhanced-sync would be better.
        // For now, let's try to match what Client was doing: `oauthLogin` called `/auth/oauth-login`
        // But since we want to align with Doctor, let's use the same `enhanced-sync` endpoint if possible,
        // OR adapt to use the existing Client endpoint structure but wrapped in this service.

        // Doctor sends: appwriteId, firstName, lastName, email, phone, provider, role='doctor'
        // Client `oauthLogin` sent: email, firstName, lastName, avatar, provider, appwriteId

        // Let's assume we can use a similar sync endpoint. 
        // I will use `/auth/sync` or similar if I knew the backend, but I'll stick to what looks like a robust sync.
        // Given I can't check backend code, I will use the path that seems most likely to work based on Doctor:
        // Doctor: POST /auth/enhanced-sync
        // Client: POST /auth/oauth-login (from `useApiWithAuth`)

        // I'll try to use the Doctor's endpoint pattern but change role to 'client'. 
        // If that fails (404), we might need to revert to `oauth-login`.
        // Safest bet: Use the endpoint that Client ALREADY uses effectively, but wrap it here.
        // Client used `oauthLogin` in `useApiWithAuth`. 

        // WAIT: `enhanced-sync` sounds like a better, unified endpoint. 
        // But to be safe without backend access, I should probably replicate the payload/endpoint Client was successfully using.
        // But the user asked to "make it the same like this folder in wellfitgo-doctor". 
        // Using the SAME endpoint `/auth/enhanced-sync` with `role: 'client'` is the most faithful interpretation.

        try {
            // Using /auth/enhanced-sync which corresponds to /api/auth/enhanced-sync due to client configuration
            const response = await api.post<ThreadResponse>('/auth/enhanced-sync', {
                appwriteId: appwriteUser.$id,
                firstName: appwriteUser.name?.split(' ')[0] || 'Client',
                lastName: appwriteUser.name?.split(' ').slice(1).join(' ') || '',
                email: appwriteUser.email,
                phone: appwriteUser.phone,
                provider: 'appwrite', // or 'oauth' / 'phone'
                role: 'client',
            });

            console.log("Auth Sync Response:", response.data);

            const { token, user, routing } = response.data.data;

            // Ensure user has a status, default to active for clients usually, or pending
            if (!user.status) {
                user.status = 'active';
            }

            // Store Token & User
            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('user', JSON.stringify(user));

            return { user, token, routing };

        } catch (error: any) {
            // Fallback or specific error handling
            console.error("Sync failed details:", error.response?.data || error.message);
            throw error;
        }
    },

    // Logout
    logout: async () => {
        try {
            await AppwriteAuth.logout();
        } catch (e) {
            console.log('Appwrite logout failed', e);
        }
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
    },

    // Check Auth State
    checkAuth: async () => {
        const token = await AsyncStorage.getItem('token');
        const userStr = await AsyncStorage.getItem('user');

        if (!token || !userStr) return null;

        try {
            // Optional: Verify token with backend
            // const response = await api.get('/auth/me');
            // return response.data;

            // Verify Appwrite session
            const isLoggedIn = await AppwriteAuth.isLoggedIn();
            if (!isLoggedIn) throw new Error("Appwrite session invalid");

            return JSON.parse(userStr);
        } catch (e) {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            return null;
        }
    }
};
