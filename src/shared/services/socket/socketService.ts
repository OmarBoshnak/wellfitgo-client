/**
 * Socket.io Service
 * @description Real-time communication with backend
 */

import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'https://wellfitgo-backend-97b72a680866.herokuapp.com';

export interface SocketEvents {
  // User events
  user_logged_in: {
    userId: string;
    userData: any;
    timestamp: Date;
  };
  user_logged_out: {
    userId: string;
    timestamp: Date;
  };
  user_data_changed: {
    userId: string;
    changedData: any;
    changeType: string;
    timestamp: Date;
  };
  user_deleted: {
    userId: string;
    timestamp: Date;
  };
  force_logout: {
    reason: string;
    timestamp: Date;
  };
}

class SocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;
  private userRole: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  /**
   * Connect to Socket.io server
   */
  connect(userId: string, userRole: string = 'client'): Promise<void> {
    return new Promise((resolve, reject) => {
      this.userId = userId;
      this.userRole = userRole;

      console.log(`[Socket] Connecting for user: ${userId}`);

      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
        upgrade: false,
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
      });

      // Connection events
      this.socket.on('connect', () => {
        console.log(`[Socket] Connected: ${this.socket?.id}`);
        this.reconnectAttempts = 0;

        // Join user-specific room
        this.socket?.emit('join_user_room', userId);

        resolve();
      });

      this.socket.on('disconnect', (reason) => {
        console.log(`[Socket] Disconnected: ${reason}`);
      });

      this.socket.on('connect_error', (error) => {
        console.error('[Socket] Connection error:', error);
        this.reconnectAttempts++;

        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.log('[Socket] Max reconnection attempts reached');
          reject(error);
        }
      });

      // User events
      this.setupUserEvents();
    });
  }

  /**
   * Setup user-specific event listeners
   */
  private setupUserEvents() {
    if (!this.socket) return;

    // User login notifications
    this.socket.on('user_logged_in', (data: SocketEvents['user_logged_in']) => {
      console.log('[Socket] User logged in:', data);
      // You can dispatch to Redux or emit to components
      this.emitToComponents('user_logged_in', data);
    });

    // User logout notifications
    this.socket.on('user_logged_out', (data: SocketEvents['user_logged_out']) => {
      console.log('[Socket] User logged out:', data);
      this.emitToComponents('user_logged_out', data);
    });

    // User data changes
    this.socket.on('user_data_changed', (data: SocketEvents['user_data_changed']) => {
      console.log('[Socket] User data changed:', data);
      this.emitToComponents('user_data_changed', data);
    });

    // Force logout (account deleted)
    this.socket.on('force_logout', (data: SocketEvents['force_logout']) => {
      console.log('[Socket] Force logout:', data);
      this.emitToComponents('force_logout', data);
    });

    // User deleted
    this.socket.on('user_deleted', (data: SocketEvents['user_deleted']) => {
      console.log('[Socket] User deleted:', data);
      this.emitToComponents('user_deleted', data);
    });
  }

  /**
   * Emit events to registered components
   */
  private emitToComponents(event: string, data: any) {
    // This will be used by React components to listen to events
    // You can implement this with EventEmitter or Redux
    console.log(`[Socket] Emitting to components: ${event}`, data);
  }

  /**
   * Disconnect from Socket.io server
   */
  disconnect() {
    if (this.socket) {
      console.log('[Socket] Disconnecting...');
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
      this.userRole = null;
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Get socket ID
   */
  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  /**
   * Update user status
   */
  updateStatus(status: string, role?: string) {
    if (this.socket && this.userId) {
      this.socket.emit('update_user_status', {
        userId: this.userId,
        status,
        role: role || this.userRole,
      });
    }
  }

  /**
   * Listen to specific events
   */
  on<T extends keyof SocketEvents>(event: T, callback: (data: SocketEvents[T]) => void) {
    if (this.socket) {
      this.socket.on(event as string, callback as any);
    }
  }

  /**
   * Stop listening to specific events
   */
  off<T extends keyof SocketEvents>(event: T, callback?: (data: SocketEvents[T]) => void) {
    if (this.socket) {
      this.socket.off(event as string, callback as any);
    }
  }
}

// Singleton instance
const socketService = new SocketService();

export default socketService;
