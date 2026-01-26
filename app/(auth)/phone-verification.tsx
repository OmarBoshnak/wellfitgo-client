import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, TextInput, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
    CodeField,
    Cursor,
    useBlurOnFulfill,
    useClearByFocusCell,
} from 'react-native-confirmation-code-field';

import { colors, gradients } from '@/src/shared/core/constants/Theme';
import {
    horizontalScale,
    verticalScale,
    ScaleFontSize,
} from '@/src/shared/core/utils/scaling';
import { AuthService } from '@/src/shared/services/auth/auth.service';
import { useAppDispatch } from '@/src/shared/store';
import { setCredentials } from '@/src/shared/store/slices/authSlice';

const CELL_COUNT = 6;

export default function PhoneVerificationScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const dispatch = useAppDispatch();

    // Params from login screen
    const { userId, phone } = params;

    const [value, setValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60); // 1 minute countdown

    const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({
        value,
        setValue,
    });

    // Countdown timer
    useEffect(() => {
        if (!timeLeft) return;

        const intervalId = setInterval(() => {
            setTimeLeft(timeLeft - 1);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [timeLeft]);

    // Handle verification
    const handleVerify = async () => {
        if (value.length !== CELL_COUNT) {
            Alert.alert('تنبيه', 'يرجى إدخال رمز التحقق كاملاً');
            return;
        }

        if (!userId || typeof userId !== 'string') {
            Alert.alert('خطأ', 'بيانات المستخدم غير صالحة');
            return;
        }

        setIsLoading(true);
        try {
            const { user, token, routing } = await AuthService.verifyOtp(userId, value);

            // Debug logging
            console.log('Phone Verification Response:', { user, routing });
            console.log('User onboardingCompleted:', user.onboardingCompleted);
            console.log('User healthProfileCompleted:', user.healthProfileCompleted);
            console.log('Routing destination:', routing?.destination);

            // Dispatch to Redux store
            dispatch(setCredentials({ user, token }));

            Alert.alert('نجاح', 'تم التحقق بنجاح');

            // Handle routing - check backend routing first, then user status
            if (routing && routing.destination) {
                // Backend determines routing (healthhistory for first-time, clientHome for returning)
                router.replace(routing.destination as any);
            } else if (user.status === 'pending' || !user.status) {
                // router.replace('/(auth)/approval-pending');
                router.replace('/(app)/(tabs)');
            } else if (user.status === 'rejected') {
                Alert.alert('تنبيه', 'تم رفض طلب حسابك. يرجى الاتصال بالدعم.');
                await AuthService.logout();
            } else {
                // Default fallback - check if first time or health profile incomplete
                if (user.isFirstLogin || !user.healthProfileCompleted) {
                    router.replace('/(auth)/health-history');
                } else {
                    router.replace('/(app)/(tabs)');
                }
            }

        } catch (error: any) {
            console.error('Verification Error:', error);
            Alert.alert('خطأ', error.message || 'رمز التحقق غير صحيح');
            setValue(''); // Clear code on error
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-submit when code is full
    useEffect(() => {
        if (value.length === CELL_COUNT) {
            handleVerify();
        }
    }, [value]);

    // Resend code
    const handleResend = async () => {
        if (timeLeft > 0) return;

        if (!phone || typeof phone !== 'string') {
            Alert.alert('خطأ', 'رقم الهاتف غير موجود');
            return;
        }

        setIsLoading(true);
        try {
            await AuthService.requestOtp(phone);
            Alert.alert('نجاح', 'تم إعادة إرسال رمز التحقق');
            setTimeLeft(60); // Reset timer
        } catch (error) {
            Alert.alert('خطأ', 'فشل إعادة الإرسال. حاول مرة أخرى.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-forward" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>رمز التحقق</Text>
                <Text style={styles.subtitle}>
                    تم إرسال رمز التحقق إلى الرقم {phone}
                </Text>

                <View style={styles.codeContainer}>
                    <CodeField
                        ref={ref}
                        {...props}
                        value={value}
                        onChangeText={setValue}
                        cellCount={CELL_COUNT}
                        rootStyle={styles.codeFieldRoot}
                        keyboardType="number-pad"
                        textContentType="oneTimeCode"
                        renderCell={({ index, symbol, isFocused }) => (
                            <View
                                key={index}
                                style={[
                                    styles.cell,
                                    isFocused && styles.focusCell,
                                ]}
                                onLayout={getCellOnLayoutHandler(index)}
                            >
                                <Text style={styles.cellText}>
                                    {symbol || (isFocused ? <Cursor /> : null)}
                                </Text>
                            </View>
                        )}
                    />
                </View>

                <View style={styles.timerContainer}>
                    <Text style={styles.timerText}>
                        {timeLeft > 0
                            ? `يمكنك إعادة الإرسال خلال ${timeLeft} ثانية`
                            : 'لم يصلك الرمز؟'
                        }
                    </Text>

                    {timeLeft === 0 && (
                        <TouchableOpacity onPress={handleResend} disabled={isLoading}>
                            <Text style={styles.resendText}>إعادة إرسال</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {isLoading && (
                    <ActivityIndicator size="large" color={colors.primaryDark} style={{ marginTop: 20 }} />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgPrimary,
    },
    header: {
        paddingHorizontal: horizontalScale(16),
        paddingVertical: verticalScale(16),
    },
    backButton: {
        alignSelf: 'flex-end',
        padding: 8,
    },
    content: {
        flex: 1,
        paddingHorizontal: horizontalScale(24),
        paddingTop: verticalScale(20),
        alignItems: 'center',
    },
    title: {
        fontSize: ScaleFontSize(24),
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: verticalScale(8),
    },
    subtitle: {
        fontSize: ScaleFontSize(16),
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: verticalScale(40),
    },
    codeContainer: {
        width: '100%',
        marginBottom: verticalScale(30),
    },
    codeFieldRoot: {
        marginTop: 20,
        gap: 10,
        justifyContent: 'center',
    },
    cell: {
        width: horizontalScale(45),
        height: horizontalScale(50),
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.bgSecondary,
    },
    focusCell: {
        borderColor: colors.primaryDark,
        borderWidth: 2,
    },
    cellText: {
        fontSize: ScaleFontSize(24),
        textAlign: 'center',
        color: colors.textPrimary,
    },
    timerContainer: {
        alignItems: 'center',
        gap: verticalScale(8),
    },
    timerText: {
        fontSize: ScaleFontSize(14),
        color: colors.textSecondary,
    },
    resendText: {
        fontSize: ScaleFontSize(16),
        color: colors.primaryDark,
        fontWeight: '600',
    },
});
