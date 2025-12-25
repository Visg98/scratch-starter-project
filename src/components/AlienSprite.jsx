import React from "react";

// Simple alien sprite.
export default function AlienSprite() {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" aria-label="Alien Sprite">
      <ellipse cx="50" cy="50" rx="28" ry="32" fill="#8BC34A" stroke="#2E7D32" strokeWidth="2" />
      <ellipse cx="38" cy="46" rx="8" ry="10" fill="#111827" />
      <ellipse cx="62" cy="46" rx="8" ry="10" fill="#111827" />
      <circle cx="38" cy="46" r="3" fill="#8BC34A" />
      <circle cx="62" cy="46" r="3" fill="#8BC34A" />
      <path d="M38 66 Q50 72 62 66" stroke="#2E7D32" strokeWidth="3" fill="none" strokeLinecap="round" />
      <line x1="42" y1="20" x2="32" y2="12" stroke="#2E7D32" strokeWidth="3" strokeLinecap="round" />
      <line x1="58" y1="20" x2="68" y2="12" stroke="#2E7D32" strokeWidth="3" strokeLinecap="round" />
      <circle cx="30" cy="10" r="4" fill="#8BC34A" stroke="#2E7D32" strokeWidth="2" />
      <circle cx="70" cy="10" r="4" fill="#8BC34A" stroke="#2E7D32" strokeWidth="2" />
      <rect x="44" y="76" width="12" height="16" rx="2" fill="#2E7D32" />
      <path d="M24 70 Q20 80 28 82" stroke="#2E7D32" strokeWidth="3" strokeLinecap="round" />
      <path d="M76 70 Q80 80 72 82" stroke="#2E7D32" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

