/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SoundifyTrack, Playlist, UserProfile } from '../types/music.ts';
import { CURATED_FEATURED_TRACKS } from './musicApi.ts';

export interface UserListeningSignals {
  plays: Record<string, number>;
  completions: Record<string, number>;
  skips: Record<string, number>;
}

const SIGNALS_KEY_PREFIX = 'soundify_listening_signals_';

export function getStoredSignals(userId?: string): UserListeningSignals {
  try {
    const key = `${SIGNALS_KEY_PREFIX}${userId || 'guest'}`;
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return { plays: {}, completions: {}, skips: {} };
}

function persistSignals(signals: UserListeningSignals, userId?: string) {
  try {
    const key = `${SIGNALS_KEY_PREFIX}${userId || 'guest'}`;
    localStorage.setItem(key, JSON.stringify(signals));
  } catch {
    // silent
  }
}

export function recordSignalPlay(trackId: string, userId?: string) {
  const signals = getStoredSignals(userId);
  signals.plays[trackId] = (signals.plays[trackId] || 0) + 1;
  persistSignals(signals, userId);
}

export function recordSignalCompletion(trackId: string, userId?: string) {
  const signals = getStoredSignals(userId);
  signals.completions[trackId] = (signals.completions[trackId] || 0) + 1;
  persistSignals(signals, userId);
}

export function recordSignalSkip(trackId: string, userId?: string) {
  const signals = getStoredSignals(userId);
  signals.skips[trackId] = (signals.skips[trackId] || 0) + 1;
  persistSignals(signals, userId);
}

export interface LibrarySignalsContext {
  likedTracks: SoundifyTrack[];
  playlists: Playlist[];
  savedAlbumTitles: string[];
  followedArtists: string[];
  recentlyPlayed: SoundifyTrack[];
}

/**
 * Calculates behavioral score for a track based on genuine user signals.
 */
export function calculateTrackScore(
  track: SoundifyTrack,
  user: UserProfile | null,
  library: LibrarySignalsContext,
  signals: UserListeningSignals
): number {
  let score = 0;

  // Liked tracks: high affinity signal (+5)
  if (library.likedTracks.some((t) => t.id === track.id)) {
    score += 5;
  }

  // Included in any user playlist (+5)
  for (const pl of library.playlists) {
    if (pl.tracks.some((t) => t.id === track.id)) {
      score += 5;
      break;
    }
  }

  // Followed artist (+4)
  if (library.followedArtists.some((a) => a.toLowerCase() === track.artist.toLowerCase())) {
    score += 4;
  }

  // Saved album (+3)
  if (track.album && library.savedAlbumTitles.some((alb) => alb.toLowerCase() === track.album?.toLowerCase())) {
    score += 3;
  }

  // User onboarding preferred genres (+3)
  if (user?.preferences?.favoriteGenres && user.preferences.favoriteGenres.length > 0) {
    const trackText = `${track.title} ${track.artist} ${track.album || ''}`.toLowerCase();
    const matchesGenre = user.preferences.favoriteGenres.some((g) => trackText.includes(g.toLowerCase()));
    if (matchesGenre) {
      score += 3;
    }
  }

  // Real play signals (+2 per play, capped at 10)
  const plays = signals.plays[track.id] || 0;
  score += Math.min(10, plays * 2);

  // Completions (>75% duration listened: +4 per completion, capped at 16)
  const completions = signals.completions[track.id] || 0;
  score += Math.min(16, completions * 4);

  // Skips (<15s duration: -3 penalty)
  const skips = signals.skips[track.id] || 0;
  score -= skips * 3;

  return score;
}

/**
 * Diversity & Freshness Filter:
 * Ensures maximum 2 tracks per artist in any section to prevent repetition.
 * Adds subtle jitter to avoid static stale layouts across visits.
 */
export function applyDiversityFilter(
  tracks: SoundifyTrack[],
  maxPerArtist: number = 2,
  limit: number = 10
): SoundifyTrack[] {
  const artistCounts: Record<string, number> = {};
  const result: SoundifyTrack[] = [];

  for (const track of tracks) {
    const artistKey = track.artist.toLowerCase().trim();
    const count = artistCounts[artistKey] || 0;
    if (count < maxPerArtist) {
      result.push(track);
      artistCounts[artistKey] = count + 1;
      if (result.length >= limit) break;
    }
  }

  return result;
}

/**
 * Quick Picks / Continue Listening: 6 familiar or top-scored tracks for the top grid.
 * If user has listening history, prioritize their recently played and top-affinity tracks.
 */
export function getQuickPicks(
  user: UserProfile | null,
  library: LibrarySignalsContext,
  availablePool: SoundifyTrack[]
): SoundifyTrack[] {
  // If user has genuine recently played tracks, use them first
  if (library.recentlyPlayed.length > 0) {
    const picks = library.recentlyPlayed.slice(0, 6);
    if (picks.length === 6) return picks;
    // fill up to 6 with pool
    const needed = 6 - picks.length;
    const existingIds = new Set(picks.map((p) => p.id));
    const fillers = availablePool.filter((t) => !existingIds.has(t.id)).slice(0, needed);
    return [...picks, ...fillers];
  }

  // For cold-start / new user: clean public curated tracks
  return availablePool.slice(0, 6);
}

/**
 * Made For You: Scored recommendations personalized to user's tastes.
 */
export function getMadeForYou(
  user: UserProfile | null,
  library: LibrarySignalsContext,
  availablePool: SoundifyTrack[]
): SoundifyTrack[] {
  const signals = getStoredSignals(user?.id);

  // Score all available tracks
  const scored = availablePool.map((track) => ({
    track,
    score: calculateTrackScore(track, user, library, signals),
  }));

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  const candidates = scored.map((s) => s.track);
  return applyDiversityFilter(candidates, 2, 8);
}

/**
 * On Repeat: Tracks played 2 or more times. Returns empty array if none exist!
 */
export function getOnRepeat(
  user: UserProfile | null,
  availablePool: SoundifyTrack[]
): SoundifyTrack[] {
  const signals = getStoredSignals(user?.id);
  const repeated: SoundifyTrack[] = [];

  for (const track of availablePool) {
    const plays = signals.plays[track.id] || 0;
    if (plays >= 2) {
      repeated.push(track);
    }
  }

  return applyDiversityFilter(repeated, 2, 8);
}

/**
 * Forgotten Favorites: Tracks that were liked or played heavily in the past,
 * but do not appear in the last 5 recently played tracks.
 */
export function getForgottenFavorites(
  user: UserProfile | null,
  library: LibrarySignalsContext,
  availablePool: SoundifyTrack[]
): SoundifyTrack[] {
  const signals = getStoredSignals(user?.id);
  const recentIds = new Set(library.recentlyPlayed.slice(0, 5).map((t) => t.id));

  const favorites = availablePool.filter((track) => {
    // Must not be in the last 5 recently played
    if (recentIds.has(track.id)) return false;

    const isLiked = library.likedTracks.some((t) => t.id === track.id);
    const plays = signals.plays[track.id] || 0;
    return isLiked || plays >= 2;
  });

  return applyDiversityFilter(favorites, 2, 8);
}

/**
 * Similar Tracks: Discovers music similar to currently playing track
 */
export function getSimilarTracks(
  currentTrack: SoundifyTrack | null,
  availablePool: SoundifyTrack[]
): SoundifyTrack[] {
  if (!currentTrack) return [];

  const candidates = availablePool.filter((t) => t.id !== currentTrack.id);
  // Match same artist or genre keywords
  const matched = candidates.filter((t) => {
    if (t.artist.toLowerCase() === currentTrack.artist.toLowerCase()) return true;
    if (currentTrack.album && t.album && t.album.toLowerCase() === currentTrack.album.toLowerCase()) return true;
    return false;
  });

  if (matched.length >= 4) {
    return matched.slice(0, 8);
  }

  // Backfill with other candidates
  const remaining = candidates.filter((t) => !matched.includes(t));
  return [...matched, ...remaining].slice(0, 8);
}

export interface MoodCategory {
  id: string;
  name: string;
  description: string;
  gradient: string;
  coverArt: string;
  searchQuery: string;
}

export const MOOD_CATEGORIES: MoodCategory[] = [
  {
    id: 'chill',
    name: 'Chill & Relax',
    description: 'Easy listening, mellow acoustics, and warm tones.',
    gradient: 'from-blue-700 to-indigo-900',
    coverArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    searchQuery: 'acoustic chill',
  },
  {
    id: 'focus',
    name: 'Deep Focus',
    description: 'Clean instrumental beats and concentration sounds.',
    gradient: 'from-emerald-700 to-teal-900',
    coverArt: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    searchQuery: 'ambient electronic',
  },
  {
    id: 'workout',
    name: 'Workout Energy',
    description: 'High BPM hip-hop, electronic, and fitness motivation.',
    gradient: 'from-red-600 to-amber-700',
    coverArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    searchQuery: 'workout rap',
  },
  {
    id: 'party',
    name: 'Party & Vibes',
    description: 'Dancefloor anthems and crowd favorites.',
    gradient: 'from-pink-600 to-purple-800',
    coverArt: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
    searchQuery: 'dance party',
  },
  {
    id: 'night',
    name: 'Late Night Drives',
    description: 'Atmospheric synth, moody R&B, and nocturnal rhythms.',
    gradient: 'from-purple-800 to-neutral-900',
    coverArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    searchQuery: 'night drive',
  },
  {
    id: 'feel-good',
    name: 'Feel Good',
    description: 'Uplifting melodies and sunny positive energy.',
    gradient: 'from-amber-500 to-rose-600',
    coverArt: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80',
    searchQuery: 'upbeat pop',
  },
];

export interface GenreCategory {
  id: string;
  name: string;
  color: string;
  query: string;
}

export const GENRE_CATEGORIES: GenreCategory[] = [
  { id: 'afrobeats', name: 'Afrobeats', color: 'bg-amber-600', query: 'burna boy' },
  { id: 'hiphop', name: 'Hip-Hop & Rap', color: 'bg-orange-600', query: 'drake' },
  { id: 'pop', name: 'Pop Hits', color: 'bg-pink-600', query: 'ed sheeran' },
  { id: 'rnb', name: 'R&B / Soul', color: 'bg-indigo-600', query: 'r&b' },
  { id: 'electronic', name: 'Electronic', color: 'bg-cyan-600', query: 'electronic' },
  { id: 'rock', name: 'Rock & Alt', color: 'bg-rose-700', query: 'rock' },
  { id: 'indie', name: 'Indie & Underground', color: 'bg-purple-700', query: 'indie' },
  { id: 'acoustic', name: 'Acoustic', color: 'bg-emerald-700', query: 'james arthur' },
];
