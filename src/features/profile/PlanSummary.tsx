/**
 * PlanSummary Component
 * @description Coach and plan information card
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { colors, shadows } from '@/src/shared/core/constants/Theme';
import { horizontalScale, verticalScale, ScaleFontSize } from '@/src/shared/core/utils/scaling';
import { profileTranslations, isRTL } from '@/src/shared/core/constants/translation';
import { CoachPlan } from '@/src/shared/types/profile';
import { RadialProgress } from '@/src/shared/components/progress';

interface PlanSummaryProps {
    /** Current plan */
    plan: CoachPlan | null;
    /** Message coach handler */
    onMessageCoach: () => void;
    /** View plan handler */
    onViewPlan: () => void;
}

function PlanSummary({
    plan,
    onMessageCoach,
    onViewPlan,
}: PlanSummaryProps) {
    const t = profileTranslations;

    if (!plan) {
        return (
            <Animated.View
                entering={FadeInDown.delay(200).duration(400)}
                style={styles.container}
            >
                <View style={styles.emptyState}>
                    <Ionicons
                        name="calendar-outline"
                        size={horizontalScale(40)}
                        color={colors.textSecondary}
                    />
                    <Text style={styles.emptyText}>{t.noPlan}</Text>
                </View>
            </Animated.View>
        );
    }

    const planProgress = Math.round((plan.completedDays / plan.durationDays) * 100);
    const daysRemaining = plan.durationDays - plan.currentDay;

    const handleMessageCoach = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onMessageCoach();
    };

    const handleViewPlan = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onViewPlan();
    };

    // Get coach initials
    const coachInitials = plan.coach.nameAr
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2);

    return (
        <Animated.View
            entering={FadeInDown.delay(200).duration(400)}
            style={styles.container}
        >
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>{t.yourPlan}</Text>
                <Pressable
                    onPress={handleViewPlan}
                    style={styles.viewButton}
                    accessibilityRole="button"
                    accessibilityLabel={t.viewPlan}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Text style={styles.viewText}>{t.viewPlan}</Text>
                    <Ionicons
                        name={isRTL ? 'chevron-back' : 'chevron-forward'}
                        size={horizontalScale(16)}
                        color={colors.primaryDark}
                    />
                </Pressable>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {/* Left: Progress */}
                <View style={styles.progressSection}>
                    <RadialProgress
                        progress={planProgress}
                        size={80}
                        strokeWidth={8}
                        showPercentage
                    />
                </View>

                {/* Right: Plan info */}
                <View style={styles.infoSection}>
                    {/* Plan name */}
                    <Text style={styles.planName} numberOfLines={1}>
                        {isRTL ? plan.nameAr : plan.name}
                    </Text>

                    {/* Day progress */}
                    <Text style={styles.dayProgress}>
                        {t.dayOf} {plan.currentDay}/{plan.durationDays}
                    </Text>

                    {/* Days remaining */}
                    <View style={styles.daysRemaining}>
                        <Ionicons
                            name="time-outline"
                            size={horizontalScale(14)}
                            color={colors.textSecondary}
                        />
                        <Text style={styles.daysText}>
                            {daysRemaining} {t.daysRemaining}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Coach section */}
            <View style={styles.coachSection}>
                <View style={styles.coachInfo}>
                    {plan.coach.avatarUrl ? (
                        <Image
                            source={{ uri: plan.coach.avatarUrl }}
                            style={styles.coachAvatar}
                        />
                    ) : (
                        <View style={styles.coachAvatarFallback}>
                            <Text style={styles.coachInitials}>{coachInitials}</Text>
                        </View>
                    )}
                    <View style={styles.coachDetails}>
                        <Text style={styles.coachLabel}>{t.coach}</Text>
                        <Text style={styles.coachName}>
                            {isRTL ? plan.coach.nameAr : plan.coach.name}
                        </Text>
                    </View>
                </View>

                <Pressable
                    onPress={handleMessageCoach}
                    style={styles.messageButton}
                    accessibilityRole="button"
                    accessibilityLabel={t.messageCoach}
                >
                    <Ionicons
                        name="chatbubble-ellipses"
                        size={horizontalScale(18)}
                        color={colors.primaryDark}
                    />
                    <Text style={styles.messageText}>{t.messageCoach}</Text>
                </Pressable>
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
    viewButton: {
        flexDirection: isRTL ? 'row-reverse' : 'row',
        alignItems: 'center',
        gap: horizontalScale(4),
    },
    viewText: {
        fontSize: ScaleFontSize(13),
        color: colors.primaryDark,
        fontWeight: '500',
    },
    content: {
        flexDirection: isRTL ? 'row-reverse' : 'row',
        alignItems: 'center',
        marginBottom: verticalScale(16),
    },
    progressSection: {
        marginRight: isRTL ? 0 : horizontalScale(16),
        marginLeft: isRTL ? horizontalScale(16) : 0,
    },
    infoSection: {
        flex: 1,
        alignItems: isRTL ? 'flex-end' : 'flex-start',
    },
    planName: {
        fontSize: ScaleFontSize(15),
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: verticalScale(4),
        writingDirection: isRTL ? 'rtl' : 'ltr',
    },
    dayProgress: {
        fontSize: ScaleFontSize(13),
        color: colors.textSecondary,
        marginBottom: verticalScale(8),
        writingDirection: isRTL ? 'rtl' : 'ltr',
    },
    daysRemaining: {
        flexDirection: isRTL ? 'row-reverse' : 'row',
        alignItems: 'center',
        gap: horizontalScale(4),
    },
    daysText: {
        fontSize: ScaleFontSize(12),
        color: colors.textSecondary,
    },
    coachSection: {
        flexDirection: isRTL ? 'row-reverse' : 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: verticalScale(16),
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    coachInfo: {
        flexDirection: isRTL ? 'row-reverse' : 'row',
        alignItems: 'center',
        gap: horizontalScale(12),
    },
    coachAvatar: {
        width: horizontalScale(40),
        height: horizontalScale(40),
        borderRadius: horizontalScale(20),
    },
    coachAvatarFallback: {
        width: horizontalScale(40),
        height: horizontalScale(40),
        borderRadius: horizontalScale(20),
        backgroundColor: colors.primaryLightBg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    coachInitials: {
        fontSize: ScaleFontSize(14),
        fontWeight: '600',
        color: colors.primaryDark,
    },
    coachDetails: {
        alignItems: isRTL ? 'flex-end' : 'flex-start',
    },
    coachLabel: {
        fontSize: ScaleFontSize(11),
        color: colors.textSecondary,
    },
    coachName: {
        fontSize: ScaleFontSize(14),
        fontWeight: '600',
        color: colors.textPrimary,
    },
    messageButton: {
        flexDirection: isRTL ? 'row-reverse' : 'row',
        alignItems: 'center',
        gap: horizontalScale(6),
        backgroundColor: colors.primaryLightBg,
        paddingHorizontal: horizontalScale(12),
        paddingVertical: verticalScale(8),
        borderRadius: horizontalScale(8),
        minWidth: horizontalScale(44),
        minHeight: horizontalScale(44),
        justifyContent: 'center',
    },
    messageText: {
        fontSize: ScaleFontSize(12),
        fontWeight: '600',
        color: colors.primaryDark,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: verticalScale(24),
    },
    emptyText: {
        fontSize: ScaleFontSize(14),
        color: colors.textSecondary,
        marginTop: verticalScale(8),
    },
});

export default memo(PlanSummary);
