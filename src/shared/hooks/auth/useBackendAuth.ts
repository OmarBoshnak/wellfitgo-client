/**
 * useBackendAuth Hook
 * @description Access backend auth token, user id, and routing decisions for API calls
 */

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/src/shared/store';
import { selectUser } from '@/src/shared/store/selectors/auth.selectors';
import { AuthService } from '@/src/shared/services/auth/auth.service';
import { RoutingDecision } from '@/src/shared/services/backend/api';

// ============================================================================
// Types
// ============================================================================

interface UseBackendAuthReturn {
    token: string;
    userId: string;
    userRole: 'client' | 'doctor' | 'admin' | null;
    routing: RoutingDecision | null;
    isLoading: boolean;
    isFirstLogin: boolean;
    refreshToken: () => Promise<void>;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export const useBackendAuth = (): UseBackendAuthReturn => {
    const dispatch = useAppDispatch();
    const router = useRouter();

    // Get state from Redux
    const user = useAppSelector(selectUser);
    const token = useAppSelector(state => state.auth.token);
    const authLoading = useAppSelector(state => state.auth.isLoading);
    const isFirstTimeUser = useAppSelector(state => state.auth.isFirstTimeUser);

    // Local state for items not in Redux or computed
    const [isLoading, setIsLoading] = useState(true);
    const [routing, setRouting] = useState<RoutingDecision | null>(null);
    const [isFirstLogin, setIsFirstLogin] = useState(false);

    const refreshToken = useCallback(async () => {
        setIsLoading(true);
        try {
            // If we have token in Redux, we are good
            if (token && user) {
                setIsLoading(false);
                return;
            }

            // Try to initialize/sync
            // We can dispatch initializeAuth again or check specific sync needs
            // But usually AuthStateListener handles initialization.
            // If we are here and no token, maybe we need to sync?

            // Check if Appwrite is logged in?
            try {
                const appwriteUser = await AuthService.checkAuth();
                if (appwriteUser) {
                    // We have user but maybe no token in Redux yet? 
                    // checkAuth returns the storage user. 
                    // If we reached here, Redux state is empty.
                    // This creates a circular dependency if we rely on Redux.

                    // Let's rely on AuthService to sync if needed.
                    // But AuthService.syncWithBackend requires appwrite session.
                }
            } catch (e) {
                // Not logged in
            }

        } catch (error) {
            console.error('[useBackendAuth] Error refreshing token:', error);
        } finally {
            setIsLoading(false);
        }
    }, [token, user]);

    useEffect(() => {
        refreshToken();
    }, [refreshToken]);

    return {
        token: token || '',
        userId: user?._id || '',
        userRole: (user?.role as any) || null,
        routing,
        isLoading: isLoading || authLoading,
        isFirstLogin: isFirstLogin || isFirstTimeUser,
        refreshToken,
    };
};

export default useBackendAuth;
