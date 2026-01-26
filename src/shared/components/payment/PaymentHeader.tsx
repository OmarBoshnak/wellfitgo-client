/**
 * PaymentHeader Component
 * @description Header with back button and title
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

interface PaymentHeaderProps {
    /** Callback when back button is pressed */
    onBack: () => void;
    /** Main title */
    title?: string;
    /** Amount to pay */
    amount?: string;
}

/**
 * PaymentHeader - Header with back navigation and payment info
 */
function PaymentHeader({
    onBack,
    title = 'طريقة الدفع',
    amount,
}: PaymentHeaderProps) {
    const backScale = useSharedValue(1);

    const handleBackPressIn = useCallback(() => {
        backScale.value = withSpring(0.9);
    }, [backScale]);

    const handleBackPressOut = useCallback(() => {
        backScale.value = withSpring(1);
    }, [backScale]);

    const handleBack = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onBack();
    }, [onBack]);

    const animatedBackStyle = useAnimatedStyle(() => ({
        transform: [{ scale: backScale.value }],
    }));

    return (
        <View style={styles.container}>
            <View style={styles.topRow}>
                {/* Spacer for alignment */}
                <View style={styles.spacer} />

                {/* Title */}
                <Text style={styles.title}>{title}</Text>

                {/* Back button */}
                <Pressable
                    onPress={handleBack}
                    onPressIn={handleBackPressIn}
                    onPressOut={handleBackPressOut}
                    accessibilityRole="button"
                    accessibilityLabel="رجوع"
                    style={styles.backButtonPressable}
                >
                    <Animated.View style={[styles.backButton, animatedBackStyle]}>
                        <Ionicons
                            name="arrow-forward"
                            size={horizontalScale(22)}
                            color={colors.textPrimary}
                        />
                    </Animated.View>
                </Pressable>

            </View>

            {/* Amount display */}
            {amount && (
                <View style={styles.amountContainer}>
                    <Text style={styles.amountLabel}>المبلغ المستحق</Text>
                    <Text style={styles.amount}>{amount} ج.م</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: horizontalScale(20),
        paddingTop: verticalScale(8),
        paddingBottom: verticalScale(16),
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButtonPressable: {
        minWidth: horizontalScale(44),
        minHeight: horizontalScale(44),
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButton: {
        width: horizontalScale(36),
        height: horizontalScale(36),
        borderRadius: horizontalScale(18),
        backgroundColor: colors.bgSecondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: ScaleFontSize(18),
        fontWeight: '700',
        color: colors.textPrimary,
        writingDirection: 'rtl',
    },
    spacer: {
        width: horizontalScale(44),
    },
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: verticalScale(16),
        padding: horizontalScale(14),
        backgroundColor: colors.primaryLightBg,
        borderRadius: horizontalScale(12),
    },
    amountLabel: {
        fontSize: ScaleFontSize(14),
        color: colors.textSecondary,
        writingDirection: 'rtl',
    },
    amount: {
        fontSize: ScaleFontSize(20),
        fontWeight: '800',
        color: colors.primaryDark,
    },
});

export default memo(PaymentHeader);
