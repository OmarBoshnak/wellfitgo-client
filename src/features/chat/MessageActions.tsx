/**
 * MessageActions Component
 * @description Bottom sheet with message actions (reply, edit, delete, copy)
 */

import React, { memo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Pressable,
    I18nManager,
} from 'react-native';
import Animated, {
    FadeIn,
    FadeOut,
    SlideInDown,
    SlideOutDown,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { colors, shadows } from '@/src/shared/core/constants/Theme';
import { horizontalScale, verticalScale, ScaleFontSize } from '@/src/shared/core/utils/scaling';
import type { Message, MessageAction } from '@/src/shared/types/chat';

// ============================================================================
// Types
// ============================================================================

export interface MessageActionsProps {
    isVisible: boolean;
    message: Message | null;
    onClose: () => void;
    onAction: (action: MessageAction) => void;
    availableActions: MessageAction[];
}

interface ActionItem {
    action: MessageAction;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    color?: string;
    isDestructive?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const ACTION_CONFIG: Record<MessageAction, Omit<ActionItem, 'action'>> = {
    reply: {
        label: 'رد',
        icon: 'arrow-undo-outline',
    },
    copy: {
        label: 'نسخ',
        icon: 'copy-outline',
    },
    edit: {
        label: 'تعديل',
        icon: 'pencil-outline',
    },
    delete: {
        label: 'حذف',
        icon: 'trash-outline',
        color: colors.error,
        isDestructive: true,
    },
    forward: {
        label: 'تمرير',
        icon: 'arrow-redo-outline',
    },
};

// ============================================================================
// Component
// ============================================================================

const MessageActions: React.FC<MessageActionsProps> = memo(({
    isVisible,
    message,
    onClose,
    onAction,
    availableActions,
}) => {
    const isRTL = I18nManager.isRTL;

    /**
     * Handle action press
     */
    const handleActionPress = useCallback((action: MessageAction) => {
        Haptics.selectionAsync();
        onAction(action);
    }, [onAction]);

    /**
     * Render action button
     */
    const renderAction = (action: MessageAction, index: number) => {
        const config = ACTION_CONFIG[action];
        const isLast = index === availableActions.length - 1;

        return (
            <TouchableOpacity
                key={action}
                style={[
                    styles.actionButton,
                    !isLast && styles.actionButtonBorder,
                ]}
                onPress={() => handleActionPress(action)}
                accessibilityLabel={config.label}
                accessibilityRole="button"
            >
                <Ionicons
                    name={config.icon}
                    size={22}
                    color={config.color || colors.textPrimary}
                />
                <Text
                    style={[
                        styles.actionLabel,
                        config.isDestructive && styles.destructiveLabel,
                    ]}
                >
                    {config.label}
                </Text>
            </TouchableOpacity>
        );
    };

    if (!isVisible || !message) return null;

    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            {/* Backdrop */}
            <Animated.View
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(150)}
                style={styles.backdrop}
            >
                <Pressable style={styles.backdropPress} onPress={onClose} />
            </Animated.View>

            {/* Action Sheet */}
            <Animated.View
                entering={SlideInDown.springify().damping(18)}
                exiting={SlideOutDown.duration(150)}
                style={styles.sheet}
            >
                {/* Message Preview */}
                <View style={styles.messagePreview}>
                    {message.messageType === 'text' && (
                        <Text style={styles.previewText} numberOfLines={2}>
                            {message.content}
                        </Text>
                    )}
                    {message.messageType === 'image' && (
                        <View style={styles.previewMedia}>
                            <Ionicons name="image" size={18} color={colors.textSecondary} />
                            <Text style={styles.previewMediaText}>صورة</Text>
                        </View>
                    )}
                    {message.messageType === 'voice' && (
                        <View style={styles.previewMedia}>
                            <Ionicons name="mic" size={18} color={colors.textSecondary} />
                            <Text style={styles.previewMediaText}>رسالة صوتية</Text>
                        </View>
                    )}
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Actions */}
                <View style={styles.actionsContainer}>
                    {availableActions.map((action, index) => renderAction(action, index))}
                </View>

                {/* Cancel Button */}
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={onClose}
                    accessibilityLabel="إلغاء"
                    accessibilityRole="button"
                >
                    <Text style={styles.cancelLabel}>إلغاء</Text>
                </TouchableOpacity>
            </Animated.View>
        </Modal>
    );
});

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    backdropPress: {
        flex: 1,
    },
    sheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: verticalScale(34),
        ...shadows.float,
    },
    messagePreview: {
        paddingHorizontal: horizontalScale(20),
        paddingVertical: verticalScale(16),
    },
    previewText: {
        fontSize: ScaleFontSize(14),
        color: colors.textSecondary,
        lineHeight: ScaleFontSize(20),
    },
    previewMedia: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    previewMediaText: {
        fontSize: ScaleFontSize(14),
        color: colors.textSecondary,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
    },
    actionsContainer: {
        paddingTop: verticalScale(8),
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: horizontalScale(20),
        paddingVertical: verticalScale(14),
        gap: horizontalScale(14),
    },
    actionButtonBorder: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    actionLabel: {
        fontSize: ScaleFontSize(16),
        color: colors.textPrimary,
        fontWeight: '500',
    },
    destructiveLabel: {
        color: colors.error,
    },
    cancelButton: {
        marginTop: verticalScale(8),
        marginHorizontal: horizontalScale(16),
        paddingVertical: verticalScale(14),
        backgroundColor: colors.bgSecondary,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelLabel: {
        fontSize: ScaleFontSize(16),
        color: colors.textPrimary,
        fontWeight: '600',
    },
});

MessageActions.displayName = 'MessageActions';

export default MessageActions;
