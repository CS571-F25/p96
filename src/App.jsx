import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";

// Pages
import Home from "./pages/Home";
import Calendar from "./pages/Calendar";
import Volunteer from "./pages/Volunteer";
import GetInvolved from "./pages/GetInvolved";
import CommitteesIndex from "./pages/CommitteesIndex";
import CommitteeInfo from "./pages/CommitteeInfo";
import CommitteeMembers from "./pages/CommitteeMembers";
import CommitteeContact from "./pages/CommitteeContact";

export default function App() {
  return (
    <HashRouter>
      <NavBar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/volunteer" element={<Volunteer />} />
          <Route path="/get-involved" element={<GetInvolved />} />

          {/* All Committees landing */}
          <Route path="/committees" element={<CommitteesIndex />} />

          {/* Per-committee subpages */}
          <Route path="/committees/:slug/info" element={<CommitteeInfo />} />
          <Route path="/committees/:slug/members" element={<CommitteeMembers />} />
          <Route path="/committees/:slug/contact" element={<CommitteeContact />} />

          {/* Fallback */}
          <Route
            path="*"
            element={
              <div className="container py-4">
                <h1>Not Found</h1>
                <p>That page doesn’t exist yet.</p>
              </div>
            }
          />
        </Routes>
      </main>
    </HashRouter>
  );
}