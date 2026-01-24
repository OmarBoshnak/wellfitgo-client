/**
 * HomeLoadingSkeleton Component
 * @description Shimmer loading skeleton for home screen
 */

import React, { memo, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    interpolate,
} from 'react-native-reanimated';

import { colors } from '@/src/shared/core/constants/Theme';
import { horizontalScale, verticalScale } from '@/src/shared/core/utils/scaling';

interface SkeletonBoxProps {
    width?: number | string;
    height: number;
    borderRadius?: number;
    style?: object;
}

/**
 * Individual skeleton box with shimmer
 */
const SkeletonBox = memo(function SkeletonBox({
    width = '100%',
    height,
    borderRadius = 8,
    style,
}: SkeletonBoxProps) {
    const shimmer = useSharedValue(0);

    useEffect(() => {
        shimmer.value = withRepeat(
            withTiming(1, { duration: 1200 }),
            -1,
            false
        );
    }, [shimmer]);

    const animatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            shimmer.value,
            [0, 0.5, 1],
            [0.3, 0.5, 0.3]
        );
        return { opacity };
    });

    return (
        <Animated.View
            style={[
                styles.skeletonBox,
                {
                    width: typeof width === 'number' ? horizontalScale(width) : width,
                    height: verticalScale(height),
                    borderRadius: horizontalScale(borderRadius),
                },
                animatedStyle,
                style,
            ]}
        />
    );
});

/**
 * HomeLoadingSkeleton - Full loading skeleton for home screen
 */
function HomeLoadingSkeleton() {
    return (
        <View style={styles.container}>
            {/* Header Skeleton */}
            <View style={styles.headerSkeleton}>
                <View style={styles.headerLeft}>
                    <SkeletonBox width={120} height={16} borderRadius={4} />
                    <SkeletonBox width={180} height={24} borderRadius={4} style={{ marginTop: 8 }} />
                </View>
                <SkeletonBox width={48} height={48} borderRadius={24} />
            </View>

            {/* Weight Card Skeleton */}
            <View style={styles.cardSkeleton}>
                <View style={styles.cardHeader}>
                    <SkeletonBox width={100} height={20} borderRadius={4} />
                    <SkeletonBox width={60} height={24} borderRadius={12} />
                </View>
                <View style={styles.weightContent}>
                    <SkeletonBox width={100} height={100} borderRadius={50} />
                    <View style={styles.statsColumn}>
                        <SkeletonBox width={80} height={40} borderRadius={8} />
                        <SkeletonBox width={80} height={40} borderRadius={8} />
                        <SkeletonBox width={80} height={40} borderRadius={8} />
                    </View>
                </View>
                <SkeletonBox width="100%" height={100} borderRadius={12} style={{ marginTop: 16 }} />
                <SkeletonBox width="100%" height={44} borderRadius={12} style={{ marginTop: 16 }} />
            </View>

            {/* Meals Card Skeleton */}
            <View style={styles.cardSkeleton}>
                <View style={styles.cardHeader}>
                    <SkeletonBox width={100} height={20} borderRadius={4} />
                    <SkeletonBox width={60} height={20} borderRadius={4} />
                </View>
                <SkeletonBox width="100%" height={8} borderRadius={4} style={{ marginTop: 12 }} />
                <View style={styles.mealsList}>
                    {[1, 2, 3, 4].map((i) => (
                        <SkeletonBox
                            key={i}
                            width="100%"
                            height={60}
                            borderRadius={12}
                        />
                    ))}
                </View>
                <SkeletonBox width="100%" height={60} borderRadius={12} style={{ marginTop: 16 }} />
            </View>

            {/* Quick Actions Skeleton */}
            <View style={styles.cardSkeleton}>
                <View style={styles.cardHeader}>
                    <SkeletonBox width={44} height={44} borderRadius={22} />
                    <View style={styles.waterInfo}>
                        <SkeletonBox width={80} height={18} borderRadius={4} />
                        <SkeletonBox width={60} height={14} borderRadius={4} style={{ marginTop: 4 }} />
                    </View>
                </View>
                <SkeletonBox width="100%" height={8} borderRadius={4} style={{ marginTop: 16 }} />
                <View style={styles.waterControls}>
                    <SkeletonBox width={48} height={48} borderRadius={24} />
                    <SkeletonBox width={60} height={50} borderRadius={8} />
                    <SkeletonBox width={48} height={48} borderRadius={24} />
                </View>
            </View>

            <SkeletonBox
                width="100%"
                height={90}
                borderRadius={20}
                style={{ marginHorizontal: horizontalScale(16) }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: verticalScale(16),
    },
    skeletonBox: {
        backgroundColor: colors.bgSecondary,
    },
    headerSkeleton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: horizontalScale(20),
        marginBottom: verticalScale(16),
    },
    headerLeft: {
        alignItems: 'flex-end',
    },
    cardSkeleton: {
        backgroundColor: colors.white,
        borderRadius: horizontalScale(20),
        padding: horizontalScale(16),
        marginHorizontal: horizontalScale(16),
        marginBottom: verticalScale(16),
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    weightContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: verticalScale(16),
    },
    statsColumn: {
        flex: 1,
        alignItems: 'flex-end',
        marginRight: horizontalScale(16),
        gap: verticalScale(8),
    },
    mealsList: {
        marginTop: verticalScale(16),
        gap: verticalScale(8),
    },
    waterInfo: {
        flex: 1,
        alignItems: 'flex-end',
        marginRight: horizontalScale(12),
    },
    waterControls: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: verticalScale(16),
        gap: horizontalScale(20),
    },
});

export default memo(HomeLoadingSkeleton);
