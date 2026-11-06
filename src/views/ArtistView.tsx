/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Play, Pause, Shuffle, Heart, BadgeCheck, Music, Check } from 'lucide-react';
import { getArtistDetails } from '../services/musicApi.ts';
import { useAudioEngine } from '../audio/AudioContext.tsx';
import { useLibrary } from '../context/LibraryContext.tsx';
import { Artist, SoundifyTrack, ViewNavigation } from '../types/music.ts';
import { TrackActionMenu } from '../components/Track/TrackActionMenu.tsx';

interface ArtistViewProps {
  artistName: string;
  onNavigate: (view: ViewNavigation) => void;
}

export const ArtistView: React.FC<ArtistViewProps> = ({ artistName, onNavigate }) => {
  const { state, setQueue, togglePlay } = useAudioEngine();
  const { isLiked, toggleLikeTrack, isFollowingArtist, toggleFollowArtist } = useLibrary();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    getArtistDetails(artistName).then((res) => {
      if (active) {
        setArtist(res);
        setIsLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [artistName]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-16 text-neutral-400">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mr-3" />
        <span>Loading artist profile...</span>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="p-8 text-center text-neutral-400">
        <p>Artist profile not found.</p>
        <button
          onClick={() => onNavigate({ type: 'home' })}
          className="mt-4 px-4 py-2 bg-neutral-800 rounded-full text-white text-xs"
        >
          Return Home
        </button>
      </div>
    );
  }

  const isFollowing = isFollowingArtist(artist.name);

  const handlePlayAll = (shuffle: boolean = false) => {
    if (artist.popularTracks.length > 0) {
      setQueue(artist.popularTracks, 0, true);
    }
  };

  const isPlayingThisArtist =
    state.currentTrack?.artist.toLowerCase() === artist.name.toLowerCase() &&
    (state.status === 'playing' || state.status === 'buffering');

  return (
    <div className="select-none pb-16">
      {/* 1. Artist Hero Banner */}
      <div className="relative min-h-[300px] sm:min-h-[360px] bg-gradient-to-b from-neutral-800 via-neutral-900 to-[#121212] p-6 sm:p-10 flex flex-col justify-end overflow-hidden">
        {artist.avatarUrl && (
          <div className="absolute inset-0 z-0">
            <img
              src={artist.avatarUrl}
              alt={artist.name}
              className="w-full h-full object-cover object-top opacity-30 blur-sm scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/60 to-transparent" />
          </div>
        )}

        <div className="relative z-10 space-y-2">
          {artist.isVerified && (
            <div className="flex items-center gap-1.5 text-xs text-sky-400 font-medium">
              <BadgeCheck className="w-4 h-4 fill-sky-400 text-black" />
              <span>Verified Artist</span>
            </div>
          )}

          <h1 className="text-3xl sm:text-6xl font-black text-white tracking-tight drop-shadow-md">
            {artist.name}
          </h1>

          <p className="text-xs sm:text-sm text-neutral-300 font-mono">
            {(artist.monthlyListeners || 20000000).toLocaleString()} monthly listeners
          </p>
        </div>
      </div>

      {/* 2. Actions Toolbar */}
      <div className="p-6 sm:p-8 flex items-center gap-5">
        <button
          onClick={() => handlePlayAll(false)}
          className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition"
          title="Play"
        >
          {isPlayingThisArtist ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 fill-current ml-0.5" />
          )}
        </button>

        <button
          onClick={() => handlePlayAll(true)}
          className="p-3 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white transition"
          title="Shuffle"
        >
          <Shuffle className="w-5 h-5" />
        </button>

        <button
          onClick={() => toggleFollowArtist(artist.name)}
          className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition flex items-center gap-1.5 ${
            isFollowing
              ? 'bg-neutral-800 border-neutral-700 text-emerald-400'
              : 'bg-transparent border-neutral-500 text-white hover:border-white'
          }`}
        >
          {isFollowing && <Check className="w-3.5 h-3.5" />}
          <span>{isFollowing ? 'Following' : 'Follow'}</span>
        </button>
      </div>

      {/* 3. Popular Tracks Table */}
      <div className="px-6 sm:px-8 space-y-4 max-w-5xl">
        <h2 className="text-xl font-bold text-white tracking-tight">Popular Tracks</h2>

        <div className="space-y-1">
          {artist.popularTracks.slice(0, 10).map((track, idx) => {
            const isCurrent = state.currentTrack?.id === track.id;
            const isCurrentlyLiked = isLiked(track.id);

            return (
              <div
                key={track.id}
                onClick={() => setQueue(artist.popularTracks, idx, true)}
                className={`group flex items-center justify-between p-2.5 rounded-lg transition border cursor-pointer ${
                  isCurrent
                    ? 'bg-emerald-950/40 border-emerald-800/60 text-white'
                    : 'bg-transparent border-transparent hover:bg-neutral-800/60 text-neutral-300'
                }`}
              >
                {/* Left: Index / Play & Title */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <span className="w-4 text-center text-xs font-mono text-neutral-500 group-hover:hidden">
                    {idx + 1}
                  </span>
                  <div className="w-4 text-center hidden group-hover:block text-white">
                    <Play className="w-3.5 h-3.5 fill-current mx-auto" />
                  </div>

                  <div className="w-10 h-10 rounded bg-neutral-800 overflow-hidden shrink-0">
                    <img src={track.artworkUrl || ''} alt={track.title} className="w-full h-full object-cover" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className={`text-sm font-semibold truncate ${isCurrent ? 'text-emerald-400' : 'text-white'}`}>
                      {track.title}
                    </div>
                    <div className="text-xs text-neutral-400 truncate">{track.album}</div>
                  </div>
                </div>

                {/* Right: Like & Duration */}
                <div className="flex items-center gap-4 shrink-0">
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
                    {track.durationMs
                      ? `${Math.floor(track.durationMs / 60000)}:${Math.floor((track.durationMs % 60000) / 1000).toString().padStart(2, '0')}`
                      : '3:00'}
                  </span>

                  <TrackActionMenu track={track} onNavigate={onNavigate} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Discography / Albums */}
      {artist.albums && artist.albums.length > 0 && (
        <div className="px-6 sm:px-8 mt-10 space-y-4 max-w-5xl">
          <h2 className="text-xl font-bold text-white tracking-tight">Discography</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {artist.albums.map((album, idx) => (
              <div
                key={`${album.id}-${idx}`}
                onClick={() => onNavigate({ type: 'album', id: album.title })}
                className="group bg-[#181818] hover:bg-[#282828] p-3.5 rounded-xl transition cursor-pointer border border-neutral-800/80 flex flex-col"
              >
                <div className="aspect-square w-full rounded-lg overflow-hidden bg-neutral-800 mb-2.5 shadow">
                  <img src={album.artworkUrl} alt={album.title} className="w-full h-full object-cover" />
                </div>
                <h4 className="text-sm font-bold text-white truncate">{album.title}</h4>
                <p className="text-xs text-neutral-400">{album.releaseDate} · Album</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. About Section */}
      <div className="px-6 sm:px-8 mt-10 max-w-3xl">
        <div className="bg-[#181818] p-6 rounded-2xl border border-neutral-800 space-y-3">
          <h3 className="text-lg font-bold text-white">About {artist.name}</h3>
          <p className="text-sm text-neutral-300 leading-relaxed">{artist.bio}</p>
        </div>
      </div>
    </div>
  );
};
