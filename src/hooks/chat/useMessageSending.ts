/**
 * useMessageSending Hook
 * @description Send messages with optimistic updates and real API calls
 */

import { useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/shared/store';
import {
    addOptimisticMessage,
    confirmMessageSent,
    markMessageFailed,
    selectActiveConversationId,
    selectChatSending,
} from '@/src/shared/store/slices/chatSlice';
import { selectToken, selectUser } from '@/src/shared/store/selectors/auth.selectors';
import type { Message, MessageType } from '@/src/shared/types/chat';
import { sendChatMessage, uploadVoiceMessage } from '@/src/shared/services/backend/api';
import { pickAndCompressImage, takePhoto } from '@/src/shared/utils/media';
// MongoAudioStorage import removed
// import MongoAudioStorage from '@/src/shared/services/mongodb/audioStorage';
import AppwriteStorage from '@/src/shared/services/appwrite/storage';
import * as DocumentPicker from 'expo-document-picker';

// ============================================================================
// Types
// ============================================================================

export interface UseMessageSendingReturn {
    // States
    isSending: boolean;
    // Actions
    sendTextMessage: (content: string, replyToId?: string) => Promise<void>;
    sendImageMessage: (uri: string, width?: number, height?: number) => Promise<void>;
    sendVoiceMessage: (uri: string, duration: number, meteringValues?: number[], size?: number) => Promise<void>;
    pickAndSendImage: () => Promise<void>;
    pickAndSendDocument: () => Promise<void>;
    takeAndSendPhoto: () => Promise<void>;
}

// ============================================================================
// Helper Functions
// ============================================================================

/** Maximum number of retry attempts for upload failures */
const MAX_RETRIES = 3;

/** Base delay for exponential backoff (in ms) */
const BASE_DELAY = 1000;

/**
 * Sleep for specified milliseconds
 */
const sleep = (ms: number): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry a function with exponential backoff
 * @param fn - Async function to retry
 * @param maxRetries - Maximum number of retries
 * @param baseDelay - Base delay in ms (doubles each retry)
 */
async function withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = MAX_RETRIES,
    baseDelay: number = BASE_DELAY
): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));

            if (attempt < maxRetries) {
                const delay = baseDelay * Math.pow(2, attempt);
                console.log(`[withRetry] Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
                await sleep(delay);
            }
        }
    }

    throw lastError;
}

const generateTempId = (): string =>
    `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const createOptimisticMessageData = (input: {
    content: string;
    messageType: MessageType;
    conversationId: string;
    senderId: string;
    mediaUrl?: string;
    mediaDuration?: number;
    mediaWidth?: number;
    mediaHeight?: number;
    replyToId?: string;
    meteringValues?: number[];
}): Message => {
    const tempId = generateTempId();
    return {
        id: tempId,
        tempId,
        clientTempId: tempId,
        conversationId: input.conversationId,
        content: input.content,
        messageType: input.messageType,
        senderId: input.senderId,
        createdAt: new Date().toISOString(),
        status: 'sending',
        isRead: false,
        isOptimistic: true,
        mediaUrl: input.mediaUrl,
        mediaDuration: input.mediaDuration,
        mediaWidth: input.mediaWidth,
        mediaHeight: input.mediaHeight,
        replyToId: input.replyToId,
        meteringValues: input.meteringValues,
    };
};

// ============================================================================
// Hook
// ============================================================================

export function useMessageSending(): UseMessageSendingReturn {
    const dispatch = useAppDispatch();
    const conversationId = useAppSelector(selectActiveConversationId);
    const isSending = useAppSelector(selectChatSending);
    const token = useAppSelector(selectToken);
    const user = useAppSelector(selectUser);
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
            meteringValues?: number[];
            voiceMessage?: any;
        }
    ): Promise<void> => {
        if (!conversationId || !token || !user?._id) {
            console.error('[useMessageSending] Missing conversationId, token, or user');
            return;
        }

        const optimisticMessage = createOptimisticMessageData({
            content,
            messageType,
            conversationId,
            senderId: user._id,
            ...options,
        });

        // Immediately show in UI
        dispatch(addOptimisticMessage(optimisticMessage));

        try {
            // Send to server
            const response = await sendChatMessage(
                conversationId,
                {
                    content,
                    messageType,
                    mediaUrl: options?.mediaUrl,
                    mediaDuration: options?.mediaDuration,
                    replyToId: options?.replyToId,
                    meteringValues: options?.meteringValues,
                    voiceMessage: options?.voiceMessage,
                    clientTempId: optimisticMessage.tempId,
                },
                token
            );

            if (response.success && response.data) {
                // Transform server response to confirmed message
                const confirmedMessage: Message = {
                    id: response.data._id || optimisticMessage.id,
                    conversationId: response.data.conversationId || conversationId,
                    senderId: response.data.senderId || user._id,
                    content: response.data.content || content,
                    messageType: response.data.messageType || messageType,
                    mediaUrl: response.data.mediaUrl || options?.mediaUrl,
                    mediaDuration: response.data.mediaDuration || options?.mediaDuration,
                    meteringValues: response.data.meteringValues || options?.meteringValues,
                    clientTempId: response.data.clientTempId || optimisticMessage.tempId,
                    createdAt: response.data.createdAt || optimisticMessage.createdAt,
                    status: 'sent',
                    isRead: false,
                    isOptimistic: false,
                };

                dispatch(confirmMessageSent({
                    tempId: optimisticMessage.tempId!,
                    message: confirmedMessage,
                }));
            } else {
                throw new Error(response.message || 'Failed to send message');
            }
        } catch (error) {
            console.error('[useMessageSending] Error sending message:', error);
            dispatch(markMessageFailed(optimisticMessage.tempId!));
        }
    }, [conversationId, token, user?._id, dispatch]);

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
        setLocalSending(true);
        try {
            // Upload image
            const uploadResult = await AppwriteStorage.uploadFile(uri, undefined, 'image/jpeg');

            if (!uploadResult.success || !uploadResult.url) {
                console.error('Failed to upload image:', uploadResult.error);
                // Optionally show detailed error to user
                return;
            }

            await sendMessage('image', '', {
                mediaUrl: uploadResult.url,
                mediaWidth: width || 400,
                mediaHeight: height || 300,
            });
        } catch (error) {
            console.error('Error sending image message:', error);
        } finally {
            setLocalSending(false);
        }
    }, [sendMessage]);

    /**
     * Send voice message with optimistic update
     * Shows message immediately while uploading in background
     */
    const sendVoiceMessage = useCallback(async (
        uri: string,
        duration: number,
        meteringValues?: number[],
        size?: number
    ): Promise<void> => {
        if (!conversationId || !token || !user?._id) {
            console.error('[useMessageSending] Missing conversationId, token, or user for voice message');
            return;
        }

        setLocalSending(true);

        // Create optimistic message immediately (before upload)
        const optimisticMessage = createOptimisticMessageData({
            content: '🎤 Voice message',
            messageType: 'voice',
            conversationId,
            senderId: user._id,
            mediaUrl: uri, // Use local URI initially for immediate display
            mediaDuration: duration,
            meteringValues: meteringValues,
        });

        // Show in UI immediately
        dispatch(addOptimisticMessage(optimisticMessage));

        try {
            // Upload voice message to Backend (GridFS) with retry logic
            const uploadResult = await withRetry(
                () => uploadVoiceMessage(uri, duration, token),
                MAX_RETRIES,
                BASE_DELAY
            );

            if (!uploadResult.success || !uploadResult.url) {
                console.error('Failed to upload voice message:', uploadResult.error);
                dispatch(markMessageFailed(optimisticMessage.tempId!));
                return;
            }

            // Send message to server with uploaded URL
            const response = await sendChatMessage(
                conversationId,
                {
                    content: '🎤 Voice message',
                    messageType: 'voice',
                    mediaUrl: uploadResult.url,
                    mediaDuration: duration,
                    meteringValues: meteringValues,
                    voiceMessage: uploadResult.voiceMessage,
                    clientTempId: optimisticMessage.tempId,
                },
                token
            );

            if (response.success && response.data) {
                const confirmedMessage: Message = {
                    id: response.data._id || optimisticMessage.id,
                    conversationId: response.data.conversationId || conversationId,
                    senderId: response.data.senderId || user._id,
                    content: response.data.content || '🎤 Voice message',
                    messageType: 'voice',
                    mediaUrl: response.data.mediaUrl || uploadResult.url,
                    mediaDuration: response.data.mediaDuration || duration,
                    meteringValues: response.data.meteringValues || meteringValues,
                    createdAt: response.data.createdAt || optimisticMessage.createdAt,
                    status: 'sent',
                    isRead: false,
                    isOptimistic: false,
                };

                dispatch(confirmMessageSent({
                    tempId: optimisticMessage.tempId!,
                    message: confirmedMessage,
                }));
            } else {
                throw new Error(response.message || 'Failed to send voice message');
            }
        } catch (error) {
            console.error('Error sending voice message:', error);
            dispatch(markMessageFailed(optimisticMessage.tempId!));
        } finally {
            setLocalSending(false);
        }
    }, [conversationId, token, user?._id, dispatch]);

    /**
     * Pick document and send
     */
    const pickAndSendDocument = useCallback(async (): Promise<void> => {
        setLocalSending(true);
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
                copyToCacheDirectory: true,
            });

            if (result.canceled || !result.assets || result.assets.length === 0) {
                return;
            }

            const asset = result.assets[0];

            // Upload document
            const uploadResult = await AppwriteStorage.uploadFile(asset.uri, asset.name, asset.mimeType, asset.size);

            if (!uploadResult.success || !uploadResult.url) {
                console.error('Failed to upload document:', uploadResult.error);
                return;
            }

            await sendMessage('document', asset.name, {
                mediaUrl: uploadResult.url,
            });

        } catch (error) {
            console.error('Error sending document:', error);
        } finally {
            setLocalSending(false);
        }
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
        pickAndSendDocument,
        takeAndSendPhoto,
    };
}

export default useMessageSending;
