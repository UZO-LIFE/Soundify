/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, ListMusic, Mic2, Info, ArrowUp, ArrowDown, Trash2, ShieldCheck } from 'lucide-react';
import { useAudioEngine } from '../../audio/AudioContext.tsx';
import { LyricsView } from './LyricsView.tsx';
import { SoundifyTrack } from '../../types/music.ts';

export type RightPanelTab = 'now_playing' | 'queue' | 'lyrics';

interface RightPanelProps {
  activeTab: RightPanelTab;
  onTabChange: (tab: RightPanelTab) => void;
  onClose: () => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({ activeTab, onTabChange, onClose }) => {
  const { state, reorderQueue, removeFromQueue, playTrackAtIndex, clearQueue } = useAudioEngine();
  const currentTrack = state.currentTrack as SoundifyTrack | null;

  return (
    <aside className="w-80 lg:w-96 bg-[#121212] border-l border-neutral-800/80 flex flex-col h-full select-none z-20">
      {/* Header with Tabs */}
      <div className="p-4 pb-2 border-b border-neutral-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
          <button
            onClick={() => onTabChange('now_playing')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition flex items-center gap-1.5 ${
              activeTab === 'now_playing'
                ? 'bg-neutral-800 text-white shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Info</span>
          </button>

          <button
            onClick={() => onTabChange('queue')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition flex items-center gap-1.5 ${
              activeTab === 'queue'
                ? 'bg-neutral-800 text-white shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ListMusic className="w-3.5 h-3.5" />
            <span>Queue</span>
          </button>

          <button
            onClick={() => onTabChange('lyrics')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition flex items-center gap-1.5 ${
              activeTab === 'lyrics'
                ? 'bg-neutral-800 text-white shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Mic2 className="w-3.5 h-3.5" />
            <span>Lyrics</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full transition"
          title="Close panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tab 1: Now Playing Details */}
      {activeTab === 'now_playing' && (
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {currentTrack ? (
            <>
              {/* Large Cover Art */}
              <div className="aspect-square rounded-xl overflow-hidden shadow-2xl border border-neutral-800 bg-neutral-900">
                <img
                  src={currentTrack.artworkUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80'}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Title & Artist */}
              <div>
                <h3 className="text-lg font-bold text-white leading-tight mb-1">{currentTrack.title}</h3>
                <p className="text-sm font-medium text-neutral-300">{currentTrack.artist}</p>
                {currentTrack.album && (
                  <p className="text-xs text-neutral-500 mt-0.5">{currentTrack.album}</p>
                )}
              </div>

              {/* Song Details & Credits Card */}
              <div className="bg-[#181818] p-3 rounded-xl border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-300">
                  <span>Track Details</span>
                  {currentTrack.releaseDate && (
                    <span className="text-[11px] text-neutral-400 font-mono">{currentTrack.releaseDate}</span>
                  )}
                </div>
                <div className="text-xs text-neutral-400 space-y-1">
                  <div>
                    <span className="text-neutral-500">Performed by: </span>
                    <span className="text-neutral-200 font-medium">{currentTrack.artist}</span>
                  </div>
                  {currentTrack.album && (
                    <div>
                      <span className="text-neutral-500">From album: </span>
                      <span className="text-neutral-200 font-medium">{currentTrack.album}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* About Artist Card */}
              <div className="bg-[#181818] p-4 rounded-xl border border-neutral-800 space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">About the Artist</span>
                <h4 className="text-sm font-bold text-white">{currentTrack.artist}</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Internationally recognized artist streaming legitimately on Soundify via verified catalog feeds.
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-neutral-500 text-center">
              <Info className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">No track playing right now</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Queue */}
      {activeTab === 'queue' && (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-800">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Upcoming ({state.queue.length})
            </span>
            <button
              onClick={clearQueue}
              className="text-xs text-neutral-400 hover:text-white transition"
            >
              Clear
            </button>
          </div>

          <div className="space-y-1.5 flex-1">
            {state.queue.map((track, idx) => {
              const isCurrent = idx === state.currentIndex;
              return (
                <div
                  key={`${track.id}-${idx}`}
                  className={`group flex items-center justify-between gap-2 p-2 rounded-lg text-xs transition border ${
                    isCurrent
                      ? 'bg-emerald-950/40 border-emerald-800/80 text-white'
                      : 'bg-[#181818] border-neutral-800/60 text-neutral-300 hover:border-neutral-700'
                  }`}
                >
                  <div
                    onClick={() => playTrackAtIndex(idx)}
                    className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded bg-neutral-800 overflow-hidden shrink-0">
                      {track.artworkUrl && (
                        <img src={track.artworkUrl} alt={track.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={`font-semibold truncate ${isCurrent ? 'text-emerald-400' : 'text-neutral-200'}`}>
                        {track.title}
                      </div>
                      <div className="text-[11px] text-neutral-400 truncate">{track.artist}</div>
                    </div>
                  </div>

                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => reorderQueue(idx, idx - 1)}
                      disabled={idx === 0}
                      className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white disabled:opacity-20"
                      title="Move up"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => reorderQueue(idx, idx + 1)}
                      disabled={idx === state.queue.length - 1}
                      className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white disabled:opacity-20"
                      title="Move down"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => removeFromQueue(idx)}
                      className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-rose-400"
                      title="Remove"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Synchronized Lyrics */}
      {activeTab === 'lyrics' && (
        <div className="flex-1 overflow-hidden">
          <LyricsView className="h-full" />
        </div>
      )}
    </aside>
  );
};
