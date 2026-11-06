/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { AudioEngine } from './AudioEngine.ts';
import { PlaybackState, RepeatMode, Track } from './types.ts';

interface AudioEngineContextValue {
  engine: AudioEngine;
  state: PlaybackState;
  play: () => Promise<void>;
  pause: () => void;
  togglePlay: () => void;
  next: () => Promise<void>;
  previous: () => Promise<void>;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  toggleMute: () => void;
  setShuffle: (shuffle: boolean) => void;
  toggleShuffle: () => void;
  setRepeatMode: (mode: RepeatMode) => void;
  cycleRepeatMode: () => void;
  setQueue: (tracks: Track[], startIndex?: number, autoPlay?: boolean) => void;
  playTrackAtIndex: (index: number) => Promise<void>;
  addToQueue: (track: Track) => void;
  playNext: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  clearQueue: () => void;
}

const AudioContext = createContext<AudioEngineContextValue | null>(null);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const engine = useMemo(() => AudioEngine.getInstance(), []);
  const [state, setState] = useState<PlaybackState>(() => engine.getState());

  useEffect(() => {
    // Subscribe to engine state mutations
    const unsubscribe = engine.subscribe((newState) => {
      setState(newState);
    });
    return () => {
      unsubscribe();
    };
  }, [engine]);

  const value = useMemo<AudioEngineContextValue>(() => {
    return {
      engine,
      state,
      play: () => engine.play(),
      pause: () => engine.pause(),
      togglePlay: () => engine.togglePlay(),
      next: () => engine.next(),
      previous: () => engine.previous(),
      seek: (seconds: number) => engine.seek(seconds),
      setVolume: (volume: number) => engine.setVolume(volume),
      setMuted: (muted: boolean) => engine.setMuted(muted),
      toggleMute: () => engine.toggleMute(),
      setShuffle: (shuffle: boolean) => engine.setShuffle(shuffle),
      toggleShuffle: () => engine.toggleShuffle(),
      setRepeatMode: (mode: RepeatMode) => engine.setRepeatMode(mode),
      cycleRepeatMode: () => engine.cycleRepeatMode(),
      setQueue: (tracks: Track[], startIndex?: number, autoPlay?: boolean) =>
        engine.setQueue(tracks, startIndex, autoPlay),
      playTrackAtIndex: (index: number) => engine.playTrackAtIndex(index),
      addToQueue: (track: Track) => engine.addToQueue(track),
      playNext: (track: Track) => engine.playNext(track),
      removeFromQueue: (index: number) => engine.removeFromQueue(index),
      reorderQueue: (fromIndex: number, toIndex: number) => engine.reorderQueue(fromIndex, toIndex),
      clearQueue: () => engine.clearQueue(),
    };
  }, [engine, state]);

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
};

/**
 * Main hook for accessing playback state and control actions.
 */
export function useAudioEngine(): AudioEngineContextValue {
  const ctx = useContext(AudioContext);
  if (!ctx) {
    throw new Error('useAudioEngine must be used within an <AudioProvider>');
  }
  return ctx;
}

/**
 * Dedicated lightweight hook for real-time time updates.
 * Isolates high-frequency timeupdate re-renders from the main player controls.
 */
export function usePlaybackProgress() {
  const { engine } = useAudioEngine();
  const [progress, setProgress] = useState(() => {
    const s = engine.getState();
    return {
      currentTimeSec: s.currentTimeSec,
      durationSec: s.durationSec,
      bufferedPercent: s.bufferedPercent,
      progressPercent: s.durationSec > 0 ? (s.currentTimeSec / s.durationSec) * 100 : 0,
    };
  });

  useEffect(() => {
    return engine.subscribeTime((current, duration, buffered) => {
      setProgress({
        currentTimeSec: current,
        durationSec: duration,
        bufferedPercent: buffered,
        progressPercent: duration > 0 ? (current / duration) * 100 : 0,
      });
    });
  }, [engine]);

  return progress;
}
