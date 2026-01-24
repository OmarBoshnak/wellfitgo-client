/**
 * RadialProgress Component
 * @description Circular progress indicator with animation
 */

import React, { memo, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
    useAnimatedProps,
    useSharedValue,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { colors } from '@/src/shared/core/constants/Theme';
import { horizontalScale, ScaleFontSize } from '@/src/shared/core/utils/scaling';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface RadialProgressProps {
    /** Progress value 0-100 */
    progress: number;
    /** Size of the component */
    size?: number;
    /** Stroke width */
    strokeWidth?: number;
    /** Progress color */
    progressColor?: string;
    /** Background circle color */
    backgroundColor?: string;
    /** Center content */
    children?: React.ReactNode;
    /** Show percentage text */
    showPercentage?: boolean;
    /** Animation duration in ms */
    animationDuration?: number;
    /** Accessibility label */
    accessibilityLabel?: string;
}

function RadialProgress({
    progress,
    size = 120,
    strokeWidth = 10,
    progressColor = colors.primaryDark,
    backgroundColor = colors.bgSecondary,
    children,
    showPercentage = false,
    animationDuration = 800,
    accessibilityLabel,
}: RadialProgressProps) {
    const animatedProgress = useSharedValue(0);

    // Calculate circle properties
    const scaledSize = horizontalScale(size);
    const scaledStrokeWidth = horizontalScale(strokeWidth);
    const radius = (scaledSize - scaledStrokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const center = scaledSize / 2;

    // Animate progress on change
    useEffect(() => {
        animatedProgress.value = withTiming(Math.min(Math.max(progress, 0), 100), {
            duration: animationDuration,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
    }, [progress, animatedProgress, animationDuration]);

    // Animated stroke dash offset
    const animatedProps = useAnimatedProps(() => {
        const strokeDashoffset =
            circumference - (circumference * animatedProgress.value) / 100;
        return {
            strokeDashoffset,
        };
    });

    const label = accessibilityLabel || `${Math.round(progress)}% complete`;

    return (
        <View
            style={[styles.container, { width: scaledSize, height: scaledSize }]}
            accessibilityRole="progressbar"
            accessibilityLabel={label}
            accessibilityValue={{ min: 0, max: 100, now: progress }}
        >
            <Svg
                width={scaledSize}
                height={scaledSize}
                style={styles.svg}
            >
                {/* Background circle */}
                <Circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke={backgroundColor}
                    strokeWidth={scaledStrokeWidth}
                    fill="transparent"
                />
                {/* Progress circle */}
                <AnimatedCircle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke={progressColor}
                    strokeWidth={scaledStrokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    animatedProps={animatedProps}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${center} ${center})`}
                />
            </Svg>

            {/* Center content */}
            <View style={styles.centerContent}>
                {children || (
                    showPercentage && (
                        <Text style={styles.percentageText}>
                            {Math.round(progress)}%
                        </Text>
                    )
                )}
            </View>
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
    percentageText: {
        fontSize: ScaleFontSize(24),
        fontWeight: '700',
        color: colors.textPrimary,
    },
});

export default memo(RadialProgress);
