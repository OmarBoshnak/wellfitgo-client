/**
 * ProfileLoadingSkeleton Component
 * @description Loading state skeleton for profile screen
 */

import React, { memo, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, gradients } from '@/src/shared/core/constants/Theme';
import { horizontalScale, verticalScale } from '@/src/shared/core/utils/scaling';

// ============================================================================
// Skeleton Bone Component
// ============================================================================

interface SkeletonBoneProps {
    width: number | string;
    height: number;
    borderRadius?: number;
    style?: object;
}

function SkeletonBone({ width, height, borderRadius = 8, style }: SkeletonBoneProps) {
    const shimmerPosition = useSharedValue(-1);

    useEffect(() => {
        shimmerPosition.value = withRepeat(
            withTiming(1, {
                duration: 1500,
                easing: Easing.linear,
            }),
            -1,
            false
        );
    }, [shimmerPosition]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: shimmerPosition.value * 200 }],
    }));

    return (
        <View
            style={[
                styles.bone,
                {
                    width: typeof width === 'number' ? horizontalScale(width) : width,
                    height: verticalScale(height),
                    borderRadius: horizontalScale(borderRadius),
                },
                style,
            ]}
        >
            <Animated.View style={[styles.shimmer, animatedStyle]}>
                <LinearGradient
                    colors={gradients.shimmer}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={StyleSheet.absoluteFill}
                />
            </Animated.View>
        </View>
    );
}

// ============================================================================
// Main Component
// ============================================================================

function ProfileLoadingSkeleton() {
    return (
        <View style={styles.container}>
            {/* Header skeleton */}
            <View style={styles.headerSkeleton}>
                <SkeletonBone width={100} height={100} borderRadius={50} />
                <SkeletonBone width={180} height={24} style={styles.mt12} />
                <SkeletonBone width={80} height={20} borderRadius={10} style={styles.mt8} />
            </View>

            {/* Weight progress skeleton */}
            <View style={styles.cardSkeleton}>
                <View style={styles.cardHeader}>
                    <SkeletonBone width={120} height={20} />
                    <SkeletonBone width={80} height={16} />
                </View>
                <SkeletonBone width="100%" height={12} borderRadius={6} style={styles.mt16} />
                <View style={styles.statsRow}>
                    <SkeletonBone width={80} height={50} borderRadius={12} />
                    <SkeletonBone width={80} height={50} borderRadius={12} />
                    <SkeletonBone width={80} height={50} borderRadius={12} />
                </View>
            </View>

            {/* Plan summary skeleton */}
            <View style={styles.cardSkeleton}>
                <View style={styles.cardHeader}>
                    <SkeletonBone width={100} height={20} />
                    <SkeletonBone width={70} height={16} />
                </View>
                <View style={styles.planContent}>
                    <SkeletonBone width={80} height={80} borderRadius={40} />
                    <View style={styles.planInfo}>
                        <SkeletonBone width={140} height={18} />
                        <SkeletonBone width={100} height={14} style={styles.mt8} />
                        <SkeletonBone width={80} height={14} style={styles.mt8} />
                    </View>
                </View>
            </View>

            {/* Personal info skeleton */}
            <View style={styles.cardSkeleton}>
                <SkeletonBone width={140} height={20} style={styles.mb16} />
                {[1, 2, 3].map((i) => (
                    <View key={i} style={styles.infoRow}>
                        <View style={styles.infoLeft}>
                            <SkeletonBone width={40} height={40} borderRadius={12} />
                            <View>
                                <SkeletonBone width={60} height={12} />
                                <SkeletonBone width={80} height={16} style={styles.mt4} />
                            </View>
                        </View>
                        <SkeletonBone width={50} height={24} borderRadius={6} />
                    </View>
                ))}
            </View>

            {/* Settings skeleton */}
            <View style={styles.cardSkeleton}>
                <SkeletonBone width={100} height={20} style={styles.mb16} />
                {[1, 2, 3].map((i) => (
                    <View key={i} style={styles.toggleRow}>
                        <View style={styles.infoLeft}>
                            <SkeletonBone width={40} height={40} borderRadius={12} />
                            <SkeletonBone width={120} height={16} />
                        </View>
                        <SkeletonBone width={50} height={30} borderRadius={15} />
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
    bone: {
        backgroundColor: colors.bgSecondary,
        overflow: 'hidden',
    },
    shimmer: {
        width: 200,
        height: '100%',
        position: 'absolute',
    },
    headerSkeleton: {
        backgroundColor: colors.primaryLightBg,
        paddingTop: verticalScale(60),
        paddingBottom: verticalScale(24),
        paddingHorizontal: horizontalScale(20),
        alignItems: 'center',
        borderBottomLeftRadius: horizontalScale(24),
        borderBottomRightRadius: horizontalScale(24),
        marginBottom: verticalScale(16),
    },
    cardSkeleton: {
        backgroundColor: colors.white,
        borderRadius: horizontalScale(16),
        padding: horizontalScale(16),
        marginHorizontal: horizontalScale(16),
        marginBottom: verticalScale(16),
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: verticalScale(16),
    },
    planContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: verticalScale(16),
        gap: horizontalScale(16),
    },
    planInfo: {
        flex: 1,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: verticalScale(12),
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: verticalScale(12),
    },
    infoLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: horizontalScale(12),
    },
    mt4: {
        marginTop: verticalScale(4),
    },
    mt8: {
        marginTop: verticalScale(8),
    },
    mt12: {
        marginTop: verticalScale(12),
    },
    mt16: {
        marginTop: verticalScale(16),
    },
    mb16: {
        marginBottom: verticalScale(16),
    },
});

export default memo(ProfileLoadingSkeleton);
