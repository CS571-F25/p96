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
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";

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
    id: "twentyone",
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
  const [lastMessages, setLastMessages] = useState({}); // roomId -> last msg
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const [attachmentFile, setAttachmentFile] = useState(null);
  const [attachmentPreviewUrl, setAttachmentPreviewUrl] = useState(null);

  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  // ===== Simple viewport detection for mobile vs desktop =====
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const [showRoomListOnMobile, setShowRoomListOnMobile] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // On desktop, always show both columns
      if (!mobile) {
        setShowRoomListOnMobile(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ===== Auth + 21+ profile =====
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

    // ===== NEW: Subscribe to LAST message of EVERY room for the sidebar =====
  useEffect(() => {
    const unsubscribes = [];

    ROOMS.forEach((room) => {
      try {
        const msgsRef = collection(db, "rooms", room.id, "messages");
        // Query: Give me the 1 newest message (descending order)
        const q = query(msgsRef, orderBy("createdAt", "desc"), limit(1));

        const unsub = onSnapshot(q, (snapshot) => {
          if (!snapshot.empty) {
            const lastData = snapshot.docs[0].data();
            setLastMessages((prev) => ({
              ...prev,
              [room.id]: lastData,
            }));
          }
        });
        unsubscribes.push(unsub);
      } catch (err) {
        console.error(`Error subscribing to ${room.name} preview:`, err);
      }
    });

    // Cleanup all listeners when the user leaves the page
    return () => {
      unsubscribes.forEach((u) => u());
    };
  }, []);
  // ===== Subscribe to messages for the current room (rooms/{roomId}/messages) =====
  useEffect(() => {
    setMessagesLoading(true);
    setError("");

    try {
      const msgsRef = collection(db, "rooms", activeRoomId, "messages");
      const q = query(msgsRef, orderBy("createdAt", "asc"));

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
          console.error("[Chat] onSnapshot error:", err);
          setError("Could not load messages.");
          setMessagesLoading(false);
        }
      );

      return unsub;
    } catch (err) {
      console.error("[Chat] Firestore query setup error:", err);
      setError("Could not load messages.");
      setMessagesLoading(false);
    }
  }, [activeRoomId]);

// Helper to scroll to bottom of the messages container
const scrollToBottom = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  };
  
  // Scroll when messages change or when you switch rooms
  useEffect(() => {
    if (!messages.length) return;
  
    // tiny delay so layout is applied before we measure scrollHeight
    const id = setTimeout(() => {
      scrollToBottom();
    }, 0);
  
    return () => clearTimeout(id);
  }, [messages, activeRoomId]);
  
  // After images load, scroll again so you're truly at the bottom
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    if (!messages.length) return;
  
    const imgs = container.querySelectorAll("img");
    if (!imgs.length) {
      scrollToBottom();
      return;
    }
  
    let remaining = imgs.length;
  
    const handleDone = () => {
      remaining -= 1;
      if (remaining <= 0) {
        scrollToBottom();
      }
    };
  
    imgs.forEach((img) => {
      if (img.complete) {
        handleDone();
      } else {
        img.addEventListener("load", handleDone);
        img.addEventListener("error", handleDone);
      }
    });
  
    return () => {
      imgs.forEach((img) => {
        img.removeEventListener("load", handleDone);
        img.removeEventListener("error", handleDone);
      });
    };
  }, [messages, activeRoomId]);

  // ===== Attachment handling =====
  const handleAttachmentClick = () => {
    if (!fileInputRef.current) return;
    fileInputRef.current.click();
  };

  const handleAttachmentChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setAttachmentFile(null);
      setAttachmentPreviewUrl(null);
      return;
    }

    setAttachmentFile(file);

    if (file.type.startsWith("image/")) {
      const localUrl = URL.createObjectURL(file);
      setAttachmentPreviewUrl(localUrl);
    } else {
      setAttachmentPreviewUrl(null);
    }
  };

  // ===== Sending a message (with optional attachment) =====
  const handleSend = async (e) => {
    e.preventDefault();
    if (!user || (!newMessage.trim() && !attachmentFile) || !canUseActiveRoom) {
      return;
    }

    setSending(true);
    setError("");

    try {
      const displayName =
        user.displayName || user.email?.split("@")[0] || "AreaRED Member";

      let attachmentData = null;

      if (attachmentFile) {
        const safeName = attachmentFile.name.replace(/[^\w.\-]/g, "_");
        const path = `chatAttachments/${activeRoomId}/${user.uid}/${Date.now()}-${safeName}`;
        const storageRef = ref(storage, path);

        const uploadSnap = await uploadBytes(storageRef, attachmentFile);
        const downloadURL = await getDownloadURL(uploadSnap.ref);

        attachmentData = {
          url: downloadURL,
          name: attachmentFile.name,
          type: attachmentFile.type,
          size: attachmentFile.size,
          storagePath: uploadSnap.ref.fullPath,
        };
      }

      await addDoc(collection(db, "rooms", activeRoomId, "messages"), {
        text: newMessage.trim(),
        uid: user.uid,
        displayName,
        photoURL: user.photoURL || null,
        attachment: attachmentData,
        createdAt: serverTimestamp(),
      });

      setNewMessage("");
      setAttachmentFile(null);
      setAttachmentPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("[Chat] Firestore addDoc / upload error:", err);
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

  const showSidebar =
    !isMobile || (isMobile && showRoomListOnMobile);
  const showConversation =
    !isMobile || (isMobile && !showRoomListOnMobile);

    return (
        <Container className="py-4">
          <Card
            className="chat-shell"
            style={{
              display: "flex",
              flexDirection: "column",
              // FIX: Force fixed height on mobile too (adjust 110px to match your navbar height)
              height: "calc(100vh - 160px)", 
              maxHeight: "calc(100vh - 160px)",
              overflow: "hidden",
            }}
          >
            <Row
              className="g-0 chat-body-row"
              style={{
                flex: 1,
                minHeight: 0,
                overflow: "hidden",
                // FIX: Keep row direction. Since we hide the other column via logic, 
                // the active column will naturally fill the space.
                flexDirection: "row", 
              }}
            >
              {/* LEFT: thread list */}
              {showSidebar && (
                <Col
                  xs={12} // FIX: Full width on mobile
                  md={4}
                  lg={3}
                  className="chat-sidebar"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    minHeight: 0,
                    height: "100%", // FIX: Ensure full height
                    borderRight: showConversation && !isMobile ? "1px solid #e1e3e8" : "none",
                    // Removed borderBottom since side-by-side logic applies now
                  }}
                >
              <div className="chat-sidebar-header">
                <h5 className="mb-0">Messages</h5>
                <span className="chat-sidebar-sub">
                  {user.displayName || user.email}
                </span>
              </div>

              <ListGroup
                variant="flush"
                className="chat-thread-list"
                style={{ flex: 1, minHeight: 0, overflowY: "auto" }}
              >
                {ROOMS.map((room) => {
                  const disabled = room.requires21 && !is21Plus;
                  const isActive = activeRoomId === room.id;
                  const preview = lastMessages[room.id];
                  
                  let previewText = room.description;

                  if (preview) {
                    // Get the sender's name (use first name only to save space)
                    const senderName = (preview.displayName || "Member");
                    
                    // If text is empty (e.g. photo only), show a fallback string
                    const content = preview.text 
                      ? preview.text 
                      : (preview.attachment ? "Sent an image" : "");

                    previewText = `${senderName}: ${content}`;
                  }

                  if (previewText.length > 60) {
                    previewText = previewText.slice(0, 57) + "…";
                  }

                  const initials = room.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  const lastTime = preview?.createdAt?.toDate?.();
                  const timeStr = lastTime
                    ? lastTime.toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })
                    : "";

                  return (
                    <ListGroup.Item
                      key={room.id}
                      action={!disabled}
                      active={isActive}
                      onClick={() => {
                        if (disabled) return;
                        setActiveRoomId(room.id);
                        if (isMobile) {
                          setShowRoomListOnMobile(false);
                        }
                      }}
                      className={
                        "chat-thread-item" +
                        (disabled ? " chat-thread-disabled" : "") +
                        (isActive ? " chat-thread-active" : "")
                      }
                    >
                      <div className="chat-thread-avatar">
                        <div className="chat-thread-avatar-pill">
                          {initials}
                        </div>
                      </div>
                      <div className="chat-thread-main">
                        <div className="chat-thread-top">
                          <span className="chat-thread-name">
                            {room.name}
                          </span>
                          {timeStr && (
                            <span className="chat-thread-time">
                              {timeStr}
                            </span>
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
          )}

{/* RIGHT: conversation view */}
{showConversation && (
            <Col
              xs={12} // FIX: Full width on mobile
              md={8}
              lg={9}
              className="chat-main"
              style={{
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
                height: "100%", // FIX: Force full height
                maxHeight: "100%",
              }}
            >
              <div className="chat-main-header">
                <div className="d-flex align-items-center">
                  {isMobile && (
                    <Button
                      type="button"
                      variant="light"
                      size="sm"
                      className="me-2"
                      onClick={() => setShowRoomListOnMobile(true)}
                    >
                      ←
                    </Button>
                  )}
                  <div>
                    <h4 className="mb-0">{activeRoom?.name}</h4>
                    <div className="chat-main-sub">
                      {activeRoom?.description}
                    </div>
                  </div>
                </div>
                {activeRoom?.requires21 && (
                  <Badge bg={canUseActiveRoom ? "warning" : "secondary"}>
                    21+ room
                  </Badge>
                )}
              </div>

              {!canUseActiveRoom && (
                <Alert
                  variant="secondary"
                  className="mb-0 chat-access-alert"
                >
                  This room is only available to members who are 21 or
                  older. Add your birthday on the <strong>Account</strong>{" "}
                  page if you should have access.
                </Alert>
              )}

              {error && (
                <Alert variant="danger" className="mb-0 chat-error-alert">
                  {error}
                </Alert>
              )}

              {/* Messages viewport (scrolls internally) */}
              <div
                className="chat-messages"
                ref={messagesContainerRef}
                style={{
                  flex: 1,
                  minHeight: 0,
                  maxHeight: "100%",
                  overflowY: "auto",
                }}
              >
                {messagesLoading ? (
                  <div className="chat-messages-empty">
                    <Spinner
                      animation="border"
                      size="sm"
                      className="me-2"
                    />
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

                    const nameToShow = isMe
                      ? user.displayName || user.email || "AreaRED Member"
                      : msg.displayName || "AreaRED Member";

                    const avatarURL = isMe
                      ? user.photoURL || null
                      : msg.photoURL || null;

                    const initials =
                      (nameToShow && nameToShow.trim()[0]?.toUpperCase()) ||
                      msg.uid?.[0]?.toUpperCase() ||
                      "?";

                    const attachment = msg.attachment || null;
                    const isImage =
                      attachment?.type?.startsWith("image/") ?? false;

                    return (
                      <div
                        key={msg.id}
                        className={
                          "chat-message" + (isMe ? " chat-message-me" : "")
                        }
                      >
                        <div className="chat-avatar">
                          {avatarURL ? (
                            <img
                              src={avatarURL}
                              alt={`${nameToShow} avatar`}
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
                              {nameToShow}
                            </span>
                            {timeStr && (
                              <span className="chat-time">
                                {timeStr}
                              </span>
                            )}
                          </div>
                          {/* Text + attachments */}
                          {msg.text && msg.text.trim() && (
                            <div className="chat-bubble">{msg.text}</div>
                          )}

                          {attachment && isImage && (
                            <div className="chat-image-bubble">
                              <a
                                href={attachment.url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <img
                                  src={attachment.url}
                                  alt={attachment.name || "Attachment"}
                                  className="chat-image"
                                  onLoad={() => {
                                    // keep scrolled to bottom when images finish loading
                                    const el = messagesContainerRef.current;
                                    if (!el) return;
                                    el.scrollTop = el.scrollHeight;
                                  }}
                                />
                              </a>
                            </div>
                          )}

                          {attachment && !isImage && (
                            <div className="chat-file-bubble">
                              <a
                                href={attachment.url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {attachment.name || "Download attachment"}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Optional small local preview of image attachment */}
              {attachmentFile && (
                <div
                  style={{
                    padding: "4px 20px 0",
                    borderTop: "1px solid #e5e7eb",
                    background: "#f9fafb",
                    fontSize: "0.8rem",
                  }}
                >
                  <span className="me-2">Attached:</span>
                  <strong>{attachmentFile.name}</strong>
                  {attachmentPreviewUrl && (
                    <div style={{ marginTop: 4 }}>
                      <img
                        src={attachmentPreviewUrl}
                        alt="Attachment preview"
                        style={{
                          maxWidth: "160px",
                          maxHeight: "100px",
                          borderRadius: 8,
                          display: "block",
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Input bar pinned to bottom of card */}
              <div
                className="chat-input-bar"
                style={{
                  flexShrink: 0,
                  borderTop: "1px solid #e1e3e8",
                  padding: "10px 20px",
                  background: "#fff",
                }}
              >
                {canUseActiveRoom ? (
                  <Form
                    onSubmit={handleSend}
                    className="w-100 d-flex gap-2"
                  >
                    {/* Hidden file input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="d-none"
                      onChange={handleAttachmentChange}
                    />
                    {/* Attachment button */}
                    <Button
                      type="button"
                      variant="light"
                      onClick={handleAttachmentClick}
                      disabled={sending || messagesLoading}
                      style={{
                        borderRadius: "999px",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        paddingInline: "0.6rem",
                      }}
                    >
                      📎
                    </Button>
                    {/* Message input */}
                    <Form.Control
                      as="textarea"
                      rows={1}
                      placeholder="Send a message…"
                      value={newMessage}
                      onChange={(e) =>
                        setNewMessage(e.target.value)
                      }
                      disabled={sending || messagesLoading}
                      aria-label="Chat message"
                      style={{
                        resize: "none",
                      }}
                    />
                    <Button
                      type="submit"
                      disabled={
                        sending ||
                        messagesLoading ||
                        (!newMessage.trim() && !attachmentFile)
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
          )}
        </Row>
      </Card>
    </Container>
  );
}