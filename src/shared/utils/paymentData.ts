/**
 * Payment Data
 * @description Mock data for saved cards and payment simulation
 */

import { SavedCard } from '@/src/shared/types/payment';

/**
 * Mock saved cards
 */
export const mockSavedCards: SavedCard[] = [
    {
        id: 'card_1',
        type: 'visa',
        last4: '4242',
        expiry: '12/26',
        holderName: 'أحمد محمد',
    },
    {
        id: 'card_2',
        type: 'mastercard',
        last4: '8888',
        expiry: '09/25',
        holderName: 'محمد علي',
    },
];

/**
 * Get saved cards (mock API)
 */
export async function fetchSavedCards(delayMs: number = 300): Promise<SavedCard[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(mockSavedCards);
        }, delayMs);
    });
}

/**
 * Delete saved card (mock API)
 */
export async function deleteSavedCard(
    cardId: string,
    delayMs: number = 500
): Promise<{ success: boolean }> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ success: true });
        }, delayMs);
    });
}

/**
 * Process payment (mock API)
 */
export async function processPayment(
    params: {
        planId: string;
        cardId?: string;
        newCard?: {
            number: string;
            expiry: string;
            cvv: string;
            holderName: string;
        };
        saveCard?: boolean;
    },
    delayMs: number = 2000
): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulate success
            resolve({
                success: true,
                transactionId: `txn_${Date.now()}`,
            });
        }, delayMs);
    });
}
