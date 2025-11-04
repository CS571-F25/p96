import React from "react";
import { useParams } from "react-router-dom";
import { COMMITTEES } from "../../data/committees";

export default function CommitteeInfo() {
  const { slug } = useParams();
  const c = COMMITTEES.find((x) => x.slug === slug);

  if (!c) {
    return (
      <div className="container py-4">
        <h1>Committee Not Found</h1>
        <p>Check the URL or select a committee from the navigation.</p>
      </div>
    );
  }

  return (
    <div className="container py-2">
      <h1 className="h3 mb-2">{c.name} — Info</h1>
      {c.subtitle && <p className="text-muted mb-2">{c.subtitle}</p>}
      {c.blurb && <p className="mb-3">{c.blurb}</p>}

      <div className="card p-3">
        <h5>What you’ll do (Placeholder)</h5>
        <ul className="mb-0">
          <li>Help coordinate the student section.</li>
          <li>Support game-day ops (signage, drums, chants).</li>
          <li>Promote events and theme nights.</li>
        </ul>
      </div>
    </div>
  );
}