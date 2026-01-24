/**
 * ChatScreen
 * @description Main chat screen - clean orchestrator with modular components
 */

import React, { useCallback, useState } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/src/shared/core/constants/Theme';
import { useAppSelector } from '@/src/shared/store';
import { selectCurrentDoctor, selectConnectionStatus } from '@/src/shared/store/slices/chatSlice';

// Hooks
import {
    useChatMessages,
    useMessageSending,
    useVoiceRecording,
    useMessageActions,
} from '@/src/hooks/chat';

// Components
import {
    ChatHeader,
    MessageList,
    MessageInput,
    VoiceRecorder,
    MessageActions,
} from '@/src/features/chat';

// ============================================================================
// Component
// ============================================================================

export default function ChatScreen() {
    // Redux state
    const doctor = useAppSelector(selectCurrentDoctor);
    const connectionStatus = useAppSelector(selectConnectionStatus);

    // Custom hooks
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

    // Voice recording visibility
    const isVoiceRecording = recordingState !== 'idle';

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
            await sendVoiceMessage(result.uri, result.duration);
        }
    }, [stopRecording, sendVoiceMessage]);

    /**
     * Handle attachment press
     */
    const handleAttachmentPress = useCallback(async () => {
        await pickAndSendImage();
    }, [pickAndSendImage]);

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
    }, []);

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
