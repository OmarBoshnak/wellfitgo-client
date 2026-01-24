/**
 * useMessageSending Hook
 * @description Send messages with optimistic updates
 */

import { useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/shared/store';
import {
    selectActiveConversationId,
    selectChatSending,
    addOptimisticMessage,
    confirmMessageSent,
    markMessageFailed,
} from '@/src/shared/store/slices/chatSlice';
import type { Message, MessageType } from '@/src/shared/types/chat';
import { createOptimisticMessage, mockSendMessage, CURRENT_USER_ID } from '@/src/shared/utils/chat/mockData';
import { pickAndCompressImage, takePhoto } from '@/src/shared/utils/media';

// ============================================================================
// Types
// ============================================================================

export interface UseMessageSendingReturn {
    // States
    isSending: boolean;
    // Actions
    sendTextMessage: (content: string, replyToId?: string) => Promise<void>;
    sendImageMessage: (uri: string, width?: number, height?: number) => Promise<void>;
    sendVoiceMessage: (uri: string, duration: number) => Promise<void>;
    pickAndSendImage: () => Promise<void>;
    takeAndSendPhoto: () => Promise<void>;
}

// ============================================================================
// Hook
// ============================================================================

export function useMessageSending(): UseMessageSendingReturn {
    const dispatch = useAppDispatch();
    const conversationId = useAppSelector(selectActiveConversationId);
    const isSending = useAppSelector(selectChatSending);
    const [localSending, setLocalSending] = useState(false);

    /**
     * Send any type of message with optimistic update
     */
    const sendMessage = useCallback(async (
        messageType: MessageType,
        content: string,
        options?: {
            mediaUrl?: string;
            mediaDuration?: number;
            mediaWidth?: number;
            mediaHeight?: number;
            replyToId?: string;
        }
    ): Promise<void> => {
        if (!conversationId) return;

        const optimisticMessage = createOptimisticMessage({
            content,
            messageType,
            conversationId,
            senderId: CURRENT_USER_ID,
            ...options,
        });

        // Immediately show in UI
        dispatch(addOptimisticMessage(optimisticMessage));

        try {
            // Send to server
            const confirmedMessage = await mockSendMessage(optimisticMessage);

            // Update with confirmed message
            dispatch(confirmMessageSent({
                tempId: optimisticMessage.tempId!,
                message: confirmedMessage,
            }));
        } catch (error) {
            // Mark as failed for retry
            dispatch(markMessageFailed(optimisticMessage.tempId!));
        }
    }, [conversationId, dispatch]);

    /**
     * Send text message
     */
    const sendTextMessage = useCallback(async (
        content: string,
        replyToId?: string
    ): Promise<void> => {
        if (!content.trim()) return;
        await sendMessage('text', content.trim(), { replyToId });
    }, [sendMessage]);

    /**
     * Send image message
     */
    const sendImageMessage = useCallback(async (
        uri: string,
        width?: number,
        height?: number
    ): Promise<void> => {
        await sendMessage('image', '', {
            mediaUrl: uri,
            mediaWidth: width || 400,
            mediaHeight: height || 300,
        });
    }, [sendMessage]);

    /**
     * Send voice message
     */
    const sendVoiceMessage = useCallback(async (
        uri: string,
        duration: number
    ): Promise<void> => {
        await sendMessage('voice', '', {
            mediaUrl: uri,
            mediaDuration: duration,
        });
    }, [sendMessage]);

    /**
     * Pick image from library and send
     */
    const pickAndSendImage = useCallback(async (): Promise<void> => {
        setLocalSending(true);
        try {
            const result = await pickAndCompressImage();
            if (result) {
                await sendImageMessage(result.uri, result.width, result.height);
            }
        } finally {
            setLocalSending(false);
        }
    }, [sendImageMessage]);

    /**
     * Take photo and send
     */
    const takeAndSendPhoto = useCallback(async (): Promise<void> => {
        setLocalSending(true);
        try {
            const result = await takePhoto();
            if (result) {
                await sendImageMessage(result.uri, result.width, result.height);
            }
        } finally {
            setLocalSending(false);
        }
    }, [sendImageMessage]);

    return {
        isSending: isSending || localSending,
        sendTextMessage,
        sendImageMessage,
        sendVoiceMessage,
        pickAndSendImage,
        takeAndSendPhoto,
    };
}

export default useMessageSending;
