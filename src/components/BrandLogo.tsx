/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface BrandLogoProps {
  className?: string;
  isCompact?: boolean;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = '', isCompact = false, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 select-none ${onClick ? 'cursor-pointer hover:opacity-95' : ''} ${className}`}
      role="banner"
    >
      {/* Soundify Audio Equalizer Symbol */}
      <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center p-1.5 shadow-md shadow-emerald-500/20 shrink-0">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-black stroke-current"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          {/* Dynamic soundwave rhythm bars */}
          <line x1="4" y1="9" x2="4" y2="15" />
          <line x1="8" y1="6" x2="8" y2="18" />
          <line x1="12" y1="3" x2="12" y2="21" />
          <line x1="16" y1="7" x2="16" y2="17" />
          <line x1="20" y1="10" x2="20" y2="14" />
        </svg>
      </div>

      {/* Brand Wordmark */}
      {!isCompact && (
        <span className="text-xl font-bold tracking-tight text-white flex items-center">
          Soundify
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-1 inline-block" />
        </span>
      )}
    </div>
  );
};
