import { useEffect, useState } from "react";
import { Dropdown, Spinner } from "react-bootstrap";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function AuthStatus() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      setLoading(false);
    });
    return unsub;
  }, [auth]);

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/");
  };

  // While auth is resolving
  if (loading) {
    return (
      <div className="auth-row">
        <Spinner animation="border" size="sm" role="status" />
      </div>
    );
  }

  // Not signed in → simple Sign In button
  if (!user) {
    return (
      <div className="auth-row">
        <button
          type="button"
          className="btn btn-light btn-sm"
          onClick={() => navigate("/signin")}
        >
          Sign In
        </button>
      </div>
    );
  }

  const photoURL = user.photoURL;
  const initial =
    user.displayName?.charAt(0).toUpperCase() ||
    user.email?.charAt(0).toUpperCase() ||
    "?";

  return (
    <div className="auth-row">
      <Dropdown align="end">
        <Dropdown.Toggle
          id="user-menu"
          variant="light"
          className="user-avatar-toggle"
        >
          {photoURL ? (
            <img
              src={photoURL}
              alt="Profile"
              className="user-avatar-img"
            />
          ) : (
            <div className="user-avatar-fallback" aria-hidden="true">
              {initial}
            </div>
          )}
          {/* For screen readers only; Bootstrap has visually-hidden */}
          <span className="visually-hidden">Open account menu</span>
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item onClick={() => navigate("/account")}>
            Account
          </Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item onClick={handleSignOut}>Sign out</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
}