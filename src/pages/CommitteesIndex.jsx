import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { COMMITTEES } from "../data/committees";
import Avatar from "../components/Avatar";

export default function CommitteesIndex() {
  const navigate = useNavigate();

  return (
    <div className="page-committees container py-4">
      <section className="committees-hero text-center mb-3">
        <h1>AreaRED Committees</h1>
        <p className="lead">
          Explore the committees that make every Badger game and event unforgettable.
        </p>
      </section>

      <section className="committees-grid">
        {COMMITTEES.map((c) => (
          <article
            key={c.slug}
            className="committee-card"
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/committees/${c.slug}/info`)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate(`/committees/${c.slug}/info`);
              }
            }}
            aria-label={`${c.name} — open info`}
          >
            {/* Top row */}
            <div className="card-top">
              <Avatar
                src={c.logo}
                alt={`${c.name} logo`}
                letter={c.icon || c.name.charAt(0)}
                size={44}
              />
              <div className="card-titles">
                <h3 className="title mb-0">{c.name}</h3>
                {c.subtitle && <p className="subtitle mb-0">{c.subtitle}</p>}
              </div>
            </div>

            {/* Growable body so actions can pin bottom */}
            <div className="card-body">
              {c.blurb && <p className="blurb">{c.blurb}</p>}
            </div>

            {/* Bottom actions – aligned across all cards */}
            <div className="card-actions">
              {/* stop card click when pressing buttons/links */}
              <Link
                to={`/committees/${c.slug}/info`}
                className="btn btn-light"
                onClick={(e) => e.stopPropagation()}
              >
                Info
              </Link>

              {c.isSport && (
                <>
                  <Link
                    to={`/committees/${c.slug}/gameday`}
                    className="btn btn-light"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Gameday
                  </Link>
                  <Link
                    to={`/committees/${c.slug}/traditions`}
                    className="btn btn-light"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Traditions
                  </Link>
                </>
              )}

              <Link
                to={`/committees/${c.slug}/members`}
                className="btn btn-light"
                onClick={(e) => e.stopPropagation()}
              >
                Members
              </Link>

              <Link
                to={`/committees/${c.slug}/contact`}
                className="btn btn-primary"
                onClick={(e) => e.stopPropagation()}
              >
                Contact
              </Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}