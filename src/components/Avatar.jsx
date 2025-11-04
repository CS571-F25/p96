import React from "react";

export default function Avatar({ src, alt, letter, size = 32 }) {
  const style = { width: size, height: size };
  return (
    <div className="avatar-wrap" style={style}>
      {src ? (
        <img src={src} alt={alt || letter} className="avatar-img" />
      ) : (
        <span className="avatar-letter">{(letter || "?").toUpperCase()}</span>
      )}
    </div>
  );
}