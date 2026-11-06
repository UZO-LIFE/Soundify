/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Volume1,
  Heart,
  Mic2,
  ListMusic,
  Maximize2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { useAudioEngine, usePlaybackProgress } from '../../audio/AudioContext.tsx';
import { useLibrary } from '../../context/LibraryContext.tsx';
import { RightPanelTab } from './RightPanel.tsx';
import { SoundifyTrack } from '../../types/music.ts';

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

interface BottomPlayerBarProps {
  onToggleRightPanel: (tab: RightPanelTab) => void;
  rightPanelTab: RightPanelTab | null;
  onOpenExpandedPlayer: () => void;
}

export const BottomPlayerBar: React.FC<BottomPlayerBarProps> = ({
  onToggleRightPanel,
  rightPanelTab,
  onOpenExpandedPlayer,
}) => {
  const {
    state,
    togglePlay,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeatMode,
  } = useAudioEngine();

  const { isLiked, toggleLikeTrack } = useLibrary();
  const { currentTimeSec, durationSec, bufferedPercent, progressPercent } = usePlaybackProgress();
  const [hoverPosition, setHoverPosition] = useState<{ percent: number; seconds: number } | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isSeeking, setIsSeeking] = useState(false);
  const [localSeekPercent, setLocalSeekPercent] = useState<number | null>(null);

  const currentTrack = state.currentTrack as SoundifyTrack | null;
  const isCurrentlyLiked = currentTrack ? isLiked(currentTrack.id) : false;

  const calculateSecondsFromEvent = (e: React.MouseEvent<HTMLDivElement>): number => {
    if (!progressBarRef.current || durationSec <= 0) return 0;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = clickX / rect.width;
    return percent * durationSec;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (durationSec <= 0) return;
    const seconds = calculateSecondsFromEvent(e);
    const rect = progressBarRef.current!.getBoundingClientRect();
    const percent = ((e.clientX - rect.left) / rect.width) * 100;
    setHoverPosition({ percent: Math.max(0, Math.min(100, percent)), seconds });
    if (isSeeking) {
      setLocalSeekPercent(percent);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (durationSec <= 0) return;
    setIsSeeking(true);
    const seconds = calculateSecondsFromEvent(e);
    const rect = progressBarRef.current!.getBoundingClientRect();
    setLocalSeekPercent(((e.clientX - rect.left) / rect.width) * 100);
    seek(seconds);
  };

  const handleMouseUp = () => {
    setIsSeeking(false);
    setLocalSeekPercent(null);
  };

  const displayedPercent = isSeeking && localSeekPercent !== null ? localSeekPercent : progressPercent;

  return (
    <footer className="h-20 sm:h-[88px] bg-[#181818] border-t border-neutral-800 px-4 sm:px-6 flex items-center justify-between select-none z-30">
      {/* 1. Left Zone: Track Artwork & Title */}
      <div className="flex items-center gap-3.5 w-1/4 min-w-[180px]">
        {currentTrack ? (
          <>
            <div
              onClick={onOpenExpandedPlayer}
              className="w-14 h-14 rounded-md overflow-hidden bg-neutral-800 shrink-0 shadow-md cursor-pointer group relative"
            >
              <img
                src={currentTrack.artworkUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80'}
                alt={currentTrack.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                <Maximize2 className="w-4 h-4" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div
                onClick={onOpenExpandedPlayer}
                className="text-sm font-semibold text-white truncate cursor-pointer hover:underline"
              >
                {currentTrack.title}
              </div>
              <div className="text-xs text-neutral-400 truncate hover:text-white cursor-pointer">
                {currentTrack.artist}
              </div>
              {currentTrack.isExplicit && (
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[9px] px-1 rounded bg-neutral-700 text-neutral-200 font-bold">
                    E
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => toggleLikeTrack(currentTrack)}
              className={`p-1.5 rounded-full transition shrink-0 ${
                isCurrentlyLiked
                  ? 'text-emerald-500 hover:text-emerald-400'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title={isCurrentlyLiked ? 'Remove from Liked Songs' : 'Save to Liked Songs'}
            >
              <Heart className={`w-4 h-4 ${isCurrentlyLiked ? 'fill-current' : ''}`} />
            </button>
          </>
        ) : (
          <div className="text-xs text-neutral-500">No track playing</div>
        )}
      </div>

      {/* 2. Center Zone: Transport Controls & Scrubber */}
      <div className="flex flex-col items-center justify-center gap-1.5 flex-1 max-w-xl px-4">
        {/* Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleShuffle}
            className={`p-1.5 rounded-full transition ${
              state.shuffle ? 'text-emerald-400' : 'text-neutral-400 hover:text-white'
            }`}
            title="Shuffle"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={() => previous()}
            disabled={state.queue.length === 0}
            className="text-neutral-300 hover:text-white disabled:opacity-30 transition p-1"
            title="Previous"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={togglePlay}
            disabled={state.queue.length === 0}
            className="w-8 h-8 rounded-full bg-white hover:scale-105 active:scale-95 text-black flex items-center justify-center transition shadow disabled:opacity-40"
            title={state.status === 'playing' ? 'Pause' : 'Play'}
          >
            {state.status === 'playing' || state.status === 'buffering' ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : state.status === 'loading' ? (
              <RefreshCw className="w-4 h-4 animate-spin text-black" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={() => next()}
            disabled={state.queue.length === 0}
            className="text-neutral-300 hover:text-white disabled:opacity-30 transition p-1"
            title="Next"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={cycleRepeatMode}
            className={`p-1.5 rounded-full transition ${
              state.repeatMode !== 'off' ? 'text-emerald-400' : 'text-neutral-400 hover:text-white'
            }`}
            title={`Repeat: ${state.repeatMode}`}
          >
            {state.repeatMode === 'one' ? (
              <Repeat1 className="w-4 h-4" />
            ) : (
              <Repeat className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Timeline Scrubber */}
        <div className="w-full flex items-center gap-2.5 text-[11px] text-neutral-400 font-mono">
          <span className="w-9 text-right tabular-nums">
            {formatTime(isSeeking && localSeekPercent !== null ? (localSeekPercent / 100) * durationSec : currentTimeSec)}
          </span>

          <div
            ref={progressBarRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => {
              setHoverPosition(null);
              if (isSeeking) handleMouseUp();
            }}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            className="relative flex-1 h-3 group cursor-pointer flex items-center"
          >
            <div className="w-full h-1 bg-neutral-700/60 rounded-full overflow-hidden relative">
              <div
                className="absolute left-0 top-0 bottom-0 bg-neutral-600/60 transition-all duration-300"
                style={{ width: `${bufferedPercent}%` }}
              />
              <div
                className="absolute left-0 top-0 bottom-0 bg-white group-hover:bg-emerald-400 transition-colors"
                style={{ width: `${displayedPercent}%` }}
              />
            </div>

            <div
              className="absolute w-3 h-3 bg-white rounded-full shadow -ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{ left: `${displayedPercent}%` }}
            />

            {hoverPosition && (
              <div
                className="absolute -top-7 -translate-x-1/2 bg-neutral-900 border border-neutral-700 text-neutral-200 text-[10px] px-1 py-0.5 rounded shadow pointer-events-none tabular-nums"
                style={{ left: `${hoverPosition.percent}%` }}
              >
                {formatTime(hoverPosition.seconds)}
              </div>
            )}
          </div>

          <span className="w-9 text-left tabular-nums text-neutral-500">
            {formatTime(durationSec)}
          </span>
        </div>
      </div>

      {/* 3. Right Zone: Lyrics, Queue, Volume, Fullscreen */}
      <div className="flex items-center justify-end gap-3 w-1/4 min-w-[180px]">
        {/* Synchronized Lyrics Toggle */}
        <button
          onClick={() => onToggleRightPanel('lyrics')}
          className={`p-1.5 rounded-full transition ${
            rightPanelTab === 'lyrics' ? 'text-emerald-400 bg-neutral-800' : 'text-neutral-400 hover:text-white'
          }`}
          title="Lyrics"
        >
          <Mic2 className="w-4 h-4" />
        </button>

        {/* Queue Toggle */}
        <button
          onClick={() => onToggleRightPanel('queue')}
          className={`p-1.5 rounded-full transition ${
            rightPanelTab === 'queue' ? 'text-emerald-400 bg-neutral-800' : 'text-neutral-400 hover:text-white'
          }`}
          title="Queue"
        >
          <ListMusic className="w-4 h-4" />
        </button>

        {/* Volume Controls */}
        <div className="flex items-center gap-1.5 w-28">
          <button
            onClick={toggleMute}
            className="text-neutral-400 hover:text-white p-1 transition"
            title={state.isMuted ? 'Unmute' : 'Mute'}
          >
            {state.isMuted || state.volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : state.volume < 0.5 ? (
              <Volume1 className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={state.isMuted ? 0 : state.volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full accent-white hover:accent-emerald-400 bg-neutral-700 h-1 rounded-lg cursor-pointer transition-colors"
          />
        </div>

        {/* Expand Fullscreen Player */}
        <button
          onClick={onOpenExpandedPlayer}
          className="text-neutral-400 hover:text-white p-1.5 transition hidden sm:block"
          title="Full screen player"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </footer>
  );
};
