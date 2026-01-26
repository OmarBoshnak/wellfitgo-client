import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, StatusBar, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import NotificationItem from './NotificationItem';
import { Notification } from './types';
import { mockNotifications } from './mockData';

const NotificationsScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const router = useRouter();

  // Mark notifications as read when screen is focused
  useFocusEffect(
    useCallback(() => {
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
    }, [])
  );

  const handleBackPress = useCallback(() => {
    router.back();
  }, [router]);

  const handleNotificationPress = useCallback((notification: Notification) => {
    console.log('Notification pressed:', notification.title);
    // Here you can add navigation logic based on notification type
    // For example, navigate to appointment details, chat screen, etc.
  }, []);

  const renderNotification = useCallback(({ item }: { item: Notification }) => (
    <NotificationItem
      notification={item}
      onPress={handleNotificationPress}
    />
  ), [handleNotificationPress]);

  const keyExtractor = useCallback((item: Notification) => item.id, []);

  const ListHeaderComponent = useCallback(() => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Notifications</Text>
    </View>
  ), []) as React.FC<{}>;

  const ListEmptyComponent = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off-outline" size={48} color="#9CA3AF" />
      <Text style={styles.emptyTitle}>No Notifications</Text>
      <Text style={styles.emptyMessage}>You're all caught up!</Text>
    </View>
  ), []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#111111" />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>
      
      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={48} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No Notifications</Text>
          <Text style={styles.emptyMessage}>You're all caught up!</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={keyExtractor}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111111',
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
    width: 40,
  },
  listContent: {
    flexGrow: 1,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111111',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default NotificationsScreen;
