// src/pages/committee/Info.jsx
import React from "react";
import { useParams, Link } from "react-router-dom";
import { COMMITTEES } from "../../data/committees";

export default function CommitteeInfo() {
  const { slug } = useParams();
  const c = COMMITTEES.find((x) => x.slug === slug);

  if (!c) {
    return (
      <div className="container py-4">
        <div className="section">
          <h1>Committee Not Found</h1>
          <Link to="/committees" className="btn btn-primary mt-2">
            Back to All Committees
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <nav className="breadcrumb-uw mb-2">
        <Link to="/committees">Committees</Link> <span className="crumb-sep">›</span>{" "}
        <span>{c.name}</span>
      </nav>

      <h2 className="mb-2">{c.name} — Info</h2>
      {c.subtitle && <div className="row-meta mb-2">{c.subtitle}</div>}
      {c.blurb && <p className="mb-3">{c.blurb}</p>}

      <div className="section">
        <h3>What you’ll do</h3>
        <div className="divider"></div>
        <ul className="mb-0">
          <li>Help coordinate the student section.</li>
          <li>Support game-day operations (signage, drums, chants).</li>
          <li>Promote events and theme nights.</li>
        </ul>
      </div>
    </div>
  );
}