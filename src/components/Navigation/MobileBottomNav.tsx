/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Home, Search, Library, Plus } from 'lucide-react';
import { ViewNavigation } from '../../types/music.ts';

interface MobileBottomNavProps {
  currentView: ViewNavigation;
  onNavigate: (view: ViewNavigation) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentView, onNavigate }) => {
  return (
    <nav className="h-14 bg-[#121212] border-t border-neutral-800/80 flex items-center justify-around px-2 select-none z-30">
      <button
        onClick={() => onNavigate({ type: 'home' })}
        className={`flex flex-col items-center justify-center gap-1 w-16 py-1 transition ${
          currentView.type === 'home' ? 'text-white' : 'text-neutral-400 hover:text-neutral-200'
        }`}
      >
        <Home className={`w-5 h-5 ${currentView.type === 'home' ? 'text-emerald-400' : ''}`} />
        <span className="text-[10px] font-medium">Home</span>
      </button>

      <button
        onClick={() => onNavigate({ type: 'search' })}
        className={`flex flex-col items-center justify-center gap-1 w-16 py-1 transition ${
          currentView.type === 'search' ? 'text-white' : 'text-neutral-400 hover:text-neutral-200'
        }`}
      >
        <Search className={`w-5 h-5 ${currentView.type === 'search' ? 'text-emerald-400' : ''}`} />
        <span className="text-[10px] font-medium">Search</span>
      </button>

      <button
        onClick={() => onNavigate({ type: 'library' })}
        className={`flex flex-col items-center justify-center gap-1 w-16 py-1 transition ${
          currentView.type === 'library' || currentView.type === 'liked' || currentView.type === 'playlist'
            ? 'text-white'
            : 'text-neutral-400 hover:text-neutral-200'
        }`}
      >
        <Library className={`w-5 h-5 ${currentView.type === 'library' ? 'text-emerald-400' : ''}`} />
        <span className="text-[10px] font-medium">Your Library</span>
      </button>

      <button
        onClick={() => onNavigate({ type: 'create' })}
        className={`flex flex-col items-center justify-center gap-1 w-16 py-1 transition ${
          currentView.type === 'create' ? 'text-white' : 'text-neutral-400 hover:text-neutral-200'
        }`}
      >
        <Plus className={`w-5 h-5 ${currentView.type === 'create' ? 'text-emerald-400' : ''}`} />
        <span className="text-[10px] font-medium">Create</span>
      </button>
    </nav>
  );
};
