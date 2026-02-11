import { colors } from '@/src/core/constants/Theme';
import { isRTL } from '@/src/core/constants/translation';
import { FontAwesome6, MaterialIcons } from '@expo/vector-icons';
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
import { useAppDispatch, useAppSelector } from '@/src/shared/store';
import { selectToken } from '@/src/shared/store/selectors/auth.selectors';
import { selectNotificationSettings, updateNotificationSettings } from '@/src/shared/store/slices/profileSlice';
import { getClientProfile, updateClientProfile } from '@/src/shared/services/backend/api';

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

const DAYS = [
    { key: 'sat', en: 'Sat', ar: 'السبت' },
    { key: 'sun', en: 'Sun', ar: 'الأحد' },
    { key: 'mon', en: 'Mon', ar: 'الإثنين' },
    { key: 'tue', en: 'Tue', ar: 'الثلاثاء' },
    { key: 'wed', en: 'Wed', ar: 'الأربعاء' },
    { key: 'thu', en: 'Thu', ar: 'الخميس' },
    { key: 'fri', en: 'Fri', ar: 'الجمعة' },
];

const WeeklyCheckinScreen = () => {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const token = useAppSelector(selectToken);
    const notificationSettings = useAppSelector(selectNotificationSettings);

    // State
    const [isEnabled, setIsEnabled] = useState(true);
    const [selectedDay, setSelectedDay] = useState('thu');
    const [reminderTime, setReminderTime] = useState(new Date(2024, 0, 1, 9, 0));
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const parseTimeToDate = (timeString: string) => {
        const [hours, minutes] = timeString.split(':').map(Number);
        if (Number.isNaN(hours) || Number.isNaN(minutes)) {
            return new Date(2024, 0, 1, 9, 0);
        }
        const date = new Date(2024, 0, 1, 0, 0, 0, 0);
        date.setHours(hours, minutes, 0, 0);
        return date;
    };

    // Fetch settings on mount
    useEffect(() => {
        const fetchSettings = async () => {
            if (!token) {
                setIsLoading(false);
                return;
            }
            try {
                const response = await getClientProfile(token);
                const normalized = (response as any)?.data && typeof (response as any).data === 'object'
                    ? (response as any).data
                    : response;

                const backendNotifications = normalized?.notificationSettings || {};
                const mealReminders = backendNotifications.mealReminders ?? notificationSettings.mealReminders;
                const weeklyCheckin = backendNotifications.weeklyCheckin ?? notificationSettings.weeklyCheckin;
                const coachMessages = backendNotifications.coachMessages ?? notificationSettings.coachMessages;
                const mealReminderTime = typeof backendNotifications.mealReminderTime === 'string'
                    ? backendNotifications.mealReminderTime
                    : notificationSettings.mealReminderTime;

                dispatch(updateNotificationSettings({
                    pushEnabled: Boolean(mealReminders || weeklyCheckin || coachMessages),
                    mealReminders,
                    weeklyCheckin,
                    coachMessages,
                    mealReminderTime,
                }));

                const backendDay = normalized?.weeklyCheckinDay;
                const backendTime = normalized?.weeklyCheckinTime;
                const backendEnabled = normalized?.weeklyCheckinEnabled;

                if (typeof backendEnabled === 'boolean') {
                    setIsEnabled(backendEnabled);
                } else if (typeof weeklyCheckin === 'boolean') {
                    setIsEnabled(weeklyCheckin);
                }

                if (typeof backendDay === 'string' && DAYS.some(day => day.key === backendDay)) {
                    setSelectedDay(backendDay);
                }

                if (typeof backendTime === 'string') {
                    setReminderTime(parseTimeToDate(backendTime));
                }
            } catch (error) {
                console.error('Failed to fetch weekly check-in settings:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, [dispatch, token]);

    // Update settings via backend
    const updateWeeklyCheckin = useCallback(async (settings: { enabled: boolean; day: string; time: string }) => {
        if (!token) {
            throw new Error('Missing auth token');
        }

        const nextNotifications = {
            ...notificationSettings,
            weeklyCheckin: settings.enabled,
        };
        nextNotifications.pushEnabled = Boolean(
            nextNotifications.mealReminders || nextNotifications.weeklyCheckin || nextNotifications.coachMessages
        );

        dispatch(updateNotificationSettings(nextNotifications));

        await updateClientProfile({
            weeklyCheckinEnabled: settings.enabled,
            weeklyCheckinDay: settings.day,
            weeklyCheckinTime: settings.time,
            notificationSettings: {
                mealReminders: nextNotifications.mealReminders,
                weeklyCheckin: nextNotifications.weeklyCheckin,
                coachMessages: nextNotifications.coachMessages,
                mealReminderTime: nextNotifications.mealReminderTime,
            },
        }, token);
    }, [dispatch, notificationSettings, token]);

    const formatTime = (date: Date) => {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        const displayMinutes = minutes.toString().padStart(2, '0');
        return `${displayHours.toString().padStart(2, '0')}:${displayMinutes} ${ampm}`;
    };

    const handleTimeChange = (event: any, selectedDate?: Date) => {
        if (selectedDate) {
            setReminderTime(selectedDate);
        }
        if (Platform.OS !== 'ios') {
            setShowTimePicker(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const hours = reminderTime.getHours().toString().padStart(2, '0');
            const minutes = reminderTime.getMinutes().toString().padStart(2, '0');
            const timeString = `${hours}:${minutes}`;

            await updateWeeklyCheckin({
                enabled: isEnabled,
                day: selectedDay,
                time: timeString,
            });

            Alert.alert(
                isRTL ? 'تم الحفظ' : 'Saved',
                isRTL ? 'تم حفظ إعدادات التذكير الأسبوعي' : 'Weekly check-in settings saved',
                [{ text: isRTL ? 'حسناً' : 'OK', onPress: () => router.back() }]
            );
        } catch (error) {
            console.error('Failed to save weekly check-in settings:', error);
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
                    {isRTL ? 'تذكير الوزن الأسبوعي' : 'Weekly Weight Check-In'}
                </Text>
                <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
                    <MaterialIcons name="arrow-forward" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Main Card */}
                <View style={styles.card}>
                    {/* Header Section with Toggle */}
                    <View style={styles.cardHeader}>
                        <Switch
                            value={isEnabled}
                            onValueChange={setIsEnabled}
                            trackColor={{ false: '#E1E8EF', true: COLORS.primaryBlue }}
                            thumbColor="#FFFFFF"
                            style={{ transform: [{ scaleX: -1 }] }}
                        />
                        <View>
                            <Text style={styles.cardTitle}>
                                {isRTL ? 'تذكير الوزن' : 'Weight Reminder'}
                            </Text>
                            <Text style={styles.cardSubtitle}>
                                {isRTL ? 'احصل على إشعار لتحديث تقدمك' : 'Get notified to update your progress'}
                            </Text>
                        </View>

                    </View>

                    {/* Settings Section */}
                    <View style={styles.cardContent}>
                        {/* Day Selector */}
                        <View style={styles.settingSection}>
                            <Text style={styles.settingLabel}>
                                {isRTL ? 'يوم التذكير' : 'Reminder Day'}
                            </Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.daysScroll}
                                contentContainerStyle={styles.daysContainer}
                            >
                                {(isRTL ? [...DAYS].reverse() : DAYS).map((day) => (
                                    <TouchableOpacity
                                        key={day.key}
                                        onPress={() => setSelectedDay(day.key)}
                                        style={styles.dayButtonWrapper}
                                    >
                                        {selectedDay === day.key ? (
                                            <LinearGradient
                                                colors={[COLORS.primaryBlue, COLORS.primaryCyan]}
                                                style={styles.dayButtonActive}
                                            >
                                                <Text style={styles.dayButtonTextActive}>
                                                    {isRTL ? day.ar : day.en}
                                                </Text>
                                            </LinearGradient>
                                        ) : (
                                            <View style={styles.dayButton}>
                                                <Text style={styles.dayButtonText}>
                                                    {isRTL ? day.ar : day.en}
                                                </Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Time Selector */}
                        <View style={styles.settingSection}>
                            <Text style={styles.settingLabel}>
                                {isRTL ? 'وقت التذكير' : 'Reminder Time'}
                            </Text>
                            <TouchableOpacity
                                style={styles.timeButton}
                                onPress={() => setShowTimePicker(true)}
                            >
                                <View style={styles.timeIconWrapper}>
                                    <MaterialIcons name="schedule" size={20} color={COLORS.textTertiary} />
                                </View>
                                <Text style={styles.timeButtonText}>{formatTime(reminderTime)}</Text>

                            </TouchableOpacity>
                        </View>

                        {/* Message Preview */}
                        <View style={styles.settingSection}>
                            <Text style={styles.settingLabel}>
                                {isRTL ? 'معاينة الرسالة' : 'Message Preview'}
                            </Text>
                            <View style={styles.messagePreview}>
                                <View style={styles.messageContent}>
                                    <View style={styles.messageMeta}>
                                        <Text style={styles.messageTime}>• {isRTL ? 'الآن' : 'Now'}</Text>
                                        <Text style={styles.messageSender}>WellFitGo</Text>

                                    </View>
                                    <Text style={styles.messageText}>
                                        {isRTL
                                            ? 'بنفكرك بمعاد الوزن الاسبوعي سجل وزنك الجديد و الدكتور هيبعتلك الدايت'
                                            : 'Time to check your weight and track your progress.'}
                                    </Text>
                                </View>
                                <View style={styles.messageIcon}>
                                    <FontAwesome6 name={'weight-scale'} size={18} color={colors.primaryDark} />
                                </View>

                            </View>
                        </View>
                    </View>
                </View>

                {/* Helper Text */}
                <Text style={styles.helperText}>
                    {isRTL
                        ? 'التتبع المستمر يساعد دكتورك على تعديل خطتك بدقة.'
                        : 'Consistent tracking helps your coach adjust your plan accurately.'}
                </Text>
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
                            <Text style={styles.saveButtonText}>
                                {isRTL ? 'حفظ التذكير الأسبوعي' : 'Save Weekly Check-In'}
                            </Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* Time Picker Modal */}
            {showTimePicker && (
                Platform.OS === 'ios' ? (
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={showTimePicker}
                        onRequestClose={() => setShowTimePicker(false)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.pickerContainer}>
                                <View style={styles.pickerHeader}>
                                    <TouchableOpacity onPress={() => setShowTimePicker(false)} style={styles.doneButton}>
                                        <Text style={styles.doneButtonText}>{isRTL ? 'تم' : 'Done'}</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.pickerTitle}>
                                        {isRTL ? 'وقت التذكير' : 'Reminder Time'}
                                    </Text>
                                </View>
                                <DateTimePicker
                                    style={{ alignSelf: 'center' }}
                                    value={reminderTime}
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
                        value={reminderTime}
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
        borderBottomWidth: 1,
        borderBottomColor: 'transparent',
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
        paddingBottom: 120,
    },

    // Card
    card: {
        backgroundColor: COLORS.bgCard,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        overflow: 'hidden',
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
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 4,
        textAlign: 'right'
    },
    cardSubtitle: {
        fontSize: 12,
        fontWeight: '500',
        color: COLORS.textSecondary,
        textAlign: 'right'
    },
    cardContent: {
        padding: 20,
        gap: 24,
    },

    // Setting Sections
    settingSection: {
        gap: 12,
    },
    settingLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textPrimary,
        paddingLeft: 4,
        textAlign: 'right'

    },

    // Day Selector
    daysScroll: {
        marginHorizontal: -20,
    },
    daysContainer: {
        paddingHorizontal: 20,
        gap: 10,
    },
    dayButtonWrapper: {
        marginRight: 0,
    },
    dayButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: COLORS.bgScreen,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    dayButtonActive: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
    },
    dayButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    dayButtonTextActive: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    // Time Button
    timeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: COLORS.bgScreen,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    timeButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
        letterSpacing: -0.5,
    },
    timeIconWrapper: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.bgCard,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },

    // Message Preview
    messagePreview: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 14,
        padding: 16,
        backgroundColor: COLORS.bgScreen,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    messageIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.bgCard,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    messageContent: {
        flex: 1,
        paddingTop: 2,
    },
    messageMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
        justifyContent: 'flex-end'
    },
    messageSender: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    messageTime: {
        fontSize: 10,
        color: COLORS.textTertiary,
    },
    messageText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        lineHeight: 20,
        textAlign: 'right'
    },

    // Helper Text
    helperText: {
        fontSize: 12,
        color: COLORS.textTertiary,
        textAlign: 'center',
        marginTop: 16,
        paddingHorizontal: 40,
        lineHeight: 18,
    },

    // Bottom Bar
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
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
                shadowOpacity: 0.25,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    saveButtonText: {
        fontSize: 16,
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
        paddingHorizontal: 15,
        paddingVertical: 8,
        backgroundColor: '#EFF6FF',
        borderRadius: 30,
    },
    doneButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.primaryBlue,
    },
});

export default WeeklyCheckinScreen;
