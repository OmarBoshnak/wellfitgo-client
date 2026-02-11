/**
 * Payment Types
 * @description Types and interfaces for payment system (Paymob)
 */

/** Payment screen route params */
export interface PaymentScreenParams {
    planId: string;
    price: string;
    planName?: string;
}

/** Checkout initiation response from backend */
export interface CheckoutResponse {
    paymentUrl: string;
    customerReference: string;
    paymentId: string;
    orderId: string;
    amount: number;
    currency: string;
}

/** Payment status polling response */
export interface PaymentStatusResponse {
    customerReference: string;
    paymentId: string;
    orderId: string;
    status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded';
    paymobTransactionId?: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    webhookReceived: boolean;
}
