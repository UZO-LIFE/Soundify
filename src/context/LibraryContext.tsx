/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Playlist, SoundifyTrack } from '../types/music.ts';
import { useAuth } from './AuthContext.tsx';

interface UserLibraryData {
  likedTracks: SoundifyTrack[];
  playlists: Playlist[];
  savedAlbumTitles: string[];
  followedArtists: string[];
  recentlyPlayed: SoundifyTrack[];
  searchHistory: string[];
}

interface LibraryContextValue {
  likedTracks: SoundifyTrack[];
  playlists: Playlist[];
  savedAlbumTitles: string[];
  followedArtists: string[];
  recentlyPlayed: SoundifyTrack[];
  searchHistory: string[];
  isLiked: (trackId: string) => boolean;
  toggleLikeTrack: (track: SoundifyTrack) => void;
  createPlaylist: (title?: string, description?: string) => Playlist | null;
  updatePlaylist: (id: string, updates: { title?: string; description?: string; coverArtUrl?: string }) => void;
  deletePlaylist: (id: string) => void;
  addTrackToPlaylist: (playlistId: string, track: SoundifyTrack) => void;
  removeTrackFromPlaylist: (playlistId: string, trackIndex: number) => void;
  reorderPlaylist: (playlistId: string, fromIndex: number, toIndex: number) => void;
  recordRecentlyPlayed: (track: SoundifyTrack) => void;
  toggleFollowArtist: (artistName: string) => void;
  isFollowingArtist: (artistName: string) => boolean;
  toggleSaveAlbum: (albumTitle: string) => void;
  isAlbumSaved: (albumTitle: string) => boolean;
  addSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
}

const LibraryContext = createContext<LibraryContextValue | null>(null);

const EMPTY_LIBRARY: UserLibraryData = {
  likedTracks: [],
  playlists: [],
  savedAlbumTitles: [],
  followedArtists: [],
  recentlyPlayed: [],
  searchHistory: [],
};

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isGuest, promptAuth } = useAuth();

  // Load account-specific library data; default genuinely empty
  const [library, setLibrary] = useState<UserLibraryData>(EMPTY_LIBRARY);

  // Rehydrate or isolate when user session changes
  useEffect(() => {
    if (!user) {
      // Guest state: strictly zero personal data
      setLibrary(EMPTY_LIBRARY);
      return;
    }

    try {
      const storageKey = `soundify_library_account_${user.id}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setLibrary(JSON.parse(saved));
      } else {
        // Genuinely clean, empty library for new user
        setLibrary(EMPTY_LIBRARY);
      }
    } catch {
      setLibrary(EMPTY_LIBRARY);
    }
  }, [user?.id]);

  // Persist library changes strictly for the active authenticated user
  const persistLibrary = (updated: UserLibraryData) => {
    setLibrary(updated);
    if (user) {
      try {
        localStorage.setItem(`soundify_library_account_${user.id}`, JSON.stringify(updated));
      } catch {
        // silent
      }
    }
  };

  // Actions
  const isLiked = (trackId: string): boolean => {
    return library.likedTracks.some((t) => t.id === trackId);
  };

  const toggleLikeTrack = (track: SoundifyTrack) => {
    if (isGuest || !user) {
      promptAuth('like');
      return;
    }

    const exists = library.likedTracks.some((t) => t.id === track.id);
    const updatedLiked = exists
      ? library.likedTracks.filter((t) => t.id !== track.id)
      : [track, ...library.likedTracks];

    persistLibrary({
      ...library,
      likedTracks: updatedLiked,
    });
  };

  const createPlaylist = (title?: string, description?: string): Playlist | null => {
    if (isGuest || !user) {
      promptAuth('create_playlist');
      return null;
    }

    const newPlaylist: Playlist = {
      id: `pl_${user.id}_${Date.now()}`,
      title: title || `My Playlist #${library.playlists.length + 1}`,
      description: description || 'Created with Soundify',
      coverArtUrl: '',
      ownerName: user.displayName || 'You',
      dominantColor: '#10b981',
      isCustom: true,
      tracks: [],
      createdAt: Date.now(),
    };

    persistLibrary({
      ...library,
      playlists: [newPlaylist, ...library.playlists],
    });

    return newPlaylist;
  };

  const updatePlaylist = (
    id: string,
    updates: { title?: string; description?: string; coverArtUrl?: string }
  ) => {
    if (isGuest || !user) return;

    persistLibrary({
      ...library,
      playlists: library.playlists.map((pl) => (pl.id === id ? { ...pl, ...updates } : pl)),
    });
  };

  const deletePlaylist = (id: string) => {
    if (isGuest || !user) return;

    persistLibrary({
      ...library,
      playlists: library.playlists.filter((pl) => pl.id !== id),
    });
  };

  const addTrackToPlaylist = (playlistId: string, track: SoundifyTrack) => {
    if (isGuest || !user) {
      promptAuth('create_playlist');
      return;
    }

    persistLibrary({
      ...library,
      playlists: library.playlists.map((pl) => {
        if (pl.id === playlistId) {
          return {
            ...pl,
            tracks: [...pl.tracks, track],
          };
        }
        return pl;
      }),
    });
  };

  const removeTrackFromPlaylist = (playlistId: string, trackIndex: number) => {
    if (isGuest || !user) return;

    persistLibrary({
      ...library,
      playlists: library.playlists.map((pl) => {
        if (pl.id === playlistId) {
          const updated = [...pl.tracks];
          updated.splice(trackIndex, 1);
          return { ...pl, tracks: updated };
        }
        return pl;
      }),
    });
  };

  const reorderPlaylist = (playlistId: string, fromIndex: number, toIndex: number) => {
    if (isGuest || !user) return;

    persistLibrary({
      ...library,
      playlists: library.playlists.map((pl) => {
        if (pl.id === playlistId) {
          const updated = [...pl.tracks];
          const [moved] = updated.splice(fromIndex, 1);
          updated.splice(toIndex, 0, moved);
          return { ...pl, tracks: updated };
        }
        return pl;
      }),
    });
  };

  const recordRecentlyPlayed = (track: SoundifyTrack) => {
    // Only record listening history if user is authenticated; guest activity is not stored as user history
    if (!user) return;

    const filtered = library.recentlyPlayed.filter((t) => t.id !== track.id);
    persistLibrary({
      ...library,
      recentlyPlayed: [track, ...filtered].slice(0, 30),
    });
  };

  const isFollowingArtist = (artistName: string): boolean => {
    return library.followedArtists.includes(artistName);
  };

  const toggleFollowArtist = (artistName: string) => {
    if (isGuest || !user) {
      promptAuth('follow');
      return;
    }

    const exists = library.followedArtists.includes(artistName);
    const updated = exists
      ? library.followedArtists.filter((a) => a !== artistName)
      : [...library.followedArtists, artistName];

    persistLibrary({
      ...library,
      followedArtists: updated,
    });
  };

  const isAlbumSaved = (albumTitle: string): boolean => {
    return library.savedAlbumTitles.includes(albumTitle);
  };

  const toggleSaveAlbum = (albumTitle: string) => {
    if (isGuest || !user) {
      promptAuth('save_album');
      return;
    }

    const exists = library.savedAlbumTitles.includes(albumTitle);
    const updated = exists
      ? library.savedAlbumTitles.filter((a) => a !== albumTitle)
      : [...library.savedAlbumTitles, albumTitle];

    persistLibrary({
      ...library,
      savedAlbumTitles: updated,
    });
  };

  const addSearchHistory = (query: string) => {
    if (!user || !query.trim()) return;

    const clean = query.trim();
    const filtered = library.searchHistory.filter((q) => q.toLowerCase() !== clean.toLowerCase());
    persistLibrary({
      ...library,
      searchHistory: [clean, ...filtered].slice(0, 10),
    });
  };

  const clearSearchHistory = () => {
    if (!user) return;
    persistLibrary({
      ...library,
      searchHistory: [],
    });
  };

  return (
    <LibraryContext.Provider
      value={{
        likedTracks: library.likedTracks,
        playlists: library.playlists,
        savedAlbumTitles: library.savedAlbumTitles,
        followedArtists: library.followedArtists,
        recentlyPlayed: library.recentlyPlayed,
        searchHistory: library.searchHistory,
        isLiked,
        toggleLikeTrack,
        createPlaylist,
        updatePlaylist,
        deletePlaylist,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
        reorderPlaylist,
        recordRecentlyPlayed,
        toggleFollowArtist,
        isFollowingArtist,
        toggleSaveAlbum,
        isAlbumSaved,
        addSearchHistory,
        clearSearchHistory,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

export function useLibrary(): LibraryContextValue {
  const ctx = useContext(LibraryContext);
  if (!ctx) {
    throw new Error('useLibrary must be used within a <LibraryProvider>');
  }
  return ctx;
}
