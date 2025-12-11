import React, { useEffect, useMemo, useState } from "react";

export default function VolunteerNeedCard({ n }) {
  // Have *you* signed up on this device?
  const storageKey = useMemo(() => `vol-signup-${n.id}`, [n.id]);
  const [signed, setSigned] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(storageKey);
    setSigned(saved === "yes");
  }, [storageKey]);

  const baseCount = n.signedUp ?? 0;
  const effectiveCount = baseCount + (signed ? 1 : 0);
  const full = effectiveCount >= (n.capacity ?? 0);

  const handleClick = () => {
    if (typeof window === "undefined") return;

    // If you’re already signed, clicking = leave shift
    if (signed) {
      setSigned(false);
      window.localStorage.setItem(storageKey, "no");
      return;
    }

    // If not signed and event is full, do nothing
    if (full) return;

    // Join shift
    setSigned(true);
    window.localStorage.setItem(storageKey, "yes");
  };

  return (
    <div className="card p-3 mb-3">
      <h5 className="mb-1">{n.title}</h5>
      <div className="text-muted small mb-2">
        {n.date} @ {n.time} • {n.location}
      </div>

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div className="d-flex flex-column gap-1">
          <div className="d-flex gap-2 flex-wrap">
            {n.committee && (
              <span className="badge text-bg-light">{n.committee}</span>
            )}
            <span
              className={
                "badge " +
                (full && !signed
                  ? "text-bg-secondary"
                  : full && signed
                  ? "text-bg-warning"
                  : "text-bg-success")
              }
            >
              {effectiveCount}/{n.capacity} filled
            </span>
          </div>
          <span className="small text-muted">
            {signed
              ? "You’re marked as signed up on this device."
              : "Click to mark yourself as interested on this device."}
          </span>
        </div>

        <button
          className={`btn btn-sm ${
            full && !signed ? "btn-secondary" : "btn-primary"
          }`}
          type="button"
          disabled={full && !signed}
          onClick={handleClick}
          aria-pressed={signed}
        >
          {signed
            ? "Leave shift"
            : full && !signed
            ? "Full"
            : "Volunteer"}
        </button>
      </div>
    </div>
  );
}