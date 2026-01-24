/**
 * Card Utilities
 * @description Card formatting, validation, and type detection
 */

import { CardType, CardValidationErrors, NewCardForm } from '@/src/shared/types/payment';

/**
 * Format card number with spaces every 4 digits
 * @param value - Raw card number
 * @returns Formatted card number (0000 0000 0000 0000)
 */
export function formatCardNumber(value: string): string {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Limit to 16 digits
    const limited = digits.slice(0, 16);
    // Add space every 4 digits
    const formatted = limited.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted;
}

/**
 * Get raw card number (digits only)
 * @param formatted - Formatted card number
 * @returns Raw digits only
 */
export function getCardDigits(formatted: string): string {
    return formatted.replace(/\D/g, '');
}

/**
 * Detect card type from card number prefix
 * @param number - Card number (raw or formatted)
 * @returns Card type
 */
export function detectCardType(number: string): CardType {
    const digits = getCardDigits(number);

    if (!digits) return 'unknown';

    // Visa starts with 4
    if (digits.startsWith('4')) {
        return 'visa';
    }

    // Mastercard starts with 51-55 or 2221-2720
    const prefix2 = parseInt(digits.slice(0, 2), 10);
    const prefix4 = parseInt(digits.slice(0, 4), 10);

    if ((prefix2 >= 51 && prefix2 <= 55) || (prefix4 >= 2221 && prefix4 <= 2720)) {
        return 'mastercard';
    }

    return 'unknown';
}

/**
 * Format expiry date as MM/YY
 * @param value - Raw expiry input
 * @returns Formatted expiry (MM/YY)
 */
export function formatExpiry(value: string): string {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Limit to 4 digits
    const limited = digits.slice(0, 4);

    // Auto-format
    if (limited.length >= 2) {
        const month = limited.slice(0, 2);
        const year = limited.slice(2);

        // Validate month (01-12)
        const monthNum = parseInt(month, 10);
        if (monthNum > 12) {
            return '12' + (year ? '/' + year : '');
        }
        if (monthNum === 0 && month.length === 2) {
            return '01' + (year ? '/' + year : '');
        }

        return month + (year ? '/' + year : '');
    }

    return limited;
}

/**
 * Validate card number using Luhn algorithm
 * @param number - Card number (raw or formatted)
 * @returns True if valid
 */
export function validateCardNumber(number: string): boolean {
    const digits = getCardDigits(number);

    if (digits.length !== 16) {
        return false;
    }

    // Luhn algorithm
    let sum = 0;
    let isEven = false;

    for (let i = digits.length - 1; i >= 0; i--) {
        let digit = parseInt(digits[i], 10);

        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }

        sum += digit;
        isEven = !isEven;
    }

    return sum % 10 === 0;
}

/**
 * Validate expiry date is not in the past
 * @param expiry - Expiry in MM/YY format
 * @returns True if valid future date
 */
export function validateExpiry(expiry: string): boolean {
    const parts = expiry.split('/');
    if (parts.length !== 2) return false;

    const month = parseInt(parts[0], 10);
    const year = parseInt(parts[1], 10);

    if (isNaN(month) || isNaN(year)) return false;
    if (month < 1 || month > 12) return false;

    const now = new Date();
    const currentYear = now.getFullYear() % 100; // Get last 2 digits
    const currentMonth = now.getMonth() + 1;

    // Check year
    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;

    return true;
}

/**
 * Validate CVV (3-4 digits)
 * @param cvv - CVV input
 * @returns True if valid
 */
export function validateCVV(cvv: string): boolean {
    const digits = cvv.replace(/\D/g, '');
    return digits.length >= 3 && digits.length <= 4;
}

/**
 * Validate cardholder name
 * @param name - Cardholder name
 * @returns True if valid
 */
export function validateHolderName(name: string): boolean {
    const trimmed = name.trim();
    return trimmed.length >= 2 && /^[a-zA-Z\u0600-\u06FF\s]+$/.test(trimmed);
}

/**
 * Format CVV (digits only, max 4)
 * @param value - Raw CVV input
 * @returns Formatted CVV
 */
export function formatCVV(value: string): string {
    return value.replace(/\D/g, '').slice(0, 4);
}

/**
 * Validate entire card form
 * @param form - New card form data
 * @returns Validation errors object
 */
export function validateCardForm(form: NewCardForm): CardValidationErrors {
    const errors: CardValidationErrors = {};

    // Validate card number
    if (!form.number) {
        errors.number = 'رقم البطاقة مطلوب';
    } else if (getCardDigits(form.number).length < 16) {
        errors.number = 'رقم البطاقة غير مكتمل';
    } else if (!validateCardNumber(form.number)) {
        errors.number = 'رقم البطاقة غير صالح';
    }

    // Validate holder name
    if (!form.holderName) {
        errors.holderName = 'اسم حامل البطاقة مطلوب';
    } else if (!validateHolderName(form.holderName)) {
        errors.holderName = 'اسم غير صالح';
    }

    // Validate expiry
    if (!form.expiry) {
        errors.expiry = 'تاريخ الانتهاء مطلوب';
    } else if (form.expiry.length < 5) {
        errors.expiry = 'التاريخ غير مكتمل';
    } else if (!validateExpiry(form.expiry)) {
        errors.expiry = 'البطاقة منتهية الصلاحية';
    }

    // Validate CVV
    if (!form.cvv) {
        errors.cvv = 'رمز الأمان مطلوب';
    } else if (!validateCVV(form.cvv)) {
        errors.cvv = 'رمز الأمان غير صالح';
    }

    return errors;
}

/**
 * Check if form has any errors
 * @param errors - Validation errors object
 * @returns True if has errors
 */
export function hasCardErrors(errors: CardValidationErrors): boolean {
    return Object.keys(errors).length > 0;
}

/**
 * Check if form is complete (all fields filled)
 * @param form - New card form data
 * @returns True if complete
 */
export function isCardFormComplete(form: NewCardForm): boolean {
    return (
        getCardDigits(form.number).length === 16 &&
        form.holderName.trim().length > 0 &&
        form.expiry.length === 5 &&
        form.cvv.length >= 3
    );
}

/**
 * Get card brand display info
 * @param type - Card type
 * @returns Display label and color
 */
export function getCardBrandInfo(type: CardType): { label: string; labelAr: string; color: string } {
    switch (type) {
        case 'visa':
            return { label: 'Visa', labelAr: 'فيزا', color: '#1A1F71' };
        case 'mastercard':
            return { label: 'Mastercard', labelAr: 'ماستركارد', color: '#EB001B' };
        default:
            return { label: 'Card', labelAr: 'بطاقة', color: '#526477' };
    }
}

/**
 * Mask card number for display
 * @param last4 - Last 4 digits
 * @returns Masked card number
 */
export function maskCardNumber(last4: string): string {
    return `•••• •••• •••• ${last4}`;
}
