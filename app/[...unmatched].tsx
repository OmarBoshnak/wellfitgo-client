/**
 * Catch-all route for unmatched paths (e.g., OAuth callbacks)
 * Redirects to splash screen to handle proper navigation
 */

import { useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '@/src/shared/core/constants/Theme';

export default function UnmatchedRoute() {
    const router = useRouter();
    const params = useLocalSearchParams();

    useEffect(() => {
        console.log('[UnmatchedRoute] Caught unmatched route, redirecting to splash');
        console.log('[UnmatchedRoute] Params:', params);
        
        // Redirect to splash screen which will handle proper navigation
        const timer = setTimeout(() => {
            router.replace('/SplashScreen');
        }, 100);

        return () => clearTimeout(timer);
    }, [router, params]);

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color={colors.primaryDark} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.bgPrimary,
    },
});
