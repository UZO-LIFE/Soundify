/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, ShieldCheck, CheckCircle2, AlertCircle, FileText, Globe } from 'lucide-react';

interface LicensingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LicensingModal: React.FC<LicensingModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-[#18191d] border border-neutral-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl text-neutral-200 relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Soundify Streaming Architecture & Licensing
            </h2>
            <p className="text-xs text-neutral-400">
              Honest provider disclosure & commercial music roadmap
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
          <div className="bg-[#131417] p-3.5 rounded-xl border border-neutral-800 space-y-2">
            <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              1. Currently Connected Legitimate Music Sources
            </span>
            <ul className="space-y-2 text-neutral-300">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>
                  <strong>Apple Music Catalog / iTunes Search API:</strong> Live search queries across global charts (Ed Sheeran, Drake, Burna Boy, James Arthur, etc.) providing authentic 30-second AAC/m4a audio streams, verified artwork, and metadata.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>
                  <strong>Audius Network:</strong> Decentralized streaming provider delivering full-length electronic, hip-hop, and indie recordings from verified artists.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>
                  <strong>Open-Access / Creative Commons Audio:</strong> Verified high-fidelity master recordings with clear distribution licenses.
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-[#131417] p-3.5 rounded-xl border border-neutral-800 space-y-2">
            <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              2. Mainstream Full-Length Music Dependencies
            </span>
            <p className="text-neutral-400">
              Full-length commercial playback of copyright recordings by major labels (Universal, Sony, Warner) requires direct statutory streaming agreements or licensed B2B streaming partners (e.g., 7digital, Tuned Global, or Spotify Web Playback SDK with Spotify Premium user auth).
            </p>
            <p className="text-neutral-400">
              Soundify strictly adheres to clean-room engineering: <strong>zero DRM bypasses, zero unauthorized stream ripping, and zero fake simulation</strong>. Available streams are labeled with complete transparency.
            </p>
          </div>

          <div className="bg-[#131417] p-3.5 rounded-xl border border-neutral-800 space-y-2">
            <span className="font-bold text-sky-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              3. Synchronized Lyrics Authorization
            </span>
            <p className="text-neutral-400">
              Synchronized lyrics are displayed only when supplied by authorized licensing partners (Musixmatch / LyricFind). When a track lacks authorized lyrics, Soundify presents an honest notification rather than scraping unlicensed web sources.
            </p>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white text-black font-semibold rounded-full text-xs hover:bg-neutral-200 transition"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
