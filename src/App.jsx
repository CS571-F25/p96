// src/App.jsx
import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";

import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import CalendarPage from "./pages/Calendar";
import CommitteesIndex from "./pages/CommitteesIndex";
import Links from "./pages/Links";

import CommitteeLayout from "./pages/CommitteeLayout";
import Info from "./pages/committee/Info";
import Members from "./pages/committee/Members";
import Contact from "./pages/committee/Contact";
import Gameday from "./pages/committee/Gameday";
import Traditions from "./pages/committee/Traditions";

import { VolunteerProvider } from "./context/VolunteerContext";

import "./theme.css";

export default function App() {
  return (
    <VolunteerProvider>
      <Router>
        <NavBar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/links" element={<Links />} />

            <Route path="/committees" element={<CommitteesIndex />} />

            <Route path="/committees/:slug" element={<CommitteeLayout />}>
              <Route index element={<Info />} />
              <Route path="info" element={<Info />} />
              <Route path="members" element={<Members />} />
              <Route path="contact" element={<Contact />} />
              <Route path="gameday" element={<Gameday />} />
              <Route path="traditions" element={<Traditions />} />
            </Route>

            <Route path="*" element={<Home />} />
          </Routes>
        </main>
      </Router>
    </VolunteerProvider>
  );
}