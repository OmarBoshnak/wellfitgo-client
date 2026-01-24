/**
 * Payment Types
 * @description Types and interfaces for payment system
 */

/** Card type (brand) */
export type CardType = 'visa' | 'mastercard' | 'unknown';

/** Saved card data */
export interface SavedCard {
    id: string;
    type: CardType;
    last4: string;
    expiry: string;
    holderName?: string;
}

/** New card form data */
export interface NewCardForm {
    number: string;
    holderName: string;
    expiry: string;
    cvv: string;
    saveCard: boolean;
}

/** Card validation errors */
export interface CardValidationErrors {
    number?: string;
    holderName?: string;
    expiry?: string;
    cvv?: string;
}

/** Payment method selection */
export type PaymentMethodType = 'saved' | 'new';

/** Payment state */
export interface PaymentState {
    selectedMethod: PaymentMethodType;
    selectedCardId: string | null;
    newCard: NewCardForm;
    errors: CardValidationErrors;
    isProcessing: boolean;
}

/** Default new card form */
export const DEFAULT_NEW_CARD_FORM: NewCardForm = {
    number: '',
    holderName: '',
    expiry: '',
    cvv: '',
    saveCard: true,
};

/** Payment screen route params */
export interface PaymentScreenParams {
    planId: string;
    price: string;
    planName?: string;
}
