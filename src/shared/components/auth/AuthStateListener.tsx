import { useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { useAppDispatch, useAppSelector } from "@/src/shared/store";
import { initializeAuth } from "@/src/shared/store/slices/authSlice";

// Keep the splash screen visible
SplashScreen.preventAutoHideAsync();

// Auth state listener component
export function AuthStateListener({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const segments = useSegments();

    const { isAuthenticated, isInitialized, isLoading, user, hasCompletedHealthHistory } = useAppSelector(
        (state) => state.auth
    );

    // Initialize auth on mount
    useEffect(() => {
        dispatch(initializeAuth());
    }, [dispatch]);

    // Handle navigation based on auth state
    useEffect(() => {
        if (!isInitialized || isLoading) return;

        const inAuthGroup = segments[0] === "(auth)";
        const isInSplash = segments[0] === 'SplashScreen';
        const isInOnboarding = segments[0] === 'OnBoardingScreen';

        if (isInSplash || isInOnboarding) {
            return;
        }

        // Logic adapted from Doctor app but for Client
        if (isAuthenticated && inAuthGroup) {
            // Check if user has completed onboarding and health profile
            const userHasCompletedOnboarding = user?.onboardingCompleted;

            // If health history is NOT completed, allow staying in (auth) group ONLY if we are on health-history page OR book-call page OR subscription page
            const isHealthHistoryPage = segments[1] === 'health-history';
            const isBookCallPage = segments[1] === 'book-call';
            const isSubscriptionPage = segments[1] === 'subscription';

            if (!hasCompletedHealthHistory && !isHealthHistoryPage && !isBookCallPage && !isSubscriptionPage) {
                // Redirect to health history if not there
                router.replace("/(auth)/health-history");
            } else if (hasCompletedHealthHistory && userHasCompletedOnboarding) {
                // If everything is done, go to main app
                // router.replace("/(app)/(tabs)");
            }
            // If !hasCompletedHealthHistory && (isHealthHistoryPage || isBookCallPage || isSubscriptionPage), do nothing (stay there)

        } else if (!isAuthenticated && !inAuthGroup && segments[0] !== undefined) {
            // User is not signed in but trying to access protected route
            // Redirect to login
            router.replace("/(auth)/login");
        } else if (isAuthenticated && !inAuthGroup) {
            // Validating user state while in app group (e.g. accidental navigation or deep link)
            if (!hasCompletedHealthHistory) {
                router.replace("/(auth)/health-history");
            }
        }
    }, [isAuthenticated, isInitialized, isLoading, segments, router, user, hasCompletedHealthHistory]);

    // Hide splash screen when initialized
    useEffect(() => {
        if (isInitialized) {
            SplashScreen.hideAsync();
        }
    }, [isInitialized]);

    return <>{children}</>;
}
