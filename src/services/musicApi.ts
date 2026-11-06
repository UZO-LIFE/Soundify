/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Album, Artist, Playlist, SoundifyTrack } from '../types/music.ts';

// Curated high-fidelity initial catalogue (ensures immediate rich content on first boot)
export const CURATED_FEATURED_TRACKS: SoundifyTrack[] = [
  {
    id: 'itunes-ed-shivers',
    title: 'Shivers',
    artist: 'Ed Sheeran',
    album: '=',
    artworkUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/c5/d8/c6/c5d8c675-63e3-6632-33db-2401eabe574d/190296491412.jpg/600x600bb.jpg',
    durationMs: 207853,
    sourceProvider: 'direct_http',
    sourceReference: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/a8/9f/a5/a89fa5e9-8a3b-77bb-e081-866067d3f213/mzaf_13889707114574366771.plus.aac.p.m4a',
    streamType: 'preview_30s',
    providerName: 'Apple Music Catalog',
    isExplicit: false,
    releaseDate: '2021-09-09',
  },
  {
    id: 'itunes-burna-last-last',
    title: 'Last Last',
    artist: 'Burna Boy',
    album: 'Love, Damini',
    artworkUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/ca/eb/31/caeb3173-eaf0-0cd5-65ea-585adfe312ba/075679745156.jpg/600x600bb.jpg',
    durationMs: 172342,
    sourceProvider: 'direct_http',
    sourceReference: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/42/c0/0f/42c00f8b-fff6-2529-70c3-861c21143c0a/mzaf_2842108628707526245.plus.aac.p.m4a',
    streamType: 'preview_30s',
    providerName: 'Apple Music Catalog',
    isExplicit: true,
    releaseDate: '2022-05-13',
  },
  {
    id: 'itunes-james-arthur-say',
    title: "Say You Won't Let Go",
    artist: 'James Arthur',
    album: 'Back from the Edge',
    artworkUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/65/5c/d5/655cd55f-2aa7-f275-cbe2-669c5e552554/886446059632.jpg/600x600bb.jpg',
    durationMs: 211467,
    sourceProvider: 'direct_http',
    sourceReference: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/37/2c/6a/372c6a08-f41a-c5c6-b924-fef9b8bfe64c/mzaf_16886618498963283282.plus.aac.p.m4a',
    streamType: 'preview_30s',
    providerName: 'Apple Music Catalog',
    isExplicit: false,
    releaseDate: '2016-09-09',
  },
  {
    id: 'itunes-drake-gods-plan',
    title: "God's Plan",
    artist: 'Drake',
    album: 'Scorpion',
    artworkUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/a4/c4/86/a4c486e9-b544-77db-3129-4d64387d84b2/18UMGIM38933.rgb.jpg/600x600bb.jpg',
    durationMs: 198973,
    sourceProvider: 'direct_http',
    sourceReference: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/10/a5/d9/10a5d97d-6ff8-a3f2-1130-9bbdb7e94f8e/mzaf_7824147427494488347.plus.aac.p.m4a',
    streamType: 'preview_30s',
    providerName: 'Apple Music Catalog',
    isExplicit: true,
    releaseDate: '2018-01-19',
  },
  {
    id: 'itunes-asake-lonely',
    title: 'Lonely At The Top',
    artist: 'Asake',
    album: 'Work of Art',
    artworkUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/e0/75/ca/e075caec-d278-df05-7f55-1e35a940428d/197188737604.jpg/600x600bb.jpg',
    durationMs: 157293,
    sourceProvider: 'direct_http',
    sourceReference: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/d5/43/8b/d5438bf2-0857-e608-412f-90e633dbece5/mzaf_10332822180844781449.plus.aac.p.m4a',
    streamType: 'preview_30s',
    providerName: 'Apple Music Catalog',
    isExplicit: false,
    releaseDate: '2023-06-16',
  },
  {
    id: 'audius-loudwerx',
    title: 'Bass Go Boom (feat. Magic & Bird)',
    artist: 'LOUDWERX',
    album: 'Audius Spotlight Singles',
    artworkUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    durationMs: 156000,
    sourceProvider: 'direct_http',
    sourceReference: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    streamType: 'full_stream',
    providerName: 'Audius',
    isExplicit: false,
    releaseDate: '2026-10-30',
  },
];

export const CURATED_FEATURED_PLAYLISTS: Playlist[] = [
  {
    id: 'pl-today-top-hits',
    title: "Today's Top Hits",
    description: 'Ed Sheeran, Burna Boy, Drake, and the hottest global tracks right now.',
    coverArtUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    ownerName: 'Soundify Editorial',
    dominantColor: '#10b981',
    tracks: CURATED_FEATURED_TRACKS,
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'pl-afro-fusion',
    title: 'Afrobeats Global Wave',
    description: 'The defining sounds of Lagos, Accra, and London taking over the world.',
    coverArtUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
    ownerName: 'Soundify Global',
    dominantColor: '#f59e0b',
    tracks: [CURATED_FEATURED_TRACKS[1], CURATED_FEATURED_TRACKS[4], CURATED_FEATURED_TRACKS[0]],
    createdAt: Date.now() - 86400000 * 10,
  },
  {
    id: 'pl-chill-acoustic',
    title: 'Acoustic & Soulful Evening',
    description: 'Strip it back with warm acoustic guitars and heartfelt songwriting.',
    coverArtUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    ownerName: 'Soundify Chill',
    dominantColor: '#6366f1',
    tracks: [CURATED_FEATURED_TRACKS[2], CURATED_FEATURED_TRACKS[0]],
    createdAt: Date.now() - 86400000 * 12,
  },
  {
    id: 'pl-audius-underground',
    title: 'Audius Underground Selects',
    description: 'Fresh electronic beats, future bass, and indie innovators on the blockchain.',
    coverArtUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    ownerName: 'Audius Discovery',
    dominantColor: '#8b5cf6',
    tracks: [CURATED_FEATURED_TRACKS[5], CURATED_FEATURED_TRACKS[3]],
    createdAt: Date.now() - 86400000 * 3,
  },
];

export const POPULAR_ARTISTS_CATALOGUE: Artist[] = [
  {
    id: 'artist-ed-sheeran',
    name: 'Ed Sheeran',
    avatarUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/c5/d8/c6/c5d8c675-63e3-6632-33db-2401eabe574d/190296491412.jpg/600x600bb.jpg',
    monthlyListeners: 84320910,
    isVerified: true,
    bio: 'English singer-songwriter who rose from busking to headlining Wembley Stadium. Multiple Grammy Award winner with global anthem hits.',
    popularTracks: [CURATED_FEATURED_TRACKS[0]],
    albums: [
      {
        id: 'album-equals',
        title: '=',
        artist: 'Ed Sheeran',
        artworkUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/c5/d8/c6/c5d8c675-63e3-6632-33db-2401eabe574d/190296491412.jpg/600x600bb.jpg',
        releaseDate: '2021-09-09',
        totalTracks: 14,
        tracks: [CURATED_FEATURED_TRACKS[0]],
      },
    ],
  },
  {
    id: 'artist-burna-boy',
    name: 'Burna Boy',
    avatarUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/ca/eb/31/caeb3173-eaf0-0cd5-65ea-585adfe312ba/075679745156.jpg/600x600bb.jpg',
    monthlyListeners: 22450890,
    isVerified: true,
    bio: 'Grammy Award-winning Nigerian Afro-fusion pioneer. The African Giant who spearheaded the global explosion of Afrobeats.',
    popularTracks: [CURATED_FEATURED_TRACKS[1]],
    albums: [
      {
        id: 'album-love-damini',
        title: 'Love, Damini',
        artist: 'Burna Boy',
        artworkUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/ca/eb/31/caeb3173-eaf0-0cd5-65ea-585adfe312ba/075679745156.jpg/600x600bb.jpg',
        releaseDate: '2022-05-13',
        totalTracks: 19,
        tracks: [CURATED_FEATURED_TRACKS[1]],
      },
    ],
  },
  {
    id: 'artist-drake',
    name: 'Drake',
    avatarUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/a4/c4/86/a4c486e9-b544-77db-3129-4d64387d84b2/18UMGIM38933.rgb.jpg/600x600bb.jpg',
    monthlyListeners: 79840220,
    isVerified: true,
    bio: 'Canadian rapper and singer defining contemporary hip-hop and R&B for over a decade. Record-breaking chart-topper and cultural vanguard.',
    popularTracks: [CURATED_FEATURED_TRACKS[3]],
    albums: [
      {
        id: 'album-scorpion',
        title: 'Scorpion',
        artist: 'Drake',
        artworkUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/a4/c4/86/a4c486e9-b544-77db-3129-4d64387d84b2/18UMGIM38933.rgb.jpg/600x600bb.jpg',
        releaseDate: '2018-01-19',
        totalTracks: 25,
        tracks: [CURATED_FEATURED_TRACKS[3]],
      },
    ],
  },
  {
    id: 'artist-james-arthur',
    name: 'James Arthur',
    avatarUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/65/5c/d5/655cd55f-2aa7-f275-cbe2-669c5e552554/886446059632.jpg/600x600bb.jpg',
    monthlyListeners: 36720100,
    isVerified: true,
    bio: 'British vocalist and multi-instrumentalist renowned for impassioned, raspy vocals and timeless emotional ballads.',
    popularTracks: [CURATED_FEATURED_TRACKS[2]],
    albums: [
      {
        id: 'album-back-from-the-edge',
        title: 'Back from the Edge',
        artist: 'James Arthur',
        artworkUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/65/5c/d5/655cd55f-2aa7-f275-cbe2-669c5e552554/886446059632.jpg/600x600bb.jpg',
        releaseDate: '2016-09-09',
        totalTracks: 13,
        tracks: [CURATED_FEATURED_TRACKS[2]],
      },
    ],
  },
];

// Helper to convert iTunes API track results into SoundifyTrack
function mapItunesTrack(item: any): SoundifyTrack | null {
  if (!item.trackId || !item.trackName || !item.previewUrl) return null;

  const highResArt = (item.artworkUrl100 || item.artworkUrl60 || '')
    .replace('100x100bb', '600x600bb')
    .replace('60x60bb', '600x600bb');

  return {
    id: `itunes-${item.trackId}`,
    title: item.trackName,
    artist: item.artistName || 'Unknown Artist',
    album: item.collectionName || 'Single',
    artworkUrl: highResArt,
    durationMs: item.trackTimeMillis || 180000,
    sourceProvider: 'direct_http',
    sourceReference: item.previewUrl,
    streamType: 'preview_30s',
    providerName: 'Apple Music Catalog',
    isExplicit: item.trackExplicitness === 'explicit',
    releaseDate: item.releaseDate ? item.releaseDate.split('T')[0] : undefined,
    artistId: item.artistId ? `artist-${item.artistId}` : undefined,
    albumId: item.collectionId ? `album-${item.collectionId}` : undefined,
  };
}

/**
 * Searches real music catalogs (iTunes Search API for mainstream catalogue + Audius fallback)
 */
export async function searchMusic(query: string): Promise<{
  tracks: SoundifyTrack[];
  artists: Artist[];
  albums: Album[];
}> {
  if (!query || query.trim() === '') {
    return {
      tracks: CURATED_FEATURED_TRACKS,
      artists: POPULAR_ARTISTS_CATALOGUE,
      albums: [],
    };
  }

  const cleanQuery = encodeURIComponent(query.trim());

  try {
    const res = await fetch(`https://itunes.apple.com/search?term=${cleanQuery}&entity=song&limit=25`);
    if (!res.ok) {
      throw new Error(`iTunes search returned status ${res.status}`);
    }

    const data = await res.json();
    const tracks: SoundifyTrack[] = [];
    const artistsMap = new Map<string, Artist>();
    const albumsMap = new Map<string, Album>();

    if (Array.isArray(data.results)) {
      for (const item of data.results) {
        const track = mapItunesTrack(item);
        if (track) {
          tracks.push(track);

          // Group artists by artistId or normalized name to avoid duplicate IDs
          const artistKey = item.artistId
            ? `id-${item.artistId}`
            : `name-${(item.artistName || '').toLowerCase().trim()}`;

          if (item.artistName && !artistsMap.has(artistKey)) {
            artistsMap.set(artistKey, {
              id: item.artistId ? `artist-${item.artistId}` : `artist-${tracks.length}-${Math.random().toString(36).substring(2, 6)}`,
              name: item.artistName,
              avatarUrl: track.artworkUrl || '',
              monthlyListeners: Math.floor(Math.random() * 20000000) + 2000000,
              isVerified: true,
              popularTracks: [track],
              albums: [],
            });
          }

          // Group albums by collectionId or normalized collectionName
          const albumKey = item.collectionId
            ? `col-${item.collectionId}`
            : `name-${(item.collectionName || '').toLowerCase().trim()}`;

          if (item.collectionName && !albumsMap.has(albumKey)) {
            albumsMap.set(albumKey, {
              id: item.collectionId ? `album-${item.collectionId}` : `album-${tracks.length}-${Math.random().toString(36).substring(2, 6)}`,
              title: item.collectionName,
              artist: item.artistName || 'Unknown Artist',
              artworkUrl: track.artworkUrl || '',
              releaseDate: track.releaseDate || '2024',
              totalTracks: item.trackCount || 10,
              tracks: [track],
            });
          } else if (item.collectionName && albumsMap.has(albumKey)) {
            albumsMap.get(albumKey)!.tracks.push(track);
          }
        }
      }
    }

    return {
      tracks,
      artists: Array.from(artistsMap.values()).slice(0, 8),
      albums: Array.from(albumsMap.values()).slice(0, 8),
    };
  } catch (err) {
    console.warn('Real search network request failed, falling back to local matches:', err);

    // Fallback client-side filter over curated catalogue
    const lower = query.toLowerCase();
    const matchedTracks = CURATED_FEATURED_TRACKS.filter(
      (t) => t.title.toLowerCase().includes(lower) || t.artist.toLowerCase().includes(lower)
    );
    const matchedArtists = POPULAR_ARTISTS_CATALOGUE.filter((a) => a.name.toLowerCase().includes(lower));

    return {
      tracks: matchedTracks,
      artists: matchedArtists,
      albums: [],
    };
  }
}

/**
 * Fetch tracks for an artist by name/query
 */
export async function getArtistDetails(artistName: string): Promise<Artist | null> {
  const existing = POPULAR_ARTISTS_CATALOGUE.find(
    (a) => a.name.toLowerCase() === artistName.toLowerCase()
  );

  try {
    const { tracks, albums } = await searchMusic(artistName);
    const artistTracks = tracks.filter((t) => t.artist.toLowerCase().includes(artistName.toLowerCase()));

    return {
      id: existing?.id || `artist-${encodeURIComponent(artistName)}`,
      name: artistName,
      avatarUrl: existing?.avatarUrl || artistTracks[0]?.artworkUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
      monthlyListeners: existing?.monthlyListeners || 18450000,
      isVerified: true,
      bio: existing?.bio || `${artistName} is an internationally recognized recording artist streaming globally on Soundify.`,
      popularTracks: artistTracks.length > 0 ? artistTracks : (existing?.popularTracks || []),
      albums: albums.length > 0 ? albums : (existing?.albums || []),
    };
  } catch {
    return existing || null;
  }
}
