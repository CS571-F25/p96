import React from "react";

const slug = (s = "") =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function EventCard({ e, onVolunteerSignup }) {
  // flags for volunteer card extras
  const isVol = !!e._isVolunteer;
  const count = isVol ? (e.signedUp ?? 0) : undefined;
  const cap = isVol ? (e.capacity ?? 0) : undefined;
  const full = isVol ? count >= cap : false;

  const type = e.type || "Other";
  const sport = e.sport || "Other";

  return (
    <div className="card p-3 mb-3 position-relative">
      <div className="d-flex justify-content-between align-items-start">
        {/* left: title + meta */}
        <div>
          <h5 className="mb-1">{e.title}</h5>
          <div className="text-muted small">
            {type} • {e.date}
            {e.time ? ` @ ${e.time}` : ""}
            {e.venue ? ` • ${e.venue}` : ""}
          </div>
        </div>

        {/* right: stacked corner badges (type + sport only) */}
        <div className="d-flex flex-column align-items-end gap-1 ms-3 event-badge-stack">
          <span className={`badge badge-top badge-type-${slug(type)}`}>{type}</span>
          <span className={`badge badge-top badge-sport-${slug(sport)}`}>{sport}</span>
        </div>
      </div>

      {e.notes && <p className="mb-2 mt-2">{e.notes}</p>}

      {/* volunteer row */}
      {isVol && (
        <div className="d-flex justify-content-between align-items-center mt-2">
          <div>
            <span className="badge text-bg-light me-2">Volunteer</span>
            <span className={`badge ${full ? "text-bg-secondary" : "text-bg-success"}`}>
              {count}/{cap} filled
            </span>
          </div>
          <button
            className="btn btn-primary"
            disabled={full}
            onClick={onVolunteerSignup}
            aria-disabled={full}
          >
            {full ? "Full" : "Volunteer"}
          </button>
        </div>
      )}
    </div>
  );
}