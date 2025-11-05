import React from "react";

/** Minimal, inline SVG brand icons (no external assets). */
export default function BrandIcon({ name, size = 20 }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "currentColor" };

  switch (name) {
    case "instagram":
      return (
        <svg {...common} aria-label="Instagram">
          <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7z"/>
          <path d="M12 7.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5z"/>
          <circle cx="17.3" cy="6.7" r="1.3"/>
        </svg>
      );
    case "tiktok":
      return (
        <svg {...common} aria-label="TikTok" viewBox="0 0 256 256">
          <path d="M170 24c9 16 23 29 41 35v35c-17-1-33-7-47-16v76a64 64 0 1 1-34-57v36a28 28 0 1 0 0 39V24h40z"/>
        </svg>
      );
    case "x":
      return (
        <svg {...common} aria-label="X / Twitter">
          <path d="M3 4h5.7l5.6 7.2L20.2 4H21l-7.2 9.4L21 20H15.3l-5.9-7.7L7.8 20H3l7.2-9.5L3 4z"/>
        </svg>
      );
    case "flickr":
      return (
        <svg {...common} aria-label="Flickr">
          <circle cx="8.5" cy="12" r="4.5"/>
          <circle cx="15.5" cy="12" r="4.5"/>
        </svg>
      );
    case "bag":
      return (
        <svg {...common} aria-label="Merch">
          <path d="M6 8V6a6 6 0 1 1 12 0v2h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h2zm2 0h8V6a4 4 0 0 0-8 0v2z"/>
        </svg>
      );
    default:
      return null;
  }
}