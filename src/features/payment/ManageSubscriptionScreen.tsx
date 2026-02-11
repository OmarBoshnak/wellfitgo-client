import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { colors } from '@/src/shared/core/constants/Theme';
import { isRTL } from '@/src/shared/core/constants/translation';
import { useAppDispatch } from '@/src/shared/store';
import { setSubscription as setReduxSubscription } from '@/src/shared/store/slices/profileSlice';
import {
    getSubscriptionDetails,
    pauseSubscriptionApi,
    resumeSubscriptionApi,
    cancelSubscriptionApi,
    getBillingHistory,
} from '@/src/shared/services/backend/api';

const FEATURES = [
    { en: 'Personalized Nutrition Plan', ar: 'خطة تغذية مخصصة' },
    { en: 'Weekly Coach Check-ins', ar: 'متابعة أسبوعية مع الدكتور' },
    { en: 'Unlimited Chat Support', ar: 'دعم محادثة غير محدود' },
    { en: 'Access to Premium Recipes', ar: 'وصول للوصفات المميزة' },
];

const COLORS = {
    bgScreen: colors.bgSecondary,
    bgCard: colors.white,
    borderLight: colors.border,
    textPrimary: colors.textPrimary,
    textSecondary: colors.textSecondary,
    textTertiary: colors.gray,
    primaryBlue: colors.primaryDark,
    success: colors.success,
    successBg: `${colors.success}22`,
    error: colors.error,
};

const ManageSubscriptionScreen = () => {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const dispatch = useAppDispatch();

    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [subscription, setSubscription] = useState<any>(null);
    const [billingHistory, setBillingHistoryState] = useState<any[]>([]);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const token = await AsyncStorage.getItem('token');
            const [subRes, billRes] = await Promise.all([
                getSubscriptionDetails(token || undefined),
                getBillingHistory(token || undefined),
            ]);
            if (subRes?.success) setSubscription(subRes.data);
            if (billRes?.success) setBillingHistoryState(billRes.data || []);
        } catch (e) {
            Alert.alert(isRTL ? 'خطأ' : 'Error', isRTL ? 'فشل في تحميل بيانات الاشتراك' : 'Failed to load subscription data');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const syncReduxSubscription = useCallback((sub: any) => {
        if (!sub) return;
        dispatch(setReduxSubscription({
            id: '',
            planName: sub.planName || '',
            planNameAr: sub.planNameAr || '',
            status: sub.status === 'active' ? 'active' : sub.status === 'cancelled' ? 'cancelled' : sub.status === 'paused' ? 'inactive' : 'inactive',
            startDate: sub.startDate || '',
            nextBillingDate: sub.endDate || '',
            endDate: sub.endDate || '',
            price: sub.price || 0,
            currency: sub.currency || 'EGP',
            cancelAtPeriodEnd: sub.status === 'cancelled',
        }));
    }, [dispatch]);

    const formatDate = (dateString: string) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        return date.toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const handlePauseSubscription = useCallback(() => {
        Alert.alert(
            isRTL ? 'تنبيه' : 'Notice',
            isRTL ? 'يمكنك استخدام خاصية الإيقاف المؤقت مرة واحدة فقط وبحد أقصى شهرين' : 'You can only use the pause feature once and for a maximum of 2 months',
            [
                { text: isRTL ? 'إلغاء' : 'Cancel', style: 'cancel' },
                {
                    text: isRTL ? 'استمرار' : 'Continue',
                    onPress: async () => {
                        try {
                            setIsActionLoading(true);
                            const token = await AsyncStorage.getItem('token');
                            const res = await pauseSubscriptionApi(token || undefined);
                            if (res?.success) {
                                const updated = { ...subscription, status: 'paused', pauseUsed: true, pausedAt: res.data?.pausedAt };
                                setSubscription(updated);
                                syncReduxSubscription(updated);
                                Alert.alert(isRTL ? 'تم' : 'Done', res.message || (isRTL ? 'تم إيقاف اشتراكك مؤقتاً' : 'Subscription paused'));
                            } else {
                                Alert.alert(isRTL ? 'خطأ' : 'Error', res?.message || (isRTL ? 'فشل في إيقاف الاشتراك' : 'Failed to pause'));
                            }
                        } catch (e) {
                            Alert.alert(isRTL ? 'خطأ' : 'Error', (e as Error).message);
                        } finally {
                            setIsActionLoading(false);
                        }
                    },
                },
            ]
        );
    }, [subscription, syncReduxSubscription]);

    const handleResumeSubscription = useCallback(() => {
        Alert.alert(
            isRTL ? 'استئناف الاشتراك' : 'Resume Subscription',
            isRTL ? 'هل أنت متأكد أنك تريد استئناف اشتراكك؟' : 'Are you sure you want to resume your subscription?',
            [
                { text: isRTL ? 'إلغاء' : 'Cancel', style: 'cancel' },
                {
                    text: isRTL ? 'استئناف' : 'Resume',
                    onPress: async () => {
                        try {
                            setIsActionLoading(true);
                            const token = await AsyncStorage.getItem('token');
                            const res = await resumeSubscriptionApi(token || undefined);
                            if (res?.success) {
                                const updated = { ...subscription, status: 'active', pausedAt: null, endDate: res.data?.endDate, nextBillingDate: res.data?.endDate };
                                setSubscription(updated);
                                syncReduxSubscription(updated);
                                Alert.alert(isRTL ? 'تم' : 'Done', res.message || (isRTL ? 'تم استئناف اشتراكك' : 'Subscription resumed'));
                            } else {
                                Alert.alert(isRTL ? 'خطأ' : 'Error', res?.message || (isRTL ? 'فشل في استئناف الاشتراك' : 'Failed to resume'));
                            }
                        } catch (e) {
                            Alert.alert(isRTL ? 'خطأ' : 'Error', (e as Error).message);
                        } finally {
                            setIsActionLoading(false);
                        }
                    },
                },
            ]
        );
    }, [subscription, syncReduxSubscription]);

    const handleCancelSubscription = () => setShowCancelModal(true);

    const confirmCancelSubscription = useCallback(async () => {
        setShowCancelModal(false);
        try {
            setIsActionLoading(true);
            const token = await AsyncStorage.getItem('token');
            const res = await cancelSubscriptionApi(token || undefined);
            if (res?.success) {
                const updated = { ...subscription, status: 'cancelled' };
                setSubscription(updated);
                syncReduxSubscription(updated);
                Alert.alert(isRTL ? 'تم' : 'Done', res.message || (isRTL ? 'تم إلغاء اشتراكك' : 'Subscription cancelled'));
            } else {
                Alert.alert(isRTL ? 'خطأ' : 'Error', res?.message || (isRTL ? 'فشل في إلغاء الاشتراك' : 'Failed to cancel'));
            }
        } catch (e) {
            Alert.alert(isRTL ? 'خطأ' : 'Error', (e as Error).message);
        } finally {
            setIsActionLoading(false);
        }
    }, [subscription, syncReduxSubscription]);

    const isPaused = subscription?.status === 'paused';
    const isCancelled = subscription?.status === 'cancelled';
    const isActive = subscription?.status === 'active';
    const pauseUsed = subscription?.pauseUsed === true;

    const planName = useMemo(
        () => subscription?.planNameAr || subscription?.planName || (isRTL ? 'لا يوجد اشتراك' : 'No Subscription'),
        [subscription]
    );
    const planPrice = subscription ? `${subscription.currency || 'EGP'} ${subscription.price || 0}` : '—';
    const planPeriod = subscription?.period || '';
    const nextBillingDate = subscription?.nextBillingDate || '';
    const canPause = isActive && !pauseUsed;
    const canActOnSub = isActive || isPaused;

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <View style={styles.headerButton} />
                <Text style={styles.headerTitle}>
                    {isRTL ? 'إدارة الاشتراك' : 'Manage Subscription'}
                </Text>
                <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
                    <MaterialIcons
                        name={isRTL ? 'arrow-forward' : 'arrow-back'}
                        size={24}
                        color={COLORS.textPrimary}
                    />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primaryBlue} />
                </View>
            ) : (
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <View style={styles.card}>
                    <View style={styles.planHeader}>
                        <Text style={styles.planName}>{planName}</Text>
                        <Text style={styles.planPrice}>
                            {planPrice} / {planPeriod}
                        </Text>
                    </View>

                    <View style={styles.planDetails}>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailValue}>{formatDate(nextBillingDate)}</Text>
                            <Text style={styles.detailLabel}>
                                {isRTL ? 'تاريخ انتهاء الاشتراك' : 'Subscription End Date'}
                            </Text>
                        </View>
                        <View style={styles.detailRow}>
                            <View style={[styles.statusBadge, isCancelled && { backgroundColor: `${COLORS.error}22` }]}>
                                <MaterialIcons name={isPaused ? 'pause' : isCancelled ? 'cancel' : 'autorenew'} size={16} color={isCancelled ? COLORS.error : isPaused ? COLORS.textSecondary : COLORS.success} />
                                <Text style={[styles.statusText, isCancelled && { color: COLORS.error }, isPaused && { color: COLORS.textSecondary }]}>
                                    {isPaused ? (isRTL ? 'متوقف مؤقتاً' : 'Paused') : isCancelled ? (isRTL ? 'ملغى' : 'Cancelled') : isActive ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'غير نشط' : 'Inactive')}
                                </Text>
                            </View>
                            <Text style={styles.detailLabel}>{isRTL ? 'الحالة' : 'Status'}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.featuresSection}>
                        <Text style={styles.featuresTitle}>
                            {isRTL ? 'الميزات المضمنة' : 'Included Features'}
                        </Text>
                        {FEATURES.map((feature, index) => (
                            <View key={`${feature.en}-${index}`} style={styles.featureRow}>
                                <Text style={styles.featureText}>
                                    {isRTL ? feature.ar : feature.en}
                                </Text>
                                 <MaterialIcons name="check-circle" size={20} color={COLORS.success} />
                            </View>
                        ))}
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.upgradeButton}
                    onPress={() => router.push({ pathname: '/(auth)/subscription', params: { mode: 'upgrade' } } as never)}
                >
                    <MaterialIcons name="upgrade" size={20} color="#FFFFFF" />
                    <Text style={styles.upgradeButtonText}>
                        {isCancelled || subscription?.status === 'none'
                            ? (isRTL ? 'تجديد الاشتراك' : 'Renew Subscription')
                            : (isRTL ? 'ترقية / تغيير الخطة' : 'Upgrade / Change Plan')}
                    </Text>
                </TouchableOpacity>

                <View style={styles.card}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>
                            {isRTL ? 'سجل الاشتراكات' : 'Billing History'}
                        </Text>
                    </View>
                    <View style={styles.billingList}>
                        {billingHistory.length === 0 ? (
                            <Text style={styles.emptyText}>
                                {isRTL ? 'لا توجد مدفوعات سابقة' : 'No billing history'}
                            </Text>
                        ) : billingHistory.map((invoice: any, index: number) => (
                            <View
                                key={invoice.id}
                                style={[styles.billingRow, index > 0 && styles.billingRowBorder]}
                            >
                                <View style={styles.billingRight}>
                                    <Text style={styles.billingAmount}>
                                        {invoice.currency || 'EGP'} {invoice.amount}
                                    </Text>
                                    <Text style={styles.billingMethodText}>
                                        {invoice.paymentMethod === 'wallet' ? (isRTL ? 'محفظة' : 'Wallet') : (isRTL ? 'بطاقة' : 'Card')}
                                    </Text>
                                </View>
                                <View>
                                    <Text style={styles.billingDate}>{formatDate(invoice.date)}</Text>
                                    <Text style={styles.billingId}>#{invoice.transactionId || invoice.id.slice(-8)}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {canActOnSub && (
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>{isRTL ? 'الإجراءات' : 'Actions'}</Text>
                        <View style={styles.actionsContainer}>
                            {isPaused ? (
                                <TouchableOpacity
                                    style={[styles.pauseButton, isActionLoading && { opacity: 0.5 }]}
                                    onPress={handleResumeSubscription}
                                    disabled={isActionLoading}
                                >
                                    {isActionLoading ? <ActivityIndicator size="small" color={COLORS.primaryBlue} /> : <MaterialIcons name="play-arrow" size={20} color={COLORS.primaryBlue} />}
                                    <Text style={styles.pauseButtonText}>
                                        {isRTL ? 'استئناف الاشتراك' : 'Resume Subscription'}
                                    </Text>
                                </TouchableOpacity>
                            ) : canPause ? (
                                <TouchableOpacity
                                    style={[styles.pauseButton, isActionLoading && { opacity: 0.5 }]}
                                    onPress={handlePauseSubscription}
                                    disabled={isActionLoading}
                                >
                                    {isActionLoading ? <ActivityIndicator size="small" color={COLORS.primaryBlue} /> : <MaterialIcons name="pause" size={20} color={COLORS.primaryBlue} />}
                                    <Text style={styles.pauseButtonText}>
                                        {isRTL ? 'إيقاف الاشتراك مؤقتاً' : 'Pause Subscription'}
                                    </Text>
                                </TouchableOpacity>
                            ) : pauseUsed && isActive ? (
                                <View style={[styles.pauseButton, { opacity: 0.4 }]}>
                                    <MaterialIcons name="pause" size={20} color={COLORS.textSecondary} />
                                    <Text style={[styles.pauseButtonText, { color: COLORS.textSecondary }]}>
                                        {isRTL ? 'تم استخدام الإيقاف المؤقت' : 'Pause Already Used'}
                                    </Text>
                                </View>
                            ) : null}

                            <TouchableOpacity
                                style={[styles.cancelButton, isActionLoading && { opacity: 0.5 }]}
                                onPress={handleCancelSubscription}
                                disabled={isActionLoading}
                            >
                                <Text style={styles.cancelButtonText}>
                                    {isRTL ? 'إلغاء الاشتراك' : 'Cancel Subscription'}
                                </Text>
                            </TouchableOpacity>

                            <Text style={styles.disclaimer}>
                                {isRTL
                                    ? 'ستبقى خطتك نشطة حتى نهاية فترة الفوترة الحالية.'
                                    : 'Your plan will remain active until the end of the current billing cycle.'}
                            </Text>
                        </View>
                    </View>
                )}

                {isCancelled && (
                    <View style={styles.card}>
                        <Text style={[styles.disclaimer, { textAlign: 'center' }]}>
                            {isRTL
                                ? `تم إلغاء اشتراكك. ستبقى خطتك نشطة حتى ${formatDate(nextBillingDate)}.`
                                : `Your subscription has been cancelled. Your plan will remain active until ${formatDate(nextBillingDate)}.`}
                        </Text>
                    </View>
                )}
            </ScrollView>
            )}

            <Modal
                visible={showCancelModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowCancelModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {isRTL ? 'تأكيد الإلغاء' : 'Confirm Cancellation'}
                            </Text>
                            <Text style={styles.modalDescription}>
                                {isRTL
                                    ? `سينتهي اشتراكك في نهاية فترة الفوترة الحالية (${formatDate(nextBillingDate)}) ولن يتم تجديده تلقائياً. ستظل لديك إمكانية الوصول حتى ذلك الحين. هل أنت متأكد أنك تريد الإلغاء؟`
                                    : `Your subscription will end at the end of the current billing cycle (${formatDate(nextBillingDate)}) and will not auto-renew. You will still have access until then. Are you sure you want to cancel?`}
                            </Text>
                        </View>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.keepButton}
                                onPress={() => setShowCancelModal(false)}
                            >
                                <Text style={styles.keepButtonText}>
                                    {isRTL ? 'الإبقاء على الاشتراك' : 'Keep Subscription'}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.confirmCancelButton}
                                onPress={confirmCancelSubscription}
                            >
                                <Text style={styles.confirmCancelButtonText}>
                                    {isRTL ? 'إلغاء على أي حال' : 'Cancel Anyway'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
        backgroundColor: 'rgba(248, 249, 250, 0.95)',
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
        paddingBottom: 100,
        gap: 24,
    },
    card: {
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
    planHeader: {
        gap: 4,
    },
    planName: {
        fontSize: 20,
        fontWeight: '600',
        color: COLORS.textPrimary,
        textAlign:'right'
    },
    planPrice: {
        fontSize: 16,
        color: COLORS.textPrimary,
                textAlign:'right',
    },
    planDetails: {
        marginTop: 16,
        gap: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    detailLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    detailValue: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: COLORS.successBg,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.success,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.borderLight,
        marginVertical: 20,
    },
    featuresSection: {
        gap: 10,
    },
    featuresTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 4,
        textAlign:'right'
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    featureText: {
        fontSize: 14,
        color: COLORS.textPrimary,
        flex: 1,
        paddingTop: 2,
        textAlign:'right'
    },
    sectionHeader: {
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
        marginBottom: 0,
        marginHorizontal: -20,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 16,
        textAlign:'right'
    },
    billingList: {
        marginTop: 12,
    },
    billingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    billingRowBorder: {
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
    },
    billingDate: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign:'right'
    },
    billingId: {
        fontSize: 12,
        color: COLORS.textTertiary,
        marginTop: 2,
    },
    billingRight: {
        alignItems: 'flex-end',
        gap: 4,
    },
    billingAmount: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.textPrimary,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        paddingVertical: 16,
    },
    billingMethodText: {
        fontSize: 12,
        color: COLORS.textTertiary,
    },
    upgradeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 14,
        backgroundColor: COLORS.primaryBlue,
    },
    upgradeButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    actionsContainer: {
        gap: 12,
    },
    pauseButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: COLORS.primaryBlue,
        backgroundColor: 'transparent',
    },
    pauseButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    cancelButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 4,
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.error,
    },
    disclaimer: {
        fontSize: 12,
        color: COLORS.textSecondary,
        textAlign: 'center',
        paddingHorizontal: 16,
        paddingTop: 4,
        lineHeight: 18,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    modalContent: {
        width: '100%',
        maxWidth: 340,
        backgroundColor: COLORS.bgCard,
        borderRadius: 16,
        padding: 24,
        gap: 20,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    modalHeader: {
        alignItems: 'center',
        gap: 12,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textPrimary,
        textAlign: 'center',
    },
    modalDescription: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    keepButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.primaryBlue,
        alignItems: 'center',
        justifyContent: 'center',
    },
    keepButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    confirmCancelButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: COLORS.error,
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: COLORS.error,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    confirmCancelButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});

export default ManageSubscriptionScreen;
