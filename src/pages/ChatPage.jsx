import { useEffect, useMemo, useRef, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  ListGroup,
  Button,
  Form,
  Badge,
  Spinner,
  Alert,
} from "react-bootstrap";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  getDoc,
  serverTimestamp,
  limit,
} from "firebase/firestore";
import { db } from "../firebase";

const ROOMS = [
  {
    id: "general",
    name: "General",
    description: "Everyday AreaRED chat, questions, and announcements.",
    requires21: false,
  },
  {
    id: "committees",
    name: "Committees",
    description: "Committee coordination, planning, and logistics.",
    requires21: false,
  },
  {
    id: "twentyone", // match your original Firestore path
    name: "21+ Lounge",
    description: "Late-night & social chat (21+ only).",
    requires21: true,
  },
];

function computeAge(birthdayStr) {
  if (!birthdayStr) return null;
  const b = new Date(birthdayStr);
  if (Number.isNaN(b.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - b.getFullYear();
  const m = today.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < b.getDate())) {
    age--;
  }
  return age;
}

export default function ChatPage() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [profileLoaded, setProfileLoaded] = useState(false);
  const [is21Plus, setIs21Plus] = useState(false);

  const [activeRoomId, setActiveRoomId] = useState("general");

  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const messagesContainerRef = useRef(null);

  // ===== Auth + profile (for 21+ access) =====
  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u || null);
      setAuthLoading(false);

      if (!u) {
        setIs21Plus(false);
        setProfileLoaded(true);
        return;
      }

      try {
        const userRef = doc(db, "users", u.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          const age = computeAge(data.birthday);
          setIs21Plus(age !== null && age >= 21);
        } else {
          setIs21Plus(false);
        }
      } catch (err) {
        console.error("Error loading profile for chat:", err);
        setIs21Plus(false);
      } finally {
        setProfileLoaded(true);
      }
    });

    return unsub;
  }, []);

  // If you’re on a 21+ room and lose access, bump back to general
  useEffect(() => {
    const room = ROOMS.find((r) => r.id === activeRoomId);
    if (room?.requires21 && !is21Plus) {
      setActiveRoomId("general");
    }
  }, [is21Plus, activeRoomId]);

  const activeRoom = useMemo(
    () => ROOMS.find((r) => r.id === activeRoomId),
    [activeRoomId]
  );

  const canUseActiveRoom =
    !activeRoom?.requires21 || (activeRoom?.requires21 && is21Plus);

  // ===== Subscribe to messages for CURRENT room (old behavior) =====
  useEffect(() => {
    setMessagesLoading(true);
    setError("");

    // rooms/{roomId}/messages, ordered by createdAt
    const msgsRef = collection(db, "rooms", activeRoomId, "messages");
    const q = query(msgsRef, orderBy("createdAt", "asc"), limit(100));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setMessages(list);
        setMessagesLoading(false);
      },
      (err) => {
        console.error(
          "[Chat] Firestore onSnapshot error – check collection name & security rules:",
          err
        );
        setError("Could not load messages.");
        setMessages([]);
        setMessagesLoading(false);
      }
    );

    return unsub;
  }, [activeRoomId]);

  // Auto-scroll to bottom INSIDE the messages container
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length, activeRoomId]);

  // ===== Sending a message =====
  const handleSend = async (e) => {
    e.preventDefault();
    if (!user || !newMessage.trim() || !canUseActiveRoom) return;

    setSending(true);
    setError("");

    try {
      const displayName =
        user.displayName || user.email?.split("@")[0] || "AreaRED Member";

      await addDoc(collection(db, "rooms", activeRoomId, "messages"), {
        text: newMessage.trim(),
        uid: user.uid,
        displayName,
        createdAt: serverTimestamp(),
      });

      setNewMessage("");
    } catch (err) {
      console.error("[Chat] Firestore addDoc error:", err);
      setError("Could not send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (authLoading || !profileLoaded) {
    return (
      <Container className="py-4 d-flex align-items-center justify-content-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (!user) {
    return (
      <Container className="py-4">
        <Card className="p-4">
          <h2 className="mb-3">Chats</h2>
          <p className="text-muted mb-3">
            Sign in to join AreaRED chat rooms, coordinate events, and stay in
            the loop with your committees.
          </p>
          <Alert variant="warning">
            You’re not signed in. Use the <strong>Sign In</strong> button in the
            top-right to access chats.
          </Alert>
        </Card>
      </Container>
    );
  }

  // compute preview + time for each room using current room’s messages only
  const getRoomPreview = (roomId) => {
    if (roomId === activeRoomId && messages.length > 0) {
      const last = messages[messages.length - 1];
      return last.text || activeRoom?.description || "";
    }
    return ROOMS.find((r) => r.id === roomId)?.description || "";
  };

  const getRoomTime = (roomId) => {
    if (roomId === activeRoomId && messages.length > 0) {
      const last = messages[messages.length - 1];
      const created =
        last.createdAt?.toDate?.() || last.createdAt || null;
      if (!created) return "";
      return created.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });
    }
    return "";
  };

  return (
    <Container className="py-4">
      <Card className="chat-shell">
        <Row className="g-0 chat-body-row">
          {/* LEFT: thread list */}
          <Col md={4} lg={3} className="chat-sidebar">
            <div className="chat-sidebar-header">
              <h5 className="mb-0">Messages</h5>
              <span className="chat-sidebar-sub">
                {user.displayName || user.email}
              </span>
            </div>

            <ListGroup variant="flush" className="chat-thread-list">
              {ROOMS.map((room) => {
                const disabled = room.requires21 && !is21Plus;
                const isActive = activeRoomId === room.id;

                let previewText = getRoomPreview(room.id);
                if (previewText.length > 60) {
                  previewText = previewText.slice(0, 57) + "…";
                }

                const initials = room.name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                const timeStr = getRoomTime(room.id);

                return (
                  <ListGroup.Item
                    key={room.id}
                    action={!disabled}
                    active={isActive}
                    onClick={() => !disabled && setActiveRoomId(room.id)}
                    className={
                      "chat-thread-item" +
                      (disabled ? " chat-thread-disabled" : "") +
                      (isActive ? " chat-thread-active" : "")
                    }
                  >
                    <div className="chat-thread-avatar">
                      <div className="chat-thread-avatar-pill">{initials}</div>
                    </div>
                    <div className="chat-thread-main">
                      <div className="chat-thread-top">
                        <span className="chat-thread-name">{room.name}</span>
                        {timeStr && (
                          <span className="chat-thread-time">{timeStr}</span>
                        )}
                      </div>
                      <div className="chat-thread-bottom">
                        <span className="chat-thread-preview">
                          {previewText}
                        </span>
                        {room.requires21 && (
                          <span className="chat-thread-badge">21+</span>
                        )}
                      </div>
                      {disabled && (
                        <div className="chat-thread-locked">
                          Add your birthday on the Account page to unlock.
                        </div>
                      )}
                    </div>
                  </ListGroup.Item>
                );
              })}
            </ListGroup>
          </Col>

          {/* RIGHT: conversation view */}
          <Col md={8} lg={9} className="chat-main">
            <div className="chat-main-header">
              <div>
                <h4 className="mb-0">{activeRoom?.name}</h4>
                <div className="chat-main-sub">
                  {activeRoom?.description}
                </div>
              </div>
              {activeRoom?.requires21 && (
                <Badge bg={canUseActiveRoom ? "warning" : "secondary"}>
                  21+ room
                </Badge>
              )}
            </div>

            {!canUseActiveRoom && (
              <Alert variant="secondary" className="mb-0 chat-access-alert">
                This room is only available to members who are 21 or older. Add
                your birthday on the <strong>Account</strong> page if you
                should have access.
              </Alert>
            )}

            {error && (
              <Alert variant="danger" className="mb-0 chat-error-alert">
                {error}
              </Alert>
            )}

            {/* Messages viewport (scrolls internally) */}
            <div className="chat-messages" ref={messagesContainerRef}>
              {messagesLoading ? (
                <div className="chat-messages-empty">
                  <Spinner animation="border" size="sm" className="me-2" />
                  Loading messages…
                </div>
              ) : messages.length === 0 ? (
                <div className="chat-messages-empty">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.uid === user.uid;
                  const created =
                    msg.createdAt?.toDate?.() || msg.createdAt || null;
                  const timeStr = created
                    ? created.toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })
                    : "";

                  const initials =
                    msg.displayName?.trim()?.[0]?.toUpperCase() ||
                    msg.uid?.[0]?.toUpperCase() ||
                    "?";

                  return (
                    <div
                      key={msg.id}
                      className={
                        "chat-message" + (isMe ? " chat-message-me" : "")
                      }
                    >
                      <div className="chat-avatar">
                        {msg.photoURL ? (
                          <img
                            src={msg.photoURL}
                            alt={`${msg.displayName || "User"} avatar`}
                          />
                        ) : (
                          <div className="chat-avatar-fallback">
                            {initials}
                          </div>
                        )}
                      </div>
                      <div className="chat-bubble-wrap">
                        <div className="chat-meta">
                          <span className="chat-name">
                            {msg.displayName || "AreaRED Member"}
                          </span>
                          {timeStr && (
                            <span className="chat-time">{timeStr}</span>
                          )}
                        </div>
                        <div className="chat-bubble">{msg.text}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input bar pinned to bottom of card */}
            <div className="chat-input-bar">
              {canUseActiveRoom ? (
                <Form onSubmit={handleSend} className="w-100 d-flex gap-2">
                  <Form.Control
                    as="textarea"
                    rows={1}
                    placeholder="Send a message…"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={sending || messagesLoading}
                    aria-label="Chat message"
                  />
                  <Button
                    type="submit"
                    disabled={
                      sending || messagesLoading || !newMessage.trim()
                    }
                  >
                    {sending ? "Sending…" : "Send"}
                  </Button>
                </Form>
              ) : (
                <div className="text-muted small">
                  You don’t currently have access to this room.
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Card>
    </Container>
  );
}