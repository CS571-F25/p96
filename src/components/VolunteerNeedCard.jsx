import React, { useState } from "react";

export default function VolunteerNeedCard({ n }) {
  const [count, setCount] = useState(n.signedUp);
  const full = count >= n.capacity;
  return (
    <div className="card p-3 mb-3">
      <h5 className="mb-1">{n.title}</h5>
      <div className="text-muted small mb-2">
        {n.date} @ {n.time} • {n.location}
      </div>
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <span className="badge text-bg-light me-2">{n.committee}</span>
          <span className={`badge ${full ? "text-bg-secondary" : "text-bg-success"}`}>
            {count}/{n.capacity} filled
          </span>
        </div>
        <button
          className="btn btn-primary"
          disabled={full}
          onClick={() => {
            if (!full) {
              setCount((c) => c + 1);
              alert("Thanks! (Placeholder—hook to Bucket API later)");
            }
          }}
        >
          {full ? "Full" : "Volunteer"}
        </button>
      </div>
    </div>
  );
}