/**
 * ChatScreen
 * @description Main chat screen - clean orchestrator with modular components
 */

import React, { useCallback, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/src/shared/core/constants/Theme';
import { useIsFocused } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '@/src/shared/store';
import {
    selectConnectionStatus,
    selectCurrentDoctor,
    setActiveConversation,
    setCurrentDoctor,
    setDoctorAvailabilityStatus,
    resetUnreadCount,
} from '@/src/shared/store/slices/chatSlice';
import { selectToken } from '@/src/shared/store/selectors/auth.selectors';
import type { ChatConversationResponse } from '@/src/shared/services/backend/api';
import { getDoctorAvailability, getMealPlanSummary, getOrCreateConversation } from '@/src/shared/services/backend/api';

// Hooks
import {
    useChatMessages,
    useMessageActions,
    useMessageSending,
    useVoiceRecording,
} from '@/src/hooks/chat';
import { chatSocketService } from '@/src/shared/services/chat/socketService';

// Components
import {
    AttachmentMenu,
    ChatHeader,
    MessageActions,
    MessageInput,
    MessageList,
    VoiceRecorder,
} from '@/src/features/chat';

// ============================================================================
// Component
// ============================================================================

export default function ChatScreen() {
    // Redux state
    const dispatch = useAppDispatch();
    const doctor = useAppSelector(selectCurrentDoctor);
    const connectionStatus = useAppSelector(selectConnectionStatus);
    const token = useAppSelector(selectToken);
    const isFocused = useIsFocused();

    // Reset unread count when screen is focused
    useEffect(() => {
        if (isFocused) {
            dispatch(resetUnreadCount());
        }
    }, [isFocused, dispatch]);

    // Typing helpers (socket is managed in tabs _layout)
    const startTyping = useCallback(() => chatSocketService.startTyping(), []);
    const stopTyping = useCallback(() => chatSocketService.stopTyping(), []);

    const {
        messages,
        isLoading,
        isLoadingMore,
        hasMoreMessages,
        isTyping,
        refreshMessages,
        loadMoreMessages,
    } = useChatMessages();

    const {
        isSending,
        sendTextMessage,
        sendVoiceMessage,
        pickAndSendImage,
        pickAndSendDocument,
        takeAndSendPhoto,
    } = useMessageSending();

    const {
        recordingState,
        duration,
        meteringValues,
        startRecording,
        pauseRecording,
        resumeRecording,
        stopRecording,
        cancelRecording,
        isRecording,
        isPaused,
    } = useVoiceRecording();

    const {
        selectedMessage,
        replyingTo,
        editingMessage,
        isActionSheetVisible,
        showActionSheet,
        hideActionSheet,
        handleAction,
        clearReply,
        cancelEditing,
        submitEdit,
        getAvailableActions,
    } = useMessageActions();

    // Local state
    const [messageText, setMessageText] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [isAttachmentMenuVisible, setIsAttachmentMenuVisible] = useState(false);

    // Voice recording visibility
    const isVoiceRecording = recordingState !== 'idle';

    useEffect(() => {
        let isMounted = true;

        const loadDoctor = async () => {
            if (!token) return;

            try {
                const summaryResponse = await getMealPlanSummary(token);
                const summaryDoctor = summaryResponse?.data?.doctor;

                if (!summaryDoctor?.id) return;

                let conversationData: ChatConversationResponse['data'] | undefined;
                try {
                    const conversationResponse = await getOrCreateConversation(summaryDoctor.id, token);
                    conversationData = conversationResponse?.data;

                    // Set active conversation for socket and messages
                    if (conversationData?.id && isMounted) {
                        dispatch(setActiveConversation(conversationData.id));
                    }
                } catch (error) {
                    console.warn('[Chat] Failed to load conversation data:', error);
                }

                const resolvedName = summaryDoctor.nameAr
                    || summaryDoctor.name
                    || conversationData?.name
                    || 'الطبيب';
                const cleanedName = resolvedName.replace(/^د\.?\s*/i, '').trim();
                const nameParts = cleanedName.split(' ').filter(Boolean);

                if (!isMounted) return;

                dispatch(setCurrentDoctor({
                    id: summaryDoctor.id,
                    firstName: nameParts[0] || cleanedName || 'الطبيب',
                    lastName: nameParts.slice(1).join(' '),
                    fullName: resolvedName,
                    avatarUrl: summaryDoctor.avatarUrl || conversationData?.avatar || undefined,
                    specialization: undefined,
                    isOnline: false,
                }));
            } catch (error) {
                console.error('[Chat] Failed to load doctor data:', error);
            }
        };

        loadDoctor();

        return () => {
            isMounted = false;
        };
    }, [dispatch, token]);

    useEffect(() => {
        let isMounted = true;
        let intervalId: ReturnType<typeof setInterval> | null = null;

        const loadAvailability = async () => {
            if (!doctor?.id || !token) return;

            try {
                const response = await getDoctorAvailability(doctor.id, token);
                if (!response.success || !response.data || !isMounted) return;

                dispatch(setDoctorAvailabilityStatus({
                    doctorId: response.data.doctorId,
                    isOnline: response.data.isOnline,
                    isSocketOnline: response.data.isSocketOnline,
                    isScheduleAvailable: response.data.isScheduleAvailable,
                    timezone: response.data.timezone,
                    dayKey: response.data.dayKey ?? null,
                    minutes: response.data.minutes ?? null,
                    lastSeen: response.data.lastSeen ?? undefined,
                }));
            } catch (error) {
                console.warn('[Chat] Failed to load doctor availability:', error);
            }
        };

        loadAvailability();
        intervalId = setInterval(loadAvailability, 60000);

        return () => {
            isMounted = false;
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [dispatch, doctor?.id, token]);

    // ========================================================================
    // Handlers
    // ========================================================================

    /**
     * Handle send message
     */
    const handleSend = useCallback(async () => {
        if (editingMessage) {
            submitEdit(messageText);
            setMessageText('');
            return;
        }

        if (messageText.trim()) {
            await sendTextMessage(messageText, replyingTo?.id);
            setMessageText('');
            clearReply();
        }
    }, [messageText, editingMessage, submitEdit, sendTextMessage, replyingTo, clearReply]);

    /**
     * Handle voice recording
     */
    const handleVoicePress = useCallback(async () => {
        await startRecording();
    }, [startRecording]);

    /**
     * Handle voice send
     */
    const handleVoiceSend = useCallback(async () => {
        const result = await stopRecording();
        if (result) {
            await sendVoiceMessage(result.uri, result.duration, result.meteringValues);
        }
    }, [stopRecording, sendVoiceMessage]);

    /**
     * Handle attachment press
     */
    const handleAttachmentPress = useCallback(async () => {
        setIsAttachmentMenuVisible(true);
    }, []);

    /**
     * Handle attachment selection
     */
    const handleAttachmentSelect = useCallback(async (type: 'camera' | 'gallery' | 'document') => {
        // Close modal first
        setIsAttachmentMenuVisible(false);

        // Then handle the selection
        switch (type) {
            case 'camera':
                await takeAndSendPhoto();
                break;
            case 'gallery':
                await pickAndSendImage();
                break;
            case 'document':
                await pickAndSendDocument();
                break;
        }
    }, [takeAndSendPhoto, pickAndSendImage, pickAndSendDocument]);

    /**
     * Handle refresh
     */
    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await refreshMessages();
        setRefreshing(false);
    }, [refreshMessages]);

    /**
     * Handle message text change with edit mode
     */
    const handleTextChange = useCallback((text: string) => {
        setMessageText(text);
        // Send typing indicator
        if (text.length > 0) {
            startTyping();
        } else {
            stopTyping();
        }
    }, [startTyping, stopTyping]);

    /**
     * Handle cancel edit
     */
    const handleCancelEdit = useCallback(() => {
        cancelEditing();
        setMessageText('');
    }, [cancelEditing]);

    /**
     * Handle cancel reply
     */
    const handleCancelReply = useCallback(() => {
        clearReply();
    }, [clearReply]);

    // ========================================================================
    // Render
    // ========================================================================

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right']}>
            <KeyboardAvoidingView
                style={styles.keyboardAvoid}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={0}
            >
                {/* Header */}
                <ChatHeader
                    doctor={doctor}
                    connectionStatus={connectionStatus}
                    isTyping={isTyping}
                />

                {/* Message List */}
                <View style={styles.messageListContainer}>
                    <MessageList
                        messages={messages}
                        onMessageLongPress={showActionSheet}
                        onLoadMore={loadMoreMessages}
                        onRefresh={handleRefresh}
                        isLoading={isLoading}
                        isLoadingMore={isLoadingMore}
                        isRefreshing={refreshing}
                        hasMoreMessages={hasMoreMessages}
                        isTyping={isTyping}
                    />
                </View>

                {/* Voice Recorder (replaces input when recording) */}
                {isVoiceRecording ? (
                    <VoiceRecorder
                        isVisible={isVoiceRecording}
                        isRecording={isRecording}
                        isPaused={isPaused}
                        duration={duration}
                        meteringValues={meteringValues}
                        onSend={handleVoiceSend}
                        onCancel={cancelRecording}
                        onPause={pauseRecording}
                        onResume={resumeRecording}
                        isUploading={isSending}
                    />
                ) : (
                    <MessageInput
                        value={messageText}
                        onChangeText={handleTextChange}
                        onSend={handleSend}
                        onVoicePress={handleVoicePress}
                        onAttachmentPress={handleAttachmentPress}
                        isDisabled={false}
                        isSending={isSending}
                        replyingTo={replyingTo ? {
                            id: replyingTo.id,
                            content: replyingTo.content,
                            senderName: replyingTo.senderId === 'doctor_1' ? 'الدكتور' : 'أنت',
                        } : null}
                        onCancelReply={handleCancelReply}
                        editingMessage={editingMessage ? {
                            id: editingMessage.id,
                            content: editingMessage.content,
                        } : null}
                        onCancelEdit={handleCancelEdit}
                    />
                )}

                {/* Message Actions Sheet */}
                <MessageActions
                    isVisible={isActionSheetVisible}
                    message={selectedMessage}
                    onClose={hideActionSheet}
                    onAction={handleAction}
                    availableActions={selectedMessage ? getAvailableActions(selectedMessage) : []}
                />

                {/* Attachment Menu */}
                <AttachmentMenu
                    isVisible={isAttachmentMenuVisible}
                    onClose={() => setIsAttachmentMenuVisible(false)}
                    onSelect={handleAttachmentSelect}
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgSecondary,
    },
    keyboardAvoid: {
        flex: 1,
    },
    messageListContainer: {
        flex: 1,
    },
});
