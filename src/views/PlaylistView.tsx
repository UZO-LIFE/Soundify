/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Play,
  Pause,
  Shuffle,
  Clock,
  Heart,
  Trash2,
  ArrowUp,
  ArrowDown,
  Edit2,
  Check,
  Music,
  Plus,
} from 'lucide-react';
import { useAudioEngine } from '../audio/AudioContext.tsx';
import { useLibrary } from '../context/LibraryContext.tsx';
import { CURATED_FEATURED_PLAYLISTS, CURATED_FEATURED_TRACKS } from '../services/musicApi.ts';
import { Playlist, SoundifyTrack, ViewNavigation } from '../types/music.ts';
import { TrackActionMenu } from '../components/Track/TrackActionMenu.tsx';

function formatDuration(ms: number): string {
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

interface PlaylistViewProps {
  playlistId: string;
  onNavigate: (view: ViewNavigation) => void;
}

export const PlaylistView: React.FC<PlaylistViewProps> = ({ playlistId, onNavigate }) => {
  const { state, setQueue } = useAudioEngine();
  const {
    playlists,
    updatePlaylist,
    deletePlaylist,
    removeTrackFromPlaylist,
    reorderPlaylist,
    addTrackToPlaylist,
    isLiked,
    toggleLikeTrack,
  } = useLibrary();

  const playlist =
    playlists.find((p) => p.id === playlistId) ||
    CURATED_FEATURED_PLAYLISTS.find((p) => p.id === playlistId);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');

  if (!playlist) {
    return (
      <div className="p-8 text-center text-neutral-400">
        <p>Playlist not found.</p>
        <button
          onClick={() => onNavigate({ type: 'home' })}
          className="mt-4 px-4 py-2 bg-neutral-800 rounded-full text-white text-xs"
        >
          Return Home
        </button>
      </div>
    );
  }

  const totalDurationMs = playlist.tracks.reduce((acc, t) => acc + (t.durationMs || 180000), 0);
  const durationMinutes = Math.floor(totalDurationMs / 60000);

  const handlePlayAll = () => {
    if (playlist.tracks.length > 0) {
      setQueue(playlist.tracks, 0, true);
    }
  };

  const handleSaveTitle = () => {
    if (editedTitle.trim()) {
      updatePlaylist(playlist.id, { title: editedTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const isPlayingThisPlaylist =
    playlist.tracks.some((t) => t.id === state.currentTrack?.id) &&
    (state.status === 'playing' || state.status === 'buffering');

  return (
    <div className="select-none pb-16">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-b from-emerald-900/60 via-[#181a20] to-[#121212] p-6 sm:p-10 flex flex-col sm:flex-row items-start sm:items-end gap-6 border-b border-neutral-800/60">
        <div className="w-36 h-36 sm:w-48 sm:h-48 rounded-xl overflow-hidden bg-neutral-800 shrink-0 shadow-2xl border border-white/10 relative group">
          {playlist.coverArtUrl ? (
            <img src={playlist.coverArtUrl} alt={playlist.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-600">
              <Music className="w-16 h-16" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            {playlist.isCustom ? 'Custom Playlist' : 'Public Playlist'}
          </span>

          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="bg-neutral-800 text-white text-2xl sm:text-4xl font-extrabold px-3 py-1 rounded-lg border border-neutral-600 focus:outline-none focus:border-emerald-500 w-full"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
              />
              <button
                onClick={handleSaveTitle}
                className="p-2 bg-emerald-500 text-black rounded-lg hover:bg-emerald-400"
              >
                <Check className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 group">
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                {playlist.title}
              </h1>
              {playlist.isCustom && (
                <button
                  onClick={() => {
                    setEditedTitle(playlist.title);
                    setIsEditingTitle(true);
                  }}
                  className="p-1.5 text-neutral-500 hover:text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Rename playlist"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          <p className="text-xs sm:text-sm text-neutral-400 line-clamp-2">{playlist.description}</p>

          <div className="flex items-center gap-2 text-xs text-neutral-400 pt-1">
            <span className="font-semibold text-white">{playlist.ownerName}</span>
            <span>·</span>
            <span>{playlist.tracks.length} songs</span>
            <span>·</span>
            <span>about {durationMinutes} min</span>
          </div>
        </div>
      </div>

      {/* 2. Action Toolbar */}
      <div className="p-6 sm:px-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <button
            onClick={handlePlayAll}
            disabled={playlist.tracks.length === 0}
            className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition disabled:opacity-40"
            title="Play Playlist"
          >
            {isPlayingThisPlaylist ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={handlePlayAll}
            disabled={playlist.tracks.length === 0}
            className="p-3 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white transition disabled:opacity-40"
            title="Shuffle Playlist"
          >
            <Shuffle className="w-5 h-5" />
          </button>
        </div>

        {playlist.isCustom && (
          <button
            onClick={() => {
              deletePlaylist(playlist.id);
              onNavigate({ type: 'home' });
            }}
            className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 px-3 py-1.5 rounded-full border border-rose-900/60 transition flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Playlist</span>
          </button>
        )}
      </div>

      {/* 3. Tracklist Table */}
      <div className="px-4 sm:px-10 max-w-6xl">
        {playlist.tracks.length === 0 ? (
          <div className="py-12 border border-dashed border-neutral-800 rounded-xl text-center space-y-4 text-neutral-400">
            <Music className="w-12 h-12 mx-auto text-neutral-600" />
            <h3 className="text-base font-bold text-white">This playlist is empty</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Add some of today's top streaming hits to this playlist below.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {CURATED_FEATURED_TRACKS.slice(0, 3).map((track) => (
                <button
                  key={track.id}
                  onClick={() => addTrackToPlaylist(playlist.id, track)}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-full text-xs font-medium border border-neutral-700 transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{track.title}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-3 py-2 text-xs font-bold text-neutral-500 uppercase tracking-wider border-b border-neutral-800/80">
              <span className="col-span-1 text-center">#</span>
              <span className="col-span-6 sm:col-span-5">Title</span>
              <span className="hidden sm:block sm:col-span-4">Album</span>
              <span className="col-span-5 sm:col-span-2 text-right flex items-center justify-end gap-1">
                <Clock className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Rows */}
            {playlist.tracks.map((track, idx) => {
              const isCurrent = state.currentTrack?.id === track.id;
              const isCurrentlyLiked = isLiked(track.id);

              return (
                <div
                  key={`${track.id}-${idx}`}
                  onClick={() => setQueue(playlist.tracks, idx, true)}
                  className={`group grid grid-cols-12 gap-4 items-center px-3 py-2.5 rounded-lg transition border cursor-pointer ${
                    isCurrent
                      ? 'bg-emerald-950/40 border-emerald-800/60 text-white'
                      : 'bg-transparent border-transparent hover:bg-neutral-800/60 text-neutral-300'
                  }`}
                >
                  {/* # or Play */}
                  <div className="col-span-1 text-center text-xs font-mono text-neutral-400">
                    <span className="group-hover:hidden">{idx + 1}</span>
                    <Play className="w-3.5 h-3.5 fill-current hidden group-hover:block mx-auto text-white" />
                  </div>

                  {/* Title & Artist */}
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

                  {/* Album */}
                  <div className="hidden sm:block sm:col-span-4 text-xs text-neutral-400 truncate">
                    {track.album || 'Single'}
                  </div>

                  {/* Duration & Actions */}
                  <div className="col-span-5 sm:col-span-2 flex items-center justify-end gap-2.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLikeTrack(track);
                      }}
                      className={`p-1 rounded-full ${
                        isCurrentlyLiked
                          ? 'text-emerald-400'
                          : 'text-neutral-500 opacity-0 group-hover:opacity-100 hover:text-white'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isCurrentlyLiked ? 'fill-current' : ''}`} />
                    </button>

                    <span className="text-xs font-mono text-neutral-400 tabular-nums">
                      {track.durationMs ? formatDuration(track.durationMs) : '3:00'}
                    </span>

                    <TrackActionMenu track={track} onNavigate={onNavigate} />

                    {playlist.isCustom && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 ml-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            reorderPlaylist(playlist.id, idx, idx - 1);
                          }}
                          disabled={idx === 0}
                          className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white disabled:opacity-20"
                          title="Move up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            reorderPlaylist(playlist.id, idx, idx + 1);
                          }}
                          disabled={idx === playlist.tracks.length - 1}
                          className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white disabled:opacity-20"
                          title="Move down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeTrackFromPlaylist(playlist.id, idx);
                          }}
                          className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-rose-400"
                          title="Remove from playlist"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
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
