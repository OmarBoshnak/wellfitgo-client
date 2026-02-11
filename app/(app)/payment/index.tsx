/**
 * PaymentScreen
 * @description Paymob hosted checkout — no card data collected in-app
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { colors } from '@/src/shared/core/constants/Theme';
import {
    horizontalScale,
    verticalScale,
    ScaleFontSize,
} from '@/src/shared/core/utils/scaling';

// API
import {
    createPaymobCheckout,
    getPaymentStatus,
} from '@/src/shared/services/backend/api';

// Components
import {
    PaymentHeader,
    PaymentFooter,
} from '@/src/shared/components/payment';

const RETURN_URL = 'wellfitgo-client://payment-return';
const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 30;
const PENDING_PAYMENT_KEY = 'pending_payment';

/**
 * PaymentScreen - Paymob hosted checkout orchestrator
 */
export default function PaymentScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ planId: string; price: string; planName: string }>();

    // State
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const pollRef = useRef<NodeJS.Timeout | null>(null);
    const isMounted = useRef(true);

    useEffect(() => {
        return () => {
            isMounted.current = false;
            if (pollRef.current) clearTimeout(pollRef.current);
        };
    }, []);

    // Handlers
    const handleBack = useCallback(() => {
        if (pollRef.current) clearTimeout(pollRef.current);
        router.back();
    }, [router]);

    /** Save pending payment to AsyncStorage for crash recovery */
    const savePendingPayment = useCallback(async (data: {
        customerReference: string;
        planId: string;
        planName: string;
        amount: string;
    }) => {
        try {
            await AsyncStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify({
                ...data,
                createdAt: Date.now(),
            }));
        } catch (e) {
            console.warn('[Payment] Failed to save pending payment:', e);
        }
    }, []);

    /** Clear pending payment from AsyncStorage */
    const clearPendingPayment = useCallback(async () => {
        try {
            await AsyncStorage.removeItem(PENDING_PAYMENT_KEY);
        } catch (e) {
            console.warn('[Payment] Failed to clear pending payment:', e);
        }
    }, []);

    /** Poll backend for payment confirmation by customerReference */
    const pollPaymentStatus = useCallback(async (customerReference: string): Promise<boolean> => {
        const token = await AsyncStorage.getItem('token');
        for (let i = 0; i < MAX_POLL_ATTEMPTS; i++) {
            try {
                const res = await getPaymentStatus(customerReference, token || undefined);
                const status = res?.data?.status;
                if (status === 'paid') return true;
                if (status === 'failed' || status === 'cancelled') return false;
            } catch {
                // ignore transient errors and keep polling
            }
            await new Promise((r) => {
                pollRef.current = setTimeout(r, POLL_INTERVAL_MS);
            });
        }
        return false;
    }, []);

    /** Navigate to success screen */
    const navigateToSuccess = useCallback((data: {
        amount: string;
        transactionId: string;
        paymentMethod: string;
    }) => {
        router.replace({
            pathname: '/(app)/payment/success',
            params: {
                planName: params.planName || 'اشتراك WellFitGo',
                amount: data.amount || params.price || '0',
                transactionId: data.transactionId || '',
                date: new Date().toLocaleDateString('ar-EG', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                }),
                paymentMethod: data.paymentMethod || 'دفع إلكتروني',
            },
        } as never);
    }, [router, params.planName, params.price]);

    // Handle payment
    const handlePay = useCallback(async () => {
        if (!params.planId) {
            Alert.alert('خطأ', 'لم يتم تحديد خطة الاشتراك.', [{ text: 'حسناً' }]);
            return;
        }

        setIsProcessing(true);
        setStatusText('جارٍ إنشاء جلسة الدفع...');

        try {
            const token = await AsyncStorage.getItem('token');
            const checkoutRes = await createPaymobCheckout(
                { planId: params.planId },
                token || undefined,
            );

            if (!checkoutRes?.success || !checkoutRes?.data?.paymentUrl) {
                throw new Error(checkoutRes?.message || 'فشل في إنشاء جلسة الدفع');
            }

            const { paymentUrl, customerReference, amount } = checkoutRes.data;

            // Persist pending payment for crash/close recovery
            await savePendingPayment({
                customerReference,
                planId: params.planId,
                planName: params.planName || 'اشتراك WellFitGo',
                amount: String(amount || params.price),
            });

            setStatusText('جارٍ فتح صفحة الدفع...');

            // Open Paymob checkout in browser
            const result = await WebBrowser.openAuthSessionAsync(paymentUrl, RETURN_URL);

            // After browser closes (regardless of how), poll for webhook confirmation
            setStatusText('جارٍ التحقق من حالة الدفع...');
            const confirmed = await pollPaymentStatus(customerReference);

            if (confirmed) {
                await clearPendingPayment();
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                navigateToSuccess({
                    amount: String(amount || params.price),
                    transactionId: customerReference,
                    paymentMethod: 'دفع إلكتروني',
                });
                return;
            }

            // Payment not confirmed — keep pending payment in storage for recovery
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert(
                'لم يتم تأكيد الدفع',
                'لم نتمكن من تأكيد عملية الدفع. إذا تم الخصم من حسابك، سيتم تفعيل اشتراكك تلقائياً خلال دقائق.',
                [{ text: 'حسناً' }],
            );
        } catch (error) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert(
                'خطأ',
                (error as Error).message || 'فشل في إتمام الدفع. حاول مرة أخرى.',
                [{ text: 'حسناً' }],
            );
        } finally {
            setIsProcessing(false);
            setStatusText('');
        }
    }, [params.planId, params.price, pollPaymentStatus, navigateToSuccess, savePendingPayment, clearPendingPayment]);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <Animated.View entering={FadeIn.duration(300)}>
                <PaymentHeader
                    onBack={handleBack}
                    amount={params.price}
                />
            </Animated.View>

            {/* Scrollable Content */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Plan Summary */}
                <Animated.View entering={FadeInDown.delay(100).duration(300)}>
                    <View style={styles.planSummary}>
                        <View style={styles.planIcon}>
                            <Ionicons
                                name="diamond"
                                size={horizontalScale(28)}
                                color={colors.primaryDark}
                            />
                        </View>
                        <Text style={styles.planName}>
                            {params.planName || 'اشتراك WellFitGo'}
                        </Text>
                        <Text style={styles.planPrice}>
                            {params.price} جنيه
                        </Text>
                    </View>
                </Animated.View>

                {/* Info Box */}
                <Animated.View entering={FadeInDown.delay(200).duration(300)}>
                    <View style={styles.infoBox}>
                        <Ionicons
                            name="shield-checkmark"
                            size={horizontalScale(20)}
                            color={colors.success}
                        />
                        <Text style={styles.infoText}>
                            سيتم توجيهك إلى صفحة الدفع الآمنة لإتمام العملية. لا يتم تخزين بيانات بطاقتك في التطبيق.
                        </Text>
                    </View>
                </Animated.View>

                {/* Processing Status */}
                {isProcessing && statusText ? (
                    <Animated.View entering={FadeIn.duration(200)} style={styles.statusContainer}>
                        <ActivityIndicator size="small" color={colors.primaryDark} />
                        <Text style={styles.statusText}>{statusText}</Text>
                    </Animated.View>
                ) : null}

                {/* Bottom spacing */}
                <View style={styles.bottomSpacer} />
            </ScrollView>

            {/* Fixed Footer */}
            <Animated.View entering={FadeIn.delay(300).duration(300)}>
                <PaymentFooter
                    onPay={handlePay}
                    isLoading={isProcessing}
                    disabled={false}
                    amount={params.price}
                />
            </Animated.View>
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
        paddingHorizontal: horizontalScale(20),
        paddingTop: verticalScale(20),
    },
    planSummary: {
        backgroundColor: colors.white,
        borderRadius: horizontalScale(16),
        padding: horizontalScale(24),
        alignItems: 'center',
        marginBottom: verticalScale(16),
        borderWidth: 1,
        borderColor: colors.border,
    },
    planIcon: {
        width: horizontalScale(56),
        height: horizontalScale(56),
        borderRadius: horizontalScale(28),
        backgroundColor: colors.primaryLightBg,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: verticalScale(12),
    },
    planName: {
        fontSize: ScaleFontSize(18),
        fontWeight: '700',
        color: colors.textPrimary,
        textAlign: 'center',
        writingDirection: 'rtl',
        marginBottom: verticalScale(6),
    },
    planPrice: {
        fontSize: ScaleFontSize(24),
        fontWeight: '800',
        color: colors.primaryDark,
        textAlign: 'center',
    },
    infoBox: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: horizontalScale(10),
        backgroundColor: colors.primaryLightBg,
        borderRadius: horizontalScale(12),
        padding: horizontalScale(14),
        marginTop: verticalScale(4),
    },
    infoText: {
        flex: 1,
        fontSize: ScaleFontSize(13),
        color: colors.textSecondary,
        lineHeight: ScaleFontSize(20),
        textAlign: 'right',
        writingDirection: 'rtl',
    },
    statusContainer: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'center',
        gap: horizontalScale(10),
        marginTop: verticalScale(20),
        padding: horizontalScale(14),
        backgroundColor: colors.white,
        borderRadius: horizontalScale(12),
        borderWidth: 1,
        borderColor: colors.border,
    },
    statusText: {
        fontSize: ScaleFontSize(14),
        color: colors.primaryDark,
        fontWeight: '500',
        writingDirection: 'rtl',
    },
    bottomSpacer: {
        height: verticalScale(20),
    },
});
