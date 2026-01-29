/**
 * Payment Stack Layout
 * @description Layout for payment routes under (app) group
 */

import { Stack } from 'expo-router';
import { colors } from '@/src/shared/core/constants/Theme';

export default function PaymentLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.bgPrimary },
                animation: 'slide_from_bottom',
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    animation: 'slide_from_right',
                }}
            />
            <Stack.Screen
                name="success"
                options={{
                    gestureEnabled: false,
                }}
            />
            <Stack.Screen
                name="manage-subscription"
                options={{
                    animation: 'slide_from_right',
                }}
            />
        </Stack>
    );
}
