import React from "react";

/** Tiny inline SVGs (no extra libs) */
const IG = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.75A5.25 5.25 0 1 1 6.75 13 5.26 5.26 0 0 1 12 7.75Zm0 2A3.25 3.25 0 1 0 15.25 13 3.25 3.25 0 0 0 12 9.75Zm5.75-2.5a.75.75 0 1 1-.75.75.75.75 0 0 1 .75-.75Z"/>
  </svg>
);
const TT = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M15.5 2v5.2A5.8 5.8 0 0 0 19 8v3a8.8 8.8 0 0 1-3.5-.8v5.1a6.8 6.8 0 1 1-6.7-6.8h.3V11a3.8 3.8 0 1 0 3.8 3.8V2h2.6Z"/>
  </svg>
);
const X = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="m14.7 3h3.1l-6.8 8.1L19 21h-5.1l-4.1-5.3L5.1 21H2l7.4-8.8L3 3h5.2l3.6 4.8L14.7 3Z"/>
  </svg>
);
const Cam = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M3 7a3 3 0 0 1 3-3h2l1.3-1.6A2 2 0 0 1 10.9 2h2.2a2 2 0 0 1 1.6.8L16 4h2a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7Zm9 3.5A4.5 4.5 0 1 0 16.5 15 4.5 4.5 0 0 0 12 10.5Zm0 2A2.5 2.5 0 1 1 9.5 15 2.5 2.5 0 0 1 12 12.5Z"/>
  </svg>
);
const Shop = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M4 4h16l-1 14a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3L4 4Zm2 2 1 12a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1l1-12H6Zm3-4h6v2H9V2Z"/>
  </svg>
);

const sections = [
  {
    title: "Instagram",
    icon: IG,
    links: [
      { label: "AreaRED", url: "https://instagram.com/areared" },
      { label: "Madhouse (Volleyball)", url: "https://instagram.com/uwmadhouse" },
      { label: "Crease Creatures (Hockey)", url: "https://instagram.com/creasecreatures" },
      { label: "Cardinal & White", url: "https://instagram.com/cardinalandwhite" }
    ]
  },
  {
    title: "TikTok",
    icon: TT,
    links: [
      { label: "AreaRED", url: "https://tiktok.com/@areared" },
      { label: "Crease Creatures", url: "https://tiktok.com/@creasecreatures" }
    ]
  },
  {
    title: "Twitter / X",
    icon: X,
    links: [{ label: "AreaRED", url: "https://x.com/areared" }]
  },
  {
    title: "Photos",
    icon: Cam,
    links: [{ label: "Flickr", url: "https://www.flickr.com/" }] // TODO replace with real
  },
  {
    title: "Merch Collab",
    icon: Shop,
    links: [{ label: "Shop Merch", url: "https://example.com/merch" }] // TODO replace with real
  }
];

export default function Links() {
  return (
    <div className="container py-4">
      <h1>Links</h1>
      <p className="text-muted">Quick access to socials, photos, and merch.</p>

      <div className="links-grid">
        {sections.map((sec) => (
          <article key={sec.title} className="link-card card p-3">
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="link-icon">{sec.icon && <sec.icon />}</span>
              <h5 className="mb-0">{sec.title}</h5>
            </div>
            <div className="d-flex flex-wrap gap-2">
              {sec.links.map((l) => (
                <a
                  key={l.label}
                  className="btn btn-light"
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {l.label}
                </a>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}