/**
 * SocialProof Component
 * @description User avatars and join count for social proof
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { colors } from '@/src/shared/core/constants/Theme';
import {
    horizontalScale,
    verticalScale,
    ScaleFontSize,
} from '@/src/shared/core/utils/scaling';
import { SocialProofData } from '@/src/shared/types/subscription';

interface SocialProofProps {
    /** Social proof data */
    data: SocialProofData;
}

/**
 * Avatar circle component
 */
const Avatar = memo(function Avatar({
    color,
    index,
    total,
}: {
    color: string;
    index: number;
    total: number;
}) {
    return (
        <View
            style={[
                styles.avatar,
                {
                    backgroundColor: color,
                    zIndex: total - index,
                    marginLeft: index > 0 ? -horizontalScale(10) : 0,
                },
            ]}
        >
            <Text style={styles.avatarText}>
                {String.fromCharCode(65 + index)}
            </Text>
        </View>
    );
});

/**
 * SocialProof - User avatars and join message
 */
function SocialProof({ data }: SocialProofProps) {
    return (
        <Animated.View
            entering={FadeIn.delay(300).duration(400)}
            style={styles.container}
        >
            {/* Avatar stack */}
            <View style={styles.avatarStack}>
                {data.avatarColors.slice(0, 4).map((color, index) => (
                    <Avatar
                        key={index}
                        color={color}
                        index={index}
                        total={Math.min(data.avatarColors.length, 4)}
                    />
                ))}
                {/* Plus more indicator */}
                <View style={[styles.avatar, styles.moreAvatar]}>
                    <Text style={styles.moreText}>+</Text>
                </View>
            </View>

            {/* Join message */}
            <Text style={styles.message}>{data.messageAr}</Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: horizontalScale(20),
        marginBottom: verticalScale(20),
        gap: horizontalScale(12),
    },
    avatarStack: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: horizontalScale(32),
        height: horizontalScale(32),
        borderRadius: horizontalScale(16),
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: colors.white,
    },
    avatarText: {
        fontSize: ScaleFontSize(12),
        fontWeight: '700',
        color: colors.white,
    },
    moreAvatar: {
        backgroundColor: colors.bgSecondary,
        marginLeft: -horizontalScale(10),
    },
    moreText: {
        fontSize: ScaleFontSize(14),
        fontWeight: '700',
        color: colors.textSecondary,
    },
    message: {
        fontSize: ScaleFontSize(13),
        fontWeight: '500',
        color: colors.textSecondary,
        writingDirection: 'rtl',
    },
});

export default memo(SocialProof);
