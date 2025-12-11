// src/pages/CommitteeLayout.jsx
import React from "react";
import { Outlet, useParams } from "react-router-dom";
import { COMMITTEES } from "../data/committees";
import Breadcrumbs from "../components/Breadcrumbs";
import Avatar from "../components/Avatar";
import CommitteeSubnav from "../components/CommitteeSubnav";

export default function CommitteeLayout() {
  const { slug } = useParams();
  const committee = COMMITTEES.find((c) => c.slug === slug);

  if (!committee) {
    return (
      <div className="container py-4">
        <h1>Committee not found</h1>
        <p>Check the URL or choose a committee from the menu.</p>
      </div>
    );
  }

  const crumbs = [
    { label: "Committees", to: "/committees" },
    { label: committee.name },
  ];
  const base = `/committees/${committee.slug}`;

  return (
    <div className="container py-3">
      <Breadcrumbs items={crumbs} />

      <header className="d-flex align-items-center gap-3 mb-2">
        <Avatar
          src={committee.logo}
          alt={`${committee.name} logo`}
          letter={committee.icon || committee.name[0]}
          size={44}
        />
        <div>
          <h1 className="mb-0">{committee.name}</h1>
          {committee.subtitle && <div className="text-muted">{committee.subtitle}</div>}
        </div>
      </header>

      <CommitteeSubnav base={base} isSport={!!committee.isSport} />

      <Outlet context={{ committee }} />
    </div>
  );
}