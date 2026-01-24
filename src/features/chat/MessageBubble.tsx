/**
 * MessageBubble Component
 * @description Individual message bubble with RTL support
 */

import React, { memo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    I18nManager,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { colors, shadows } from '@/src/shared/core/constants/Theme';
import { horizontalScale, verticalScale, ScaleFontSize } from '@/src/shared/core/utils/scaling';
import type { Message } from '@/src/shared/types/chat';
import VoiceMessageBubble from './VoiceMessageBubble';
import ImageMessageBubble from './ImageMessageBubble';

// ============================================================================
// Types
// ============================================================================

export interface MessageBubbleProps {
    message: Message;
    isUser: boolean;
    onLongPress: (message: Message) => void;
    isRTL?: boolean;
    showAvatar?: boolean;
    onImagePress?: (imageUrl: string) => void;
    index?: number;
}

// ============================================================================
// Component
// ============================================================================

const MessageBubble: React.FC<MessageBubbleProps> = memo(({
    message,
    isUser,
    onLongPress,
    isRTL = I18nManager.isRTL,
    showAvatar = false,
    onImagePress,
    index = 0,
}) => {
    // Handle deleted messages
    if (message.isDeleted) {
        return (
            <Animated.View
                entering={FadeIn.duration(200)}
                style={[
                    styles.container,
                    isUser ? styles.userContainer : styles.doctorContainer,
                ]}
            >
                <View style={[styles.deletedBubble]}>
                    <Ionicons name="ban" size={14} color={colors.textSecondary} />
                    <Text style={styles.deletedText}>تم حذف هذه الرسالة</Text>
                </View>
            </Animated.View>
        );
    }

    // Render message content based on type
    const renderContent = () => {
        switch (message.messageType) {
            case 'voice':
                return (
                    <VoiceMessageBubble
                        message={message}
                        isUser={isUser}
                        isRTL={isRTL}
                    />
                );

            case 'image':
                return (
                    <ImageMessageBubble
                        message={message}
                        isUser={isUser}
                        isRTL={isRTL}
                        onPress={() => onImagePress?.(message.mediaUrl || '')}
                    />
                );

            default:
                return (
                    <Text
                        style={[
                            styles.messageText,
                            isUser ? styles.userText : styles.doctorText,
                        ]}
                        selectable
                    >
                        {message.content}
                    </Text>
                );
        }
    };

    /**
     * Get status icon
     */
    const getStatusIcon = () => {
        if (!isUser) return null;

        switch (message.status) {
            case 'sending':
                return <Ionicons name="time-outline" size={12} color={colors.textSecondary} />;
            case 'sent':
                return <Ionicons name="checkmark" size={12} color={colors.textSecondary} />;
            case 'delivered':
                return <Ionicons name="checkmark-done" size={12} color={colors.textSecondary} />;
            case 'read':
                return <Ionicons name="checkmark-done" size={12} color={colors.primaryDark} />;
            case 'failed':
                return <Ionicons name="alert-circle" size={12} color={colors.error} />;
            default:
                return null;
        }
    };

    return (
        <Animated.View
            entering={FadeInDown.duration(200).delay(index * 50)}
            style={[
                styles.container,
                isUser ? styles.userContainer : styles.doctorContainer,
            ]}
        >
            <TouchableOpacity
                activeOpacity={0.9}
                onLongPress={() => onLongPress(message)}
                delayLongPress={300}
                style={[
                    styles.bubble,
                    isUser ? styles.userBubble : styles.doctorBubble,
                    message.isOptimistic && styles.optimisticBubble,
                    message.messageType !== 'text' && styles.mediaBubble,
                ]}
                accessibilityLabel={
                    message.messageType === 'text'
                        ? message.content
                        : message.messageType === 'voice'
                            ? 'رسالة صوتية'
                            : 'صورة'
                }
                accessibilityRole="text"
                accessibilityHint="اضغط مطولاً لخيارات الرسالة"
            >
                {renderContent()}

                {/* Footer with time and status */}
                <View style={styles.footer}>
                    {message.isEdited && (
                        <Text style={styles.editedText}>تم التعديل</Text>
                    )}
                    <Text style={[styles.timeText, isUser && styles.userTimeText]}>
                        {formatMessageTime(message.createdAt)}
                    </Text>
                    {getStatusIcon()}
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
});

// ============================================================================
// Helpers
// ============================================================================

const formatMessageTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ar-SA', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
    container: {
        marginVertical: verticalScale(2),
        paddingHorizontal: horizontalScale(12),
    },
    userContainer: {
        alignItems: 'flex-end',
    },
    doctorContainer: {
        alignItems: 'flex-start',
    },
    bubble: {
        maxWidth: '80%',
        paddingHorizontal: horizontalScale(14),
        paddingVertical: verticalScale(10),
        borderRadius: 18,
        ...shadows.light,
    },
    userBubble: {
        backgroundColor: colors.primaryDark,
        borderBottomRightRadius: 4,
    },
    doctorBubble: {
        backgroundColor: colors.white,
        borderBottomLeftRadius: 4,
    },
    optimisticBubble: {
        opacity: 0.7,
    },
    mediaBubble: {
        paddingHorizontal: horizontalScale(6),
        paddingTop: verticalScale(6),
        overflow: 'hidden',
    },
    messageText: {
        fontSize: ScaleFontSize(15),
        lineHeight: ScaleFontSize(22),
    },
    userText: {
        color: colors.white,
    },
    doctorText: {
        color: colors.textPrimary,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: verticalScale(4),
        gap: 4,
    },
    timeText: {
        fontSize: ScaleFontSize(10),
        color: colors.textSecondary,
    },
    userTimeText: {
        color: 'rgba(255, 255, 255, 0.7)',
    },
    editedText: {
        fontSize: ScaleFontSize(9),
        color: colors.textSecondary,
        fontStyle: 'italic',
        marginRight: 4,
    },
    deletedBubble: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: horizontalScale(14),
        paddingVertical: verticalScale(8),
        backgroundColor: colors.bgSecondary,
        borderRadius: 18,
        gap: 6,
    },
    deletedText: {
        fontSize: ScaleFontSize(13),
        color: colors.textSecondary,
        fontStyle: 'italic',
    },
});

MessageBubble.displayName = 'MessageBubble';

export default MessageBubble;
