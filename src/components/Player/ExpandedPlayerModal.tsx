/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Mic2,
  Volume2,
  VolumeX,
  Volume1,
  RefreshCw,
  ShieldCheck,
  ListMusic,
} from 'lucide-react';
import { useAudioEngine, usePlaybackProgress } from '../../audio/AudioContext.tsx';
import { useLibrary } from '../../context/LibraryContext.tsx';
import { LyricsView } from './LyricsView.tsx';
import { SoundifyTrack } from '../../types/music.ts';

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

interface ExpandedPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExpandedPlayerModal: React.FC<ExpandedPlayerModalProps> = ({ isOpen, onClose }) => {
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
  const [activeTab, setActiveTab] = useState<'track' | 'lyrics'>('track');
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isSeeking, setIsSeeking] = useState(false);
  const [localSeekPercent, setLocalSeekPercent] = useState<number | null>(null);

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#181a1f] via-[#101114] to-[#0a0a0c] text-white flex flex-col p-5 sm:p-8 animate-in fade-in zoom-in-95 duration-200 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 max-w-2xl w-full mx-auto">
        <button
          onClick={onClose}
          className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-full transition"
          title="Dismiss"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        {/* Tab Switcher: Track View vs Lyrics */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-full border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('track')}
            className={`px-3 py-1 rounded-full font-semibold transition ${
              activeTab === 'track' ? 'bg-white text-black shadow' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Now Playing
          </button>
          <button
            onClick={() => setActiveTab('lyrics')}
            className={`px-3 py-1 rounded-full font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'lyrics' ? 'bg-white text-black shadow' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Mic2 className="w-3.5 h-3.5" />
            <span>Lyrics</span>
          </button>
        </div>

        <div className="w-10" />
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-md w-full mx-auto overflow-hidden">
        {activeTab === 'track' ? (
          <>
            {/* Artwork Card */}
            <div className="w-full aspect-square max-w-[340px] rounded-2xl overflow-hidden shadow-2xl shadow-black/80 border border-white/10 bg-neutral-900 mb-6 shrink-0">
              <img
                src={currentTrack?.artworkUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80'}
                alt={currentTrack?.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Track Info & Like Action */}
            <div className="w-full flex items-center justify-between gap-4 mb-5">
              <div className="min-w-0 flex-1">
                <h2 className="text-xl sm:text-2xl font-bold text-white truncate">
                  {currentTrack?.title || 'No track selected'}
                </h2>
                <p className="text-sm sm:text-base text-neutral-400 truncate mt-0.5">
                  {currentTrack?.artist || 'Unknown Artist'}
                </p>
                {currentTrack?.album && (
                  <p className="text-xs text-neutral-500 truncate mt-0.5">
                    {currentTrack.album}
                  </p>
                )}
              </div>

              {currentTrack && (
                <button
                  onClick={() => toggleLikeTrack(currentTrack)}
                  className={`p-3 rounded-full transition ${
                    isCurrentlyLiked ? 'text-emerald-400' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Heart className={`w-6 h-6 ${isCurrentlyLiked ? 'fill-current' : ''}`} />
                </button>
              )}
            </div>

            {/* Scrubber */}
            <div className="w-full mb-6">
              <div
                ref={progressBarRef}
                onMouseMove={handleMouseMove}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                className="relative w-full h-4 group cursor-pointer flex items-center"
              >
                <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden relative">
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-neutral-700/60"
                    style={{ width: `${bufferedPercent}%` }}
                  />
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-white group-hover:bg-emerald-400 transition-colors"
                    style={{ width: `${displayedPercent}%` }}
                  />
                </div>
                <div
                  className="absolute w-4 h-4 bg-white rounded-full shadow-lg -ml-2 group-hover:scale-110 transition-transform pointer-events-none"
                  style={{ left: `${displayedPercent}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-neutral-400 font-mono mt-1">
                <span>{formatTime(isSeeking && localSeekPercent !== null ? (localSeekPercent / 100) * durationSec : currentTimeSec)}</span>
                <span>{formatTime(durationSec)}</span>
              </div>
            </div>

            {/* Big Transport Controls */}
            <div className="w-full flex items-center justify-between mb-6">
              <button
                onClick={toggleShuffle}
                className={`p-2 transition ${
                  state.shuffle ? 'text-emerald-400' : 'text-neutral-400 hover:text-white'
                }`}
                title="Shuffle"
              >
                <Shuffle className="w-5 h-5" />
              </button>

              <button
                onClick={() => previous()}
                className="p-2 text-white hover:opacity-80 active:scale-95 transition"
                title="Previous"
              >
                <SkipBack className="w-7 h-7 fill-current" />
              </button>

              <button
                onClick={togglePlay}
                className="w-16 h-16 rounded-full bg-white hover:scale-105 active:scale-95 text-black flex items-center justify-center transition shadow-xl"
                title={state.status === 'playing' ? 'Pause' : 'Play'}
              >
                {state.status === 'playing' || state.status === 'buffering' ? (
                  <Pause className="w-7 h-7 fill-current" />
                ) : state.status === 'loading' ? (
                  <RefreshCw className="w-7 h-7 animate-spin text-black" />
                ) : (
                  <Play className="w-7 h-7 fill-current ml-1" />
                )}
              </button>

              <button
                onClick={() => next()}
                className="p-2 text-white hover:opacity-80 active:scale-95 transition"
                title="Next"
              >
                <SkipForward className="w-7 h-7 fill-current" />
              </button>

              <button
                onClick={cycleRepeatMode}
                className={`p-2 transition ${
                  state.repeatMode !== 'off' ? 'text-emerald-400' : 'text-neutral-400 hover:text-white'
                }`}
                title={`Repeat: ${state.repeatMode}`}
              >
                {state.repeatMode === 'one' ? (
                  <Repeat1 className="w-5 h-5" />
                ) : (
                  <Repeat className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Bottom Volume Slider */}
            <div className="w-full flex items-center gap-3 px-2">
              <button onClick={toggleMute} className="text-neutral-400 hover:text-white transition">
                {state.isMuted || state.volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-rose-400" />
                ) : state.volume < 0.5 ? (
                  <Volume1 className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={state.isMuted ? 0 : state.volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full accent-white bg-neutral-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>
          </>
        ) : (
          /* Synchronized Lyrics Full Screen */
          <div className="w-full h-full flex-1 overflow-hidden">
            <LyricsView className="h-full" />
          </div>
        )}
      </div>
    </div>
  );
};
