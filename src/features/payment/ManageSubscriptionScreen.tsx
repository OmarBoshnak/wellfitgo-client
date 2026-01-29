import React, { useEffect, useMemo, useState } from 'react';
import {
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

import { colors } from '@/src/shared/core/constants/Theme';
import { isRTL } from '@/src/shared/core/constants/translation';

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

    const [isPaused, setIsPaused] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [subscription, setSubscription] = useState<any>(null);
    const [billingHistory, setBillingHistory] = useState<any[]>([]);

    useEffect(() => {
        setSubscription({
            planName: null,
            price: 'EGP 799',
            period: null,
            nextBillingDate: '2024-10-24',
            autoRenews: true,
        });
        setBillingHistory([
            { id: 'INV-2024-892', date: '2024-07-24', amount: 'EGP 799' },
            { id: 'INV-2024-432', date: '2024-04-24', amount: 'EGP 799' },
            { id: 'INV-2024-105', date: '2024-01-24', amount: 'EGP 799' },
        ]);
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const handlePauseSubscription = () => {
        Alert.alert(
            isRTL ? 'تنبيه' : 'Notice',
            isRTL
                ? 'يمكنك استخدام خاصية الإيقاف المؤقت مرة واحدة فقط وبحد أقصى شهرين'
                : 'You can only use the pause feature once and for a maximum of 2 months',
            [
                { text: isRTL ? 'إلغاء' : 'Cancel', style: 'cancel' },
                {
                    text: isRTL ? 'استمرار' : 'Continue',
                    onPress: () => {
                        setIsPaused(true);
                        Alert.alert(
                            isRTL ? 'تم' : 'Done',
                            isRTL ? 'تم إيقاف اشتراكك مؤقتاً' : 'Your subscription has been paused'
                        );
                    },
                },
            ]
        );
    };

    const handleResumeSubscription = () => {
        Alert.alert(
            isRTL ? 'استئناف الاشتراك' : 'Resume Subscription',
            isRTL
                ? 'هل أنت متأكد أنك تريد استئناف اشتراكك؟'
                : 'Are you sure you want to resume your subscription?',
            [
                { text: isRTL ? 'إلغاء' : 'Cancel', style: 'cancel' },
                {
                    text: isRTL ? 'استئناف' : 'Resume',
                    onPress: () => {
                        setIsPaused(false);
                        Alert.alert(
                            isRTL ? 'تم' : 'Done',
                            isRTL ? 'تم استئناف اشتراكك' : 'Your subscription has been resumed'
                        );
                    },
                },
            ]
        );
    };

    const handleCancelSubscription = () => {
        setShowCancelModal(true);
    };

    const confirmCancelSubscription = () => {
        setShowCancelModal(false);
        Alert.alert(isRTL ? 'تم' : 'Done', isRTL ? 'تم إلغاء اشتراكك' : 'Your subscription has been cancelled');
    };

    const handleDownloadInvoice = (invoiceId: string) => {
        Alert.alert(isRTL ? 'تحميل' : 'Download', `Invoice ${invoiceId}`);
    };

    const planName = useMemo(
        () => subscription?.planName || (isRTL ? 'الخطة التجريبية' : 'Trial Plan'),
        [subscription]
    );
    const planPrice = subscription?.price || 'EGP 799';
    const planPeriod = subscription?.period || (isRTL ? '3 أشهر' : '3 months');
    const nextBillingDate = subscription?.nextBillingDate || '2024-10-24';
    const autoRenews = subscription?.autoRenews !== false;

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
                            <Text style={styles.detailLabel}>
                                {isRTL ? 'تاريخ الفوترة التالي' : 'Next Billing Date'}
                            </Text>
                            <Text style={styles.detailValue}>{formatDate(nextBillingDate)}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>{isRTL ? 'الحالة' : 'Status'}</Text>
                            <View style={styles.statusBadge}>
                                <MaterialIcons name="autorenew" size={16} color={COLORS.success} />
                                <Text style={styles.statusText}>
                                    {autoRenews
                                        ? isRTL
                                            ? 'تجديد تلقائي'
                                            : 'Auto-renews'
                                        : isRTL
                                            ? 'لا يتجدد'
                                            : 'No auto-renew'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.featuresSection}>
                        <Text style={styles.featuresTitle}>
                            {isRTL ? 'الميزات المضمنة' : 'Included Features'}
                        </Text>
                        {FEATURES.map((feature, index) => (
                            <View key={`${feature.en}-${index}`} style={styles.featureRow}>
                                <MaterialIcons name="check-circle" size={20} color={COLORS.success} />
                                <Text style={styles.featureText}>
                                    {isRTL ? feature.ar : feature.en}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.card}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>
                            {isRTL ? 'سجل الفوترة' : 'Billing History'}
                        </Text>
                    </View>
                    <View style={styles.billingList}>
                        {(billingHistory.length > 0
                            ? billingHistory
                            : [
                                { id: 'INV-2024-892', date: '2024-07-24', amount: 'EGP 799' },
                                { id: 'INV-2024-432', date: '2024-04-24', amount: 'EGP 799' },
                                { id: 'INV-2024-105', date: '2024-01-24', amount: 'EGP 799' },
                            ]
                        ).map((invoice: any, index: number) => (
                            <View
                                key={invoice.id}
                                style={[styles.billingRow, index > 0 && styles.billingRowBorder]}
                            >
                                <View>
                                    <Text style={styles.billingDate}>{formatDate(invoice.date)}</Text>
                                    <Text style={styles.billingId}>#{invoice.id}</Text>
                                </View>
                                <View style={styles.billingRight}>
                                    <Text style={styles.billingAmount}>{invoice.amount}</Text>
                                    <TouchableOpacity
                                        style={styles.downloadButton}
                                        onPress={() => handleDownloadInvoice(invoice.id)}
                                    >
                                        <MaterialIcons
                                            name="download"
                                            size={16}
                                            color={COLORS.primaryBlue}
                                        />
                                        <Text style={styles.downloadText}>
                                            {isRTL ? 'تحميل الفاتورة' : 'Download Invoice'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>{isRTL ? 'الإجراءات' : 'Actions'}</Text>
                    <View style={styles.actionsContainer}>
                        {isPaused ?
                            (
                                <TouchableOpacity
                                    style={styles.pauseButton}
                                    onPress={handleResumeSubscription}
                                >
                                    <MaterialIcons
                                        name="play-arrow"
                                        size={20}
                                        color={COLORS.primaryBlue}
                                    />
                                    <Text style={styles.pauseButtonText}>
                                        {isRTL ? 'استئناف الاشتراك' : 'Resume Subscription'}
                                    </Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    style={styles.pauseButton}
                                    onPress={handlePauseSubscription}
                                >
                                    <MaterialIcons
                                        name="pause"
                                        size={20}
                                        color={COLORS.primaryBlue}
                                    />
                                    <Text style={styles.pauseButtonText}>
                                        {isRTL ? 'إيقاف الاشتراك مؤقتاً' : 'Pause Subscription'}
                                    </Text>
                                </TouchableOpacity>
                            )}

                        <TouchableOpacity style={styles.cancelButton} onPress={handleCancelSubscription}>
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
            </ScrollView>

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
    },
    planPrice: {
        fontSize: 16,
        color: COLORS.textPrimary,
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
    downloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    downloadText: {
        fontSize: 12,
        fontWeight: '500',
        color: COLORS.primaryBlue,
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
