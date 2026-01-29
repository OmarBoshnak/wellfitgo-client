/**
 * Chat Slice
 * @description Redux slice for chat state management with optimistic updates
 */

import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import type {
    ChatState,
    Message,
    Conversation,
    Doctor,
    ConnectionStatus,
    TypingIndicator,
} from '@/src/shared/types/chat';

// ============================================================================
// Initial State
// ============================================================================

const initialState: ChatState = {
    messages: [],
    conversations: [],
    activeConversationId: null,
    currentDoctor: null,
    // UI States
    isLoading: false,
    isSending: false,
    error: null,
    // Real-time
    connectionStatus: 'disconnected',
    typingIndicators: [],
    // Pagination
    hasMoreMessages: true,
    isLoadingMore: false,
};

// ============================================================================
// Slice
// ============================================================================

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        // ====================================================================
        // Loading States
        // ====================================================================
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setSending: (state, action: PayloadAction<boolean>) => {
            state.isSending = action.payload;
        },
        setLoadingMore: (state, action: PayloadAction<boolean>) => {
            state.isLoadingMore = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },

        // ====================================================================
        // Messages
        // ====================================================================

        /**
         * Add optimistic message (before server confirmation)
         */
        addOptimisticMessage: (state, action: PayloadAction<Message>) => {
            state.messages.push(action.payload);
            state.isSending = true;
        },

        /**
         * Confirm message sent (replace optimistic with real)
         */
        confirmMessageSent: (
            state,
            action: PayloadAction<{ tempId: string; message: Message }>
        ) => {
            const { tempId, message } = action.payload;
            const index = state.messages.findIndex(m => m.tempId === tempId);
            if (index !== -1) {
                state.messages[index] = message;
            } else {
                // If not found, just add it
                state.messages.push(message);
            }
            state.isSending = false;
        },

        /**
         * Mark message as failed
         */
        markMessageFailed: (state, action: PayloadAction<string>) => {
            const message = state.messages.find(m => m.tempId === action.payload);
            if (message) {
                message.status = 'failed';
                message.isOptimistic = false;
            }
            state.isSending = false;
        },

        /**
         * Retry failed message
         */
        retryMessage: (state, action: PayloadAction<string>) => {
            const message = state.messages.find(m => m.id === action.payload);
            if (message) {
                message.status = 'sending';
                message.isOptimistic = true;
            }
            state.isSending = true;
        },

        /**
         * Add new message from real-time
         */
        addMessage: (state, action: PayloadAction<Message>) => {
            // Avoid duplicates
            if (!state.messages.find(m => m.id === action.payload.id)) {
                state.messages.push(action.payload);
            }
        },

        /**
         * Update existing message
         */
        updateMessage: (state, action: PayloadAction<Message>) => {
            const index = state.messages.findIndex(m => m.id === action.payload.id);
            if (index !== -1) {
                state.messages[index] = action.payload;
            }
        },

        /**
         * Edit message content
         */
        editMessage: (
            state,
            action: PayloadAction<{ messageId: string; newContent: string }>
        ) => {
            const message = state.messages.find(m => m.id === action.payload.messageId);
            if (message) {
                message.content = action.payload.newContent;
                message.isEdited = true;
                message.updatedAt = new Date().toISOString();
            }
        },

        /**
         * Soft delete message
         */
        deleteMessage: (state, action: PayloadAction<string>) => {
            const message = state.messages.find(m => m.id === action.payload);
            if (message) {
                message.isDeleted = true;
                message.content = '';
            }
        },

        /**
         * Mark message as read
         */
        markMessageRead: (state, action: PayloadAction<string>) => {
            const message = state.messages.find(m => m.id === action.payload);
            if (message) {
                message.isRead = true;
                message.status = 'read';
            }
        },

        /**
         * Mark all messages in conversation as read
         */
        markAllMessagesRead: (state, action: PayloadAction<string>) => {
            state.messages
                .filter(m => m.conversationId === action.payload && !m.isRead)
                .forEach(m => {
                    m.isRead = true;
                    m.status = 'read';
                });
        },

        /**
         * Load more messages (prepend for older messages)
         */
        prependMessages: (state, action: PayloadAction<Message[]>) => {
            state.messages = [...action.payload, ...state.messages];
        },

        /**
         * Set messages (replace all)
         */
        setMessages: (state, action: PayloadAction<Message[]>) => {
            state.messages = action.payload;
        },

        /**
         * Set has more messages for pagination
         */
        setHasMoreMessages: (state, action: PayloadAction<boolean>) => {
            state.hasMoreMessages = action.payload;
        },

        // ====================================================================
        // Conversations
        // ====================================================================
        setActiveConversation: (state, action: PayloadAction<string | null>) => {
            state.activeConversationId = action.payload;
        },

        updateConversation: (state, action: PayloadAction<Conversation>) => {
            const index = state.conversations.findIndex(c => c.id === action.payload.id);
            if (index !== -1) {
                state.conversations[index] = action.payload;
            }
        },

        updateUnreadCount: (
            state,
            action: PayloadAction<{ conversationId: string; count: number }>
        ) => {
            const conv = state.conversations.find(c => c.id === action.payload.conversationId);
            if (conv) {
                conv.unreadCount = action.payload.count;
            }
        },

        // ====================================================================
        // Doctor
        // ====================================================================
        setCurrentDoctor: (state, action: PayloadAction<Doctor | null>) => {
            state.currentDoctor = action.payload;
        },

        updateDoctorOnlineStatus: (
            state,
            action: PayloadAction<{ isOnline: boolean; lastSeen?: string }>
        ) => {
            if (state.currentDoctor) {
                state.currentDoctor.isOnline = action.payload.isOnline;
                if (action.payload.lastSeen) {
                    state.currentDoctor.lastSeen = action.payload.lastSeen;
                }
            }
        },

        // ====================================================================
        // Real-time
        // ====================================================================
        setConnectionStatus: (state, action: PayloadAction<ConnectionStatus>) => {
            state.connectionStatus = action.payload;
        },

        setTypingIndicator: (state, action: PayloadAction<TypingIndicator>) => {
            const { conversationId, userId, isTyping } = action.payload;
            const existing = state.typingIndicators.findIndex(
                t => t.conversationId === conversationId && t.userId === userId
            );

            if (isTyping) {
                if (existing === -1) {
                    state.typingIndicators.push(action.payload);
                } else {
                    state.typingIndicators[existing] = action.payload;
                }
            } else {
                if (existing !== -1) {
                    state.typingIndicators.splice(existing, 1);
                }
            }
        },

        clearTypingIndicators: (state, action: PayloadAction<string>) => {
            state.typingIndicators = state.typingIndicators.filter(
                t => t.conversationId !== action.payload
            );
        },

        // ====================================================================
        // Reset
        // ====================================================================
        resetChat: () => initialState,
    },
});

// ============================================================================
// Actions
// ============================================================================

export const {
    setLoading,
    setSending,
    setLoadingMore,
    setError,
    addOptimisticMessage,
    confirmMessageSent,
    markMessageFailed,
    retryMessage,
    addMessage,
    updateMessage,
    editMessage,
    deleteMessage,
    markMessageRead,
    markAllMessagesRead,
    prependMessages,
    setMessages,
    setHasMoreMessages,
    setActiveConversation,
    updateConversation,
    updateUnreadCount,
    setCurrentDoctor,
    updateDoctorOnlineStatus,
    setConnectionStatus,
    setTypingIndicator,
    clearTypingIndicators,
    resetChat,
} = chatSlice.actions;

// ============================================================================
// Selectors
// ============================================================================

export const selectMessages = (state: RootState) => state.chat.messages;

export const selectActiveConversationId = (state: RootState) =>
    state.chat.activeConversationId;

export const selectActiveConversationMessages = createSelector(
    [(state: RootState) => state.chat.messages, (state: RootState) => state.chat.activeConversationId],
    (messages, activeConversationId) => {
        if (!activeConversationId) return [];
        return messages
            .filter(m => m.conversationId === activeConversationId)
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
);

export const selectConversations = (state: RootState) => state.chat.conversations;

export const selectActiveConversation = createSelector(
    [(state: RootState) => state.chat.conversations, (state: RootState) => state.chat.activeConversationId],
    (conversations, activeConversationId) => {
        return conversations.find(c => c.id === activeConversationId) || null;
    }
);

export const selectCurrentDoctor = (state: RootState) => state.chat.currentDoctor;

export const selectChatLoading = (state: RootState) => state.chat.isLoading;

export const selectChatSending = (state: RootState) => state.chat.isSending;

export const selectChatError = (state: RootState) => state.chat.error;

export const selectConnectionStatus = (state: RootState) => state.chat.connectionStatus;

export const selectTypingIndicators = (state: RootState) => state.chat.typingIndicators;

export const selectActiveTypingIndicator = (state: RootState) => {
    const { typingIndicators, activeConversationId, currentDoctor } = state.chat;
    if (!activeConversationId || !currentDoctor) return null;
    return typingIndicators.find(
        t => t.conversationId === activeConversationId && t.userId === currentDoctor.id
    ) || null;
};

export const selectHasMoreMessages = (state: RootState) => state.chat.hasMoreMessages;

export const selectIsLoadingMore = (state: RootState) => state.chat.isLoadingMore;

export const selectUnreadCount = (state: RootState) =>
    state.chat.conversations.reduce((sum, c) => sum + c.unreadCount, 0);

// ============================================================================
// Export
// ============================================================================

export default chatSlice.reducer;
