import React from "react";
import { Link } from "react-router-dom";
import EventCard from "../components/EventCard";
import { EVENTS } from "../data/events";
import { COMMITTEES } from "../data/committees";

export default function Home() {
  const featured = EVENTS.slice(0, 2);
  const featuredCommittees = COMMITTEES.slice(0, 3);

  return (
    <div className="container py-4">
      <section className="mb-4">
        <div className="committees-hero text-center">
          <h1>Welcome to AreaRED</h1>
          <p className="lead mb-0">
            Keep the student section loud, proud, and organized. Explore committees, events, and ways to help.
          </p>
        </div>
      </section>

      <section className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h2 className="h4 mb-0">Upcoming Highlights</h2>
          <Link to="/calendar" className="btn btn-light btn-sm">View full calendar</Link>
        </div>
        {featured.map((e) => <EventCard key={e.id} e={e} />)}
      </section>

      <section>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h2 className="h4 mb-0">Get Involved</h2>
          <Link to="/committees" className="btn btn-light btn-sm">All committees</Link>
        </div>
        <div className="committees-grid">
          {featuredCommittees.map((c) => (
            <article key={c.slug} className="committee-card">
              <div className="card-top">
                <div className="avatar">{(c.icon || c.name.charAt(0)).toUpperCase()}</div>
                <div className="card-titles">
                  <h3 className="title">{c.name}</h3>
                  {c.subtitle && <p className="subtitle">{c.subtitle}</p>}
                </div>
              </div>
              {c.blurb && <p className="blurb mt-2">{c.blurb}</p>}
              <div className="card-actions mt-2">
                <Link to={`/committees/${c.slug}/info`} className="btn btn-light">Info</Link>
                <Link to={`/committees/${c.slug}/members`} className="btn btn-light">Members</Link>
                <Link to={`/committees/${c.slug}/contact`} className="btn btn-primary">Contact</Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}