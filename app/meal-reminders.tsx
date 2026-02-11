import { isRTL } from '@/src/core/constants/translation';
import { useAppDispatch, useAppSelector } from '@/src/shared/store';
import { selectNotificationSettings, updateNotificationSettings } from '@/src/shared/store/slices/profileSlice';
import { selectToken } from '@/src/shared/store/selectors/auth.selectors';
import { DEFAULT_NOTIFICATION_SETTINGS, MealRemindersSchedule } from '@/src/shared/types/profile';
import { updateClientProfile } from '@/src/shared/services/backend/api';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Design System Colors
const COLORS = {
    primaryBlue: '#5073FE',
    primaryCyan: '#02C3CD',
    textPrimary: '#526477',
    textSecondary: '#8093A5',
    textTertiary: '#AAB8C5',
    borderLight: '#E1E8EF',
    bgScreen: '#F8F9FA',
    bgCard: '#FFFFFF',
};

interface MealReminder {
    enabled: boolean;
    time: string;
}

interface MealReminders {
    breakfast: MealReminder;
    snack1: MealReminder;
    lunch: MealReminder;
    snack2: MealReminder;
    dinner: MealReminder;
}

const MEALS = [
    {
        key: 'breakfast' as keyof MealReminders,
        icon: 'free-breakfast',
        en: 'Breakfast',
        ar: 'الإفطار',
        iconBg: '#EFF6FF',
        iconColor: COLORS.primaryBlue,
        defaultTime: '08:00'
    },
    {
        key: 'snack1' as keyof MealReminders,
        icon: 'cookie',
        en: 'Snacks',
        ar: 'الوجبات الخفيفة',
        iconBg: '#F3F4F6',
        iconColor: COLORS.textSecondary,
        defaultTime: '16:00'
    },
    {
        key: 'lunch' as keyof MealReminders,
        icon: 'lunch-dining',
        en: 'Lunch',
        ar: 'الغداء',
        iconBg: '#ECFEFF',
        iconColor: COLORS.primaryCyan,
        defaultTime: '13:00'
    },
    {
        key: 'snack2' as keyof MealReminders,
        icon: 'cookie',
        en: 'Snacks',
        ar: 'الوجبات الخفيفة',
        iconBg: '#F3F4F6',
        iconColor: COLORS.textSecondary,
        defaultTime: '16:00'
    },
    {
        key: 'dinner' as keyof MealReminders,
        icon: 'dinner-dining',
        en: 'Dinner',
        ar: 'العشاء',
        iconBg: '#EEF2FF',
        iconColor: '#6366F1',
        defaultTime: '19:00'
    },
];

const MealRemindersScreen = () => {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const token = useAppSelector(selectToken);
    const notificationSettings = useAppSelector(selectNotificationSettings);

    const normalizeSchedule = useCallback((schedule?: MealRemindersSchedule): MealReminders => {
        const fallback = DEFAULT_NOTIFICATION_SETTINGS.mealRemindersSchedule as MealRemindersSchedule;
        return {
            breakfast: schedule?.breakfast || fallback.breakfast,
            snack1: schedule?.snack1 || fallback.snack1,
            lunch: schedule?.lunch || fallback.lunch,
            snack2: schedule?.snack2 || fallback.snack2,
            dinner: schedule?.dinner || fallback.dinner,
        };
    }, []);

    // State for each meal
    const [reminders, setReminders] = useState<MealReminders>({
        breakfast: { enabled: true, time: '08:00' },
        snack1: { enabled: false, time: '11:00' },
        lunch: { enabled: true, time: '13:00' },
        snack2: { enabled: false, time: '16:00' },
        dinner: { enabled: true, time: '19:00' },
    });
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [editingMeal, setEditingMeal] = useState<keyof MealReminders | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [mealSettings, setMealSettings] = useState<MealReminders | null>(null);

    useEffect(() => {
        const normalized = normalizeSchedule(notificationSettings.mealRemindersSchedule);
        setMealSettings(normalized);
    }, [normalizeSchedule, notificationSettings.mealRemindersSchedule]);

    useEffect(() => {
        if (mealSettings) {
            setReminders(mealSettings);
        }
    }, [mealSettings]);

    const formatTime = (timeString: string) => {
        const [hours, minutes] = timeString.split(':').map(Number);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    };

    const parseTimeToDate = (timeString: string) => {
        const [hours, minutes] = timeString.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
    };

    const handleToggle = (mealKey: keyof MealReminders) => {
        setReminders(prev => ({
            ...prev,
            [mealKey]: { ...prev[mealKey], enabled: !prev[mealKey].enabled }
        }));
    };

    const openTimePicker = (mealKey: keyof MealReminders) => {
        if (!reminders[mealKey].enabled) return;
        setEditingMeal(mealKey);
        setShowTimePicker(true);
    };

    const handleTimeChange = (event: any, selectedDate?: Date) => {
        if (selectedDate && editingMeal) {
            const hours = selectedDate.getHours().toString().padStart(2, '0');
            const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
            setReminders(prev => ({
                ...prev,
                [editingMeal]: { ...prev[editingMeal], time: `${hours}:${minutes}` }
            }));
        }
        if (Platform.OS !== 'ios') {
            setShowTimePicker(false);
            setEditingMeal(null);
        }
    };

    const closeTimePicker = () => {
        setShowTimePicker(false);
        setEditingMeal(null);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const schedule: MealRemindersSchedule = {
                breakfast: reminders.breakfast,
                snack1: reminders.snack1,
                lunch: reminders.lunch,
                snack2: reminders.snack2,
                dinner: reminders.dinner,
            };
            const hasAnyEnabled = Object.values(schedule).some((meal) => meal.enabled);
            const firstEnabled = Object.values(schedule).find((meal) => meal.enabled);
            const mealReminderTime = firstEnabled?.time || DEFAULT_NOTIFICATION_SETTINGS.mealReminderTime;
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

            if (token) {
                await updateClientProfile({
                    notificationSettings: {
                        mealReminders: hasAnyEnabled,
                        weeklyCheckin: notificationSettings.weeklyCheckin,
                        coachMessages: notificationSettings.coachMessages,
                        mealReminderTime,
                        timezone,
                        mealRemindersSchedule: schedule,
                    },
                }, token);
            }

            dispatch(updateNotificationSettings({
                mealReminders: hasAnyEnabled,
                mealReminderTime,
                timezone,
                mealRemindersSchedule: schedule,
                pushEnabled: Boolean(
                    hasAnyEnabled || notificationSettings.weeklyCheckin || notificationSettings.coachMessages
                ),
            }));

            Alert.alert(
                isRTL ? 'تم الحفظ' : 'Saved',
                isRTL ? 'تم حفظ إعدادات تذكيرات الوجبات' : 'Meal reminder settings saved',
                [{ text: isRTL ? 'حسناً' : 'OK', onPress: () => router.back() }]
            );
        } catch (error) {
            console.error('Failed to save meal reminder settings:', error);
            Alert.alert(isRTL ? 'خطأ' : 'Error', isRTL ? 'فشل حفظ الإعدادات' : 'Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerButton} />
                <Text style={styles.headerTitle}>
                    {isRTL ? 'تذكيرات الوجبات' : 'Meal Reminders'}
                </Text>
                <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
                    <MaterialIcons name="arrow-forward" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Description */}
                <Text style={styles.description}>
                    {isRTL
                        ? 'حدد تذكيرات لتتبع وجباتك في الوقت المحدد. التوقيت المنتظم يساعد في تحسين عملية الأيض.'
                        : 'Set reminders to track your meals on time. Consistent timing helps improve metabolism.'}
                </Text>

                {/* Meal Cards */}
                {MEALS.map((meal) => {
                    const mealData = reminders[meal.key];
                    const isDisabled = !mealData.enabled;

                    return (
                        <View key={meal.key} style={[styles.mealCard, isDisabled && styles.mealCardDisabled]}>
                            {/* Header with icon and toggle */}
                            <View style={styles.mealHeader}>
                                <Switch
                                    value={mealData.enabled}
                                    onValueChange={() => handleToggle(meal.key)}
                                    trackColor={{ false: '#E1E8EF', true: COLORS.primaryBlue }}
                                    thumbColor="#FFFFFF"
                                    style={{ transform: [{ scaleX: -1 }] }}
                                />
                                <View style={styles.mealInfo}>
                                    <View style={[styles.mealIcon, { backgroundColor: meal.iconBg }]}>
                                        <MaterialIcons name={meal.icon as any} size={24} color={meal.iconColor} />
                                    </View>
                                    <Text style={styles.mealTitle}>{isRTL ? meal.ar : meal.en}</Text>
                                </View>
                            </View>

                            {/* Time Selector */}
                            <View style={[styles.timeSection, isDisabled && styles.timeSectionDisabled]}>
                                <Text style={styles.timeLabel}>
                                    {isRTL ? 'وقت التذكير' : 'REMINDER TIME'}
                                </Text>
                                <TouchableOpacity
                                    style={[styles.timeButton, isDisabled && styles.timeButtonDisabled]}
                                    onPress={() => openTimePicker(meal.key)}
                                    disabled={isDisabled}
                                >
                                    <MaterialIcons
                                        name="schedule"
                                        size={20}
                                        color={isDisabled ? COLORS.textTertiary : COLORS.textSecondary}
                                    />
                                    <Text style={[styles.timeButtonText, isDisabled && styles.timeButtonTextDisabled]}>
                                        {formatTime(mealData.time)}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                })}
            </ScrollView>

            {/* Save Button */}
            <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
                <TouchableOpacity onPress={handleSave} disabled={isSaving}>
                    <LinearGradient
                        colors={[COLORS.primaryBlue, COLORS.primaryCyan]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.saveButton}
                    >
                        {isSaving ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <View style={styles.saveButtonContent}>
                                <MaterialIcons name="check-circle" size={22} color="#FFFFFF" />
                                <Text style={styles.saveButtonText}>
                                    {isRTL ? 'حفظ تذكيرات الوجبات' : 'Save Meal Reminders'}
                                </Text>
                            </View>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* Time Picker Modal */}
            {showTimePicker && editingMeal && (
                Platform.OS === 'ios' ? (
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={showTimePicker}
                        onRequestClose={closeTimePicker}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.pickerContainer}>
                                <View style={styles.pickerHeader}>
                                    <TouchableOpacity onPress={closeTimePicker} style={styles.doneButton}>
                                        <Text style={styles.doneButtonText}>{isRTL ? 'تم' : 'Done'}</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.pickerTitle}>
                                        {isRTL ? MEALS.find(m => m.key === editingMeal)?.ar : MEALS.find(m => m.key === editingMeal)?.en}
                                    </Text>

                                </View>
                                <DateTimePicker
                                    style={{ alignSelf: 'center' }}
                                    value={parseTimeToDate(reminders[editingMeal].time)}
                                    mode="time"
                                    is24Hour={false}
                                    display="spinner"
                                    onChange={handleTimeChange}
                                    textColor={COLORS.textPrimary}
                                />
                            </View>
                        </View>
                    </Modal>
                ) : (
                    <DateTimePicker
                        value={parseTimeToDate(reminders[editingMeal].time)}
                        mode="time"
                        is24Hour={false}
                        display="default"
                        onChange={handleTimeChange}
                    />
                )
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgScreen,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: 'rgba(248, 249, 250, 0.8)',
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
        flex: 1,
        textAlign: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 150,
        gap: 20,
    },
    description: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        paddingHorizontal: 16,
        lineHeight: 20,
    },

    // Meal Card
    mealCard: {
        backgroundColor: COLORS.bgCard,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    mealCardDisabled: {
        opacity: 0.8,
    },
    mealHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    mealInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    mealIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mealTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },

    // Time Section
    timeSection: {
        gap: 8,
    },
    timeSectionDisabled: {
        opacity: 0.5,
    },
    timeLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.textSecondary,
        letterSpacing: 1, textAlign: 'right'
    },
    timeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.bgScreen,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    timeButtonDisabled: {
        backgroundColor: '#F3F4F6',
    },
    timeButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    timeButtonTextDisabled: {
        color: COLORS.textTertiary,
    },

    // Bottom Bar
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: COLORS.bgCard,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.05,
                shadowRadius: 6,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    saveButton: {
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: COLORS.primaryBlue,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    saveButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    saveButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    // Picker Modal
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    pickerContainer: {
        backgroundColor: COLORS.bgCard,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 40,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    pickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    pickerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    doneButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#EFF6FF',
        borderRadius: 8,
    },
    doneButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.primaryBlue,
    },
});

export default MealRemindersScreen;
