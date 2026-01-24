/**
 * Mock Data
 * @description Mock data for development and testing
 */

import { Doctor } from '@/src/shared/types/booking';

/**
 * Mock doctors list for development
 */
export const mockDoctors: Doctor[] = [
    {
        id: '1',
        name: 'Dr. Sarah Johnson',
        nameAr: 'د. سارة جونسون',
        specialty: 'Nutritionist',
        specialtyAr: 'أخصائية تغذية',
        avatar: undefined,
    },
    {
        id: '2',
        name: 'Dr. Ahmed Hassan',
        nameAr: 'د. أحمد حسن',
        specialty: 'Fitness Coach',
        specialtyAr: 'مدرب لياقة',
        avatar: undefined,
    },
    {
        id: '3',
        name: 'Dr. Maria Garcia',
        nameAr: 'د. ماريا غارسيا',
        specialty: 'Health Coach',
        specialtyAr: 'مدربة صحية',
        avatar: undefined,
    },
    {
        id: '4',
        name: 'Dr. Omar Khaled',
        nameAr: 'د. عمر خالد',
        specialty: 'Weight Management',
        specialtyAr: 'إدارة الوزن',
        avatar: undefined,
    },
    {
        id: '5',
        name: 'Dr. Fatima Ali',
        nameAr: 'د. فاطمة علي',
        specialty: 'Dietitian',
        specialtyAr: 'أخصائية حمية',
        avatar: undefined,
    },
];

/**
 * Get mock doctor by ID
 * @param id - Doctor ID
 * @returns Doctor or undefined
 */
export function getMockDoctorById(id: string): Doctor | undefined {
    return mockDoctors.find(doctor => doctor.id === id);
}

/**
 * Simulate async doctor fetch
 * @param delayMs - Delay in milliseconds
 * @returns Promise resolving to mock doctors
 */
export async function fetchMockDoctors(delayMs: number = 500): Promise<Doctor[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(mockDoctors);
        }, delayMs);
    });
}

/**
 * Simulate async booking submission
 * @param delayMs - Delay in milliseconds
 * @param shouldSucceed - Whether the booking should succeed
 * @returns Promise resolving to booking result
 */
export async function submitMockBooking(
    delayMs: number = 1000,
    shouldSucceed: boolean = true
): Promise<{ success: boolean; bookingId?: string; error?: string }> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (shouldSucceed) {
                resolve({
                    success: true,
                    bookingId: `booking_${Date.now()}`,
                });
            } else {
                reject({
                    success: false,
                    error: 'فشل في حجز الموعد. حاول مرة أخرى.',
                });
            }
        }, delayMs);
    });
}
