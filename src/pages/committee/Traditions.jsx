import React from "react";
import { useOutletContext } from "react-router-dom";

export default function Traditions() {
  const { committee } = useOutletContext();
  return (
    <section className="card p-3">
      <h2 className="h4 mb-2">Traditions — {committee.name}</h2>
      <p className="mb-2">Signature chants, songs, and rituals that define the {committee.name} experience.</p>
      <ul className="mb-0">
        <li>Signature chants (with timing cues)</li>
        <li>Section rituals (third-down motion, power plays, set point hype, etc.)</li>
        <li>Theme nights & attire</li>
        <li>Fan engagement moments</li>
      </ul>
    </section>
  );
}