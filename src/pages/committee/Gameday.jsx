import React from "react";
import { useOutletContext } from "react-router-dom";

export default function Gameday() {
  const { committee } = useOutletContext();
  return (
    <section className="section">
      <h2 className="h4 mb-2">Gameday Guide — {committee.name}</h2>
      <p className="mb-2">Everything you need to know for game operations (timelines, chants, signs, props, roles).</p>
      <div className="divider"></div>
      <ul className="mb-0">
        <li>Call times & meet locations</li>
        <li>Pre-game setup checklist</li>
        <li>In-game roles & rotations</li>
        <li>Halftime / intermission tasks</li>
        <li>Post-game teardown</li>
      </ul>
    </section>
  );
}