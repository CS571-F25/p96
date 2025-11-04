import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";

import NavBar from "./components/NavBar";

import Home from "./pages/Home";
import CalendarPage from "./pages/Calendar";
import Volunteer from "./pages/Volunteer";
import GetInvolved from "./pages/GetInvolved";
import CommitteesIndex from "./pages/CommitteesIndex";

import CommitteeLayout from "./pages/CommitteeLayout";
import Info from "./pages/committee/Info";
import Members from "./pages/committee/Members";
import Contact from "./pages/committee/Contact";
import Gameday from "./pages/committee/Gameday";
import Traditions from "./pages/committee/Traditions";

export default function App() {
  return (
    <Router>
      <NavBar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/volunteer" element={<Volunteer />} />
          <Route path="/get-involved" element={<GetInvolved />} />

          <Route path="/committees" element={<CommitteesIndex />} />

          {/* Nested committee routes */}
          <Route path="/committees/:slug" element={<CommitteeLayout />}>
            <Route path="info" element={<Info />} />
            <Route path="members" element={<Members />} />
            <Route path="contact" element={<Contact />} />
            {/* Sports-only extra tabs (safe to visit for any) */}
            <Route path="gameday" element={<Gameday />} />
            <Route path="traditions" element={<Traditions />} />
            <Route index element={<Info />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
    </Router>
  );
}