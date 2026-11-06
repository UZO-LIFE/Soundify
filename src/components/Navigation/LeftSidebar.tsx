/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Home, Search, Library, Plus, Heart, Music } from 'lucide-react';
import { BrandLogo } from '../BrandLogo.tsx';
import { useLibrary } from '../../context/LibraryContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { ViewNavigation } from '../../types/music.ts';

interface LeftSidebarProps {
  currentView: ViewNavigation;
  onNavigate: (view: ViewNavigation) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  currentView,
  onNavigate,
  isCollapsed = false,
}) => {
  const { playlists, likedTracks, createPlaylist } = useLibrary();
  const { isGuest, promptAuth } = useAuth();

  const handleCreatePlaylist = () => {
    if (isGuest) {
      promptAuth('create_playlist');
      return;
    }
    const pl = createPlaylist();
    if (pl) {
      onNavigate({ type: 'playlist', id: pl.id });
    }
  };

  return (
    <aside
      className={`h-full bg-[#121212] border-r border-neutral-800/80 flex flex-col transition-all duration-200 select-none ${
        isCollapsed ? 'w-20' : 'w-64 lg:w-72'
      }`}
    >
      {/* Top Branding */}
      <div className="p-5 pb-3">
        <BrandLogo
          isCompact={isCollapsed}
          onClick={() => onNavigate({ type: 'home' })}
        />
      </div>

      {/* Primary Navigation Links */}
      <div className="px-3 py-2 space-y-1">
        <button
          onClick={() => onNavigate({ type: 'home' })}
          className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${
            currentView.type === 'home'
              ? 'text-white bg-neutral-800/80'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
          }`}
          title="Home"
        >
          <Home className={`w-5 h-5 shrink-0 ${currentView.type === 'home' ? 'text-emerald-400' : ''}`} />
          {!isCollapsed && <span>Home</span>}
        </button>

        <button
          onClick={() => onNavigate({ type: 'search' })}
          className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${
            currentView.type === 'search'
              ? 'text-white bg-neutral-800/80'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
          }`}
          title="Search"
        >
          <Search className={`w-5 h-5 shrink-0 ${currentView.type === 'search' ? 'text-emerald-400' : ''}`} />
          {!isCollapsed && <span>Search</span>}
        </button>

        <button
          onClick={() => onNavigate({ type: 'create' })}
          className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${
            currentView.type === 'create'
              ? 'text-white bg-neutral-800/80'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
          }`}
          title="Create"
        >
          <Plus className={`w-5 h-5 shrink-0 ${currentView.type === 'create' ? 'text-emerald-400' : ''}`} />
          {!isCollapsed && <span>Create</span>}
        </button>
      </div>

      <div className="mx-4 my-2 border-t border-neutral-800/80" />

      {/* Library Section Header */}
      <div className="px-4 py-2 flex items-center justify-between">
        <button
          onClick={() => onNavigate({ type: 'library' })}
          className="flex items-center gap-3 text-neutral-400 hover:text-white text-sm font-bold transition group"
          title="Your Library"
        >
          <Library className="w-5 h-5 group-hover:text-emerald-400 transition-colors shrink-0" />
          {!isCollapsed && <span>Your Library</span>}
        </button>

        {!isCollapsed && (
          <button
            onClick={handleCreatePlaylist}
            className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full transition"
            title="Create Playlist"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Library Content Area */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
        {/* Pinned: Liked Songs Collection */}
        <button
          onClick={() => onNavigate({ type: 'liked' })}
          className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition group ${
            currentView.type === 'liked'
              ? 'bg-neutral-800/80 text-white'
              : 'hover:bg-neutral-800/40 text-neutral-300'
          }`}
          title="Liked Songs"
        >
          <div className="w-10 h-10 rounded-md bg-gradient-to-br from-indigo-700 via-purple-600 to-pink-500 flex items-center justify-center text-white shrink-0 shadow">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold truncate group-hover:text-white">Liked Songs</div>
              <div className="text-xs text-neutral-500 truncate flex items-center gap-1">
                <span>Playlist</span>
                <span>·</span>
                <span>{likedTracks.length} songs</span>
              </div>
            </div>
          )}
        </button>

        {/* User-created Playlists */}
        {playlists.length > 0 ? (
          playlists.map((playlist) => {
            const isSelected = currentView.type === 'playlist' && currentView.id === playlist.id;
            return (
              <button
                key={playlist.id}
                onClick={() => onNavigate({ type: 'playlist', id: playlist.id })}
                className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition group ${
                  isSelected
                    ? 'bg-neutral-800/90 text-emerald-400'
                    : 'hover:bg-neutral-800/40 text-neutral-300'
                }`}
                title={playlist.title}
              >
                <div className="w-10 h-10 rounded-md bg-neutral-800 overflow-hidden shrink-0 border border-neutral-700/60 flex items-center justify-center text-neutral-500">
                  {playlist.coverArtUrl ? (
                    <img
                      src={playlist.coverArtUrl}
                      alt={playlist.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Music className="w-4 h-4" />
                  )}
                </div>

                {!isCollapsed && (
                  <div className="min-w-0 flex-1">
                    <div className={`text-sm font-semibold truncate ${isSelected ? 'text-emerald-400' : 'group-hover:text-white'}`}>
                      {playlist.title}
                    </div>
                    <div className="text-xs text-neutral-500 truncate">
                      Playlist · {playlist.tracks.length} tracks
                    </div>
                  </div>
                )}
              </button>
            );
          })
        ) : (
          /* Clean Spotify-style Empty Library Callout */
          !isCollapsed && (
            <div className="p-4 mt-3 bg-[#181818] rounded-xl border border-neutral-800/80 space-y-2.5">
              <div className="text-xs font-bold text-white">Create your first playlist</div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                It's easy, we'll help you organize your favorite music.
              </p>
              <button
                onClick={handleCreatePlaylist}
                className="px-3.5 py-1.5 bg-white text-black hover:bg-neutral-200 text-xs font-bold rounded-full transition shadow-sm"
              >
                Create playlist
              </button>
            </div>
          )
        )}
      </div>
    </aside>
  );
};
