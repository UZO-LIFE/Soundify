/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, Pause, Heart, RefreshCw } from 'lucide-react';
import { useAudioEngine, usePlaybackProgress } from '../../audio/AudioContext.tsx';
import { useLibrary } from '../../context/LibraryContext.tsx';
import { SoundifyTrack } from '../../types/music.ts';

interface MobileMiniPlayerProps {
  onOpenExpandedPlayer: () => void;
}

export const MobileMiniPlayer: React.FC<MobileMiniPlayerProps> = ({ onOpenExpandedPlayer }) => {
  const { state, togglePlay } = useAudioEngine();
  const { isLiked, toggleLikeTrack } = useLibrary();
  const { progressPercent } = usePlaybackProgress();

  const currentTrack = state.currentTrack as SoundifyTrack | null;
  if (!currentTrack) return null;

  const isCurrentlyLiked = isLiked(currentTrack.id);

  return (
    <div className="mx-2 mb-1 bg-[#1f1f1f] rounded-lg border border-neutral-800 shadow-xl overflow-hidden select-none z-20">
      {/* Top micro progress line */}
      <div className="w-full h-0.5 bg-neutral-800">
        <div
          className="h-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between p-2 gap-3">
        {/* Track Thumbnail & Titles (Click opens expanded full player) */}
        <div
          onClick={onOpenExpandedPlayer}
          className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
        >
          <div className="w-10 h-10 rounded bg-neutral-800 overflow-hidden shrink-0">
            <img
              src={currentTrack.artworkUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80'}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-white truncate">{currentTrack.title}</div>
            <div className="text-[11px] text-neutral-400 truncate">{currentTrack.artist}</div>
          </div>
        </div>

        {/* Quick Actions: Like and Play/Pause */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => toggleLikeTrack(currentTrack)}
            className={`p-1.5 rounded-full ${
              isCurrentlyLiked ? 'text-emerald-400' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isCurrentlyLiked ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center transition active:scale-95"
          >
            {state.status === 'playing' || state.status === 'buffering' ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : state.status === 'loading' ? (
              <RefreshCw className="w-4 h-4 animate-spin text-black" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
