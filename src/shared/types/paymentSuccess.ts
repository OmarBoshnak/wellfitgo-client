/**
 * Payment Success Types
 * @description TypeScript interfaces for payment success screen data
 */

/**
 * Payment success data returned after successful payment
 */
export interface PaymentSuccessData {
    /** Name of the subscription plan */
    planName: string;
    /** Amount paid in EGP */
    amount: number;
    /** Transaction ID for reference */
    transactionId: string;
    /** Payment date formatted string */
    date: string;
    /** Payment method used (e.g., "Apple Pay", "Visa ****1234") */
    paymentMethod: string;
    /** Optional URL to download receipt */
    receiptUrl?: string;
}

/**
 * Receipt item for accordion display
 */
export interface ReceiptItem {
    label: string;
    value: string;
}

/**
 * Success animation state
 */
export interface SuccessAnimationState {
    checkmark: boolean;
    title: boolean;
    image: boolean;
    receipt: boolean;
    actions: boolean;
}
