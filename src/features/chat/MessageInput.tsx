/**
 * MessageInput Component
 * @description Text input with emoji, image, and voice support
 */

import React, { memo, useState, useRef, useCallback } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    I18nManager,
    Keyboard,
    Platform,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    withSpring,
    useSharedValue,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { colors, shadows } from '@/src/shared/core/constants/Theme';
import { horizontalScale, verticalScale, ScaleFontSize } from '@/src/shared/core/utils/scaling';

// ============================================================================
// Types
// ============================================================================

export interface MessageInputProps {
    value: string;
    onChangeText: (text: string) => void;
    onSend: () => void;
    onVoicePress: () => void;
    onAttachmentPress: () => void;
    onCameraPress?: () => void;
    placeholder?: string;
    isDisabled?: boolean;
    isSending?: boolean;
    replyingTo?: {
        id: string;
        content: string;
        senderName: string;
    } | null;
    onCancelReply?: () => void;
    editingMessage?: {
        id: string;
        content: string;
    } | null;
    onCancelEdit?: () => void;
}

// ============================================================================
// Component
// ============================================================================

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const MessageInput: React.FC<MessageInputProps> = memo(({
    value,
    onChangeText,
    onSend,
    onVoicePress,
    onAttachmentPress,
    onCameraPress,
    placeholder = 'اكتب رسالتك...',
    isDisabled = false,
    isSending = false,
    replyingTo = null,
    onCancelReply,
    editingMessage = null,
    onCancelEdit,
}) => {
    const inputRef = useRef<TextInput>(null);
    const [inputHeight, setInputHeight] = useState(40);
    const isRTL = I18nManager.isRTL;
    const sendButtonScale = useSharedValue(1);

    const hasText = value.trim().length > 0;
    const isEditing = editingMessage !== null;

    /**
     * Handle send press
     */
    const handleSend = useCallback(() => {
        if (hasText && !isDisabled && !isSending) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSend();
        }
    }, [hasText, isDisabled, isSending, onSend]);

    /**
     * Handle voice press
     */
    const handleVoicePress = useCallback(() => {
        if (!isDisabled) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            Keyboard.dismiss();
            onVoicePress();
        }
    }, [isDisabled, onVoicePress]);

    /**
     * Handle content size change for auto-grow
     */
    const handleContentSizeChange = useCallback((event: any) => {
        const { contentSize } = event.nativeEvent;
        const newHeight = Math.min(Math.max(40, contentSize.height), 120);
        setInputHeight(newHeight);
    }, []);

    /**
     * Send button animated style
     */
    const sendButtonStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(sendButtonScale.value) }],
    }));

    return (
        <View style={styles.container}>
            {/* Reply/Edit Preview */}
            {(replyingTo || editingMessage) && (
                <View style={styles.replyContainer}>
                    <View style={styles.replyContent}>
                        <View style={styles.replyBar} />
                        <View style={styles.replyTextContainer}>
                            <Ionicons
                                name={isEditing ? 'pencil' : 'arrow-undo'}
                                size={14}
                                color={colors.primaryDark}
                            />
                            <View style={styles.replyTexts}>
                                {!isEditing && replyingTo && (
                                    <View style={styles.replyHeader}>
                                        <Ionicons name="arrow-undo" size={12} color={colors.primaryDark} />
                                    </View>
                                )}
                                <View style={styles.replyPreview}>
                                    <Ionicons
                                        name={isEditing ? 'pencil' : 'arrow-undo'}
                                        size={12}
                                        color={colors.primaryDark}
                                        style={styles.replyIcon}
                                    />
                                    <View style={styles.replyPreviewText}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                            <Ionicons
                                                name={isEditing ? 'pencil-outline' : 'arrow-undo-outline'}
                                                size={12}
                                                color={colors.primaryDark}
                                            />
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.cancelReplyButton}
                        onPress={isEditing ? onCancelEdit : onCancelReply}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        accessibilityLabel="إلغاء"
                        accessibilityRole="button"
                    >
                        <Ionicons name="close" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            )}

            {/* Main Input Row */}
            <View style={styles.inputRow}>
                {/* Attachment Button */}
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={onAttachmentPress}
                    disabled={isDisabled}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityLabel="إرفاق صورة"
                    accessibilityRole="button"
                >
                    <Ionicons
                        name="image-outline"
                        size={24}
                        color={isDisabled ? colors.textSecondary : colors.primaryDark}
                    />
                </TouchableOpacity>

                {/* Text Input */}
                <View style={[styles.inputContainer, { minHeight: inputHeight }]}>
                    <TextInput
                        ref={inputRef}
                        style={[
                            styles.textInput,
                            { height: inputHeight, textAlign: isRTL ? 'right' : 'left' },
                        ]}
                        value={value}
                        onChangeText={onChangeText}
                        placeholder={placeholder}
                        placeholderTextColor={colors.textSecondary}
                        multiline
                        maxLength={2000}
                        editable={!isDisabled && !isSending}
                        onContentSizeChange={handleContentSizeChange}
                        returnKeyType="default"
                        blurOnSubmit={false}
                        accessibilityLabel="حقل الرسالة"
                        accessibilityHint="اكتب رسالتك هنا"
                    />
                </View>

                {/* Send or Voice Button */}
                {hasText || isEditing ? (
                    <AnimatedTouchable
                        style={[styles.sendButton, sendButtonStyle]}
                        onPress={handleSend}
                        disabled={isDisabled || isSending}
                        accessibilityLabel="إرسال الرسالة"
                        accessibilityRole="button"
                    >
                        <Ionicons
                            name={isEditing ? 'checkmark' : 'send'}
                            size={20}
                            color={colors.white}
                        />
                    </AnimatedTouchable>
                ) : (
                    <TouchableOpacity
                        style={styles.voiceButton}
                        onPress={handleVoicePress}
                        disabled={isDisabled}
                        accessibilityLabel="تسجيل رسالة صوتية"
                        accessibilityRole="button"
                    >
                        <Ionicons
                            name="mic"
                            size={24}
                            color={isDisabled ? colors.textSecondary : colors.primaryDark}
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
});

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingBottom: Platform.OS === 'ios' ? 0 : verticalScale(8),
    },
    replyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: horizontalScale(12),
        paddingVertical: verticalScale(8),
        backgroundColor: colors.bgSecondary,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    replyContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    replyBar: {
        width: 3,
        height: '100%',
        backgroundColor: colors.primaryDark,
        borderRadius: 1.5,
        marginRight: horizontalScale(8),
    },
    replyTextContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    replyTexts: {
        flex: 1,
    },
    replyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    replyPreview: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    replyIcon: {
        marginRight: 4,
    },
    replyPreviewText: {
        flex: 1,
    },
    cancelReplyButton: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: horizontalScale(8),
        paddingVertical: verticalScale(8),
        gap: horizontalScale(8),
    },
    iconButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputContainer: {
        flex: 1,
        backgroundColor: colors.bgSecondary,
        borderRadius: 20,
        paddingHorizontal: horizontalScale(16),
        justifyContent: 'center',
    },
    textInput: {
        fontSize: ScaleFontSize(15),
        color: colors.textPrimary,
        paddingVertical: Platform.OS === 'ios' ? verticalScale(10) : verticalScale(8),
        maxHeight: 120,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.primaryDark,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.medium,
    },
    voiceButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

MessageInput.displayName = 'MessageInput';

export default MessageInput;
