import React from "react";
import InstagramSection from "../components/InstagramSection";

export default function Home() {
  return (
    <main className="container app-main">
      {/* ======= HERO / WELCOME ======= */}
      <section className="section text-center" style={{ paddingTop: "1rem" }}>
        <h1>Welcome to AreaRED</h1>
        <p className="text-muted" style={{ maxWidth: "650px", margin: "0 auto" }}>
          Keep the student section loud, proud, and organized. Explore committees, events, and ways to help.
        </p>
      </section>

      {/* ======= UPCOMING HIGHLIGHTS ======= */}
      <section className="section">
        <div className="section-head">
          <h2 className="section-title">Upcoming Highlights</h2>
          <a href="/calendar" className="btn btn-light btn-sm">
            View full calendar
          </a>
        </div>

        <div className="card mb-3 p-3">
          <h5 className="mb-1">Football vs. Minnesota</h5>
          <div className="text-muted small mb-1">
            Game • 2025-11-15 @ 2:30 PM • Camp Randall
          </div>
          <p className="mb-0">Stripe-out in the student section.</p>
        </div>

        <div className="card p-3">
          <h5 className="mb-1">AreaRED General Meeting</h5>
          <div className="text-muted small mb-1">
            Meeting • 2025-11-18 @ 7:00 PM • Union South
          </div>
          <p className="mb-0">New member welcome + committee breakouts.</p>
        </div>
      </section>

      {/* ======= INSTAGRAM SECTION ======= */}
      <InstagramSection />
    </main>
  );
}