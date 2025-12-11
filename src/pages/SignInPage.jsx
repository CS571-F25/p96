// src/pages/SignInPage.jsx
import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

export default function SignInPage() {
  const auth = getAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const user = auth.currentUser;
  if (user) {
    // Already logged in → no point in being here
    return <Navigate to="/chat" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    setError("");

    try {
      if (mode === "signin") {
        await signInWithEmailAndPassword(auth, email.trim(), password);
        setStatus("Signed in!");
      } else {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
        setStatus("Account created and signed in!");
      }
      navigate("/chat");
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    }
  };

  return (
    <div className="container py-4">
      <h1>{mode === "signin" ? "Sign In" : "Create Account"}</h1>
      <p className="text-muted" style={{ maxWidth: 520 }}>
        Use your email and a password to access AreaRED chat. For real deployment,
        you’d likely restrict this to wisc.edu addresses.
      </p>

      <div className="card p-3" style={{ maxWidth: 520 }}>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label" htmlFor="auth-email">
              Email
            </label>
            <input
              id="auth-email"
              className="form-control"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label" htmlFor="auth-password">
              Password
            </label>
            <input
              id="auth-password"
              className="form-control"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <div className="form-text">At least 6 characters.</div>
          </div>

          {error && (
            <div className="alert alert-danger py-2">
              {error}
            </div>
          )}
          {status && !error && (
            <div className="alert alert-success py-2">
              {status}
            </div>
          )}

          <div className="d-flex justify-content-between align-items-center mt-3">
            <button type="submit" className="btn btn-primary">
              {mode === "signin" ? "Sign In" : "Create Account"}
            </button>

            <button
              type="button"
              className="btn btn-light btn-sm"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError("");
                setStatus("");
              }}
            >
              {mode === "signin"
                ? "Need an account? Sign up"
                : "Have an account? Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}