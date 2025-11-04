import React, { useMemo, useState } from "react";
import VolunteerNeedCard from "../components/VolunteerNeedCard";
import { VOLUNTEER_NEEDS } from "../data/volunteerNeeds";

export default function Volunteer() {
  const committees = useMemo(() => {
    const set = new Set(VOLUNTEER_NEEDS.map(n => n.committee));
    return Array.from(set).sort();
  }, []);
  const [selected, setSelected] = useState("All");

  const filtered = useMemo(() => {
    if (selected === "All") return VOLUNTEER_NEEDS;
    return VOLUNTEER_NEEDS.filter(n => n.committee === selected);
  }, [selected]);

  return (
    <div className="container py-4">
      <h1>Volunteer</h1>
      <p className="text-muted">
        Sign up for open roles (sample placeholders below). Use the quick filter to jump to a committee.
      </p>

      <div className="vol-filter-bar card p-2 mb-3">
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <span className="me-2 fw-semibold">Filter:</span>

          <button type="button"
            className={`btn btn-sm ${selected === "All" ? "btn-primary" : "btn-light"}`}
            onClick={() => setSelected("All")}
            aria-pressed={selected === "All"}>All</button>

          {committees.map((c) => (
            <button key={c} type="button"
              className={`btn btn-sm ${selected === c ? "btn-primary" : "btn-light"}`}
              onClick={() => setSelected(c)}
              aria-pressed={selected === c}
              title={`Show ${c} needs`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="alert alert-info">
          No open needs for <strong>{selected}</strong> right now — try another filter.
        </div>
      )}
      {filtered.map((n) => <VolunteerNeedCard key={n.id} n={n} />)}
    </div>
  );
}