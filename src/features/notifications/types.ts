export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  avatar?: string;
  isRead: boolean;
  type: 'appointment' | 'message' | 'system' | 'health' | 'general';
}

export interface NotificationItemProps {
  notification: Notification;
  onPress: (notification: Notification) => void;
}
