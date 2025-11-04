import React from "react";
import { useParams, Link } from "react-router-dom";
import { COMMITTEES } from "../data/committees";

const SAMPLE_MEMBERS = [
  { name: "Alex Director", role: "Director" },
  { name: "Sam Lead", role: "Lead" },
  { name: "Jordan Member", role: "Member" },
  { name: "Taylor Member", role: "Member" }
];

export default function CommitteeMembers() {
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
          <li className="breadcrumb-item"><Link to={`/committees/${slug}/info`}>{c.name}</Link></li>
          <li className="breadcrumb-item active" aria-current="page">Members</li>
        </ol>
      </nav>

      <h1>{c.name} — Members</h1>
      <div className="table-responsive">
        <table className="table mb-0">
          <thead><tr><th>Name</th><th>Role</th></tr></thead>
          <tbody>
            {SAMPLE_MEMBERS.map((m) => (
              <tr key={m.name}><td>{m.name}</td><td>{m.role}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="d-flex gap-2 mt-3">
        <Link to={`/committees/${slug}/info`} className="btn btn-light">Info</Link>
        <Link to={`/committees/${slug}/contact`} className="btn btn-light">Contact</Link>
      </div>
    </div>
  );
}