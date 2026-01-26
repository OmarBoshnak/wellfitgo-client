
import { RootState } from '../index';

export const selectAuth = (state: RootState) => state.auth;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectUser = (state: RootState) => state.auth.user;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectIsInitialized = (state: RootState) => state.auth.isInitialized;

// Compatibility selectors for useAuthState
export const selectIsHydrated = (state: RootState) => state.auth.isInitialized;
export const selectIsFirstTimeUser = (state: RootState) => state.auth.isFirstTimeUser;
export const selectHasCompletedOnboarding = (state: RootState) => state.auth.hasCompletedOnboarding;
export const selectHasCompletedHealthHistory = (state: RootState) => state.auth.hasCompletedHealthHistory;
export const selectRole = (state: RootState) => state.auth.user?.role || null;
export const selectToken = (state: RootState) => state.auth.token;
