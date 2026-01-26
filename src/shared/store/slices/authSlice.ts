import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthService, User } from '../../services/auth/auth.service';
import AppwriteAuth from '../../services/appwrite/auth';
import * as asyncStorage from '../../services/storage/asyncStorage';

// Auth State Interface matching Doctor app
interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isInitialized: boolean;
    error: string | null;
    // Keep client-specific flags for now, but integration might make them redundant if user object has them
    isFirstTimeUser: boolean;
    hasCompletedOnboarding: boolean;
    hasCompletedHealthHistory: boolean;
}

// Initial State
const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    isInitialized: false,
    error: null,
    isFirstTimeUser: true,
    hasCompletedOnboarding: false,
    hasCompletedHealthHistory: false,
};

// Async Thunks

// Initialize auth state from storage
export const initializeAuth = createAsyncThunk(
    'auth/initialize',
    async (_, { rejectWithValue }) => {
        try {
            const [token, userStr, onboardingCompleted, healthHistoryCompleted, isFirstTimeUser] =
                await Promise.all([
                    AsyncStorage.getItem('token'),
                    AsyncStorage.getItem('user'),
                    asyncStorage.hasCompletedOnboarding(),
                    asyncStorage.hasCompletedHealthHistory(),
                    asyncStorage.isFirstTimeUser(),
                ]);

            if (token && userStr) {
                // Verify session is still valid with Appwrite
                const isValid = await AppwriteAuth.isLoggedIn();
                if (isValid) {
                    return {
                        user: JSON.parse(userStr) as User,
                        token,
                        flags: {
                            hasCompletedOnboarding: onboardingCompleted,
                            hasCompletedHealthHistory: healthHistoryCompleted,
                            isFirstTimeUser,
                        },
                    };
                }
            }

            // Clear stale data
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            return {
                user: null,
                token: null,
                flags: {
                    hasCompletedOnboarding: onboardingCompleted,
                    hasCompletedHealthHistory: healthHistoryCompleted,
                    isFirstTimeUser,
                },
            };
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// Logout
export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await AuthService.logout();
            return true;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// Refresh User Profile
export const refreshAuthUser = createAsyncThunk(
    'auth/refreshUser',
    async (_, { rejectWithValue }) => {
        try {
            const user = await AuthService.refreshUser();
            return user;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// Auth Slice
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Set user after successful login
        setCredentials: (
            state,
            action: PayloadAction<{ user: User; token: string }>
        ) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            state.error = null;

            // Map User properties to flags if needed
            state.hasCompletedOnboarding = action.payload.user.onboardingCompleted;
            state.hasCompletedHealthHistory = action.payload.user.healthProfileCompleted;
            state.isFirstTimeUser = action.payload.user.isFirstLogin;
        },
        // Clear error
        clearError: (state) => {
            state.error = null;
        },
        // Reset auth state
        resetAuth: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.error = null;
        },
        // Keep existing client reducers for compatibility with other components temporarily
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        completeOnboarding: (state) => {
            state.hasCompletedOnboarding = true;
            if (state.user) {
                state.user.onboardingCompleted = true;
            }
        },
        completeHealthHistory: (state) => {
            state.hasCompletedHealthHistory = true;
            state.isFirstTimeUser = false;
            if (state.user) {
                state.user.healthProfileCompleted = true;
                state.user.isFirstLogin = false;
            }
        },
        setHydrated: (state, action: PayloadAction<boolean>) => {
            state.isInitialized = action.payload;
        },
    },
    extraReducers: (builder) => {
        // Initialize Auth
        builder.addCase(initializeAuth.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(initializeAuth.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isInitialized = true;
            if (action.payload) {
                const { user, token, flags } = action.payload;
                state.user = user;
                state.token = token;
                state.isAuthenticated = Boolean(user && token);

                const onboardingCompleted =
                    user?.onboardingCompleted ?? flags?.hasCompletedOnboarding ?? false;
                const healthHistoryCompleted =
                    user?.healthProfileCompleted ?? flags?.hasCompletedHealthHistory ?? false;
                const firstTimeUser =
                    typeof user?.isFirstLogin === 'boolean'
                        ? user?.isFirstLogin
                        : flags?.isFirstTimeUser ?? true;

                state.hasCompletedOnboarding = Boolean(onboardingCompleted);
                state.hasCompletedHealthHistory = Boolean(healthHistoryCompleted);
                state.isFirstTimeUser = Boolean(firstTimeUser);
            }
        });
        builder.addCase(initializeAuth.rejected, (state, action) => {
            state.isLoading = false;
            state.isInitialized = true;
            state.error = action.payload as string;
        });

        // Logout
        builder.addCase(logout.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(logout.fulfilled, (state) => {
            state.isLoading = false;
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
        });
        builder.addCase(logout.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
            // Still clear auth even if API fails
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
        });

        // Refresh User
        builder.addCase(refreshAuthUser.fulfilled, (state, action) => {
            state.user = action.payload;
            state.hasCompletedOnboarding = action.payload.onboardingCompleted;
        });
    },
});

export const { setCredentials, clearError, resetAuth, setLoading, completeOnboarding, completeHealthHistory, setHydrated } = authSlice.actions;
export default authSlice.reducer;

// Selectors
// Selectors moved to ../selectors/auth.selectors.ts to avoid circular dependencies
