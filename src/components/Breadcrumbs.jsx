import React from "react";
import { Link } from "react-router-dom";

export default function Breadcrumbs({ items = [] }) {
  if (!items.length) return null;
  return (
    <nav aria-label="breadcrumb" className="breadcrumb-uw">
      {items.map((it, i) => {
        const last = i === items.length - 1;
        return (
          <React.Fragment key={i}>
            {i > 0 && <span className="crumb-sep">›</span>}
            {last || !it.to ? (
              <span aria-current="page">{it.label}</span>
            ) : (
              <Link to={it.to}>{it.label}</Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}