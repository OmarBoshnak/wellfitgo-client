import { Stack } from 'expo-router';

export default function OnBoardingLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: 'transparent' },
                animation: 'fade',
            }}
        />
    );
}
