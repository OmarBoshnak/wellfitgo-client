import { Stack } from 'expo-router';

export default function AuthLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="login" />
            <Stack.Screen name="phone-verification" />
            <Stack.Screen name="subscription" />
            <Stack.Screen name="health-history" />
        </Stack>
    );
}
