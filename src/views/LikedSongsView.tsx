/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Heart, Play, Pause, Clock, Music, LogIn } from 'lucide-react';
import { useAudioEngine } from '../audio/AudioContext.tsx';
import { useLibrary } from '../context/LibraryContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { ViewNavigation } from '../types/music.ts';
import { TrackActionMenu } from '../components/Track/TrackActionMenu.tsx';

function formatDuration(ms: number): string {
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

interface LikedSongsViewProps {
  onNavigate: (view: ViewNavigation) => void;
}

export const LikedSongsView: React.FC<LikedSongsViewProps> = ({ onNavigate }) => {
  const { state, setQueue } = useAudioEngine();
  const { likedTracks, toggleLikeTrack } = useLibrary();
  const { isGuest, promptAuth } = useAuth();

  const totalDurationMs = likedTracks.reduce((acc, t) => acc + (t.durationMs || 180000), 0);
  const durationMinutes = Math.floor(totalDurationMs / 60000);

  const handlePlayAll = () => {
    if (likedTracks.length > 0) {
      setQueue(likedTracks, 0, true);
    }
  };

  const isPlayingLiked =
    likedTracks.some((t) => t.id === state.currentTrack?.id) &&
    (state.status === 'playing' || state.status === 'buffering');

  return (
    <div className="select-none pb-16">
      {/* Banner */}
      <div className="bg-gradient-to-b from-indigo-900/80 via-purple-950/60 to-[#121212] p-6 sm:p-10 flex flex-col sm:flex-row items-start sm:items-end gap-6 border-b border-neutral-800/60">
        <div className="w-36 h-36 sm:w-48 sm:h-48 rounded-xl bg-gradient-to-br from-indigo-700 via-purple-600 to-pink-500 flex items-center justify-center text-white shrink-0 shadow-2xl">
          <Heart className="w-16 h-16 sm:w-20 sm:h-20 fill-current" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">Playlist</span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
            Liked Songs
          </h1>
          <div className="flex items-center gap-2 text-xs text-neutral-400 pt-1">
            <span className="font-semibold text-white">Your Collection</span>
            <span>·</span>
            <span>{likedTracks.length} songs</span>
            {likedTracks.length > 0 && (
              <>
                <span>·</span>
                <span>about {durationMinutes} min</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Play Action */}
      {likedTracks.length > 0 && (
        <div className="p-6 sm:px-10">
          <button
            onClick={handlePlayAll}
            className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition"
            title="Play Liked Songs"
          >
            {isPlayingLiked ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-0.5" />
            )}
          </button>
        </div>
      )}

      {/* Content Area */}
      <div className="px-4 sm:px-10 max-w-6xl mt-6">
        {isGuest ? (
          /* Guest Empty State: Prompt Login */
          <div className="py-16 text-center space-y-4 text-neutral-400 border border-dashed border-neutral-800 rounded-xl bg-[#141518]/60 p-8">
            <Heart className="w-12 h-12 mx-auto text-neutral-600 mb-1" />
            <h3 className="text-lg font-bold text-white">Save songs to your Liked Songs</h3>
            <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
              Log in or create a free Soundify account to build your personal library of favorite music.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => promptAuth('like')}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-full text-xs font-bold transition shadow-lg shadow-emerald-500/20"
              >
                Log In or Sign Up
              </button>
              <button
                onClick={() => onNavigate({ type: 'search' })}
                className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-full text-xs font-semibold transition"
              >
                Browse Catalog
              </button>
            </div>
          </div>
        ) : likedTracks.length === 0 ? (
          /* Authenticated New User Empty State */
          <div className="py-16 text-center space-y-3 text-neutral-400 border border-dashed border-neutral-800 rounded-xl">
            <Music className="w-10 h-10 mx-auto text-neutral-600 mb-2" />
            <h3 className="text-base font-bold text-white">Songs you like will appear here</h3>
            <p className="text-xs text-neutral-500 max-w-xs mx-auto">
              Save songs by tapping the heart icon while exploring, searching, or playing tracks.
            </p>
            <button
              onClick={() => onNavigate({ type: 'search' })}
              className="mt-3 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-full text-xs font-semibold transition"
            >
              Discover Songs
            </button>
          </div>
        ) : (
          /* Populated Liked Songs Table */
          <div className="space-y-1">
            <div className="grid grid-cols-12 gap-4 px-3 py-2 text-xs font-bold text-neutral-500 uppercase tracking-wider border-b border-neutral-800/80">
              <span className="col-span-1 text-center">#</span>
              <span className="col-span-6 sm:col-span-5">Title</span>
              <span className="hidden sm:block sm:col-span-4">Album</span>
              <span className="col-span-5 sm:col-span-2 text-right flex items-center justify-end gap-1">
                <Clock className="w-3.5 h-3.5" />
              </span>
            </div>

            {likedTracks.map((track, idx) => {
              const isCurrent = state.currentTrack?.id === track.id;

              return (
                <div
                  key={track.id}
                  onClick={() => setQueue(likedTracks, idx, true)}
                  className={`group grid grid-cols-12 gap-4 items-center px-3 py-2.5 rounded-lg transition border cursor-pointer ${
                    isCurrent
                      ? 'bg-emerald-950/40 border-emerald-800/60 text-white'
                      : 'bg-transparent border-transparent hover:bg-neutral-800/60 text-neutral-300'
                  }`}
                >
                  <div className="col-span-1 text-center text-xs font-mono text-neutral-400">
                    <span className="group-hover:hidden">{idx + 1}</span>
                    <Play className="w-3.5 h-3.5 fill-current hidden group-hover:block mx-auto text-white" />
                  </div>

                  <div className="col-span-6 sm:col-span-5 flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded bg-neutral-800 overflow-hidden shrink-0">
                      <img src={track.artworkUrl || ''} alt={track.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={`text-sm font-semibold truncate ${isCurrent ? 'text-emerald-400' : 'text-white'}`}>
                        {track.title}
                      </div>
                      <div className="text-xs text-neutral-400 truncate">{track.artist}</div>
                    </div>
                  </div>

                  <div className="hidden sm:block sm:col-span-4 text-xs text-neutral-400 truncate">
                    {track.album || 'Single'}
                  </div>

                  <div className="col-span-5 sm:col-span-2 flex items-center justify-end gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLikeTrack(track);
                      }}
                      className="p-1 rounded-full text-emerald-400 hover:text-rose-400 transition"
                      title="Unlike track"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </button>

                    <span className="text-xs font-mono text-neutral-400 tabular-nums">
                      {track.durationMs ? formatDuration(track.durationMs) : '3:00'}
                    </span>

                    <TrackActionMenu track={track} onNavigate={onNavigate} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
