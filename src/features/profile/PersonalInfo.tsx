/**
 * PersonalInfo Component
 * @description Personal information display with edit options
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { colors, shadows } from '@/src/shared/core/constants/Theme';
import { horizontalScale, verticalScale, ScaleFontSize } from '@/src/shared/core/utils/scaling';
import { profileTranslations, isRTL } from '@/src/shared/core/constants/translation';
import { Profile } from '@/src/shared/types/profile';

interface PersonalInfoProps {
    /** User profile */
    profile: Profile;
    /** Edit gender handler */
    onEditGender: () => void;
    /** Edit age handler */
    onEditAge: () => void;
    /** Edit height handler */
    onEditHeight: () => void;
}

interface InfoRowProps {
    icon: string;
    iconColor: string;
    label: string;
    value: string;
    onEdit: () => void;
}

function InfoRow({ icon, iconColor, label, value, onEdit }: InfoRowProps) {
    const t = profileTranslations;

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onEdit();
    };

    return (
        <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
                <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
                    <Ionicons
                        name={icon as any}
                        size={horizontalScale(18)}
                        color={iconColor}
                    />
                </View>
                <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>{label}</Text>
                    <Text style={styles.infoValue}>{value}</Text>
                </View>
            </View>
            <Pressable
                onPress={handlePress}
                style={styles.editButton}
                accessibilityRole="button"
                accessibilityLabel={`${t.edit} ${label}`}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Text style={styles.editText}>{t.edit}</Text>
            </Pressable>
        </View>
    );
}

function PersonalInfo({
    profile,
    onEditGender,
    onEditAge,
    onEditHeight,
}: PersonalInfoProps) {
    const t = profileTranslations;

    const genderValue = profile.gender === 'male' ? t.male : t.female;
    const ageValue = `${profile.age} ${t.years}`;
    const heightValue = `${profile.height} سم`;

    return (
        <Animated.View
            entering={FadeInDown.delay(400).duration(400)}
            style={styles.container}
        >
            <Text style={styles.title}>{t.personalInfo}</Text>

            <View style={styles.infoList}>
                <InfoRow
                    icon="person"
                    iconColor={colors.primaryDark}
                    label={t.gender}
                    value={genderValue}
                    onEdit={onEditGender}
                />

                <View style={styles.divider} />

                <InfoRow
                    icon="calendar"
                    iconColor="#F59E0B"
                    label={t.age}
                    value={ageValue}
                    onEdit={onEditAge}
                />

                <View style={styles.divider} />

                <InfoRow
                    icon="resize"
                    iconColor="#10B981"
                    label={t.height}
                    value={heightValue}
                    onEdit={onEditHeight}
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
    infoList: {
        gap: verticalScale(0),
    },
    infoRow: {
        flexDirection: isRTL ? 'row-reverse' : 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: verticalScale(12),
    },
    infoLeft: {
        flexDirection: isRTL ? 'row-reverse' : 'row',
        alignItems: 'center',
        gap: horizontalScale(12),
    },
    iconContainer: {
        width: horizontalScale(40),
        height: horizontalScale(40),
        borderRadius: horizontalScale(12),
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoContent: {
        alignItems: isRTL ? 'flex-end' : 'flex-start',
    },
    infoLabel: {
        fontSize: ScaleFontSize(12),
        color: colors.textSecondary,
        marginBottom: verticalScale(2),
    },
    infoValue: {
        fontSize: ScaleFontSize(15),
        fontWeight: '600',
        color: colors.textPrimary,
    },
    editButton: {
        paddingHorizontal: horizontalScale(12),
        paddingVertical: verticalScale(6),
        minWidth: horizontalScale(44),
        minHeight: horizontalScale(44),
        justifyContent: 'center',
        alignItems: 'center',
    },
    editText: {
        fontSize: ScaleFontSize(13),
        fontWeight: '600',
        color: colors.primaryDark,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
    },
});

export default memo(PersonalInfo);
