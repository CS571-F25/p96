import React, { useEffect, useState } from "react";
import { Button, Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

export default function AuthStatus() {
  const [user, setUser] = useState(null);
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, [auth]);

  // Not signed in → simple "Sign In" button
  if (!user) {
    return (
      <Button
        variant="light"
        size="sm"
        className="ms-2"              // NOTE: no position-fixed / sticky classes
        onClick={() => navigate("/signin")}
      >
        Sign In
      </Button>
    );
  }

  // Signed in → little user pill dropdown
  const label = user.displayName || user.email || "User";
  const initial = label[0]?.toUpperCase() ?? "?";

  return (
    <Dropdown align="end">
      <Dropdown.Toggle
        as={Button}
        variant="light"
        size="sm"
        className="d-flex align-items-center gap-2 ms-2"
      >
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: "999px",
            background: "#fff",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: "0.9rem",
            border: "1px solid rgba(0,0,0,0.1)",
          }}
        >
          {initial}
        </span>
        <span
          className="text-truncate"
          style={{ maxWidth: 140 }}
        >
          {label}
        </span>
      </Dropdown.Toggle>

      <Dropdown.Menu>
        {/* Chat only visible when signed in */}
        <Dropdown.Item onClick={() => navigate("/chat")}>
          Open Chat
        </Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item
          onClick={async () => {
            await signOut(auth);
            navigate("/");
          }}
        >
          Sign out
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}