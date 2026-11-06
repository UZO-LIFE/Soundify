/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Heart, Music, UserCheck, ShieldAlert, LogIn } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { ViewNavigation } from '../types/music.ts';

interface LibraryViewProps {
  onNavigate: (view: ViewNavigation) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({ onNavigate }) => {
  const { playlists, likedTracks, followedArtists, createPlaylist } = useLibrary();
  const { isGuest, promptAuth } = useAuth();
  const [filter, setFilter] = useState<'all' | 'playlists' | 'artists'>('all');

  const handleCreate = () => {
    if (isGuest) {
      promptAuth('create_playlist');
      return;
    }
    const pl = createPlaylist();
    if (pl) {
      onNavigate({ type: 'playlist', id: pl.id });
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-5xl mx-auto pb-20 select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Your Library</h1>
        <button
          onClick={handleCreate}
          className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white transition flex items-center gap-1.5 text-xs font-semibold px-3"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>New Playlist</span>
        </button>
      </div>

      {isGuest ? (
        /* Guest Banner */
        <div className="py-12 px-6 rounded-2xl bg-[#16171b] border border-neutral-800 text-center space-y-3.5">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <Music className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white">Build your personal music library</h2>
          <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
            Log in to save liked songs, create and organize playlists, follow your favorite artists, and access your listening history across devices.
          </p>
          <div className="pt-2">
            <button
              onClick={() => promptAuth('library')}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-full text-xs transition shadow-lg shadow-emerald-500/20"
            >
              Log in or Sign up free
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Filter Tabs */}
          <div className="flex items-center gap-2">
            {(['all', 'playlists', 'artists'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition ${
                  filter === tab
                    ? 'bg-white text-black shadow'
                    : 'bg-neutral-800/80 text-neutral-300 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Items List */}
          <div className="space-y-2">
            {/* Liked Songs Tile */}
            {(filter === 'all' || filter === 'playlists') && (
              <div
                onClick={() => onNavigate({ type: 'liked' })}
                className="flex items-center gap-3.5 p-2.5 rounded-xl bg-[#16171a] hover:bg-[#202228] transition cursor-pointer border border-neutral-800/60"
              >
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-indigo-700 via-purple-600 to-pink-500 flex items-center justify-center text-white shrink-0 shadow">
                  <Heart className="w-7 h-7 fill-current" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-white truncate">Liked Songs</h3>
                  <p className="text-xs text-neutral-400">Auto-Playlist · {likedTracks.length} songs</p>
                </div>
              </div>
            )}

            {/* User Created Playlists */}
            {(filter === 'all' || filter === 'playlists') &&
              playlists.map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => onNavigate({ type: 'playlist', id: pl.id })}
                  className="flex items-center gap-3.5 p-2.5 rounded-xl bg-[#16171a] hover:bg-[#202228] transition cursor-pointer border border-neutral-800/60"
                >
                  <div className="w-14 h-14 rounded-lg bg-neutral-800 overflow-hidden shrink-0 flex items-center justify-center text-neutral-500">
                    {pl.coverArtUrl ? (
                      <img src={pl.coverArtUrl} alt={pl.title} className="w-full h-full object-cover" />
                    ) : (
                      <Music className="w-6 h-6" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-white truncate">{pl.title}</h3>
                    <p className="text-xs text-neutral-400">
                      Playlist · {pl.ownerName} · {pl.tracks.length} tracks
                    </p>
                  </div>
                </div>
              ))}

            {/* Empty Playlists State */}
            {(filter === 'playlists' || (filter === 'all' && playlists.length === 0)) && playlists.length === 0 && (
              <div className="py-8 px-4 rounded-xl border border-dashed border-neutral-800 text-center space-y-2">
                <p className="text-xs text-neutral-400">You haven't created any playlists yet.</p>
                <button
                  onClick={handleCreate}
                  className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-full text-xs font-semibold"
                >
                  Create your first playlist
                </button>
              </div>
            )}

            {/* Followed Artists */}
            {(filter === 'all' || filter === 'artists') &&
              followedArtists.map((artistName) => (
                <div
                  key={artistName}
                  onClick={() => onNavigate({ type: 'artist', id: artistName })}
                  className="flex items-center gap-3.5 p-2.5 rounded-xl bg-[#16171a] hover:bg-[#202228] transition cursor-pointer border border-neutral-800/60"
                >
                  <div className="w-14 h-14 rounded-full bg-neutral-800 flex items-center justify-center text-emerald-400 shrink-0">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-white truncate">{artistName}</h3>
                    <p className="text-xs text-neutral-400">Artist · Following</p>
                  </div>
                </div>
              ))}

            {(filter === 'artists' && followedArtists.length === 0) && (
              <div className="py-8 px-4 rounded-xl border border-dashed border-neutral-800 text-center space-y-2">
                <p className="text-xs text-neutral-400">You aren't following any artists yet.</p>
                <button
                  onClick={() => onNavigate({ type: 'search' })}
                  className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-full text-xs font-semibold"
                >
                  Discover artists
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
