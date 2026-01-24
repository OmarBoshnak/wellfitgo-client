/**
 * Audio Recorder Utilities
 * @description Voice recording and playback for chat messages
 */

import { Audio, AVPlaybackStatus, AVPlaybackStatusSuccess } from 'expo-av';
import type { RecordingState, VoiceRecordingData } from '@/src/shared/types/chat';

// ============================================================================
// Types
// ============================================================================

export interface AudioRecorderResult {
    uri: string;
    duration: number; // seconds
    meteringValues: number[];
}

export interface AudioPlaybackState {
    isPlaying: boolean;
    isLoaded: boolean;
    positionMillis: number;
    durationMillis: number;
    progress: number; // 0-1
}

// ============================================================================
// Constants
// ============================================================================

const RECORDING_OPTIONS: Audio.RecordingOptions = {
    android: {
        extension: '.m4a',
        outputFormat: Audio.AndroidOutputFormat.MPEG_4,
        audioEncoder: Audio.AndroidAudioEncoder.AAC,
        sampleRate: 44100,
        numberOfChannels: 1,
        bitRate: 128000,
    },
    ios: {
        extension: '.m4a',
        outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
        audioQuality: Audio.IOSAudioQuality.HIGH,
        sampleRate: 44100,
        numberOfChannels: 1,
        bitRate: 128000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
    },
    web: {
        mimeType: 'audio/webm',
        bitsPerSecond: 128000,
    },
};

// ============================================================================
// Permission Handling
// ============================================================================

/**
 * Request microphone permissions
 */
export const requestMicrophonePermission = async (): Promise<boolean> => {
    const { status } = await Audio.requestPermissionsAsync();
    return status === 'granted';
};

/**
 * Set audio mode for recording
 */
export const setAudioModeForRecording = async (): Promise<void> => {
    await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
    });
};

/**
 * Set audio mode for playback
 */
export const setAudioModeForPlayback = async (): Promise<void> => {
    await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
    });
};

// ============================================================================
// Recording Class
// ============================================================================

/**
 * Audio Recorder Manager Class
 * Handles voice recording lifecycle with metering for waveform visualization
 */
export class AudioRecorderManager {
    private recording: Audio.Recording | null = null;
    private meteringValues: number[] = [];
    private meteringInterval: ReturnType<typeof setInterval> | null = null;
    private startTime: number = 0;

    /**
     * Start recording
     */
    async startRecording(): Promise<void> {
        const hasPermission = await requestMicrophonePermission();
        if (!hasPermission) {
            throw new Error('Microphone permission not granted');
        }

        await setAudioModeForRecording();

        this.recording = new Audio.Recording();
        await this.recording.prepareToRecordAsync(RECORDING_OPTIONS);
        await this.recording.startAsync();

        this.startTime = Date.now();
        this.meteringValues = [];

        // Collect metering values for waveform (every 100ms)
        this.meteringInterval = setInterval(async () => {
            if (this.recording) {
                try {
                    const status = await this.recording.getStatusAsync();
                    if (status.isRecording && status.metering !== undefined) {
                        // Normalize metering value (-160 to 0) to 0-1 range
                        const normalized = Math.max(0, (status.metering + 60) / 60);
                        this.meteringValues.push(normalized);
                    }
                } catch {
                    // Recording might have stopped
                }
            }
        }, 100);
    }

    /**
     * Pause recording
     */
    async pauseRecording(): Promise<void> {
        if (this.recording) {
            await this.recording.pauseAsync();
        }
    }

    /**
     * Resume recording
     */
    async resumeRecording(): Promise<void> {
        if (this.recording) {
            await this.recording.startAsync();
        }
    }

    /**
     * Stop recording and get result
     */
    async stopRecording(): Promise<AudioRecorderResult | null> {
        if (this.meteringInterval) {
            clearInterval(this.meteringInterval);
            this.meteringInterval = null;
        }

        if (!this.recording) {
            return null;
        }

        try {
            const status = await this.recording.getStatusAsync();
            await this.recording.stopAndUnloadAsync();

            const uri = this.recording.getURI();
            const duration = status.durationMillis ? status.durationMillis / 1000 : 0;

            this.recording = null;

            if (!uri) {
                return null;
            }

            await setAudioModeForPlayback();

            return {
                uri,
                duration,
                meteringValues: this.meteringValues,
            };
        } catch (error) {
            this.recording = null;
            throw error;
        }
    }

    /**
     * Cancel recording without saving
     */
    async cancelRecording(): Promise<void> {
        if (this.meteringInterval) {
            clearInterval(this.meteringInterval);
            this.meteringInterval = null;
        }

        if (this.recording) {
            try {
                await this.recording.stopAndUnloadAsync();
            } catch {
                // Ignore errors on cancel
            }
            this.recording = null;
        }

        await setAudioModeForPlayback();
    }

    /**
     * Get current recording status
     */
    async getStatus(): Promise<VoiceRecordingData | null> {
        if (!this.recording) {
            return null;
        }

        try {
            const status = await this.recording.getStatusAsync();
            const duration = status.durationMillis ? status.durationMillis / 1000 : 0;

            let state: RecordingState = 'idle';
            if (status.isRecording) {
                state = 'recording';
            } else if (status.isDoneRecording) {
                state = 'stopped';
            } else if (duration > 0) {
                state = 'paused';
            }

            return {
                state,
                duration,
                meteringValues: this.meteringValues,
            };
        } catch {
            return null;
        }
    }

    /**
     * Check if currently recording
     */
    isRecording(): boolean {
        return this.recording !== null;
    }
}

// ============================================================================
// Playback Class
// ============================================================================

/**
 * Audio Player Manager Class
 * Handles voice message playback with progress tracking
 */
export class AudioPlayerManager {
    private sound: Audio.Sound | null = null;
    private onStatusUpdate: ((status: AudioPlaybackState) => void) | null = null;

    /**
     * Load and play audio
     */
    async loadAndPlay(
        uri: string,
        onStatusUpdate?: (status: AudioPlaybackState) => void
    ): Promise<void> {
        // Unload previous sound if exists
        await this.unload();

        this.onStatusUpdate = onStatusUpdate || null;
        await setAudioModeForPlayback();

        const { sound } = await Audio.Sound.createAsync(
            { uri },
            { shouldPlay: true },
            this.handleStatusUpdate
        );

        this.sound = sound;
    }

    /**
     * Handle playback status updates
     */
    private handleStatusUpdate = (status: AVPlaybackStatus) => {
        if (!status.isLoaded) {
            this.onStatusUpdate?.({
                isPlaying: false,
                isLoaded: false,
                positionMillis: 0,
                durationMillis: 0,
                progress: 0,
            });
            return;
        }

        const successStatus = status as AVPlaybackStatusSuccess;
        const progress = successStatus.durationMillis
            ? successStatus.positionMillis / successStatus.durationMillis
            : 0;

        this.onStatusUpdate?.({
            isPlaying: successStatus.isPlaying,
            isLoaded: true,
            positionMillis: successStatus.positionMillis,
            durationMillis: successStatus.durationMillis || 0,
            progress,
        });

        // Auto-cleanup when finished
        if (successStatus.didJustFinish) {
            this.unload();
        }
    };

    /**
     * Pause playback
     */
    async pause(): Promise<void> {
        if (this.sound) {
            await this.sound.pauseAsync();
        }
    }

    /**
     * Resume playback
     */
    async resume(): Promise<void> {
        if (this.sound) {
            await this.sound.playAsync();
        }
    }

    /**
     * Toggle play/pause
     */
    async togglePlayback(): Promise<void> {
        if (this.sound) {
            const status = await this.sound.getStatusAsync();
            if (status.isLoaded && status.isPlaying) {
                await this.pause();
            } else {
                await this.resume();
            }
        }
    }

    /**
     * Seek to position
     */
    async seekTo(positionMillis: number): Promise<void> {
        if (this.sound) {
            await this.sound.setPositionAsync(positionMillis);
        }
    }

    /**
     * Unload sound
     */
    async unload(): Promise<void> {
        if (this.sound) {
            try {
                await this.sound.unloadAsync();
            } catch {
                // Ignore unload errors
            }
            this.sound = null;
        }
        this.onStatusUpdate = null;
    }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format duration for display
 */
export const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Generate waveform bars from metering values
 */
export const generateWaveformBars = (
    meteringValues: number[],
    barCount: number = 30
): number[] => {
    if (meteringValues.length === 0) {
        return Array(barCount).fill(0.3);
    }

    // Sample or interpolate to get desired bar count
    const step = meteringValues.length / barCount;
    const bars: number[] = [];

    for (let i = 0; i < barCount; i++) {
        const index = Math.floor(i * step);
        bars.push(meteringValues[index] || 0.3);
    }

    return bars;
};

// ============================================================================
// Singleton Instances
// ============================================================================

export const audioRecorder = new AudioRecorderManager();
export const audioPlayer = new AudioPlayerManager();
