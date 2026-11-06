/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Music,
  Play,
  Pause,
  Trash2,
  Search,
  Check,
  Sparkles,
  ArrowRight,
  ListPlus,
  Clock,
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useAudioEngine } from '../audio/AudioContext.tsx';
import { CURATED_FEATURED_TRACKS, searchMusic } from '../services/musicApi.ts';
import { Playlist, SoundifyTrack, ViewNavigation } from '../types/music.ts';
import { TrackActionMenu } from '../components/Track/TrackActionMenu.tsx';

interface CreateViewProps {
  onNavigate: (view: ViewNavigation) => void;
}

export const CreateView: React.FC<CreateViewProps> = ({ onNavigate }) => {
  const { playlists, createPlaylist, updatePlaylist, deletePlaylist, addTrackToPlaylist, removeTrackFromPlaylist } = useLibrary();
  const { user, isGuest, promptAuth } = useAuth();
  const { state, setQueue } = useAudioEngine();

  // Active playlist in the creation workspace
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

  // New playlist creation form state
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [descInput, setDescInput] = useState('');

  // Track search & recommendation state for populating playlist
  const [trackQuery, setTrackQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SoundifyTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Active playlist object
  const activePlaylist = playlists.find((p) => p.id === selectedPlaylistId) || playlists[0] || null;

  // On mount, if playlists exist and no selected, select the first
  useEffect(() => {
    if (!selectedPlaylistId && playlists.length > 0) {
      setSelectedPlaylistId(playlists[0].id);
    }
  }, [playlists, selectedPlaylistId]);

  // Handle searching for tracks to add
  useEffect(() => {
    if (!trackQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeout = setTimeout(() => {
      searchMusic(trackQuery).then((res) => {
        setSearchResults(res.tracks);
        setIsSearching(false);
      });
    }, 250);

    return () => clearTimeout(timeout);
  }, [trackQuery]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) {
      promptAuth('create_playlist');
      return;
    }

    const title = titleInput.trim() || `My Playlist #${playlists.length + 1}`;
    const newPl = createPlaylist(title, descInput.trim() || 'Created with Soundify');
    if (newPl) {
      setSelectedPlaylistId(newPl.id);
      setIsCreatingNew(false);
      setTitleInput('');
      setDescInput('');
    }
  };

  const handleAddTrack = (track: SoundifyTrack) => {
    if (!activePlaylist) {
      if (isGuest) {
        promptAuth('create_playlist');
        return;
      }
      const newPl = createPlaylist(`My Playlist #${playlists.length + 1}`);
      if (newPl) {
        setSelectedPlaylistId(newPl.id);
        addTrackToPlaylist(newPl.id, track);
      }
      return;
    }
    addTrackToPlaylist(activePlaylist.id, track);
  };

  const handlePlayPlaylist = () => {
    if (activePlaylist && activePlaylist.tracks.length > 0) {
      setQueue(activePlaylist.tracks, 0, true);
    }
  };

  const candidateRecommendations = CURATED_FEATURED_TRACKS.filter(
    (t) => !activePlaylist?.tracks.some((pt) => pt.id === t.id)
  );

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto pb-24 select-none">
      {/* 1. Header Bar with Creation Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-emerald-400" />
            <span>Create</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Build your personalized music collections, organize playlists, and find tracks.
          </p>
        </div>

        <button
          onClick={() => {
            if (isGuest) {
              promptAuth('create_playlist');
              return;
            }
            setIsCreatingNew(true);
            setTitleInput(`My Playlist #${playlists.length + 1}`);
          }}
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm rounded-full transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Playlist</span>
        </button>
      </div>

      {/* Guest Callout Banner */}
      {isGuest && (
        <div className="bg-[#181818] p-4 rounded-xl border border-neutral-800 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">Create an account to keep your playlists</h4>
            <p className="text-xs text-neutral-400">
              Your created playlists will be securely saved to your personal library across all devices.
            </p>
          </div>
          <button
            onClick={() => promptAuth('create_playlist')}
            className="px-4 py-2 bg-white hover:bg-neutral-200 text-black text-xs font-bold rounded-full transition shrink-0"
          >
            Sign up free
          </button>
        </div>
      )}

      {/* New Playlist Modal Form */}
      {isCreatingNew && (
        <div className="bg-[#181818] p-6 rounded-2xl border border-emerald-500/30 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          <h3 className="text-lg font-bold text-white mb-4">Create New Playlist</h3>
          <form onSubmit={handleCreateSubmit} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                Playlist Name
              </label>
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                placeholder="My Awesome Playlist"
                className="w-full bg-[#121212] border border-neutral-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                Description (optional)
              </label>
              <textarea
                value={descInput}
                onChange={(e) => setDescInput(e.target.value)}
                placeholder="Give your playlist a memorable description..."
                rows={2}
                className="w-full bg-[#121212] border border-neutral-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-full transition shadow"
              >
                Create Playlist
              </button>
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="px-4 py-2 bg-transparent hover:bg-white/10 text-neutral-300 hover:text-white font-semibold text-xs rounded-full transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. Playlist Switcher Pills (If user has multiple playlists) */}
      {playlists.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs text-neutral-400 font-semibold uppercase tracking-wider shrink-0 mr-1">
            Your Playlists:
          </span>
          {playlists.map((pl) => {
            const isSelected = activePlaylist?.id === pl.id;
            return (
              <button
                key={pl.id}
                onClick={() => setSelectedPlaylistId(pl.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition shrink-0 flex items-center gap-2 ${
                  isSelected
                    ? 'bg-white text-black shadow-md'
                    : 'bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700'
                }`}
              >
                <Music className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate max-w-[140px]">{pl.title}</span>
                <span className="text-[10px] opacity-60 font-mono">({pl.tracks.length})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* 3. Main Playlist Workspace or Empty State */}
      {activePlaylist ? (
        <div className="space-y-6">
          {/* Active Playlist Header Card */}
          <div className="bg-gradient-to-r from-neutral-800/90 to-neutral-900 p-5 sm:p-6 rounded-2xl border border-neutral-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-xl">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center shrink-0 shadow-lg overflow-hidden">
                {activePlaylist.coverArtUrl ? (
                  <img
                    src={activePlaylist.coverArtUrl}
                    alt={activePlaylist.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Music className="w-8 h-8 text-neutral-500" />
                )}
              </div>

              <div className="min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Playlist Workspace
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white truncate">{activePlaylist.title}</h2>
                <p className="text-xs text-neutral-400 mt-1 line-clamp-1">{activePlaylist.description}</p>
                <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1.5 font-mono">
                  <span>{activePlaylist.tracks.length} {activePlaylist.tracks.length === 1 ? 'track' : 'tracks'}</span>
                  <span>·</span>
                  <span>by {activePlaylist.ownerName}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
              {activePlaylist.tracks.length > 0 && (
                <button
                  onClick={handlePlayPlaylist}
                  className="w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition"
                  title="Play Playlist"
                >
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </button>
              )}

              <button
                onClick={() => onNavigate({ type: 'playlist', id: activePlaylist.id })}
                className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold transition"
                title="View Full Playlist Page"
              >
                Open Page
              </button>

              <button
                onClick={() => deletePlaylist(activePlaylist.id)}
                className="p-2 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded-lg transition"
                title="Delete Playlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Current Tracks in the Playlist */}
          {activePlaylist.tracks.length > 0 ? (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-neutral-300 uppercase tracking-wider">
                Tracks in Playlist ({activePlaylist.tracks.length})
              </h3>

              <div className="bg-[#181818] rounded-xl border border-neutral-800 divide-y divide-neutral-800/80 overflow-hidden">
                {activePlaylist.tracks.map((track, idx) => {
                  const isPlaying =
                    state.currentTrack?.id === track.id &&
                    (state.status === 'playing' || state.status === 'buffering');

                  return (
                    <div
                      key={`${track.id}-${idx}`}
                      className="flex items-center justify-between p-2.5 sm:p-3 hover:bg-neutral-800/60 transition group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="w-6 text-center text-xs font-mono text-neutral-500 group-hover:hidden">
                          {idx + 1}
                        </span>
                        <button
                          onClick={() => setQueue(activePlaylist.tracks, idx, true)}
                          className="w-6 text-center text-neutral-300 hover:text-white hidden group-hover:block"
                        >
                          <Play className="w-4 h-4 fill-current inline" />
                        </button>

                        <div className="w-10 h-10 rounded bg-neutral-800 overflow-hidden shrink-0 shadow">
                          <img
                            src={track.artworkUrl || ''}
                            alt={track.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className={`text-sm font-semibold truncate ${isPlaying ? 'text-emerald-400' : 'text-white'}`}>
                            {track.title}
                          </div>
                          <div className="text-xs text-neutral-400 truncate">{track.artist}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => removeTrackFromPlaylist(activePlaylist.id, idx)}
                          className="p-1.5 text-neutral-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition rounded"
                          title="Remove from playlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <TrackActionMenu track={track} onNavigate={onNavigate} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-[#181818] p-8 rounded-2xl border border-neutral-800 text-center space-y-3">
              <Music className="w-10 h-10 mx-auto text-neutral-500" />
              <h4 className="text-base font-bold text-white">Let's find something for your playlist</h4>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                Search for your favorite songs below or explore recommended tracks to add.
              </p>
            </div>
          )}

          {/* 4. Find & Add Songs Section */}
          <div className="space-y-4 pt-4 border-t border-neutral-800">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Recommended for this playlist</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Search songs or tap Add to build your tracklist.
              </p>
            </div>

            {/* Search Input for adding tracks */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={trackQuery}
                onChange={(e) => setTrackQuery(e.target.value)}
                placeholder="Search for songs or artists to add..."
                className="w-full bg-[#181818] border border-neutral-700/80 rounded-full pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Recommendations or Search Results List */}
            <div className="bg-[#181818] rounded-xl border border-neutral-800 divide-y divide-neutral-800/60 overflow-hidden">
              {(trackQuery.trim() ? searchResults : candidateRecommendations).map((track) => {
                const isAlreadyIn = activePlaylist.tracks.some((t) => t.id === track.id);

                return (
                  <div
                    key={track.id}
                    className="flex items-center justify-between p-2.5 sm:p-3 hover:bg-neutral-800/40 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded bg-neutral-800 overflow-hidden shrink-0 shadow">
                        <img
                          src={track.artworkUrl || ''}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-white truncate">{track.title}</div>
                        <div className="text-xs text-neutral-400 truncate">{track.artist}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isAlreadyIn ? (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-semibold border border-emerald-500/20">
                          <Check className="w-3.5 h-3.5" />
                          <span>Added</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddTrack(track)}
                          className="px-3.5 py-1.5 bg-neutral-800 hover:bg-white hover:text-black text-neutral-200 rounded-full text-xs font-bold transition flex items-center gap-1.5 border border-neutral-700 hover:border-white shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      )}

                      <TrackActionMenu track={track} onNavigate={onNavigate} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Empty State when user has 0 playlists yet */
        <div className="bg-[#181818] p-10 rounded-2xl border border-neutral-800 text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
            <Plus className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">Create your first playlist</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Organize your listening world. Name your playlist, discover music, and enjoy continuous playback.
          </p>
          <button
            onClick={() => {
              if (isGuest) {
                promptAuth('create_playlist');
                return;
              }
              setIsCreatingNew(true);
              setTitleInput('My Playlist #1');
            }}
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-full transition shadow-lg shadow-emerald-500/20"
          >
            Create Playlist
          </button>
        </div>
      )}
    </div>
  );
};
