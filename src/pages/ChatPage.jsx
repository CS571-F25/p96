import { useEffect, useMemo, useState } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Spinner,
  Alert,
  Nav,
} from "react-bootstrap";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

const ROOMS = [
  { id: "general", label: "General" },
  { id: "committees", label: "Committees" },
  { id: "twentyone", label: "21+ Lounge", restricted21: true },
];

function getAge(birthdayStr) {
  if (!birthdayStr) return null;
  const today = new Date();
  const b = new Date(birthdayStr);
  let age = today.getFullYear() - b.getFullYear();
  const m = today.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < b.getDate())) age--;
  return age;
}

export default function ChatPage() {
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [roomId, setRoomId] = useState("general");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  // Watch auth
  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, async (u) => {
      setAuthUser(u || null);
      setAuthLoading(false);

      if (!u) {
        setProfile(null);
        setProfileLoading(false);
        return;
      }

      setProfileLoading(true);
      try {
        const snap = await getDoc(doc(db, "users", u.uid));
        setProfile(snap.exists() ? snap.data() : null);
      } catch (err) {
        console.error(err);
      } finally {
        setProfileLoading(false);
      }
    });

    return unsub;
  }, []);

  // Subscribe to messages for current room
  useEffect(() => {
    const q = query(
      collection(db, "rooms", roomId, "messages"),
      orderBy("createdAt", "asc"),
      limit(100)
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMessages(data);
    });

    return unsub;
  }, [roomId]);

  const displayName = useMemo(() => {
    if (!authUser) return "";
    if (profile?.firstName || profile?.lastName) {
      return `${profile.firstName || ""} ${profile.lastName || ""}`.trim();
    }
    return authUser.displayName || authUser.email || "Member";
  }, [authUser, profile]);

  const age = useMemo(() => getAge(profile?.birthday), [profile]);
  const roomConfig = ROOMS.find((r) => r.id === roomId);
  const roomIsRestricted = roomConfig?.restricted21;
  const canAccessRoom =
    !roomIsRestricted || (age !== null && age >= 21);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!authUser || !text.trim() || !canAccessRoom) return;

    setSending(true);
    try {
      await addDoc(collection(db, "rooms", roomId, "messages"), {
        text: text.trim(),
        uid: authUser.uid,
        displayName,
        createdAt: serverTimestamp(),
      });
      setText("");
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  if (authLoading) {
    return (
      <Container className="py-4">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (!authUser) {
    return (
      <Container className="py-4">
        <Alert variant="warning">
          You need to sign in to use chat.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Card className="p-3">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <h2 className="mb-0">Chat</h2>
          <div className="text-muted small">
            Signed in as <strong>{displayName}</strong>
          </div>
        </div>

        <Nav
          variant="pills"
          className="mb-3 flex-wrap"
          activeKey={roomId}
          onSelect={(k) => k && setRoomId(k)}
        >
          {ROOMS.map((r) => (
            <Nav.Item key={r.id}>
              <Nav.Link eventKey={r.id}>
                {r.label}
                {r.restricted21 && " (21+)"}
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>

        {roomIsRestricted && (profileLoading || age === null) && (
          <Alert variant="info" className="mb-3">
            To access the 21+ lounge, set your birthday on the Account page.
          </Alert>
        )}

        {roomIsRestricted && age !== null && age < 21 && (
          <Alert variant="danger" className="mb-3">
            This room is restricted to members 21 and older.
          </Alert>
        )}

        <div className="chat-messages mb-3" style={{ maxHeight: 400, overflowY: "auto" }}>
          {messages.length === 0 ? (
            <p className="text-muted">No messages yet. Say hi!</p>
          ) : (
            messages.map((m) => (
              <div key={m.id} className="mb-2">
                <div className="fw-semibold small">
                  {m.displayName || "Member"}
                </div>
                <div>{m.text}</div>
              </div>
            ))
          )}
        </div>

        <Form onSubmit={handleSend}>
          <Form.Group controlId="chatText" className="d-flex gap-2">
            <Form.Control
              type="text"
              placeholder={
                canAccessRoom
                  ? "Type a message…"
                  : "You do not have access to this room."
              }
              value={text}
              disabled={!canAccessRoom || sending}
              onChange={(e) => setText(e.target.value)}
            />
            <Button
              type="submit"
              disabled={!canAccessRoom || !text.trim() || sending}
            >
              Send
            </Button>
          </Form.Group>
        </Form>
      </Card>
    </Container>
  );
}