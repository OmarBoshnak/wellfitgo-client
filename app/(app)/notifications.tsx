/**
 * Notifications Screen
 * @description Full-screen notifications list with iOS-style design
 */

import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { colors } from '@/src/shared/core/constants/Theme';
import { NotificationsScreen } from '@/src/features/notifications';

export default function NotificationsRoute() {
  const insets = useSafeAreaInsets();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
      <NotificationsScreen />
    </>
  );
}
