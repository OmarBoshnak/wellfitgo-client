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

    const { isAuthenticated, isInitialized, isLoading, user } = useAppSelector(
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

        // Logic adapted from Doctor app but for Client
        if (isAuthenticated && inAuthGroup) {
            // If authenticated and in auth group, redirect to main app
            // Check if user has completed onboarding?
            // Client app had specific check for onboarding completion

            // Assuming we rely on the flags we synced in `authSlice`
            // But for now, basic redirect to home
            router.replace("/(app)/(tabs)");

        } else if (!isAuthenticated && !inAuthGroup && segments[0] !== undefined) {
            // User is not signed in but trying to access protected route
            // Redirect to login
            router.replace("/(auth)/login");
        }
    }, [isAuthenticated, isInitialized, isLoading, segments, router, user]);

    // Hide splash screen when initialized
    useEffect(() => {
        if (isInitialized) {
            SplashScreen.hideAsync();
        }
    }, [isInitialized]);

    return <>{children}</>;
}
