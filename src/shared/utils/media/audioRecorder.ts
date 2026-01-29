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
    AudioModule,
    RecordingPresets,
    IOSOutputFormat
} from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import type { RecordingState, VoiceRecordingData } from '@/src/shared/types/chat';

// ============================================================================
// Types
// ============================================================================

export interface AudioRecorderResult {
    uri: string;
    duration: number; // seconds
    meteringValues: number[];
    size?: number; // bytes in file
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
    ...RecordingPresets.HIGH_QUALITY,
    isMeteringEnabled: true,
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
        interruptionMode: 'doNotMix',
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
    private recording: InstanceType<typeof AudioModule.AudioRecorder> | null = null;
    private meteringValues: number[] = [];
    private meteringInterval: ReturnType<typeof setInterval> | null = null;
    private startTime: number = 0;

    /**
     * Start recording
     */
    async startRecording(): Promise<void> {
        console.log('[AudioRecorder] requestMicrophonePermission...');
        const hasPermission = await requestMicrophonePermission();
        console.log('[AudioRecorder] Permission granted:', hasPermission);
        if (!hasPermission) {
            throw new Error('Microphone permission not granted');
        }

        await setAudioModeForRecording();

        console.log('[AudioRecorder] Creating new AudioRecorder instance with preset HIGH_QUALITY...');
        this.recording = new AudioModule.AudioRecorder(RECORDING_OPTIONS);

        try {
            console.log('[AudioRecorder] Preparing to record...');
            await this.recording.prepareToRecordAsync();
            console.log('[AudioRecorder] Prepared.');
        } catch (error) {
            console.error('[AudioRecorder] Failed to prepare recording:', error);
            // If prepare fails, we should probably stop here, but let's try to proceed 
            // incase the constructor did it.
            // But usually this means we can't record.
        }

        console.log('[AudioRecorder] Calling record()...');
        this.recording.record();

        // Log status immediately to see if it started
        try {
            const status = this.recording.getStatus();
            console.log('[AudioRecorder] Immediate Status:', status);
        } catch (e) {
            console.log('[AudioRecorder] Could not get immediate status:', e);
        }

        this.startTime = Date.now();
        this.meteringValues = [];

        // Collect metering values for waveform (every 100ms)
        this.meteringInterval = setInterval(() => {
            if (this.recording) {
                try {
                    const status = this.recording.getStatus();
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
            // Get URI before stopping to ensure we have a valid reference
            let uri = this.recording.uri;
            const duration = status.durationMillis ? status.durationMillis / 1000 : 0;

            console.log('[AudioRecorder] Initial URI:', uri);
            console.log('[AudioRecorder] Recording status:', status);

            if (uri) {
                const infoBefore = await FileSystem.getInfoAsync(uri);
                console.log('[AudioRecorder] File exists before stop:', infoBefore.exists);
            }

            await this.recording.stop();

            // Increased delay to ensure file is ready
            await new Promise(resolve => setTimeout(resolve, 500));

            // Log URI after stop
            if (this.recording) {
                console.log('[AudioRecorder] URI after stop (property):', this.recording.uri);
            }

            // Try to get URI again if it was null initially
            if (!uri && this.recording) {
                uri = this.recording.uri;
                console.log('[AudioRecorder] URI fetched after stop:', uri);
            }

            if (!uri) {
                console.error('[AudioRecorder] No URI found for recording');
                this.recording = null;
                return null;
            }

            await setAudioModeForPlayback();

            // Filter out any potential NaN or Infinite values from metering
            const cleanMetering = this.meteringValues.map(v =>
                Number.isFinite(v) ? v : 0
            );

            // Use the original URI directly instead of copying to avoid file access issues
            console.log('[AudioRecorder] Checking existence of URI:', uri);

            // Get file info for size from original location
            const fileInfo = await FileSystem.getInfoAsync(uri);
            const fileSize = (fileInfo as any).size || 0;

            console.log('[AudioRecorder] Recording file info:', { uri, size: fileSize, exists: fileInfo.exists });

            if (!fileInfo.exists) {
                // Retry check once after a small delay
                await new Promise(resolve => setTimeout(resolve, 200));
                const retryInfo = await FileSystem.getInfoAsync(uri);
                if (!retryInfo.exists) {
                    console.error('[AudioRecorder] Original recording file does not exist after retry:', uri);
                    this.recording = null;
                    return null;
                }
                console.log('[AudioRecorder] File found after retry');
            }

            // Return the results
            const result = {
                uri,
                duration,
                meteringValues: cleanMetering,
                size: fileSize
            };

            this.recording = null;
            return result;
        } catch (error) {
            console.error('[AudioRecorder] Error stopping recording:', error);
            this.recording = null;
            // Return null to indicate failure - let the UI handle it
            return null;
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
    public currentUri: string | null = null;
    private isPlayingState: boolean = false;

    /**
     * Load and play audio
     */
    async loadAndPlay(
        uri: string,
        onStatusUpdate?: (status: AudioPlaybackState) => void
    ): Promise<void> {
        // Unload previous sound if exists
        if (this.player && this.onStatusUpdate) {
            this.onStatusUpdate({
                isPlaying: false,
                isLoaded: false,
                positionMillis: 0,
                durationMillis: 0,
                progress: 0,
            });
        }

        await this.unload();

        this.currentUri = uri;
        this.onStatusUpdate = onStatusUpdate || null;
        try {
            await setAudioModeForPlayback();
        } catch (error) {
            console.warn('[AudioPlayerManager] Failed to set audio mode:', error);
        }

        try {
            // Create player with the audio source
            this.player = createAudioPlayer(uri, {
                updateInterval: 100, // More frequent updates for smooth progress
            });

            // Add listener for status updates
            this.player.addListener('playbackStatusUpdate', this.handleStatusUpdate);

            // Start playing
            await this.player.play();
            this.isPlayingState = true;
        } catch (error) {
            console.error('[AudioPlayerManager] Failed to load and play audio:', error);
            this.onStatusUpdate?.({
                isPlaying: false,
                isLoaded: false,
                positionMillis: 0,
                durationMillis: 0,
                progress: 0,
            });
            this.currentUri = null;
            this.isPlayingState = false;
            throw error;
        }
    }

    /**
     * Handle playback status updates
     */
    private handleStatusUpdate = (status: any) => {
        // console.log('[AudioPlayerManager] Status update:', status);

        // status is AudioStatus from expo-audio
        if (!status || !status.isLoaded) {
            // console.log('[AudioPlayerManager] Audio not loaded or status null');
            this.onStatusUpdate?.({
                isPlaying: false,
                isLoaded: false,
                positionMillis: 0,
                durationMillis: 0,
                progress: 0,
            });
            this.isPlayingState = false;
            return;
        }

        const durationMillis = status.duration ? status.duration * 1000 : 0;
        const positionMillis = status.currentTime ? status.currentTime * 1000 : 0;

        const progress = durationMillis > 0
            ? positionMillis / durationMillis
            : 0;

        const playbackState: AudioPlaybackState = {
            isPlaying: status.playing || false,
            isLoaded: status.isLoaded || false,
            positionMillis,
            durationMillis,
            progress,
        };

        this.isPlayingState = status.playing || false;
        // console.log('[AudioPlayerManager] Playback state:', playbackState);
        this.onStatusUpdate?.(playbackState);

        // Auto-cleanup when finished
        if (status.didJustFinish || (progress >= 1 && status.playing === false)) {
            console.log('[AudioPlayerManager] Playback finished, unloading');
            this.unload();
        }
    };

    /**
     * Pause playback
     */
    async pause(): Promise<void> {
        if (this.player && this.isPlayingState) {
            try {
                await this.player.pause();
                this.isPlayingState = false;
            } catch (error) {
                console.error('[AudioPlayerManager] Failed to pause audio:', error);
            }
        }
    }

    /**
     * Resume playback
     */
    async resume(): Promise<void> {
        if (this.player && !this.isPlayingState) {
            try {
                await this.player.play();
                this.isPlayingState = true;
            } catch (error) {
                console.error('[AudioPlayerManager] Failed to resume audio:', error);
            }
        }
    }

    /**
     * Toggle play/pause
     */
    async togglePlayback(): Promise<void> {
        if (this.player) {
            try {
                if (this.isPlayingState) {
                    await this.player.pause();
                    this.isPlayingState = false;
                } else {
                    await this.player.play();
                    this.isPlayingState = true;
                }
            } catch (error) {
                console.error('[AudioPlayerManager] Failed to toggle playback:', error);
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
        // Notify current listener that we are stopping
        if (this.onStatusUpdate) {
            this.onStatusUpdate({
                isPlaying: false,
                isLoaded: false,
                positionMillis: 0,
                durationMillis: 0,
                progress: 0,
            });
        }

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
        this.currentUri = null;
        this.isPlayingState = false;
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
