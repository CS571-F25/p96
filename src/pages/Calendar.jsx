// src/pages/Calendar.jsx
import React, { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { EVENTS } from "../data/events";

/* === Shared color map (kept in sync with theme.css) === */
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

/** Local-storage helpers for volunteer signups */
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

/** Time parsing utilities (same logic as Home) */
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

function groupByDate(list) {
  return list.reduce((acc, e) => {
    (acc[e.date] ||= []).push(e);
    return acc;
  }, {});
}

export default function Calendar() {
  const location = useLocation();

  /** Build sports list (alphabetical, “Other” last) */
  const allSports = useMemo(() => {
    const s = new Set(EVENTS.map((e) => nice(e.sport)));
    return Array.from(s).sort((a, b) =>
      a === "Other" ? 1 : b === "Other" ? -1 : a.localeCompare(b)
    );
  }, []);

  // Initial "only volunteer" from URL (?onlyVol=1)
  const initialOnlyVol = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("onlyVol") === "1";
  }, [location.search]);

  const [activeSports, setActiveSports] = useState(new Set(allSports));
  const [onlyVolunteers, setOnlyVolunteers] = useState(initialOnlyVol);
  const [signups, setSignups] = useState(() => loadSignupMap());

  const todayStart = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const toggleSport = (key) => {
    const ns = new Set(activeSports);
    ns.has(key) ? ns.delete(key) : ns.add(key);
    setActiveSports(ns);
  };

  const selectAllSports = () => setActiveSports(new Set(allSports));
  const selectNoSports = () => setActiveSports(new Set()); // empty set => no events

  const handleSportTagClick = (sportLabel) => {
    setActiveSports(new Set([sportLabel]));
  };

  const handleTypeTagClick = (typeLabel) => {
    if (typeLabel === "Volunteer") {
      setOnlyVolunteers(true);
    } else {
      setOnlyVolunteers(false);
    }
  };

  const handleToggleSignup = (eventId, isSigned, isFull) => {
    setSignups((prev) => {
      const next = { ...prev };
      if (isSigned) {
        delete next[eventId]; // cancel
      } else if (!isFull) {
        next[eventId] = true; // sign up
      }
      saveSignupMap(next);
      return next;
    });
  };

  /** Split into upcoming vs past, with filters applied */
  const { upcoming, past } = useMemo(() => {
    const upcomingList = [];
    const pastList = [];

    EVENTS.forEach((e) => {
      const s = nice(e.sport);
      const sportOK = activeSports.has(s);
      const isVol = nice(e.type) === "Volunteer";
      const volunteerOK = onlyVolunteers ? isVol : true;
      if (!sportOK || !volunteerOK) return;

      const dt = eventDateTime(e) || todayStart;
      const isPast = dt < todayStart;

      const withDt = { ...e, __dt: dt };
      if (isPast) pastList.push(withDt);
      else upcomingList.push(withDt);
    });

    upcomingList.sort((a, b) => a.__dt - b.__dt || (a.time || "").localeCompare(b.time || ""));
    pastList.sort((a, b) => b.__dt - a.__dt || (b.time || "").localeCompare(a.time || ""));

    return { upcoming: upcomingList, past: pastList };
  }, [activeSports, onlyVolunteers, todayStart]);

  const groupedUpcoming = useMemo(() => groupByDate(upcoming), [upcoming]);
  const groupedPast = useMemo(() => groupByDate(past), [past]);

  const upcomingDates = useMemo(
    () => Object.keys(groupedUpcoming).sort(),
    [groupedUpcoming]
  );
  const pastDates = useMemo(
    () => Object.keys(groupedPast).sort().reverse(),
    [groupedPast]
  );

  return (
    <div className="container py-4">
      <h1>Calendar</h1>
      <p className="text-muted">
        Games, meetings, and volunteer shifts. Use filters to focus on what you
        need.
      </p>

      {/* ===== Filters ===== */}
      <div className="card p-3 mb-3">
        {/* Only-volunteer toggle */}
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
          <div className="fw-semibold">Only volunteer events:</div>
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="toggleOnlyVols"
              checked={onlyVolunteers}
              onChange={(e) => setOnlyVolunteers(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="toggleOnlyVols">
              {onlyVolunteers ? "On" : "Off"}
            </label>
          </div>
        </div>

        {/* Sports chips (no "Sport:" label) */}
        <div className="d-flex flex-wrap gap-2">
          <button className="btn btn-light btn-sm" onClick={selectAllSports}>
            All
          </button>
          <button className="btn btn-light btn-sm" onClick={selectNoSports}>
            None
          </button>

          {allSports.map((s) => {
            const active = activeSports.has(s);
            const fg = s === "Basketball" ? "#111" : "#fff";
            return (
              <button
                key={s}
                type="button"
                className={`filter-chip chip-sport ${
                  active ? "chip-on" : ""
                } sport-${s.toLowerCase().replace(/\s+/g, "-")}`}
                style={{
                  background: active ? getColor(s) : "transparent",
                  color: active ? fg : "#222",
                  borderColor: getColor(s),
                }}
                onClick={() => toggleSport(s)}
              >
                {s}
              </button>
            );
          })}
        </div>

        <div className="text-end small mt-2">
          {upcoming.length} upcoming • {past.length} previous
        </div>
      </div>

      {/* ===== Upcoming ===== */}
      {upcomingDates.length === 0 ? (
        <div className="card p-3 mb-3">
          <div className="text-muted">
            No upcoming events match your current filters.
          </div>
        </div>
      ) : (
        upcomingDates.map((d) => (
          <section key={d} className="mb-3">
            <h5 className="mb-2">{d}</h5>
            {groupedUpcoming[d].map((e) => {
              const { baseFilled, capacity } = extractCounts(e.notes);
              const userSigned = !!signups[e.id];
              const filled = baseFilled + (userSigned ? 1 : 0);
              const full = capacity !== Infinity && filled >= capacity;

              return (
                <article key={e.id} className="card p-3 mb-3 event-card">
                  {/* Right-side badges (clickable for filtering) */}
                  <div className="event-badges">
                    {e.type && (
                      <span
                        role="button"
                        tabIndex={0}
                        className={`badge tag-badge badge-type-${nice(e.type)
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                        style={{ background: getColor(nice(e.type)) }}
                        onClick={() => handleTypeTagClick(nice(e.type))}
                        onKeyDown={(ev) =>
                          ev.key === "Enter" &&
                          handleTypeTagClick(nice(e.type))
                        }
                      >
                        {nice(e.type)}
                      </span>
                    )}
                    {e.sport && (
                      <span
                        role="button"
                        tabIndex={0}
                        className={`badge tag-badge badge-sport-${nice(e.sport)
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                        style={{ background: getColor(nice(e.sport)) }}
                        onClick={() => handleSportTagClick(nice(e.sport))}
                        onKeyDown={(ev) =>
                          ev.key === "Enter" &&
                          handleSportTagClick(nice(e.sport))
                        }
                      >
                        {nice(e.sport)}
                      </span>
                    )}
                  </div>

                  <h5 className="mb-1">{e.title}</h5>
                  <div className="text-muted small mb-2 event-meta">
                    {nice(e.type)} • {e.date}
                    {e.time ? ` @ ${e.time}` : ""}{" "}
                    {e.venue ? `• ${e.venue}` : ""}
                  </div>

                  {/* Only show notes as text for non-volunteer events */}
                  {nice(e.type) !== "Volunteer" && e.notes && (
                    <p className="mb-2 event-notes">{e.notes}</p>
                  )}

                  {/* Volunteer CTA with localStorage-backed signup */}
                  {nice(e.type) === "Volunteer" && (
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
                        {userSigned ? "Cancel Signup" : full ? "Full" : "Sign Up"}
                      </button>
                      {capacity !== Infinity && (
                        <span
                          className={`cap-badge ${
                            full ? "full" : filled / capacity >= 0.75 ? "warn" : "ok"
                          }`}
                        >
                          {filled}/{capacity} filled
                        </span>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </section>
        ))
      )}

      {/* ===== Previous events (collapsible) ===== */}
      {pastDates.length > 0 && (
        <details className="mt-3">
          <summary className="fw-semibold" style={{ cursor: "pointer" }}>
            Previous events ({past.length})
          </summary>
          <div className="mt-3">
            {pastDates.map((d) => (
              <section key={d} className="mb-3">
                <h5 className="mb-2">{d}</h5>
                {groupedPast[d].map((e) => {
                  const { baseFilled, capacity } = extractCounts(e.notes);
                  const userSigned = !!signups[e.id];
                  const filled = baseFilled + (userSigned ? 1 : 0);
                  const full = capacity !== Infinity && filled >= capacity;

                  return (
                    <article key={e.id} className="card p-3 mb-3 event-card">
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
                      <div className="text-muted small mb-2 event-meta">
                        {nice(e.type)} • {e.date}
                        {e.time ? ` @ ${e.time}` : ""}{" "}
                        {e.venue ? `• ${e.venue}` : ""}
                      </div>

                      {nice(e.type) !== "Volunteer" && e.notes && (
                        <p className="mb-2 event-notes">{e.notes}</p>
                      )}

                      {nice(e.type) === "Volunteer" && capacity !== Infinity && (
                        <div className="vol-cta-row mt-1">
                          <span className="cap-badge full">
                            {filled}/{capacity} filled
                          </span>
                        </div>
                      )}
                    </article>
                  );
                })}
              </section>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}