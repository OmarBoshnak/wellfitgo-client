import React from 'react';
import { View, Text, Pressable, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NotificationItemProps } from './types';

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onPress }) => {
  const getAvatarSource = () => {
    if (notification.avatar) {
      return { uri: notification.avatar };
    }
    
    // Return default icon based on notification type
    switch (notification.type) {
      case 'appointment':
        return require('@/assets/Wellfitgo.png'); // Use existing app icon
      case 'message':
        return null; // Will use message icon
      case 'health':
        return null; // Will use health icon
      case 'system':
        return null; // Will use system icon
      default:
        return null; // Will use default bell icon
    }
  };

  const getAvatarIcon = () => {
    if (notification.avatar) return null;
    
    switch (notification.type) {
      case 'appointment':
        return 'calendar-outline';
      case 'message':
        return 'chatbubble-outline';
      case 'health':
        return 'heart-outline';
      case 'system':
        return 'settings-outline';
      default:
        return 'notifications-outline';
    }
  };

  const avatarSource = getAvatarSource();
  const avatarIcon = getAvatarIcon();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed
      ]}
      onPress={() => onPress(notification)}
    >

            {/* Time */}
      <Text style={styles.time}>
        {notification.time}
      </Text>



      {/* Content */}
      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {notification.title}
        </Text>
        <Text style={styles.message} numberOfLines={2}>
          {notification.message}
        </Text>
      </View>

            {/* Avatar/Icon */}
      <View style={styles.avatarContainer}>
        {avatarSource ? (
          <Image source={avatarSource} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.iconAvatar]}>
            <Ionicons
              name={avatarIcon}
              size={20}
              color="#6B7280"
            />
          </View>
        )}
      </View>

    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  pressed: {
    backgroundColor: '#F9FAFB',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  iconAvatar: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal:10
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 2,
    textAlign:'right'
  },
  message: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
    textAlign:'right',
    overflow:'hidden',
  },
  time: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 12,
    alignSelf: 'center',
    marginTop: 2,
  },
});

export default NotificationItem;
