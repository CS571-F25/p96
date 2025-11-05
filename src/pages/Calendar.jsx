// src/pages/Calendar.jsx
import React, { useMemo, useState } from "react";
import { EVENTS } from "../data/events";

/** Color mapping (badges + active chips) */
const TAG_COLORS = {
    // Types
    Game: "#C5050C",
    Meeting: "#1E58A5",
    "Special Event": "#6E7F5E",
    Volunteer: "#2F8F5B",
    Other: "#71717A", // slightly cooler gray
  
    // Sports
    Football: "#8B1A1A",
    Basketball: "#F97316",   // bright orange
    Volleyball: "#B45309",   // deeper amber
    Hockey: "#1E58A5",
    Soccer: "#0EA5E9",       // sky blue
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

function groupByDate(list) {
  return list.reduce((acc, e) => {
    (acc[e.date] ||= []).push(e);
    return acc;
  }, {});
}

export default function Calendar() {
  /** Build sports list (alphabetical, “Other” last) */
  const allSports = useMemo(() => {
    const s = new Set(EVENTS.map((e) => nice(e.sport)));
    return Array.from(s).sort((a, b) =>
      a === "Other" ? 1 : b === "Other" ? -1 : a.localeCompare(b)
    );
  }, []);

  /** State: selected sports (multi) + ONLY-volunteer quick filter */
  const [activeSports, setActiveSports] = useState(new Set(allSports));
  const [onlyVolunteers, setOnlyVolunteers] = useState(false);

  const toggleSport = (key) => {
    const ns = new Set(activeSports);
    ns.has(key) ? ns.delete(key) : ns.add(key);
    setActiveSports(ns);
  };
  const selectAllSports = () => setActiveSports(new Set(allSports));
  const selectNoSports = () => setActiveSports(new Set()); // <- no filters => show nothing

  /** Apply filters
   *  - Sport must be selected (including “Other” for no-sport events)
   *  - If onlyVolunteers is ON, type must be Volunteer
   */
  const filtered = useMemo(() => {
    return EVENTS.filter((e) => {
      const s = nice(e.sport);                // "Other" if missing
      const sportOK = activeSports.has(s);    // <- strict: empty set => nothing passes
      const isVol = nice(e.type) === "Volunteer";
      const volunteerOK = onlyVolunteers ? isVol : true;
      return sportOK && volunteerOK;
    }).sort((a, b) => (a.date + (a.time || "")).localeCompare(b.date + (b.time || "")));
  }, [activeSports, onlyVolunteers]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);
  const dates = useMemo(() => Object.keys(grouped).sort(), [grouped]);

  return (
    <div className="container py-4">
      <h1>Calendar</h1>
      <p className="text-muted">
        Games, meetings, and volunteer shifts. Use filters to focus on what you need.
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
            const fg = s === "Basketball" ? "#111" : "#fff"; // keep contrast
            return (
              <button
                key={s}
                type="button"
                className={`filter-chip chip-sport ${active ? "chip-on" : ""} sport-${s.toLowerCase().replace(/\s+/g, "-")}`}
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

        <div className="text-end small mt-2">{filtered.length} shown</div>
      </div>

      {/* ===== Results ===== */}
      {dates.map((d) => (
        <section key={d} className="mb-3">
          <h5 className="mb-2">{d}</h5>
          {grouped[d].map((e) => (
            <article key={e.id} className="card p-3 mb-3 event-card">
              {/* Badges top-right: Type then Sport (if any) */}
              <div className="event-badges">
                {e.type && (
                  <span
                    className={`badge tag-badge badge-type-${nice(e.type).toLowerCase().replace(/\s+/g, "-")}`}
                    style={{ background: getColor(nice(e.type)) }}
                  >
                    {nice(e.type)}
                  </span>
                )}
                {e.sport && (
                  <span
                    className={`badge tag-badge badge-sport-${nice(e.sport).toLowerCase().replace(/\s+/g, "-")}`}
                    style={{ background: getColor(nice(e.sport)) }}
                  >
                    {nice(e.sport)}
                  </span>
                )}
              </div>

              <h5 className="mb-1">{e.title}</h5>
              <div className="text-muted small mb-2 event-meta">
                {nice(e.type)} • {e.date}
                {e.time ? ` @ ${e.time}` : ""} {e.venue ? `• ${e.venue}` : ""}
              </div>
              {e.notes && <p className="mb-2 event-notes">{e.notes}</p>}

              {/* Volunteer CTA still visible when present (even if toggle is OFF) */}
              {nice(e.type) === "Volunteer" && (
                <div className="vol-cta-row">
                  <button
                    className="btn btn-primary btn-sm vol-btn"
                    onClick={() => alert("Thanks! (Placeholder—hook to signup later)")}
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
            </article>
          ))}
        </section>
      ))}

      {/* Empty state */}
      {dates.length === 0 && (
        <div className="card p-3">
          <div className="text-muted">No events match your current filters.</div>
        </div>
      )}
    </div>
  );
}