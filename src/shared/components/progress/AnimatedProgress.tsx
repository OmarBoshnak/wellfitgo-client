/**
 * AnimatedProgress Component
 * @description Wrapper for smooth animated progress transitions
 */

import React, { memo, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    withSequence,
    withDelay,
    Easing,
    FadeIn,
    SlideInRight,
} from 'react-native-reanimated';

import { colors } from '@/src/shared/core/constants/Theme';
import { verticalScale } from '@/src/shared/core/utils/scaling';

interface AnimatedProgressProps {
    /** Child components to animate */
    children: React.ReactNode;
    /** Animation delay in ms */
    delay?: number;
    /** Animation duration in ms */
    duration?: number;
    /** Animation style: 'fade' | 'slide' | 'scale' | 'bounce' */
    animation?: 'fade' | 'slide' | 'scale' | 'bounce';
    /** Whether component should be visible */
    visible?: boolean;
    /** RTL support for slide animation */
    isRTL?: boolean;
}

function AnimatedProgress({
    children,
    delay = 0,
    duration = 400,
    animation = 'fade',
    visible = true,
    isRTL = true,
}: AnimatedProgressProps) {
    const opacity = useSharedValue(visible ? 1 : 0);
    const scale = useSharedValue(visible ? 1 : 0.9);
    const translateX = useSharedValue(visible ? 0 : isRTL ? -20 : 20);

    useEffect(() => {
        if (visible) {
            // Animate in
            switch (animation) {
                case 'fade':
                    opacity.value = withDelay(
                        delay,
                        withTiming(1, { duration, easing: Easing.out(Easing.ease) })
                    );
                    break;
                case 'slide':
                    opacity.value = withDelay(delay, withTiming(1, { duration: duration / 2 }));
                    translateX.value = withDelay(
                        delay,
                        withSpring(0, { damping: 15, stiffness: 100 })
                    );
                    break;
                case 'scale':
                    opacity.value = withDelay(delay, withTiming(1, { duration: duration / 2 }));
                    scale.value = withDelay(
                        delay,
                        withSpring(1, { damping: 12, stiffness: 120 })
                    );
                    break;
                case 'bounce':
                    opacity.value = withDelay(delay, withTiming(1, { duration: duration / 2 }));
                    scale.value = withDelay(
                        delay,
                        withSequence(
                            withSpring(1.05, { damping: 8 }),
                            withSpring(1, { damping: 12 })
                        )
                    );
                    break;
            }
        } else {
            // Animate out
            opacity.value = withTiming(0, { duration: duration / 2 });
            scale.value = withTiming(0.9, { duration: duration / 2 });
            translateX.value = withTiming(isRTL ? -20 : 20, { duration: duration / 2 });
        }
    }, [visible, animation, delay, duration, isRTL, opacity, scale, translateX]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
            transform: [
                { scale: scale.value },
                { translateX: translateX.value },
            ],
        };
    });

    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            {children}
        </Animated.View>
    );
}

/**
 * Pre-configured animated container for staggered list items
 */
export function AnimatedListItem({
    children,
    index = 0,
    baseDelay = 50,
}: {
    children: React.ReactNode;
    index?: number;
    baseDelay?: number;
}) {
    return (
        <Animated.View
            entering={FadeIn.delay(index * baseDelay).duration(300)}
            style={styles.listItem}
        >
            {children}
        </Animated.View>
    );
}

/**
 * Animated section with slide-in effect
 */
export function AnimatedSection({
    children,
    delay = 0,
    isRTL = true,
}: {
    children: React.ReactNode;
    delay?: number;
    isRTL?: boolean;
}) {
    const SlideDirection = isRTL ? SlideInRight : SlideInRight;

    return (
        <Animated.View
            entering={SlideDirection.delay(delay).duration(400).springify()}
            style={styles.section}
        >
            {children}
        </Animated.View>
    );
}

/**
 * Pulse animation for drawing attention
 */
export function PulseContainer({
    children,
    active = false,
}: {
    children: React.ReactNode;
    active?: boolean;
}) {
    const scale = useSharedValue(1);

    useEffect(() => {
        if (active) {
            scale.value = withSequence(
                withTiming(1.03, { duration: 300 }),
                withTiming(1, { duration: 300 })
            );
        }
    }, [active, scale]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
    container: {
        // Container styles
    },
    listItem: {
        marginBottom: verticalScale(8),
    },
    section: {
        marginBottom: verticalScale(16),
    },
});

export default memo(AnimatedProgress);
