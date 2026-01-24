/**
 * LinearProgress Component
 * @description Horizontal progress bar for weight tracking
 */

import React, { memo, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    interpolateColor,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, gradients } from '@/src/shared/core/constants/Theme';
import { horizontalScale, verticalScale, ScaleFontSize } from '@/src/shared/core/utils/scaling';

interface LinearProgressProps {
    /** Progress value 0-100 */
    progress: number;
    /** Height of the progress bar */
    height?: number;
    /** Show percentage text */
    showPercentage?: boolean;
    /** Use gradient fill */
    useGradient?: boolean;
    /** Progress color (if not using gradient) */
    progressColor?: string;
    /** Background color */
    backgroundColor?: string;
    /** Border radius */
    borderRadius?: number;
    /** Accessibility label */
    accessibilityLabel?: string;
    /** RTL support */
    isRTL?: boolean;
}

function LinearProgress({
    progress,
    height = 12,
    showPercentage = false,
    useGradient = true,
    progressColor = colors.primaryDark,
    backgroundColor = colors.bgSecondary,
    borderRadius = 6,
    accessibilityLabel,
    isRTL = true,
}: LinearProgressProps) {
    const animatedProgress = useSharedValue(0);
    const scaledHeight = verticalScale(height);
    const scaledRadius = horizontalScale(borderRadius);

    // Clamp progress to 0-100
    const clampedProgress = Math.min(Math.max(progress, 0), 100);

    // Animate progress on change
    useEffect(() => {
        animatedProgress.value = withSpring(clampedProgress, {
            damping: 15,
            stiffness: 100,
        });
    }, [clampedProgress, animatedProgress]);

    // Animated width style
    const animatedBarStyle = useAnimatedStyle(() => {
        return {
            width: `${animatedProgress.value}%`,
        };
    });

    const label = accessibilityLabel || `${Math.round(clampedProgress)}% complete`;

    return (
        <View
            accessibilityRole="progressbar"
            accessibilityLabel={label}
            accessibilityValue={{ min: 0, max: 100, now: clampedProgress }}
        >
            <View
                style={[
                    styles.container,
                    {
                        height: scaledHeight,
                        backgroundColor,
                        borderRadius: scaledRadius,
                        flexDirection: isRTL ? 'row-reverse' : 'row',
                    },
                ]}
            >
                <Animated.View
                    style={[
                        styles.progressBar,
                        {
                            borderRadius: scaledRadius,
                        },
                        animatedBarStyle,
                    ]}
                >
                    {useGradient ? (
                        <LinearGradient
                            colors={gradients.primary}
                            start={{ x: isRTL ? 1 : 0, y: 0 }}
                            end={{ x: isRTL ? 0 : 1, y: 0 }}
                            style={[styles.gradient, { borderRadius: scaledRadius }]}
                        />
                    ) : (
                        <View
                            style={[
                                styles.solidFill,
                                { backgroundColor: progressColor, borderRadius: scaledRadius },
                            ]}
                        />
                    )}
                </Animated.View>
            </View>

            {showPercentage && (
                <Text style={[styles.percentageText, { textAlign: isRTL ? 'right' : 'left' }]}>
                    {Math.round(clampedProgress)}%
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        overflow: 'hidden',
    },
    gradient: {
        flex: 1,
    },
    solidFill: {
        flex: 1,
    },
    percentageText: {
        marginTop: verticalScale(4),
        fontSize: ScaleFontSize(12),
        fontWeight: '600',
        color: colors.textSecondary,
    },
});

export default memo(LinearProgress);
