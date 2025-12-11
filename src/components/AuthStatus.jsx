import React from "react";
import { getAuth, signOut } from "firebase/auth";
import { Link } from "react-router-dom";

export default function AuthStatus({ user }) {
  const auth = getAuth();

  if (!user) {
    // Not logged in → show Sign In button
    return (
      <div
        style={{
          position: "fixed",
          top: "14px",
          right: "20px",
          zIndex: 1050,
        }}
      >
        <Link to="/signin" className="btn btn-light btn-sm">
          Sign In
        </Link>
      </div>
    );
  }

  // Logged in → show profile + sign out
  return (
    <div
      style={{
        position: "fixed",
        top: "14px",
        right: "20px",
        zIndex: 1050,
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}
    >
      <span className="badge bg-secondary">{user.email}</span>

      <button
        className="btn btn-primary btn-sm"
        onClick={() => signOut(auth)}
      >
        Sign Out
      </button>
    </div>
  );
}