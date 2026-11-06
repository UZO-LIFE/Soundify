/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AudioSourceAdapter, SourceResolutionResult, Track } from './types.ts';

/**
 * Standard Direct HTTP Stream Adapter
 * Handles direct publicly reachable HTTP/HTTPS audio streams (e.g. CDN-hosted MP3/AAC/OGG files)
 */
export class DirectHttpSourceAdapter implements AudioSourceAdapter {
  readonly id = 'direct_http';
  readonly name = 'Direct HTTP/HTTPS Audio Stream';

  canHandle(track: Track): boolean {
    return (
      track.sourceProvider === 'direct_http' ||
      track.sourceReference.startsWith('http://') ||
      track.sourceReference.startsWith('https://') ||
      track.sourceReference.startsWith('blob:') ||
      track.sourceReference.startsWith('data:')
    );
  }

  async resolveSource(track: Track): Promise<SourceResolutionResult> {
    if (!track.sourceReference || track.sourceReference.trim() === '') {
      return {
        success: false,
        errorCode: 'NOT_FOUND',
        message: `Audio source reference is empty for track "${track.title}".`,
      };
    }

    // Verify format and scheme
    try {
      const url = new URL(track.sourceReference);
      if (url.protocol !== 'http:' && url.protocol !== 'https:' && url.protocol !== 'blob:') {
        return {
          success: false,
          errorCode: 'FORMAT_UNSUPPORTED',
          message: `Unsupported protocol "${url.protocol}" for track "${track.title}".`,
        };
      }
    } catch {
      // In case of relative path or blob
      if (!track.sourceReference.startsWith('/') && !track.sourceReference.startsWith('blob:')) {
        return {
          success: false,
          errorCode: 'NOT_FOUND',
          message: `Invalid audio stream URL for track "${track.title}".`,
        };
      }
    }

    return {
      success: true,
      source: {
        streamUrl: track.sourceReference,
        format: 'audio/mpeg',
      },
    };
  }
}

/**
 * Authorized Catalogue Provider Adapter
 * Simulates a modular commercial/licensed streaming service requiring tokenized or signed stream resolution.
 */
export class AuthorizedProviderSourceAdapter implements AudioSourceAdapter {
  readonly id = 'authorized_provider';
  readonly name = 'Authorized Catalogue Provider';

  private authToken: string | null = 'SOUNDIFY_AUTH_MOCK_TOKEN_2026';

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  canHandle(track: Track): boolean {
    return track.sourceProvider === 'authorized_provider';
  }

  async resolveSource(track: Track): Promise<SourceResolutionResult> {
    if (!this.authToken) {
      return {
        success: false,
        errorCode: 'UNAUTHORIZED',
        message: `User is not authenticated with authorized catalogue provider for track "${track.title}".`,
      };
    }

    // Check if the track reference is known and authorized
    if (track.sourceReference.includes('unauthorized') || track.sourceReference.includes('restricted')) {
      return {
        success: false,
        errorCode: 'UNAUTHORIZED',
        message: `Playback license authorization denied for track "${track.title}". This stream is restricted in this tier.`,
      };
    }

    if (track.sourceReference.includes('missing') || track.sourceReference.includes('404')) {
      return {
        success: false,
        errorCode: 'NOT_FOUND',
        message: `Audio asset for track "${track.title}" not found on provider CDN servers.`,
      };
    }

    // Resolves successfully to authorized audio endpoint with signed expiry
    return {
      success: true,
      source: {
        streamUrl: track.sourceReference,
        format: 'audio/mp3',
        expiresAt: Date.now() + 3600 * 1000,
        headers: {
          Authorization: `Bearer ${this.authToken}`,
        },
      },
    };
  }
}

/**
 * Registry managing all active Audio Source Adapters.
 * Provides a modular, provider-independent resolution pipeline.
 */
export class AudioSourceAdapterRegistry {
  private adapters: AudioSourceAdapter[] = [];

  constructor() {
    // Register built-in default adapters
    this.registerAdapter(new DirectHttpSourceAdapter());
    this.registerAdapter(new AuthorizedProviderSourceAdapter());
  }

  registerAdapter(adapter: AudioSourceAdapter): void {
    // Avoid duplicate registration of the same adapter ID
    this.adapters = this.adapters.filter((a) => a.id !== adapter.id);
    this.adapters.unshift(adapter); // Prioritize newly registered adapters
  }

  unregisterAdapter(adapterId: string): void {
    this.adapters = this.adapters.filter((a) => a.id !== adapterId);
  }

  getAdapter(adapterId: string): AudioSourceAdapter | undefined {
    return this.adapters.find((a) => a.id === adapterId);
  }

  getRegisteredAdapters(): AudioSourceAdapter[] {
    return [...this.adapters];
  }

  async resolve(track: Track): Promise<SourceResolutionResult> {
    // Find first adapter capable of handling the track
    const adapter = this.adapters.find((a) => a.canHandle(track));

    if (!adapter) {
      return {
        success: false,
        errorCode: 'FORMAT_UNSUPPORTED',
        message: `No registered audio source adapter found to handle provider "${track.sourceProvider}" for track "${track.title}".`,
      };
    }

    try {
      return await adapter.resolveSource(track);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        errorCode: 'NETWORK_ERROR',
        message: `Error resolving audio source with adapter "${adapter.name}": ${msg}`,
      };
    }
  }
}
