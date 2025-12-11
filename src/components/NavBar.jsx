// src/components/NavBar.jsx
import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { Link, NavLink } from "react-router-dom";
import logo from "../assets/AreaREDLogo.png";
import AuthStatus from "./AuthStatus";
import { useAuth } from "../context/AuthContext";

export default function NavBar() {
  const { user } = useAuth();

  return (
    <Navbar className="navbar-uw navbar-elevated" variant="dark">
      <Container fluid className="navbar-container">
        {/* Top row: logo centered on small, left on large */}
        <div className="brand-row">
          <Navbar.Brand
            as={Link}
            to="/"
            className="brand-uw d-flex align-items-center"
          >
            <img src={logo} alt="AreaRED Logo" className="brand-logo" />
          </Navbar.Brand>
        </div>

        {/* Main nav row (sits below logo on small, inline on large) */}
        <Nav className="nav-row">
          <Nav.Link as={NavLink} to="/" end className="navlink-pill">
            Home
          </Nav.Link>

          <Nav.Link as={NavLink} to="/calendar" className="navlink-pill">
            Calendar
          </Nav.Link>

          <Nav.Link as={NavLink} to="/committees" className="navlink-pill">
            Committees
          </Nav.Link>

          <Nav.Link as={NavLink} to="/links" className="navlink-pill">
            Links
          </Nav.Link>

          {/* Chat only visible when signed in */}
          {user && (
            <Nav.Link as={NavLink} to="/chat" className="navlink-pill">
              Chat
            </Nav.Link>
          )}
        </Nav>

        {/* Sign in / user pill – pinned to top-right of the navbar */}
        <div className="auth-row">
          <AuthStatus />
        </div>
      </Container>
    </Navbar>
  );
}