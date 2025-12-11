// src/pages/Login.jsx
import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState("signin"); // 'signin' | 'signup'
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      if (mode === "signin") {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password, displayName.trim());
      }
      navigate(from, { replace: true });
    } catch (error) {
      console.error(error);
      setErr(error.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container py-4">
      <div className="card p-4" style={{ maxWidth: 480, margin: "0 auto" }}>
        <h1 className="h3 mb-3">
          {mode === "signin" ? "Sign in to AreaRED" : "Create an AreaRED account"}
        </h1>
        <p className="text-muted mb-3">
          Use your email and password to access chatrooms and other member tools.
        </p>

        <div className="btn-group mb-3" role="group" aria-label="Auth mode">
          <button
            type="button"
            className={`btn btn-light ${mode === "signin" ? "active" : ""}`}
            onClick={() => setMode("signin")}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`btn btn-light ${mode === "signup" ? "active" : ""}`}
            onClick={() => setMode("signup")}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <div className="mb-3">
              <label htmlFor="displayName" className="form-label">
                Name
              </label>
              <input
                id="displayName"
                className="form-control"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Jane Badger"
                required
              />
            </div>
          )}

          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@wisc.edu"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          {err && (
            <div className="alert alert-danger py-2" role="alert">
              {err}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={busy}
          >
            {busy
              ? "Working…"
              : mode === "signin"
              ? "Sign In"
              : "Create Account"}
          </button>
        </form>

        <p className="small text-muted mt-3 mb-0">
          <Link to="/">Back to home</Link>
        </p>
      </div>
    </div>
  );
}