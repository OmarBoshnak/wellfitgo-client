/**
 * ProfileHeader Component
 * @description Header with avatar, name, and membership badge
 */

import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    FadeIn,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, gradients, shadows } from '@/src/shared/core/constants/Theme';
import { horizontalScale, verticalScale, ScaleFontSize } from '@/src/shared/core/utils/scaling';
import { profileTranslations, isRTL } from '@/src/shared/core/constants/translation';
import { Profile, Subscription } from '@/src/shared/types/profile';

interface ProfileHeaderProps {
    /** User profile */
    profile: Profile;
    /** Subscription info */
    subscription: Subscription | null;
    /** Avatar press handler */
    onAvatarPress: () => void;
    /** Edit press handler */
    onEditPress: () => void;
    /** Is uploading avatar */
    isUploading?: boolean;
    /** Upload progress */
    uploadProgress?: number;
}

function ProfileHeader({
    profile,
    subscription,
    onAvatarPress,
    onEditPress,
    isUploading = false,
    uploadProgress = 0,
}: ProfileHeaderProps) {
    const t = profileTranslations;
    const avatarScale = useSharedValue(1);

    const fullName = `${profile.firstName} ${profile.lastName}`;
    const initials = `${profile.firstName[0] || ''}${profile.lastName[0] || ''}`.toUpperCase();

    const isActive = subscription?.status === 'active' || subscription?.status === 'trial';
    const isPremium = subscription?.planName?.toLowerCase().includes('premium');

    const handleAvatarPressIn = useCallback(() => {
        avatarScale.value = withSpring(0.95);
    }, [avatarScale]);

    const handleAvatarPressOut = useCallback(() => {
        avatarScale.value = withSpring(1);
    }, [avatarScale]);

    const handleAvatarPress = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onAvatarPress();
    }, [onAvatarPress]);

    const handleEditPress = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onEditPress();
    }, [onEditPress]);

    const animatedAvatarStyle = useAnimatedStyle(() => ({
        transform: [{ scale: avatarScale.value }],
    }));

    return (
        <Animated.View
            entering={FadeIn.duration(400)}
            style={styles.container}
        >
            <LinearGradient
                colors={gradients.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                {/* Avatar */}
                <Pressable
                    onPress={handleAvatarPress}
                    onPressIn={handleAvatarPressIn}
                    onPressOut={handleAvatarPressOut}
                    accessibilityRole="button"
                    accessibilityLabel={t.changePhoto}
                    disabled={isUploading}
                >
                    <Animated.View style={[styles.avatarContainer, animatedAvatarStyle]}>
                        {profile.avatarUrl ? (
                            <Image
                                source={{ uri: profile.avatarUrl }}
                                style={styles.avatar}
                                accessibilityIgnoresInvertColors
                            />
                        ) : (
                            <View style={styles.avatarFallback}>
                                <Text style={styles.initials}>{initials}</Text>
                            </View>
                        )}
                        {/* Upload overlay */}
                        {isUploading && (
                            <View style={styles.uploadOverlay}>
                                <ActivityIndicator size="small" color={colors.white} />
                                <Text style={styles.uploadProgress}>
                                    {Math.round(uploadProgress)}%
                                </Text>
                            </View>
                        )}

                    </Animated.View>
                    {/* Camera icon */}
                    {!isUploading && (
                        <View style={styles.cameraIcon}>
                            <Ionicons
                                name="camera"
                                size={horizontalScale(14)}
                                color={colors.white}
                            />
                        </View>
                    )}

                </Pressable>

                {/* Name */}
                <Text style={styles.name}>{fullName}</Text>

                {/* Membership badge */}
                {isActive && (
                    <View style={[styles.badge, isPremium && styles.premiumBadge]}>
                        <Ionicons
                            name={isPremium ? 'star' : 'checkmark-circle'}
                            size={horizontalScale(12)}
                            color={colors.white}
                        />
                        <Text style={styles.badgeText}>
                            {isPremium ? t.premium : t.active}
                        </Text>
                    </View>
                )}

                {/* Member since */}
                {profile.createdAt && (
                    <Text style={styles.memberSince}>
                        {t.memberSince}{' '}
                        {new Date(profile.createdAt).toLocaleDateString(
                            isRTL ? 'ar-EG' : 'en-US',
                            { year: 'numeric', month: 'long' }
                        )}
                    </Text>
                )}
            </LinearGradient>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: verticalScale(16),
        borderBottomLeftRadius: horizontalScale(24),
        borderBottomRightRadius: horizontalScale(24),
        overflow: 'hidden',
        ...shadows.medium,
    },
    gradient: {
        paddingTop: verticalScale(60),
        paddingBottom: verticalScale(24),
        paddingHorizontal: horizontalScale(20),
        alignItems: 'center',
    },
    editButton: {
        position: 'absolute',
        top: verticalScale(50),
        [isRTL ? 'left' : 'right']: horizontalScale(16),
        minWidth: horizontalScale(44),
        minHeight: horizontalScale(44),
        justifyContent: 'center',
        alignItems: 'center',
    },
    editButtonInner: {
        width: horizontalScale(36),
        height: horizontalScale(36),
        borderRadius: horizontalScale(18),
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarContainer: {
        width: horizontalScale(100),
        height: horizontalScale(100),
        borderRadius: horizontalScale(50),
        borderWidth: 3,
        borderColor: colors.white,
        overflow: 'hidden',
        ...shadows.medium,
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    avatarFallback: {
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    initials: {
        fontSize: ScaleFontSize(32),
        fontWeight: '700',
        color: colors.white,
    },
    uploadOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadProgress: {
        color: colors.white,
        fontSize: ScaleFontSize(10),
        marginTop: verticalScale(4),
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: horizontalScale(28),
        height: horizontalScale(28),
        borderRadius: horizontalScale(14),
        backgroundColor: colors.primaryDark,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.white,
    },
    name: {
        fontSize: ScaleFontSize(22),
        fontWeight: '700',
        color: colors.white,
        marginTop: verticalScale(12),
        textAlign: 'center',
        writingDirection: isRTL ? 'rtl' : 'ltr',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        paddingHorizontal: horizontalScale(12),
        paddingVertical: verticalScale(4),
        borderRadius: horizontalScale(12),
        marginTop: verticalScale(8),
        gap: horizontalScale(4),
    },
    premiumBadge: {
        backgroundColor: 'rgba(255, 193, 7, 0.4)',
    },
    badgeText: {
        fontSize: ScaleFontSize(12),
        fontWeight: '600',
        color: colors.white,
    },
    memberSince: {
        fontSize: ScaleFontSize(12),
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: verticalScale(8),
        writingDirection: isRTL ? 'rtl' : 'ltr',
    },
});

export default memo(ProfileHeader);
