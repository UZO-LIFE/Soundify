/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  ShieldCheck,
  User,
  LogOut,
  Sliders,
  UserPlus,
  LogIn,
} from 'lucide-react';
import { ViewNavigation } from '../../types/music.ts';
import { useAuth } from '../../context/AuthContext.tsx';

interface TopBarProps {
  currentView: ViewNavigation;
  onNavigate: (view: ViewNavigation) => void;
  canGoBack: boolean;
  canGoForward: boolean;
  onGoBack: () => void;
  onGoForward: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenLicensingModal: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentView,
  onNavigate,
  canGoBack,
  canGoForward,
  onGoBack,
  onGoForward,
  searchQuery,
  onSearchChange,
  onOpenLicensingModal,
}) => {
  const { user, isGuest, logout, promptAuth, openOnboardingModal } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 bg-[#121212]/95 backdrop-blur-md border-b border-neutral-800/60 select-none">
      {/* Left: History Navigation & Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <div className="flex items-center gap-1.5">
          <button
            onClick={onGoBack}
            disabled={!canGoBack}
            className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 disabled:opacity-30 disabled:hover:bg-black/50 text-white flex items-center justify-center transition"
            title="Go back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={onGoForward}
            disabled={!canGoForward}
            className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 disabled:opacity-30 disabled:hover:bg-black/50 text-white flex items-center justify-center transition"
            title="Go forward"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar when in Search mode or accessible */}
        {currentView.type === 'search' ? (
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="What do you want to play? (e.g. Ed Sheeran, Burna Boy, Drake)"
              className="w-full bg-neutral-800 text-white placeholder-neutral-400 text-sm pl-10 pr-4 py-2 rounded-full border border-neutral-700/80 focus:outline-none focus:border-emerald-500 transition"
              autoFocus
            />
          </div>
        ) : (
          <button
            onClick={() => onNavigate({ type: 'search' })}
            className="hidden sm:flex items-center gap-2.5 bg-neutral-800/80 hover:bg-neutral-800 text-neutral-400 hover:text-white px-3.5 py-1.5 rounded-full text-xs font-medium border border-neutral-700/60 transition"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search tracks, artists, or albums...</span>
          </button>
        )}
      </div>

      {/* Right: Stream Licensing Transparency & Account Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenLicensingModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-800/60 text-xs font-semibold transition"
          title="Streaming & Catalog Source Transparency"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Catalog Sources</span>
        </button>

        {isGuest ? (
          /* Guest Actions: Log in / Sign up */
          <div className="flex items-center gap-2">
            <button
              onClick={() => promptAuth('generic')}
              className="text-neutral-400 hover:text-white text-xs font-semibold px-3 py-1.5 transition"
            >
              Sign up
            </button>
            <button
              onClick={() => promptAuth('generic')}
              className="px-4 py-1.5 bg-white text-black hover:bg-neutral-200 text-xs font-bold rounded-full transition shadow-sm"
            >
              Log in
            </button>
          </div>
        ) : (
          /* Authenticated User Menu */
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-neutral-800 transition border border-transparent hover:border-neutral-700"
            >
              <div
                className={`w-8 h-8 rounded-full ${
                  user?.avatarColor || 'bg-emerald-600'
                } flex items-center justify-center text-white text-xs font-bold shadow`}
              >
                {user?.displayName ? user.displayName[0].toUpperCase() : 'U'}
              </div>
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#18191d] border border-neutral-800 rounded-xl shadow-2xl p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-neutral-800/80 mb-1">
                  <div className="font-bold text-white truncate">{user?.displayName}</div>
                  <div className="text-[11px] text-neutral-400 truncate">{user?.email}</div>
                </div>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    openOnboardingModal();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition text-left"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Music Preferences</span>
                </button>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onNavigate({ type: 'library' });
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition text-left"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Your Library</span>
                </button>

                <div className="my-1 border-t border-neutral-800" />

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-950/40 transition text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
