/**
 * Audio Recorder Utilities
 * @description Voice recording and playback for chat messages
 */

import {
    createAudioPlayer,
    AudioPlayer,
    requestRecordingPermissionsAsync,
    setAudioModeAsync,
    RecordingOptions,
    AudioQuality,
    AudioModule
} from 'expo-audio';
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

const RECORDING_OPTIONS: RecordingOptions = {
    isMeteringEnabled: true,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
    extension: '.m4a',
    android: {
        extension: '.m4a',
        outputFormat: 'mpeg4',
        audioEncoder: 'aac',
    },
    ios: {
        extension: '.m4a',
        outputFormat: 'mpeg4aac',
        audioQuality: AudioQuality.HIGH,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
    },
    web: {
        mimeType: 'audio/webm',
        bitsPerSecond: 128000,
    }
};

// ============================================================================
// Permission Handling
// ============================================================================

/**
 * Request microphone permissions
 */
export const requestMicrophonePermission = async (): Promise<boolean> => {
    const { granted } = await requestRecordingPermissionsAsync();
    return granted;
};

/**
 * Set audio mode for recording
 */
export const setAudioModeForRecording = async (): Promise<void> => {
    await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
        shouldPlayInBackground: false,
        interruptionMode: 'duckOthers', // 'shouldDuckAndroid' equivalent
        shouldRouteThroughEarpiece: false,
    });
};

/**
 * Set audio mode for playback
 */
export const setAudioModeForPlayback = async (): Promise<void> => {
    await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
        shouldPlayInBackground: false,
        interruptionMode: 'duckOthers',
        shouldRouteThroughEarpiece: false,
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
    // Type is AudioRecorder but properly imported from where?
    // AudioModule.AudioRecorder is the class constructor.
    // The instance type is `AudioRecorder` (interface or class type).
    // We can use `InstanceType<typeof AudioModule.AudioRecorder>` or assume `AudioRecorder` type is exported correctly.
    // If we use `import { AudioRecorder } from 'expo-audio'` as a type, it works.
    private recording: InstanceType<typeof AudioModule.AudioRecorder> | null = null;
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

        this.recording = new AudioModule.AudioRecorder(RECORDING_OPTIONS);
        this.recording.record();

        this.startTime = Date.now();
        this.meteringValues = [];

        // Collect metering values for waveform (every 100ms)
        this.meteringInterval = setInterval(() => {
            if (this.recording) {
                try {
                    const status = this.recording.getStatus();
                    if (status.isRecording && status.metering !== undefined) {
                        // Normalize metering value (-160 to 0) to 0-1 range
                        // Note: expo-audio metering range might differ, assuming typical dB values
                        // If expo-audio returns 0-1 directly or different dB range, adjust here.
                        // Assuming standard dB: -160 (silence) to 0 (max)
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
            this.recording.pause();
        }
    }

    /**
     * Resume recording
     */
    async resumeRecording(): Promise<void> {
        if (this.recording) {
            this.recording.record();
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
            const status = this.recording.getStatus();
            await this.recording.stop();

            const uri = this.recording.uri;
            const duration = status.durationMillis ? status.durationMillis / 1000 : 0;

            this.recording = null;

            if (!uri) {
                return null;
            }

            await setAudioModeForPlayback();

            // Filter out any potential NaN or Infinite values from metering
            const cleanMetering = this.meteringValues.map(v =>
                Number.isFinite(v) ? v : 0
            );

            return {
                uri,
                duration,
                meteringValues: cleanMetering,
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
                await this.recording.stop();
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
            const status = this.recording.getStatus();
            const duration = status.durationMillis ? status.durationMillis / 1000 : 0;

            let state: RecordingState = 'idle';
            if (status.isRecording) {
                state = 'recording';
            } else if (duration > 0 && !status.isRecording) {
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
        return this.recording !== null && this.recording.isRecording;
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
    private player: AudioPlayer | null = null;
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

        // createAudioPlayer(source, options)
        this.player = createAudioPlayer(uri, {
            updateInterval: 100 // More frequent updates for smooth progress
        });

        // Add listener for status updates
        this.player.addListener('playbackStatusUpdate', this.handleStatusUpdate);

        // Start playing
        this.player.play();
    }

    /**
     * Handle playback status updates
     */
    private handleStatusUpdate = (status: any) => {
        // status is AudioStatus from expo-audio
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

        const durationMillis = status.duration * 1000;
        const positionMillis = status.currentTime * 1000;

        const progress = durationMillis > 0
            ? positionMillis / durationMillis
            : 0;

        this.onStatusUpdate?.({
            isPlaying: status.playing,
            isLoaded: true,
            positionMillis,
            durationMillis,
            progress,
        });

        // Auto-cleanup when finished
        if (status.didJustFinish) {
            this.unload();
        }
    };

    /**
     * Pause playback
     */
    async pause(): Promise<void> {
        if (this.player) {
            this.player.pause();
        }
    }

    /**
     * Resume playback
     */
    async resume(): Promise<void> {
        if (this.player) {
            this.player.play();
        }
    }

    /**
     * Toggle play/pause
     */
    async togglePlayback(): Promise<void> {
        if (this.player) {
            if (this.player.playing) {
                this.player.pause();
            } else {
                this.player.play();
            }
        }
    }

    /**
     * Seek to position
     */
    async seekTo(positionMillis: number): Promise<void> {
        if (this.player) {
            await this.player.seekTo(positionMillis / 1000);
        }
    }

    /**
     * Unload sound
     */
    async unload(): Promise<void> {
        if (this.player) {
            try {
                // remove() releases resources
                this.player.remove();
            } catch {
                // Ignore unload errors
            }
            this.player = null;
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
