// src/pages/Home.jsx
import React, { useMemo } from "react";
import InstagramSection from "../components/InstagramSection";
import { EVENTS } from "../data/events";
import { VOLUNTEER_NEEDS } from "../data/volunteerNeeds";
import VolunteerNeedCard from "../components/VolunteerNeedCard";

/* === Shared color map + helpers (match Calendar) === */
const TAG_COLORS = {
  // Types
  Game: "#C5050C",
  Meeting: "#1E58A5",
  "Special Event": "#6E7F5E",
  Volunteer: "#2F8F5B",
  Other: "#71717A", // slightly cooler gray

  // Sports
  Football: "#8B1A1A",
  Basketball: "#F97316", // bright orange
  Volleyball: "#B45309", // deeper amber
  Hockey: "#1E58A5",
  Soccer: "#0EA5E9", // sky blue
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

const nice = (s) => s || "Other";
const getColor = (label) => TAG_COLORS[label] || TAG_COLORS.Other;

/** Convert "2:30 PM" -> {h:14, m:30}; handles "7 PM", "07:00", "", undefined */
function parseTimeTo24h(timeStr) {
  if (!timeStr || typeof timeStr !== "string") return { h: 0, m: 0 };
  const t = timeStr.trim();

  // Matches "H:MM AM/PM" or "H AM/PM"
  const ampmMatch = t.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (ampmMatch) {
    let h = parseInt(ampmMatch[1], 10);
    const m = ampmMatch[2] ? parseInt(ampmMatch[2], 10) : 0;
    const ampm = ampmMatch[3].toUpperCase();
    if (ampm === "PM" && h < 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    return { h, m };
  }

  // Matches "HH:MM" 24h
  const hhmm = t.match(/^(\d{1,2}):(\d{2})$/);
  if (hhmm) return { h: parseInt(hhmm[1], 10), m: parseInt(hhmm[2], 10) };

  // Matches "HH" hour only
  const hOnly = t.match(/^(\d{1,2})$/);
  if (hOnly) return { h: parseInt(hOnly[1], 10), m: 0 };

  return { h: 0, m: 0 };
}

/** Build a Date from event's date (YYYY-MM-DD) and time string (various formats) */
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
  const upcoming = useMemo(() => {
    const now = new Date();

    // Attach parsed Date, keep future-or-today, sort asc, take first 4
    return EVENTS
      .map((e) => ({ ...e, __dt: eventDateTime(e) }))
      .filter(
        (e) =>
          e.__dt &&
          e.__dt >= new Date(now.getFullYear(), now.getMonth(), now.getDate())
      )
      .sort((a, b) => a.__dt - b.__dt)
      .slice(0, 4);
  }, []);

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

      {/* ======= UPCOMING HIGHLIGHTS (auto + badges) ======= */}
      <section className="section">
        <div className="section-head">
          <h2 className="section-title">Upcoming Highlights</h2>
          {/* Use hash route so GitHub Pages works */}
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
          upcoming.map((e) => (
            <div
              key={`${e.id || e.title}-${e.date}-${e.time || "0000"}`}
              className="card mb-3 p-3 event-card"
            >
              {/* Top-right badges just like Calendar */}
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
              {e.notes && <p className="mb-0 event-notes">{e.notes}</p>}

              {/* Volunteer CTA consistent with Calendar */}
              {nice(e.type) === "Volunteer" && (
                <div className="vol-cta-row mt-2">
                  <button
                    className="btn btn-primary btn-sm vol-btn"
                    onClick={() =>
                      alert("Thanks! (Use the Volunteer section below to track yourself.)")
                    }
                  >
                    Sign Up to Volunteer
                  </button>
                  {e.notes?.match(/(\d+)\/(\d+)/) && (
                    <span className="cap-badge ok">
                      {e.notes.match(/(\d+)\/(\d+)/)[0]} filled
                    </span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </section>

      {/* ======= INTERACTIVE VOLUNTEER NEEDS ======= */}
      <section className="section">
        <div className="section-head">
          <h2 className="section-title">Volunteer Needs</h2>
        </div>
        <p className="text-muted" style={{ maxWidth: 640 }}>
          Mark shifts you’re interested in. Your selections are saved in this
          browser so you can quickly see what you’ve signed up for when you
          come back.
        </p>

        {VOLUNTEER_NEEDS.length === 0 ? (
          <div className="card p-3 mt-2">
            <div className="text-muted">No volunteer needs listed right now.</div>
          </div>
        ) : (
          <div className="mt-2">
            {VOLUNTEER_NEEDS.map((n) => (
              <VolunteerNeedCard key={n.id} n={n} />
            ))}
          </div>
        )}
      </section>

      {/* ======= INSTAGRAM SECTION ======= */}
      <InstagramSection />
    </main>
  );
}