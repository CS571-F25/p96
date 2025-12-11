import React, { useEffect, useState } from "react";
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

import AuthStatus from "./components/AuthStatus";
import SignInPage from "./pages/SignInPage";
import ChatPage from "./pages/ChatPage";

import { getAuth, onAuthStateChanged } from "firebase/auth";

import "./theme.css";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  return (
    <Router>
      <NavBar user={user} />
      <AuthStatus user={user} />

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/links" element={<Links />} />

          {/* Chat — only allowed if signed in */}
          {user && <Route path="/chat" element={<ChatPage user={user} />} />}

          {/* Committees */}
          <Route path="/committees" element={<CommitteesIndex />} />
          <Route path="/committees/:slug" element={<CommitteeLayout />}>
            <Route index element={<Info />} />
            <Route path="info" element={<Info />} />
            <Route path="members" element={<Members />} />
            <Route path="contact" element={<Contact />} />
            <Route path="gameday" element={<Gameday />} />
            <Route path="traditions" element={<Traditions />} />
          </Route>

          {/* Auth */}
          <Route path="/signin" element={<SignInPage />} />

          <Route path="*" element={<Home />} />
        </Routes>
      </main>
    </Router>
  );
}