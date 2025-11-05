// Combines: UW Athletics auto-pulled events + custom AreaRED events + volunteer needs
import autoEvents from "./events.auto.json" assert { type: "json" };
import { VOLUNTEER_NEEDS } from "./volunteerNeeds";

/**
 * EVENT SCHEMA:
 * {
 *   id: string,
 *   title: string,
 *   type: string,       // "Game", "Meeting", "Volunteer", etc.
 *   sport?: string,     // For athletics events
 *   date: string,       // YYYY-MM-DD
 *   time: string,       // e.g. "7:00 PM"
 *   venue?: string,
 *   notes?: string,
 *   badge?: string,     // optional label (for top-right badges)
 * }
 */

// --- Convert volunteer opportunities into event-style objects ---
const volunteerEvents = VOLUNTEER_NEEDS.map((n) => ({
  id: `vol-${n.id}`,
  title: n.title,
  type: "Volunteer",
  date: n.date,
  time: n.time,
  venue: n.location,
  notes: `${n.committee} • ${n.signedUp}/${n.capacity} filled`,
  committee: n.committee,
  capacity: n.capacity,
  signedUp: n.signedUp,
  badge: "Volunteer",
}));

// --- Manual custom events (AreaRED internal) ---
const customEvents = [
  {
    id: "evt-1",
    title: "AreaRED General Meeting",
    type: "Meeting",
    date: "2025-11-18",
    time: "7:00 PM",
    venue: "Union South",
    notes: "New member welcome + committee breakouts.",
  },
  {
    id: "evt-2",
    title: "Winter Pep Rally",
    type: "Special Event",
    date: "2025-12-10",
    time: "6:00 PM",
    venue: "Kohl Center",
    notes: "Celebrate the semester with all committees together!",
  },
];

// --- Merge everything ---
export const EVENTS = [
  ...autoEvents.map((e) => ({
    ...e,
    badge: e.sport ? e.sport : e.type,
  })),
  ...customEvents,
  ...volunteerEvents,
];