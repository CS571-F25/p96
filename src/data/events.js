// src/data/events.js
// Merge: auto-pulled UW Athletics events + custom AreaRED events + volunteer needs
import rawAuto from "./events.auto.json" assert { type: "json" };
import { VOLUNTEER_NEEDS } from "./volunteerNeeds";

/** Decode a few common HTML entities we see in UW feeds */
function decodeEntities(s = "") {
  return s
    .replaceAll("&amp;", "&")
    .replaceAll("&nbsp;", " ")
    .replaceAll("&apos;", "'")
    .replaceAll("&#39;", "'")
    .replaceAll("&quot;", '"')
    .trim();
}

/** Normalize sport names so colors/tags match consistently */
function normalizeSport(s) {
  if (!s) return undefined;
  const x = s.toLowerCase();
  if (x.includes("basketball")) return "Basketball";
  if (x.includes("football")) return "Football";
  if (x.includes("hockey")) return "Hockey";
  if (x.includes("volleyball")) return "Volleyball";
  if (x.includes("soccer")) return "Soccer";
  if (x.includes("softball")) return "Softball";
  if (x.includes("baseball")) return "Baseball";
  if (x.includes("wrestling")) return "Wrestling";
  if (x.includes("golf")) return "Golf";
  if (x.includes("tennis")) return "Tennis";
  if (x.includes("rowing")) return "Rowing";
  if (x.includes("track") || x.includes("field")) return "Track & Field";
  if (x.includes("cross country")) return "Cross Country";
  if (x.includes("swim") || x.includes("diving")) return "Swimming & Diving";
  return "Other";
}

/** Normalize event type labels */
function normalizeType(t) {
  if (!t) return "Other";
  const x = t.toLowerCase();
  if (x.includes("game") || x.includes("match") || x.includes("meet")) return "Game";
  if (x.includes("volunteer")) return "Volunteer";
  if (x.includes("meeting") || x.includes("mtg")) return "Meeting";
  if (x.includes("pep") || x.includes("rally")) return "Special Event";
  return "Other";
}

/** Ensure a uniform event shape */
function toEvent(e) {
  return {
    id: String(e.id ?? cryptoRandom()),
    title: decodeEntities(e.title ?? ""),
    type: normalizeType(e.type),
    sport: normalizeSport(e.sport),
    date: e.date,               // YYYY-MM-DD
    time: e.time ?? "",
    venue: decodeEntities(e.venue ?? ""),
    notes: decodeEntities(e.notes ?? ""),
    badge: e.sport ? normalizeSport(e.sport) : normalizeType(e.type),
  };
}

// Fallback ID if auto events don’t have one
function cryptoRandom() {
  return `auto-${Math.random().toString(36).slice(2, 10)}`;
}

// ---- Convert volunteer needs into event-style items
const volunteerEvents = VOLUNTEER_NEEDS.map((n) =>
  toEvent({
    id: `vol-${n.id}`,
    title: n.title,
    type: "Volunteer",
    sport: n.committee?.toLowerCase().includes("volley") ? "Volleyball"
         : n.committee?.toLowerCase().includes("hock") ? "Hockey"
         : n.committee?.toLowerCase().includes("foot") ? "Football"
         : undefined,
    date: n.date,
    time: n.time,
    venue: n.location,
    notes: `${n.committee} • ${n.signedUp}/${n.capacity} filled`,
  })
);

// ---- Your manual AreaRED events
const customEvents = [
  toEvent({
    id: "evt-ared-meeting-2025-11-18",
    title: "AreaRED General Meeting",
    type: "Meeting",
    date: "2025-11-18",
    time: "7:00 PM",
    venue: "Union South",
    notes: "New member welcome + committee breakouts.",
  }),
  toEvent({
    id: "evt-winter-pep-2025-12-10",
    title: "Winter Pep Rally",
    type: "Special Event",
    date: "2025-12-10",
    time: "6:00 PM",
    venue: "Kohl Center",
    notes: "Celebrate the semester with all committees together!",
  }),
];

// ---- Normalize auto-pulled athletics
const autoEvents = (Array.isArray(rawAuto) ? rawAuto : []).map((e) =>
  toEvent({
    ...e,
    // Tidy any weird text that slipped through
    title: decodeEntities(e.title),
    venue: decodeEntities(e.venue),
    notes: decodeEntities(e.notes),
  })
);

// ---- Export combined list
export const EVENTS = [...autoEvents, ...customEvents, ...volunteerEvents];