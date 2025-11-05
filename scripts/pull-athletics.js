/**
 * Fetches Wisconsin Badgers Athletics events (via iCal feed)
 * and converts them to JSON used by your Calendar page.
 *
 * Run locally with:   node scripts/pull-athletics.js
 * Or via GitHub Action (below).
 */

import fs from "fs";
import ical from "ical";
import fetch from "node-fetch";

const FEED_URL =
  "https://today.wisc.edu/events/tag/Athletics.ics"; // UW athletics iCal

async function fetchICS(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  return ical.parseICS(text);
}

function parseEvent(e) {
  if (!e.start || !e.summary) return null;
  const dateObj = new Date(e.start);
  const date = dateObj.toISOString().split("T")[0];
  const time = dateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const sportMatch =
    e.summary.match(/(Volleyball|Basketball|Hockey|Football|Soccer|Wrestling|Softball|Baseball|Track)/i);
  const sport = sportMatch ? sportMatch[1] : "Other";

  return {
    id: `uw-${e.uid || e.start}`,
    title: e.summary.replace(/UW–Madison/i, "Wisconsin"),
    type: "Game",
    sport,
    date,
    time,
    venue: e.location || "TBA",
    notes: e.description ? e.description.split("\n")[0] : "",
    source: "UW Athletics",
  };
}

async function main() {
  console.log("Fetching UW Athletics events...");
  const data = await fetchICS(FEED_URL);
  const events = Object.values(data)
    .filter((e) => e.type === "VEVENT")
    .map(parseEvent)
    .filter(Boolean);

  // Save to repo
  fs.writeFileSync("src/data/events.auto.json", JSON.stringify(events, null, 2));
  console.log(`✅ Saved ${events.length} events to src/data/events.auto.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});