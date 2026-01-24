/**
 * WeightProgress Component
 * @description Weight progress visualization with markers
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { colors, shadows } from '@/src/shared/core/constants/Theme';
import { horizontalScale, verticalScale, ScaleFontSize } from '@/src/shared/core/utils/scaling';
import { profileTranslations, isRTL } from '@/src/shared/core/constants/translation';
import { WeightProgress as WeightProgressType } from '@/src/shared/types/profile';
import { LinearProgress, ProgressMarkers } from '@/src/shared/components/progress';

interface WeightProgressProps {
    /** Weight progress data */
    progress: WeightProgressType;
    /** Unit display */
    unit?: 'kg' | 'lb';
    /** View history handler */
    onViewHistory?: () => void;
}

function WeightProgress({
    progress,
    unit = 'kg',
    onViewHistory,
}: WeightProgressProps) {
    const t = profileTranslations;

    const unitLabel = unit === 'kg' ? 'كجم' : 'lb';
    const { totalLost, remainingToGoal, progressPercentage, trend } = progress;

    const getTrendIcon = () => {
        switch (trend) {
            case 'down':
                return { name: 'trending-down', color: colors.success };
            case 'up':
                return { name: 'trending-up', color: colors.error };
            default:
                return { name: 'remove', color: colors.textSecondary };
        }
    };

    const trendInfo = getTrendIcon();

    const handleViewHistory = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onViewHistory?.();
    };

    return (
        <Animated.View
            entering={FadeInDown.delay(100).duration(400)}
            style={styles.container}
        >
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>{t.weightProgress}</Text>
                {onViewHistory && (
                    <Pressable
                        onPress={handleViewHistory}
                        style={styles.historyButton}
                        accessibilityRole="button"
                        accessibilityLabel={t.viewHistory}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Text style={styles.historyText}>{t.viewHistory}</Text>
                        <Ionicons
                            name={isRTL ? 'chevron-back' : 'chevron-forward'}
                            size={horizontalScale(16)}
                            color={colors.primaryDark}
                        />
                    </Pressable>
                )}
            </View>

            {/* Progress bar */}
            <View style={styles.progressBarContainer}>
                <LinearProgress
                    progress={progressPercentage}
                    height={10}
                    useGradient
                    isRTL={isRTL}
                />
            </View>

            {/* Markers */}
            <ProgressMarkers
                startValue={progress.startWeight}
                currentValue={progress.currentWeight}
                targetValue={progress.targetWeight}
                unit={unitLabel}
                progressPercentage={progressPercentage}
                isRTL={isRTL}
            />

            {/* Stats row */}
            <View style={styles.statsRow}>
                {/* Lost */}
                <View style={styles.statItem}>
                    <View style={[styles.statIcon, { backgroundColor: colors.success + '20' }]}>
                        <Ionicons
                            name="arrow-down"
                            size={horizontalScale(14)}
                            color={colors.success}
                        />
                    </View>
                    <View style={styles.statContent}>
                        <Text style={styles.statValue}>
                            {totalLost.toFixed(1)} {unitLabel}
                        </Text>
                        <Text style={styles.statLabel}>{t.kgLost}</Text>
                    </View>
                </View>

                {/* Trend */}
                <View style={styles.statItem}>
                    <View style={[styles.statIcon, { backgroundColor: trendInfo.color + '20' }]}>
                        <Ionicons
                            name={trendInfo.name as any}
                            size={horizontalScale(14)}
                            color={trendInfo.color}
                        />
                    </View>
                    <View style={styles.statContent}>
                        <Text style={[styles.statValue, { color: trendInfo.color }]}>
                            {progressPercentage}%
                        </Text>
                        <Text style={styles.statLabel}>
                            {trend === 'down' ? 'تقدم' : trend === 'up' ? 'زيادة' : 'ثابت'}
                        </Text>
                    </View>
                </View>

                {/* Remaining */}
                <View style={styles.statItem}>
                    <View style={[styles.statIcon, { backgroundColor: colors.primaryDark + '20' }]}>
                        <Ionicons
                            name="flag"
                            size={horizontalScale(14)}
                            color={colors.primaryDark}
                        />
                    </View>
                    <View style={styles.statContent}>
                        <Text style={styles.statValue}>
                            {remainingToGoal.toFixed(1)} {unitLabel}
                        </Text>
                        <Text style={styles.statLabel}>{t.kgRemaining}</Text>
                    </View>
                </View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        borderRadius: horizontalScale(16),
        padding: horizontalScale(16),
        marginHorizontal: horizontalScale(16),
        marginBottom: verticalScale(16),
        ...shadows.light,
    },
    header: {
        flexDirection: isRTL ? 'row-reverse' : 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(16),
    },
    title: {
        fontSize: ScaleFontSize(16),
        fontWeight: '700',
        color: colors.textPrimary,
        writingDirection: isRTL ? 'rtl' : 'ltr',
    },
    historyButton: {
        flexDirection: isRTL ? 'row-reverse' : 'row',
        alignItems: 'center',
        gap: horizontalScale(4),
    },
    historyText: {
        fontSize: ScaleFontSize(13),
        color: colors.primaryDark,
        fontWeight: '500',
    },
    progressBarContainer: {
        marginBottom: verticalScale(8),
    },
    statsRow: {
        flexDirection: isRTL ? 'row-reverse' : 'row',
        justifyContent: 'space-between',
        marginTop: verticalScale(16),
        paddingTop: verticalScale(16),
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    statItem: {
        flexDirection: isRTL ? 'row-reverse' : 'row',
        alignItems: 'center',
        gap: horizontalScale(8),
    },
    statIcon: {
        width: horizontalScale(28),
        height: horizontalScale(28),
        borderRadius: horizontalScale(8),
        justifyContent: 'center',
        alignItems: 'center',
    },
    statContent: {
        alignItems: isRTL ? 'flex-end' : 'flex-start',
    },
    statValue: {
        fontSize: ScaleFontSize(14),
        fontWeight: '700',
        color: colors.textPrimary,
    },
    statLabel: {
        fontSize: ScaleFontSize(10),
        color: colors.textSecondary,
        marginTop: verticalScale(2),
    },
});

export default memo(WeightProgress);
