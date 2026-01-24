/**
 * ReceiptAccordion Component
 * @description Expandable receipt details with smooth animation
 */

import React, { memo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    FadeIn,
    Easing,
} from 'react-native-reanimated';

import { colors, shadows } from '@/src/shared/core/constants/Theme';
import {
    horizontalScale,
    verticalScale,
    ScaleFontSize,
} from '@/src/shared/core/utils/scaling';
import { PaymentSuccessData, ReceiptItem } from '@/src/shared/types/paymentSuccess';
import { getReceiptItems } from '@/src/shared/utils/paymentSuccessData';

interface ReceiptAccordionProps {
    /** Payment success data */
    data: PaymentSuccessData;
    /** Animation delay in ms */
    delay?: number;
    /** Callback for download receipt press */
    onDownloadReceipt?: () => void;
}

/**
 * ReceiptAccordion - Collapsible receipt details section
 */
function ReceiptAccordion({
    data,
    delay = 400,
    onDownloadReceipt,
}: ReceiptAccordionProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Animation values
    const contentHeight = useSharedValue(0);
    const chevronRotation = useSharedValue(0);

    const receiptItems = getReceiptItems(data);

    const toggleAccordion = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        const newIsOpen = !isOpen;
        setIsOpen(newIsOpen);

        contentHeight.value = withTiming(newIsOpen ? 1 : 0, {
            duration: 300,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });

        chevronRotation.value = withTiming(newIsOpen ? 180 : 0, {
            duration: 300,
        });
    }, [isOpen, contentHeight, chevronRotation]);

    const handleDownload = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onDownloadReceipt?.();
    }, [onDownloadReceipt]);

    // Animated styles
    const contentStyle = useAnimatedStyle(() => ({
        maxHeight: contentHeight.value * verticalScale(250),
        opacity: contentHeight.value,
        marginTop: contentHeight.value * verticalScale(12),
    }));

    const chevronStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${chevronRotation.value}deg` }],
    }));

    return (
        <Animated.View
            entering={FadeIn.delay(delay).duration(600)}
            style={styles.container}
        >
            {/* Header - Always visible */}
            <Pressable
                onPress={toggleAccordion}
                style={styles.header}
                accessibilityRole="button"
                accessibilityLabel={isOpen ? 'إخفاء تفاصيل الإيصال' : 'عرض تفاصيل الإيصال'}
                accessibilityState={{ expanded: isOpen }}
            >
                <View style={styles.headerLeft}>
                    <View style={styles.iconContainer}>
                        <Ionicons
                            name="receipt-outline"
                            size={horizontalScale(20)}
                            color={colors.primaryDark}
                        />
                    </View>
                    <Text style={styles.headerTitle}>تفاصيل الإيصال</Text>
                </View>

                <Animated.View style={chevronStyle}>
                    <Ionicons
                        name="chevron-down"
                        size={horizontalScale(22)}
                        color={colors.textSecondary}
                    />
                </Animated.View>
            </Pressable>

            {/* Content - Expandable */}
            <Animated.View style={[styles.content, contentStyle]}>
                {receiptItems.map((item, index) => (
                    <View key={index} style={styles.receiptRow}>
                        <Text style={styles.receiptLabel}>{item.label}</Text>
                        <Text style={styles.receiptValue}>{item.value}</Text>
                    </View>
                ))}

                {/* Divider */}
                <View style={styles.divider} />

                {/* Download button */}
                {data.receiptUrl && (
                    <Pressable
                        onPress={handleDownload}
                        style={styles.downloadButton}
                        accessibilityRole="button"
                        accessibilityLabel="تحميل الإيصال"
                    >
                        <Ionicons
                            name="download-outline"
                            size={horizontalScale(18)}
                            color={colors.primaryDark}
                        />
                        <Text style={styles.downloadText}>تحميل الإيصال</Text>
                    </Pressable>
                )}
            </Animated.View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: horizontalScale(20),
        marginVertical: verticalScale(12),
        backgroundColor: colors.white,
        borderRadius: horizontalScale(16),
        ...shadows.light,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: horizontalScale(16),
        minHeight: horizontalScale(56),
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: horizontalScale(12),
    },
    iconContainer: {
        width: horizontalScale(36),
        height: horizontalScale(36),
        borderRadius: horizontalScale(10),
        backgroundColor: colors.primaryLightBg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: ScaleFontSize(16),
        fontWeight: '600',
        color: colors.textPrimary,
        writingDirection: 'rtl',
    },
    content: {
        paddingHorizontal: horizontalScale(16),
        paddingBottom: horizontalScale(16),
        overflow: 'hidden',
    },
    receiptRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: verticalScale(8),
    },
    receiptLabel: {
        fontSize: ScaleFontSize(14),
        color: colors.textSecondary,
        writingDirection: 'rtl',
    },
    receiptValue: {
        fontSize: ScaleFontSize(14),
        fontWeight: '600',
        color: colors.textPrimary,
        writingDirection: 'rtl',
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: verticalScale(12),
    },
    downloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: horizontalScale(8),
        paddingVertical: verticalScale(12),
        backgroundColor: colors.primaryLightBg,
        borderRadius: horizontalScale(10),
    },
    downloadText: {
        fontSize: ScaleFontSize(14),
        fontWeight: '600',
        color: colors.primaryDark,
        writingDirection: 'rtl',
    },
});

export default memo(ReceiptAccordion);
