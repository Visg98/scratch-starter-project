import React from "react";

// Simple dog sprite using basic SVG shapes to keep it lightweight.
export default function DogSprite() {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" aria-label="Dog Sprite">
      <rect x="25" y="40" width="50" height="35" rx="8" fill="#C58C5A" stroke="#3E2C1C" strokeWidth="2" />
      <circle cx="50" cy="40" r="16" fill="#C58C5A" stroke="#3E2C1C" strokeWidth="2" />
      <circle cx="44" cy="38" r="3" fill="#1B1B1B" />
      <circle cx="56" cy="38" r="3" fill="#1B1B1B" />
      <circle cx="50" cy="44" r="2" fill="#1B1B1B" />
      <path d="M42 34 L34 24 Q36 22 40 24 L44 34" fill="#8A5A2B" />
      <path d="M58 34 L66 24 Q64 22 60 24 L56 34" fill="#8A5A2B" />
      <path d="M36 75 L30 90" stroke="#3E2C1C" strokeWidth="3" strokeLinecap="round" />
      <path d="M64 75 L70 90" stroke="#3E2C1C" strokeWidth="3" strokeLinecap="round" />
      <path d="M75 60 Q88 58 85 50 Q78 44 75 52 Z" fill="#C58C5A" stroke="#3E2C1C" strokeWidth="2" />
      <path d="M25 60 Q12 58 15 50 Q22 44 25 52 Z" fill="#C58C5A" stroke="#3E2C1C" strokeWidth="2" />
      <path d="M50 75 Q55 85 50 90 Q45 85 50 75 Z" fill="#3E2C1C" />
    </svg>
  );
}

