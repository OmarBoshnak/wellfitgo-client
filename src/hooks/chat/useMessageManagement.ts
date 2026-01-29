/**
 * useMessageManagement Hook
 * @description Handle message editing and deletion with optimistic updates
 */

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/shared/store';
import {
    selectActiveConversationId,
    editMessage,
    deleteMessage,
} from '@/src/shared/store/slices/chatSlice';
import { selectToken } from '@/src/shared/store/selectors/auth.selectors';
import { deleteChatMessage, editChatMessage } from '@/src/shared/services/backend/api';

// ============================================================================
// Types
// ============================================================================

export interface UseMessageManagementReturn {
    // Actions
    deleteMessageById: (messageId: string) => Promise<void>;
    editMessageById: (messageId: string, newContent: string) => Promise<void>;
}

// ============================================================================
// Hook
// ============================================================================

export function useMessageManagement(): UseMessageManagementReturn {
    const dispatch = useAppDispatch();
    const conversationId = useAppSelector(selectActiveConversationId);
    const token = useAppSelector(selectToken);

    /**
     * Delete a message with optimistic update
     */
    const deleteMessageById = useCallback(async (messageId: string): Promise<void> => {
        if (!conversationId || !token) {
            console.error('[useMessageManagement] Missing conversationId or token');
            return;
        }

        try {
            // Optimistic update - mark as deleted immediately
            dispatch(deleteMessage(messageId));

            // Call backend API
            const response = await deleteChatMessage(conversationId, messageId, token);

            if (!response.success) {
                // If backend fails, revert the optimistic update
                console.error('[useMessageManagement] Failed to delete message:', response.message);
                // You might want to implement a revert mechanism here
            }
        } catch (error) {
            console.error('[useMessageManagement] Error deleting message:', error);
            // You might want to implement a revert mechanism here
        }
    }, [conversationId, token, dispatch]);

    /**
     * Edit a message with optimistic update
     */
    const editMessageById = useCallback(async (
        messageId: string,
        newContent: string
    ): Promise<void> => {
        if (!conversationId || !token) {
            console.error('[useMessageManagement] Missing conversationId or token');
            return;
        }

        if (!newContent.trim()) {
            console.error('[useMessageManagement] Message content cannot be empty');
            return;
        }

        try {
            // Optimistic update - edit immediately
            dispatch(editMessage({
                messageId,
                newContent: newContent.trim(),
            }));

            // Call backend API
            const response = await editChatMessage(conversationId, messageId, {
                content: newContent.trim(),
            }, token);

            if (!response.success) {
                // If backend fails, revert the optimistic update
                console.error('[useMessageManagement] Failed to edit message:', response.message);
                // You might want to implement a revert mechanism here
            }
        } catch (error) {
            console.error('[useMessageManagement] Error editing message:', error);
            // You might want to implement a revert mechanism here
        }
    }, [conversationId, token, dispatch]);

    return {
        deleteMessageById,
        editMessageById,
    };
}

export default useMessageManagement;
