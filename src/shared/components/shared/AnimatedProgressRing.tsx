/**
 * AnimatedProgressRing Component
 * @description Circular progress indicator with smooth animations
 */

import React, { memo, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
    useAnimatedProps,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

import { colors, gradients } from '@/src/shared/core/constants/Theme';
import { ScaleFontSize } from '@/src/shared/core/utils/scaling';
import { springConfigs } from '@/src/shared/utils/animations/presets';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface AnimatedProgressRingProps {
    /** Progress value from 0 to 1 */
    progress: number;
    /** Ring diameter */
    size?: number;
    /** Stroke width */
    strokeWidth?: number;
    /** Show percentage in center */
    showPercentage?: boolean;
    /** Custom center content */
    children?: React.ReactNode;
    /** Gradient colors for the progress arc */
    gradientColors?: readonly [string, string];
    /** Background track color */
    trackColor?: string;
}

function AnimatedProgressRing({
    progress,
    size = 60,
    strokeWidth = 4,
    showPercentage = false,
    children,
    gradientColors = gradients.primary,
    trackColor = colors.bgSecondary,
}: AnimatedProgressRingProps) {
    const animatedProgress = useSharedValue(0);

    // Calculate dimensions
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const center = size / 2;

    // Animate progress changes
    useEffect(() => {
        animatedProgress.value = withSpring(
            Math.min(Math.max(progress, 0), 1),
            springConfigs.smooth
        );
    }, [progress, animatedProgress]);

    // Animated stroke dash offset
    const animatedProps = useAnimatedProps(() => {
        const strokeDashoffset = circumference * (1 - animatedProgress.value);
        return {
            strokeDashoffset,
        };
    });

    const percentage = Math.round(progress * 100);

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <Svg width={size} height={size} style={styles.svg}>
                <Defs>
                    <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <Stop offset="0%" stopColor={gradientColors[0]} />
                        <Stop offset="100%" stopColor={gradientColors[1]} />
                    </LinearGradient>
                </Defs>

                {/* Background track */}
                <Circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke={trackColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                />

                {/* Progress arc */}
                <AnimatedCircle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke="url(#progressGradient)"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    animatedProps={animatedProps}
                    transform={`rotate(-90, ${center}, ${center})`}
                />
            </Svg>

            {/* Center content */}
            <View style={styles.centerContent}>
                {children ? (
                    children
                ) : showPercentage ? (
                    <Text style={styles.percentageText}>{percentage}%</Text>
                ) : null}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
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
    percentageText: {
        fontSize: ScaleFontSize(12),
        fontWeight: '700',
        color: colors.textPrimary,
    },
});

export default memo(AnimatedProgressRing);
