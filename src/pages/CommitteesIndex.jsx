import React from "react";
import { Link } from "react-router-dom";
import { COMMITTEES } from "../data/committees";
import Avatar from "../components/Avatar";

export default function CommitteesIndex() {
  return (
    <div className="page-committees container py-4">
      <section className="committees-hero text-center mb-3">
        <h1>AreaRED Committees</h1>
        <p className="lead">Explore the committees that make every Badger game and event unforgettable.</p>
      </section>

      <section className="committees-grid">
        {COMMITTEES.map((c) => (
          <article key={c.slug} className="committee-card">
            <div className="card-top">
              <Avatar src={c.logo} alt={`${c.name} logo`} letter={c.icon || c.name[0]} size={44} />
              <div className="card-titles">
                <h3 className="title mb-0">{c.name}</h3>
                {c.subtitle && <p className="subtitle mb-0">{c.subtitle}</p>}
              </div>
            </div>

            <div className="card-body">
              {c.blurb && <p className="blurb">{c.blurb}</p>}
            </div>

            <div className="card-actions">
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