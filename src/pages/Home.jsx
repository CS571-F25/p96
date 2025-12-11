// src/pages/Home.jsx
import React, { useMemo, useState } from "react";
import InstagramSection from "../components/InstagramSection";
import { EVENTS } from "../data/events";

/* === Shared color map (match Calendar & theme.css) === */
const TAG_COLORS = {
  // Types
  Game: "#C5050C",
  Meeting: "#1E58A5",
  "Special Event": "#6E7F5E",
  Volunteer: "#2F8F5B",
  Other: "#71717A",

  // Sports
  Football: "#8B1A1A",
  Basketball: "#F97316",
  Volleyball: "#B45309",
  Hockey: "#1E58A5",
  Soccer: "#0EA5E9",
  Wrestling: "#7A3B8F",
  "Track & Field": "#3F7F7F",
  "Cross Country": "#3F7F7F",
  "Swimming & Diving": "#0E7490",
  Softball: "#A855F7",
  Baseball: "#2563EB",
  Golf: "#16A34A",
  Tennis: "#10B981",
  Rowing: "#6B7280",
};

const STORAGE_KEY = "areared-vol-signups";

const nice = (s) => s || "Other";
const getColor = (label) => TAG_COLORS[label] || TAG_COLORS.Other;

/** Local-storage helpers */
function loadSignupMap() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function saveSignupMap(map) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

/** Extract "4/10" style counts from notes */
function extractCounts(notes = "") {
  const m = notes.match(/(\d+)\s*\/\s*(\d+)/);
  if (!m) return { baseFilled: 0, capacity: Infinity };
  return {
    baseFilled: parseInt(m[1], 10) || 0,
    capacity: parseInt(m[2], 10) || 0,
  };
}

/** Time parsing utilities */
function parseTimeTo24h(timeStr) {
  if (!timeStr || typeof timeStr !== "string") return { h: 0, m: 0 };
  const t = timeStr.trim();

  const ampmMatch = t.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (ampmMatch) {
    let h = parseInt(ampmMatch[1], 10);
    const m = ampmMatch[2] ? parseInt(ampmMatch[2], 10) : 0;
    const ampm = ampmMatch[3].toUpperCase();
    if (ampm === "PM" && h < 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    return { h, m };
  }

  const hhmm = t.match(/^(\d{1,2}):(\d{2})$/);
  if (hhmm) return { h: parseInt(hhmm[1], 10), m: parseInt(hhmm[2], 10) };

  const hOnly = t.match(/^(\d{1,2})$/);
  if (hOnly) return { h: parseInt(hOnly[1], 10), m: 0 };

  return { h: 0, m: 0 };
}

function eventDateTime(e) {
  try {
    const [y, mo, d] = (e.date || "").split("-").map((n) => parseInt(n, 10));
    if (!y || !mo || !d) return null;
    const { h, m } = parseTimeTo24h(e.time);
    const dt = new Date(y, mo - 1, d, h, m, 0, 0);
    return isNaN(dt.getTime()) ? null : dt;
  } catch {
    return null;
  }
}

export default function Home() {
  const [signups, setSignups] = useState(() => loadSignupMap());

  const todayStart = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const upcoming = useMemo(() => {
    return EVENTS
      .map((e) => ({ ...e, __dt: eventDateTime(e) }))
      .filter(
        (e) =>
          e.__dt &&
          e.__dt >= todayStart
      )
      .sort((a, b) => a.__dt - b.__dt)
      .slice(0, 4);
  }, [todayStart]);

  // Upcoming volunteer shifts (future, type=Volunteer)
  const upcomingVolunteers = useMemo(() => {
    return EVENTS
      .filter((e) => nice(e.type) === "Volunteer")
      .map((e) => ({ ...e, __dt: eventDateTime(e) }))
      .filter((e) => e.__dt && e.__dt >= todayStart)
      .sort((a, b) => a.__dt - b.__dt)
      .slice(0, 3);
  }, [todayStart]);

  const handleToggleSignup = (eventId, isSigned, isFull) => {
    setSignups((prev) => {
      const next = { ...prev };
      if (isSigned) {
        delete next[eventId];
      } else if (!isFull) {
        next[eventId] = true;
      }
      saveSignupMap(next);
      return next;
    });
  };

  return (
    <main className="container app-main">
      {/* ======= HERO / WELCOME ======= */}
      <section className="section text-center" style={{ paddingTop: "1rem" }}>
        <h1>Welcome to AreaRED</h1>
        <p
          className="text-muted"
          style={{ maxWidth: "650px", margin: "0 auto" }}
        >
          Keep the student section loud, proud, and organized. Explore
          committees, events, and ways to help.
        </p>
      </section>

      {/* ======= UPCOMING HIGHLIGHTS ======= */}
      <section className="section">
        <div className="section-head">
          <h2 className="section-title">Upcoming Highlights</h2>
          <a href="/#/calendar" className="btn btn-light btn-sm">
            View full calendar
          </a>
        </div>

        {upcoming.length === 0 ? (
          <div className="card p-3">
            <div className="text-muted">
              No upcoming events found. Check back soon!
            </div>
          </div>
        ) : (
          upcoming.map((e) => {
            const { baseFilled, capacity } = extractCounts(e.notes);
            const userSigned = !!signups[e.id];
            const filled = baseFilled + (userSigned ? 1 : 0);
            const full = capacity !== Infinity && filled >= capacity;

            return (
              <div
                key={`${e.id || e.title}-${e.date}-${e.time || "0000"}`}
                className="card mb-3 p-3 event-card"
              >
                {/* Badges top-right */}
                <div className="event-badges">
                  {e.type && (
                    <span
                      className={`badge tag-badge badge-type-${nice(e.type)
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                      style={{ background: getColor(nice(e.type)) }}
                    >
                      {nice(e.type)}
                    </span>
                  )}
                  {e.sport && (
                    <span
                      className={`badge tag-badge badge-sport-${nice(e.sport)
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                      style={{ background: getColor(nice(e.sport)) }}
                    >
                      {nice(e.sport)}
                    </span>
                  )}
                </div>

                <h5 className="mb-1">{e.title}</h5>
                <div className="text-muted small mb-1 event-meta">
                  {(e.type || "Event")} • {e.date}
                  {e.time ? ` @ ${e.time}` : ""} • {e.venue || e.location || "TBA"}
                </div>

                {/* Don’t print raw notes for volunteer events (avoids duplicate 4/10 text) */}
                {nice(e.type) !== "Volunteer" && e.notes && (
                  <p className="mb-0 event-notes">{e.notes}</p>
                )}

                {/* Volunteer CTA if a highlight happens to be a volunteer shift */}
                {nice(e.type) === "Volunteer" && (
                  <div className="vol-cta-row mt-2">
                    <button
                      type="button"
                      className={`btn vol-btn ${
                        userSigned ? "btn-success" : "btn-primary"
                      }`}
                      onClick={() =>
                        handleToggleSignup(e.id, userSigned, full)
                      }
                    >
                      {userSigned
                        ? "Cancel Signup"
                        : full
                        ? "Full"
                        : "Sign Up"}
                    </button>
                    {capacity !== Infinity && (
                      <span
                        className={`cap-badge ${
                          full
                            ? "full"
                            : filled / capacity >= 0.75
                            ? "warn"
                            : "ok"
                        }`}
                      >
                        {filled}/{capacity} filled
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>

      {/* ======= VOLUNTEER SHIFTS ======= */}
      <section className="section">
        <div className="section-head">
          <h2 className="section-title">Volunteer Shifts</h2>
          <a
            href="/#/calendar?onlyVol=1"
            className="btn btn-light btn-sm"
          >
            See all shifts
          </a>
        </div>

        {upcomingVolunteers.length === 0 ? (
          <div className="card p-3">
            <div className="text-muted">
              No upcoming volunteer shifts right now. Check back soon!
            </div>
          </div>
        ) : (
          upcomingVolunteers.map((e) => {
            const { baseFilled, capacity } = extractCounts(e.notes);
            const userSigned = !!signups[e.id];
            const filled = baseFilled + (userSigned ? 1 : 0);
            const full = capacity !== Infinity && filled >= capacity;

            return (
              <div key={e.id} className="card mb-3 p-3 event-card">
                <div className="event-badges">
                  <span
                    className="badge tag-badge"
                    style={{ background: getColor("Volunteer") }}
                  >
                    Volunteer
                  </span>
                  {e.sport && (
                    <span
                      className={`badge tag-badge badge-sport-${nice(e.sport)
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                      style={{ background: getColor(nice(e.sport)) }}
                    >
                      {nice(e.sport)}
                    </span>
                  )}
                </div>

                <h5 className="mb-1">{e.title}</h5>
                <div className="text-muted small mb-2 event-meta">
                  {e.date}
                  {e.time ? ` @ ${e.time}` : ""} • {e.venue || e.location || "TBA"}
                </div>

                {/* No raw notes text here either; keep it all in the dynamic pill */}
                <div className="vol-cta-row mt-1">
                  <button
                    type="button"
                    className={`btn vol-btn ${
                      userSigned ? "btn-success" : "btn-primary"
                    }`}
                    onClick={() =>
                      handleToggleSignup(e.id, userSigned, full)
                    }
                  >
                    {userSigned
                      ? "Cancel Signup"
                      : full
                      ? "Full"
                      : "Sign Up"}
                  </button>
                  {capacity !== Infinity && (
                    <span
                      className={`cap-badge ${
                        full
                          ? "full"
                          : filled / capacity >= 0.75
                          ? "warn"
                          : "ok"
                      }`}
                    >
                      {filled}/{capacity} filled
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* ======= INSTAGRAM SECTION ======= */}
      <InstagramSection />
    </main>
  );
}