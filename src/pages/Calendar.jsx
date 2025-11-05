import React, { useMemo, useState } from "react";
import { EVENTS } from "../data/events";
import { VOLUNTEER_NEEDS } from "../data/volunteerNeeds";

const COMMITTEE_TO_SPORT = {
  Football: "Football",
  "Madhouse (Volleyball)": "Volleyball",
  "Crease Creatures (Hockey)": "Hockey",
  Basketball: "Basketball",
  Marketing: "Other",
  "Cardinal & White": "Other",
  "Diverse Fan Engagement": "Other",
  Membership: "Other",
};

function mapVolunteerToEvents(needs) {
  return needs.map((n) => ({
    id: `need-${n.id || n.title}`,
    title: n.title,
    type: "Volunteer",
    date: n.date,
    time: n.time,
    venue: n.location,
    notes: "",
    sport: COMMITTEE_TO_SPORT[n.committee] || "Other",
    isVolunteer: true,
    capacity: n.capacity,
    filled: n.signedUp,
  }));
}

function sortWithOtherLast(arr) {
  const list = [...arr].sort((a, b) => a.localeCompare(b));
  const i = list.indexOf("Other");
  if (i > -1) {
    list.splice(i, 1);
    list.push("Other");
  }
  return list;
}

export default function Calendar() {
  const unified = useMemo(() => {
    const volunteerAsEvents = mapVolunteerToEvents(VOLUNTEER_NEEDS || []);
    return [...EVENTS, ...volunteerAsEvents];
  }, []);

  const typeOptions = useMemo(() => {
    const s = new Set(unified.map((e) => e.type || "Other"));
    ["Game", "Meeting", "Volunteer", "Other"].forEach((t) => s.add(t));
    return sortWithOtherLast(Array.from(s));
  }, [unified]);

  const sportOptions = useMemo(() => {
    const s = new Set(unified.map((e) => e.sport || "Other"));
    if (s.size === 0) s.add("Other");
    return sortWithOtherLast(Array.from(s));
  }, [unified]);

  const [selectedTypes, setSelectedTypes] = useState(() => new Set(typeOptions));
  const [selectedSports, setSelectedSports] = useState(() => new Set(sportOptions));

  const toggleType = (t) =>
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });

  const toggleSport = (s) =>
    setSelectedSports((prev) => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });

  const selectAllTypes = () => setSelectedTypes(new Set(typeOptions));
  const selectNoneTypes = () => setSelectedTypes(new Set());
  const selectAllSports = () => setSelectedSports(new Set(sportOptions));
  const selectNoneSports = () => setSelectedSports(new Set());

  const filtered = useMemo(
    () =>
      unified.filter(
        (e) => selectedTypes.has(e.type || "Other") && selectedSports.has(e.sport || "Other")
      ),
    [unified, selectedTypes, selectedSports]
  );

  const byDate = useMemo(() => {
    const map = new Map();
    for (const e of filtered) {
      const d = e.date;
      if (!map.has(d)) map.set(d, []);
      map.get(d).push(e);
    }
    for (const [, arr] of map) {
      arr.sort((a, b) => (a.time || "").localeCompare(b.time || ""));
    }
    return Array.from(map.entries()).sort((a, b) => (a[0] || "").localeCompare(b[0] || ""));
  }, [filtered]);

  const Badge = ({ cls, children }) => (
    <span className={`badge ${cls}`} style={{ borderRadius: 10, fontWeight: 700 }}>
      {children}
    </span>
  );
  const TypeBadge = ({ type }) => (
    <Badge cls={`badge-type badge-type-${(type || "Other").toLowerCase()}`}>{type}</Badge>
  );
  const SportBadge = ({ sport }) => (
    <Badge cls={`badge-sport badge-sport-${(sport || "Other").toLowerCase()}`}>{sport}</Badge>
  );

  const TypeChip = ({ t }) => {
    const on = selectedTypes.has(t);
    return (
      <button
        type="button"
        className={`chip chip-type type-${t.toLowerCase()} ${on ? "chip-on" : ""}`}
        onClick={() => toggleType(t)}
        aria-pressed={on}
      >
        {t}
      </button>
    );
  };
  const SportChip = ({ s }) => {
    const on = selectedSports.has(s);
    return (
      <button
        type="button"
        className={`chip chip-sport sport-${s.toLowerCase()} ${on ? "chip-on" : ""}`}
        onClick={() => toggleSport(s)}
        aria-pressed={on}
      >
        {s}
      </button>
    );
  };

  return (
    <div className="container py-4">
      <h1>Calendar</h1>
      <p className="text-muted">Games, meetings, and volunteer shifts. Use filters to focus on what you need.</p>

      {/* FILTER BAR */}
      <section className="card p-3 mb-3">
        <div className="d-flex flex-column gap-2">
          <div className="d-flex flex-wrap align-items-center gap-2">
            <span className="filter-label">Type:</span>
            <button
              type="button"
              className={`chip chip-neutral ${
                selectedTypes.size === typeOptions.length ? "chip-on" : ""
              }`}
              onClick={selectAllTypes}
            >
              All
            </button>
            <button
              type="button"
              className={`chip chip-neutral ${selectedTypes.size === 0 ? "chip-on" : ""}`}
              onClick={selectNoneTypes}
            >
              None
            </button>
            {typeOptions.map((t) => (
              <TypeChip key={t} t={t} />
            ))}
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2">
            <span className="filter-label">Sport:</span>
            <button
              type="button"
              className={`chip chip-neutral ${
                selectedSports.size === sportOptions.length ? "chip-on" : ""
              }`}
              onClick={selectAllSports}
            >
              All
            </button>
            <button
              type="button"
              className={`chip chip-neutral ${selectedSports.size === 0 ? "chip-on" : ""}`}
              onClick={selectNoneSports}
            >
              None
            </button>
            {sportOptions.map((s) => (
              <SportChip key={s} s={s} />
            ))}
          </div>
        </div>
        <div className="text-end small mt-1">{filtered.length} shown</div>
      </section>

      {/* RESULTS */}
      {byDate.map(([date, items]) => (
        <section key={date} className="mb-2">
          <h2 className="h5">{date}</h2>
          {items.map((e) => {
            const isVol = !!e.isVolunteer;
            const full = isVol && e.filled >= e.capacity;

            return (
              <article key={e.id} className="card p-3 mb-3">
                <div className="d-flex justify-content-between align-items-start gap-3">
                  <div className="flex-grow-1">
                    <h3 className="h5 mb-1">{e.title}</h3>
                    <div className="text-muted small mb-2">
                      {(e.type || "Other")} • {e.date} @ {e.time} • {e.venue}
                    </div>

{/* Volunteer CTA — refined: button + capacity chip, or single full chip */}
{isVol && (
  <div className="vol-cta-row mt-3">
    {(() => {
      const ratio = e.capacity ? e.filled / e.capacity : 0;
      const isFull = ratio >= 1;

      if (isFull) {
        return (
          <span className="cap-badge full" aria-label={`Full — ${e.capacity}/${e.capacity}`}>
            Full — {e.capacity}/{e.capacity}
          </span>
        );
      }

      const capText = `${e.filled}/${e.capacity} filled`;
      const capClass =
        ratio >= 0.75 ? "warn" : "ok"; // ok=green, warn=amber

      return (
        <>
          <button
            className="btn btn-primary vol-btn"
            onClick={() => alert("Thanks! (Placeholder — hook to real signup later)")}
            aria-label={`Sign up to volunteer. ${capText}`}
          >
            Volunteer
          </button>
          <span className={`cap-badge ${capClass}`} aria-hidden="true">
            {capText}
          </span>
        </>
      );
    })()}
  </div>
)}

                    {e.notes && <p className="mb-0 mt-2">{e.notes}</p>}
                  </div>

                  <div className="d-flex flex-column align-items-end gap-2">
                    <TypeBadge type={e.type || "Other"} />
                    <SportBadge sport={e.sport || "Other"} />
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      ))}
    </div>
  );
}