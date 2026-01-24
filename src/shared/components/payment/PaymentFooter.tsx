/**
 * PaymentFooter Component
 * @description Bottom CTA button with secure badge
 */

import React, { memo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, gradients } from '@/src/shared/core/constants/Theme';
import {
    horizontalScale,
    verticalScale,
    ScaleFontSize,
} from '@/src/shared/core/utils/scaling';

interface PaymentFooterProps {
    /** Callback when pay button is pressed */
    onPay: () => void;
    /** Whether payment is processing */
    isLoading: boolean;
    /** Whether button is disabled */
    disabled: boolean;
    /** Amount to pay */
    amount?: string;
    /** Button text */
    buttonText?: string;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

/**
 * PaymentFooter - Bottom payment action
 */
function PaymentFooter({
    onPay,
    isLoading,
    disabled,
    amount,
    buttonText = 'إتمام الدفع',
}: PaymentFooterProps) {
    const buttonScale = useSharedValue(1);

    const handlePressIn = useCallback(() => {
        if (!disabled && !isLoading) {
            buttonScale.value = withSpring(0.97);
        }
    }, [disabled, isLoading, buttonScale]);

    const handlePressOut = useCallback(() => {
        buttonScale.value = withSpring(1);
    }, [buttonScale]);

    const handlePay = useCallback(() => {
        if (disabled || isLoading) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPay();
    }, [disabled, isLoading, onPay]);

    const animatedButtonStyle = useAnimatedStyle(() => ({
        transform: [{ scale: buttonScale.value }],
    }));

    const displayText = amount ? `${buttonText} - ${amount} ج.م` : buttonText;

    return (
        <View style={styles.container}>
            {/* Pay Button */}
            <AnimatedTouchable
                style={[styles.button, animatedButtonStyle]}
                activeOpacity={0.9}
                onPress={handlePay}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled || isLoading}
                accessibilityLabel={displayText}
                accessibilityRole="button"
                accessibilityState={{ disabled: disabled || isLoading }}
            >
                <LinearGradient
                    colors={disabled ? [colors.textSecondary, colors.textSecondary] : gradients.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.buttonGradient, disabled && styles.buttonDisabled]}
                >
                    {isLoading ? (
                        <ActivityIndicator color={colors.white} size="small" />
                    ) : (
                        <>
                            <Ionicons
                                name="shield-checkmark"
                                size={horizontalScale(20)}
                                color={colors.white}
                            />
                            <Text style={styles.buttonText}>{displayText}</Text>
                        </>
                    )}
                </LinearGradient>
            </AnimatedTouchable>

            {/* Secure badges */}
            <View style={styles.secureRow}>
                <View style={styles.secureBadge}>
                    <Ionicons
                        name="lock-closed"
                        size={horizontalScale(12)}
                        color={colors.success}
                    />
                    <Text style={styles.secureText}>دفع آمن</Text>
                </View>
                <View style={styles.secureBadge}>
                    <Ionicons
                        name="shield-checkmark"
                        size={horizontalScale(12)}
                        color={colors.success}
                    />
                    <Text style={styles.secureText}>تشفير SSL</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.bgPrimary,
        paddingHorizontal: horizontalScale(20),
        paddingTop: verticalScale(16),
        paddingBottom: verticalScale(24),
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    button: {
        borderRadius: horizontalScale(14),
        overflow: 'hidden',
        shadowColor: colors.primaryDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 6,
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: verticalScale(18),
        gap: horizontalScale(10),
        minHeight: verticalScale(56),
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        fontSize: ScaleFontSize(16),
        fontWeight: '700',
        color: colors.white,
        writingDirection: 'rtl',
    },
    secureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: verticalScale(14),
        gap: horizontalScale(20),
    },
    secureBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: horizontalScale(6),
    },
    secureText: {
        fontSize: ScaleFontSize(12),
        color: colors.success,
        fontWeight: '500',
        writingDirection: 'rtl',
    },
});

export default memo(PaymentFooter);
