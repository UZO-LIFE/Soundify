/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Sparkles, Check, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

const ONBOARDING_GENRES = [
  { id: 'pop', label: 'Pop', color: 'from-pink-500 to-rose-600' },
  { id: 'hiphop', label: 'Hip-Hop', color: 'from-amber-500 to-orange-600' },
  { id: 'afrobeats', label: 'Afrobeats', color: 'from-yellow-500 to-amber-600' },
  { id: 'electronic', label: 'Electronic & Dance', color: 'from-cyan-500 to-blue-600' },
  { id: 'rnb', label: 'R&B / Soul', color: 'from-purple-500 to-indigo-600' },
  { id: 'rock', label: 'Rock & Alt', color: 'from-red-500 to-rose-700' },
  { id: 'acoustic', label: 'Acoustic & Chill', color: 'from-emerald-500 to-teal-600' },
  { id: 'indie', label: 'Indie & Alternative', color: 'from-violet-500 to-purple-700' },
  { id: 'jazz', label: 'Jazz & Blues', color: 'from-blue-500 to-indigo-700' },
  { id: 'classical', label: 'Classical & Ambient', color: 'from-slate-500 to-neutral-700' },
];

export const OnboardingModal: React.FC = () => {
  const { user, isOnboardingModalOpen, closeOnboardingModal, updatePreferences } = useAuth();
  const [selected, setSelected] = useState<string[]>(user?.preferences?.favoriteGenres || []);

  if (!isOnboardingModalOpen) return null;

  const toggleGenre = (genreId: string) => {
    if (selected.includes(genreId)) {
      setSelected(selected.filter((g) => g !== genreId));
    } else {
      setSelected([...selected, genreId]);
    }
  };

  const handleSave = () => {
    updatePreferences({ favoriteGenres: selected });
    closeOnboardingModal();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-[#18191d] border border-neutral-800 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl text-neutral-200 relative animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        <button
          onClick={closeOnboardingModal}
          className="absolute top-5 right-5 p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">What do you love listening to?</h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto leading-relaxed">
            Select your favorite musical genres to personalize your discovery feed. We will never automatically like songs or add music to your library without your permission.
          </p>
        </div>

        {/* Genre Pill Matrix */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 gap-2.5 my-2">
          {ONBOARDING_GENRES.map((genre) => {
            const isSelected = selected.includes(genre.id);
            return (
              <button
                key={genre.id}
                type="button"
                onClick={() => toggleGenre(genre.id)}
                className={`p-3 rounded-xl border text-left font-semibold text-xs transition flex items-center justify-between ${
                  isSelected
                    ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-sm'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                <span>{genre.label}</span>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition ${
                    isSelected ? 'bg-emerald-500 text-black' : 'border border-neutral-700'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={closeOnboardingModal}
            className="text-xs text-neutral-400 hover:text-white font-medium px-3 py-2 transition"
          >
            Skip for now
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 bg-white hover:bg-neutral-200 text-black font-bold rounded-full text-xs transition flex items-center gap-1.5 shadow"
          >
            <span>Save Preferences ({selected.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
