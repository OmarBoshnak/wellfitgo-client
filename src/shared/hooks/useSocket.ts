/**
 * useSocket Hook
 * @description React hook for Socket.io integration
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'expo-router';
import socketService, { SocketEvents } from '@/src/shared/services/socket/socketService';
import { useAppDispatch, useAppSelector } from '@/src/shared/store';
import { logout as logoutAction } from '@/src/shared/store/slices/authSlice';
import { selectUser, selectRole } from '@/src/shared/store/selectors/auth.selectors';

export const useSocket = () => {
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const role = useAppSelector(selectRole);
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<any>(null);
  const eventHandlersRef = useRef<Map<string, Function>>(new Map());

  // Connect to socket when user is available
  useEffect(() => {
    if (user && !socketService.isConnected()) {
      // Use _id from backend user object
      socketService.connect(user._id, role || 'client')
        .then(() => {
          setIsConnected(true);
          console.log('[useSocket] Connected successfully');
        })
        .catch((error) => {
          console.error('[useSocket] Connection failed:', error);
          setIsConnected(false);
        });
    }

    // Cleanup on unmount or user logout
    return () => {
      if (socketService.isConnected()) {
        socketService.disconnect();
        setIsConnected(false);
      }
    };
  }, [user, role]);

  // Setup event listeners
  useEffect(() => {
    if (!isConnected) return;

    // Handle force logout
    const handleForceLogout = (data: SocketEvents['force_logout']) => {
      console.log('[useSocket] Force logout received:', data);

      // Clear auth state
      dispatch(logoutAction());

      // Navigate to login
      router.replace('/(auth)/login' as any);
    };

    // Handle user data changes
    const handleUserDataChanged = (data: SocketEvents['user_data_changed']) => {
      console.log('[useSocket] User data changed:', data);
      setLastEvent({ type: 'user_data_changed', data });

      // You can dispatch to Redux to update user data
      // Example: dispatch(updateUserData(data.changedData));
    };

    // Handle user deleted
    const handleUserDeleted = (data: SocketEvents['user_deleted']) => {
      console.log('[useSocket] User deleted:', data);
      setLastEvent({ type: 'user_deleted', data });

      // Force logout if current user was deleted
      if (user && data.userId === user._id) {
        dispatch(logoutAction());
        router.replace('/(auth)/login' as any);
      }
    };

    // Register event listeners
    socketService.on('force_logout', handleForceLogout);
    socketService.on('user_data_changed', handleUserDataChanged);
    socketService.on('user_deleted', handleUserDeleted);

    // Cleanup
    return () => {
      socketService.off('force_logout', handleForceLogout);
      socketService.off('user_data_changed', handleUserDataChanged);
      socketService.off('user_deleted', handleUserDeleted);
    };
  }, [isConnected, user, dispatch, router]);

  // Listen to custom events
  const on = useCallback(<T extends keyof SocketEvents>(
    event: T,
    callback: (data: SocketEvents[T]) => void
  ) => {
    if (!isConnected) return;

    socketService.on(event, callback);

    // Store handler for cleanup
    eventHandlersRef.current.set(event, callback);
  }, [isConnected]);

  // Stop listening to custom events
  const off = useCallback(<T extends keyof SocketEvents>(
    event: T,
    callback?: (data: SocketEvents[T]) => void
  ) => {
    if (!isConnected) return;

    socketService.off(event, callback);

    // Remove from ref
    if (callback) {
      eventHandlersRef.current.delete(event);
    }
  }, [isConnected]);

  // Update user status
  const updateStatus = useCallback((status: string, role?: string) => {
    if (isConnected) {
      socketService.updateStatus(status, role);
    }
  }, [isConnected]);

  // Disconnect manually
  const disconnect = useCallback(() => {
    socketService.disconnect();
    setIsConnected(false);
  }, []);

  // Reconnect
  const reconnect = useCallback(async () => {
    if (user) {
      try {
        await socketService.connect(user._id, role || 'client');
        setIsConnected(true);
      } catch (error) {
        console.error('[useSocket] Reconnect failed:', error);
        setIsConnected(false);
      }
    }
  }, [user, role]);

  return {
    isConnected,
    lastEvent,
    on,
    off,
    updateStatus,
    disconnect,
    reconnect,
    socketId: socketService.getSocketId(),
  };
};

export default useSocket;
