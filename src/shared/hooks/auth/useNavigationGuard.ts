/**
 * useNavigationGuard Hook
 * @description Hook for protecting routes based on auth state
 */

import { useEffect, useRef } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuthState, getRoutePath } from './useAuthState';

// ============================================================================
// Types
// ============================================================================

interface UseNavigationGuardOptions {
    /** Whether to automatically redirect */
    autoRedirect?: boolean;
    /** Callback when redirect is needed */
    onRedirectNeeded?: (destination: string) => void;
}

// ============================================================================
// Hook Definition
// ============================================================================

/**
 * Hook that guards routes and handles auth-based redirections
 */
export function useNavigationGuard(options: UseNavigationGuardOptions = {}) {
    const { autoRedirect = true, onRedirectNeeded } = options;

    const router = useRouter();
    const segments = useSegments();
    const { isAuthenticated, isHydrated, getSplashDestination, canAccessApp, role } = useAuthState();

    // Track if we've already redirected to prevent loops
    const hasRedirected = useRef(false);

    // ========================================================================
    // Route Groups
    // ========================================================================

    /**
     * Determine current route group
     */
    const currentGroup = segments[0] as string | undefined;
    const isInAuthGroup = currentGroup === '(auth)';
    const isInAppGroup = currentGroup === '(app)';
    const isInOnboarding = currentGroup === 'OnBoardingScreen';
    const isInSplash = currentGroup === 'SplashScreen';

    // ========================================================================
    // Auto Redirect Effect
    // ========================================================================

    useEffect(() => {
        // Wait for hydration
        if (!isHydrated) {
            return;
        }

        // Don't redirect from splash (it handles its own navigation)
        if (isInSplash) {
            return;
        }

        // Prevent redirect loops
        if (hasRedirected.current) {
            return;
        }

        let shouldRedirect = false;
        let destination = '';

        // User is authenticated but in auth group (login, etc.)
        if (isAuthenticated && isInAuthGroup && canAccessApp) {
            destination = getRoutePath(
                role === 'doctor' || role === 'admin' ? 'doctorHome' : 'clientHome'
            );
            shouldRedirect = true;
        }

        // User is not authenticated but trying to access app routes
        if (!isAuthenticated && isInAppGroup) {
            destination = getRoutePath('login');
            shouldRedirect = true;
        }

        // Handle redirect
        if (shouldRedirect && destination) {
            hasRedirected.current = true;

            if (onRedirectNeeded) {
                onRedirectNeeded(destination);
            }

            if (autoRedirect) {
                // Use setImmediate to avoid navigation during render
                setImmediate(() => {
                    router.replace(destination as never);
                    // Reset flag after a delay to allow future redirects
                    setTimeout(() => {
                        hasRedirected.current = false;
                    }, 1000);
                });
            }
        }
    }, [
        isHydrated,
        isAuthenticated,
        isInAuthGroup,
        isInAppGroup,
        isInSplash,
        canAccessApp,
        autoRedirect,
        onRedirectNeeded,
        router,
    ]);

    // ========================================================================
    // Return
    // ========================================================================

    return {
        isHydrated,
        isAuthenticated,
        canAccessApp,
        currentGroup,
        isInAuthGroup,
        isInAppGroup,
        isInOnboarding,
        isInSplash,
        getSplashDestination,
        role,
    };
}

export default useNavigationGuard;
