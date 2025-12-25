import React from "react";

// Simple retro robot sprite.
export default function RobotSprite() {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" aria-label="Robot Sprite">
      <rect x="22" y="28" width="56" height="44" rx="6" fill="#7BD3EA" stroke="#1B4B5A" strokeWidth="2" />
      <rect x="35" y="18" width="30" height="14" rx="4" fill="#7BD3EA" stroke="#1B4B5A" strokeWidth="2" />
      <rect x="44" y="10" width="12" height="10" rx="2" fill="#1B4B5A" />
      <circle cx="40" cy="40" r="6" fill="#0F172A" />
      <circle cx="60" cy="40" r="6" fill="#0F172A" />
      <circle cx="40" cy="40" r="2" fill="#7BD3EA" />
      <circle cx="60" cy="40" r="2" fill="#7BD3EA" />
      <rect x="38" y="54" width="24" height="6" rx="3" fill="#0F172A" />
      <rect x="16" y="38" width="6" height="24" rx="3" fill="#1B4B5A" />
      <rect x="78" y="38" width="6" height="24" rx="3" fill="#1B4B5A" />
      <rect x="32" y="72" width="12" height="16" rx="2" fill="#1B4B5A" />
      <rect x="56" y="72" width="12" height="16" rx="2" fill="#1B4B5A" />
      <circle cx="32" cy="24" r="3" fill="#FF9F1C" />
      <circle cx="68" cy="24" r="3" fill="#FF9F1C" />
    </svg>
  );
}

