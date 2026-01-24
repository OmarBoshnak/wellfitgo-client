/**
 * useChatMessages Hook
 * @description Message fetching, pagination, and real-time updates
 */

import { useCallback, useEffect, useMemo } from 'react';
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
import type { Message } from '@/src/shared/types/chat';
import { mockMessages, mockDelay } from '@/src/shared/utils/chat/mockData';

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
// Hook
// ============================================================================

export function useChatMessages(): UseChatMessagesReturn {
    const dispatch = useAppDispatch();

    // Selectors
    const messages = useAppSelector(selectActiveConversationMessages);
    const conversationId = useAppSelector(selectActiveConversationId);
    const isLoading = useAppSelector(selectChatLoading);
    const error = useAppSelector(selectChatError);
    const hasMoreMessages = useAppSelector(selectHasMoreMessages);
    const isLoadingMore = useAppSelector(selectIsLoadingMore);
    const typingIndicator = useAppSelector(selectActiveTypingIndicator);

    // Computed
    const isTyping = useMemo(() => typingIndicator?.isTyping ?? false, [typingIndicator]);

    /**
     * Refresh messages (pull-to-refresh)
     */
    const refreshMessages = useCallback(async () => {
        if (!conversationId) return;

        dispatch(setLoading(true));

        try {
            // TODO: Replace with actual API call
            await mockDelay(500);
            dispatch(setMessages(mockMessages));
            dispatch(setHasMoreMessages(true));
        } catch {
            // Error handled by slice
        } finally {
            dispatch(setLoading(false));
        }
    }, [conversationId, dispatch]);

    /**
     * Load more messages (pagination)
     */
    const loadMoreMessages = useCallback(async () => {
        if (!conversationId || !hasMoreMessages || isLoadingMore) return;

        dispatch(setLoadingMore(true));

        try {
            // TODO: Replace with actual API call
            await mockDelay(500);

            // Mock: no more messages after first load
            dispatch(setHasMoreMessages(false));

            // In real implementation:
            // const olderMessages = await api.getMessages(conversationId, { before: oldestMessageId });
            // dispatch(prependMessages(olderMessages));
            // dispatch(setHasMoreMessages(olderMessages.length >= PAGE_SIZE));
        } catch {
            // Error handled by slice
        } finally {
            dispatch(setLoadingMore(false));
        }
    }, [conversationId, hasMoreMessages, isLoadingMore, dispatch]);

    /**
     * Mark all messages as read
     */
    const markAsRead = useCallback(() => {
        if (conversationId) {
            dispatch(markAllMessagesRead(conversationId));
        }
    }, [conversationId, dispatch]);

    // Auto-mark messages as read when conversation is active
    useEffect(() => {
        if (conversationId && messages.length > 0) {
            // Delay to ensure user has seen the messages
            const timeout = setTimeout(() => {
                markAsRead();
            }, 1000);

            return () => clearTimeout(timeout);
        }
    }, [conversationId, messages.length, markAsRead]);

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
