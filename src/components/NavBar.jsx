import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { Link, NavLink } from "react-router-dom";
import logo from "../assets/AreaREDLogo.png";

/** Simplified navbar (no dropdown) */
export default function NavBar() {
  return (
    <Navbar className="navbar-uw navbar-elevated" variant="dark">
      <Container fluid className="navbar-container">
        <div className="brand-row">
          <Navbar.Brand as={Link} to="/" className="brand-uw d-flex align-items-center">
            <img src={logo} alt="AreaRED Logo" className="brand-logo" />
          </Navbar.Brand>
        </div>

        <Nav className="nav-row">
          <Nav.Link as={NavLink} to="/" end className="navlink-pill">Home</Nav.Link>
          <Nav.Link as={NavLink} to="/calendar" className="navlink-pill">Calendar</Nav.Link>
          <Nav.Link as={NavLink} to="/volunteer" className="navlink-pill">Volunteer</Nav.Link>
          <Nav.Link as={NavLink} to="/get-involved" className="navlink-pill">Get Involved</Nav.Link>
          <Nav.Link as={NavLink} to="/committees" className="navlink-pill">Committees</Nav.Link>
          <Nav.Link as={NavLink} to="/links" className="navlink-pill">Links</Nav.Link> {/* NEW */}
        </Nav>
      </Container>
    </Navbar>
  );
}