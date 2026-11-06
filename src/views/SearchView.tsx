/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useTransition } from 'react';
import { Search, Play, Pause, Heart, Music, Mic2, Disc3, ShieldAlert } from 'lucide-react';
import { searchMusic } from '../services/musicApi.ts';
import { useAudioEngine } from '../audio/AudioContext.tsx';
import { useLibrary } from '../context/LibraryContext.tsx';
import { Album, Artist, SoundifyTrack, ViewNavigation } from '../types/music.ts';
import { TrackActionMenu } from '../components/Track/TrackActionMenu.tsx';

interface SearchViewProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onNavigate: (view: ViewNavigation) => void;
}

const BROWSE_CATEGORIES = [
  { id: 'pop', title: 'Pop', color: 'from-pink-600 to-rose-700', query: 'pop' },
  { id: 'hiphop', title: 'Hip-Hop', color: 'from-orange-600 to-amber-700', query: 'hip hop' },
  { id: 'afrobeats', title: 'Afrobeats', color: 'from-amber-600 to-yellow-700', query: 'burna boy' },
  { id: 'electronic', title: 'Electronic / Dance', color: 'from-cyan-600 to-blue-700', query: 'electronic' },
  { id: 'rnb', title: 'R&B / Soul', color: 'from-indigo-600 to-purple-800', query: 'r&b' },
  { id: 'acoustic', title: 'Acoustic & Chill', color: 'from-emerald-600 to-teal-800', query: 'acoustic' },
  { id: 'rock', title: 'Rock & Alternative', color: 'from-red-600 to-rose-900', query: 'rock' },
  { id: 'indie', title: 'Indie & Underground', color: 'from-purple-600 to-violet-900', query: 'indie' },
];

export const SearchView: React.FC<SearchViewProps> = ({
  searchQuery,
  onSearchChange,
  onNavigate,
}) => {
  const { state, setQueue } = useAudioEngine();
  const { isLiked, toggleLikeTrack, searchHistory, addSearchHistory, clearSearchHistory } = useLibrary();

  const [activeTab, setActiveTab] = useState<'all' | 'songs' | 'artists' | 'albums'>('all');
  const [results, setResults] = useState<{ tracks: SoundifyTrack[]; artists: Artist[]; albums: Album[] }>({
    tracks: [],
    artists: [],
    albums: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [, startTransition] = useTransition();

  // Debounced search effect
  useEffect(() => {
    let active = true;
    if (!searchQuery.trim()) {
      setResults({ tracks: [], artists: [], albums: [] });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timeout = setTimeout(() => {
      searchMusic(searchQuery).then((res) => {
        if (active) {
          startTransition(() => {
            setResults(res);
            setIsLoading(false);
            addSearchHistory(searchQuery);
          });
        }
      });
    }, 250);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [searchQuery]);

  const handlePlayTrack = (track: SoundifyTrack) => {
    setQueue([track, ...results.tracks.filter((t) => t.id !== track.id)], 0, true);
  };

  const topResultTrack = results.tracks[0];

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto pb-16 select-none">
      {/* Search Input (Mobile visible or secondary desktop) */}
      <div className="relative sm:hidden">
        <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Artists, songs, or albums..."
          className="w-full bg-neutral-800 text-white placeholder-neutral-400 text-sm pl-11 pr-4 py-3 rounded-full border border-neutral-700 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Recent Searches (Only shown if user has genuine history) */}
      {searchHistory.length > 0 && !searchQuery.trim() && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Recent Searches</span>
            <button
              onClick={clearSearchHistory}
              className="text-xs text-neutral-500 hover:text-white transition"
            >
              Clear
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {searchHistory.map((term) => (
              <button
                key={term}
                onClick={() => onSearchChange(term)}
                className="px-3 py-1.5 bg-neutral-800/90 hover:bg-neutral-700 text-white text-xs rounded-full border border-neutral-700/80 transition flex items-center gap-1.5"
              >
                <span>{term}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Quick Searches (Public discovery) */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs text-neutral-500 font-medium">Try searching:</span>
        {['Ed Sheeran — Shivers', 'Burna Boy', 'Drake', 'James Arthur', 'LOUDWERX'].map((term) => (
          <button
            key={term}
            onClick={() => onSearchChange(term)}
            className="px-2.5 py-1 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 text-xs rounded-full border border-neutral-700/60 transition"
          >
            {term}
          </button>
        ))}
      </div>

      {/* When NO query: Show Browse All Categories */}
      {!searchQuery.trim() ? (
        <section className="space-y-4 pt-2">
          <h2 className="text-xl font-bold text-white tracking-tight">Browse All Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {BROWSE_CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                onClick={() => onSearchChange(cat.query)}
                className={`h-32 sm:h-40 rounded-xl p-4 bg-gradient-to-br ${cat.color} relative overflow-hidden cursor-pointer hover:scale-102 transition-transform shadow-lg group`}
              >
                <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                  {cat.title}
                </h3>
                <div className="absolute -bottom-2 -right-3 w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-black/20 shadow-2xl rotate-25 group-hover:rotate-15 transition-transform flex items-center justify-center text-white/40">
                  <Music className="w-10 h-10" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        /* When SEARCH QUERY ACTIVE */
        <div className="space-y-6">
          {/* Segmented Filter Tabs */}
          <div className="flex items-center gap-2 border-b border-neutral-800/80 pb-3">
            {(['all', 'songs', 'artists', 'albums'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition ${
                  activeTab === tab
                    ? 'bg-white text-black shadow'
                    : 'bg-neutral-800/60 text-neutral-300 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 text-neutral-400 text-xs py-4">
              <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span>Searching authorized music catalogs...</span>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && results.tracks.length === 0 && results.artists.length === 0 && (
            <div className="text-center py-16 text-neutral-400 space-y-3">
              <Search className="w-10 h-10 mx-auto text-neutral-600 mb-2" />
              <h3 className="text-lg font-bold text-white">No results found for "{searchQuery}"</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
                Please check the spelling or search for verified artists like Ed Sheeran, Burna Boy, Drake, or James Arthur.
              </p>
            </div>
          )}

          {/* Top Result + Songs (All View) */}
          {(activeTab === 'all' || activeTab === 'songs') && topResultTrack && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Top Result Card (5 cols) */}
              {activeTab === 'all' && (
                <div className="lg:col-span-5 space-y-3">
                  <h3 className="text-lg font-bold text-white">Top Result</h3>
                  <div
                    onClick={() => handlePlayTrack(topResultTrack)}
                    className="group bg-[#181818] hover:bg-[#282828] p-5 rounded-2xl transition duration-200 cursor-pointer border border-neutral-800 relative flex flex-col justify-between h-[230px]"
                  >
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-neutral-800 shadow-md">
                      <img
                        src={topResultTrack.artworkUrl || ''}
                        alt={topResultTrack.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div>
                      <h4 className="text-xl font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                        {topResultTrack.title}
                      </h4>
                      <p className="text-xs text-neutral-400 mt-1">
                        Song · <span className="text-neutral-200 font-medium">{topResultTrack.artist}</span>
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayTrack(topResultTrack);
                      }}
                      className="absolute bottom-5 right-5 w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all hover:scale-105"
                      title="Play"
                    >
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Songs List (7 cols or 12 cols) */}
              <div className={`${activeTab === 'all' ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-3`}>
                <h3 className="text-lg font-bold text-white">Songs</h3>
                <div className="space-y-1">
                  {results.tracks.slice(0, activeTab === 'all' ? 4 : 20).map((track, idx) => {
                    const isCurrent = state.currentTrack?.id === track.id;
                    const isCurrentlyLiked = isLiked(track.id);

                    return (
                      <div
                        key={`${track.id}-${idx}`}
                        onClick={() => handlePlayTrack(track)}
                        className={`group flex items-center justify-between p-2 rounded-lg transition border cursor-pointer ${
                          isCurrent
                            ? 'bg-emerald-950/40 border-emerald-800/60 text-white'
                            : 'bg-transparent border-transparent hover:bg-neutral-800/60 text-neutral-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded bg-neutral-800 overflow-hidden shrink-0 relative">
                            <img
                              src={track.artworkUrl || ''}
                              alt={track.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            </div>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className={`text-sm font-semibold truncate ${isCurrent ? 'text-emerald-400' : 'text-white'}`}>
                              {track.title}
                            </div>
                            <div className="text-xs text-neutral-400 truncate flex items-center gap-1.5">
                              <span>{track.artist}</span>
                              {track.album && (
                                <>
                                  <span>·</span>
                                  <span className="truncate">{track.album}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-2">
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
            </div>
          )}

          {/* Artists Section */}
          {(activeTab === 'all' || activeTab === 'artists') && results.artists.length > 0 && (
            <section className="space-y-4 pt-4">
              <h3 className="text-lg font-bold text-white">Artists</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {results.artists.map((artist, idx) => (
                  <div
                    key={`${artist.id}-${idx}`}
                    onClick={() => onNavigate({ type: 'artist', id: artist.name })}
                    className="group bg-[#181818] hover:bg-[#282828] p-4 rounded-xl transition cursor-pointer border border-neutral-800/80 flex flex-col items-center text-center"
                  >
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-neutral-800 mb-3 shadow">
                      <img src={artist.avatarUrl} alt={artist.name} className="w-full h-full object-cover" />
                    </div>
                    <h4 className="text-sm font-bold text-white truncate w-full">{artist.name}</h4>
                    <p className="text-xs text-neutral-400 mt-0.5">Artist</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Albums Section */}
          {(activeTab === 'all' || activeTab === 'albums') && results.albums.length > 0 && (
            <section className="space-y-4 pt-4">
              <h3 className="text-lg font-bold text-white">Albums</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {results.albums.map((album, idx) => (
                  <div
                    key={`${album.id}-${idx}`}
                    onClick={() => onNavigate({ type: 'album', id: album.title })}
                    className="group bg-[#181818] hover:bg-[#282828] p-3.5 rounded-xl transition cursor-pointer border border-neutral-800/80 flex flex-col"
                  >
                    <div className="aspect-square w-full rounded-lg overflow-hidden bg-neutral-800 mb-2.5 shadow">
                      <img src={album.artworkUrl} alt={album.title} className="w-full h-full object-cover" />
                    </div>
                    <h4 className="text-sm font-bold text-white truncate">{album.title}</h4>
                    <p className="text-xs text-neutral-400 truncate">{album.artist}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};
