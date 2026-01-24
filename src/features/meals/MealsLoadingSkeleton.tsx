/**
 * MealsLoadingSkeleton Component
 * @description Enhanced loading skeleton with shimmer effect
 */

import React, { memo, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    Easing,
    interpolate,
} from 'react-native-reanimated';

import { colors, gradients } from '@/src/shared/core/constants/Theme';
import { horizontalScale, verticalScale } from '@/src/shared/core/utils/scaling';
import { MealsLoadingSkeletonProps } from '@/src/shared/types/meals';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SHIMMER_WIDTH = SCREEN_WIDTH * 0.6;

/**
 * ShimmerOverlay - Animated gradient sweep
 */
const ShimmerOverlay = memo(() => {
    const translateX = useSharedValue(-SHIMMER_WIDTH);

    useEffect(() => {
        translateX.value = withRepeat(
            withTiming(SCREEN_WIDTH + SHIMMER_WIDTH, {
                duration: 1500,
                easing: Easing.linear,
            }),
            -1,
            false
        );
    }, [translateX]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    return (
        <Animated.View style={[styles.shimmerContainer, animatedStyle]}>
            <LinearGradient
                colors={[
                    'transparent',
                    'rgba(255, 255, 255, 0.4)',
                    'rgba(255, 255, 255, 0.6)',
                    'rgba(255, 255, 255, 0.4)',
                    'transparent',
                ]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.shimmerGradient}
            />
        </Animated.View>
    );
});

/**
 * SkeletonBlock - Individual skeleton element with shimmer
 */
interface SkeletonBlockProps {
    width?: number | string;
    height: number;
    borderRadius?: number;
    style?: any;
}

const SkeletonBlock = memo(({ width = '100%', height, borderRadius = 8, style }: SkeletonBlockProps) => (
    <View
        style={[
            styles.skeletonBlock,
            {
                width,
                height: verticalScale(height),
                borderRadius: horizontalScale(borderRadius),
            },
            style,
        ]}
    >
        <ShimmerOverlay />
    </View>
));

/**
 * MealsLoadingSkeleton - Full screen loading skeleton with shimmer
 */
function MealsLoadingSkeleton({ format = 'general' }: MealsLoadingSkeletonProps) {
    return (
        <View style={styles.container}>
            {/* Header Skeleton */}
            <LinearGradient
                colors={gradients.header}
                style={styles.headerGradient}
            >
                <View style={styles.headerContent}>
                    <View style={styles.headerButton} />
                    <View style={styles.headerTitle} />
                    <View style={styles.headerButton} />
                </View>
            </LinearGradient>

            {/* Plan Card Skeleton */}
            <View style={styles.section}>
                <View style={styles.planCard}>
                    <View style={styles.planCardInner}>
                        <SkeletonBlock width={72} height={72} borderRadius={36} />
                        <View style={styles.planContent}>
                            <SkeletonBlock width="70%" height={20} />
                            <SkeletonBlock width="50%" height={14} style={{ marginTop: 8 }} />
                            <View style={styles.statsRow}>
                                <SkeletonBlock width={80} height={16} borderRadius={8} />
                                <SkeletonBlock width={80} height={16} borderRadius={8} />
                            </View>
                        </View>
                    </View>
                    <SkeletonBlock height={44} borderRadius={12} style={{ marginTop: 16 }} />
                </View>
            </View>

            {/* Calendar/Navigator Skeleton */}
            <View style={styles.section}>
                {format === 'general' ? (
                    <View style={styles.calendarCard}>
                        {/* Calendar Header */}
                        <View style={styles.calendarHeader}>
                            <SkeletonBlock width={40} height={40} borderRadius={20} />
                            <SkeletonBlock width={100} height={20} />
                            <SkeletonBlock width={40} height={40} borderRadius={20} />
                        </View>
                        {/* Calendar Grid */}
                        <View style={styles.calendarGrid}>
                            {[1, 2, 3, 4, 5, 6].map((row) => (
                                <View key={row} style={styles.calendarRow}>
                                    {[1, 2, 3, 4, 5, 6, 7].map((col) => (
                                        <SkeletonBlock
                                            key={col}
                                            width={36}
                                            height={36}
                                            borderRadius={18}
                                        />
                                    ))}
                                </View>
                            ))}
                        </View>
                    </View>
                ) : (
                    <View style={styles.navigatorCard}>
                        <SkeletonBlock width={48} height={48} borderRadius={24} />
                        <View style={styles.navigatorContent}>
                            <SkeletonBlock width={80} height={24} borderRadius={12} />
                            <SkeletonBlock width={60} height={14} style={{ marginTop: 4 }} />
                        </View>
                        <SkeletonBlock width={48} height={48} borderRadius={24} />
                    </View>
                )}
            </View>

            {/* Meals List Skeleton */}
            <View style={styles.section}>
                <View style={styles.mealsHeader}>
                    <SkeletonBlock width={80} height={18} />
                    <SkeletonBlock width={50} height={14} />
                </View>
                {[1, 2, 3, 4].map((i) => (
                    <View key={i} style={styles.mealCard}>
                        <SkeletonBlock width={56} height={56} borderRadius={28} />
                        <View style={styles.mealContent}>
                            <SkeletonBlock width="60%" height={16} />
                            <SkeletonBlock width="40%" height={12} style={{ marginTop: 6 }} />
                        </View>
                        <SkeletonBlock width={28} height={28} borderRadius={14} />
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgPrimary,
    },
    shimmerContainer: {
        ...StyleSheet.absoluteFillObject,
        width: SHIMMER_WIDTH,
    },
    shimmerGradient: {
        flex: 1,
    },
    skeletonBlock: {
        backgroundColor: colors.bgSecondary,
        overflow: 'hidden',
    },
    headerGradient: {
        paddingTop: verticalScale(60),
        paddingBottom: verticalScale(20),
        paddingHorizontal: horizontalScale(16),
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerButton: {
        width: horizontalScale(48),
        height: horizontalScale(48),
        borderRadius: horizontalScale(24),
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    headerTitle: {
        width: horizontalScale(100),
        height: verticalScale(24),
        borderRadius: horizontalScale(4),
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    section: {
        paddingHorizontal: horizontalScale(16),
        marginTop: verticalScale(16),
    },
    planCard: {
        backgroundColor: colors.white,
        borderRadius: horizontalScale(24),
        padding: horizontalScale(16),
        marginTop: verticalScale(-10),
    },
    planCardInner: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
    },
    planContent: {
        flex: 1,
        marginRight: horizontalScale(16),
        alignItems: 'flex-end',
    },
    statsRow: {
        flexDirection: 'row-reverse',
        marginTop: verticalScale(12),
        gap: horizontalScale(12),
    },
    calendarCard: {
        backgroundColor: colors.white,
        borderRadius: horizontalScale(24),
        padding: horizontalScale(16),
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(16),
    },
    calendarGrid: {
        gap: verticalScale(8),
    },
    calendarRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    navigatorCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.white,
        borderRadius: horizontalScale(20),
        padding: horizontalScale(14),
    },
    navigatorContent: {
        alignItems: 'center',
    },
    mealsHeader: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(12),
    },
    mealCard: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: horizontalScale(20),
        padding: horizontalScale(14),
        marginBottom: verticalScale(12),
    },
    mealContent: {
        flex: 1,
        marginRight: horizontalScale(14),
        alignItems: 'flex-end',
    },
});

export default memo(MealsLoadingSkeleton);
