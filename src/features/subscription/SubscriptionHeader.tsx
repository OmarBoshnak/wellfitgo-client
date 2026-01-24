/**
 * SubscriptionHeader Component
 * @description Header with close button, title, and subtitle
 */

import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

import { colors } from '@/src/shared/core/constants/Theme';
import {
    horizontalScale,
    verticalScale,
    ScaleFontSize,
} from '@/src/shared/core/utils/scaling';

interface SubscriptionHeaderProps {
    /** Callback when close/back button is pressed */
    onClose?: () => void;
    /** Main title */
    title?: string;
    /** Subtitle text */
    subtitle?: string;
    /** Show close button */
    showCloseButton?: boolean;
}

/**
 * SubscriptionHeader - Premium header with close button and titles
 */
function SubscriptionHeader({
    onClose,
    title = 'اختر خطتك',
    subtitle = 'ابدأ رحلتك نحو حياة صحية أفضل',
    showCloseButton = true,
}: SubscriptionHeaderProps) {
    const closeScale = useSharedValue(1);

    const handleClosePressIn = useCallback(() => {
        closeScale.value = withSpring(0.9);
    }, [closeScale]);

    const handleClosePressOut = useCallback(() => {
        closeScale.value = withSpring(1);
    }, [closeScale]);

    const handleClose = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onClose?.();
    }, [onClose]);

    const animatedCloseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: closeScale.value }],
    }));

    return (
        <View style={styles.container}>
            {/* Top row with close button */}
            <View style={styles.topRow}>
                {showCloseButton && onClose ? (
                    <Pressable
                        onPress={handleClose}
                        onPressIn={handleClosePressIn}
                        onPressOut={handleClosePressOut}
                        accessibilityRole="button"
                        accessibilityLabel="إغلاق"
                        style={styles.closeButtonPressable}
                    >
                        <Animated.View style={[styles.closeButton, animatedCloseStyle]}>
                            <Ionicons
                                name="close"
                                size={horizontalScale(22)}
                                color={colors.textPrimary}
                            />
                        </Animated.View>
                    </Pressable>
                ) : (
                    <View style={styles.closePlaceholder} />
                )}
            </View>

            {/* Title */}
            <Text style={styles.title}>{title}</Text>

            {/* Subtitle */}
            <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: horizontalScale(20),
        paddingTop: verticalScale(8),
        paddingBottom: verticalScale(16),
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginBottom: verticalScale(16),
    },
    closeButtonPressable: {
        minWidth: horizontalScale(44),
        minHeight: horizontalScale(44),
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        width: horizontalScale(36),
        height: horizontalScale(36),
        borderRadius: horizontalScale(18),
        backgroundColor: colors.bgSecondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closePlaceholder: {
        width: horizontalScale(44),
        height: horizontalScale(44),
    },
    title: {
        fontSize: ScaleFontSize(28),
        fontWeight: '800',
        color: colors.textPrimary,
        writingDirection: 'rtl',
        textAlign: 'center',
        marginBottom: verticalScale(8),
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: ScaleFontSize(15),
        color: colors.textSecondary,
        writingDirection: 'rtl',
        textAlign: 'center',
        lineHeight: ScaleFontSize(22),
    },
});

export default memo(SubscriptionHeader);
