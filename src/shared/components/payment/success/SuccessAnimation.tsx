/**
 * SuccessAnimation Component
 * @description Animated checkmark with pulse effect for payment success
 */

import React, { memo, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    withSequence,
    withDelay,
    withRepeat,
    Easing,
    runOnJS,
} from 'react-native-reanimated';

import { colors, gradients } from '@/src/shared/core/constants/Theme';
import { horizontalScale, verticalScale } from '@/src/shared/core/utils/scaling';

interface SuccessAnimationProps {
    /** Callback when main animation completes */
    onAnimationComplete?: () => void;
    /** Size of the checkmark circle */
    size?: number;
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

/**
 * SuccessAnimation - Bouncing checkmark with pulse ring effect
 */
function SuccessAnimation({
    onAnimationComplete,
    size = 100,
}: SuccessAnimationProps) {
    // Animation values
    const checkScale = useSharedValue(0);
    const checkOpacity = useSharedValue(0);
    const pulseScale = useSharedValue(1);
    const pulseOpacity = useSharedValue(0.6);
    const iconScale = useSharedValue(0);
    const iconRotate = useSharedValue(-45);

    useEffect(() => {
        // Main circle scale with bounce
        checkScale.value = withSpring(1, {
            damping: 12,
            stiffness: 150,
            mass: 0.8,
        });

        // Opacity fade in
        checkOpacity.value = withTiming(1, { duration: 400 });

        // Pulse ring animation
        pulseScale.value = withRepeat(
            withSequence(
                withTiming(1.3, { duration: 1000, easing: Easing.out(Easing.ease) }),
                withTiming(1, { duration: 1000, easing: Easing.in(Easing.ease) })
            ),
            -1,
            false
        );

        pulseOpacity.value = withRepeat(
            withSequence(
                withTiming(0.2, { duration: 1000 }),
                withTiming(0.6, { duration: 1000 })
            ),
            -1,
            false
        );

        // Icon animation with delay
        iconScale.value = withDelay(
            300,
            withSpring(1, {
                damping: 10,
                stiffness: 180,
            })
        );

        iconRotate.value = withDelay(
            300,
            withSpring(0, {
                damping: 15,
                stiffness: 200,
            })
        );

        // Callback after main animation
        if (onAnimationComplete) {
            const timeout = setTimeout(() => {
                runOnJS(onAnimationComplete)();
            }, 800);

            return () => clearTimeout(timeout);
        }
    }, [
        checkScale,
        checkOpacity,
        pulseScale,
        pulseOpacity,
        iconScale,
        iconRotate,
        onAnimationComplete,
    ]);

    // Animated styles
    const circleStyle = useAnimatedStyle(() => ({
        transform: [{ scale: checkScale.value }],
        opacity: checkOpacity.value,
    }));

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
        opacity: pulseOpacity.value,
    }));

    const iconStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: iconScale.value },
            { rotate: `${iconRotate.value}deg` },
        ],
    }));

    const scaledSize = horizontalScale(size);

    return (
        <View style={styles.container}>
            {/* Pulse ring */}
            <Animated.View
                style={[
                    styles.pulseRing,
                    {
                        width: scaledSize * 1.4,
                        height: scaledSize * 1.4,
                        borderRadius: scaledSize * 0.7,
                    },
                    pulseStyle,
                ]}
            />

            {/* Main gradient circle */}
            <Animated.View style={[styles.circleWrapper, circleStyle]}>
                <LinearGradient
                    colors={gradients.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[
                        styles.circle,
                        {
                            width: scaledSize,
                            height: scaledSize,
                            borderRadius: scaledSize / 2,
                        },
                    ]}
                >
                    {/* Checkmark icon */}
                    <Animated.View style={iconStyle}>
                        <Ionicons
                            name="checkmark"
                            size={scaledSize * 0.5}
                            color={colors.white}
                        />
                    </Animated.View>
                </LinearGradient>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        height: horizontalScale(140),
    },
    pulseRing: {
        position: 'absolute',
        backgroundColor: colors.primaryDark,
    },
    circleWrapper: {
        shadowColor: colors.primaryDark,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
        elevation: 12,
    },
    circle: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default memo(SuccessAnimation);
