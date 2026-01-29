/**
 * useChatMessages Hook
 * @description Message fetching, pagination, and real-time updates
 */

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/shared/store';
import {
    selectActiveConversationMessages,
    selectActiveConversationId,
    selectChatLoading,
    selectChatError,
    selectHasMoreMessages,
    selectIsLoadingMore,
    selectActiveTypingIndicator,
    setLoading,
    setLoadingMore,
    setHasMoreMessages,
    prependMessages,
    setMessages,
    markAllMessagesRead,
} from '@/src/shared/store/slices/chatSlice';
import { selectToken } from '@/src/shared/store/selectors/auth.selectors';
import type { Message } from '@/src/shared/types/chat';
import { getChatMessages, markMessagesAsRead, ChatMessageApiItem } from '@/src/shared/services/backend/api';

// ============================================================================
// Constants
// ============================================================================

const PAGE_SIZE = 50;

// ============================================================================
// Types
// ============================================================================

export interface UseChatMessagesReturn {
    // Data
    messages: Message[];
    conversationId: string | null;
    // States
    isLoading: boolean;
    isLoadingMore: boolean;
    hasMoreMessages: boolean;
    error: string | null;
    // Real-time
    isTyping: boolean;
    // Actions
    refreshMessages: () => Promise<void>;
    loadMoreMessages: () => Promise<void>;
    markAsRead: () => void;
}

// ============================================================================
// Transform Function
// ============================================================================

const transformApiMessage = (apiMsg: ChatMessageApiItem, currentUserId?: string): Message => {
    const isOwnMessage = apiMsg.senderId === currentUserId;
    return {
        id: apiMsg._id,
        conversationId: apiMsg.conversationId,
        senderId: apiMsg.senderId,
        content: apiMsg.content,
        messageType: apiMsg.messageType,
        mediaUrl: apiMsg.mediaUrl,
        mediaDuration: apiMsg.mediaDuration,
        replyToId: apiMsg.replyToId,
        isDeleted: apiMsg.isDeleted,
        isEdited: apiMsg.isEdited,
        isRead: apiMsg.isReadByDoctor && apiMsg.isReadByClient,
        status: isOwnMessage ? 'delivered' : 'read',
        createdAt: apiMsg.createdAt,
    };
};

// ============================================================================
// Hook
// ============================================================================

export function useChatMessages(): UseChatMessagesReturn {
    const dispatch = useAppDispatch();
    const token = useAppSelector(selectToken);
    const cursorRef = useRef<string | null>(null);

    // Selectors
    const messages = useAppSelector(selectActiveConversationMessages);
    const conversationId = useAppSelector(selectActiveConversationId);
    const isLoading = useAppSelector(selectChatLoading);
    const error = useAppSelector(selectChatError);
    const hasMoreMessages = useAppSelector(selectHasMoreMessages);
    const isLoadingMore = useAppSelector(selectIsLoadingMore);
    const typingIndicator = useAppSelector(selectActiveTypingIndicator);

    // Get current user ID for message ownership check
    const user = useAppSelector(state => state.auth.user);
    const currentUserId = user?._id;

    // Computed
    const isTyping = useMemo(() => typingIndicator?.isTyping ?? false, [typingIndicator]);

    /**
     * Refresh messages (pull-to-refresh or initial load)
     */
    const refreshMessages = useCallback(async () => {
        if (!conversationId || !token) return;

        dispatch(setLoading(true));
        cursorRef.current = null;

        try {
            const response = await getChatMessages(conversationId, token, undefined, PAGE_SIZE);

            if (response.success && response.data) {
                const transformedMessages = response.data.map(msg =>
                    transformApiMessage(msg, currentUserId)
                );
                dispatch(setMessages(transformedMessages));
                dispatch(setHasMoreMessages(response.nextCursor !== null));
                cursorRef.current = response.nextCursor || null;
            }
        } catch (err) {
            console.error('[useChatMessages] Error refreshing messages:', err);
        } finally {
            dispatch(setLoading(false));
        }
    }, [conversationId, token, currentUserId, dispatch]);

    /**
     * Load more messages (pagination)
     */
    const loadMoreMessages = useCallback(async () => {
        if (!conversationId || !token || !hasMoreMessages || isLoadingMore) return;

        dispatch(setLoadingMore(true));

        try {
            // Get oldest message timestamp as cursor
            const oldestMessage = messages[0];
            const cursor = cursorRef.current || oldestMessage?.createdAt;

            const response = await getChatMessages(conversationId, token, cursor, PAGE_SIZE);

            if (response.success && response.data && response.data.length > 0) {
                const transformedMessages = response.data.map(msg =>
                    transformApiMessage(msg, currentUserId)
                );
                dispatch(prependMessages(transformedMessages));
                dispatch(setHasMoreMessages(response.nextCursor !== null));
                cursorRef.current = response.nextCursor || null;
            } else {
                dispatch(setHasMoreMessages(false));
            }
        } catch (err) {
            console.error('[useChatMessages] Error loading more messages:', err);
        } finally {
            dispatch(setLoadingMore(false));
        }
    }, [conversationId, token, hasMoreMessages, isLoadingMore, messages, currentUserId, dispatch]);

    /**
     * Mark all messages as read
     */
    const markAsRead = useCallback(async () => {
        if (!conversationId || !token) return;

        try {
            await markMessagesAsRead(conversationId, token);
            dispatch(markAllMessagesRead(conversationId));
        } catch (err) {
            console.error('[useChatMessages] Error marking messages as read:', err);
        }
    }, [conversationId, token, dispatch]);

    // Auto-load messages when conversation changes
    useEffect(() => {
        if (conversationId && token) {
            refreshMessages();
        }
    }, [conversationId, token]); // eslint-disable-line react-hooks/exhaustive-deps

    // Auto-mark messages as read when conversation is active
    useEffect(() => {
        if (conversationId && messages.length > 0) {
            // Delay to ensure user has seen the messages
            const timeout = setTimeout(() => {
                markAsRead();
            }, 1000);

            return () => clearTimeout(timeout);
        }
    }, [conversationId, messages.length]); // eslint-disable-line react-hooks/exhaustive-deps

    return {
        messages,
        conversationId,
        isLoading,
        isLoadingMore,
        hasMoreMessages,
        error,
        isTyping,
        refreshMessages,
        loadMoreMessages,
        markAsRead,
    };
}

export default useChatMessages;
