// src/pages/ChatPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase"; // make sure this exists

const ROOMS = [
  { id: "general", name: "General" },
  { id: "madhouse", name: "Madhouse (Volleyball)" },
  { id: "football", name: "Football" },
  { id: "crease", name: "Crease Creatures (Hockey)" },
];

export default function ChatPage({ user }) {
  const [activeRoom, setActiveRoom] = useState("general");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const roomLabel = useMemo(
    () => ROOMS.find((r) => r.id === activeRoom)?.name || "General",
    [activeRoom]
  );

  // Subscribe to messages for this room
  useEffect(() => {
    if (!activeRoom) return;

    const qRef = query(
      collection(db, "messages"),
      where("roomId", "==", activeRoom),
      orderBy("createdAt", "asc"),
      limit(200)
    );

    const unsub = onSnapshot(qRef, (snap) => {
      const list = [];
      snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
      setMessages(list);
    });

    return () => unsub();
  }, [activeRoom]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    if (!user) {
      alert("You must be signed in to send messages.");
      return;
    }

    setSending(true);
    try {
      await addDoc(collection(db, "messages"), {
        roomId: activeRoom,
        text: text.trim(),
        userId: user.uid,
        userEmail: user.email || "",
        displayName: user.displayName || user.email || "Anonymous",
        createdAt: serverTimestamp(),
      });
      setText("");
    } catch (err) {
      console.error(err);
      alert("Failed to send message. Check console for details.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container py-3">
      <h1>Chat</h1>
      <p className="text-muted">
        Real-time rooms for AreaRED committees, powered by Firebase.
      </p>

      <div className="row">
        {/* Rooms sidebar */}
        <aside className="col-12 col-md-3 mb-3">
          <div className="card p-2">
            <h2 className="h5 mb-2">Rooms</h2>
            <div className="list-group">
              {ROOMS.map((room) => (
                <button
                  key={room.id}
                  type="button"
                  className={
                    "list-group-item list-group-item-action" +
                    (room.id === activeRoom ? " active" : "")
                  }
                  onClick={() => setActiveRoom(room.id)}
                >
                  {room.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Chat main */}
        <section className="col-12 col-md-9">
          <div className="card p-3 d-flex flex-column" style={{ minHeight: "420px" }}>
            <h2 className="h5 mb-2">{roomLabel}</h2>
            <div
              className="flex-grow-1 mb-3"
              style={{
                borderRadius: "10px",
                border: "1px solid #e5e5e5",
                padding: "8px 10px",
                overflowY: "auto",
                maxHeight: "420px",
                background: "#fafafa",
              }}
            >
              {messages.length === 0 ? (
                <div className="text-muted small">No messages yet. Say hi!</div>
              ) : (
                <ul className="list-unstyled mb-0">
                  {messages.map((m) => (
                    <li key={m.id} className="mb-2">
                      <div className="d-flex justify-content-between">
                        <strong>{m.displayName || m.userEmail || "User"}</strong>
                        <span className="text-muted small">
                          {m.createdAt?.toDate
                            ? m.createdAt.toDate().toLocaleString()
                            : "…"}
                        </span>
                      </div>
                      <div>{m.text}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Input form */}
            <form onSubmit={handleSend}>
              <label htmlFor="chat-input" className="form-label">
                Message
              </label>
              <div className="d-flex gap-2">
                <input
                  id="chat-input"
                  className="form-control"
                  type="text"
                  placeholder={user ? "Type a message…" : "Sign in to chat"}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  disabled={!user || sending}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!user || sending || !text.trim()}
                >
                  {sending ? "Sending…" : "Send"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}