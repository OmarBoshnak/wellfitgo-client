import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import { store, persistor } from '@/src/shared/store';
import { colors } from '@/src/shared/core/constants/Theme';
import { AuthStateListener } from '@/src/shared/components/auth/AuthStateListener';
import { AppwriteAuth } from '@/src/shared/services/appwrite/auth';

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

export default function RootLayout() {
  // Use AppwriteAuth wrapper if possible or just rely on AuthService initialization in Redux
  // Doctor app did `AppwriteAuth.ping()` but we don't have that method in our static class yet.

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
