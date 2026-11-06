/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AudioSourceAdapterRegistry } from './AudioSourceAdapter.ts';
import {
  AudioErrorCode,
  PlaybackState,
  PlaybackStateListener,
  PlaybackStatus,
  RepeatMode,
  TimeUpdateListener,
  Track,
} from './types.ts';

/**
 * Central Audio Playback Engine Singleton for Soundify.
 * Encapsulates HTML5 Audio element, state management, queue sequencing, and source adapters.
 */
export class AudioEngine {
  private static instance: AudioEngine | null = null;

  // Native HTML5 Audio instance
  private audio: HTMLAudioElement;

  // Pluggable source adapter registry
  readonly adapters: AudioSourceAdapterRegistry;

  // Internal state
  private status: PlaybackStatus = 'idle';
  private currentTrack: Track | null = null;
  private queue: Track[] = [];
  private currentIndex: number = -1;
  private shuffleIndices: number[] = [];
  private shuffleOrderIndex: number = -1;
  private isShuffle: boolean = false;
  private repeatMode: RepeatMode = 'off';
  private volume: number = 0.8;
  private isMuted: boolean = false;
  private currentTimeSec: number = 0;
  private durationSec: number = 0;
  private bufferedPercent: number = 0;
  private errorMessage: string | null = null;
  private errorCode: AudioErrorCode | null = null;
  private isAutoplayBlocked: boolean = false;

  // Subscription listeners
  private stateListeners: Set<PlaybackStateListener> = new Set();
  private timeListeners: Set<TimeUpdateListener> = new Set();

  // Guard against asynchronous play() promise race conditions
  private currentPlayPromise: Promise<void> | null = null;
  private loadSessionId: number = 0;

  private constructor() {
    this.audio = new Audio();
    this.audio.preload = 'auto';
    this.audio.volume = this.volume;
    this.adapters = new AudioSourceAdapterRegistry();

    this.bindAudioEvents();
  }

  /**
   * Singleton accessor ensuring one single central audio instance across the entire application.
   */
  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  // ---------------------------------------------------------------------------
  // HTML5 Audio DOM Event Bindings
  // ---------------------------------------------------------------------------

  private bindAudioEvents(): void {
    // When audio element starts loading / fetching media
    this.audio.addEventListener('loadstart', () => {
      if (this.currentTrack) {
        this.setStatus('loading');
      }
    });

    // When audio has buffered enough to begin playback
    this.audio.addEventListener('canplay', () => {
      if (this.status === 'loading' || this.status === 'buffering') {
        if (!this.audio.paused) {
          this.setStatus('playing');
        }
      }
    });

    // Audio is actually playing sound (DOM verified state)
    this.audio.addEventListener('playing', () => {
      this.isAutoplayBlocked = false;
      this.setStatus('playing');
    });

    // Audio has been paused
    this.audio.addEventListener('pause', () => {
      // Only set paused if not ended or in error or loading another track
      if (this.status !== 'ended' && this.status !== 'error' && this.status !== 'loading') {
        this.setStatus('paused');
      }
    });

    // Network / buffer stall: playback stopped because data is not yet available
    this.audio.addEventListener('waiting', () => {
      if (this.status === 'playing') {
        this.setStatus('buffering');
      }
    });

    // Track metadata (duration) loaded
    this.audio.addEventListener('loadedmetadata', () => {
      this.durationSec = Number.isFinite(this.audio.duration) ? this.audio.duration : (this.currentTrack?.durationMs ? this.currentTrack.durationMs / 1000 : 0);
      this.notifyTimeUpdate();
    });

    // Real-time playback progress
    this.audio.addEventListener('timeupdate', () => {
      this.currentTimeSec = this.audio.currentTime;
      if (Number.isFinite(this.audio.duration) && this.audio.duration > 0) {
        this.durationSec = this.audio.duration;
      }
      this.updateBufferedProgress();
      this.notifyTimeUpdate();
    });

    // Track playback completed
    this.audio.addEventListener('ended', () => {
      this.handleTrackEnded();
    });

    // Buffer progress (ranges downloaded)
    this.audio.addEventListener('progress', () => {
      this.updateBufferedProgress();
    });

    // Audio element native error handler
    this.audio.addEventListener('error', () => {
      this.handleNativeAudioError();
    });
  }

  private updateBufferedProgress(): void {
    try {
      if (this.audio.buffered && this.audio.buffered.length > 0 && this.durationSec > 0) {
        const bufferedEnd = this.audio.buffered.end(this.audio.buffered.length - 1);
        this.bufferedPercent = Math.min(100, Math.max(0, (bufferedEnd / this.durationSec) * 100));
      }
    } catch {
      // Buffered range may throw if audio not yet initialized
    }
  }

  private handleNativeAudioError(): void {
    const mediaError = this.audio.error;
    let code: AudioErrorCode = 'UNKNOWN';
    let message = 'An unknown playback error occurred.';

    if (mediaError) {
      switch (mediaError.code) {
        case MediaError.MEDIA_ERR_ABORTED:
          code = 'PLAYBACK_ABORTED';
          message = 'Audio playback was aborted by the user or browser.';
          break;
        case MediaError.MEDIA_ERR_NETWORK:
          code = 'NETWORK_ERROR';
          message = 'A network error interrupted the audio stream download.';
          break;
        case MediaError.MEDIA_ERR_DECODE:
          code = 'DECODE_ERROR';
          message = 'The media resource could not be decoded. Audio stream format may be corrupted.';
          break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          code = 'FORMAT_UNSUPPORTED';
          message = 'The audio stream format or URL is unsupported or unavailable.';
          break;
      }
    }

    this.setError(code, message);
  }

  private setStatus(newStatus: PlaybackStatus): void {
    if (this.status !== newStatus) {
      this.status = newStatus;
      if (newStatus !== 'error') {
        this.errorMessage = null;
        this.errorCode = null;
      }
      this.notifyState();
    }
  }

  private setError(code: AudioErrorCode, message: string): void {
    this.status = 'error';
    this.errorCode = code;
    this.errorMessage = message;
    this.notifyState();
  }

  // ---------------------------------------------------------------------------
  // Playback Control Methods
  // ---------------------------------------------------------------------------

  /**
   * Play the current track or resume paused playback.
   */
  public async play(): Promise<void> {
    if (!this.currentTrack) {
      if (this.queue.length > 0) {
        await this.playTrackAtIndex(0);
      }
      return;
    }

    // If source is not yet set or in error, reload current track
    if (!this.audio.src || this.status === 'error' || this.status === 'idle') {
      await this.loadAndPlayTrack(this.currentTrack);
      return;
    }

    try {
      this.setStatus('loading');
      this.currentPlayPromise = this.audio.play();
      await this.currentPlayPromise;
      // onplaying listener will transition state to 'playing'
    } catch (err: unknown) {
      const error = err as Error;
      if (error.name === 'NotAllowedError') {
        this.isAutoplayBlocked = true;
        this.setError(
          'AUTOPLAY_BLOCKED',
          'Autoplay restriction: User gesture required to initiate audio playback. Click play to resume.'
        );
      } else if (error.name !== 'AbortError') {
        this.setError('UNKNOWN', `Playback initiation failed: ${error.message}`);
      }
    } finally {
      this.currentPlayPromise = null;
    }
  }

  /**
   * Pause playback immediately.
   */
  public pause(): void {
    // If a play() promise is currently in flight, pause after it completes to prevent DOMException
    if (this.currentPlayPromise) {
      this.currentPlayPromise
        .then(() => {
          this.audio.pause();
          this.setStatus('paused');
        })
        .catch(() => {
          // Play was rejected; already in error state
        });
    } else {
      this.audio.pause();
      this.setStatus('paused');
    }
  }

  /**
   * Toggle between play and pause.
   */
  public togglePlay(): void {
    if (this.status === 'playing' || this.status === 'buffering' || this.status === 'loading') {
      this.pause();
    } else {
      this.play();
    }
  }

  /**
   * Seek to a specific timestamp in the current track.
   */
  public seek(positionSeconds: number): void {
    if (!Number.isFinite(positionSeconds) || positionSeconds < 0) return;

    const target = Math.min(positionSeconds, this.durationSec || positionSeconds);
    this.currentTimeSec = target;
    this.notifyTimeUpdate();

    try {
      this.audio.currentTime = target;
    } catch {
      // Audio element might not be seekable yet
    }
  }

  /**
   * Stop playback, reset time, and set status to idle.
   */
  public stop(): void {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.currentTimeSec = 0;
    this.setStatus('idle');
    this.notifyTimeUpdate();
  }

  // ---------------------------------------------------------------------------
  // Track Loading & Provider Resolution
  // ---------------------------------------------------------------------------

  private async loadAndPlayTrack(track: Track): Promise<void> {
    const sessionId = ++this.loadSessionId;
    this.currentTrack = track;
    this.currentTimeSec = 0;
    this.bufferedPercent = 0;
    this.durationSec = track.durationMs ? track.durationMs / 1000 : 0;
    this.errorMessage = null;
    this.errorCode = null;
    this.setStatus('loading');
    this.notifyTimeUpdate();

    // 1. Resolve stream via pluggable AudioSourceAdapter
    const resolution = await this.adapters.resolve(track);

    // If another track was selected while resolving, abort stale session
    if (sessionId !== this.loadSessionId) {
      return;
    }

    if (!resolution.success) {
      this.audio.pause();
      this.audio.removeAttribute('src');
      this.audio.load();
      this.setError(resolution.errorCode, resolution.message);
      return;
    }

    // 2. Set resolved stream to native HTMLAudioElement
    try {
      this.audio.pause();
      this.audio.src = resolution.source.streamUrl;
      this.audio.currentTime = 0;
      this.audio.load();

      this.currentPlayPromise = this.audio.play();
      await this.currentPlayPromise;
    } catch (err: unknown) {
      if (sessionId !== this.loadSessionId) return;

      const error = err as Error;
      if (error.name === 'NotAllowedError') {
        this.isAutoplayBlocked = true;
        this.setError(
          'AUTOPLAY_BLOCKED',
          'Autoplay restriction: click play to allow browser audio output.'
        );
      } else if (error.name !== 'AbortError') {
        this.setError('NETWORK_ERROR', `Failed to stream track "${track.title}": ${error.message}`);
      }
    } finally {
      if (sessionId === this.loadSessionId) {
        this.currentPlayPromise = null;
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Queue & Navigation Logic
  // ---------------------------------------------------------------------------

  /**
   * Set the entire playback queue and optionally begin playing from startIndex.
   */
  public setQueue(tracks: Track[], startIndex: number = 0, autoPlay: boolean = true): void {
    this.queue = [...tracks];
    this.buildShuffleMap();

    if (this.queue.length === 0) {
      this.currentIndex = -1;
      this.currentTrack = null;
      this.stop();
      return;
    }

    const clampedIndex = Math.max(0, Math.min(startIndex, this.queue.length - 1));
    this.currentIndex = clampedIndex;

    if (this.isShuffle) {
      this.shuffleOrderIndex = this.shuffleIndices.indexOf(clampedIndex);
      if (this.shuffleOrderIndex === -1) {
        this.shuffleOrderIndex = 0;
      }
    }

    const targetTrack = this.queue[this.currentIndex];
    if (autoPlay) {
      this.loadAndPlayTrack(targetTrack);
    } else {
      this.currentTrack = targetTrack;
      this.currentTimeSec = 0;
      this.durationSec = targetTrack.durationMs ? targetTrack.durationMs / 1000 : 0;
      this.setStatus('idle');
      this.notifyState();
      this.notifyTimeUpdate();
    }
  }

  /**
   * Play a specific track at a given queue index.
   */
  public async playTrackAtIndex(index: number): Promise<void> {
    if (index < 0 || index >= this.queue.length) return;

    this.currentIndex = index;
    if (this.isShuffle) {
      this.shuffleOrderIndex = this.shuffleIndices.indexOf(index);
    }

    await this.loadAndPlayTrack(this.queue[this.currentIndex]);
  }

  /**
   * Advance to the next track in the queue, taking repeat and shuffle into account.
   */
  public async next(): Promise<void> {
    if (this.queue.length === 0) return;

    if (this.isShuffle) {
      if (this.shuffleOrderIndex + 1 < this.shuffleIndices.length) {
        this.shuffleOrderIndex++;
        this.currentIndex = this.shuffleIndices[this.shuffleOrderIndex];
        await this.loadAndPlayTrack(this.queue[this.currentIndex]);
      } else if (this.repeatMode === 'all') {
        // Re-shuffle for next cycle and loop to start
        this.buildShuffleMap();
        this.shuffleOrderIndex = 0;
        this.currentIndex = this.shuffleIndices[0];
        await this.loadAndPlayTrack(this.queue[this.currentIndex]);
      } else {
        // Queue ended
        this.setStatus('ended');
      }
    } else {
      if (this.currentIndex + 1 < this.queue.length) {
        this.currentIndex++;
        await this.loadAndPlayTrack(this.queue[this.currentIndex]);
      } else if (this.repeatMode === 'all') {
        this.currentIndex = 0;
        await this.loadAndPlayTrack(this.queue[0]);
      } else {
        this.setStatus('ended');
      }
    }
  }

  /**
   * Return to previous track, or restart current track if already > 3 seconds in.
   */
  public async previous(): Promise<void> {
    if (this.queue.length === 0) return;

    // Standard Spotify behavior: if track is more than 3s in, restart it
    if (this.currentTimeSec > 3) {
      this.seek(0);
      return;
    }

    if (this.isShuffle) {
      if (this.shuffleOrderIndex > 0) {
        this.shuffleOrderIndex--;
        this.currentIndex = this.shuffleIndices[this.shuffleOrderIndex];
        await this.loadAndPlayTrack(this.queue[this.currentIndex]);
      } else if (this.repeatMode === 'all') {
        this.shuffleOrderIndex = this.shuffleIndices.length - 1;
        this.currentIndex = this.shuffleIndices[this.shuffleOrderIndex];
        await this.loadAndPlayTrack(this.queue[this.currentIndex]);
      } else {
        this.seek(0);
      }
    } else {
      if (this.currentIndex > 0) {
        this.currentIndex--;
        await this.loadAndPlayTrack(this.queue[this.currentIndex]);
      } else if (this.repeatMode === 'all') {
        this.currentIndex = this.queue.length - 1;
        await this.loadAndPlayTrack(this.queue[this.currentIndex]);
      } else {
        this.seek(0);
      }
    }
  }

  private handleTrackEnded(): void {
    if (this.repeatMode === 'one') {
      this.seek(0);
      this.play();
    } else {
      this.next();
    }
  }

  /**
   * Append a track to the end of the current queue.
   */
  public addToQueue(track: Track): void {
    this.queue.push(track);
    this.buildShuffleMap();
    if (this.queue.length === 1 && !this.currentTrack) {
      this.playTrackAtIndex(0);
    } else {
      this.notifyState();
    }
  }

  /**
   * Insert a track immediately after the currently playing track in the queue.
   */
  public playNext(track: Track): void {
    if (this.queue.length === 0 || this.currentIndex === -1) {
      this.addToQueue(track);
      return;
    }
    const insertAt = this.currentIndex + 1;
    this.queue.splice(insertAt, 0, track);
    this.buildShuffleMap();
    this.notifyState();
  }

  /**
   * Remove a track from the queue at a specific index.
   */
  public removeFromQueue(index: number): void {
    if (index < 0 || index >= this.queue.length) return;

    const isCurrent = index === this.currentIndex;
    this.queue.splice(index, 1);
    this.buildShuffleMap();

    if (this.queue.length === 0) {
      this.stop();
      this.currentTrack = null;
      this.currentIndex = -1;
      this.notifyState();
      return;
    }

    if (isCurrent) {
      const nextIndex = Math.min(index, this.queue.length - 1);
      this.playTrackAtIndex(nextIndex);
    } else if (index < this.currentIndex) {
      this.currentIndex--;
      this.notifyState();
    } else {
      this.notifyState();
    }
  }

  /**
   * Reorder tracks in the queue without corrupting playback.
   */
  public reorderQueue(fromIndex: number, toIndex: number): void {
    if (
      fromIndex < 0 ||
      fromIndex >= this.queue.length ||
      toIndex < 0 ||
      toIndex >= this.queue.length ||
      fromIndex === toIndex
    ) {
      return;
    }

    const currentTrackRef = this.currentTrack;
    const [moved] = this.queue.splice(fromIndex, 1);
    this.queue.splice(toIndex, 0, moved);

    // Maintain accurate currentIndex pointer to the currently playing track
    if (currentTrackRef) {
      this.currentIndex = this.queue.findIndex((t) => t.id === currentTrackRef.id);
    }

    this.buildShuffleMap();
    this.notifyState();
  }

  /**
   * Clear all upcoming tracks in the queue while preserving current track.
   */
  public clearQueue(): void {
    if (this.currentTrack) {
      this.queue = [this.currentTrack];
      this.currentIndex = 0;
    } else {
      this.queue = [];
      this.currentIndex = -1;
      this.stop();
    }
    this.buildShuffleMap();
    this.notifyState();
  }

  // ---------------------------------------------------------------------------
  // Shuffle & Repeat Management
  // ---------------------------------------------------------------------------

  private buildShuffleMap(): void {
    const indices = Array.from({ length: this.queue.length }, (_, i) => i);
    // Fisher-Yates non-destructive shuffle
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    // Keep current playing track at current index in shuffle order
    if (this.currentIndex >= 0 && indices.length > 0) {
      const existing = indices.indexOf(this.currentIndex);
      if (existing > -1) {
        indices.splice(existing, 1);
        indices.unshift(this.currentIndex);
      }
    }

    this.shuffleIndices = indices;
    this.shuffleOrderIndex = 0;
  }

  public setShuffle(enabled: boolean): void {
    this.isShuffle = enabled;
    if (enabled) {
      this.buildShuffleMap();
    }
    this.notifyState();
  }

  public toggleShuffle(): void {
    this.setShuffle(!this.isShuffle);
  }

  public setRepeatMode(mode: RepeatMode): void {
    this.repeatMode = mode;
    this.notifyState();
  }

  public cycleRepeatMode(): void {
    if (this.repeatMode === 'off') {
      this.setRepeatMode('all');
    } else if (this.repeatMode === 'all') {
      this.setRepeatMode('one');
    } else {
      this.setRepeatMode('off');
    }
  }

  // ---------------------------------------------------------------------------
  // Volume & Mute Controls
  // ---------------------------------------------------------------------------

  public setVolume(newVolume: number): void {
    const clamped = Math.max(0, Math.min(1, newVolume));
    this.volume = clamped;
    if (clamped > 0 && this.isMuted) {
      this.isMuted = false;
    }
    this.audio.volume = this.isMuted ? 0 : this.volume;
    this.notifyState();
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    this.audio.volume = muted ? 0 : this.volume;
    this.notifyState();
  }

  public toggleMute(): void {
    this.setMuted(!this.isMuted);
  }

  // ---------------------------------------------------------------------------
  // State Subscriptions & Listeners
  // ---------------------------------------------------------------------------

  public getState(): PlaybackState {
    return {
      status: this.status,
      currentTrack: this.currentTrack,
      currentTimeSec: this.currentTimeSec,
      durationSec: this.durationSec,
      bufferedPercent: this.bufferedPercent,
      volume: this.volume,
      isMuted: this.isMuted,
      shuffle: this.isShuffle,
      repeatMode: this.repeatMode,
      queue: [...this.queue],
      currentIndex: this.currentIndex,
      errorMessage: this.errorMessage,
      errorCode: this.errorCode,
      isAutoplayBlocked: this.isAutoplayBlocked,
    };
  }

  public subscribe(listener: PlaybackStateListener): () => void {
    this.stateListeners.add(listener);
    // Send immediate snapshot upon subscription
    listener(this.getState());
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  public subscribeTime(listener: TimeUpdateListener): () => void {
    this.timeListeners.add(listener);
    listener(this.currentTimeSec, this.durationSec, this.bufferedPercent);
    return () => {
      this.timeListeners.delete(listener);
    };
  }

  private notifyState(): void {
    const state = this.getState();
    this.stateListeners.forEach((listener) => {
      try {
        listener(state);
      } catch (err) {
        console.error('Error in audio state listener:', err);
      }
    });
  }

  private notifyTimeUpdate(): void {
    this.timeListeners.forEach((listener) => {
      try {
        listener(this.currentTimeSec, this.durationSec, this.bufferedPercent);
      } catch (err) {
        console.error('Error in audio time listener:', err);
      }
    });
  }

  /**
   * Teardown engine resources and listeners (for test environments).
   */
  public destroy(): void {
    this.audio.pause();
    this.audio.src = '';
    this.stateListeners.clear();
    this.timeListeners.clear();
    AudioEngine.instance = null;
  }
}
