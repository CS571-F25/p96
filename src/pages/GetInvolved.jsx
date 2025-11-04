import React from "react";
import { Link } from "react-router-dom";

export default function GetInvolved() {
  return (
    <div className="container py-4">
      <h1>Get Involved</h1>
      <ol className="mt-3 mb-3">
        <li>Come to the next <strong>AreaRED General Meeting</strong> (see Calendar).</li>
        <li>Pick a <strong>committee</strong> that excites you.</li>
        <li>Join a <strong>group chat</strong> / follow socials and show up!</li>
      </ol>

      <div className="card p-3 mb-3">
        <h5>Quick Links</h5>
        <div className="d-flex flex-wrap gap-2 mt-2">
          <Link to="/committees" className="btn btn-light">All Committees</Link>
          <Link to="/volunteer" className="btn btn-light">Open Volunteer Needs</Link>
          <a href="https://www.flickr.com/" target="_blank" rel="noreferrer" className="btn btn-light">Flickr (Photos)</a>
          <a href="#" className="btn btn-light" onClick={(e)=>{e.preventDefault(); alert("Placeholder for merch collab link.");}}>Merch Collab</a>
        </div>
      </div>

      <div className="card p-3">
        <h5>FAQ (Placeholder)</h5>
        <p className="mb-2"><strong>How do I join?</strong> Show up! Most roles are open—introduce yourself and jump in.</p>
        <p className="mb-0"><strong>What if I’ve never done this?</strong> Perfect—committee leads will help you get started.</p>
      </div>
    </div>
  );
}