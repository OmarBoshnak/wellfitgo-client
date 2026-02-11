import { Stack, useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useCallback } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { store, persistor } from '@/src/shared/store';
import { colors } from '@/src/shared/core/constants/Theme';
import { AuthStateListener } from '@/src/shared/components/auth/AuthStateListener';
import { AppwriteAuth } from '@/src/shared/services/appwrite/auth';
import { getPaymentStatus, updateClientProfile } from '@/src/shared/services/backend/api';

const PENDING_PAYMENT_KEY = 'pending_payment';
const PENDING_PAYMENT_MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Loading component shown while Redux state is rehydrating
 */
function LoadingFallback() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primaryDark} />
    </View>
  );
}

/**
 * Check for pending payment on app startup and recover if needed
 */
function usePendingPaymentRecovery() {
  const router = useRouter();

  const checkPendingPayment = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(PENDING_PAYMENT_KEY);
      if (!raw) return;

      const pending = JSON.parse(raw);
      const age = Date.now() - (pending.createdAt || 0);

      // Expired — clean up silently
      if (age > PENDING_PAYMENT_MAX_AGE_MS) {
        await AsyncStorage.removeItem(PENDING_PAYMENT_KEY);
        return;
      }

      // Check with backend if it was paid via webhook while app was closed
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const res = await getPaymentStatus(pending.customerReference, token);
      const status = res?.data?.status;

      if (status === 'paid') {
        await AsyncStorage.removeItem(PENDING_PAYMENT_KEY);
        router.replace({
          pathname: '/(app)/payment/success',
          params: {
            planName: pending.planName || 'اشتراك WellFitGo',
            amount: pending.amount || '0',
            transactionId: pending.customerReference || '',
            date: new Date().toLocaleDateString('ar-EG', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }),
            paymentMethod: 'دفع إلكتروني',
          },
        } as never);
      } else if (status === 'failed' || status === 'cancelled') {
        await AsyncStorage.removeItem(PENDING_PAYMENT_KEY);
      }
      // If still pending, keep in storage — webhook may arrive later
    } catch (error) {
      console.warn('[RootLayout] Pending payment recovery error:', error);
    }
  }, [router]);

  useEffect(() => {
    // Delay check to let auth/routing settle first
    const timeout = setTimeout(checkPendingPayment, 2000);
    return () => clearTimeout(timeout);
  }, [checkPendingPayment]);
}

async function registerForPushNotificationsAsync() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const projectId =
    Constants.easConfig?.projectId || Constants.expoConfig?.extra?.eas?.projectId;

  const tokenResponse = projectId
    ? await Notifications.getExpoPushTokenAsync({ projectId })
    : await Notifications.getExpoPushTokenAsync();

  return tokenResponse.data;
}

export default function RootLayout() {
  usePendingPaymentRecovery();

  useEffect(() => {
    const syncPushToken = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;

        const pushToken = await registerForPushNotificationsAsync();
        if (!pushToken) return;

        await updateClientProfile({ expoPushToken: pushToken }, token);
      } catch (error) {
        console.warn('[RootLayout] Push token registration failed:', error);
      }
    };

    syncPushToken();
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingFallback />} persistor={persistor}>
        <SafeAreaProvider>
          <AuthStateListener>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'fade',
              }}
            >
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(app)" options={{ headerShown: false }} />
            </Stack>
          </AuthStateListener>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
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
