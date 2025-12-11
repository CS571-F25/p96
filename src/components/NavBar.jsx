import React from "react";
import { NavLink, Link } from "react-router-dom";
import { Container, Nav, Navbar } from "react-bootstrap";
import logo from "../assets/AreaREDLogo.png";

export default function NavBar({ user }) {
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
          <Nav.Link as={NavLink} to="/committees" className="navlink-pill">Committees</Nav.Link>
          <Nav.Link as={NavLink} to="/links" className="navlink-pill">Links</Nav.Link>

          {user && (
            <Nav.Link as={NavLink} to="/chat" className="navlink-pill">
              Chat
            </Nav.Link>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}