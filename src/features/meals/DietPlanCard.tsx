/**
 * DietPlanCard Component
 * @description Enhanced plan card with glassmorphism and progress ring
 */

import React, { memo, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { Pressable } from 'react-native';

import { colors, gradients, shadows } from '@/src/shared/core/constants/Theme';
import { horizontalScale, verticalScale, ScaleFontSize } from '@/src/shared/core/utils/scaling';
import { DietPlanCardProps } from '@/src/shared/types/meals';
import AnimatedProgressRing from '@/src/shared/components/shared/AnimatedProgressRing';

/**
 * DietPlanCard - Enhanced with glassmorphism and progress ring
 */
function DietPlanCard({
    plan,
    isLoading,
    mealCount,
    completionProgress,
}: DietPlanCardProps) {
    const safeProgress = useMemo(() => {
        if (typeof completionProgress !== 'number' || Number.isNaN(completionProgress)) {
            return 0;
        }
        return Math.min(Math.max(completionProgress, 0), 1);
    }, [completionProgress]);

    const safeMealCount = useMemo(() => {
        if (typeof mealCount !== 'number' || Number.isNaN(mealCount)) {
            return 0;
        }
        return Math.max(0, Math.round(mealCount));
    }, [mealCount]);

    // Animation values
    const scale = useSharedValue(1);
    const rotation = useSharedValue(0);

    // Success animation when progress reaches 100%
    useEffect(() => {
        if (safeProgress === 1) {
            // Wiggle animation
            rotation.value = withSequence(
                withTiming(15, { duration: 100 }),
                withTiming(-15, { duration: 100 }),
                withTiming(10, { duration: 100 }),
                withTiming(-10, { duration: 100 }),
                withTiming(0, { duration: 100 })
            );
            // Pulse animation
            scale.value = withSequence(
                withSpring(1.15, { damping: 10 }),
                withSpring(1, { damping: 10 })
            );
        }
    }, [safeProgress]);

    const animatedContainerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const animatedEmojiStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }));

    if (isLoading || !plan) {
        return (
            <View style={styles.container}>
                <View style={[styles.card, styles.skeletonCard]}>
                    <View style={styles.skeletonEmoji} />
                    <View style={styles.skeletonContent}>
                        <View style={styles.skeletonTitle} />
                        <View style={styles.skeletonTags} />
                    </View>
                </View>
            </View>
        );
    }

    return (
        <Animated.View
            entering={FadeInUp.delay(100).springify().damping(18)}
            style={styles.container}
        >
            <View style={styles.card}>
                {/* Gradient accent */}
                <LinearGradient
                    colors={gradients.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.accentBar}
                />

                <View style={styles.cardContent}>
                    {/* Left: Progress Ring + Emoji */}
                    <Pressable
                        onPressIn={() => { scale.value = withSpring(0.92); }}
                        onPressOut={() => { scale.value = withSpring(1); }}
                        style={styles.leftSectionWrapper}
                    >
                        <Animated.View style={[styles.leftSection, animatedContainerStyle]}>
                            <AnimatedProgressRing
                                progress={safeProgress}
                                size={horizontalScale(72)}
                                strokeWidth={4}
                            >
                                <Animated.Text style={[styles.emoji, animatedEmojiStyle]}>
                                    {plan.emoji || '🍽️'}
                                </Animated.Text>
                            </AnimatedProgressRing>
                            <Text style={styles.progressLabel}>
                                {Math.round(safeProgress * 100)}%
                            </Text>
                        </Animated.View>
                    </Pressable>

                    {/* Right: Plan Info */}
                    <View style={styles.planInfo}>
                        <Text style={styles.planName}>
                            {plan.nameAr || plan.name}
                        </Text>
                        {(plan.doctorNameAr || plan.doctorName) && (
                            <Text style={styles.doctorName}>
                                {plan.doctorNameAr || plan.doctorName}
                            </Text>
                        )}

                        {/* Stats Row */}
                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Ionicons
                                    name="restaurant"
                                    size={horizontalScale(14)}
                                    color={colors.primaryDark}
                                />
                                <Text style={styles.statText}>{safeMealCount} وجبات</Text>
                            </View>
                        </View>

                        {/* Tags */}
                        {(plan.tagsAr || plan.tags) && (
                            <View style={styles.tagsContainer}>
                                {(plan.tagsAr || plan.tags)?.slice(0, 3).map((tag, index) => (
                                    <View key={index} style={styles.tag}>
                                        <Text style={styles.tagText}>{tag}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                </View>

                {/* Format Badge */}
                <View style={styles.formatBadge}>
                    <Ionicons
                        name={plan.format === 'daily' ? 'calendar' : 'restaurant'}
                        size={horizontalScale(12)}
                        color={colors.primaryDark}
                    />
                    <Text style={styles.formatText}>
                        {plan.format === 'daily' ? 'خطة يومية' : 'خطة عامة'}
                    </Text>
                </View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: horizontalScale(16),
        marginTop: verticalScale(-10), // Overlap with header
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: horizontalScale(24),
        overflow: 'hidden',
        ...shadows.card,
    },
    accentBar: {
        height: verticalScale(4),
    },
    cardContent: {
        flexDirection: 'row-reverse',
        padding: horizontalScale(16),
        alignItems: 'center',
    },
    leftSectionWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    leftSection: {
        alignItems: 'center',
    },
    emoji: {
        fontSize: ScaleFontSize(28),
    },
    progressLabel: {
        fontSize: ScaleFontSize(11),
        fontWeight: '700',
        color: colors.primaryDark,
        marginTop: verticalScale(4),
    },
    planInfo: {
        flex: 1,
        marginRight: horizontalScale(16),
    },
    planName: {
        fontSize: ScaleFontSize(18),
        fontWeight: '700',
        color: colors.textPrimary,
        writingDirection: 'rtl',
        textAlign: 'right',
    },
    doctorName: {
        fontSize: ScaleFontSize(13),
        color: colors.textSecondary,
        writingDirection: 'rtl',
        textAlign: 'right',
        marginTop: verticalScale(2),
    },
    statsRow: {
        flexDirection: 'row-reverse',
        marginTop: verticalScale(12),
        gap: horizontalScale(16),
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: horizontalScale(4),
    },
    statText: {
        fontSize: ScaleFontSize(12),
        color: colors.textSecondary,
        fontWeight: '500',
    },
    tagsContainer: {
        flexDirection: 'row-reverse',
        flexWrap: 'wrap',
        marginTop: verticalScale(10),
        gap: horizontalScale(6),
    },
    tag: {
        backgroundColor: colors.bgSecondary,
        paddingHorizontal: horizontalScale(10),
        paddingVertical: verticalScale(4),
        borderRadius: horizontalScale(12),
    },
    tagText: {
        fontSize: ScaleFontSize(10),
        color: colors.textSecondary,
        fontWeight: '500',
    },
    formatBadge: {
        position: 'absolute',
        top: verticalScale(16),
        left: horizontalScale(16),
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primaryLightBg,
        paddingHorizontal: horizontalScale(8),
        paddingVertical: verticalScale(4),
        borderRadius: horizontalScale(8),
        gap: horizontalScale(4),
    },
    formatText: {
        fontSize: ScaleFontSize(10),
        color: colors.primaryDark,
        fontWeight: '600',
    },
    // Skeleton styles
    skeletonCard: {
        height: verticalScale(180),
        flexDirection: 'row',
        alignItems: 'center',
        padding: horizontalScale(16),
    },
    skeletonEmoji: {
        width: horizontalScale(72),
        height: horizontalScale(72),
        borderRadius: horizontalScale(36),
        backgroundColor: colors.bgSecondary,
    },
    skeletonContent: {
        flex: 1,
        marginLeft: horizontalScale(12),
    },
    skeletonTitle: {
        width: '60%',
        height: verticalScale(20),
        borderRadius: horizontalScale(4),
        backgroundColor: colors.bgSecondary,
        marginBottom: verticalScale(8),
    },
    skeletonTags: {
        width: '80%',
        height: verticalScale(16),
        borderRadius: horizontalScale(4),
        backgroundColor: colors.bgSecondary,
    },
});

export default memo(DietPlanCard);
