// src/pages/Home.jsx
import React, { useMemo } from "react";
import InstagramSection from "../components/InstagramSection";
import { EVENTS } from "../data/events";

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

    // Map -> attach dt, filter to future-or-today, sort asc, take first 4
    const withDt = EVENTS
      .map((e) => ({ ...e, __dt: eventDateTime(e) }))
      .filter((e) => e.__dt && e.__dt >= new Date(now.getFullYear(), now.getMonth(), now.getDate()))
      .sort((a, b) => a.__dt - b.__dt)
      .slice(0, 4);

    return withDt;
  }, []);

  return (
    <main className="container app-main">
      {/* ======= HERO / WELCOME ======= */}
      <section className="section text-center" style={{ paddingTop: "1rem" }}>
        <h1>Welcome to AreaRED</h1>
        <p className="text-muted" style={{ maxWidth: "650px", margin: "0 auto" }}>
          Keep the student section loud, proud, and organized. Explore committees, events, and ways to help.
        </p>
      </section>

      {/* ======= UPCOMING HIGHLIGHTS (auto) ======= */}
      <section className="section">
        <div className="section-head">
          <h2 className="section-title">Upcoming Highlights</h2>
          <a href="/#/calendar" className="btn btn-light btn-sm">View full calendar</a>
        </div>

        {upcoming.length === 0 ? (
          <div className="card p-3">
            <div className="text-muted">No upcoming events found. Check back soon!</div>
          </div>
        ) : (
          upcoming.map((e) => (
            <div key={`${e.id || e.title}-${e.date}-${e.time || "0000"}`} className="card mb-3 p-3">
              <h5 className="mb-1">{e.title}</h5>
              <div className="text-muted small mb-1">
                {(e.type || "Event")} • {e.date}
                {e.time ? ` @ ${e.time}` : ""} • {e.venue || e.location || "TBA"}
              </div>
              {e.notes && <p className="mb-0">{e.notes}</p>}
            </div>
          ))
        )}
      </section>

      {/* ======= INSTAGRAM SECTION ======= */}
      <InstagramSection />
    </main>
  );
}