/**
 * Payment Return Handler
 * @description Deep link handler for Paymob redirect (wellfitgo-client://payment-return?status=...)
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { colors } from '@/src/shared/core/constants/Theme';
import { getPaymentStatus } from '@/src/shared/services/backend/api';

const PENDING_PAYMENT_KEY = 'pending_payment';
const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 15;

export default function PaymentReturnScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ status?: string }>();
    const [message, setMessage] = useState('جارٍ التحقق من حالة الدفع...');

    useEffect(() => {
        handleReturn();
    }, []);

    const handleReturn = async () => {
        try {
            const pendingRaw = await AsyncStorage.getItem(PENDING_PAYMENT_KEY);
            if (!pendingRaw) {
                // No pending payment found — go home
                router.replace('/(app)/(tabs)' as never);
                return;
            }

            const pending = JSON.parse(pendingRaw);
            const { customerReference, planName, amount } = pending;

            // If Paymob returned with explicit failure
            if (params.status === 'failure') {
                await AsyncStorage.removeItem(PENDING_PAYMENT_KEY);
                setMessage('فشل الدفع');
                setTimeout(() => {
                    router.replace('/(app)/(tabs)' as never);
                }, 1500);
                return;
            }

            // Poll backend to confirm webhook-based status
            const token = await AsyncStorage.getItem('token');
            let confirmed = false;

            for (let i = 0; i < MAX_POLL_ATTEMPTS; i++) {
                try {
                    const res = await getPaymentStatus(customerReference, token || undefined);
                    const status = res?.data?.status;
                    if (status === 'paid') {
                        confirmed = true;
                        break;
                    }
                    if (status === 'failed' || status === 'cancelled') {
                        break;
                    }
                } catch {
                    // Transient error — keep polling
                }
                await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
            }

            await AsyncStorage.removeItem(PENDING_PAYMENT_KEY);

            if (confirmed) {
                router.replace({
                    pathname: '/(app)/payment/success',
                    params: {
                        planName: planName || 'اشتراك WellFitGo',
                        amount: amount || '0',
                        transactionId: customerReference || '',
                        date: new Date().toLocaleDateString('ar-EG', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                        }),
                        paymentMethod: 'دفع إلكتروني',
                    },
                } as never);
            } else {
                // Not confirmed — redirect home, webhook will activate later
                setMessage('لم يتم تأكيد الدفع بعد. سيتم التفعيل تلقائياً عند التأكيد.');
                setTimeout(() => {
                    router.replace('/(app)/(tabs)' as never);
                }, 2500);
            }
        } catch (error) {
            console.error('[PaymentReturn] Error:', error);
            router.replace('/(app)/(tabs)' as never);
        }
    };

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color={colors.primaryDark} />
            <Text style={styles.message}>{message}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.bgPrimary,
        gap: 16,
        padding: 24,
    },
    message: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
        textAlign: 'center',
        writingDirection: 'rtl',
    },
});
