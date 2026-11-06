/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Track } from './types.ts';

/**
 * Curated list of legitimate test audio tracks for verifying Soundify Audio Engine.
 * Includes verified direct HTTP audio streams, simulated authorized provider streams,
 * and deliberate error test cases (unauthorized license, 404 missing asset, corrupted format).
 */
export const VERIFIED_TEST_TRACKS: Track[] = [
  {
    id: 'track-helix-1',
    title: 'SoundHelix Acoustic & Synth Suite 1',
    artist: 'SoundHelix Ensemble',
    album: 'Generative Audio Lab Vol. 1',
    artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
    durationMs: 372000,
    sourceProvider: 'direct_http',
    sourceReference: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: 'track-helix-2',
    title: 'SoundHelix Electronic Drift 2',
    artist: 'SoundHelix Ensemble',
    album: 'Generative Audio Lab Vol. 1',
    artworkUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80',
    durationMs: 425000,
    sourceProvider: 'direct_http',
    sourceReference: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    id: 'track-helix-3',
    title: 'SoundHelix Ambient Flow 3',
    artist: 'SoundHelix Ensemble',
    album: 'Generative Audio Lab Vol. 2',
    artworkUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80',
    durationMs: 343000,
    sourceProvider: 'direct_http',
    sourceReference: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
  {
    id: 'track-helix-4',
    title: 'SoundHelix Melodic Groove 4',
    artist: 'SoundHelix Ensemble',
    album: 'Generative Audio Lab Vol. 2',
    artworkUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&auto=format&fit=crop&q=80',
    durationMs: 302000,
    sourceProvider: 'direct_http',
    sourceReference: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  },
  {
    id: 'track-auth-provider-1',
    title: 'Authorized Provider Stream (Licensed CDN)',
    artist: 'Studio Master Recordings',
    album: 'Enterprise Catalogue Release',
    artworkUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&auto=format&fit=crop&q=80',
    durationMs: 247000,
    sourceProvider: 'authorized_provider',
    sourceReference: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  },
  // Intentional Error & Edge-Case Test Tracks:
  {
    id: 'track-err-unauthorized',
    title: 'Restricted Asset (Unauthorized License)',
    artist: 'Protected Major Label Artist',
    album: 'Exclusive Tier Content',
    artworkUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=400&auto=format&fit=crop&q=80',
    durationMs: 210000,
    sourceProvider: 'authorized_provider',
    sourceReference: 'restricted_token_stream_license_denied',
  },
  {
    id: 'track-err-404',
    title: 'Missing CDN Asset (HTTP 404)',
    artist: 'Ghost Server Collective',
    album: 'Unavailable Release',
    artworkUrl: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=400&auto=format&fit=crop&q=80',
    durationMs: 180000,
    sourceProvider: 'authorized_provider',
    sourceReference: 'https://www.soundhelix.com/examples/mp3/missing-404-audio.mp3',
  },
  {
    id: 'track-err-corrupt',
    title: 'Corrupted Media Header (Decode Error)',
    artist: 'Fault Injection Lab',
    album: 'Diagnostics Suite',
    artworkUrl: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=400&auto=format&fit=crop&q=80',
    durationMs: 90000,
    sourceProvider: 'direct_http',
    sourceReference: 'https://invalid-non-existent-domain-1234567.com/corrupt.mp3',
  },
];
