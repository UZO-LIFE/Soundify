/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Mic2, ShieldAlert } from 'lucide-react';
import { usePlaybackProgress, useAudioEngine } from '../../audio/AudioContext.tsx';
import { getTrackLyrics } from '../../services/lyricsService.ts';
import { TrackLyrics } from '../../types/music.ts';

interface LyricsViewProps {
  className?: string;
}

export const LyricsView: React.FC<LyricsViewProps> = ({ className = '' }) => {
  const { state } = useAudioEngine();
  const { currentTimeSec } = usePlaybackProgress();
  const [lyrics, setLyrics] = useState<TrackLyrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const activeLineRef = useRef<HTMLParagraphElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch lyrics whenever current track changes
  useEffect(() => {
    let active = true;
    if (!state.currentTrack) {
      setLyrics(null);
      return;
    }

    setIsLoading(true);
    getTrackLyrics(state.currentTrack.title, state.currentTrack.id).then((res) => {
      if (active) {
        setLyrics(res);
        setIsLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [state.currentTrack?.id]);

  // Determine active lyric line based on currentTimeSec
  const currentLineIndex = lyrics?.lines.reduce((acc, line, idx) => {
    if (currentTimeSec >= line.timeSec) {
      return idx;
    }
    return acc;
  }, -1) ?? -1;

  // Auto-scroll to active lyric line
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentLineIndex]);

  if (!state.currentTrack) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 text-neutral-500 text-center select-none ${className}`}>
        <Mic2 className="w-10 h-10 mb-3 opacity-40" />
        <p className="text-sm font-medium text-neutral-400">Play a track to view lyrics</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 text-neutral-400 text-center select-none ${className}`}>
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs">Fetching licensed lyrics...</p>
      </div>
    );
  }

  if (!lyrics || lyrics.lines.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 text-center select-none ${className}`}>
        <div className="w-12 h-12 rounded-full bg-neutral-800/80 border border-neutral-700/60 flex items-center justify-center text-neutral-400 mb-4">
          <Mic2 className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-white mb-2">Lyrics Unavailable</h4>
        <p className="text-xs text-neutral-400 max-w-xs leading-relaxed mb-4">
          Licensed synchronized lyrics for <span className="text-neutral-200 font-semibold">"{state.currentTrack.title}"</span> are not currently authorized by the publishing provider.
        </p>
        <span className="text-[11px] text-neutral-500 flex items-center gap-1.5 font-mono">
          <ShieldAlert className="w-3.5 h-3.5 text-neutral-500" />
          Zero-scraping policy: only authorized lyrics are displayed.
        </span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`h-full overflow-y-auto px-4 py-8 space-y-5 select-none scrollbar-thin scrollbar-thumb-neutral-800 ${className}`}
    >
      <div className="mb-4 pb-2 border-b border-neutral-800/60 flex items-center justify-between text-xs text-neutral-400">
        <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Synchronized Lyrics
        </span>
        <span className="text-[10px] text-neutral-500 truncate max-w-[200px]">
          {lyrics.attribution}
        </span>
      </div>

      {lyrics.lines.map((line, idx) => {
        const isActive = idx === currentLineIndex;
        const isPast = idx < currentLineIndex;

        return (
          <p
            key={idx}
            ref={isActive ? activeLineRef : null}
            className={`text-lg sm:text-xl font-bold transition-all duration-300 leading-snug cursor-pointer ${
              isActive
                ? 'text-white scale-102 translate-x-1'
                : isPast
                ? 'text-neutral-500 hover:text-neutral-300'
                : 'text-neutral-600 hover:text-neutral-400'
            }`}
          >
            {line.text}
          </p>
        );
      })}
    </div>
  );
};
