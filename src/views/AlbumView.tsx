/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Play, Pause, Shuffle, Heart, Clock, Music } from 'lucide-react';
import { searchMusic } from '../services/musicApi.ts';
import { useAudioEngine } from '../audio/AudioContext.tsx';
import { useLibrary } from '../context/LibraryContext.tsx';
import { Album, SoundifyTrack, ViewNavigation } from '../types/music.ts';
import { TrackActionMenu } from '../components/Track/TrackActionMenu.tsx';

function formatDuration(ms: number): string {
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

interface AlbumViewProps {
  albumTitle: string;
  onNavigate: (view: ViewNavigation) => void;
}

export const AlbumView: React.FC<AlbumViewProps> = ({ albumTitle, onNavigate }) => {
  const { state, setQueue } = useAudioEngine();
  const { isLiked, toggleLikeTrack } = useLibrary();
  const [album, setAlbum] = useState<Album | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    searchMusic(albumTitle).then((res) => {
      if (active) {
        const found = res.albums.find(
          (a) => a.title.toLowerCase() === albumTitle.toLowerCase()
        ) || res.albums[0];

        if (found) {
          setAlbum(found);
        } else if (res.tracks.length > 0) {
          // Construct album from track match
          setAlbum({
            id: `album-${albumTitle}`,
            title: albumTitle,
            artist: res.tracks[0].artist,
            artworkUrl: res.tracks[0].artworkUrl || '',
            releaseDate: res.tracks[0].releaseDate || '2024',
            totalTracks: res.tracks.length,
            tracks: res.tracks,
          });
        }
        setIsLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [albumTitle]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-16 text-neutral-400">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mr-3" />
        <span>Loading album...</span>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="p-8 text-center text-neutral-400">
        <p>Album not found.</p>
        <button
          onClick={() => onNavigate({ type: 'home' })}
          className="mt-4 px-4 py-2 bg-neutral-800 rounded-full text-white text-xs"
        >
          Return Home
        </button>
      </div>
    );
  }

  const handlePlayAll = () => {
    if (album.tracks.length > 0) {
      setQueue(album.tracks, 0, true);
    }
  };

  const isPlayingThisAlbum =
    album.tracks.some((t) => t.id === state.currentTrack?.id) &&
    (state.status === 'playing' || state.status === 'buffering');

  return (
    <div className="select-none pb-16">
      {/* Banner */}
      <div className="bg-gradient-to-b from-neutral-800/80 via-[#181a20] to-[#121212] p-6 sm:p-10 flex flex-col sm:flex-row items-start sm:items-end gap-6 border-b border-neutral-800/60">
        <div className="w-36 h-36 sm:w-48 sm:h-48 rounded-xl overflow-hidden bg-neutral-800 shrink-0 shadow-2xl border border-white/10">
          <img src={album.artworkUrl} alt={album.title} className="w-full h-full object-cover" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Album</span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {album.title}
          </h1>

          <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-300">
            <span
              onClick={() => onNavigate({ type: 'artist', id: album.artist })}
              className="font-bold text-white hover:underline cursor-pointer"
            >
              {album.artist}
            </span>
            <span>·</span>
            <span>{album.releaseDate}</span>
            <span>·</span>
            <span>{album.tracks.length} songs</span>
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="p-6 sm:px-10 flex items-center gap-5">
        <button
          onClick={handlePlayAll}
          disabled={album.tracks.length === 0}
          className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition disabled:opacity-40"
          title="Play Album"
        >
          {isPlayingThisAlbum ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 fill-current ml-0.5" />
          )}
        </button>

        <button
          onClick={handlePlayAll}
          disabled={album.tracks.length === 0}
          className="p-3 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white transition disabled:opacity-40"
          title="Shuffle Album"
        >
          <Shuffle className="w-5 h-5" />
        </button>
      </div>

      {/* Tracklist Table */}
      <div className="px-4 sm:px-10 max-w-5xl">
        <div className="space-y-1">
          <div className="grid grid-cols-12 gap-4 px-3 py-2 text-xs font-bold text-neutral-500 uppercase tracking-wider border-b border-neutral-800/80">
            <span className="col-span-1 text-center">#</span>
            <span className="col-span-8">Title</span>
            <span className="col-span-3 text-right flex items-center justify-end gap-1">
              <Clock className="w-3.5 h-3.5" />
            </span>
          </div>

          {album.tracks.map((track, idx) => {
            const isCurrent = state.currentTrack?.id === track.id;
            const isCurrentlyLiked = isLiked(track.id);

            return (
              <div
                key={track.id}
                onClick={() => setQueue(album.tracks, idx, true)}
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

                <div className="col-span-8 min-w-0">
                  <div className={`text-sm font-semibold truncate ${isCurrent ? 'text-emerald-400' : 'text-white'}`}>
                    {track.title}
                  </div>
                  <div className="text-xs text-neutral-400 truncate">{track.artist}</div>
                </div>

                <div className="col-span-3 flex items-center justify-end gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLikeTrack(track);
                    }}
                    className={`p-1.5 rounded-full ${
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
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
