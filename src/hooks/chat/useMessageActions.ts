/**
 * useMessageActions Hook
 * @description Reply, edit, delete message actions
 */

import { useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/shared/store';
import {
    selectActiveConversationMessages,
} from '@/src/shared/store/slices/chatSlice';
import { useMessageManagement } from './useMessageManagement';
import type { Message, MessageAction } from '@/src/shared/types/chat';
import { selectUser } from '@/src/shared/store/selectors/auth.selectors';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';

// ============================================================================
// Types
// ============================================================================

export interface UseMessageActionsReturn {
    // States
    selectedMessage: Message | null;
    replyingTo: Message | null;
    editingMessage: Message | null;
    isActionSheetVisible: boolean;
    // Actions
    selectMessage: (message: Message) => void;
    clearSelection: () => void;
    showActionSheet: (message: Message) => void;
    hideActionSheet: () => void;
    handleAction: (action: MessageAction) => Promise<void>;
    setReplyingTo: (message: Message | null) => void;
    clearReply: () => void;
    startEditing: (message: Message) => void;
    cancelEditing: () => void;
    submitEdit: (newContent: string) => void;
    // Helpers
    canEdit: (message: Message) => boolean;
    canDelete: (message: Message) => boolean;
    getAvailableActions: (message: Message) => MessageAction[];
}

// ============================================================================
// Hook
// ============================================================================

export function useMessageActions(): UseMessageActionsReturn {
    const dispatch = useAppDispatch();
    const messages = useAppSelector(selectActiveConversationMessages);
    const user = useAppSelector(selectUser);
    const { deleteMessageById, editMessageById } = useMessageManagement();

    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [replyingTo, setReplyingToState] = useState<Message | null>(null);
    const [editingMessage, setEditingMessage] = useState<Message | null>(null);
    const [isActionSheetVisible, setIsActionSheetVisible] = useState(false);

    /**
     * Check if user can edit message
     */
    const canEdit = useCallback((message: Message): boolean => {
        return (
            message.senderId === user?._id &&
            message.messageType === 'text' &&
            !message.isDeleted
        );
    }, [user?._id]);

    /**
     * Check if user can delete message
     */
    const canDelete = useCallback((message: Message): boolean => {
        return message.senderId === user?._id && !message.isDeleted;
    }, [user?._id]);

    /**
     * Get available actions for a message
     */
    const getAvailableActions = useCallback((message: Message): MessageAction[] => {
        const actions: MessageAction[] = ['reply', 'copy'];

        if (canEdit(message)) {
            actions.push('edit');
        }

        if (canDelete(message)) {
            actions.push('delete');
        }

        return actions;
    }, [canEdit, canDelete]);

    /**
     * Select a message
     */
    const selectMessage = useCallback((message: Message) => {
        setSelectedMessage(message);
        Haptics.selectionAsync();
    }, []);

    /**
     * Clear selection
     */
    const clearSelection = useCallback(() => {
        setSelectedMessage(null);
    }, []);

    /**
     * Show action sheet for message
     */
    const showActionSheet = useCallback((message: Message) => {
        setSelectedMessage(message);
        setIsActionSheetVisible(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }, []);

    /**
     * Hide action sheet
     */
    const hideActionSheet = useCallback(() => {
        setIsActionSheetVisible(false);
    }, []);

    /**
     * Set replying to message
     */
    const setReplyingTo = useCallback((message: Message | null) => {
        setReplyingToState(message);
        if (message) {
            Haptics.selectionAsync();
        }
    }, []);

    /**
     * Clear reply
     */
    const clearReply = useCallback(() => {
        setReplyingToState(null);
    }, []);

    /**
     * Start editing a message
     */
    const startEditing = useCallback((message: Message) => {
        setEditingMessage(message);
        setIsActionSheetVisible(false);
        Haptics.selectionAsync();
    }, []);

    /**
     * Cancel editing
     */
    const cancelEditing = useCallback(() => {
        setEditingMessage(null);
    }, []);

    /**
     * Submit edited message
     */
    const submitEdit = useCallback(async (newContent: string) => {
        if (editingMessage && newContent.trim()) {
            try {
                await editMessageById(editingMessage.id, newContent.trim());
                setEditingMessage(null);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
                console.error('[useMessageActions] Failed to edit message:', error);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
        }
    }, [editingMessage, editMessageById]);

    /**
     * Handle action selection
     */
    const handleAction = useCallback(async (action: MessageAction): Promise<void> => {
        if (!selectedMessage) return;

        switch (action) {
            case 'reply':
                setReplyingTo(selectedMessage);
                break;

            case 'copy':
                if (selectedMessage.content) {
                    await Clipboard.setStringAsync(selectedMessage.content);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
                break;

            case 'edit':
                if (canEdit(selectedMessage)) {
                    startEditing(selectedMessage);
                }
                break;

            case 'delete':
                if (canDelete(selectedMessage)) {
                    try {
                        await deleteMessageById(selectedMessage.id);
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                    } catch (error) {
                        console.error('[useMessageActions] Failed to delete message:', error);
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                    }
                }
                break;

            case 'forward':
                // TODO: Implement forward
                break;
        }

        hideActionSheet();
        clearSelection();
    }, [selectedMessage, setReplyingTo, canEdit, canDelete, startEditing, hideActionSheet, clearSelection, deleteMessageById]);

    return {
        selectedMessage,
        replyingTo,
        editingMessage,
        isActionSheetVisible,
        selectMessage,
        clearSelection,
        showActionSheet,
        hideActionSheet,
        handleAction,
        setReplyingTo,
        clearReply,
        startEditing,
        cancelEditing,
        submitEdit,
        canEdit,
        canDelete,
        getAvailableActions,
    };
}

export default useMessageActions;
