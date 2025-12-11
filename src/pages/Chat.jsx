// src/pages/Chat.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export default function ChatPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [roomName, setRoomName] = useState("");
  const [creating, setCreating] = useState(false);

  // Load rooms
  useEffect(() => {
    const qRooms = query(collection(db, "rooms"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(qRooms, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setRooms(list);
      // Default select first room if none selected yet
      if (!activeRoomId && list.length > 0) {
        setActiveRoomId(list[0].id);
      }
    });
    return () => unsub();
  }, [activeRoomId]);

  async function handleCreateRoom(e) {
    e.preventDefault();
    if (!roomName.trim()) return;
    setCreating(true);
    try {
      const docRef = await addDoc(collection(db, "rooms"), {
        name: roomName.trim(),
        createdAt: serverTimestamp(),
        createdBy: user?.uid || null,
      });
      setRoomName("");
      setActiveRoomId(docRef.id);
    } catch (err) {
      console.error(err);
      alert("Could not create room. Try again.");
    } finally {
      setCreating(false);
    }
  }

  const activeRoom = useMemo(
    () => rooms.find((r) => r.id === activeRoomId) || null,
    [rooms, activeRoomId]
  );

  return (
    <div className="container py-4">
      <div className="section-head mb-3">
        <h1 className="h3 mb-0">AreaRED Chat</h1>
        <p className="text-muted mb-0">
          Committee chatrooms for quick coordination and announcements.
        </p>
      </div>

      <div className="row g-3">
        <div className="col-12 col-md-4">
          <div className="card p-3 h-100">
            <h2 className="h5 mb-2">Rooms</h2>
            <p className="small text-muted">
              Pick a room or create a new one for your committee.
            </p>

            <div className="list-group mb-3" role="list">
              {rooms.map((room) => (
                <button
                  key={room.id}
                  type="button"
                  className={
                    "list-group-item list-group-item-action" +
                    (room.id === activeRoomId ? " active" : "")
                  }
                  onClick={() => setActiveRoomId(room.id)}
                >
                  {room.name || "Untitled room"}
                </button>
              ))}
              {rooms.length === 0 && (
                <div className="text-muted small">
                  No rooms yet — create the first one.
                </div>
              )}
            </div>

            <form onSubmit={handleCreateRoom} className="mt-auto">
              <div className="mb-2">
                <label htmlFor="roomName" className="form-label">
                  New room name
                </label>
                <input
                  id="roomName"
                  className="form-control"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="e.g. Volleyball, Hockey, Marketing"
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={creating || !roomName.trim()}
              >
                {creating ? "Creating…" : "Create Room"}
              </button>
            </form>
          </div>
        </div>

        <div className="col-12 col-md-8">
          <ChatRoomMessages room={activeRoom} />
        </div>
      </div>
    </div>
  );
}

function ChatRoomMessages({ room }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!room) return;
    const qMsgs = query(
      collection(db, "messages"),
      where("roomId", "==", room.id),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(qMsgs, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMessages(list);
    });
    return () => unsub();
  }, [room?.id]);

  if (!room) {
    return (
      <div className="card p-3 h-100 d-flex flex-column">
        <h2 className="h5 mb-2">No room selected</h2>
        <p className="text-muted mb-0">
          Choose a room on the left or create a new one.
        </p>
      </div>
    );
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      await addDoc(collection(db, "messages"), {
        roomId: room.id,
        text: text.trim(),
        createdAt: serverTimestamp(),
        uid: user?.uid || null,
        displayName: user?.displayName || user?.email || "Member",
      });
      setText("");
    } catch (err) {
      console.error(err);
      alert("Could not send message. Try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="card p-3 h-100 d-flex flex-column">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div>
          <h2 className="h5 mb-0">{room.name}</h2>
          <p className="small text-muted mb-0">
            Messages are live and synced through Firestore.
          </p>
        </div>
      </div>

      <div
        className="flex-grow-1 mb-3 p-2 border rounded"
        style={{ overflowY: "auto", maxHeight: "60vh" }}
        role="log"
        aria-label="Chat messages"
      >
        {messages.length === 0 && (
          <div className="text-muted small">No messages yet. Say hi!</div>
        )}
        {messages.map((m) => (
          <div key={m.id} className="mb-2">
            <div className="small fw-semibold">
              {m.displayName || "Member"}
              <span className="text-muted"> — </span>
              <span className="text-muted">
                {m.createdAt?.toDate
                  ? m.createdAt.toDate().toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })
                  : "…"}
              </span>
            </div>
            <div>{m.text}</div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend}>
        <label htmlFor="chatMessage" className="form-label">
          Message
        </label>
        <div className="d-flex gap-2">
          <input
            id="chatMessage"
            className="form-control"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message…"
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={sending || !text.trim()}
          >
            {sending ? "Sending…" : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}