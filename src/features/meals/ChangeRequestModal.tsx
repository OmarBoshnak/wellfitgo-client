/**
 * ChangeRequestModal Component
 * @description Modal to request diet plan change
 */

import React, { memo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, ZoomIn, ZoomOut } from 'react-native-reanimated';

import { colors, shadows } from '@/src/shared/core/constants/Theme';
import { horizontalScale, verticalScale, ScaleFontSize } from '@/src/shared/core/utils/scaling';
import { ChangeRequestModalProps } from '@/src/shared/types/meals';

/**
 * ChangeRequestModal - Request to change diet plan
 */
function ChangeRequestModal({
    visible,
    planName,
    onClose,
    onSubmit,
}: ChangeRequestModalProps) {
    const [reason, setReason] = useState('');

    const handleSubmit = useCallback(() => {
        if (reason.trim()) {
            onSubmit(reason.trim());
            setReason('');
        }
    }, [reason, onSubmit]);

    const handleClose = useCallback(() => {
        setReason('');
        onClose();
    }, [onClose]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={handleClose}
        >
            <Pressable style={styles.overlay} onPress={handleClose}>
                <Animated.View
                    entering={FadeIn.duration(200)}
                    style={StyleSheet.absoluteFillObject}
                />
            </Pressable>

            <View style={styles.centeredView}>
                <Animated.View
                    entering={ZoomIn.duration(300)}
                    exiting={ZoomOut.duration(200)}
                    style={styles.modal}
                >
                    {/* Close Button */}
                    <Pressable
                        onPress={handleClose}
                        accessibilityRole="button"
                        accessibilityLabel="إغلاق"
                        style={styles.closeButton}
                    >
                        <Ionicons
                            name="close"
                            size={horizontalScale(24)}
                            color={colors.textSecondary}
                        />
                    </Pressable>

                    {/* Icon */}
                    <View style={styles.iconContainer}>
                        <Ionicons
                            name="swap-horizontal"
                            size={horizontalScale(32)}
                            color={colors.primaryDark}
                        />
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>طلب تغيير الخطة</Text>
                    <Text style={styles.subtitle}>
                        تريد تغيير "{planName}"
                    </Text>

                    {/* Reason Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>سبب التغيير</Text>
                        <TextInput
                            style={styles.input}
                            value={reason}
                            onChangeText={setReason}
                            placeholder="اكتب سبب طلب التغيير..."
                            placeholderTextColor={colors.textSecondary}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            accessibilityLabel="سبب طلب التغيير"
                        />
                    </View>

                    {/* Actions */}
                    <View style={styles.actions}>
                        <Pressable
                            onPress={handleClose}
                            accessibilityRole="button"
                            accessibilityLabel="إلغاء"
                            style={styles.cancelButton}
                        >
                            <Text style={styles.cancelButtonText}>إلغاء</Text>
                        </Pressable>
                        <Pressable
                            onPress={handleSubmit}
                            accessibilityRole="button"
                            accessibilityLabel="إرسال الطلب"
                            style={[
                                styles.submitButton,
                                !reason.trim() && styles.submitButtonDisabled,
                            ]}
                            disabled={!reason.trim()}
                        >
                            <Text style={styles.submitButtonText}>إرسال</Text>
                        </Pressable>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: horizontalScale(20),
    },
    modal: {
        backgroundColor: colors.white,
        borderRadius: horizontalScale(24),
        padding: horizontalScale(24),
        width: '100%',
        maxWidth: horizontalScale(340),
        ...shadows.medium,
    },
    closeButton: {
        position: 'absolute',
        top: horizontalScale(12),
        right: horizontalScale(12),
        width: horizontalScale(36),
        height: horizontalScale(36),
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        width: horizontalScale(64),
        height: horizontalScale(64),
        borderRadius: horizontalScale(32),
        backgroundColor: colors.primaryLightBg,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: verticalScale(16),
    },
    title: {
        fontSize: ScaleFontSize(18),
        fontWeight: '700',
        color: colors.textPrimary,
        textAlign: 'center',
        writingDirection: 'rtl',
        marginBottom: verticalScale(4),
    },
    subtitle: {
        fontSize: ScaleFontSize(14),
        color: colors.textSecondary,
        textAlign: 'center',
        writingDirection: 'rtl',
        marginBottom: verticalScale(20),
    },
    inputContainer: {
        marginBottom: verticalScale(20),
    },
    inputLabel: {
        fontSize: ScaleFontSize(13),
        fontWeight: '600',
        color: colors.textPrimary,
        writingDirection: 'rtl',
        textAlign: 'right',
        marginBottom: verticalScale(8),
    },
    input: {
        backgroundColor: colors.bgSecondary,
        borderRadius: horizontalScale(12),
        padding: horizontalScale(12),
        minHeight: verticalScale(100),
        fontSize: ScaleFontSize(14),
        color: colors.textPrimary,
        writingDirection: 'rtl',
        textAlign: 'right',
    },
    actions: {
        flexDirection: 'row',
        gap: horizontalScale(12),
    },
    cancelButton: {
        flex: 1,
        paddingVertical: verticalScale(12),
        borderRadius: horizontalScale(12),
        backgroundColor: colors.bgSecondary,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: ScaleFontSize(14),
        fontWeight: '600',
        color: colors.textSecondary,
    },
    submitButton: {
        flex: 1,
        paddingVertical: verticalScale(12),
        borderRadius: horizontalScale(12),
        backgroundColor: colors.primaryDark,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        backgroundColor: colors.gray,
    },
    submitButtonText: {
        fontSize: ScaleFontSize(14),
        fontWeight: '600',
        color: colors.white,
    },
});

export default memo(ChangeRequestModal);
