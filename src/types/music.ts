/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Track } from '../audio/types.ts';

export type ViewType =
  | 'home'
  | 'search'
  | 'library'
  | 'create'
  | 'playlist'
  | 'album'
  | 'artist'
  | 'liked';

export interface ViewNavigation {
  type: ViewType;
  id?: string;
}

export interface SoundifyTrack extends Track {
  albumId?: string;
  artistId?: string;
  releaseDate?: string;
  isExplicit?: boolean;
  streamType: 'full_stream' | 'preview_30s' | 'licensed_stream';
  providerName: 'Audius' | 'Apple Music Catalog' | 'Open Source Audio' | 'Direct';
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  artworkUrl: string;
  releaseDate: string;
  totalTracks: number;
  dominantColor?: string;
  tracks: SoundifyTrack[];
}

export interface Artist {
  id: string;
  name: string;
  avatarUrl: string;
  headerBannerUrl?: string;
  monthlyListeners: number;
  isVerified: boolean;
  bio?: string;
  popularTracks: SoundifyTrack[];
  albums: Album[];
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  coverArtUrl: string;
  ownerName: string;
  dominantColor?: string;
  isCustom?: boolean;
  tracks: SoundifyTrack[];
  createdAt: number;
}

export interface LyricLine {
  timeSec: number;
  text: string;
}

export interface TrackLyrics {
  trackId: string;
  isSynchronized: boolean;
  lines: LyricLine[];
  attribution?: string;
}

export interface UserPreferences {
  favoriteGenres?: string[];
  favoriteArtists?: string[];
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarColor: string;
  createdAt: number;
  preferences: UserPreferences;
}

export type AuthActionPrompt =
  | 'like'
  | 'create_playlist'
  | 'follow'
  | 'save_album'
  | 'library'
  | 'generic';

