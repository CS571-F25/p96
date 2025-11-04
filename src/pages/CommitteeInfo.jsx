import React from "react";
import { useParams, Link } from "react-router-dom";
import { COMMITTEES } from "../data/committees";

export default function CommitteeInfo() {
  const { slug } = useParams();
  const c = COMMITTEES.find(x => x.slug === slug);

  if (!c) {
    return (
      <div className="container py-4">
        <h1>Committee Not Found</h1>
        <Link to="/committees" className="btn btn-primary mt-2">Back to All Committees</Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <nav aria-label="breadcrumb" className="mb-2">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/committees">Committees</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{c.name}</li>
        </ol>
      </nav>

      <h1>{c.name} — Info</h1>
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

      <div className="d-flex gap-2 mt-3">
        <Link to={`/committees/${slug}/members`} className="btn btn-light">Members</Link>
        <Link to={`/committees/${slug}/contact`} className="btn btn-primary">Contact</Link>
      </div>
    </div>
  );
}