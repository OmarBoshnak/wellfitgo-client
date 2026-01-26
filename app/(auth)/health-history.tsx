/**
 * HealthHistoryScreen
 * @description Health history form screen - orchestrator pattern with minimal UI logic
 */

import React, { useCallback, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInUp, SlideInRight } from 'react-native-reanimated';

import { colors, gradients } from '@/src/shared/core/constants/Theme';
import {
    horizontalScale,
    verticalScale,
    ScaleFontSize,
} from '@/src/shared/core/utils/scaling';

// Redux
import { useAppDispatch, useAppSelector } from '@/src/shared/store';
import {
    updateFormField,
    setValidationError,
    clearValidationError,
    nextStep,
    previousStep,
    selectHealthFormData,
    selectHealthValidation,
    selectHealthProgress,
    selectHealthCurrentStep,
} from '@/src/shared/store/slices/healthSlice';
import { selectToken } from '@/src/shared/store/selectors/auth.selectors';
import { completeHealthHistory } from '@/src/shared/store/slices/authSlice';
import * as asyncStorage from '@/src/shared/services/storage/asyncStorage';
import api from '@/src/shared/services/backend/api';

// Components
import {
    PersonalInfoForm,
    GenderSelector,
    HeightSelector,
    WeightSelector,
    GoalSelector,
    MedicalConditionsChip,
    ProgressIndicator,
    FormErrorSummary,
} from '@/src/shared/components/health';

// Types & Validation
import {
    HealthFormData,
    Gender,
    HeightUnit,
    WeightUnit,
    FitnessGoal,
    MedicalCondition,
    PersonalInfoData,
} from '@/src/shared/types/health';
import { validateField, validateForm, hasErrors } from '@/src/shared/utils/validation';

/**
 * HealthHistoryScreen - Main orchestrator component
 */
export default function HealthHistoryScreen() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const scrollViewRef = useRef<ScrollView>(null);

    // Redux state
    const formData = useAppSelector(selectHealthFormData);
    const validation = useAppSelector(selectHealthValidation);
    const progress = useAppSelector(selectHealthProgress);
    const currentStep = useAppSelector(selectHealthCurrentStep);
    const token = useAppSelector(selectToken);

    // Local state
    const [showErrorSummary, setShowErrorSummary] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Debounce timer ref
    const validationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Debounced validation function
    const debouncedValidate = useCallback(
        (field: string, value: unknown, options?: { unit?: string; countryCode?: string }) => {
            if (validationTimeoutRef.current) {
                clearTimeout(validationTimeoutRef.current);
            }
            validationTimeoutRef.current = setTimeout(() => {
                const error = validateField(field, value, options);
                if (error) {
                    dispatch(setValidationError({ field, error }));
                } else {
                    dispatch(clearValidationError(field));
                }
            }, 300);
        },
        [dispatch]
    );

    // ============================================================================
    // Event Handlers
    // ============================================================================

    /** Handle personal info field changes */
    const handlePersonalInfoChange = useCallback(
        (field: keyof PersonalInfoData, value: string | number) => {
            dispatch(updateFormField({ field, value }));

            // Debounced validation
            debouncedValidate(field, value, { countryCode: formData.countryCode });
        },
        [dispatch, debouncedValidate, formData.countryCode]
    );

    /** Handle personal info field blur (immediate validation) */
    const handlePersonalInfoBlur = useCallback(
        (field: keyof PersonalInfoData) => {
            const value = formData[field as keyof typeof formData];
            const error = validateField(field, value, { countryCode: formData.countryCode });
            if (error) {
                dispatch(setValidationError({ field, error }));
            }
        },
        [dispatch, formData]
    );

    /** Handle gender selection */
    const handleGenderChange = useCallback(
        (gender: Gender) => {
            dispatch(updateFormField({ field: 'gender', value: gender }));
            dispatch(clearValidationError('gender'));
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
        [dispatch]
    );

    /** Handle height change */
    const handleHeightChange = useCallback(
        (height: number) => {
            dispatch(updateFormField({ field: 'height', value: height }));
            debouncedValidate('height', height, { unit: formData.heightUnit });
        },
        [dispatch, debouncedValidate, formData.heightUnit]
    );

    /** Handle height unit change */
    const handleHeightUnitChange = useCallback(
        (unit: HeightUnit) => {
            dispatch(updateFormField({ field: 'heightUnit', value: unit }));
        },
        [dispatch]
    );

    /** Handle weight change */
    const handleWeightChange = useCallback(
        (weight: number) => {
            dispatch(updateFormField({ field: 'weight', value: weight }));
            debouncedValidate('weight', weight, { unit: formData.weightUnit });
        },
        [dispatch, debouncedValidate, formData.weightUnit]
    );

    /** Handle weight unit change */
    const handleWeightUnitChange = useCallback(
        (unit: WeightUnit) => {
            dispatch(updateFormField({ field: 'weightUnit', value: unit }));
        },
        [dispatch]
    );

    /** Handle goal selection */
    const handleGoalChange = useCallback(
        (goal: FitnessGoal) => {
            dispatch(updateFormField({ field: 'goal', value: goal }));
            dispatch(clearValidationError('goal'));
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
        [dispatch]
    );

    /** Handle medical conditions change */
    const handleMedicalConditionsChange = useCallback(
        (conditions: MedicalCondition[]) => {
            dispatch(updateFormField({ field: 'medicalConditions', value: conditions }));
        },
        [dispatch]
    );

    /** Navigate to next step */
    const handleNextStep = useCallback(() => {
        // Validate current step fields
        const step1Fields = ['firstName', 'lastName', 'phoneNumber', 'age'];
        const step2Fields = ['gender', 'height', 'weight', 'goal'];
        const fieldsToValidate = currentStep === 1 ? step1Fields : step2Fields;

        let hasError = false;

        for (const field of fieldsToValidate) {
            const value = formData[field as keyof typeof formData];
            const error = validateField(field, value, {
                unit: field === 'height' ? formData.heightUnit :
                    field === 'weight' ? formData.weightUnit : undefined,
                countryCode: formData.countryCode,
            });

            if (error) {
                dispatch(setValidationError({ field, error }));
                hasError = true;
            }
        }

        if (hasError) {
            setShowErrorSummary(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        setShowErrorSummary(false);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        dispatch(nextStep());
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }, [currentStep, dispatch, formData]);

    /** Navigate to previous step */
    const handlePreviousStep = useCallback(() => {
        setShowErrorSummary(false);
        dispatch(previousStep());
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }, [dispatch]);

    /** Submit form */
    const handleSubmit = useCallback(async () => {
        // Validate all fields
        const errors = validateForm(formData as Record<string, unknown>);

        if (hasErrors(errors)) {
            for (const [field, error] of Object.entries(errors)) {
                dispatch(setValidationError({ field, error }));
            }
            setShowErrorSummary(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        if (!token) {
            Alert.alert('خطأ', 'لم يتم العثور على رمز المصادقة. يرجى تسجيل الدخول مرة أخرى.');
            return;
        }

        setIsSubmitting(true);
        setShowErrorSummary(false);

        try {
            // Check if we have a token (we should)
            // In a real app, getting the token might need a selector or storage access
            // Here we assume the interceptor or stored token is handled by the api service
            const response = await api.saveHealthProfile(formData, token);

            if (!response.success) {
                throw new Error(response.message || 'Failed to save profile');
            }

            // Mark health history as completed in Redux and storage
            console.log('Health profile saved successfully, updating completion status...');
            dispatch(completeHealthHistory());
            await asyncStorage.setHealthHistoryCompleted();
            await asyncStorage.setNotFirstTimeUser();
            console.log('Health history completion status updated');

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert(
                'تم بنجاح',
                'تم حفظ بياناتك الصحية بنجاح',
                [
                    {
                        text: 'متابعة',
                        onPress: () => {
                            // Navigate to subscription after health history
                            console.log('Navigating to subscription screen');
                            router.replace('/(auth)/book-call' as never);
                        },
                    },
                ]
            );
        } catch (error) {
            console.error('Submit health profile error:', error);
            Alert.alert('خطأ', (error as Error).message || 'حدث خطأ أثناء حفظ البيانات. حاول مرة أخرى.');
        } finally {
            setIsSubmitting(false);
        }
    }, [dispatch, formData, router]);

    /** Handle error item press (scroll to field) */
    const handleErrorPress = useCallback((field: string) => {
        // Could implement field focus here
        setShowErrorSummary(false);
    }, []);

    // ============================================================================
    // Render
    // ============================================================================

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardContainer}
            >
                {/* Header */}
                <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
                    {currentStep > 1 && (
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={handlePreviousStep}
                            accessibilityLabel="العودة للخلف"
                            accessibilityRole="button"
                        >
                            <Ionicons
                                name="arrow-forward"
                                size={horizontalScale(24)}
                                color={colors.textPrimary}
                            />
                        </TouchableOpacity>
                    )}
                    <Text style={styles.headerTitle}>البيانات الصحية</Text>
                    <View style={styles.backButton} />
                </Animated.View>

                {/* Progress Indicator */}
                <Animated.View entering={FadeInUp.delay(100).duration(300)} style={styles.progressContainer}>
                    <ProgressIndicator
                        currentStep={currentStep}
                        totalSteps={2}
                        progress={progress}
                    />
                </Animated.View>

                {/* Scrollable Content */}
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Error Summary */}
                    {showErrorSummary && (
                        <FormErrorSummary
                            errors={validation}
                            onDismiss={() => setShowErrorSummary(false)}
                            onErrorPress={handleErrorPress}
                        />
                    )}

                    {/* Step 1: Personal Information */}
                    {currentStep === 1 && (
                        <Animated.View entering={SlideInRight.duration(300)}>
                            <Text style={styles.stepTitle}>المعلومات الشخصية</Text>
                            <Text style={styles.stepSubtitle}>
                                أدخل بياناتك الشخصية لتخصيص خطتك الصحية
                            </Text>

                            <PersonalInfoForm
                                data={formData}
                                errors={validation}
                                onChange={handlePersonalInfoChange}
                                onBlur={handlePersonalInfoBlur}
                            />

                            <GenderSelector
                                value={formData.gender as Gender | null}
                                onChange={handleGenderChange}
                                error={validation.gender}
                            />
                        </Animated.View>
                    )}

                    {/* Step 2: Health Metrics */}
                    {currentStep === 2 && (
                        <Animated.View entering={SlideInRight.duration(300)}>
                            <Text style={styles.stepTitle}>القياسات والأهداف</Text>
                            <Text style={styles.stepSubtitle}>
                                أدخل قياساتك الحالية وحدد هدفك
                            </Text>

                            <HeightSelector
                                value={formData.height as number | null}
                                unit={formData.heightUnit as HeightUnit}
                                onChange={handleHeightChange}
                                onUnitChange={handleHeightUnitChange}
                                error={validation.height}
                            />

                            <WeightSelector
                                value={formData.weight as number | null}
                                unit={formData.weightUnit as WeightUnit}
                                onChange={handleWeightChange}
                                onUnitChange={handleWeightUnitChange}
                                error={validation.weight}
                            />

                            <GoalSelector
                                value={formData.goal as FitnessGoal | null}
                                onChange={handleGoalChange}
                                error={validation.goal}
                            />

                            <MedicalConditionsChip
                                value={(formData.medicalConditions as MedicalCondition[]) || []}
                                onChange={handleMedicalConditionsChange}
                            />
                        </Animated.View>
                    )}

                    {/* Bottom spacing */}
                    <View style={styles.bottomSpacer} />
                </ScrollView>

                {/* Bottom Action Button */}
                <Animated.View
                    entering={FadeInUp.delay(200).duration(300)}
                    style={styles.bottomContainer}
                >
                    <TouchableOpacity
                        style={styles.primaryButton}
                        activeOpacity={0.8}
                        onPress={currentStep === 2 ? handleSubmit : handleNextStep}
                        disabled={isSubmitting}
                        accessibilityLabel={currentStep === 2 ? 'حفظ البيانات' : 'التالي'}
                        accessibilityRole="button"
                    >
                        <LinearGradient
                            colors={gradients.primary}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.primaryButtonGradient}
                        >
                            <Text style={styles.primaryButtonText}>
                                {isSubmitting ? 'جاري الحفظ...' : currentStep === 2 ? 'حفظ البيانات' : 'التالي'}
                            </Text>
                            {!isSubmitting && (
                                <Ionicons
                                    name={currentStep === 2 ? 'checkmark-circle' : 'arrow-back'}
                                    size={horizontalScale(20)}
                                    color={colors.white}
                                />
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
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
    header: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: horizontalScale(16),
        paddingVertical: verticalScale(12),
    },
    backButton: {
        width: horizontalScale(40),
        height: horizontalScale(40),
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: ScaleFontSize(20),
        fontWeight: '700',
        color: colors.textPrimary,
        writingDirection: 'rtl',
    },
    progressContainer: {
        paddingHorizontal: horizontalScale(20),
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: horizontalScale(20),
        paddingTop: verticalScale(8),
    },
    stepTitle: {
        fontSize: ScaleFontSize(24),
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: verticalScale(8),
        textAlign: 'right',
    },
    stepSubtitle: {
        fontSize: ScaleFontSize(15),
        color: colors.textSecondary,
        marginBottom: verticalScale(24),
        lineHeight: ScaleFontSize(22),
        textAlign: 'right',
    },
    bottomSpacer: {
        height: verticalScale(100),
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.bgPrimary,
        paddingHorizontal: horizontalScale(20),
        paddingVertical: verticalScale(16),
        paddingBottom: verticalScale(24),
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    primaryButton: {
        borderRadius: horizontalScale(12),
        overflow: 'hidden',
        shadowColor: colors.primaryDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryButtonGradient: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: verticalScale(16),
        gap: horizontalScale(10),
    },
    primaryButtonText: {
        fontSize: ScaleFontSize(16),
        color: colors.white,
        fontWeight: '600',
        writingDirection: 'rtl',
    },
});
