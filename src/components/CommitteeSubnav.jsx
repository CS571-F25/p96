import React from "react";
import { NavLink } from "react-router-dom";

export default function CommitteeSubnav({ base, isSport }) {
  return (
    <div className="subnav-uw">
      <NavLink to={`${base}/info`}>Info</NavLink>
      {isSport && <NavLink to={`${base}/gameday`}>Gameday</NavLink>}
      {isSport && <NavLink to={`${base}/traditions`}>Traditions</NavLink>}
      <NavLink to={`${base}/members`}>Members</NavLink>
      <NavLink to={`${base}/contact`}>Contact</NavLink>
    </div>
  );
}