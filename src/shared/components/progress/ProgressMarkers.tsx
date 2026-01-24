/**
 * ProgressMarkers Component
 * @description Start/current/target weight markers for progress visualization
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { colors } from '@/src/shared/core/constants/Theme';
import { horizontalScale, verticalScale, ScaleFontSize } from '@/src/shared/core/utils/scaling';
import { profileTranslations } from '@/src/shared/core/constants/translation';

interface MarkerData {
    value: number;
    label: string;
    position: 'start' | 'current' | 'end';
}

interface ProgressMarkersProps {
    /** Start value */
    startValue: number;
    /** Current value */
    currentValue: number;
    /** Target/end value */
    targetValue: number;
    /** Unit label (e.g., 'كجم' or 'kg') */
    unit?: string;
    /** Progress percentage */
    progressPercentage: number;
    /** RTL support */
    isRTL?: boolean;
    /** Custom marker colors */
    markerColors?: {
        start: string;
        current: string;
        end: string;
    };
}

function ProgressMarkers({
    startValue,
    currentValue,
    targetValue,
    unit = 'كجم',
    progressPercentage,
    isRTL = true,
    markerColors = {
        start: colors.textSecondary,
        current: colors.primaryDark,
        end: colors.success,
    },
}: ProgressMarkersProps) {
    const t = profileTranslations;

    // Calculate current marker position (clamped between 0 and 100)
    const currentPosition = Math.min(Math.max(progressPercentage, 0), 100);

    // Markers data
    const markers: MarkerData[] = [
        { value: startValue, label: t.startWeight, position: 'start' },
        { value: currentValue, label: t.currentWeight, position: 'current' },
        { value: targetValue, label: t.targetWeight, position: 'end' },
    ];

    return (
        <View style={styles.container}>
            {/* Marker line */}
            <View style={styles.markerLine}>
                {/* Start marker */}
                <View
                    style={[
                        styles.marker,
                        {
                            backgroundColor: markerColors.start,
                            [isRTL ? 'right' : 'left']: 0,
                        },
                    ]}
                />

                {/* Current marker (positioned based on progress) */}
                <Animated.View
                    entering={FadeIn.delay(300).duration(400)}
                    style={[
                        styles.currentMarker,
                        {
                            backgroundColor: markerColors.current,
                            [isRTL ? 'right' : 'left']: `${currentPosition}%`,
                        },
                    ]}
                >
                    <View style={styles.currentIndicator} />
                </Animated.View>

                {/* End marker */}
                <View
                    style={[
                        styles.marker,
                        {
                            backgroundColor: markerColors.end,
                            [isRTL ? 'left' : 'right']: 0,
                        },
                    ]}
                />
            </View>

            {/* Labels */}
            <View style={[styles.labelsContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                {/* Start label */}
                <View style={styles.labelItem}>
                    <Text style={[styles.labelValue, { color: markerColors.start }]}>
                        {startValue} {unit}
                    </Text>
                    <Text style={styles.labelText}>{t.startWeight}</Text>
                </View>

                {/* Current label (centered) */}
                <View style={[styles.labelItem, styles.centerLabel]}>
                    <Animated.Text
                        entering={FadeIn.delay(200)}
                        style={[styles.currentLabelValue, { color: markerColors.current }]}
                    >
                        {currentValue} {unit}
                    </Animated.Text>
                    <Text style={styles.labelText}>{t.currentWeight}</Text>
                </View>

                {/* Target label */}
                <View style={styles.labelItem}>
                    <Text style={[styles.labelValue, { color: markerColors.end }]}>
                        {targetValue} {unit}
                    </Text>
                    <Text style={styles.labelText}>{t.targetWeight}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingVertical: verticalScale(8),
    },
    markerLine: {
        height: verticalScale(4),
        backgroundColor: colors.bgSecondary,
        borderRadius: horizontalScale(2),
        position: 'relative',
        marginBottom: verticalScale(12),
    },
    marker: {
        position: 'absolute',
        width: horizontalScale(12),
        height: horizontalScale(12),
        borderRadius: horizontalScale(6),
        top: -verticalScale(4),
    },
    currentMarker: {
        position: 'absolute',
        width: horizontalScale(16),
        height: horizontalScale(16),
        borderRadius: horizontalScale(8),
        top: -verticalScale(6),
        marginLeft: -horizontalScale(8), // Center on position
        shadowColor: colors.primaryDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    currentIndicator: {
        width: horizontalScale(6),
        height: horizontalScale(6),
        borderRadius: horizontalScale(3),
        backgroundColor: colors.white,
    },
    labelsContainer: {
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    labelItem: {
        alignItems: 'center',
        minWidth: horizontalScale(60),
    },
    centerLabel: {
        flex: 1,
    },
    labelValue: {
        fontSize: ScaleFontSize(14),
        fontWeight: '600',
    },
    currentLabelValue: {
        fontSize: ScaleFontSize(16),
        fontWeight: '700',
    },
    labelText: {
        fontSize: ScaleFontSize(10),
        color: colors.textSecondary,
        marginTop: verticalScale(2),
    },
});

export default memo(ProgressMarkers);
