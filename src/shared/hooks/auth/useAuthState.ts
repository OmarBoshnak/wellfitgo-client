/**
 * useAuthState Hook
 * @description Combined hook for accessing auth state with computed properties
 */

import { useMemo } from 'react';
import { useAppSelector } from '@/src/shared/store';
import {
    selectAuth,
    selectIsAuthenticated,
    selectIsHydrated,
    selectIsFirstTimeUser,
    selectHasCompletedOnboarding,
    selectHasCompletedHealthHistory,
    selectRole,
} from '@/src/shared/store/slices/authSlice';
import { NavigationDecision, AuthNavigationDestination } from '@/src/shared/types/auth';

// ============================================================================
// Hook Definition
// ============================================================================

/**
 * Hook for accessing auth state with computed navigation decisions
 */
export function useAuthState() {
    const auth = useAppSelector(selectAuth);
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const isHydrated = useAppSelector(selectIsHydrated);
    const isFirstTimeUser = useAppSelector(selectIsFirstTimeUser);
    const hasCompletedOnboarding = useAppSelector(selectHasCompletedOnboarding);
    const hasCompletedHealthHistory = useAppSelector(selectHasCompletedHealthHistory);
    const role = useAppSelector(selectRole);

    // ========================================================================
    // Computed Properties
    // ========================================================================

    /**
     * Whether user can access protected (app) routes
     */
    const canAccessApp = useMemo(() => {
        return isAuthenticated && !isFirstTimeUser;
    }, [isAuthenticated, isFirstTimeUser]);

    /**
     * Whether user needs to complete onboarding
     */
    const needsOnboarding = useMemo(() => {
        return !hasCompletedOnboarding;
    }, [hasCompletedOnboarding]);

    /**
     * Whether user needs to complete health history
     */
    const needsHealthHistory = useMemo(() => {
        return isAuthenticated && isFirstTimeUser && !hasCompletedHealthHistory;
    }, [isAuthenticated, isFirstTimeUser, hasCompletedHealthHistory]);

    /**
     * Determine where to navigate after splash screen
     */
    const getSplashDestination = useMemo((): NavigationDecision => {
        // Wait for hydration
        if (!isHydrated) {
            return { destination: 'splash', reason: 'Waiting for state hydration' };
        }

        // Authenticated user
        if (isAuthenticated) {
            // First time user needs health history
            if (isFirstTimeUser && !hasCompletedHealthHistory) {
                return { destination: 'healthHistory', reason: 'First-time user needs health history' };
            }
            // Returning user goes to home
            return { destination: 'clientHome', reason: 'Authenticated user' };
        }

        // Not authenticated
        if (hasCompletedOnboarding) {
            // Already saw onboarding, go to login
            return { destination: 'login', reason: 'Returning unauthenticated user' };
        }

        // Fresh install, show onboarding
        return { destination: 'onboarding', reason: 'First-time app launch' };
    }, [
        isHydrated,
        isAuthenticated,
        isFirstTimeUser,
        hasCompletedOnboarding,
        hasCompletedHealthHistory,
        role,
    ]);

    /**
     * Determine where to navigate after login success
     */
    const getPostLoginDestination = useMemo((): NavigationDecision => {
        if (isFirstTimeUser || !hasCompletedHealthHistory) {
            return { destination: 'healthHistory', reason: 'First-time user needs health history' };
        }
        return { destination: 'clientHome', reason: 'Returning user' };
    }, [isFirstTimeUser, hasCompletedHealthHistory]);

    // ========================================================================
    // Return
    // ========================================================================

    return {
        // Raw state
        ...auth,
        isHydrated, // Explicitly return isHydrated for compatibility
        role,

        // Computed properties
        canAccessApp,
        needsOnboarding,
        needsHealthHistory,

        // Navigation decisions
        getSplashDestination,
        getPostLoginDestination,
    };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get route path for navigation destination
 */
export function getRoutePath(destination: AuthNavigationDestination): string {
    const routes: Record<AuthNavigationDestination, string> = {
        clientHome: '/(app)/(tabs)',
        // doctorHome removed as it's not relevant for client app
        doctorHome: '/doctor', // Kept for type compatibility if shared type isn't updated yet, but practically unused.
        login: '/(auth)/login',
        onboarding: '/OnBoardingScreen',
        healthHistory: '/(auth)/health-history',
        splash: '/SplashScreen',
    };
    return routes[destination];
}

export default useAuthState;
