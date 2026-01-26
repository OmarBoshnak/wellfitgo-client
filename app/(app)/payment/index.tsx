/**
 * PaymentScreen
 * @description Payment method selection and card form
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    Pressable,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, gradients } from '@/src/shared/core/constants/Theme';
import {
    horizontalScale,
    verticalScale,
    ScaleFontSize,
} from '@/src/shared/core/utils/scaling';

// Types
import {
    SavedCard as SavedCardType,
    NewCardForm,
    CardValidationErrors,
    PaymentMethodType,
    DEFAULT_NEW_CARD_FORM,
} from '@/src/shared/types/payment';

// Utils
import {
    validateCardForm,
    hasCardErrors,
    isCardFormComplete,
    getCardDigits,
} from '@/src/shared/utils/cardUtils';
import {
    mockSavedCards,
    processPayment,
    deleteSavedCard,
} from '@/src/shared/utils/paymentData';

// Components
import {
    PaymentHeader,
    SavedCard,
    AddCardForm,
    PaymentFooter,
} from '@/src/shared/components/payment';

/**
 * PaymentScreen - Payment method selection orchestrator
 */
export default function PaymentScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ planId: string; price: string }>();

    // State
    const [savedCards, setSavedCards] = useState<SavedCardType[]>(mockSavedCards);
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>(
        mockSavedCards.length > 0 ? 'saved' : 'new'
    );
    const [selectedCardId, setSelectedCardId] = useState<string | null>(
        mockSavedCards[0]?.id || null
    );
    const [newCard, setNewCard] = useState<NewCardForm>(DEFAULT_NEW_CARD_FORM);
    const [errors, setErrors] = useState<CardValidationErrors>({});
    const [isProcessing, setIsProcessing] = useState(false);

    // Handlers
    const handleBack = useCallback(() => {
        router.back();
    }, [router]);

    const handleSelectSavedCard = useCallback((cardId: string) => {
        setSelectedMethod('saved');
        setSelectedCardId(cardId);
        setErrors({});
    }, []);

    const handleDeleteCard = useCallback(async (cardId: string) => {
        Alert.alert(
            'حذف البطاقة',
            'هل أنت متأكد من حذف هذه البطاقة؟',
            [
                { text: 'إلغاء', style: 'cancel' },
                {
                    text: 'حذف',
                    style: 'destructive',
                    onPress: async () => {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                        await deleteSavedCard(cardId);
                        setSavedCards((prev) => prev.filter((c) => c.id !== cardId));
                        if (selectedCardId === cardId) {
                            setSelectedCardId(null);
                            setSelectedMethod('new');
                        }
                    },
                },
            ]
        );
    }, [selectedCardId]);

    const handleSelectNewCard = useCallback(() => {
        setSelectedMethod('new');
        setSelectedCardId(null);
    }, []);

    const handleUpdateField = useCallback(
        <K extends keyof NewCardForm>(field: K, value: NewCardForm[K]) => {
            setNewCard((prev) => ({ ...prev, [field]: value }));
            // Clear error for this field
            if (errors[field as keyof CardValidationErrors]) {
                setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors[field as keyof CardValidationErrors];
                    return newErrors;
                });
            }
        },
        [errors]
    );

    // Validation
    const isFormValid = useMemo(() => {
        if (selectedMethod === 'saved') {
            return selectedCardId !== null;
        }
        return isCardFormComplete(newCard) && !hasCardErrors(validateCardForm(newCard));
    }, [selectedMethod, selectedCardId, newCard]);

    // Handle payment
    const handlePay = useCallback(async () => {
        // Validate new card if selected
        if (selectedMethod === 'new') {
            const validationErrors = validateCardForm(newCard);
            if (hasCardErrors(validationErrors)) {
                setErrors(validationErrors);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                return;
            }
        }

        setIsProcessing(true);

        try {
            const result = await processPayment({
                planId: params.planId || '',
                cardId: selectedMethod === 'saved' ? selectedCardId || undefined : undefined,
                newCard:
                    selectedMethod === 'new'
                        ? {
                            number: getCardDigits(newCard.number),
                            expiry: newCard.expiry,
                            cvv: newCard.cvv,
                            holderName: newCard.holderName,
                        }
                        : undefined,
                saveCard: newCard.saveCard,
            });

            if (result.success) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

                // Navigate to success screen with payment data
                router.replace({
                    pathname: '/(app)/payment/success',
                    params: {
                        planName: 'الخطة الفصلية', // TODO: Get from subscription data
                        amount: params.price || '719',
                        transactionId: result.transactionId || '#TXN-' + Date.now(),
                        date: new Date().toLocaleDateString('ar-EG', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                        }),
                        paymentMethod: selectedMethod === 'saved'
                            ? `بطاقة ****${savedCards.find(c => c.id === selectedCardId)?.last4 || ''}`
                            : 'بطاقة جديدة',
                    },
                } as never);
            }
        } catch (error) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('خطأ', 'فشل في إتمام الدفع. حاول مرة أخرى.', [{ text: 'حسناً' }]);
        } finally {
            setIsProcessing(false);
        }
    }, [selectedMethod, selectedCardId, newCard, params.planId, router]);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardContainer}
            >
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
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Saved Cards Section */}
                    {savedCards.length > 0 && (
                        <Animated.View entering={FadeInDown.delay(100).duration(300)}>
                            <Text style={styles.sectionTitle}>البطاقات المحفوظة</Text>
                            {savedCards.map((card) => (
                                <SavedCard
                                    key={card.id}
                                    card={card}
                                    isSelected={
                                        selectedMethod === 'saved' && selectedCardId === card.id
                                    }
                                    onSelect={() => handleSelectSavedCard(card.id)}
                                    onDelete={() => handleDeleteCard(card.id)}
                                />
                            ))}
                        </Animated.View>
                    )}

                    {/* Add New Card Option */}
                    <Animated.View entering={FadeInDown.delay(200).duration(300)}>
                        <Pressable
                            onPress={handleSelectNewCard}
                            style={[
                                styles.addNewCardButton,
                                selectedMethod === 'new' && styles.addNewCardButtonSelected,
                            ]}
                            accessibilityRole="radio"
                            accessibilityState={{ selected: selectedMethod === 'new' }}
                            accessibilityLabel="إضافة بطاقة جديدة"
                        >
                            <View style={styles.addNewCardContent}>
                                {/* Radio */}
                                <View
                                    style={[
                                        styles.radio,
                                        selectedMethod === 'new' && styles.radioSelected,
                                    ]}
                                >
                                    {selectedMethod === 'new' && (
                                        <LinearGradient
                                            colors={gradients.primary}
                                            style={styles.radioInner}
                                        />
                                    )}
                                </View>

                                <View style={styles.addNewCardIcon}>
                                    <Ionicons
                                        name="add-circle"
                                        size={horizontalScale(24)}
                                        color={colors.primaryDark}
                                    />
                                </View>
                                <Text style={styles.addNewCardText}>إضافة بطاقة جديدة</Text>
                            </View>
                        </Pressable>
                    </Animated.View>

                    {/* New Card Form */}
                    {selectedMethod === 'new' && (
                        <AddCardForm
                            form={newCard}
                            errors={errors}
                            onUpdateField={handleUpdateField}
                        />
                    )}

                    {/* Bottom spacing */}
                    <View style={styles.bottomSpacer} />
                </ScrollView>

                {/* Fixed Footer */}
                <Animated.View entering={FadeIn.delay(300).duration(300)}>
                    <PaymentFooter
                        onPay={handlePay}
                        isLoading={isProcessing}
                        disabled={!isFormValid}
                        amount={params.price}
                    />
                </Animated.View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgPrimary,
    },
    keyboardContainer: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: horizontalScale(20),
        paddingTop: verticalScale(20),
    },
    sectionTitle: {
        fontSize: ScaleFontSize(16),
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: verticalScale(12),
        textAlign: 'right'
    },
    addNewCardButton: {
        backgroundColor: colors.white,
        borderRadius: horizontalScale(14),
        borderWidth: 1,
        borderColor: colors.border,
        marginTop: verticalScale(8),
        marginBottom: verticalScale(16),
    },
    addNewCardButtonSelected: {
        borderColor: colors.primaryDark,
        borderWidth: 2,
    },
    addNewCardContent: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        padding: horizontalScale(14),
        gap: horizontalScale(12),
    },
    radio: {
        width: horizontalScale(20),
        height: horizontalScale(20),
        borderRadius: horizontalScale(10),
        borderWidth: 2,
        borderColor: colors.textSecondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioSelected: {
        borderColor: colors.primaryDark,
    },
    radioInner: {
        width: horizontalScale(10),
        height: horizontalScale(10),
        borderRadius: horizontalScale(5),
    },
    addNewCardIcon: {
        width: horizontalScale(40),
        height: horizontalScale(40),
        borderRadius: horizontalScale(10),
        backgroundColor: colors.primaryLightBg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addNewCardText: {
        fontSize: ScaleFontSize(15),
        fontWeight: '600',
        color: colors.textPrimary,
        writingDirection: 'rtl',
    },
    bottomSpacer: {
        height: verticalScale(20),
    },
});
