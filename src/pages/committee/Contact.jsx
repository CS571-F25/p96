// src/pages/committee/Contact.jsx
import React from "react";
import { useParams, Link } from "react-router-dom";
import { COMMITTEES } from "../../data/committees";

export default function CommitteeContact() {
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
        <Link to="/committees">Committees</Link> <span className="crumb-sep">›</span>
        <Link to={`/committees/${slug}/info`}>{c.name}</Link>{" "}
        <span className="crumb-sep">›</span>
        <span>Contact</span>
      </nav>

      <h2 className="mb-2">{c.name} — Contact</h2>
      <p className="row-meta">Socials & quick contact form (course-project placeholder).</p>

      <div className="section mb-3">
        <div className="row-actions">
          <button
            className="btn btn-light"
            type="button"
            onClick={() => alert("Open Instagram (placeholder link)")}
          >
            Instagram
          </button>
          <button
            className="btn btn-light"
            type="button"
            onClick={() => alert("Open X/Twitter (placeholder link)")}
          >
            X (Twitter)
          </button>
          <button
            className="btn btn-light"
            type="button"
            onClick={() => alert("Compose email (placeholder link)")}
          >
            Email
          </button>
        </div>
      </div>

      <div className="section">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            alert("Message sent! (Placeholder — hook to backend later.)");
          }}
        >
          <div className="mb-3">
            <label className="form-label" htmlFor="contact-name">
              Your Name
            </label>
            <input
              id="contact-name"
              className="form-control"
              placeholder="Jane Badger"
              name="name"
            />
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="contact-email">
              Your Email
            </label>
            <input
              id="contact-email"
              type="email"
              className="form-control"
              placeholder="you@wisc.edu"
              name="email"
            />
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="contact-message">
              Message
            </label>
            <textarea
              id="contact-message"
              className="form-control"
              rows="4"
              placeholder="How can we help?"
              name="message"
            />
          </div>
          <button className="btn btn-primary" type="submit">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}