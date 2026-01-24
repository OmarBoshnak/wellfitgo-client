/**
 * Socket Service
 * @description Socket.io client for real-time messaging
 */

import { io, Socket } from 'socket.io-client';
import { store } from '@/src/shared/store';
import {
    addMessage,
    updateMessage,
    deleteMessage as removeMessage,
    setTypingIndicator,
    setConnectionStatus,
    updateDoctorOnlineStatus,
    markMessageRead,
} from '@/src/shared/store/slices/chatSlice';
import type { Message, TypingIndicator, SocketEvents } from '@/src/shared/types/chat';

// ============================================================================
// Configuration
// ============================================================================

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3001';
const RECONNECTION_ATTEMPTS = 5;
const RECONNECTION_DELAY = 1000;

// ============================================================================
// Socket Service Class
// ============================================================================

class SocketService {
    private socket: Socket | null = null;
    private currentUserId: string | null = null;
    private currentConversationId: string | null = null;
    private typingTimeout: ReturnType<typeof setTimeout> | null = null;

    /**
     * Initialize socket connection
     */
    connect(userId: string, token?: string): void {
        if (this.socket?.connected) {
            console.log('[Socket] Already connected');
            return;
        }

        this.currentUserId = userId;
        store.dispatch(setConnectionStatus('connecting'));

        this.socket = io(SOCKET_URL, {
            auth: {
                userId,
                token,
            },
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: RECONNECTION_ATTEMPTS,
            reconnectionDelay: RECONNECTION_DELAY,
            reconnectionDelayMax: 5000,
            timeout: 10000,
        });

        this.setupEventListeners();
    }

    /**
     * Setup socket event listeners
     */
    private setupEventListeners(): void {
        if (!this.socket) return;

        // Connection events
        this.socket.on('connect', () => {
            console.log('[Socket] Connected');
            store.dispatch(setConnectionStatus('connected'));

            // Rejoin conversation if was in one
            if (this.currentConversationId) {
                this.joinConversation(this.currentConversationId);
            }
        });

        this.socket.on('disconnect', (reason) => {
            console.log('[Socket] Disconnected:', reason);
            store.dispatch(setConnectionStatus('disconnected'));
        });

        this.socket.on('connect_error', (error) => {
            console.error('[Socket] Connection error:', error.message);
            store.dispatch(setConnectionStatus('disconnected'));
        });

        this.socket.on('reconnecting', () => {
            console.log('[Socket] Reconnecting...');
            store.dispatch(setConnectionStatus('reconnecting'));
        });

        this.socket.on('reconnect', () => {
            console.log('[Socket] Reconnected');
            store.dispatch(setConnectionStatus('connected'));
        });

        this.socket.on('reconnect_failed', () => {
            console.error('[Socket] Reconnection failed');
            store.dispatch(setConnectionStatus('disconnected'));
        });

        // Message events
        this.socket.on('message:new', (message: Message) => {
            console.log('[Socket] New message received:', message.id);
            store.dispatch(addMessage(message));
        });

        this.socket.on('message:updated', (message: Message) => {
            console.log('[Socket] Message updated:', message.id);
            store.dispatch(updateMessage(message));
        });

        this.socket.on('message:deleted', (data: { messageId: string; conversationId: string }) => {
            console.log('[Socket] Message deleted:', data.messageId);
            store.dispatch(removeMessage(data.messageId));
        });

        this.socket.on('message:read', (data: { messageId: string; readBy: string; readAt: string }) => {
            console.log('[Socket] Message read:', data.messageId);
            store.dispatch(markMessageRead(data.messageId));
        });

        // Typing events
        this.socket.on('typing:start', (indicator: TypingIndicator) => {
            if (indicator.userId !== this.currentUserId) {
                store.dispatch(setTypingIndicator({ ...indicator, isTyping: true }));
            }
        });

        this.socket.on('typing:stop', (indicator: TypingIndicator) => {
            if (indicator.userId !== this.currentUserId) {
                store.dispatch(setTypingIndicator({ ...indicator, isTyping: false }));
            }
        });

        // Presence events
        this.socket.on('user:online', (data: { userId: string }) => {
            console.log('[Socket] User online:', data.userId);
            store.dispatch(updateDoctorOnlineStatus({ isOnline: true }));
        });

        this.socket.on('user:offline', (data: { userId: string; lastSeen: string }) => {
            console.log('[Socket] User offline:', data.userId);
            store.dispatch(updateDoctorOnlineStatus({ isOnline: false, lastSeen: data.lastSeen }));
        });
    }

    /**
     * Disconnect socket
     */
    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.currentUserId = null;
        this.currentConversationId = null;
        store.dispatch(setConnectionStatus('disconnected'));
    }

    /**
     * Join a conversation room
     */
    joinConversation(conversationId: string): void {
        if (!this.socket?.connected) {
            console.warn('[Socket] Cannot join conversation - not connected');
            return;
        }

        this.currentConversationId = conversationId;
        this.socket.emit('conversation:join', { conversationId });
        console.log('[Socket] Joined conversation:', conversationId);
    }

    /**
     * Leave current conversation room
     */
    leaveConversation(): void {
        if (!this.socket?.connected || !this.currentConversationId) return;

        this.socket.emit('conversation:leave', { conversationId: this.currentConversationId });
        console.log('[Socket] Left conversation:', this.currentConversationId);
        this.currentConversationId = null;
    }

    /**
     * Send typing indicator
     */
    startTyping(): void {
        if (!this.socket?.connected || !this.currentConversationId || !this.currentUserId) return;

        this.socket.emit('typing:start', {
            conversationId: this.currentConversationId,
            userId: this.currentUserId,
        });

        // Auto-stop typing after 3 seconds
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }
        this.typingTimeout = setTimeout(() => {
            this.stopTyping();
        }, 3000);
    }

    /**
     * Stop typing indicator
     */
    stopTyping(): void {
        if (!this.socket?.connected || !this.currentConversationId || !this.currentUserId) return;

        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
            this.typingTimeout = null;
        }

        this.socket.emit('typing:stop', {
            conversationId: this.currentConversationId,
            userId: this.currentUserId,
        });
    }

    /**
     * Mark message as read
     */
    markAsRead(messageId: string): void {
        if (!this.socket?.connected || !this.currentUserId) return;

        this.socket.emit('message:read', {
            messageId,
            readBy: this.currentUserId,
        });
    }

    /**
     * Send a message (optimistic update should be done before calling this)
     */
    sendMessage(message: Partial<Message>): void {
        if (!this.socket?.connected) {
            console.warn('[Socket] Cannot send message - not connected');
            return;
        }

        this.socket.emit('message:send', message);
    }

    /**
     * Check if socket is connected
     */
    isConnected(): boolean {
        return this.socket?.connected ?? false;
    }

    /**
     * Get current conversation ID
     */
    getCurrentConversationId(): string | null {
        return this.currentConversationId;
    }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const socketService = new SocketService();

export default socketService;
