import React, { useState } from 'react';
import { getFlagUrl } from '../utils/flags';

/**
 * Renders a country flag image by team name, with a graceful fallback
 * to a gold pennant icon if the team isn't in our ISO map or the
 * image fails to load (instead of a broken image icon or blank emoji box).
 */
export default function Flag({ team, size = 'w80', className = '' }) {
  const [failed, setFailed] = useState(false);
  const url = getFlagUrl(team, size);

  if (!url || failed) {
    return (
      <span
        className={`inline-flex items-center justify-center text-maroon-300 ${className}`}
        title={team}
        aria-label={team}
      >
        <svg viewBox="0 0 24 24" width="1.4em" height="1.4em" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 3v18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M5 4h12l-3 3.2L17 10.4H5" fill="currentColor" opacity="0.85" />
        </svg>
      </span>
    );
  }

  return (
    <img
      src={url}
      alt={team}
      title={team}
      className={`inline-block object-cover rounded-sm shadow-sm ${className}`}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}
