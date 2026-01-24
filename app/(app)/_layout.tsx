/**
 * App Layout
 * @description Layout for authenticated app screens with route protection
 */

import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import { useAuthState } from '@/src/shared/hooks/auth';
import { colors } from '@/src/shared/core/constants/Theme';

/**
 * Loading component shown while checking auth
 */
function AuthLoading() {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primaryDark} />
        </View>
    );
}

export default function AppLayout() {
    const router = useRouter();
    const { isHydrated, isAuthenticated, canAccessApp } = useAuthState();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isHydrated) return;

        if (!isAuthenticated) {
            console.log('[AppLayout] Not authenticated, redirecting to login');
            router.replace('/(auth)/LoginScreen' as never);
        }
    }, [isHydrated, isAuthenticated, router]);

    // Show loading while checking auth
    if (!isHydrated) {
        return <AuthLoading />;
    }

    // Don't render protected routes if not authenticated
    if (!isAuthenticated) {
        return <AuthLoading />;
    }

    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="doctor" />
            <Stack.Screen name="payment" />
        </Stack>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.bgPrimary,
    },
});
