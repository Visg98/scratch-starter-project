import React from "react";

export default function BeetleSprite() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100"
      height="100"
      viewBox="0 0 100 100"
      version="1.1"
      xmlSpace="preserve"
    >
      {/* Body */}
      <ellipse cx="50" cy="50" rx="30" ry="20" fill="#8b4513" stroke="#654321" strokeWidth="1.5" />
      
      {/* Head */}
      <ellipse cx="25" cy="50" rx="12" ry="10" fill="#654321" stroke="#3d2817" strokeWidth="1.5" />
      
      {/* Antennae */}
      <line x1="20" y1="45" x2="15" y2="35" stroke="#654321" strokeWidth="2" strokeLinecap="round" />
      <line x1="30" y1="45" x2="35" y2="35" stroke="#654321" strokeWidth="2" strokeLinecap="round" />
      <circle cx="15" cy="35" r="2" fill="#654321" />
      <circle cx="35" cy="35" r="2" fill="#654321" />
      
      {/* Legs */}
      <line x1="35" y1="60" x2="30" y2="75" stroke="#654321" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="45" y1="62" x2="40" y2="77" stroke="#654321" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="55" y1="62" x2="60" y2="77" stroke="#654321" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="65" y1="60" x2="70" y2="75" stroke="#654321" strokeWidth="2.5" strokeLinecap="round" />
      
      {/* Wings */}
      <ellipse cx="50" cy="45" rx="25" ry="15" fill="#a0522d" fillOpacity="0.7" stroke="#8b4513" strokeWidth="1" />
      <path d="M 30 45 Q 50 40 70 45" fill="none" stroke="#654321" strokeWidth="1" strokeOpacity="0.5" />
      
      {/* Eyes */}
      <circle cx="22" cy="48" r="2.5" fill="#000000" />
      <circle cx="28" cy="48" r="2.5" fill="#000000" />
      
      {/* Spots on body */}
      <circle cx="45" cy="50" r="3" fill="#654321" />
      <circle cx="55" cy="50" r="3" fill="#654321" />
    </svg>
  );
}

