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
import type { Message, MessageType } from '@/src/shared/types/chat';
import VoiceMessageBubble from './VoiceMessageBubble';
import ImageMessageBubble from './ImageMessageBubble';
import * as Linking from 'expo-linking';

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
// ReplyPreview Component
// ============================================================================

interface ReplyPreviewProps {
    replyToId?: string;
    replyToContent?: string;
    replyToSenderId?: string;
    replyToSenderRole?: 'doctor' | 'client';
    messageType?: MessageType;
    isUser: boolean;
}

const ReplyPreview: React.FC<ReplyPreviewProps> = ({
    replyToId,
    replyToContent,
    replyToSenderId,
    replyToSenderRole,
    messageType,
    isUser,
}) => {
    if (!replyToId || !replyToContent) return null;

    const getReplySenderName = () => {
        // If role is explicitly provided, use it
        if (replyToSenderRole === 'doctor') return 'الدكتور';
        if (replyToSenderRole === 'client') return 'أنت';
        
        // Otherwise, infer from senderId
        if (replyToSenderId === 'doctor_1') return 'الدكتور';
        return 'أنت';
    };

    const getReplyPreviewText = () => {
        switch (messageType) {
            case 'image':
                return 'صورة';
            case 'voice':
                return 'رسالة صوتية';
            case 'document':
                return 'مستند';
            default:
                return replyToContent.length > 30 
                    ? replyToContent.substring(0, 30) + '...' 
                    : replyToContent;
        }
    };

    const getReplyIcon = () => {
        switch (messageType) {
            case 'image':
                return 'image';
            case 'voice':
                return 'mic';
            case 'document':
                return 'document-text';
            default:
                return 'chatbubble-text';
        }
    };

    return (
        <View style={[styles.replyPreview, isUser && styles.replyPreviewUser]}>
            <View style={styles.replyBar} />
            <View style={styles.replyContent}>
                <View style={styles.replyHeader}>
                    <Ionicons name="arrow-undo" size={12} color={colors.textSecondary} />
                    <Text style={styles.replySenderText}>{getReplySenderName()}</Text>
                </View>
                <View style={styles.replyTextContainer}>
                    <Ionicons 
                        name={getReplyIcon() as any} 
                        size={12} 
                        color={colors.textSecondary} 
                        style={styles.replyIcon}
                    />
                    <Text style={styles.replyText}>{getReplyPreviewText()}</Text>
                </View>
            </View>
        </View>
    );
};

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

            case 'document':
                return (
                    <TouchableOpacity
                        style={[
                            styles.documentContainer,
                            isUser ? styles.documentContainerUser : styles.documentContainerDoctor
                        ]}
                        onPress={() => {
                            if (message.mediaUrl) {
                                Linking.openURL(message.mediaUrl);
                            }
                        }}
                    >
                        <View style={styles.documentIcon}>
                            <Ionicons name="document-text" size={24} color={colors.primaryDark} />
                        </View>
                        <Text
                            style={[
                                styles.documentText,
                                isUser ? styles.userText : styles.doctorText,
                            ]}
                            numberOfLines={1}
                            ellipsizeMode="middle"
                        >
                            {message.content}
                        </Text>
                    </TouchableOpacity>
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
                {/* Reply Preview */}
                <ReplyPreview
                    replyToId={message.replyToId}
                    replyToContent={message.replyToContent}
                    replyToSenderId={message.replyToSenderId}
                    replyToSenderRole={undefined} // Will be inferred from replyToSenderId or default
                    messageType={message.messageType}
                    isUser={isUser}
                />
                
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
        marginVertical: verticalScale(5),
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
    documentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        minWidth: 150,
    },
    documentContainerUser: {

    },
    documentContainerDoctor: {

    },
    documentIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.bgSecondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    documentText: {
        fontSize: ScaleFontSize(14),
        flex: 1,
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
    // Reply preview styles
    replyPreview: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(6),
        paddingHorizontal: horizontalScale(8),
        paddingVertical: verticalScale(6),
        backgroundColor: colors.bgSecondary,
        borderRadius: 12,
        borderLeftWidth: 3,
        borderLeftColor: colors.primaryDark,
    },
    replyPreviewUser: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderLeftColor: 'rgba(255, 255, 255, 0.3)',
    },
    replyBar: {
        width: 3,
        height: '100%',
        backgroundColor: colors.primaryDark,
        borderRadius: 1.5,
        marginRight: horizontalScale(8),
    },
    replyContent: {
        flex: 1,
    },
    replyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 2,
    },
    replySenderText: {
        fontSize: ScaleFontSize(11),
        color: colors.textSecondary,
        fontWeight: '500',
    },
    replyTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    replyIcon: {
        marginRight: 2,
    },
    replyText: {
        fontSize: ScaleFontSize(12),
        color: colors.textSecondary,
        flex: 1,
    },
});

MessageBubble.displayName = 'MessageBubble';

export default MessageBubble;
