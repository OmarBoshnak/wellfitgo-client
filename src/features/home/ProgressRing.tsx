/**
 * ProgressRing Component
 * @description Reusable animated circular progress indicator
 */

import React, { memo, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withTiming,
    Easing,
} from 'react-native-reanimated';

import { colors, gradients } from '@/src/shared/core/constants/Theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
    /** Progress value 0-100 */
    progress: number;
    /** Size of the ring */
    size: number;
    /** Stroke width */
    strokeWidth: number;
    /** Primary color or gradient */
    color?: string;
    /** Background ring color */
    backgroundColor?: string;
    /** Use gradient fill */
    useGradient?: boolean;
    /** Children to render in center */
    children?: React.ReactNode;
}

/**
 * ProgressRing - Animated circular progress indicator
 */
function ProgressRing({
    progress,
    size,
    strokeWidth,
    color = colors.primaryDark,
    backgroundColor = colors.bgSecondary,
    useGradient = true,
    children,
}: ProgressRingProps) {
    const animatedProgress = useSharedValue(0);

    // Compute circle properties
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const center = size / 2;

    useEffect(() => {
        animatedProgress.value = withTiming(progress, {
            duration: 800,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
    }, [progress, animatedProgress]);

    const animatedProps = useAnimatedProps(() => {
        const strokeDashoffset = circumference * (1 - animatedProgress.value / 100);
        return {
            strokeDashoffset,
        };
    });

    return (
        <View
            style={[styles.container, { width: size, height: size }]}
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: 100, now: progress }}
            accessibilityLabel={`التقدم ${Math.round(progress)} بالمئة`}
        >
            <Svg width={size} height={size} style={styles.svg}>
                <Defs>
                    <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <Stop offset="0%" stopColor={gradients.primary[0]} />
                        <Stop offset="100%" stopColor={gradients.primary[1]} />
                    </LinearGradient>
                </Defs>

                {/* Background Circle */}
                <Circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke={backgroundColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                />

                {/* Progress Circle */}
                <AnimatedCircle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke={useGradient ? 'url(#progressGradient)' : color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    animatedProps={animatedProps}
                    transform={`rotate(-90 ${center} ${center})`}
                />
            </Svg>

            {/* Center Content */}
            {children && (
                <View style={styles.centerContent}>
                    {children}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    svg: {
        position: 'absolute',
    },
    centerContent: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default memo(ProgressRing);
