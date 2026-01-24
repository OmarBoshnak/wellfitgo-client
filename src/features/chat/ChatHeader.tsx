/**
 * ChatHeader Component
 * @description Header showing doctor info, online status, and navigation
 */

import React, { memo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    I18nManager,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { colors, gradients, shadows } from '@/src/shared/core/constants/Theme';
import { horizontalScale, verticalScale, ScaleFontSize } from '@/src/shared/core/utils/scaling';
import type { Doctor, ConnectionStatus } from '@/src/shared/types/chat';

// ============================================================================
// Types
// ============================================================================

export interface ChatHeaderProps {
    doctor: Doctor | null;
    connectionStatus?: ConnectionStatus;
    isTyping?: boolean;
    onBackPress?: () => void;
    onMenuPress?: () => void;
}

// ============================================================================
// Component
// ============================================================================

const ChatHeader: React.FC<ChatHeaderProps> = memo(({
    doctor,
    connectionStatus = 'connected',
    isTyping = false,
    onBackPress,
    onMenuPress,
}) => {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const isRTL = I18nManager.isRTL;

    const handleBack = () => {
        if (onBackPress) {
            onBackPress();
        } else {
            router.back();
        }
    };

    /**
     * Get status text
     */
    const getStatusText = (): string => {
        if (isTyping) return 'يكتب...';
        if (connectionStatus === 'connecting') return 'جاري الاتصال...';
        if (connectionStatus === 'disconnected') return 'غير متصل';
        if (connectionStatus === 'reconnecting') return 'إعادة الاتصال...';
        if (doctor?.isOnline) return 'متصل الآن';
        if (doctor?.lastSeen) {
            return `آخر ظهور ${formatLastSeen(doctor.lastSeen)}`;
        }
        return '';
    };

    return (
        <LinearGradient
            colors={gradients.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.container, { paddingTop: insets.top + verticalScale(8) }]}
        >
            <View style={styles.content}>
                {/* Doctor Info */}
                <TouchableOpacity
                    style={styles.doctorInfo}
                    activeOpacity={0.8}
                    accessibilityLabel={`الدكتور ${doctor?.fullName || ''}`}
                    accessibilityRole="button"
                >
                    {/* Avatar */}
                    <View style={styles.avatarContainer}>
                        {doctor?.avatarUrl ? (
                            <Image
                                source={{ uri: doctor.avatarUrl }}
                                style={styles.avatar}
                                contentFit="cover"
                                transition={200}
                            />
                        ) : (
                            <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                <Ionicons name="person" size={24} color={colors.white} />
                            </View>
                        )}
                        {/* Online Indicator */}
                        {doctor?.isOnline && (
                            <View style={styles.onlineIndicator} />
                        )}
                    </View>

                    {/* Name & Status */}
                    <View style={styles.textContainer}>
                        <Text
                            style={styles.doctorName}
                            numberOfLines={1}
                            accessibilityRole="header"
                        >
                            {doctor?.fullName || 'الطبيب'}
                        </Text>
                        <Text style={styles.statusText} numberOfLines={1}>
                            {getStatusText()}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Connection Status Banner */}
            {connectionStatus !== 'connected' && (
                <View style={styles.connectionBanner}>
                    <Ionicons
                        name={connectionStatus === 'disconnected' ? 'cloud-offline' : 'sync'}
                        size={14}
                        color={colors.white}
                    />
                    <Text style={styles.connectionText}>
                        {connectionStatus === 'disconnected' ? 'لا يوجد اتصال' : 'جاري الاتصال...'}
                    </Text>
                </View>
            )}
        </LinearGradient>
    );
});

// ============================================================================
// Helpers
// ============================================================================

const formatLastSeen = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;

    return date.toLocaleDateString('ar-SA');
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
    container: {
        paddingBottom: verticalScale(12),
        ...shadows.medium,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: horizontalScale(12),
    },
    backButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    doctorInfo: {
        flex: 1,
        flexDirection: 'row-reverse',
        alignItems: 'center',
        paddingHorizontal: horizontalScale(8),
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: horizontalScale(44),
        height: horizontalScale(44),
        borderRadius: horizontalScale(22),
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    avatarPlaceholder: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#22C55E',
        borderWidth: 2,
        borderColor: colors.white,
    },
    textContainer: {
        flex: 1,
        marginRight: horizontalScale(12),
        alignItems:'flex-end',
    },
    doctorName: {
        fontSize: ScaleFontSize(16),
        fontWeight: '700',
        color: colors.white,
    },
    statusText: {
        fontSize: ScaleFontSize(12),
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 2,
    },
    menuButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    connectionBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        paddingVertical: verticalScale(4),
        marginTop: verticalScale(8),
        marginHorizontal: horizontalScale(12),
        borderRadius: 8,
        gap: 6,
    },
    connectionText: {
        fontSize: ScaleFontSize(11),
        color: colors.white,
        fontWeight: '500',
    },
});

ChatHeader.displayName = 'ChatHeader';

export default ChatHeader;
