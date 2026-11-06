/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Heart, Plus, UserCheck, Disc3, Shield, ArrowRight, UserPlus, LogIn, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { BrandLogo } from '../BrandLogo.tsx';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authPromptReason,
    closeAuthModal,
    register,
    login,
    quickSwitchAccount,
    getRegisteredAccounts,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const getReasonPrompt = () => {
    switch (authPromptReason) {
      case 'like':
        return {
          icon: <Heart className="w-6 h-6 text-emerald-400 fill-emerald-400/20" />,
          title: 'Love this track?',
          description: 'Log in or create a free account to save songs to your Liked Songs library.',
        };
      case 'create_playlist':
        return {
          icon: <Plus className="w-6 h-6 text-emerald-400" />,
          title: 'Create and organize playlists',
          description: 'Sign up to build personal playlists, reorder your favorite tracks, and curate your mix.',
        };
      case 'follow':
        return {
          icon: <UserCheck className="w-6 h-6 text-emerald-400" />,
          title: 'Follow your favorite artists',
          description: 'Save artists to your library to keep track of their latest releases and tours.',
        };
      case 'save_album':
        return {
          icon: <Disc3 className="w-6 h-6 text-emerald-400" />,
          title: 'Save albums to your library',
          description: 'Log in to keep complete discographies and albums saved in one place.',
        };
      default:
        return {
          icon: <Sparkles className="w-6 h-6 text-emerald-400" />,
          title: 'Join Soundify',
          description: 'Create your account to unlock personal playlists, liked songs, and listening history.',
        };
    }
  };

  const reason = getReasonPrompt();
  const registeredAccounts = getRegisteredAccounts();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const res = await register(email, password, displayName);
        if (!res.success) {
          setError(res.error || 'Failed to create account.');
        }
      } else {
        const res = await login(email, password);
        if (!res.success) {
          setError(res.error || 'Failed to sign in.');
        }
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoCreate = (demoName: string, demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setDisplayName(demoName);
    register(demoEmail, 'password123', demoName);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-[#18191d] border border-neutral-800 rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl text-neutral-200 relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand & Contextual Reason Banner */}
        <div className="flex flex-col items-center text-center mb-6">
          <BrandLogo className="mb-4" />

          {authPromptReason && authPromptReason !== 'generic' && (
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
              {reason.icon}
            </div>
          )}

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {reason.title}
          </h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-xs leading-relaxed">
            {reason.description}
          </p>
        </div>

        {/* Tabs: Sign Up vs Log In */}
        <div className="flex rounded-lg bg-neutral-900 p-1 mb-5 border border-neutral-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-md transition flex items-center justify-center gap-1.5 ${
              mode === 'signup' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-md transition flex items-center justify-center gap-1.5 ${
              mode === 'login' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Log In</span>
          </button>
        </div>

        {/* Form Error */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Alex"
                className="w-full bg-neutral-900 border border-neutral-700/80 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-neutral-900 border border-neutral-700/80 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 4 characters"
              className="w-full bg-neutral-900 border border-neutral-700/80 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-full text-sm transition shadow-lg shadow-emerald-500/20 active:scale-98 disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
          >
            <span>{mode === 'signup' ? 'Create Free Account' : 'Log In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Testing Accounts Section for Easy Dual-Account Validation */}
        <div className="mt-6 pt-4 border-t border-neutral-800">
          <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">Fast Account Testing:</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickDemoCreate('Alex Rivera', 'alex@example.com')}
              className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-left transition"
            >
              <div className="font-semibold text-white truncate">Account 1 (Alex)</div>
              <div className="text-[10px] text-neutral-500 truncate">alex@example.com</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoCreate('Maya Chen', 'maya@example.com')}
              className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-left transition"
            >
              <div className="font-semibold text-white truncate">Account 2 (Maya)</div>
              <div className="text-[10px] text-neutral-500 truncate">maya@example.com</div>
            </button>
          </div>

          {registeredAccounts.length > 0 && (
            <div className="mt-3">
              <span className="text-[10px] text-neutral-500 block mb-1.5">Registered accounts on this device:</span>
              <div className="flex flex-wrap gap-1.5">
                {registeredAccounts.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => quickSwitchAccount(acc.email)}
                    className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs border border-neutral-700 transition"
                  >
                    Switch to {acc.displayName}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
