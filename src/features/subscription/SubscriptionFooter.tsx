/**
 * SubscriptionFooter Component
 * @description Bottom CTA button with terms links
 */

import React, { memo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Pressable,
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
import { SubscriptionPlan } from '@/src/shared/types/subscription';

interface SubscriptionFooterProps {
    /** Callback when continue button is pressed */
    onContinue: () => void;
    /** Callback when skip is pressed */
    onSkip?: () => void;
    /** Callback when terms link is pressed */
    onTermsPress?: () => void;
    /** Callback when privacy link is pressed */
    onPrivacyPress?: () => void;
    /** Whether a purchase is in progress */
    isLoading: boolean;
    /** Whether the button is disabled (no plan selected) */
    disabled: boolean;
    /** Currently selected plan */
    selectedPlan?: SubscriptionPlan | null;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

/**
 * SubscriptionFooter - Bottom action area
 */
function SubscriptionFooter({
    onContinue,
    onSkip,
    onTermsPress,
    onPrivacyPress,
    isLoading,
    disabled,
    selectedPlan,
}: SubscriptionFooterProps) {
    const buttonScale = useSharedValue(1);

    const handlePressIn = useCallback(() => {
        if (!disabled && !isLoading) {
            buttonScale.value = withSpring(0.97);
        }
    }, [disabled, isLoading, buttonScale]);

    const handlePressOut = useCallback(() => {
        buttonScale.value = withSpring(1);
    }, [buttonScale]);

    const handleContinue = useCallback(() => {
        if (disabled || isLoading) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onContinue();
    }, [disabled, isLoading, onContinue]);

    const handleSkip = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onSkip?.();
    }, [onSkip]);

    const animatedButtonStyle = useAnimatedStyle(() => ({
        transform: [{ scale: buttonScale.value }],
    }));

    const buttonText = selectedPlan
        ? `اشترك الآن - ${selectedPlan.price} ${selectedPlan.currencyAr}`
        : 'اختر خطة للمتابعة';

    return (
        <View style={styles.container}>
            {/* Main CTA Button */}
            <AnimatedTouchable
                style={[styles.button, animatedButtonStyle]}
                activeOpacity={0.9}
                onPress={handleContinue}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled || isLoading}
                accessibilityLabel={buttonText}
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
                            <Text style={styles.buttonText}>{buttonText}</Text>
                            <Ionicons
                                name="arrow-back"
                                size={horizontalScale(20)}
                                color={colors.white}
                            />
                        </>
                    )}
                </LinearGradient>
            </AnimatedTouchable>

            {/* Skip link */}
            {onSkip && (
                <Pressable
                    onPress={handleSkip}
                    style={styles.skipButton}
                    accessibilityRole="button"
                    accessibilityLabel="تخطي"
                >
                    <Text style={styles.skipText}>تخطي الآن</Text>
                </Pressable>
            )}

            {/* Terms and Privacy */}
            <View style={styles.termsRow}>
                <Text style={styles.termsText}>
                    بالمتابعة، أنت توافق على{' '}
                </Text>
                <Pressable onPress={onTermsPress}>
                    <Text style={styles.termsLink}>الشروط والأحكام</Text>
                </Pressable>
                <Text style={styles.termsText}> و </Text>
                <Pressable onPress={onPrivacyPress}>
                    <Text style={styles.termsLink}>سياسة الخصوصية</Text>
                </Pressable>
            </View>

            {/* Secure badge */}
            <View style={styles.secureBadge}>
                <Ionicons
                    name="shield-checkmark"
                    size={horizontalScale(14)}
                    color={colors.success}
                />
                <Text style={styles.secureText}>دفع آمن ومضمون</Text>
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
    skipButton: {
        alignItems: 'center',
        paddingVertical: verticalScale(12),
        minHeight: verticalScale(44),
        justifyContent: 'center',
    },
    skipText: {
        fontSize: ScaleFontSize(14),
        fontWeight: '500',
        color: colors.textSecondary,
        writingDirection: 'rtl',
    },
    termsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: verticalScale(4),
    },
    termsText: {
        fontSize: ScaleFontSize(11),
        color: colors.textSecondary,
        writingDirection: 'rtl',
    },
    termsLink: {
        fontSize: ScaleFontSize(11),
        color: colors.primaryDark,
        fontWeight: '500',
        writingDirection: 'rtl',
    },
    secureBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: verticalScale(12),
        gap: horizontalScale(6),
    },
    secureText: {
        fontSize: ScaleFontSize(12),
        color: colors.success,
        fontWeight: '500',
        writingDirection: 'rtl',
    },
});

export default memo(SubscriptionFooter);
