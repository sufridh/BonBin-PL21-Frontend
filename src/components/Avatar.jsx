import React, { useState, useEffect } from 'react';

/**
 * Renders a user's profile picture (base64 data URL), falling back to
 * a circle of their initials if no avatar is set or the image fails to load.
 */
export default function Avatar({ src, name, size = 40, className = '' }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const initials = (name || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase())
    .join('') || '?';

  const style = { width: size, height: size, fontSize: size * 0.4 };

  if (!src || failed) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-full bg-maroon-700 text-gold-300 font-bold flex-shrink-0 ${className}`}
        style={style}
        title={name}
        aria-label={name}
      >
        {initials}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      title={name}
      className={`inline-block rounded-full object-cover flex-shrink-0 ${className}`}
      style={style}
      onError={() => setFailed(true)}
    />
  );
}
