/**
 * useWeightProgress Hook
 * @description Handles weight progress calculations and formatting
 */

import { useMemo } from 'react';
import { useAppSelector } from '@/src/shared/store';
import { selectWeightData } from '@/src/shared/store/slices/homeSlice';
import { selectProfile } from '@/src/shared/store/slices/profileSlice';
import { WeightProgress, WeightEntry } from '@/src/shared/types/home';

/**
 * Compute ideal target weight from height (cm) and age using healthy BMI.
 * BMI targets: <30 yrs → 21.5, 30–49 → 22.0, 50+ → 23.0
 */
const computeIdealWeight = (heightCm?: number, age?: number): number | null => {
    if (!heightCm || heightCm <= 0) return null;
    const heightM = heightCm / 100;
    let targetBmi = 22.0;
    if (age && age < 30) targetBmi = 21.5;
    else if (age && age >= 50) targetBmi = 23.0;
    return Math.round(targetBmi * heightM * heightM * 10) / 10;
};

/**
 * Hook for weight progress data and calculations
 */
export function useWeightProgress() {
    const weightData = useAppSelector(selectWeightData);
    const profile = useAppSelector(selectProfile);

    // Calculate weight progress
    const progress = useMemo((): WeightProgress | null => {
        if (!weightData) return null;

        const { currentWeight, startWeight, history } = weightData;

        // Use BMI-based ideal weight when height is available, fallback to stored target
        const idealTarget = computeIdealWeight(profile?.height, profile?.age);
        const targetWeight = idealTarget ?? weightData.targetWeight;

        const totalToLose = startWeight - targetWeight;
        const actuallyLost = startWeight - currentWeight;
        const progressPercentage = totalToLose > 0
            ? Math.min(Math.round((actuallyLost / totalToLose) * 100), 100)
            : 0;

        // Calculate trend
        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (history.length >= 2) {
            const last = history[history.length - 1].weight;
            const prev = history[history.length - 2].weight;
            if (last < prev - 0.1) trend = 'down';
            else if (last > prev + 0.1) trend = 'up';
        }

        return {
            currentWeight,
            targetWeight,
            startWeight,
            progressPercentage,
            totalLost: Math.max(actuallyLost, 0),
            remainingToGoal: Math.max(currentWeight - targetWeight, 0),
            weeklyData: history.slice(-7),
            trend,
        };
    }, [weightData, profile]);

    // Get weekly average
    const weeklyAverage = useMemo(() => {
        if (!progress || progress.weeklyData.length === 0) return 0;
        const sum = progress.weeklyData.reduce((acc, entry) => acc + entry.weight, 0);
        return Math.round((sum / progress.weeklyData.length) * 10) / 10;
    }, [progress]);

    // Get weekly change
    const weeklyChange = useMemo(() => {
        if (!progress || progress.weeklyData.length < 2) return 0;
        const first = progress.weeklyData[0].weight;
        const last = progress.weeklyData[progress.weeklyData.length - 1].weight;
        return Math.round((last - first) * 10) / 10;
    }, [progress]);

    // Format weight with unit
    const formatWeight = (weight: number, unit: 'kg' | 'lb' = 'kg'): string => {
        return `${weight.toFixed(1)} ${unit === 'kg' ? 'كجم' : 'رطل'}`;
    };

    // Get chart data formatted for visualization
    const chartData = useMemo((): { label: string; value: number }[] => {
        if (!progress) return [];

        const days = ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'];

        return progress.weeklyData.map((entry) => {
            const date = new Date(entry.date);
            return {
                label: days[date.getDay()],
                value: entry.weight,
            };
        });
    }, [progress]);

    return {
        progress,
        weeklyAverage,
        weeklyChange,
        chartData,
        formatWeight,
        isLoading: !weightData,
    };
}

export default useWeightProgress;
