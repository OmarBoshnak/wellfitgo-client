/**
 * ProgressIndicator Component
 * @description Displays form progress with animated bar and step indicator
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

import { colors } from '@/src/shared/core/constants/Theme';
import {
    horizontalScale,
    verticalScale,
    ScaleFontSize,
} from '@/src/shared/core/utils/scaling';

interface ProgressIndicatorProps {
    /** Current step number (1-indexed) */
    currentStep: number;
    /** Total number of steps */
    totalSteps: number;
    /** Progress percentage (0-100) */
    progress: number;
    /** Accessibility label */
    accessibilityLabel?: string;
}

/**
 * ProgressIndicator - Shows form completion progress
 */
export default function ProgressIndicator({
    currentStep,
    totalSteps,
    progress,
    accessibilityLabel,
}: ProgressIndicatorProps) {
    // Animated progress bar width
    const animatedProgressStyle = useAnimatedStyle(() => {
        return {
            width: withSpring(`${progress}%` as unknown as number, {
                damping: 15,
                stiffness: 100,
            }),
        };
    }, [progress]);

    // Animated step indicator scale
    const animatedStepStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    scale: withTiming(1, { duration: 300 }),
                },
            ],
        };
    }, [currentStep]);

    return (
        <View
            style={styles.container}
            accessibilityLabel={accessibilityLabel || `الخطوة ${currentStep} من ${totalSteps}`}
            accessibilityRole="progressbar"
            accessibilityValue={{
                min: 0,
                max: 100,
                now: progress,
            }}
        >
            {/* Step indicator text */}
            <Animated.View style={[styles.stepContainer, animatedStepStyle]}>
                <Text style={styles.stepText}>
                    الخطوة {currentStep} من {totalSteps}
                </Text>
                <Text style={styles.progressText}>{progress}%</Text>
            </Animated.View>

            {/* Progress bar background */}
            <View style={[styles.progressBarBackground, { transform: [{ scaleX: -1 }] }]}>
                {/* Animated progress bar fill */}
                <Animated.View
                    style={[styles.progressBarFill, animatedProgressStyle]}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: horizontalScale(4),
        marginBottom: verticalScale(16),
    },
    stepContainer: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(8),
    },
    stepText: {
        fontSize: ScaleFontSize(14),
        fontWeight: '600',
        color: colors.textPrimary,
        writingDirection: 'rtl',
    },
    progressText: {
        fontSize: ScaleFontSize(14),
        fontWeight: '700',
        color: colors.primaryDark,
    },
    progressBarBackground: {
        width: '100%',
        height: verticalScale(8),
        backgroundColor: colors.bgSecondary,
        borderRadius: verticalScale(4),
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: colors.primaryDark,
        borderRadius: verticalScale(4),
    },
});
