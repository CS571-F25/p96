// src/pages/Calendar.jsx
import React, { useMemo, useState } from "react";
import { EVENTS } from "../data/events";

const TAG_COLORS = {
  // Types
  Game: "#C5050C",
  Meeting: "#1E58A5",
  "Special Event": "#6E7F5E",
  Volunteer: "#2F8F5B",
  Other: "#656D78",

  // Sports
  Football: "#8B1A1A",
  Basketball: "#D2840C",
  Hockey: "#1E58A5",
  Volleyball: "#D07A00",
  Soccer: "#4B5563",
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
  // Build filter option sets from data
  const allTypes = useMemo(() => {
    const s = new Set(EVENTS.map((e) => nice(e.type)));
    return Array.from(s).sort((a, b) =>
      a === "Other" ? 1 : b === "Other" ? -1 : a.localeCompare(b)
    );
  }, []);

  const allSports = useMemo(() => {
    const s = new Set(EVENTS.map((e) => nice(e.sport)));
    s.delete(undefined);
    return Array.from(s).sort((a, b) =>
      a === "Other" ? 1 : b === "Other" ? -1 : a.localeCompare(b)
    );
  }, []);

  const [activeTypes, setActiveTypes] = useState(new Set(allTypes));
  const [activeSports, setActiveSports] = useState(new Set(allSports));

  const toggle = (setFn, curSet, key) => {
    const ns = new Set(curSet);
    if (ns.has(key)) ns.delete(key);
    else ns.add(key);
    setFn(ns);
  };

  const setAll = (setFn, keys) => setFn(new Set(keys));
  const setNone = (setFn) => setFn(new Set());

  // Apply filters
  const filtered = useMemo(() => {
    return EVENTS.filter((e) => {
      const t = nice(e.type);
      const s = nice(e.sport);
      const typeOK = activeTypes.size === 0 || activeTypes.has(t);
      const sportOK = !e.sport || activeSports.size === 0 || activeSports.has(s);
      return typeOK && sportOK;
    }).sort((a, b) => (a.date + (a.time || "")).localeCompare(b.date + (b.time || "")));
  }, [activeTypes, activeSports]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);
  const dates = useMemo(() => Object.keys(grouped).sort(), [grouped]);

  return (
    <div className="container py-4">
      <h1>Calendar</h1>
      <p className="text-muted">
        Games, meetings, and volunteer shifts. Use filters to focus on what you need.
      </p>

      {/* Filters */}
      <div className="card p-3 mb-3">
        <div className="mb-2 fw-semibold">Type:</div>
        <div className="d-flex flex-wrap gap-2 mb-3">
          <button className="btn btn-light btn-sm"
            onClick={() => setAll(setActiveTypes, allTypes)}>All</button>
          <button className="btn btn-light btn-sm"
            onClick={() => setNone(setActiveTypes)}>None</button>

          {allTypes.map((t) => (
            <button
              key={t}
              type="button"
              className="filter-chip"
              data-active={activeTypes.has(t)}
              style={{
                background: activeTypes.has(t) ? getColor(t) : "transparent",
                color: activeTypes.has(t) ? "#fff" : "#222",
                borderColor: getColor(t),
              }}
              onClick={() => toggle(setActiveTypes, activeTypes, t)}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mb-2 fw-semibold">Sport:</div>
        <div className="d-flex flex-wrap gap-2">
          <button className="btn btn-light btn-sm"
            onClick={() => setAll(setActiveSports, allSports)}>All</button>
          <button className="btn btn-light btn-sm"
            onClick={() => setNone(setActiveSports)}>None</button>

          {allSports.map((s) => (
            <button
              key={s}
              type="button"
              className="filter-chip"
              data-active={activeSports.has(s)}
              style={{
                background: activeSports.has(s) ? getColor(s) : "transparent",
                color: activeSports.has(s) ? "#fff" : "#222",
                borderColor: getColor(s),
              }}
              onClick={() => toggle(setActiveSports, activeSports, s)}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="text-end small mt-2">{filtered.length} shown</div>
      </div>

      {/* Results */}
      {dates.map((d) => (
        <section key={d} className="mb-3">
          <h5 className="mb-2">{d}</h5>
          {grouped[d].map((e) => (
            <article key={e.id} className="card p-3 mb-3 position-relative">
              {/* Badges top-right: Type then Sport (if any) */}
              <div className="d-flex flex-column gap-1 position-absolute end-0 me-3 mt-3">
                <span
                  className="badge tag-badge"
                  style={{ background: getColor(nice(e.type)) }}
                >
                  {nice(e.type)}
                </span>
                {e.sport && (
                  <span
                    className="badge tag-badge"
                    style={{ background: getColor(nice(e.sport)) }}
                  >
                    {nice(e.sport)}
                  </span>
                )}
              </div>

              <h5 className="mb-1">{e.title}</h5>
              <div className="text-muted small mb-2">
                {nice(e.type)} • {e.date} {e.time ? `@ ${e.time}` : ""} {e.venue ? `• ${e.venue}` : ""}
              </div>

              {e.notes && <p className="mb-2">{e.notes}</p>}

              {/* Volunteer CTA (if volunteer) */}
              {nice(e.type) === "Volunteer" && (
                <div className="d-flex align-items-center gap-2">
                  <button className="btn btn-primary btn-sm"
                    onClick={() => alert("Thanks! (Placeholder—hook to signup later)")}>
                    Sign Up to Volunteer
                  </button>
                  {e.notes?.match(/(\d+)\/(\d+)/) && (
                    <span className="badge text-bg-success">
                      {e.notes.match(/(\d+)\/(\d+)/)[0]} filled
                    </span>
                  )}
                </div>
              )}
            </article>
          ))}
        </section>
      ))}
    </div>
  );
}