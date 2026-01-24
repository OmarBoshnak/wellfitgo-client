/**
 * PaymentSuccessScreen
 * @description Payment success screen with animated checkmark and receipt details
 */

import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { colors } from '@/src/shared/core/constants/Theme';
import { verticalScale } from '@/src/shared/core/utils/scaling';

// Components
import {
    SuccessAnimation,
    WelcomeMessage,
    SuccessImage,
    ReceiptAccordion,
    SuccessActions,
} from '@/src/shared/components/payment/success';

// Types & Data
import { PaymentSuccessData } from '@/src/shared/types/paymentSuccess';
import { mockPaymentData, getSuccessMessage, getWelcomeSubtitle } from '@/src/shared/utils/paymentSuccessData';

/**
 * Parse route params to PaymentSuccessData
 */
const parsePaymentParams = (params: Record<string, string | string[] | undefined>): PaymentSuccessData => {
    return {
        planName: (params.planName as string) || mockPaymentData.planName,
        amount: params.amount ? Number(params.amount) : mockPaymentData.amount,
        transactionId: (params.transactionId as string) || mockPaymentData.transactionId,
        date: (params.date as string) || mockPaymentData.date,
        paymentMethod: (params.paymentMethod as string) || mockPaymentData.paymentMethod,
        receiptUrl: params.receiptUrl as string | undefined,
    };
};

/**
 * PaymentSuccessScreen - Main payment success orchestrator
 */
export default function PaymentSuccessScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    // Parse payment data from params or use mock data
    const paymentData = parsePaymentParams(params);

    // Trigger success haptic on mount
    useEffect(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, []);

    // Handlers
    const handleStartJourney = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.replace('/(app)/(tabs)' as never);
    }, [router]);

    const handleViewDetails = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        // TODO: Navigate to subscription details
        // router.push('/subscription/details');
    }, []);

    const handleDownloadReceipt = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        // TODO: Implement receipt download
        // if (paymentData.receiptUrl) {
        //   Linking.openURL(paymentData.receiptUrl);
        // }
    }, []);

    const handleAnimationComplete = useCallback(() => {
        // Animation sequence completed - can trigger analytics here
    }, []);

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Checkmark Animation */}
                <SuccessAnimation
                    onAnimationComplete={handleAnimationComplete}
                    size={100}
                />

                {/* Welcome Message */}
                <WelcomeMessage
                    title={getSuccessMessage(paymentData.planName)}
                    subtitle={getWelcomeSubtitle()}
                    delay={200}
                />

                {/* Hero Image */}
                <SuccessImage delay={300} />

                {/* Receipt Accordion */}
                <ReceiptAccordion
                    data={paymentData}
                    delay={400}
                    onDownloadReceipt={handleDownloadReceipt}
                />

                {/* Bottom spacer */}
                <View style={styles.spacer} />
            </ScrollView>

            {/* Fixed Actions */}
            <SuccessActions
                primaryText="ابدأ رحلتك"
                secondaryText="عرض تفاصيل الاشتراك"
                onPrimaryPress={handleStartJourney}
                onSecondaryPress={handleViewDetails}
                delay={500}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgPrimary,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: verticalScale(24),
    },
    spacer: {
        height: verticalScale(16),
    },
});
