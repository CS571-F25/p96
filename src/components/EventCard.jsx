import React from "react";

export default function EventCard({ e }) {
  return (
    <div className="card p-3 mb-3">
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <h5 className="mb-1">{e.title}</h5>
          <div className="text-muted small">
            {e.type} • {e.date} @ {e.time} • {e.venue}
          </div>
        </div>
        {e.badge && <span className="badge text-bg-danger">{e.badge}</span>}
      </div>
      {e.notes && <p className="mb-0 mt-2">{e.notes}</p>}
    </div>
  );
}