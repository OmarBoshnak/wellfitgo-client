import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Animated,
    Dimensions,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { horizontalScale, verticalScale, ScaleFontSize } from '@/src/core/utils/scaling';
import { useAppDispatch, useAppSelector } from '@/src/shared/store';
import { selectToken } from '@/src/shared/store/selectors/auth.selectors';
import { selectWeightData, setWeightData } from '@/src/shared/store/slices/homeSlice';
import { colors, gradients, shadows } from '@/src/core/constants/Theme';
import { getClientProfile, updateClientProfile, ClientProfileResponse } from '@/src/shared/services/backend/api';

const { width } = Dimensions.get('window');

interface WeightCheckinProps {
    visible: boolean;
    onClose: () => void;
    onComplete: () => void;
    isRTL: boolean;
}

const translations = {
    title: (isRTL: boolean) => isRTL ? 'تسجيل الوزن الأسبوعي' : 'Weekly Weight Check-in',
    currentWeight: (isRTL: boolean) => isRTL ? 'الوزن الحالي' : 'Current Weight',
    newWeight: (isRTL: boolean) => isRTL ? 'الوزن الجديد' : 'New Weight',
    save: (isRTL: boolean) => isRTL ? 'حفظ' : 'Save',
    cancel: (isRTL: boolean) => isRTL ? 'إلغاء' : 'Cancel',
    kg: 'kg',
    success: (isRTL: boolean) => isRTL ? 'تم الحفظ بنجاح! 🎉' : 'Saved Successfully! 🎉',
};

export const WeightCheckin: React.FC<WeightCheckinProps> = ({
    visible,
    onClose,
    onComplete,
    isRTL,
}) => {
    const dispatch = useAppDispatch();
    const weightData = useAppSelector(selectWeightData);
    const token = useAppSelector(selectToken);
    const currentWeight = weightData?.currentWeight || 70;

    const [newWeight, setNewWeight] = useState<number>(currentWeight || 70);
    const [showSuccess, setShowSuccess] = useState(false);
    const [scaleAnim] = useState(new Animated.Value(0));
    const [successAnim] = useState(new Animated.Value(0));
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (visible) {
            setNewWeight(currentWeight || 70);
            setShowSuccess(false);
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
                tension: 65,
                friction: 10,
            }).start();
        } else {
            scaleAnim.setValue(0);
        }
    }, [visible, currentWeight]);

    const adjustWeight = (delta: number) => {
        setNewWeight(prev => Math.max(30, Math.min(200, parseFloat((prev + delta).toFixed(1)))));
    };

    const mapProfileToWeightData = (profile?: ClientProfileResponse | null) => {
        if (!profile) return null;

        const normalizedProfile = (profile as any)?.data && typeof (profile as any).data === 'object'
            ? (profile as any).data
            : profile;

        const history = Array.isArray(normalizedProfile.weightHistory)
            ? normalizedProfile.weightHistory
            : [];
        const current = typeof normalizedProfile.currentWeight === 'number'
            ? normalizedProfile.currentWeight
            : history[history.length - 1]?.weight;
        const start = typeof normalizedProfile.startingWeight === 'number'
            ? normalizedProfile.startingWeight
            : history[0]?.weight ?? current;
        const target = typeof normalizedProfile.targetWeight === 'number'
            ? normalizedProfile.targetWeight
            : start ?? current;

        if (current === undefined || current === null
            || start === undefined || start === null
            || target === undefined || target === null) {
            return null;
        }

        return {
            currentWeight: current,
            targetWeight: target,
            startWeight: start,
            unit: 'kg' as const,
            history,
        };
    };

    const handleSave = async () => {
        if (!token) {
            Alert.alert(isRTL ? 'تسجيل الدخول مطلوب' : 'Login Required',
                isRTL ? 'يرجى تسجيل الدخول لتحديث الوزن.' : 'Please log in to update your weight.');
            return;
        }

        try {
            setIsSaving(true);
            await updateClientProfile({ currentWeight: newWeight }, token || undefined);
            const profile = await getClientProfile(token || undefined);
            const mappedWeightData = mapProfileToWeightData(profile);
            dispatch(setWeightData(mappedWeightData));

            setShowSuccess(true);
            Animated.sequence([
                Animated.spring(successAnim, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 50,
                    friction: 7,
                }),
                Animated.delay(1000),
                Animated.timing(successAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                setShowSuccess(false);
                onComplete();
            });
        } catch (error) {
            console.error('Error updating weight:', error);
            Alert.alert(
                isRTL ? 'حدث خطأ' : 'Update Failed',
                isRTL ? 'تعذر تحديث الوزن. حاول مرة أخرى.' : 'Unable to update weight. Please try again.'
            );
        } finally {
            setIsSaving(false);
        }
    };

    const weightDiff = newWeight - currentWeight;
    const diffColor = weightDiff > 0 ? colors.error : weightDiff < 0 ? colors.success : colors.textSecondary;
    const diffSign = weightDiff > 0 ? '+' : '';

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <BlurView intensity={20} style={styles.overlay} tint="dark">
                <TouchableOpacity
                    style={styles.overlayTouch}
                    activeOpacity={1}
                    onPress={onClose}
                >
                    <Animated.View
                        style={[
                            styles.container,
                            { transform: [{ scale: scaleAnim }] }
                        ]}
                    >
                        <TouchableOpacity activeOpacity={1}>
                            <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                <Text style={[styles.title, { textAlign: isRTL ? 'right' : 'left' }]}>
                                    {translations.title(isRTL)}
                                </Text>
                                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                    <Ionicons name="close" size={24} color={colors.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.currentWeightContainer}>
                                <Text style={styles.currentWeightLabel}>
                                    {translations.currentWeight(isRTL)}
                                </Text>
                                <Text style={styles.currentWeightValue}>
                                    {currentWeight.toFixed(1)} <Text style={styles.unit}>{translations.kg}</Text>
                                </Text>
                            </View>

                            <View style={styles.newWeightContainer}>
                                <Text style={styles.newWeightLabel}>
                                    {translations.newWeight(isRTL)}
                                </Text>

                                <View style={[styles.weightInputRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                    <TouchableOpacity
                                        style={styles.adjustButton}
                                        onPress={() => adjustWeight(-0.1)}
                                        onLongPress={() => adjustWeight(-1)}
                                    >
                                        <Ionicons name="remove" size={28} color={colors.primaryDark} />
                                    </TouchableOpacity>

                                    <View style={styles.weightDisplay}>
                                        <Text style={styles.weightValue}>
                                            {newWeight.toFixed(1)}
                                        </Text>
                                        <Text style={styles.weightUnit}>{translations.kg}</Text>
                                    </View>

                                    <TouchableOpacity
                                        style={styles.adjustButton}
                                        onPress={() => adjustWeight(0.1)}
                                        onLongPress={() => adjustWeight(1)}
                                    >
                                        <Ionicons name="add" size={28} color={colors.primaryDark} />
                                    </TouchableOpacity>
                                </View>

                                {weightDiff !== 0 && (
                                    <Text style={[styles.diffText, { color: diffColor }]}>
                                        {diffSign}{weightDiff.toFixed(1)} kg
                                    </Text>
                                )}
                            </View>

                            <View style={[styles.quickAdjustRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                {[-1, -0.5, 0.5, 1].map((delta) => (
                                    <TouchableOpacity
                                        key={delta}
                                        style={styles.quickButton}
                                        onPress={() => adjustWeight(delta)}
                                    >
                                        <Text style={styles.quickButtonText}>
                                            {delta > 0 ? '+' : ''}{delta}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <View style={[styles.buttonRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={onClose}
                                    disabled={isSaving}
                                >
                                    <Text style={styles.cancelButtonText}>
                                        {translations.cancel(isRTL)}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={handleSave}
                                    activeOpacity={0.9}
                                    disabled={isSaving}
                                >
                                    <LinearGradient
                                        colors={gradients.primary}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={[styles.saveButton, shadows.medium, isSaving && styles.saveButtonDisabled]}
                                    >
                                        {isSaving ? (
                                            <ActivityIndicator color={colors.white} />
                                        ) : (
                                            <Text style={styles.saveButtonText}>
                                                {translations.save(isRTL)}
                                            </Text>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>

                    {showSuccess && (
                        <Animated.View
                            style={[
                                styles.successOverlay,
                                {
                                    opacity: successAnim,
                                    transform: [{ scale: successAnim }]
                                }
                            ]}
                        >
                            <View style={styles.successContent}>
                                <Text style={styles.successEmoji}>🎉</Text>
                                <Text style={styles.successText}>
                                    {translations.success(isRTL)}
                                </Text>
                            </View>
                        </Animated.View>
                    )}
                </TouchableOpacity>
            </BlurView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1 },
    overlayTouch: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    container: {
        width: width * 0.9,
        maxWidth: 400,
        backgroundColor: colors.bgPrimary,
        borderRadius: 24,
        padding: horizontalScale(24),
        ...shadows.light,
    },
    header: {
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: verticalScale(20),
    },
    title: {
        fontSize: ScaleFontSize(20),
        fontWeight: '700',
        color: colors.textPrimary,
        flex: 1,
    },
    closeButton: { padding: 4 },
    currentWeightContainer: {
        alignItems: 'center',
        marginBottom: verticalScale(24),
        paddingVertical: verticalScale(16),
        backgroundColor: colors.bgSecondary,
        borderRadius: 16,
    },
    currentWeightLabel: {
        fontSize: ScaleFontSize(14),
        color: colors.textSecondary,
        marginBottom: 4,
    },
    currentWeightValue: {
        fontSize: ScaleFontSize(32),
        fontWeight: '600',
        color: colors.textPrimary,
    },
    unit: {
        fontSize: ScaleFontSize(18),
        color: colors.textSecondary,
        fontWeight: '400',
    },
    newWeightContainer: {
        alignItems: 'center',
        marginBottom: verticalScale(20),
    },
    newWeightLabel: {
        fontSize: ScaleFontSize(14),
        color: colors.textSecondary,
        marginBottom: 12,
    },
    weightInputRow: {
        alignItems: 'center',
        gap: horizontalScale(16),
    },
    adjustButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.bgSecondary,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.light,
    },
    weightDisplay: { alignItems: 'center' },
    weightValue: {
        fontSize: ScaleFontSize(48),
        fontWeight: '700',
        color: colors.primaryDark,
    },
    weightUnit: {
        fontSize: ScaleFontSize(16),
        color: colors.textSecondary,
        marginTop: -4,
    },
    diffText: {
        fontSize: ScaleFontSize(14),
        fontWeight: '600',
        marginTop: 8,
    },
    quickAdjustRow: {
        justifyContent: 'center',
        gap: horizontalScale(10),
        marginBottom: verticalScale(24),
    },
    quickButton: {
        paddingHorizontal: horizontalScale(16),
        paddingVertical: verticalScale(8),
        borderRadius: 20,
        backgroundColor: colors.bgSecondary,
        borderWidth: 1,
        borderColor: colors.border,
    },
    quickButtonText: {
        fontSize: ScaleFontSize(14),
        fontWeight: '600',
        color: colors.textPrimary,
    },
    buttonRow: { gap: horizontalScale(12) },
    cancelButton: {
        flex: 1,
        height: 52,
        borderRadius: 12,
        backgroundColor: colors.bgSecondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: {
        fontSize: ScaleFontSize(16),
        fontWeight: '600',
        color: colors.textSecondary,
    },
    saveButton: {
        flex: 1,
        height: 52,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: horizontalScale(32),
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        fontSize: ScaleFontSize(16),
        fontWeight: '600',
        color: colors.white,
    },
    successOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    successContent: {
        backgroundColor: colors.bgPrimary,
        padding: horizontalScale(40),
        borderRadius: 24,
        alignItems: 'center',
        ...shadows.medium,
    },
    successEmoji: { fontSize: 64, marginBottom: 16 },
    successText: {
        fontSize: ScaleFontSize(20),
        fontWeight: '700',
        color: colors.success,
        textAlign: 'center',
    },
});

export default WeightCheckin;
