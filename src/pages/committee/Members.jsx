// src/pages/committee/Members.jsx
import React from "react";
import { useParams, Link } from "react-router-dom";
import { COMMITTEES } from "../../data/committees";

const SAMPLE_MEMBERS = [
  { name: "Alex Director", role: "Director" },
  { name: "Sam Lead", role: "Lead" },
  { name: "Jordan Member", role: "Member" },
  { name: "Taylor Member", role: "Member" },
];

export default function CommitteeMembers() {
  const { slug } = useParams();
  const c = COMMITTEES.find((x) => x.slug === slug);
  if (!c) {
    return (
      <div className="container py-4">
        <div className="section">
          <h1>Committee Not Found</h1>
          <Link to="/committees" className="btn btn-primary mt-2">
            Back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <nav className="breadcrumb-uw mb-2">
        <Link to="/committees">Committees</Link> <span className="crumb-sep">›</span>
        <Link to={`/committees/${slug}/info`}>{c.name}</Link>{" "}
        <span className="crumb-sep">›</span>
        <span>Members</span>
      </nav>

      <h2 className="mb-2">{c.name} — Members</h2>

      <div className="section">
        <div className="list">
          {SAMPLE_MEMBERS.map((m) => (
            <div className="row" key={m.name}>
              <div>
                <strong>{m.name}</strong>
                <div className="row-meta">{m.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}