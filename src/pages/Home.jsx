import React from "react";
import { Link } from "react-router-dom";
import EventCard from "../components/EventCard";
import Avatar from "../components/Avatar";
import { EVENTS } from "../data/events";
import { COMMITTEES } from "../data/committees";

export default function Home() {
  const featured = EVENTS.slice(0, 2);

  return (
    <div className="container py-4">
      {/* Hero */}
      <section className="mb-4">
        <div className="committees-hero text-center">
          <h1>Welcome to AreaRED</h1>
          <p className="lead mb-0">
            Keep the student section loud, proud, and organized. Explore committees, events, and ways to help.
          </p>
        </div>
      </section>

      {/* Upcoming */}
      <section className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h2 className="h4 mb-0">Upcoming Highlights</h2>
          <Link to="/calendar" className="btn btn-light btn-sm">View full calendar</Link>
        </div>
        {featured.map((e) => <EventCard key={e.id} e={e} />)}
      </section>

      {/* All committees */}
      <section>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h2 className="h4 mb-0">Explore by Committee</h2>
          <Link to="/committees" className="btn btn-light btn-sm">All committees</Link>
        </div>

        <div className="committees-grid">
          {COMMITTEES.map((c) => (
            <article key={c.slug} className="committee-card">
              {/* Top row */}
              <div className="card-top">
                <Avatar
                  src={c.logo}
                  alt={`${c.name} logo`}
                  letter={c.icon || c.name.charAt(0)}
                  size={40}
                />
                <div className="card-titles">
                  <h3 className="title mb-0">{c.name}</h3>
                  {c.subtitle && <p className="subtitle mb-0">{c.subtitle}</p>}
                </div>
              </div>

              {/* Body (short blurb) */}
              {c.blurb && <p className="blurb mt-2">{c.blurb}</p>}

              {/* Single action keeps the home page clean */}
              <div className="card-actions">
                <Link to={`/committees/${c.slug}/info`} className="btn btn-primary">
                  View
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}