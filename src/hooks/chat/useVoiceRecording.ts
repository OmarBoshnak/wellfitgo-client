/**
 * useVoiceRecording Hook
 * @description Voice recording state machine with metering for waveform
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { audioRecorder } from '@/src/shared/utils/media';
import type { RecordingState, VoiceRecordingData } from '@/src/shared/types/chat';

// ============================================================================
// Types
// ============================================================================

export interface UseVoiceRecordingReturn {
    // States
    recordingState: RecordingState;
    duration: number;
    meteringValues: number[];
    // Actions
    startRecording: () => Promise<void>;
    pauseRecording: () => Promise<void>;
    resumeRecording: () => Promise<void>;
    stopRecording: () => Promise<{ uri: string; duration: number } | null>;
    cancelRecording: () => Promise<void>;
    // Helpers
    isRecording: boolean;
    isPaused: boolean;
    canSend: boolean;
}

// ============================================================================
// Hook
// ============================================================================

export function useVoiceRecording(): UseVoiceRecordingReturn {
    const [recordingState, setRecordingState] = useState<RecordingState>('idle');
    const [duration, setDuration] = useState(0);
    const [meteringValues, setMeteringValues] = useState<number[]>([]);
    const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const meteringIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    /**
     * Start duration timer
     */
    const startDurationTimer = useCallback(() => {
        if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current);
        }

        durationIntervalRef.current = setInterval(() => {
            setDuration(prev => prev + 0.1);
        }, 100);
    }, []);

    /**
     * Stop duration timer
     */
    const stopDurationTimer = useCallback(() => {
        if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current);
            durationIntervalRef.current = null;
        }
    }, []);

    /**
     * Start metering updates
     */
    const startMeteringUpdates = useCallback(() => {
        if (meteringIntervalRef.current) {
            clearInterval(meteringIntervalRef.current);
        }

        meteringIntervalRef.current = setInterval(async () => {
            const status = await audioRecorder.getStatus();
            if (status && status.meteringValues.length > meteringValues.length) {
                setMeteringValues([...status.meteringValues]);
            }
        }, 100);
    }, [meteringValues.length]);

    /**
     * Stop metering updates
     */
    const stopMeteringUpdates = useCallback(() => {
        if (meteringIntervalRef.current) {
            clearInterval(meteringIntervalRef.current);
            meteringIntervalRef.current = null;
        }
    }, []);

    /**
     * Start recording
     */
    const startRecording = useCallback(async (): Promise<void> => {
        try {
            setDuration(0);
            setMeteringValues([]);
            await audioRecorder.startRecording();
            setRecordingState('recording');
            startDurationTimer();
            startMeteringUpdates();
        } catch (error) {
            console.error('Failed to start recording:', error);
            setRecordingState('idle');
        }
    }, [startDurationTimer, startMeteringUpdates]);

    /**
     * Pause recording
     */
    const pauseRecording = useCallback(async (): Promise<void> => {
        try {
            await audioRecorder.pauseRecording();
            setRecordingState('paused');
            stopDurationTimer();
            stopMeteringUpdates();
        } catch (error) {
            console.error('Failed to pause recording:', error);
        }
    }, [stopDurationTimer, stopMeteringUpdates]);

    /**
     * Resume recording
     */
    const resumeRecording = useCallback(async (): Promise<void> => {
        try {
            await audioRecorder.resumeRecording();
            setRecordingState('recording');
            startDurationTimer();
            startMeteringUpdates();
        } catch (error) {
            console.error('Failed to resume recording:', error);
        }
    }, [startDurationTimer, startMeteringUpdates]);

    /**
     * Stop recording and return result
     */
    const stopRecording = useCallback(async (): Promise<{ uri: string; duration: number } | null> => {
        stopDurationTimer();
        stopMeteringUpdates();

        try {
            const result = await audioRecorder.stopRecording();
            setRecordingState('idle');

            if (result) {
                return {
                    uri: result.uri,
                    duration: result.duration || duration,
                };
            }
            return null;
        } catch (error) {
            console.error('Failed to stop recording:', error);
            setRecordingState('idle');
            return null;
        }
    }, [duration, stopDurationTimer, stopMeteringUpdates]);

    /**
     * Cancel recording without saving
     */
    const cancelRecording = useCallback(async (): Promise<void> => {
        stopDurationTimer();
        stopMeteringUpdates();

        try {
            await audioRecorder.cancelRecording();
        } catch {
            // Ignore cancel errors
        }

        setRecordingState('idle');
        setDuration(0);
        setMeteringValues([]);
    }, [stopDurationTimer, stopMeteringUpdates]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopDurationTimer();
            stopMeteringUpdates();
            audioRecorder.cancelRecording().catch(() => { });
        };
    }, [stopDurationTimer, stopMeteringUpdates]);

    // Computed values
    const isRecording = recordingState === 'recording';
    const isPaused = recordingState === 'paused';
    const canSend = (isRecording || isPaused) && duration >= 0.5; // Minimum 0.5 seconds

    return {
        recordingState,
        duration,
        meteringValues,
        startRecording,
        pauseRecording,
        resumeRecording,
        stopRecording,
        cancelRecording,
        isRecording,
        isPaused,
        canSend,
    };
}

export default useVoiceRecording;
