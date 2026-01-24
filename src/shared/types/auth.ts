/**
 * Auth Types
 * @description Type definitions for authentication state management
 */

import { Models } from 'appwrite';

// ============================================================================
// Auth State Types
// ============================================================================

/**
 * Redux Auth State
 */
export interface AuthState {
    /** Whether user is currently authenticated */
    isAuthenticated: boolean;
    /** Appwrite user ID */
    userId: string | null;
    /** User email */
    email: string | null;
    /** User display name */
    displayName: string | null;
    /** User role from backend */
    role: 'client' | 'doctor' | 'admin' | null;
    /** Whether this is a first-time user (never completed health history) */
    isFirstTimeUser: boolean;
    /** Whether onboarding has been completed */
    hasCompletedOnboarding: boolean;
    /** Whether health history has been completed */
    hasCompletedHealthHistory: boolean;
    /** Whether Redux state has been rehydrated from storage */
    isHydrated: boolean;
    /** Loading state for async operations */
    isLoading: boolean;
    /** Error message if any */
    error: string | null;
}

/**
 * User profile from Appwrite
 */
export type AppwriteUser = Models.User<Models.Preferences>;

// ============================================================================
// Storage Keys
// ============================================================================

export const AUTH_STORAGE_KEYS = {
    /** Auth token (secure storage) */
    AUTH_TOKEN: 'auth_token',
    /** Session ID (secure storage) */
    SESSION_ID: 'session_id',
    /** User ID (async storage for quick access) */
    USER_ID: '@user_id',
    /** Backend user ID (async storage for API/socket identity) */
    BACKEND_USER_ID: '@backend_user_id',
    /** Onboarding completed flag */
    ONBOARDING_COMPLETED: '@onboarding_completed',
    /** Health history completed flag */
    HEALTH_HISTORY_COMPLETED: '@health_history_completed',
    /** First time user flag */
    IS_FIRST_TIME: '@is_first_time',
} as const;

// ============================================================================
// Action Payloads
// ============================================================================

export interface SetAuthenticatedPayload {
    userId: string;
    email: string | null;
    displayName: string | null;
    isFirstTimeUser?: boolean;
    role?: 'client' | 'doctor' | 'admin' | null;
}

export interface AuthErrorPayload {
    error: string;
}

// ============================================================================
// Navigation Destinations
// ============================================================================

export type AuthNavigationDestination =
    | 'clientHome'
    | 'doctorHome'
    | 'login'
    | 'onboarding'
    | 'healthHistory'
    | 'splash';

/**
 * Determines navigation destination based on auth state
 */
export interface NavigationDecision {
    destination: AuthNavigationDestination;
    reason: string;
}
