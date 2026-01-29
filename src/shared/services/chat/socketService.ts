/**
 * Chat Socket Service
 * @description Socket.io client for real-time chat messaging
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
    markAllMessagesRead,
} from '@/src/shared/store/slices/chatSlice';
import type { Message } from '@/src/shared/types/chat';

// ============================================================================
// Configuration
// ============================================================================

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL || 'https://wellfitgo-backend-97b72a680866.herokuapp.com';
const RECONNECTION_ATTEMPTS = 5;
const RECONNECTION_DELAY = 1000;

// ============================================================================
// Types
// ============================================================================

interface ServerMessage {
    _id: string;
    conversationId: string;
    senderId: string;
    senderRole: 'doctor' | 'client';
    content: string;
    messageType: 'text' | 'voice' | 'image' | 'document';
    mediaUrl?: string;
    mediaDuration?: number;
    isDeleted?: boolean;
    isEdited?: boolean;
    createdAt: string;
}

// ============================================================================
// Socket Service Class
// ============================================================================

class ChatSocketService {
    private socket: Socket | null = null;
    private currentUserId: string | null = null;
    private currentConversationId: string | null = null;
    private typingTimeout: ReturnType<typeof setTimeout> | null = null;

    /**
     * Transform server message to client Message type
     */
    private transformMessage(serverMsg: ServerMessage): Message {
        return {
            id: serverMsg._id,
            conversationId: serverMsg.conversationId,
            senderId: serverMsg.senderId,
            content: serverMsg.content,
            messageType: serverMsg.messageType,
            mediaUrl: serverMsg.mediaUrl,
            mediaDuration: serverMsg.mediaDuration,
            isDeleted: serverMsg.isDeleted || false,
            isEdited: serverMsg.isEdited || false,
            isRead: false,
            status: 'delivered',
            createdAt: serverMsg.createdAt,
        };
    }

    /**
     * Initialize socket connection to /chat namespace
     */
    connect(userId: string, token?: string): void {
        if (this.socket?.connected) {
            console.log('[ChatSocket] Already connected');
            return;
        }

        this.currentUserId = userId;
        store.dispatch(setConnectionStatus('connecting'));

        // Connect to /chat namespace
        this.socket = io(`${SOCKET_URL}/chat`, {
            path: '/socket.io',
            auth: {
                userId,
                token,
            },
            transports: ['websocket', 'polling'], // Allow fallback to polling
            reconnection: true,
            reconnectionAttempts: RECONNECTION_ATTEMPTS,
            reconnectionDelay: RECONNECTION_DELAY,
            reconnectionDelayMax: 5000,
            timeout: 20000, // Increase timeout
            forceNew: true,
        });

        this.setupEventListeners();
    }

    /**
     * Setup socket event listeners (matching backend event names)
     */
    private setupEventListeners(): void {
        if (!this.socket) return;

        // Connection events
        this.socket.on('connect', () => {
            console.log('[ChatSocket] Connected to /chat namespace');
            store.dispatch(setConnectionStatus('connected'));

            // Rejoin conversation if was in one
            if (this.currentConversationId) {
                this.joinConversation(this.currentConversationId);
            }
        });

        this.socket.on('disconnect', (reason) => {
            console.log('[ChatSocket] Disconnected:', reason);
            store.dispatch(setConnectionStatus('disconnected'));
        });

        this.socket.on('connect_error', (error) => {
            console.error('[ChatSocket] Connection error:', error.message);
            console.error('[ChatSocket] Connection error details:', error);
            console.error('[ChatSocket] Socket URL:', `${SOCKET_URL}/chat`);
            store.dispatch(setConnectionStatus('disconnected'));
        });

        this.socket.on('reconnecting', () => {
            console.log('[ChatSocket] Reconnecting...');
            store.dispatch(setConnectionStatus('reconnecting'));
        });

        this.socket.on('reconnect', () => {
            console.log('[ChatSocket] Reconnected');
            store.dispatch(setConnectionStatus('connected'));
        });

        this.socket.on('reconnect_failed', () => {
            console.error('[ChatSocket] Reconnection failed');
            store.dispatch(setConnectionStatus('disconnected'));
        });

        // Message events (matching backend event names from chat.socket.ts)
        this.socket.on('new_message', (serverMsg: ServerMessage) => {
            console.log('[ChatSocket] New message received:', serverMsg._id);
            // Don't add own messages (they're already added optimistically)
            if (serverMsg.senderId !== this.currentUserId) {
                const message = this.transformMessage(serverMsg);
                store.dispatch(addMessage(message));
            }
        });

        this.socket.on('message_edited', (data: {
            messageId: string;
            content: string;
            isEdited: boolean;
            updatedAt: string;
        }) => {
            console.log('[ChatSocket] Message edited:', data.messageId);
            // We need to update the existing message
            const state = store.getState();
            const existingMessage = state.chat.messages.find(m => m.id === data.messageId);
            if (existingMessage) {
                store.dispatch(updateMessage({
                    ...existingMessage,
                    content: data.content,
                    isEdited: true,
                    updatedAt: data.updatedAt,
                }));
            }
        });

        this.socket.on('message_deleted', (data: { messageId: string; conversationId: string }) => {
            console.log('[ChatSocket] Message deleted:', data.messageId);
            store.dispatch(removeMessage(data.messageId));
        });

        this.socket.on('messages_read', (data: {
            conversationId: string;
            readBy: 'doctor' | 'client';
            readAt: string;
        }) => {
            console.log('[ChatSocket] Messages read in conversation:', data.conversationId);
            if (data.conversationId === this.currentConversationId) {
                store.dispatch(markAllMessagesRead(data.conversationId));
            }
        });

        // Typing events (matching backend event names)
        this.socket.on('user_typing', (data: {
            conversationId: string;
            userId: string;
            isTyping: boolean;
        }) => {
            if (data.userId !== this.currentUserId) {
                store.dispatch(setTypingIndicator({
                    conversationId: data.conversationId,
                    userId: data.userId,
                    isTyping: data.isTyping,
                    timestamp: ''
                }));
            }
        });

        // Presence events
        this.socket.on('user_online', (data: { userId: string }) => {
            console.log('[ChatSocket] User online:', data.userId);
            store.dispatch(updateDoctorOnlineStatus({ isOnline: true }));
        });

        this.socket.on('user_offline', (data: { userId: string; lastSeen: string }) => {
            console.log('[ChatSocket] User offline:', data.userId);
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
     * Join a conversation room (matching backend event name)
     */
    joinConversation(conversationId: string): void {
        if (!this.socket?.connected) {
            console.warn('[ChatSocket] Cannot join conversation - not connected');
            return;
        }

        this.currentConversationId = conversationId;
        this.socket.emit('join_conversation', conversationId);
        console.log('[ChatSocket] Joined conversation:', conversationId);
    }

    /**
     * Leave current conversation room (matching backend event name)
     */
    leaveConversation(): void {
        if (!this.socket?.connected || !this.currentConversationId) return;

        this.socket.emit('leave_conversation', this.currentConversationId);
        console.log('[ChatSocket] Left conversation:', this.currentConversationId);
        this.currentConversationId = null;
    }

    /**
     * Send typing indicator (matching backend event names)
     */
    startTyping(): void {
        if (!this.socket?.connected || !this.currentConversationId || !this.currentUserId) return;

        this.socket.emit('typing_start', {
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

        this.socket.emit('typing_stop', {
            conversationId: this.currentConversationId,
            userId: this.currentUserId,
        });
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

export const chatSocketService = new ChatSocketService();

export default chatSocketService;
