/**
 * HomeHeader Component
 * @description Header with greeting, avatar, and profile navigation
 */

import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    FadeInDown,
} from 'react-native-reanimated';

import { colors } from '@/src/shared/core/constants/Theme';
import { horizontalScale, verticalScale, ScaleFontSize } from '@/src/shared/core/utils/scaling';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HomeHeaderProps {
    /** User name to display */
    userName: string;
    /** User avatar URL */
    userAvatar?: string;
    /** Greeting text */
    greeting: string;
    /** Profile press handler */
    onProfilePress: () => void;
    /** Notification press handler */
    onNotificationPress?: () => void;
}

/**
 * HomeHeader - Welcome header with user info
 */
function HomeHeader({
    userName,
    userAvatar,
    greeting,
    onProfilePress,
    onNotificationPress,
}: HomeHeaderProps) {
    const avatarScale = useSharedValue(1);
    const notifScale = useSharedValue(1);
    const insets = useSafeAreaInsets()

    const handleAvatarPressIn = useCallback(() => {
        avatarScale.value = withSpring(0.95);
    }, [avatarScale]);

    const handleAvatarPressOut = useCallback(() => {
        avatarScale.value = withSpring(1);
    }, [avatarScale]);

    const handleAvatarPress = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onProfilePress();
    }, [onProfilePress]);

    const handleNotifPress = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onNotificationPress?.();
    }, [onNotificationPress]);

    const animatedAvatarStyle = useAnimatedStyle(() => ({
        transform: [{ scale: avatarScale.value }],
    }));

    const animatedNotifStyle = useAnimatedStyle(() => ({
        transform: [{ scale: notifScale.value }],
    }));

    // Get initials for fallback avatar
    const initials = userName
        .split(' ')
        .map(n => n[0])
        .join('')
        .substring(0, 2);

    return (
        <Animated.View
            entering={FadeInDown.duration(400)}
            style={[styles.container,{paddingTop: insets.top}]}
        >

            {/* Right side - Actions */}
            <View style={styles.actionsContainer}>
                {/* Notifications */}
                {onNotificationPress && (
                    <Pressable
                        onPress={handleNotifPress}
                        onPressIn={() => { notifScale.value = withSpring(0.95); }}
                        onPressOut={() => { notifScale.value = withSpring(1); }}
                        accessibilityRole="button"
                        accessibilityLabel="الإشعارات"
                        style={styles.notificationButton}
                    >
                        <Animated.View style={[styles.notificationCircle, animatedNotifStyle]}>
                            <Ionicons
                                name="notifications-outline"
                                size={horizontalScale(22)}
                                color={colors.textPrimary}
                            />
                            {/* Notification badge */}
                            <View style={styles.badge} />
                        </Animated.View>
                    </Pressable>
                )}

                {/* Left side - Greeting */}
                <View style={styles.greetingContainer}>
                    <Text style={styles.greeting}>{greeting}</Text>
                    <Text style={styles.userName}>{userName}</Text>
                </View>


                {/* Avatar */}
                <Pressable
                    onPress={handleAvatarPress}
                    onPressIn={handleAvatarPressIn}
                    onPressOut={handleAvatarPressOut}
                    accessibilityRole="button"
                    accessibilityLabel={`الملف الشخصي لـ ${userName}`}
                    style={styles.avatarButton}
                    disabled
                >
                    <Animated.View style={[styles.avatarContainer, animatedAvatarStyle]}>
                        {userAvatar ? (
                            <Image
                                source={{ uri: userAvatar }}
                                style={styles.avatarImage}
                                accessibilityIgnoresInvertColors
                            />
                        ) : (
                            <View style={styles.avatarFallback}>
                                <Text style={styles.avatarInitials}>{initials}</Text>
                            </View>
                        )}
                    </Animated.View>
                </Pressable>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: horizontalScale(20),
        paddingVertical: verticalScale(16),
    },
    greetingContainer: {
        flex: 1,
        alignItems: 'flex-end', // RTL: align to the right
    },
    greeting: {
        fontSize: ScaleFontSize(14),
        color: colors.textSecondary,
        writingDirection: 'rtl',
        marginBottom: verticalScale(2),
    },
    userName: {
        fontSize: ScaleFontSize(22),
        fontWeight: '700',
        color: colors.textPrimary,
        writingDirection: 'rtl',
    },
    actionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: horizontalScale(12),
    },
    notificationButton: {
        minWidth: horizontalScale(44),
        minHeight: horizontalScale(44),
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationCircle: {
        width: horizontalScale(42),
        height: horizontalScale(42),
        borderRadius: horizontalScale(21),
        backgroundColor: colors.bgSecondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badge: {
        position: 'absolute',
        top: horizontalScale(8),
        right: horizontalScale(10),
        width: horizontalScale(8),
        height: horizontalScale(8),
        borderRadius: horizontalScale(4),
        backgroundColor: colors.error,
        borderWidth: 1.5,
        borderColor: colors.white,
    },
    avatarButton: {
        minWidth: horizontalScale(44),
        minHeight: horizontalScale(44),
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarContainer: {
        width: horizontalScale(48),
        height: horizontalScale(48),
        borderRadius: horizontalScale(24),
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: colors.primaryDark,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarFallback: {
        width: '100%',
        height: '100%',
        backgroundColor: colors.primaryLightBg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitials: {
        fontSize: ScaleFontSize(16),
        fontWeight: '600',
        color: colors.primaryDark,
    },
});

export default memo(HomeHeader);
