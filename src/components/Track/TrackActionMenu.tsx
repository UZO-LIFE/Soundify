/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  MoreHorizontal,
  ListPlus,
  Play,
  Heart,
  Plus,
  User,
  Disc3,
  Check,
  Music,
} from 'lucide-react';
import { useAudioEngine } from '../../audio/AudioContext.tsx';
import { useLibrary } from '../../context/LibraryContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { SoundifyTrack, ViewNavigation } from '../../types/music.ts';

interface TrackActionMenuProps {
  track: SoundifyTrack;
  onNavigate?: (view: ViewNavigation) => void;
  className?: string;
  iconSize?: 'sm' | 'md';
}

export const TrackActionMenu: React.FC<TrackActionMenuProps> = ({
  track,
  onNavigate,
  className = '',
  iconSize = 'sm',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaylistSubmenuOpen, setIsPlaylistSubmenuOpen] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const { addToQueue, playNext } = useAudioEngine();
  const { isLiked, toggleLikeTrack, playlists, addTrackToPlaylist, createPlaylist } = useLibrary();
  const { isGuest, promptAuth } = useAuth();

  const isCurrentlyLiked = isLiked(track.id);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsPlaylistSubmenuOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const showFeedback = (text: string) => {
    setAddedFeedback(text);
    setTimeout(() => {
      setAddedFeedback(null);
      setIsOpen(false);
      setIsPlaylistSubmenuOpen(false);
    }, 1200);
  };

  const handleAddToQueue = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToQueue(track);
    showFeedback('Added to queue');
  };

  const handlePlayNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    playNext(track);
    showFeedback('Will play next');
  };

  const handleToggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLikeTrack(track);
    setIsOpen(false);
  };

  const handleAddToSpecificPlaylist = (playlistId: string, playlistTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    addTrackToPlaylist(playlistId, track);
    showFeedback(`Added to ${playlistTitle}`);
  };

  const handleCreateNewPlaylistWithTrack = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGuest) {
      promptAuth('create_playlist');
      return;
    }
    const pl = createPlaylist(`${track.title} Mix`);
    if (pl) {
      addTrackToPlaylist(pl.id, track);
      showFeedback('Added to new playlist');
    }
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1.5 text-neutral-400 hover:text-white rounded-full transition hover:bg-white/10"
        title="More options"
      >
        <MoreHorizontal className={iconSize === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} />
      </button>

      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 bottom-full mb-1 w-56 rounded-lg bg-[#282828] text-white shadow-2xl border border-neutral-700/80 py-1.5 z-50 text-xs font-medium focus:outline-none animate-in fade-in zoom-in-95 duration-150"
        >
          {addedFeedback ? (
            <div className="px-4 py-3 text-emerald-400 flex items-center gap-2 font-semibold justify-center">
              <Check className="w-4 h-4" />
              <span>{addedFeedback}</span>
            </div>
          ) : (
            <>
              {/* Option: Add to Queue */}
              <button
                onClick={handleAddToQueue}
                className="w-full text-left px-3.5 py-2 hover:bg-white/10 flex items-center gap-3 transition"
              >
                <ListPlus className="w-4 h-4 text-neutral-300" />
                <span>Add to queue</span>
              </button>

              {/* Option: Play Next */}
              <button
                onClick={handlePlayNext}
                className="w-full text-left px-3.5 py-2 hover:bg-white/10 flex items-center gap-3 transition"
              >
                <Play className="w-4 h-4 text-neutral-300" />
                <span>Play next</span>
              </button>

              {/* Option: Like / Unlike */}
              <button
                onClick={handleToggleLike}
                className="w-full text-left px-3.5 py-2 hover:bg-white/10 flex items-center gap-3 transition"
              >
                <Heart className={`w-4 h-4 ${isCurrentlyLiked ? 'text-emerald-400 fill-current' : 'text-neutral-300'}`} />
                <span>{isCurrentlyLiked ? 'Remove from your Liked Songs' : 'Save to your Liked Songs'}</span>
              </button>

              <div className="my-1 border-t border-neutral-700/60" />

              {/* Option: Add to Playlist */}
              <div className="relative">
                <button
                  onClick={() => setIsPlaylistSubmenuOpen(!isPlaylistSubmenuOpen)}
                  className="w-full text-left px-3.5 py-2 hover:bg-white/10 flex items-center justify-between transition"
                >
                  <div className="flex items-center gap-3">
                    <Plus className="w-4 h-4 text-neutral-300" />
                    <span>Add to playlist</span>
                  </div>
                  <span className="text-[10px] text-neutral-400">›</span>
                </button>

                {isPlaylistSubmenuOpen && (
                  <div className="bg-[#202020] border-t border-b border-neutral-700/60 py-1 px-1">
                    <button
                      onClick={handleCreateNewPlaylistWithTrack}
                      className="w-full text-left px-3 py-1.5 hover:bg-white/10 rounded flex items-center gap-2 text-emerald-400 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>New playlist</span>
                    </button>

                    {playlists.length > 0 ? (
                      <div className="max-h-32 overflow-y-auto mt-1 space-y-0.5">
                        {playlists.map((pl) => (
                          <button
                            key={pl.id}
                            onClick={(e) => handleAddToSpecificPlaylist(pl.id, pl.title, e)}
                            className="w-full text-left px-3 py-1.5 hover:bg-white/10 rounded flex items-center gap-2 text-neutral-200 transition truncate"
                          >
                            <Music className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                            <span className="truncate">{pl.title}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-3 py-1 text-[11px] text-neutral-400">No playlists yet</div>
                    )}
                  </div>
                )}
              </div>

              {/* Option: Go to Artist */}
              {onNavigate && track.artist && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onNavigate({ type: 'artist', id: track.artist });
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-white/10 flex items-center gap-3 transition"
                >
                  <User className="w-4 h-4 text-neutral-300" />
                  <span>Go to artist</span>
                </button>
              )}

              {/* Option: Go to Album */}
              {onNavigate && track.album && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onNavigate({ type: 'album', id: track.album });
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-white/10 flex items-center gap-3 transition"
                >
                  <Disc3 className="w-4 h-4 text-neutral-300" />
                  <span>Go to album</span>
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
