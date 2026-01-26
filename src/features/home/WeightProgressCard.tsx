/**
 * WeightProgressCard Component
 * @description Card displaying weight progress with ring and chart
 */

import React, { memo, useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    FadeInDown,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

import { colors, gradients, shadows } from '@/src/shared/core/constants/Theme';
import { horizontalScale, verticalScale, ScaleFontSize } from '@/src/shared/core/utils/scaling';
import { WeightProgress } from '@/src/shared/types/home';
import ProgressRing from './ProgressRing';
import WeightChart from './WeightChart';
import WeightCheckin from './WeightCheckin';

interface WeightProgressCardProps {
    /** Weight progress data */
    progress: WeightProgress | null;
    /** View details handler */
    onViewDetails: () => void;
    /** Loading state */
    isLoading?: boolean;
}

/**
 * WeightProgressCard - Main weight tracking card
 */
function WeightProgressCard({
    progress,
    onViewDetails,
    isLoading = false,
}: WeightProgressCardProps) {
    const [showWeightCheckin, setShowWeightCheckin] = useState(false);
    const buttonScale = useSharedValue(1);

    const handlePressIn = useCallback(() => {
        buttonScale.value = withSpring(0.97);
    }, [buttonScale]);

    const handlePressOut = useCallback(() => {
        buttonScale.value = withSpring(1);
    }, [buttonScale]);

    const handlePress = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onViewDetails();
    }, [onViewDetails]);

    const handleWeightCheckinPress = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setShowWeightCheckin(true);
    }, []);

    const handleWeightCheckinClose = useCallback(() => {
        setShowWeightCheckin(false);
    }, []);

    const handleWeightCheckinComplete = useCallback(() => {
        setShowWeightCheckin(false);
    }, []);

    const animatedButtonStyle = useAnimatedStyle(() => ({
        transform: [{ scale: buttonScale.value }],
    }));

    // Trend indicator
    const getTrendIcon = () => {
        if (!progress) return 'remove-outline';
        switch (progress.trend) {
            case 'down': return 'trending-down';
            case 'up': return 'trending-up';
            default: return 'remove-outline';
        }
    };

    const getTrendColor = () => {
        if (!progress) return colors.textSecondary;
        switch (progress.trend) {
            case 'down': return colors.success;
            case 'up': return colors.error;
            default: return colors.textSecondary;
        }
    };

    if (isLoading || !progress) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <View style={styles.loadingPlaceholder} />
            </View>
        );
    }

    return (
        <Animated.View
            entering={FadeInDown.delay(100).duration(400)}
            style={styles.container}
        >
            <Pressable
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                accessibilityRole="button"
                accessibilityLabel={`تقدم الوزن، الوزن الحالي ${progress.currentWeight} كيلوجرام`}
            >
                <Animated.View style={[styles.card, animatedButtonStyle]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>تقدم الوزن</Text>
                        <View style={styles.trendBadge}>
                            <Ionicons
                                name={getTrendIcon() as any}
                                size={horizontalScale(16)}
                                color={getTrendColor()}
                            />
                            <Text style={[styles.trendText, { color: getTrendColor() }]}>
                                {progress.trend === 'down' ? 'نزول' : progress.trend === 'up' ? 'صعود' : 'ثابت'}
                            </Text>
                        </View>
                    </View>

                    {/* Content */}
                    <View style={styles.content}>
                        {/* Progress Ring */}
                        <View style={styles.ringContainer}>
                            <ProgressRing
                                progress={progress.progressPercentage}
                                size={horizontalScale(100)}
                                strokeWidth={horizontalScale(10)}
                            >
                                <Text style={styles.progressPercent}>
                                    {progress.progressPercentage}%
                                </Text>
                                <Text style={styles.progressLabel}>مكتمل</Text>
                            </ProgressRing>
                        </View>

                        {/* Stats */}
                        <View style={styles.statsContainer}>
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>الوزن الحالي</Text>
                                <Text style={styles.statValue}>
                                    {progress.currentWeight.toFixed(1)}
                                    <Text style={styles.statUnit}> كجم</Text>
                                </Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>الهدف</Text>
                                <Text style={styles.statValue}>
                                    {progress.targetWeight.toFixed(1)}
                                    <Text style={styles.statUnit}> كجم</Text>
                                </Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>المتبقي</Text>
                                <Text style={[styles.statValue, { color: colors.primaryDark }]}>
                                    {progress.remainingToGoal.toFixed(1)}
                                    <Text style={styles.statUnit}> كجم</Text>
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Chart */}
                    <View style={styles.chartContainer}>
                        <Text style={styles.chartTitle}>الأسبوع الماضي</Text>
                        <WeightChart
                            data={progress.weeklyData}
                            height={100}
                            showLabels={true}
                            showDots={true}
                        />
                    </View>

                    {/* CTA Button */}
                    <Pressable
                        onPress={handleWeightCheckinPress}
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                        accessibilityRole="button"
                        accessibilityLabel="تسجيل وزن جديد"
                    >
                        <Animated.View style={[styles.ctaButton, animatedButtonStyle]}>
                            <LinearGradient
                                colors={gradients.primary}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.ctaButtonGradient}
                            >
                                <Text style={styles.ctaText}>تسجيل وزن جديد</Text>
                                <Ionicons
                                    name="add-circle-outline"
                                    size={horizontalScale(20)}
                                    color={colors.white}
                                />
                            </LinearGradient>
                        </Animated.View>
                    </Pressable>
                </Animated.View>
            </Pressable>
            
            {/* WeightCheckin Modal */}
            <WeightCheckin
                visible={showWeightCheckin}
                onClose={handleWeightCheckinClose}
                onComplete={handleWeightCheckinComplete}
                isRTL={true}
            />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: horizontalScale(16),
        marginBottom: verticalScale(16),
    },
    loadingContainer: {
        height: verticalScale(350),
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: colors.bgSecondary,
        borderRadius: horizontalScale(20),
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: horizontalScale(20),
        padding: horizontalScale(16),
        ...shadows.light,
    },
    header: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(16),
    },
    title: {
        fontSize: ScaleFontSize(18),
        fontWeight: '700',
        color: colors.textPrimary,
        writingDirection: 'rtl',
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bgSecondary,
        paddingHorizontal: horizontalScale(10),
        paddingVertical: verticalScale(4),
        borderRadius: horizontalScale(12),
        gap: horizontalScale(4),
    },
    trendText: {
        fontSize: ScaleFontSize(12),
        fontWeight: '600',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(16),
    },
    ringContainer: {
        marginRight: horizontalScale(16),
    },
    progressPercent: {
        fontSize: ScaleFontSize(20),
        fontWeight: '800',
        color: colors.textPrimary,
    },
    progressLabel: {
        fontSize: ScaleFontSize(10),
        color: colors.textSecondary,
    },
    statsContainer: {
        flex: 1,
        gap: verticalScale(12),
    },
    statItem: {
        alignItems: 'flex-end',
    },
    statLabel: {
        fontSize: ScaleFontSize(12),
        color: colors.textSecondary,
        writingDirection: 'rtl',
        marginBottom: verticalScale(2),
    },
    statValue: {
        fontSize: ScaleFontSize(16),
        fontWeight: '700',
        color: colors.textPrimary,
    },
    statUnit: {
        fontSize: ScaleFontSize(12),
        fontWeight: '400',
        color: colors.textSecondary,
    },
    chartContainer: {
        marginBottom: verticalScale(16),
    },
    chartTitle: {
        fontSize: ScaleFontSize(14),
        fontWeight: '600',
        color: colors.textPrimary,
        writingDirection: 'rtl',
        textAlign: 'right',
        marginBottom: verticalScale(8),
    },
    ctaButton: {
        borderRadius: horizontalScale(12),
        overflow: 'hidden',
    },
    ctaButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: verticalScale(12),
        paddingHorizontal: horizontalScale(16),
        gap: horizontalScale(8),
    },
    ctaText: {
        fontSize: ScaleFontSize(14),
        fontWeight: '600',
        color: colors.white,
    },
});

export default memo(WeightProgressCard);
