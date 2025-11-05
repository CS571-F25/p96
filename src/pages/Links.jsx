import React, { useMemo } from "react";
import BrandIcon from "../components/BrandIcon";
import EmbedScriptLoader from "../components/EmbedScriptLoader";
import { LINKS_ACCOUNTS, LINKS_EMBEDS } from "../data/links";

export default function Links() {
  const sections = [
    { key: "instagram", title: "Instagram", color: "ig", icon: "instagram" },
    { key: "tiktok",    title: "TikTok",    color: "tt", icon: "tiktok" },
    { key: "x",         title: "Twitter / X", color: "x", icon: "x" },
    { key: "flickr",    title: "Photos (Flickr)", color: "photo", icon: "flickr" },
    { key: "merch",     title: "Merch Collab", color: "merch", icon: "bag" },
  ];

  const needs = useMemo(() => ({
    instagram: (LINKS_EMBEDS.instagram?.length || 0) > 0,
    twitter:   (LINKS_EMBEDS.x?.length || 0) > 0,
    tiktok:    (LINKS_EMBEDS.tiktok?.length || 0) > 0,
    // flickr is iframe; no script needed
  }), []);

  return (
    <div className="container py-4">
      <h1>Links</h1>
      <p className="text-muted">Follow AreaRED and check out the merch collab. Featured posts appear below when added.</p>

      <EmbedScriptLoader needs={needs} />

      <div className="linklist">
        {sections.map(({ key, title, color, icon }) => (
          <div key={key} className="linklist-section">
            <div className="linklist-head">
              <span className={`icon-bubble ${color}`} aria-hidden="true">
                <BrandIcon name={icon} />
              </span>
              <h3>{title}</h3>
            </div>

            {/* Accounts */}
            <div className="linklist-links">
              {(LINKS_ACCOUNTS[key] || []).map((acc) => (
                <a
                  key={acc.label}
                  href={acc.url}
                  target="_blank"
                  rel="noreferrer"
                  className={`link-chip accent-${color}`}
                >
                  {acc.label}
                </a>
              ))}
            </div>

            {/* Optional Embeds */}
            {(LINKS_EMBEDS[key]?.length ?? 0) > 0 && (
              <div className="embed-grid">
                {LINKS_EMBEDS[key].map((url, i) => (
                  <Embed key={i} kind={key} url={url} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Renders each platform’s embed in a responsive wrapper */
function Embed({ kind, url }) {
  switch (kind) {
    case "instagram":
      return (
        <div className="embed-box">
          <blockquote
            className="instagram-media"
            data-instgrm-permalink={url}
            data-instgrm-version="14"
            style={{ background: "#fff", border: 0, margin: 0, padding: 0, width: "100%" }}
          />
        </div>
      );
    case "tiktok":
      return (
        <div className="embed-box">
          <blockquote className="tiktok-embed" cite={url} data-video-id="" style={{ width: "100%" }}>
            <a href={url}>View on TikTok</a>
          </blockquote>
        </div>
      );
    case "x":
      return (
        <div className="embed-box">
          <blockquote className="twitter-tweet">
            <a href={url}>View on X</a>
          </blockquote>
        </div>
      );
    case "flickr":
      // Flickr “player” or album embeds can be in iframes
      return (
        <div className="embed-box">
          <iframe
            src={url}
            title="Flickr"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      );
    default:
      return null;
  }
}