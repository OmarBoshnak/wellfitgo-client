/**
 * RealtimeStatus Component
 * @description Shows real-time connection status and events
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSocket } from '@/src/shared/hooks/useSocket';
import { colors } from '@/src/shared/core/constants/Theme';

interface RealtimeStatusProps {
  showEvents?: boolean;
}

export const RealtimeStatus: React.FC<RealtimeStatusProps> = ({ showEvents = false }) => {
  const { isConnected, lastEvent, socketId } = useSocket();
  const [recentEvents, setRecentEvents] = useState<any[]>([]);

  useEffect(() => {
    if (lastEvent) {
      setRecentEvents(prev => [lastEvent, ...prev.slice(0, 4)]);
    }
  }, [lastEvent]);

  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <Ionicons 
          name={isConnected ? 'checkmark-circle' : 'close-circle'} 
          size={16} 
          color={isConnected ? colors.success : colors.error} 
        />
        <Text style={[styles.statusText, { color: isConnected ? colors.success : colors.error }]}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </Text>
      </View>

      {isConnected && socketId && (
        <Text style={styles.socketId}>ID: {socketId.slice(0, 8)}...</Text>
      )}

      {showEvents && recentEvents.length > 0 && (
        <View style={styles.eventsContainer}>
          <Text style={styles.eventsTitle}>Recent Events:</Text>
          {recentEvents.map((event, index) => (
            <View key={index} style={styles.eventItem}>
              <Text style={styles.eventType}>{event.type}</Text>
              <Text style={styles.eventData}>
                {JSON.stringify(event.data).slice(0, 50)}...
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginVertical: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  socketId: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  eventsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  eventsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  eventItem: {
    marginBottom: 6,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  eventType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  eventData: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
});

export default RealtimeStatus;
