/**
 * Payment Success Data Utilities
 * @description Mock data and helpers for payment success screen
 */

import { PaymentSuccessData, ReceiptItem } from '@/src/shared/types/paymentSuccess';

/**
 * Mock payment success data for development
 */
export const mockPaymentData: PaymentSuccessData = {
    planName: 'الخطة الفصلية',
    amount: 719,
    transactionId: '#TXN-882910',
    date: '24 أكتوبر 2023',
    paymentMethod: 'Apple Pay',
    receiptUrl: undefined,
};

/**
 * Convert PaymentSuccessData to receipt items for display
 */
export const getReceiptItems = (data: PaymentSuccessData): ReceiptItem[] => [
    { label: 'الخطة', value: data.planName },
    { label: 'المبلغ', value: `${data.amount} ج.م` },
    { label: 'رقم المعاملة', value: data.transactionId },
    { label: 'التاريخ', value: data.date },
    { label: 'طريقة الدفع', value: data.paymentMethod },
];

/**
 * Format currency amount
 */
export const formatCurrency = (amount: number): string => {
    return `${amount.toLocaleString('ar-EG')} ج.م`;
};

/**
 * Get success message based on plan
 */
export const getSuccessMessage = (planName: string): string => {
    return `تم تفعيل ${planName} بنجاح! 🎉`;
};

/**
 * Get welcome subtitle
 */
export const getWelcomeSubtitle = (): string => {
    return 'مرحباً بك في رحلتك نحو حياة صحية أفضل';
};
