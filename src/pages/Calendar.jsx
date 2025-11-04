import React from "react";
import EventCard from "../components/EventCard";
import { EVENTS } from "../data/events";

// Group by date for a simple calendar look
const byDate = EVENTS.reduce((acc, e) => {
  acc[e.date] = acc[e.date] || [];
  acc[e.date].push(e);
  return acc;
}, {});

export default function Calendar() {
  const dates = Object.keys(byDate).sort();
  return (
    <div className="container py-4">
      <h1>Calendar</h1>
      <p className="text-muted">Games, meetings, and events.</p>
      {dates.map((d) => (
        <section key={d} className="mb-3">
          <h2 className="h5">{d}</h2>
          {byDate[d].map((e) => <EventCard key={e.id} e={e} />)}
        </section>
      ))}
    </div>
  );
}