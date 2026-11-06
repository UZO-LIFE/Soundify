/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Play, Pause, Sparkles, Flame, Radio, Heart } from 'lucide-react';
import { useAudioEngine } from '../audio/AudioContext.tsx';
import { useLibrary } from '../context/LibraryContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import {
  CURATED_FEATURED_PLAYLISTS,
  CURATED_FEATURED_TRACKS,
  POPULAR_ARTISTS_CATALOGUE,
} from '../services/musicApi.ts';
import {
  getQuickPicks,
  getMadeForYou,
  getOnRepeat,
  getForgottenFavorites,
  getSimilarTracks,
  MOOD_CATEGORIES,
  GENRE_CATEGORIES,
  MoodCategory,
} from '../services/recommendationEngine.ts';
import { Playlist, SoundifyTrack, ViewNavigation } from '../types/music.ts';
import { TrackActionMenu } from '../components/Track/TrackActionMenu.tsx';

interface HomeViewProps {
  onNavigate: (view: ViewNavigation) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  const { state, setQueue } = useAudioEngine();
  const library = useLibrary();
  const { user, isGuest } = useAuth();

  const [activeFilter, setActiveFilter] = useState<'all' | 'music' | 'podcasts'>('all');

  // Time-based personalized greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    let timeGreeting = 'Good morning';
    if (hour >= 12 && hour < 18) timeGreeting = 'Good afternoon';
    if (hour >= 18) timeGreeting = 'Good evening';

    if (user?.displayName) {
      return `${timeGreeting}, ${user.displayName}`;
    }
    return timeGreeting;
  };

  const handlePlayPlaylist = (playlist: Playlist, e: React.MouseEvent) => {
    e.stopPropagation();
    if (playlist.tracks.length > 0) {
      setQueue(playlist.tracks, 0, true);
    }
  };

  const handlePlayTrack = (track: SoundifyTrack, pool: SoundifyTrack[], e: React.MouseEvent) => {
    e.stopPropagation();
    setQueue([track, ...pool.filter((t) => t.id !== track.id)], 0, true);
  };

  // Memoized recommendations based on real behavioral signals and catalog
  const quickPicks = useMemo(
    () => getQuickPicks(user, library, CURATED_FEATURED_TRACKS),
    [user?.id, library.recentlyPlayed]
  );

  const madeForYou = useMemo(
    () => getMadeForYou(user, library, CURATED_FEATURED_TRACKS),
    [user?.id, library.likedTracks, library.playlists, library.followedArtists]
  );

  const onRepeat = useMemo(
    () => getOnRepeat(user, CURATED_FEATURED_TRACKS),
    [user?.id]
  );

  const forgottenFavorites = useMemo(
    () => getForgottenFavorites(user, library, CURATED_FEATURED_TRACKS),
    [user?.id, library.recentlyPlayed, library.likedTracks]
  );

  const currentTrack = state.currentTrack as SoundifyTrack | null;
  const similarTracks = useMemo(
    () => getSimilarTracks(currentTrack, CURATED_FEATURED_TRACKS),
    [currentTrack?.id]
  );

  return (
    <div className="p-4 sm:p-8 space-y-9 max-w-7xl mx-auto pb-24 select-none">
      {/* 1. Header Greeting & Spotify Filter Pills */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {getGreeting()}
          </h1>
          {isGuest && (
            <span className="text-xs text-neutral-400 self-start sm:self-auto">
              Listening in Guest Mode
            </span>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
              activeFilter === 'all'
                ? 'bg-white text-black shadow'
                : 'bg-neutral-800/90 text-neutral-300 hover:text-white hover:bg-neutral-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter('music')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
              activeFilter === 'music'
                ? 'bg-white text-black shadow'
                : 'bg-neutral-800/90 text-neutral-300 hover:text-white hover:bg-neutral-700'
            }`}
          >
            Music
          </button>
          <button
            onClick={() => setActiveFilter('podcasts')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
              activeFilter === 'podcasts'
                ? 'bg-white text-black shadow'
                : 'bg-neutral-800/90 text-neutral-300 hover:text-white hover:bg-neutral-700'
            }`}
          >
            Podcasts & Shows
          </button>
        </div>
      </div>

      {/* 2. Top 6 Quick Picks / Continue Listening Hero Grid */}
      {quickPicks.length > 0 && activeFilter !== 'podcasts' && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickPicks.map((track, idx) => {
            const isPlayingThisTrack =
              state.currentTrack?.id === track.id &&
              (state.status === 'playing' || state.status === 'buffering');

            return (
              <div
                key={`${track.id}-${idx}`}
                onClick={(e) => handlePlayTrack(track, quickPicks, e)}
                className="group relative flex items-center bg-[#242424]/70 hover:bg-[#2e2e2e] rounded-md overflow-hidden transition-all duration-200 cursor-pointer shadow-sm border border-white/5"
              >
                <div className="w-14 sm:w-16 h-14 sm:h-16 shrink-0 bg-neutral-800 relative">
                  <img
                    src={track.artworkUrl || ''}
                    alt={track.title}
                    className="w-full h-full object-cover shadow"
                  />
                </div>

                <div className="px-3.5 flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{track.title}</p>
                  <p className="text-xs text-neutral-400 truncate">{track.artist}</p>
                </div>

                <div className="flex items-center gap-1 mr-3 shrink-0">
                  <button
                    onClick={(e) => handlePlayTrack(track, quickPicks, e)}
                    className={`w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-105 active:scale-95 ${
                      isPlayingThisTrack
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0'
                    }`}
                    title="Play"
                  >
                    {isPlayingThisTrack ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>

                  <TrackActionMenu track={track} onNavigate={onNavigate} />
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* 3. Made For You (Scored Recommendations) */}
      {madeForYou.length > 0 && activeFilter !== 'podcasts' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <span>Made For You</span>
              </h2>
              <p className="text-xs text-neutral-400">Personalized music selections tuned to your listening signals</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {madeForYou.slice(0, 4).map((track, idx) => {
              const isPlaying =
                state.currentTrack?.id === track.id &&
                (state.status === 'playing' || state.status === 'buffering');

              return (
                <div
                  key={`mfy-${track.id}-${idx}`}
                  onClick={(e) => handlePlayTrack(track, madeForYou, e)}
                  className="group bg-[#181818] hover:bg-[#282828] p-3.5 rounded-xl transition-all duration-200 cursor-pointer border border-white/5 flex flex-col relative"
                >
                  <div className="aspect-square w-full rounded-lg overflow-hidden bg-neutral-800 mb-3 relative shadow-md">
                    <img
                      src={track.artworkUrl || ''}
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    <button
                      onClick={(e) => handlePlayTrack(track, madeForYou, e)}
                      className={`absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center shadow-xl transition-all duration-200 hover:scale-105 ${
                        isPlaying
                          ? 'opacity-100 translate-y-0'
                          : 'opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0'
                      }`}
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h3 className={`text-sm font-bold truncate ${isPlaying ? 'text-emerald-400' : 'text-white'}`}>
                      {track.title}
                    </h3>
                    <TrackActionMenu track={track} onNavigate={onNavigate} />
                  </div>
                  <p className="text-xs text-neutral-400 truncate">{track.artist}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. Conditional Section: On Repeat (Only shown when genuine repeat listens exist) */}
      {onRepeat.length > 0 && activeFilter !== 'podcasts' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                <span>On Repeat</span>
              </h2>
              <p className="text-xs text-neutral-400">The tracks you've had on continuous replay</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {onRepeat.slice(0, 4).map((track, idx) => {
              const isPlaying =
                state.currentTrack?.id === track.id &&
                (state.status === 'playing' || state.status === 'buffering');

              return (
                <div
                  key={`rep-${track.id}-${idx}`}
                  onClick={(e) => handlePlayTrack(track, onRepeat, e)}
                  className="group bg-[#181818] hover:bg-[#282828] p-3.5 rounded-xl transition-all duration-200 cursor-pointer border border-white/5 flex flex-col relative"
                >
                  <div className="aspect-square w-full rounded-lg overflow-hidden bg-neutral-800 mb-3 relative shadow-md">
                    <img
                      src={track.artworkUrl || ''}
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    <button
                      onClick={(e) => handlePlayTrack(track, onRepeat, e)}
                      className={`absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center shadow-xl transition-all duration-200 hover:scale-105 ${
                        isPlaying
                          ? 'opacity-100 translate-y-0'
                          : 'opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0'
                      }`}
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h3 className={`text-sm font-bold truncate ${isPlaying ? 'text-emerald-400' : 'text-white'}`}>
                      {track.title}
                    </h3>
                    <TrackActionMenu track={track} onNavigate={onNavigate} />
                  </div>
                  <p className="text-xs text-neutral-400 truncate">{track.artist}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. Conditional Section: Forgotten Favorites (Liked or played in past, not recently) */}
      {forgottenFavorites.length > 0 && activeFilter !== 'podcasts' && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Forgotten Favorites</h2>
            <p className="text-xs text-neutral-400">Rediscover beloved songs you haven't played in a while</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {forgottenFavorites.slice(0, 4).map((track, idx) => {
              const isPlaying =
                state.currentTrack?.id === track.id &&
                (state.status === 'playing' || state.status === 'buffering');

              return (
                <div
                  key={`ff-${track.id}-${idx}`}
                  onClick={(e) => handlePlayTrack(track, forgottenFavorites, e)}
                  className="group bg-[#181818] hover:bg-[#282828] p-3.5 rounded-xl transition-all duration-200 cursor-pointer border border-white/5 flex flex-col relative"
                >
                  <div className="aspect-square w-full rounded-lg overflow-hidden bg-neutral-800 mb-3 relative shadow-md">
                    <img
                      src={track.artworkUrl || ''}
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    <button
                      onClick={(e) => handlePlayTrack(track, forgottenFavorites, e)}
                      className={`absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center shadow-xl transition-all duration-200 hover:scale-105 ${
                        isPlaying
                          ? 'opacity-100 translate-y-0'
                          : 'opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0'
                      }`}
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h3 className={`text-sm font-bold truncate ${isPlaying ? 'text-emerald-400' : 'text-white'}`}>
                      {track.title}
                    </h3>
                    <TrackActionMenu track={track} onNavigate={onNavigate} />
                  </div>
                  <p className="text-xs text-neutral-400 truncate">{track.artist}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 6. Mood & Activity Discovery Shelf */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Mood & Activity</h2>
          <p className="text-xs text-neutral-400">Curated soundtracks for every moment of your day</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {MOOD_CATEGORIES.map((mood) => (
            <div
              key={mood.id}
              onClick={() => onNavigate({ type: 'search', id: mood.searchQuery })}
              className={`group relative p-4 rounded-xl bg-gradient-to-br ${mood.gradient} overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform duration-200 shadow-md flex flex-col justify-between h-32`}
            >
              <h3 className="text-sm font-bold text-white z-10 leading-tight">{mood.name}</h3>
              <p className="text-[11px] text-white/70 line-clamp-2 z-10">{mood.description}</p>
              <div className="absolute -bottom-2 -right-2 w-16 h-16 rounded-lg overflow-hidden shadow-lg transform rotate-12 group-hover:rotate-6 transition-transform">
                <img src={mood.coverArt} alt={mood.name} className="w-full h-full object-cover" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Trending Tracks Right Now (With zero technical badges!) */}
      {activeFilter !== 'podcasts' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Trending Right Now</h2>
              <p className="text-xs text-neutral-400">Stream top tracks across global charts</p>
            </div>
            <button
              onClick={() => onNavigate({ type: 'search' })}
              className="text-xs font-semibold text-neutral-400 hover:text-white transition"
            >
              See all
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {CURATED_FEATURED_TRACKS.map((track, idx) => {
              const isPlaying =
                state.currentTrack?.id === track.id &&
                (state.status === 'playing' || state.status === 'buffering');

              return (
                <div
                  key={`trend-${track.id}-${idx}`}
                  onClick={(e) => handlePlayTrack(track, CURATED_FEATURED_TRACKS, e)}
                  className="group bg-[#181818] hover:bg-[#282828] p-3.5 rounded-xl transition-all duration-200 cursor-pointer border border-white/5 flex flex-col relative"
                >
                  <div className="aspect-square w-full rounded-lg overflow-hidden bg-neutral-800 mb-3 relative shadow-md">
                    <img
                      src={track.artworkUrl || ''}
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    <button
                      onClick={(e) => handlePlayTrack(track, CURATED_FEATURED_TRACKS, e)}
                      className={`absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center shadow-xl transition-all duration-200 hover:scale-105 ${
                        isPlaying
                          ? 'opacity-100 translate-y-0'
                          : 'opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0'
                      }`}
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h3 className={`text-sm font-bold truncate ${isPlaying ? 'text-emerald-400' : 'text-white'}`}>
                      {track.title}
                    </h3>
                    <TrackActionMenu track={track} onNavigate={onNavigate} />
                  </div>
                  <p className="text-xs text-neutral-400 truncate">{track.artist}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 8. Genre Discovery */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Genre Discovery</h2>
          <p className="text-xs text-neutral-400">Explore sounds from around the globe</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {GENRE_CATEGORIES.map((genre) => (
            <button
              key={genre.id}
              onClick={() => onNavigate({ type: 'search', id: genre.query })}
              className={`${genre.color} hover:brightness-110 p-3 rounded-xl text-left text-white font-bold text-xs shadow transition transform hover:scale-105 flex flex-col justify-between h-20`}
            >
              <span>{genre.name}</span>
              <span className="text-[10px] opacity-75 font-normal">Explore →</span>
            </button>
          ))}
        </div>
      </section>

      {/* 9. Featured Editorial Playlists */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Featured Playlists</h2>
            <p className="text-xs text-neutral-400">Curated collections from Soundify editorial</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {CURATED_FEATURED_PLAYLISTS.map((pl) => (
            <div
              key={pl.id}
              onClick={() => onNavigate({ type: 'playlist', id: pl.id })}
              className="group bg-[#181818] hover:bg-[#282828] p-3.5 rounded-xl transition-all duration-200 cursor-pointer border border-white/5 relative flex flex-col"
            >
              <div className="aspect-square w-full rounded-lg overflow-hidden bg-neutral-800 mb-3 relative shadow-md">
                <img
                  src={pl.coverArtUrl}
                  alt={pl.title}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                />
                <button
                  onClick={(e) => handlePlayPlaylist(pl, e)}
                  className="absolute bottom-2.5 right-2.5 w-11 h-11 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 hover:scale-105"
                  title="Play Playlist"
                >
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </button>
              </div>

              <h3 className="text-sm font-bold text-white truncate mb-1">{pl.title}</h3>
              <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                {pl.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 10. Popular Artists */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight">Popular Artists</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {POPULAR_ARTISTS_CATALOGUE.map((artist, idx) => (
            <div
              key={`${artist.id}-${idx}`}
              onClick={() => onNavigate({ type: 'artist', id: artist.name })}
              className="group bg-[#181818] hover:bg-[#282828] p-4 rounded-xl transition-all duration-200 cursor-pointer border border-white/5 flex flex-col items-center text-center"
            >
              <div className="w-28 h-28 rounded-full overflow-hidden bg-neutral-800 mb-3 shadow-lg relative">
                <img
                  src={artist.avatarUrl}
                  alt={artist.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <h3 className="text-sm font-bold text-white truncate w-full">{artist.name}</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                {(artist.monthlyListeners / 1000000).toFixed(1)}M monthly listeners
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
