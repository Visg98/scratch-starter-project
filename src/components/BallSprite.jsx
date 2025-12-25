import React from "react";

export default function BallSprite() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100"
      height="100"
      viewBox="0 0 100 100"
      version="1.1"
      xmlSpace="preserve"
    >
      <defs>
        <radialGradient id="ballGradient" cx="30%" cy="30%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#4a90e2" stopOpacity="1" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="45" fill="url(#ballGradient)" stroke="#2c5aa0" strokeWidth="2" />
      <ellipse cx="35" cy="35" rx="12" ry="8" fill="#ffffff" fillOpacity="0.6" />
      <path
        d="M 30 50 Q 50 40 70 50 Q 50 60 30 50"
        fill="none"
        stroke="#2c5aa0"
        strokeWidth="1.5"
        strokeOpacity="0.5"
      />
    </svg>
  );
}

