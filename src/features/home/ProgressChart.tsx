/**
 * ProgressChart Component
 * Circular progress chart showing completed vs total meals
 */

import React, { memo, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withTiming,
    Easing,
} from 'react-native-reanimated';

import { colors, gradients } from '@/src/shared/core/constants/Theme';
import { ScaleFontSize, verticalScale } from '@/src/core/utils/scaling';
import { isRTL } from '@/src/core/constants/translation';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressChartProps {
    /** Number of completed meals */
    completed: number;
    /** Total number of meals */
    total: number;
    /** Size of the chart */
    size?: number;
    /** Stroke width */
    strokeWidth?: number;
}

/**
 * ProgressChart - Shows meal completion progress as a circular chart
 */
function ProgressChart({
    completed,
    total,
    size = 140,
    strokeWidth = 12,
}: ProgressChartProps) {
    const progress = total > 0 ? (completed / total) * 100 : 0;
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

    const progressLabel = isRTL ? 'وجبة مكتملة' : 'meals done';

    return (
        <View
            style={[styles.container, { width: size, height: size }]}
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: total, now: completed }}
            accessibilityLabel={`${completed} ${isRTL ? 'من' : 'of'} ${total} ${progressLabel}`}
        >
            <Svg width={size} height={size} style={styles.svg}>
                <Defs>
                    <LinearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <Stop offset="0%" stopColor={gradients.primary[0]} />
                        <Stop offset="100%" stopColor={gradients.primary[1]} />
                    </LinearGradient>
                </Defs>

                {/* Background Circle */}
                <Circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke={colors.bgSecondary}
                    strokeWidth={strokeWidth}
                    fill="none"
                />

                {/* Progress Circle */}
                <AnimatedCircle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke="url(#chartGradient)"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    animatedProps={animatedProps}
                    transform={`rotate(-90 ${center} ${center})`}
                />
            </Svg>

            {/* Center Content */}
            <View style={styles.centerContent}>
                <Text style={styles.completedText}>{completed}</Text>
                <Text style={styles.totalText}>
                    {isRTL ? `من ${total}` : `of ${total}`}
                </Text>
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
    completedText: {
        fontSize: ScaleFontSize(28),
        fontWeight: '700',
        color: colors.textPrimary,
    },
    totalText: {
        fontSize: ScaleFontSize(13),
        fontWeight: '500',
        color: colors.textSecondary,
        marginTop: verticalScale(2),
    },
});

export default memo(ProgressChart);
