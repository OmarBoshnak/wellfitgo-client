/**
 * EditModals Component
 * @description Modal editors for gender, age, height
 */

import React, { memo, useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    Pressable,
    TextInput,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';

import { colors, shadows } from '@/src/shared/core/constants/Theme';
import { horizontalScale, verticalScale, ScaleFontSize } from '@/src/shared/core/utils/scaling';
import { profileTranslations, isRTL } from '@/src/shared/core/constants/translation';
import { Profile, EditModalType } from '@/src/shared/types/profile';

interface EditModalsProps {
    /** Which modal is visible */
    visible: EditModalType;
    /** Profile data */
    profile: Profile;
    /** Close handler */
    onClose: () => void;
    /** Save handler */
    onSave: (field: string, value: string | number) => void;
}

// ============================================================================
// Gender Modal
// ============================================================================

interface GenderModalProps {
    visible: boolean;
    currentValue: 'male' | 'female';
    onClose: () => void;
    onSave: (value: 'male' | 'female') => void;
}

function GenderModal({ visible, currentValue, onClose, onSave }: GenderModalProps) {
    const t = profileTranslations;
    const [selected, setSelected] = useState(currentValue);

    useEffect(() => {
        setSelected(currentValue);
    }, [currentValue, visible]);

    const handleSelect = (gender: 'male' | 'female') => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelected(gender);
    };

    const handleSave = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onSave(selected);
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable style={styles.overlay} onPress={onClose}>
                <Animated.View
                    entering={SlideInUp.springify()}
                    style={styles.modalContent}
                >
                    <Pressable onPress={(e) => e.stopPropagation()}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{t.selectGender}</Text>
                            <Pressable onPress={onClose} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color={colors.textSecondary} />
                            </Pressable>
                        </View>

                        <View style={styles.genderOptions}>
                            <Pressable
                                onPress={() => handleSelect('male')}
                                style={[
                                    styles.genderOption,
                                    selected === 'male' && styles.genderSelected,
                                ]}
                            >
                                <View style={[styles.genderIcon, selected === 'male' && styles.genderIconSelected]}>
                                    <Ionicons
                                        name="male"
                                        size={32}
                                        color={selected === 'male' ? colors.white : colors.primaryDark}
                                    />
                                </View>
                                <Text style={[styles.genderText, selected === 'male' && styles.genderTextSelected]}>
                                    {t.male}
                                </Text>
                            </Pressable>

                            <Pressable
                                onPress={() => handleSelect('female')}
                                style={[
                                    styles.genderOption,
                                    selected === 'female' && styles.genderSelected,
                                ]}
                            >
                                <View style={[styles.genderIcon, selected === 'female' && styles.genderIconSelected]}>
                                    <Ionicons
                                        name="female"
                                        size={32}
                                        color={selected === 'female' ? colors.white : colors.primaryDark}
                                    />
                                </View>
                                <Text style={[styles.genderText, selected === 'female' && styles.genderTextSelected]}>
                                    {t.female}
                                </Text>
                            </Pressable>
                        </View>

                        <Pressable onPress={handleSave} style={styles.saveButton}>
                            <Text style={styles.saveButtonText}>{t.save}</Text>
                        </Pressable>
                    </Pressable>
                </Animated.View>
            </Pressable>
        </Modal>
    );
}

// ============================================================================
// Number Input Modal (Age/Height)
// ============================================================================

interface NumberModalProps {
    visible: boolean;
    title: string;
    currentValue: number;
    unit: string;
    min: number;
    max: number;
    onClose: () => void;
    onSave: (value: number) => void;
}

function NumberModal({
    visible,
    title,
    currentValue,
    unit,
    min,
    max,
    onClose,
    onSave,
}: NumberModalProps) {
    const t = profileTranslations;
    const [value, setValue] = useState(currentValue.toString());
    const [error, setError] = useState('');

    useEffect(() => {
        setValue(currentValue.toString());
        setError('');
    }, [currentValue, visible]);

    const handleChange = (text: string) => {
        // Only allow numbers
        const numericValue = text.replace(/[^0-9]/g, '');
        setValue(numericValue);
        setError('');
    };

    const handleSave = () => {
        const numValue = parseInt(value, 10);

        if (isNaN(numValue)) {
            setError('الرجاء إدخال رقم صحيح');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        if (numValue < min || numValue > max) {
            setError(`القيمة يجب أن تكون بين ${min} و ${max}`);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onSave(numValue);
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <KeyboardAvoidingView
                style={styles.overlay}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <Pressable style={styles.overlay} onPress={onClose}>
                    <Animated.View
                        entering={SlideInUp.springify()}
                        style={styles.modalContent}
                    >
                        <Pressable onPress={(e) => e.stopPropagation()}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>{title}</Text>
                                <Pressable onPress={onClose} style={styles.closeButton}>
                                    <Ionicons name="close" size={24} color={colors.textSecondary} />
                                </Pressable>
                            </View>

                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={[styles.numberInput, error && styles.inputError]}
                                    value={value}
                                    onChangeText={handleChange}
                                    keyboardType="numeric"
                                    maxLength={3}
                                    placeholder="0"
                                    placeholderTextColor={colors.textSecondary}
                                    textAlign="center"
                                    autoFocus
                                />
                                <Text style={styles.unitText}>{unit}</Text>
                            </View>

                            {error ? (
                                <Text style={styles.errorText}>{error}</Text>
                            ) : null}

                            <Text style={styles.rangeText}>
                                القيمة المسموحة: {min} - {max}
                            </Text>

                            <Pressable onPress={handleSave} style={styles.saveButton}>
                                <Text style={styles.saveButtonText}>{t.save}</Text>
                            </Pressable>
                        </Pressable>
                    </Animated.View>
                </Pressable>
            </KeyboardAvoidingView>
        </Modal>
    );
}

// ============================================================================
// Main Component
// ============================================================================

function EditModals({ visible, profile, onClose, onSave }: EditModalsProps) {
    const t = profileTranslations;

    const handleSaveGender = useCallback(
        (value: 'male' | 'female') => {
            onSave('gender', value);
        },
        [onSave]
    );

    const handleSaveAge = useCallback(
        (value: number) => {
            onSave('age', value);
        },
        [onSave]
    );

    const handleSaveHeight = useCallback(
        (value: number) => {
            onSave('height', value);
        },
        [onSave]
    );

    return (
        <>
            <GenderModal
                visible={visible === 'gender'}
                currentValue={profile.gender}
                onClose={onClose}
                onSave={handleSaveGender}
            />

            <NumberModal
                visible={visible === 'age'}
                title={t.enterAge}
                currentValue={profile.age}
                unit={t.years}
                min={13}
                max={120}
                onClose={onClose}
                onSave={handleSaveAge}
            />

            <NumberModal
                visible={visible === 'height'}
                title={t.enterHeight}
                currentValue={profile.height}
                unit="سم"
                min={100}
                max={250}
                onClose={onClose}
                onSave={handleSaveHeight}
            />
        </>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.white,
        borderTopLeftRadius: horizontalScale(24),
        borderTopRightRadius: horizontalScale(24),
        padding: horizontalScale(20),
        paddingBottom: verticalScale(40),
    },
    modalHeader: {
        flexDirection: isRTL ? 'row-reverse' : 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(24),
    },
    modalTitle: {
        fontSize: ScaleFontSize(18),
        fontWeight: '700',
        color: colors.textPrimary,
    },
    closeButton: {
        width: horizontalScale(44),
        height: horizontalScale(44),
        justifyContent: 'center',
        alignItems: 'center',
    },
    genderOptions: {
        flexDirection: isRTL ? 'row-reverse' : 'row',
        justifyContent: 'center',
        gap: horizontalScale(20),
        marginBottom: verticalScale(24),
    },
    genderOption: {
        alignItems: 'center',
        padding: horizontalScale(16),
        borderRadius: horizontalScale(16),
        borderWidth: 2,
        borderColor: colors.border,
        minWidth: horizontalScale(120),
    },
    genderSelected: {
        borderColor: colors.primaryDark,
        backgroundColor: colors.primaryLightBg,
    },
    genderIcon: {
        width: horizontalScale(60),
        height: horizontalScale(60),
        borderRadius: horizontalScale(30),
        backgroundColor: colors.primaryLightBg,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(8),
    },
    genderIconSelected: {
        backgroundColor: colors.primaryDark,
    },
    genderText: {
        fontSize: ScaleFontSize(14),
        fontWeight: '600',
        color: colors.textPrimary,
    },
    genderTextSelected: {
        color: colors.primaryDark,
    },
    inputContainer: {
        flexDirection: isRTL ? 'row-reverse' : 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: horizontalScale(12),
        marginBottom: verticalScale(16),
    },
    numberInput: {
        fontSize: ScaleFontSize(36),
        fontWeight: '700',
        color: colors.textPrimary,
        borderBottomWidth: 2,
        borderBottomColor: colors.primaryDark,
        paddingHorizontal: horizontalScale(20),
        paddingVertical: verticalScale(8),
        minWidth: horizontalScale(120),
    },
    inputError: {
        borderBottomColor: colors.error,
    },
    unitText: {
        fontSize: ScaleFontSize(18),
        color: colors.textSecondary,
    },
    errorText: {
        fontSize: ScaleFontSize(12),
        color: colors.error,
        textAlign: 'center',
        marginBottom: verticalScale(8),
    },
    rangeText: {
        fontSize: ScaleFontSize(12),
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: verticalScale(24),
    },
    saveButton: {
        backgroundColor: colors.primaryDark,
        paddingVertical: verticalScale(16),
        borderRadius: horizontalScale(12),
        alignItems: 'center',
        minHeight: verticalScale(56),
        justifyContent: 'center',
    },
    saveButtonText: {
        fontSize: ScaleFontSize(16),
        fontWeight: '700',
        color: colors.white,
    },
});

export default memo(EditModals);
