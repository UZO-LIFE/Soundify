/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PlaybackStatus =
  | 'idle'
  | 'loading'
  | 'playing'
  | 'paused'
  | 'buffering'
  | 'ended'
  | 'error';

export type RepeatMode = 'off' | 'all' | 'one';

export type AudioErrorCode =
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'NETWORK_ERROR'
  | 'FORMAT_UNSUPPORTED'
  | 'AUTOPLAY_BLOCKED'
  | 'PLAYBACK_ABORTED'
  | 'DECODE_ERROR'
  | 'UNKNOWN';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  artworkUrl?: string;
  durationMs?: number;
  sourceProvider: string;
  sourceReference: string;
}

export interface PlayableAudioSource {
  streamUrl: string;
  format?: string;
  expiresAt?: number;
  headers?: Record<string, string>;
}

export type SourceResolutionResult =
  | {
      success: true;
      source: PlayableAudioSource;
    }
  | {
      success: false;
      errorCode: AudioErrorCode;
      message: string;
    };

export interface AudioSourceAdapter {
  readonly id: string;
  readonly name: string;
  canHandle(track: Track): boolean;
  resolveSource(track: Track): Promise<SourceResolutionResult>;
}

export interface PlaybackState {
  status: PlaybackStatus;
  currentTrack: Track | null;
  currentTimeSec: number;
  durationSec: number;
  bufferedPercent: number;
  volume: number; // 0.0 to 1.0
  isMuted: boolean;
  shuffle: boolean;
  repeatMode: RepeatMode;
  queue: Track[];
  currentIndex: number;
  errorMessage: string | null;
  errorCode: AudioErrorCode | null;
  isAutoplayBlocked: boolean;
}

export type PlaybackStateListener = (state: PlaybackState) => void;
export type TimeUpdateListener = (currentTimeSec: number, durationSec: number, bufferedPercent: number) => void;
