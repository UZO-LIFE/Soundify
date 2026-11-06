/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthActionPrompt, UserPreferences, UserProfile } from '../types/music.ts';

interface StoredAccount {
  profile: UserProfile;
  passwordHash: string; // Stored locally for client account credential check
}

interface AuthContextValue {
  user: UserProfile | null;
  isGuest: boolean;
  isAuthModalOpen: boolean;
  isOnboardingModalOpen: boolean;
  authPromptReason: AuthActionPrompt | null;
  register: (email: string, password: string, displayName: string) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updatePreferences: (preferences: UserPreferences) => void;
  promptAuth: (reason?: AuthActionPrompt) => void;
  closeAuthModal: () => void;
  closeOnboardingModal: () => void;
  openOnboardingModal: () => void;
  quickSwitchAccount: (accountEmail: string) => void;
  getRegisteredAccounts: () => UserProfile[];
}

const STORAGE_KEYS = {
  ACCOUNTS_REGISTRY: 'soundify_accounts_registry_v2',
  ACTIVE_SESSION: 'soundify_active_session_user_id_v2',
};

const AVATAR_COLORS = [
  'bg-emerald-600',
  'bg-blue-600',
  'bg-purple-600',
  'bg-pink-600',
  'bg-amber-600',
  'bg-indigo-600',
  'bg-teal-600',
];

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Accounts Registry: email -> StoredAccount
  const [registry, setRegistry] = useState<Record<string, StoredAccount>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ACCOUNTS_REGISTRY);
      if (stored) return JSON.parse(stored);
    } catch {
      // silent
    }
    return {};
  });

  // Active User: strictly null for new visitors (Guest)
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
      if (activeId) {
        const storedRegistry = localStorage.getItem(STORAGE_KEYS.ACCOUNTS_REGISTRY);
        if (storedRegistry) {
          const parsed = JSON.parse(storedRegistry) as Record<string, StoredAccount>;
          const match = Object.values(parsed).find((acc) => acc.profile.id === activeId);
          if (match) return match.profile;
        }
      }
    } catch {
      // silent
    }
    return null; // Initial state is genuinely Guest
  });

  // Modal triggers
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authPromptReason, setAuthPromptReason] = useState<AuthActionPrompt | null>(null);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);

  // Sync registry to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS_REGISTRY, JSON.stringify(registry));
    } catch {
      // silent
    }
  }, [registry]);

  // Sync active session ID
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, user.id);
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
      }
    } catch {
      // silent
    }
  }, [user]);

  const register = async (
    email: string,
    password: string,
    displayName: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!password || password.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters.' };
    }
    if (registry[cleanEmail]) {
      return { success: false, error: 'An account with this email already exists. Please log in.' };
    }

    const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    const newProfile: UserProfile = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: cleanEmail,
      displayName: displayName.trim() || cleanEmail.split('@')[0],
      avatarColor: randomColor,
      createdAt: Date.now(),
      preferences: {
        favoriteGenres: [],
        favoriteArtists: [],
      },
    };

    const newRegistry = {
      ...registry,
      [cleanEmail]: {
        profile: newProfile,
        passwordHash: password, // client credential check
      },
    };

    setRegistry(newRegistry);
    setUser(newProfile);
    setIsAuthModalOpen(false);
    setAuthPromptReason(null);

    // Open first-time optional onboarding
    setIsOnboardingModalOpen(true);

    return { success: true };
  };

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const account = registry[cleanEmail];

    if (!account) {
      return { success: false, error: 'No account found with this email. Please sign up.' };
    }

    if (account.passwordHash !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    setUser(account.profile);
    setIsAuthModalOpen(false);
    setAuthPromptReason(null);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
  };

  const updatePreferences = (preferences: UserPreferences) => {
    if (!user) return;

    const updatedProfile: UserProfile = {
      ...user,
      preferences: {
        ...user.preferences,
        ...preferences,
      },
    };

    setUser(updatedProfile);
    setRegistry((prev) => ({
      ...prev,
      [user.email]: {
        ...prev[user.email],
        profile: updatedProfile,
      },
    }));
  };

  const promptAuth = (reason: AuthActionPrompt = 'generic') => {
    setAuthPromptReason(reason);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthPromptReason(null);
  };

  const openOnboardingModal = () => {
    setIsOnboardingModalOpen(true);
  };

  const closeOnboardingModal = () => {
    setIsOnboardingModalOpen(false);
  };

  const quickSwitchAccount = (accountEmail: string) => {
    const account = registry[accountEmail.toLowerCase()];
    if (account) {
      setUser(account.profile);
      setIsAuthModalOpen(false);
    }
  };

  const getRegisteredAccounts = (): UserProfile[] => {
    return Object.values(registry).map((acc) => acc.profile);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isGuest: user === null,
        isAuthModalOpen,
        isOnboardingModalOpen,
        authPromptReason,
        register,
        login,
        logout,
        updatePreferences,
        promptAuth,
        closeAuthModal,
        closeOnboardingModal,
        openOnboardingModal,
        quickSwitchAccount,
        getRegisteredAccounts,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return ctx;
}
