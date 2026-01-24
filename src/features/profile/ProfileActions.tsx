/**
 * ProfileActions Component
 * @description Logout and delete account actions
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { colors, shadows } from '@/src/shared/core/constants/Theme';
import { horizontalScale, verticalScale, ScaleFontSize } from '@/src/shared/core/utils/scaling';
import { profileTranslations, isRTL } from '@/src/shared/core/constants/translation';

interface ProfileActionsProps {
    /** Logout handler */
    onLogout: () => void;
    /** Delete account handler */
    onDeleteAccount: () => void;
    /** Is logging out */
    isLoggingOut?: boolean;
}

function ProfileActions({
    onLogout,
    onDeleteAccount,
    isLoggingOut = false,
}: ProfileActionsProps) {
    const t = profileTranslations;

    const handleLogout = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onLogout();
    };

    const handleDeleteAccount = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        onDeleteAccount();
    };

    return (
        <Animated.View
            entering={FadeInDown.delay(700).duration(400)}
            style={styles.container}
        >
            {/* Logout button */}
            <Pressable
                onPress={handleLogout}
                disabled={isLoggingOut}
                style={({ pressed }) => [
                    styles.logoutButton,
                    pressed && styles.buttonPressed,
                    isLoggingOut && styles.buttonDisabled,
                ]}
                accessibilityRole="button"
                accessibilityLabel={t.logout}
            >
                {isLoggingOut ? (
                    <ActivityIndicator size="small" color={colors.error} />
                ) : (
                    <Ionicons
                        name="log-out-outline"
                        size={horizontalScale(22)}
                        color={colors.error}
                    />
                )}
                <Text style={styles.logoutText}>
                    {isLoggingOut ? 'جاري تسجيل الخروج...' : t.logout}
                </Text>
            </Pressable>

            {/* Delete account button */}
            <Pressable
                onPress={handleDeleteAccount}
                disabled={isLoggingOut}
                style={({ pressed }) => [
                    styles.deleteButton,
                    pressed && styles.buttonPressed,
                    isLoggingOut && styles.buttonDisabled,
                ]}
                accessibilityRole="button"
                accessibilityLabel={t.deleteAccount}
            >
                <Ionicons
                    name="trash-outline"
                    size={horizontalScale(18)}
                    color={colors.textSecondary}
                />
                <Text style={styles.deleteText}>{t.deleteAccount}</Text>
            </Pressable>

            {/* App version */}
            <Text style={styles.versionText}>
                الإصدار 1.0.0
            </Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: horizontalScale(16),
        marginBottom: verticalScale(32),
        gap: verticalScale(12),
    },
    logoutButton: {
        flexDirection: isRTL ? 'row-reverse' : 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: horizontalScale(10),
        backgroundColor: colors.white,
        paddingVertical: verticalScale(16),
        borderRadius: horizontalScale(12),
        borderWidth: 1,
        borderColor: colors.error + '30',
        minHeight: verticalScale(56),
        ...shadows.light,
    },
    logoutText: {
        fontSize: ScaleFontSize(15),
        fontWeight: '600',
        color: colors.error,
    },
    deleteButton: {
        flexDirection: isRTL ? 'row-reverse' : 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: horizontalScale(8),
        paddingVertical: verticalScale(12),
        minHeight: verticalScale(44),
    },
    deleteText: {
        fontSize: ScaleFontSize(13),
        color: colors.textSecondary,
    },
    buttonPressed: {
        opacity: 0.7,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    versionText: {
        fontSize: ScaleFontSize(12),
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: verticalScale(8),
    },
});

export default memo(ProfileActions);
