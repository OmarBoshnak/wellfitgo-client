/**
 * SuccessActions Component
 * @description Primary CTA and secondary actions for payment success
 */

import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
    FadeInUp,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';

import { colors, gradients, shadows } from '@/src/shared/core/constants/Theme';
import {
    horizontalScale,
    verticalScale,
    ScaleFontSize,
} from '@/src/shared/core/utils/scaling';

interface SuccessActionsProps {
    /** Primary button text */
    primaryText?: string;
    /** Secondary link text */
    secondaryText?: string;
    /** Primary button press handler */
    onPrimaryPress: () => void;
    /** Secondary link press handler */
    onSecondaryPress?: () => void;
    /** Animation delay in ms */
    delay?: number;
    /** Loading state */
    isLoading?: boolean;
}

/**
 * SuccessActions - Primary CTA with gradient and secondary link
 */
function SuccessActions({
    primaryText = 'ابدأ رحلتك',
    secondaryText = 'عرض تفاصيل الاشتراك',
    onPrimaryPress,
    onSecondaryPress,
    delay = 500,
    isLoading = false,
}: SuccessActionsProps) {
    const buttonScale = useSharedValue(1);
    const arrowX = useSharedValue(0);

    const handlePressIn = useCallback(() => {
        buttonScale.value = withSpring(0.97);
        arrowX.value = withSpring(-3);
    }, [buttonScale, arrowX]);

    const handlePressOut = useCallback(() => {
        buttonScale.value = withSpring(1);
        arrowX.value = withSpring(0);
    }, [buttonScale, arrowX]);

    const handlePrimaryPress = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPrimaryPress();
    }, [onPrimaryPress]);

    const handleSecondaryPress = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onSecondaryPress?.();
    }, [onSecondaryPress]);

    // Animated styles
    const buttonStyle = useAnimatedStyle(() => ({
        transform: [{ scale: buttonScale.value }],
    }));

    const arrowStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: arrowX.value }],
    }));

    return (
        <Animated.View
            entering={FadeInUp.delay(delay).duration(600).springify()}
            style={styles.container}
        >
            {/* Primary CTA Button */}
            <Pressable
                onPress={handlePrimaryPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={isLoading}
                accessibilityRole="button"
                accessibilityLabel={primaryText}
                style={styles.buttonPressable}
            >
                <Animated.View style={[styles.buttonWrapper, buttonStyle]}>
                    <LinearGradient
                        colors={gradients.primary}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.primaryButton}
                    >
                        <Animated.View style={arrowStyle}>
                            <Ionicons
                                name="arrow-back"
                                size={horizontalScale(22)}
                                color={colors.white}
                            />
                        </Animated.View>
                        <Text style={styles.primaryButtonText}>{primaryText}</Text>
                    </LinearGradient>
                </Animated.View>
            </Pressable>

            {/* Secondary Link */}
            {onSecondaryPress && (
                <Pressable
                    onPress={handleSecondaryPress}
                    style={styles.secondaryButton}
                    accessibilityRole="link"
                    accessibilityLabel={secondaryText}
                >
                    <Text style={styles.secondaryButtonText}>{secondaryText}</Text>
                </Pressable>
            )}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: horizontalScale(20),
        paddingVertical: verticalScale(16),
        gap: verticalScale(14),
    },
    buttonPressable: {
        minHeight: horizontalScale(56),
    },
    buttonWrapper: {
        ...shadows.medium,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: verticalScale(16),
        paddingHorizontal: horizontalScale(24),
        borderRadius: horizontalScale(16),
        gap: horizontalScale(10),
    },
    primaryButtonText: {
        fontSize: ScaleFontSize(18),
        fontWeight: '700',
        color: colors.white,
        writingDirection: 'rtl',
    },
    secondaryButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: verticalScale(12),
        minHeight: horizontalScale(44),
    },
    secondaryButtonText: {
        fontSize: ScaleFontSize(15),
        fontWeight: '600',
        color: colors.primaryDark,
        writingDirection: 'rtl',
    },
});

export default memo(SuccessActions);
