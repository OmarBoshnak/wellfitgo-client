/**
 * useChatSocket Hook
 * @description Manages socket connection lifecycle for chat
 */

import { useEffect, useCallback, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@/src/shared/store';
import { selectToken, selectUser } from '@/src/shared/store/selectors/auth.selectors';
import { selectActiveConversationId, setActiveConversation } from '@/src/shared/store/slices/chatSlice';
import { chatSocketService } from '@/src/shared/services/chat/socketService';

// ============================================================================
// Types
// ============================================================================

export interface UseChatSocketReturn {
    isConnected: boolean;
    connect: () => void;
    disconnect: () => void;
    joinConversation: (conversationId: string) => void;
    leaveConversation: () => void;
    startTyping: () => void;
    stopTyping: () => void;
}

// ============================================================================
// Hook
// ============================================================================

export function useChatSocket(): UseChatSocketReturn {
    const dispatch = useAppDispatch();
    const token = useAppSelector(selectToken);
    const user = useAppSelector(selectUser);
    const activeConversationId = useAppSelector(selectActiveConversationId);
    const connectedRef = useRef(false);

    /**
     * Connect to socket
     */
    const connect = useCallback(() => {
        if (!user?._id || !token) {
            console.warn('[useChatSocket] Cannot connect - no user or token');
            return;
        }

        if (!connectedRef.current) {
            chatSocketService.connect(user._id, token);
            connectedRef.current = true;
        }
    }, [user?._id, token]);

    /**
     * Disconnect from socket
     */
    const disconnect = useCallback(() => {
        chatSocketService.disconnect();
        connectedRef.current = false;
    }, []);

    /**
     * Join a conversation room
     */
    const joinConversation = useCallback((conversationId: string) => {
        dispatch(setActiveConversation(conversationId));
        chatSocketService.joinConversation(conversationId);
    }, [dispatch]);

    /**
     * Leave current conversation room
     */
    const leaveConversation = useCallback(() => {
        chatSocketService.leaveConversation();
    }, []);

    /**
     * Start typing indicator
     */
    const startTyping = useCallback(() => {
        chatSocketService.startTyping();
    }, []);

    /**
     * Stop typing indicator
     */
    const stopTyping = useCallback(() => {
        chatSocketService.stopTyping();
    }, []);

    useEffect(() => {
        if (user?._id && token) {
            connect();
        }

        return () => {
            // Don't disconnect on unmount - let the socket manager handle it
            // disconnect will be called when user logs out
        };
    }, [user?._id, token, connect]);

    // Join conversation when it changes
    useEffect(() => {
        if (activeConversationId && chatSocketService.isConnected()) {
            chatSocketService.joinConversation(activeConversationId);
        }
    }, [activeConversationId]);

    return {
        isConnected: chatSocketService.isConnected(),
        connect,
        disconnect,
        joinConversation,
        leaveConversation,
        startTyping,
        stopTyping,
    };
}

export default useChatSocket;
