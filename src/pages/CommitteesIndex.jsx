import React from "react";
import { Link } from "react-router-dom";
import { COMMITTEES } from "../data/committees";

export default function CommitteesIndex() {
  return (
    <div className="page-committees container py-4">
      <section className="committees-hero text-center">
        <h1>AreaRED Committees</h1>
        <p className="lead">Explore the committees that make every Badger game and event unforgettable.</p>
      </section>

      <section className="committees-grid mt-4">
        {COMMITTEES.map(c => (
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
      </section>
    </div>
  );
}