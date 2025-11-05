/**
 * Fetches Wisconsin Badgers Athletics events (via iCal feed)
 * and converts them to JSON used by your Calendar page.
 *
 * Run locally:    node scripts/pull-athletics.js
 * GH Actions:     .github/workflows/pull-events.yml (commit + push)
 */

import fs from "fs";
import ical from "ical";
import fetch from "node-fetch";

const FEED_URL = "https://today.wisc.edu/events/tag/Athletics.ics";

// Config: how far ahead to keep (days)
const LOOKAHEAD_DAYS = 180;
// Also keep a small look-behind so “today” all-day events don’t drop:
const KEEP_PAST_DAYS = 1;

const TZ = "America/Chicago";

const SPORT_WORDS = [
  "Volleyball", "Basketball", "Hockey", "Football", "Soccer", "Wrestling",
  "Softball", "Baseball", "Track", "Tennis", "Golf", "Rowing", "Swim", "Swimming",
  "Cross Country", "Hockey (W)", "Hockey (M)", "WBB", "MBB"
];

async function fetchICS(url) {
  const res = await fetch(url, { headers: { "User-Agent": "AreaRED/1.0 (course project)" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  return ical.parseICS(text);
}

function toDateOnlyStr(d) {
  // YYYY-MM-DD in local TZ (America/Chicago)
  const local = new Date(
    d.toLocaleString("en-US", { timeZone: TZ })
  );
  const y = local.getFullYear();
  const m = String(local.getMonth() + 1).padStart(2, "0");
  const day = String(local.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function toTimeStr(d) {
  // "h:mm AM/PM" in America/Chicago
  return d.toLocaleTimeString("en-US", {
    timeZone: TZ,
    hour: "numeric",
    minute: "2-digit",
  });
}

function guessSport(summary = "") {
  for (const w of SPORT_WORDS) {
    const re = new RegExp(`\\b${w}\\b`, "i");
    if (re.test(summary)) return w.replace(/\s+\(.*\)$/, "");
  }
  // Sometimes summary is like "Women's Volleyball vs ..."
  const generic = summary.match(/\b(Volleyball|Basketball|Hockey|Football|Soccer|Wrestling|Softball|Baseball|Track|Tennis|Golf|Rowing|Swim|Swimming|Cross Country)\b/i);
  return generic ? generic[1] : "Other";
}

function parseEvent(e) {
  if (!e.start || !e.summary) return null;

  const start = e.start instanceof Date ? e.start : new Date(e.start);
  if (isNaN(start.getTime())) return null;

  const date = toDateOnlyStr(start);

  // Some ICS are all-day (floating) — time may be omitted; keep empty:
  const time = e.datetype === "date" || e.type === "all-day" ? "" : toTimeStr(start);

  const sport = guessSport(e.summary);
  const title = e.summary.replace(/UW–?Madison/gi, "Wisconsin").trim();

  // “Game” is a fine default; tweak if summary hints otherwise
  let type = "Game";
  if (/meeting|banquet|clinic|fan day|open house/i.test(e.summary)) type = "Event";
  if (/practice|workout/i.test(e.summary)) type = "Practice";

  const idBase = (e.uid || `${title}_${date}_${e.location || ""}`).replace(/\s+/g, "-").toLowerCase();
  const id = `uw-${idBase.replace(/[^a-z0-9\-_]/g, "")}`;

  return {
    id,
    title,
    type,
    sport,
    date,
    time,
    venue: e.location || "TBA",
    notes: e.description ? e.description.split("\n")[0].trim() : "",
    source: "UW Athletics",
  };
}

function inWindow(ev) {
  const today = new Date();
  const startCut = new Date(today);
  startCut.setDate(startCut.getDate() - KEEP_PAST_DAYS);

  const endCut = new Date(today);
  endCut.setDate(endCut.getDate() + LOOKAHEAD_DAYS);

  const [y, m, d] = ev.date.split("-").map((n) => parseInt(n, 10));
  const dt = new Date(y, m - 1, d, 0, 0, 0, 0);
  return dt >= new Date(startCut.getFullYear(), startCut.getMonth(), startCut.getDate()) &&
         dt <= new Date(endCut.getFullYear(), endCut.getMonth(), endCut.getDate());
}

function dedupe(list) {
  const map = new Map();
  for (const e of list) {
    const key = e.id || `${e.title}__${e.date}__${e.venue || ""}`;
    if (!map.has(key)) map.set(key, e);
  }
  return [...map.values()];
}

async function main() {
  console.log("Fetching UW Athletics events...");
  const data = await fetchICS(FEED_URL);

  const parsed = Object.values(data)
    .filter((e) => e.type === "VEVENT")
    .map(parseEvent)
    .filter(Boolean)
    .filter(inWindow);

  const cleaned = dedupe(parsed)
    .sort((a, b) => (a.date || "").localeCompare(b.date || "") || (a.time || "").localeCompare(b.time || ""));

  fs.writeFileSync("src/data/events.auto.json", JSON.stringify(cleaned, null, 2));
  console.log(`✅ Saved ${cleaned.length} events → src/data/events.auto.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});