/**
 * NotificationSettings Component
 * @description Notification preferences with toggle switches
 */

import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, Switch, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { colors, shadows } from '@/src/shared/core/constants/Theme';
import { horizontalScale, verticalScale, ScaleFontSize } from '@/src/shared/core/utils/scaling';
import { profileTranslations, isRTL } from '@/src/shared/core/constants/translation';
import { NotificationSettings as NotificationSettingsType, NotificationToggleKey } from '@/src/shared/types/profile';

interface NotificationSettingsProps {
    /** Current settings */
    settings: NotificationSettingsType;
    /** Toggle handler */
    onToggle: (key: NotificationToggleKey, value: boolean) => void;
}

interface ToggleRowProps {
    icon: string;
    iconColor: string;
    label: string;
    description?: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    rightExtra?: React.ReactNode;
}

function ToggleRow({
    icon,
    iconColor,
    label,
    description,
    value,
    onValueChange,
    rightExtra,
}: ToggleRowProps) {
    return (
        <View
            style={styles.toggleRow}
            accessibilityRole="switch"
            accessibilityLabel={label}
            accessibilityState={{ checked: value }}
        >
            <View style={styles.toggleLeft}>
                <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
                    <Ionicons
                        name={icon as any}
                        size={horizontalScale(18)}
                        color={iconColor}
                    />
                </View>
                <View style={styles.toggleContent}>
                    <Text style={styles.toggleLabel}>{label}</Text>
                    {description && (
                        <Text style={styles.toggleDescription}>{description}</Text>
                    )}
                </View>
            </View>
            <View style={styles.toggleRight}>
                {rightExtra}
                <Switch
                    value={value}
                    onValueChange={onValueChange}
                    trackColor={{
                        false: colors.secondary,
                        true: colors.primaryDark + '40',
                    }}
                    thumbColor={value ? colors.primaryDark : colors.gray}
                    ios_backgroundColor={colors.secondary}
                    style={{ transform: [{ scaleX: -1 }] }}
                />
            </View>
        </View>
    );
}

function NotificationSettings({
    settings,
    onToggle,
}: NotificationSettingsProps) {
    const t = profileTranslations;
    const router = useRouter();

    const handleToggle = useCallback(
        (key: NotificationToggleKey) => (value: boolean) => {
            onToggle(key, value);
        },
        [onToggle]
    );

    return (
        <Animated.View
            entering={FadeInDown.delay(500).duration(400)}
            style={styles.container}
        >
            <Text style={styles.title}>{t.notifications}</Text>

            <View style={styles.toggleList}>
                <ToggleRow
                    icon="notifications"
                    iconColor={colors.primaryDark}
                    label={t.pushNotifications}
                    value={settings.pushEnabled}
                    onValueChange={handleToggle('pushEnabled')}
                />

                <View style={styles.divider} />

                <ToggleRow
                    icon="restaurant"
                    iconColor="#F59E0B"
                    label={t.mealReminders}
                    description={isRTL ? 'فطور، غداء، عشاء' : 'Breakfast, Lunch, Dinner'}
                    value={settings.mealReminders}
                    onValueChange={handleToggle('mealReminders')}
                    rightExtra={
                        <TouchableOpacity
                            onPress={() => router.push('/meal-reminders' as never)}
                            activeOpacity={0.7}
                            style={styles.timeButton}
                        >
                            <Text style={styles.timeButtonText}>
                                {settings.mealReminderTime ?? '09:00'}
                            </Text>
                        </TouchableOpacity>
                    }
                />

                <View style={styles.divider} />

                <TouchableOpacity
                    style={styles.toggleRow}
                    onPress={() => router.push('/weekly-checkin' as never)}
                >
                    <View style={styles.toggleLeft}>
                        <View style={[styles.iconContainer, { backgroundColor: '#8B5CF620' }]}>
                            <Ionicons name="bar-chart" size={horizontalScale(18)} color="#8B5CF6" />
                        </View>
                        <Text style={styles.toggleLabel}>
                            {isRTL ? 'معاد الوزن الأسبوعي' : 'Weekly Weight Check-In'}
                        </Text>
                    </View>

                    <Ionicons
                        name={isRTL ? 'chevron-back' : 'chevron-forward'}
                        size={18}
                        color={colors.textSecondary}
                    />
                </TouchableOpacity>

                <View style={styles.divider} />

                <ToggleRow
                    icon="chatbubbles"
                    iconColor="#EC4899"
                    label={t.coachMessages}
                    description="رسائل من مدربك"
                    value={settings.coachMessages}
                    onValueChange={handleToggle('coachMessages')}
                />
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
    title: {
        fontSize: ScaleFontSize(16),
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: verticalScale(16),
        writingDirection: isRTL ? 'rtl' : 'ltr',
        textAlign: isRTL ? 'right' : 'left',
    },
    toggleList: {
        gap: verticalScale(0),
    },
    toggleRow: {
        flexDirection: isRTL ? 'row-reverse' : 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: verticalScale(12),
        minHeight: verticalScale(56),
    },
    toggleLeft: {
        flexDirection: isRTL ? 'row-reverse' : 'row',
        alignItems: 'center',
        gap: horizontalScale(12),
        flex: 1,
    },
    iconContainer: {
        width: horizontalScale(40),
        height: horizontalScale(40),
        borderRadius: horizontalScale(12),
        justifyContent: 'center',
        alignItems: 'center',
    },
    toggleContent: {
        flex: 1,
        alignItems: isRTL ? 'flex-end' : 'flex-start',
    },
    toggleLabel: {
        fontSize: ScaleFontSize(14),
        fontWeight: '600',
        color: colors.textPrimary,
        writingDirection: isRTL ? 'rtl' : 'ltr',
    },
    toggleDescription: {
        fontSize: ScaleFontSize(11),
        color: colors.textSecondary,
        marginTop: verticalScale(2),
        writingDirection: isRTL ? 'rtl' : 'ltr',
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
    },
    toggleRight: {
        flexDirection: isRTL ? 'row-reverse' : 'row',
        alignItems: 'center',
        gap: horizontalScale(8),
    },
    timeButton: {
        paddingHorizontal: horizontalScale(10),
        paddingVertical: verticalScale(6),
        borderRadius: horizontalScale(10),
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.white,
    },
    timeButtonText: {
        fontSize: ScaleFontSize(13),
        fontWeight: '700',
        color: colors.textPrimary,
    },
});

export default memo(NotificationSettings);
