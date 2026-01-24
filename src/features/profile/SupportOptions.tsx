/**
 * SupportOptions Component
 * @description Help and support contact options
 */

import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { colors, shadows } from '@/src/shared/core/constants/Theme';
import { horizontalScale, verticalScale, ScaleFontSize } from '@/src/shared/core/utils/scaling';
import { profileTranslations, isRTL } from '@/src/shared/core/constants/translation';

interface SupportOptionsProps {
    /** Help center handler */
    onHelpCenter: () => void;
    /** WhatsApp handler */
    onWhatsApp: () => void;
    /** Email handler */
    onEmail: () => void;
}

interface SupportRowProps {
    icon: string;
    iconColor: string;
    iconBgColor: string;
    label: string;
    description?: string;
    onPress: () => void;
}

function SupportRow({
    icon,
    iconColor,
    iconBgColor,
    label,
    description,
    onPress,
}: SupportRowProps) {
    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
    };

    return (
        <Pressable
            onPress={handlePress}
            style={({ pressed }) => [
                styles.supportRow,
                pressed && styles.supportRowPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={label}
        >
            <View style={styles.supportLeft}>
                <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
                    <Ionicons
                        name={icon as any}
                        size={horizontalScale(20)}
                        color={iconColor}
                    />
                </View>
                <View style={styles.supportContent}>
                    <Text style={styles.supportLabel}>{label}</Text>
                    {description && (
                        <Text style={styles.supportDescription}>{description}</Text>
                    )}
                </View>
            </View>
            <Ionicons
                name={isRTL ? 'chevron-back' : 'chevron-forward'}
                size={horizontalScale(20)}
                color={colors.textSecondary}
            />
        </Pressable>
    );
}

function SupportOptions({
    onHelpCenter,
    onWhatsApp,
    onEmail,
}: SupportOptionsProps) {
    const t = profileTranslations;

    const handleWhatsApp = useCallback(() => {
        // Opens WhatsApp with predefined number
        const phoneNumber = '+201234567890'; // Replace with actual support number
        const message = 'مرحبا، أحتاج مساعدة';
        const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

        Linking.canOpenURL(url)
            .then((supported) => {
                if (supported) {
                    Linking.openURL(url);
                } else {
                    // Fallback to web WhatsApp
                    Linking.openURL(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`);
                }
            })
            .catch(() => {
                onWhatsApp();
            });
    }, [onWhatsApp]);

    const handleEmail = useCallback(() => {
        const email = 'support@wellfitgo.com'; // Replace with actual email
        const subject = 'طلب مساعدة';
        const url = `mailto:${email}?subject=${encodeURIComponent(subject)}`;

        Linking.openURL(url).catch(() => {
            onEmail();
        });
    }, [onEmail]);

    return (
        <Animated.View
            entering={FadeInDown.delay(600).duration(400)}
            style={styles.container}
        >
            <Text style={styles.title}>{t.support}</Text>

            <View style={styles.supportList}>
                <SupportRow
                    icon="help-circle"
                    iconColor={colors.primaryDark}
                    iconBgColor={colors.primaryLightBg}
                    label={t.helpCenter}
                    description="الأسئلة الشائعة والمساعدة"
                    onPress={onHelpCenter}
                />

                <View style={styles.divider} />

                <SupportRow
                    icon="logo-whatsapp"
                    iconColor="#25D366"
                    iconBgColor="#25D36615"
                    label={t.contactWhatsApp}
                    description="رد سريع خلال ساعة"
                    onPress={handleWhatsApp}
                />

                <View style={styles.divider} />

                <SupportRow
                    icon="mail"
                    iconColor="#EA4335"
                    iconBgColor="#EA433515"
                    label={t.contactEmail}
                    description="support@wellfitgo.com"
                    onPress={handleEmail}
                />

                <View style={styles.divider} />

                <SupportRow
                    icon="document-text"
                    iconColor="#8B5CF6"
                    iconBgColor="#8B5CF615"
                    label={t.faq}
                    onPress={onHelpCenter}
                />

                <View style={styles.divider} />

                <SupportRow
                    icon="shield-checkmark"
                    iconColor="#10B981"
                    iconBgColor="#10B98115"
                    label={t.privacyPolicy}
                    onPress={() => {
                        Linking.openURL('https://wellfitgo.com/privacy');
                    }}
                />

                <View style={styles.divider} />

                <SupportRow
                    icon="document"
                    iconColor="#F59E0B"
                    iconBgColor="#F59E0B15"
                    label={t.termsOfService}
                    onPress={() => {
                        Linking.openURL('https://wellfitgo.com/terms');
                    }}
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
    supportList: {
        gap: verticalScale(0),
    },
    supportRow: {
        flexDirection: isRTL ? 'row-reverse' : 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: verticalScale(12),
        minHeight: verticalScale(56),
    },
    supportRowPressed: {
        opacity: 0.7,
    },
    supportLeft: {
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
    supportContent: {
        flex: 1,
        alignItems: isRTL ? 'flex-end' : 'flex-start',
    },
    supportLabel: {
        fontSize: ScaleFontSize(14),
        fontWeight: '600',
        color: colors.textPrimary,
        writingDirection: isRTL ? 'rtl' : 'ltr',
    },
    supportDescription: {
        fontSize: ScaleFontSize(11),
        color: colors.textSecondary,
        marginTop: verticalScale(2),
        writingDirection: isRTL ? 'rtl' : 'ltr',
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
    },
});

export default memo(SupportOptions);
