/**
 * SubscriptionCard Component
 * @description Subscription information and management
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { colors, shadows } from '@/src/shared/core/constants/Theme';
import { horizontalScale, verticalScale, ScaleFontSize } from '@/src/shared/core/utils/scaling';
import { profileTranslations, isRTL } from '@/src/shared/core/constants/translation';
import { Subscription } from '@/src/shared/types/profile';
import { formatDate, getSubscriptionStatusLabel, getDaysRemaining } from '@/src/shared/utils/profileData';

interface SubscriptionCardProps {
    /** Subscription data */
    subscription: Subscription | null;
    /** Manage subscription handler */
    onManage: () => void;
}

function SubscriptionCard({
    subscription,
    onManage,
}: SubscriptionCardProps) {
    const t = profileTranslations;

    const handleManage = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onManage();
    };

    if (!subscription) {
        return (
            <Animated.View
                entering={FadeInDown.delay(300).duration(400)}
                style={styles.container}
            >
                <View style={styles.emptyState}>
                    <View style={styles.emptyIcon}>
                        <Ionicons
                            name="card-outline"
                            size={horizontalScale(32)}
                            color={colors.primaryDark}
                        />
                    </View>
                    <Text style={styles.emptyTitle}>{t.subscription}</Text>
                    <Text style={styles.emptyText}>لا يوجد اشتراك حالي</Text>
                </View>
            </Animated.View>
        );
    }

    const statusInfo = getSubscriptionStatusLabel(subscription.status, isRTL);
    const nextBillingFormatted = formatDate(subscription.nextBillingDate, isRTL);
    const daysRemaining = getDaysRemaining(subscription.nextBillingDate);
    const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0;
    const planName = isRTL ? subscription.planNameAr : subscription.planName;

    return (
        <Animated.View
            entering={FadeInDown.delay(300).duration(400)}
            style={styles.container}
        >
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.title}>{t.subscription}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
                        <View style={[styles.statusDot, { backgroundColor: statusInfo.color }]} />
                        <Text style={[styles.statusText, { color: statusInfo.color }]}>
                            {statusInfo.label}
                        </Text>
                    </View>
                </View>
                <Pressable
                    onPress={handleManage}
                    style={styles.manageButton}
                    accessibilityRole="button"
                    accessibilityLabel={t.manageSub}
                >
                    <Ionicons
                        name="settings-outline"
                        size={horizontalScale(20)}
                        color={colors.textSecondary}
                    />
                </Pressable>
            </View>

            {/* Plan info */}
            <View style={styles.planInfo}>
                <View style={styles.planIcon}>
                    <Ionicons
                        name="diamond"
                        size={horizontalScale(24)}
                        color={colors.primaryDark}
                    />
                </View>
                <View style={styles.planDetails}>
                    <Text style={styles.planName}>{planName}</Text>
                    <Text style={styles.planPrice}>
                        {subscription.price} {subscription.currency}/
                        {isRTL ? 'شهريا' : 'month'}
                    </Text>
                </View>
            </View>

            {/* Next billing */}
            <View style={styles.billingInfo}>
                <View style={styles.billingRow}>
                    <Text style={styles.billingLabel}>{t.nextBilling}</Text>
                    <Text style={styles.billingValue}>{nextBillingFormatted}</Text>
                </View>
                {isExpiringSoon && (
                    <View style={styles.warningBanner}>
                        <Ionicons
                            name="warning"
                            size={horizontalScale(16)}
                            color={colors.warning}
                        />
                        <Text style={styles.warningText}>
                            ينتهي خلال {daysRemaining} أيام
                        </Text>
                    </View>
                )}
            </View>

            {/* Cancel notice */}
            {subscription.cancelAtPeriodEnd && (
                <View style={styles.cancelNotice}>
                    <Ionicons
                        name="information-circle"
                        size={horizontalScale(16)}
                        color={colors.error}
                    />
                    <Text style={styles.cancelText}>
                        سيتم إلغاء الاشتراك في {nextBillingFormatted}
                    </Text>
                </View>
            )}

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
    headerLeft: {
        flexDirection: isRTL ? 'row-reverse' : 'row',
        alignItems: 'center',
        gap: horizontalScale(10),
    },
    title: {
        fontSize: ScaleFontSize(16),
        fontWeight: '700',
        color: colors.textPrimary,
        writingDirection: isRTL ? 'rtl' : 'ltr',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: horizontalScale(8),
        paddingVertical: verticalScale(4),
        borderRadius: horizontalScale(10),
        gap: horizontalScale(4),
    },
    statusDot: {
        width: horizontalScale(6),
        height: horizontalScale(6),
        borderRadius: horizontalScale(3),
    },
    statusText: {
        fontSize: ScaleFontSize(11),
        fontWeight: '600',
    },
    manageButton: {
        width: horizontalScale(44),
        height: horizontalScale(44),
        justifyContent: 'center',
        alignItems: 'center',
    },
    planInfo: {
        flexDirection: isRTL ? 'row-reverse' : 'row',
        alignItems: 'center',
        gap: horizontalScale(12),
        padding: horizontalScale(12),
        backgroundColor: colors.primaryLightBg,
        borderRadius: horizontalScale(12),
        marginBottom: verticalScale(16),
    },
    planIcon: {
        width: horizontalScale(44),
        height: horizontalScale(44),
        borderRadius: horizontalScale(12),
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    planDetails: {
        flex: 1,
        alignItems: isRTL ? 'flex-end' : 'flex-start',
    },
    planName: {
        fontSize: ScaleFontSize(15),
        fontWeight: '700',
        color: colors.textPrimary,
        writingDirection: isRTL ? 'rtl' : 'ltr',
    },
    planPrice: {
        fontSize: ScaleFontSize(13),
        color: colors.textSecondary,
        marginTop: verticalScale(2),
    },
    billingInfo: {
        marginBottom: verticalScale(12),
    },
    billingRow: {
        flexDirection: isRTL ? 'row-reverse' : 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    billingLabel: {
        fontSize: ScaleFontSize(13),
        color: colors.textSecondary,
    },
    billingValue: {
        fontSize: ScaleFontSize(13),
        fontWeight: '600',
        color: colors.textPrimary,
    },
    warningBanner: {
        flexDirection: isRTL ? 'row-reverse' : 'row',
        alignItems: 'center',
        gap: horizontalScale(6),
        backgroundColor: colors.warning + '15',
        padding: horizontalScale(10),
        borderRadius: horizontalScale(8),
        marginTop: verticalScale(10),
    },
    warningText: {
        fontSize: ScaleFontSize(12),
        color: colors.warning,
        fontWeight: '500',
    },
    cancelNotice: {
        flexDirection: isRTL ? 'row-reverse' : 'row',
        alignItems: 'center',
        gap: horizontalScale(6),
        backgroundColor: colors.error + '10',
        padding: horizontalScale(10),
        borderRadius: horizontalScale(8),
        marginBottom: verticalScale(12),
    },
    cancelText: {
        fontSize: ScaleFontSize(12),
        color: colors.error,
        flex: 1,
        writingDirection: isRTL ? 'rtl' : 'ltr',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: verticalScale(16),
    },
    emptyIcon: {
        width: horizontalScale(60),
        height: horizontalScale(60),
        borderRadius: horizontalScale(30),
        backgroundColor: colors.primaryLightBg,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(12),
    },
    emptyTitle: {
        fontSize: ScaleFontSize(16),
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: verticalScale(4),
    },
    emptyText: {
        fontSize: ScaleFontSize(13),
        color: colors.textSecondary,
        marginBottom: verticalScale(16),
    },
});

export default memo(SubscriptionCard);
