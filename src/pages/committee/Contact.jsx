import React from "react";
import { useParams, Link } from "react-router-dom";
import { COMMITTEES } from "../../data/committees";

export default function CommitteeContact() {
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
    <div className="container py-2">
      <h1 className="h3">{c.name} — Contact</h1>
      <p className="text-muted">Socials & quick contact (placeholder form).</p>

      <div className="card p-3 mb-3">
        <div className="d-flex flex-wrap gap-2">
          <a className="btn btn-light" href="#" onClick={(e)=>{e.preventDefault(); alert("Placeholder IG");}}>Instagram</a>
          <a className="btn btn-light" href="#" onClick={(e)=>{e.preventDefault(); alert("Placeholder X/Twitter");}}>X (Twitter)</a>
          <a className="btn btn-light" href="#" onClick={(e)=>{e.preventDefault(); alert("Placeholder Email");}}>Email</a>
        </div>
      </div>

      <div className="card p-3">
        <form onSubmit={(e)=>{e.preventDefault(); alert("Message sent (placeholder)");}}>
          <div className="mb-3">
            <label className="form-label">Your Name</label>
            <input className="form-control" placeholder="Jane Badger" />
          </div>
          <div className="mb-3">
            <label className="form-label">Your Email</label>
            <input type="email" className="form-control" placeholder="you@wisc.edu" />
          </div>
          <div className="mb-3">
            <label className="form-label">Message</label>
            <textarea className="form-control" rows="4" placeholder="How can we help?" />
          </div>
          <button className="btn btn-primary" type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}