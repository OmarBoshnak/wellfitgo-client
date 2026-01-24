/**
 * DietPlanCard Component
 * @description Enhanced plan card with glassmorphism and progress ring
 */

import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

import { colors, gradients, shadows } from '@/src/shared/core/constants/Theme';
import { horizontalScale, verticalScale, ScaleFontSize } from '@/src/shared/core/utils/scaling';
import { DietPlanCardProps } from '@/src/shared/types/meals';
import AnimatedProgressRing from '@/src/shared/components/shared/AnimatedProgressRing';
import { hapticLight, springConfigs } from '@/src/shared/utils/animations/presets';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * DietPlanCard - Enhanced with glassmorphism and progress ring
 */
function DietPlanCard({
    plan,
    onChangeRequest,
    isLoading,
}: DietPlanCardProps) {
    const buttonScale = useSharedValue(1);

    // Calculate completion progress (mock for now)
    const completionProgress = useMemo(() => {
        // This would come from actual completion data
        return 0.65; // 65% complete
    }, []);

    const handlePressIn = () => {
        buttonScale.value = withSpring(0.95, springConfigs.stiff);
    };

    const handlePressOut = () => {
        buttonScale.value = withSpring(1, springConfigs.bouncy);
    };

    const handleChangeRequest = async () => {
        await hapticLight();
        onChangeRequest?.();
    };

    const buttonAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: buttonScale.value }],
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
                    <View style={styles.leftSection}>
                        <AnimatedProgressRing
                            progress={completionProgress}
                            size={horizontalScale(72)}
                            strokeWidth={4}
                        >
                            <Text style={styles.emoji}>{plan.emoji || '🍽️'}</Text>
                        </AnimatedProgressRing>
                        <Text style={styles.progressLabel}>
                            {Math.round(completionProgress * 100)}%
                        </Text>
                    </View>

                    {/* Right: Plan Info */}
                    <View style={styles.planInfo}>
                        <Text style={styles.planName}>
                            {plan.nameAr || plan.name}
                        </Text>
                        {plan.doctorNameAr && (
                            <Text style={styles.doctorName}>
                                {plan.doctorNameAr}
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
                                <Text style={styles.statText}>4 وجبات</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Ionicons
                                    name="flame"
                                    size={horizontalScale(14)}
                                    color={colors.warning}
                                />
                                <Text style={styles.statText}>1,800 سعرة</Text>
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

                {/* Change Request Button */}
                <AnimatedPressable
                    onPress={handleChangeRequest}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    accessibilityRole="button"
                    accessibilityLabel="طلب تغيير الخطة"
                    style={[styles.changeButton, buttonAnimatedStyle]}
                >
                    <LinearGradient
                        colors={gradients.primary}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.changeButtonGradient}
                    >
                        <Ionicons
                            name="swap-horizontal"
                            size={horizontalScale(16)}
                            color={colors.white}
                        />
                        <Text style={styles.changeButtonText}>طلب تغيير</Text>
                    </LinearGradient>
                </AnimatedPressable>

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
    changeButton: {
        marginHorizontal: horizontalScale(16),
        marginBottom: horizontalScale(16),
        borderRadius: horizontalScale(12),
        overflow: 'hidden',
    },
    changeButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: verticalScale(12),
        gap: horizontalScale(8),
    },
    changeButtonText: {
        fontSize: ScaleFontSize(14),
        fontWeight: '600',
        color: colors.white,
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
