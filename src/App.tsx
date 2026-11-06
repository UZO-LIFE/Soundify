/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AudioProvider, useAudioEngine } from './audio/AudioContext.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { LibraryProvider, useLibrary } from './context/LibraryContext.tsx';
import { LeftSidebar } from './components/Navigation/LeftSidebar.tsx';
import { TopBar } from './components/Navigation/TopBar.tsx';
import { MobileBottomNav } from './components/Navigation/MobileBottomNav.tsx';
import { BottomPlayerBar } from './components/Player/BottomPlayerBar.tsx';
import { MobileMiniPlayer } from './components/Player/MobileMiniPlayer.tsx';
import { RightPanel, RightPanelTab } from './components/Player/RightPanel.tsx';
import { ExpandedPlayerModal } from './components/Player/ExpandedPlayerModal.tsx';
import { AuthModal } from './components/Auth/AuthModal.tsx';
import { OnboardingModal } from './components/Auth/OnboardingModal.tsx';
import { HomeView } from './views/HomeView.tsx';
import { SearchView } from './views/SearchView.tsx';
import { ArtistView } from './views/ArtistView.tsx';
import { AlbumView } from './views/AlbumView.tsx';
import { PlaylistView } from './views/PlaylistView.tsx';
import { LikedSongsView } from './views/LikedSongsView.tsx';
import { LibraryView } from './views/LibraryView.tsx';
import { CreateView } from './views/CreateView.tsx';
import { LicensingModal } from './views/LicensingModal.tsx';
import { SoundifyTrack, ViewNavigation } from './types/music.ts';
import {
  recordSignalPlay,
  recordSignalCompletion,
  recordSignalSkip,
} from './services/recommendationEngine.ts';
import { ShieldAlert } from 'lucide-react';

const SoundifyApp: React.FC = () => {
  const { state, play } = useAudioEngine();
  const { recordRecentlyPlayed } = useLibrary();
  const { user } = useAuth();

  // Navigation History Management
  const [history, setHistory] = useState<ViewNavigation[]>([{ type: 'home' }]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const currentView = history[historyIndex] || { type: 'home' };

  // UI Panels and Modals
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<RightPanelTab | null>(null);
  const [isExpandedPlayerOpen, setIsExpandedPlayerOpen] = useState(false);
  const [isLicensingModalOpen, setIsLicensingModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const activeTrackRef = React.useRef<{ trackId: string; startTime: number } | null>(null);

  // Automatically record listening history and recommendation behavioral signals
  useEffect(() => {
    if (state.currentTrack && (state.status === 'playing' || state.status === 'buffering')) {
      recordRecentlyPlayed(state.currentTrack as SoundifyTrack);

      if (!activeTrackRef.current || activeTrackRef.current.trackId !== state.currentTrack.id) {
        if (activeTrackRef.current) {
          const listenedSeconds = (Date.now() - activeTrackRef.current.startTime) / 1000;
          if (state.durationSec > 0 && (state.currentTimeSec / state.durationSec) >= 0.75) {
            recordSignalCompletion(activeTrackRef.current.trackId, user?.id);
          } else if (listenedSeconds < 15) {
            recordSignalSkip(activeTrackRef.current.trackId, user?.id);
          }
        }

        recordSignalPlay(state.currentTrack.id, user?.id);
        activeTrackRef.current = {
          trackId: state.currentTrack.id,
          startTime: Date.now(),
        };
      }
    }
  }, [state.currentTrack?.id, state.status, user?.id]);

  const navigateTo = (view: ViewNavigation) => {
    if (view.type === 'search' && view.id) {
      setSearchQuery(view.id);
    }
    const updatedHistory = history.slice(0, historyIndex + 1);
    updatedHistory.push(view);
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
    }
  };

  const handleToggleRightPanel = (tab: RightPanelTab) => {
    if (rightPanelTab === tab) {
      setRightPanelTab(null);
    } else {
      setRightPanelTab(tab);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0c0d0e] text-neutral-200 overflow-hidden font-sans">
      {/* Autoplay Interception Banner */}
      {state.isAutoplayBlocked && (
        <div className="bg-amber-950/90 border-b border-amber-800 px-4 py-2 flex items-center justify-between text-xs text-amber-200 z-50">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Browser Autoplay Policy:</strong> Click unlock to permit audio stream output.
            </span>
          </div>
          <button
            onClick={() => play()}
            className="px-3 py-1 bg-amber-500 text-black font-semibold rounded hover:bg-amber-400 transition"
          >
            Unlock Audio
          </button>
        </div>
      )}

      {/* Main 3-Panel Viewport Canvas */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Panel 1: Left Navigation & Library Sidebar (Desktop/Tablet) */}
        <div className="hidden md:flex h-full shrink-0">
          <LeftSidebar
            currentView={currentView}
            onNavigate={navigateTo}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        </div>

        {/* Panel 2: Center Main Content Canvas */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#121212] relative">
          <TopBar
            currentView={currentView}
            onNavigate={navigateTo}
            canGoBack={historyIndex > 0}
            canGoForward={historyIndex < history.length - 1}
            onGoBack={goBack}
            onGoForward={goForward}
            searchQuery={searchQuery}
            onSearchChange={(q) => {
              setSearchQuery(q);
              if (currentView.type !== 'search') {
                navigateTo({ type: 'search' });
              }
            }}
            onOpenLicensingModal={() => setIsLicensingModalOpen(true)}
          />

          {/* Dynamic Content View Area with Custom Scrollbar */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-neutral-800">
            {currentView.type === 'home' && <HomeView onNavigate={navigateTo} />}

            {currentView.type === 'search' && (
              <SearchView
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onNavigate={navigateTo}
              />
            )}

            {currentView.type === 'artist' && (
              <ArtistView artistName={currentView.id || 'Ed Sheeran'} onNavigate={navigateTo} />
            )}

            {currentView.type === 'album' && (
              <AlbumView albumTitle={currentView.id || '='} onNavigate={navigateTo} />
            )}

            {currentView.type === 'playlist' && (
              <PlaylistView
                playlistId={currentView.id || 'pl-today-top-hits'}
                onNavigate={navigateTo}
              />
            )}

            {currentView.type === 'liked' && <LikedSongsView onNavigate={navigateTo} />}

            {currentView.type === 'library' && <LibraryView onNavigate={navigateTo} />}

            {currentView.type === 'create' && <CreateView onNavigate={navigateTo} />}
          </main>
        </div>

        {/* Panel 3: Right Contextual Panel (Now Playing / Queue / Synchronized Lyrics) */}
        {rightPanelTab && (
          <div className="hidden lg:flex h-full shrink-0">
            <RightPanel
              activeTab={rightPanelTab}
              onTabChange={setRightPanelTab}
              onClose={() => setRightPanelTab(null)}
            />
          </div>
        )}
      </div>

      {/* Persistent Bottom Player (Desktop/Tablet) */}
      <div className="hidden md:block shrink-0">
        <BottomPlayerBar
          onToggleRightPanel={handleToggleRightPanel}
          rightPanelTab={rightPanelTab}
          onOpenExpandedPlayer={() => setIsExpandedPlayerOpen(true)}
        />
      </div>

      {/* Mobile Sticky Player & Bottom Navigation */}
      <div className="block md:hidden shrink-0 bg-[#121212]">
        <MobileMiniPlayer onOpenExpandedPlayer={() => setIsExpandedPlayerOpen(true)} />
        <MobileBottomNav currentView={currentView} onNavigate={navigateTo} />
      </div>

      {/* Full-Screen Immersive Expanded Player Modal (Mobile & Desktop) */}
      <ExpandedPlayerModal
        isOpen={isExpandedPlayerOpen}
        onClose={() => setIsExpandedPlayerOpen(false)}
      />

      {/* Streaming Transparency & Licensing Modal */}
      <LicensingModal
        isOpen={isLicensingModalOpen}
        onClose={() => setIsLicensingModalOpen(false)}
      />

      {/* Account Authentication Modal (Login / Sign Up) */}
      <AuthModal />

      {/* Optional First-Time Music Discovery Preferences Onboarding Modal */}
      <OnboardingModal />
    </div>
  );
};

export default function App() {
  return (
    <AudioProvider>
      <AuthProvider>
        <LibraryProvider>
          <SoundifyApp />
        </LibraryProvider>
      </AuthProvider>
    </AudioProvider>
  );
}
