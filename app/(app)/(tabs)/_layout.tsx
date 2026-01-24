/**
 * Tabs Layout
 * @description Layout for app tabs navigation
 */

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

import { colors } from '@/src/shared/core/constants/Theme';
import { horizontalScale, verticalScale } from '@/src/shared/core/utils/scaling';

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.primaryDark,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarStyle: {
                    backgroundColor: colors.white,
                    borderTopColor: colors.border,
                    borderTopWidth: 1,
                    paddingTop: verticalScale(8),
                    paddingBottom: Platform.OS === 'ios' ? verticalScale(15) : verticalScale(8),
                    height: Platform.OS === 'ios' ? verticalScale(70) : verticalScale(65),
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                },
            }}
        >
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'الملف',
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                        <Ionicons name="person-circle" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="chat"
                options={{
                    title: 'المحادثة',
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                        <Ionicons name="chatbubbles" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="meals"
                options={{
                    title: 'الوجبات',
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                        <Ionicons name="restaurant" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="index"
                options={{
                    title: 'الرئيسية',
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
