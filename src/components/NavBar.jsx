import React, { useRef, useState } from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/AreaREDLogo.png";

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const hoverTimer = useRef(null);
  const navigate = useNavigate();

  return (
    <Navbar className="navbar-uw navbar-elevated" variant="dark">
      <Container fluid className="navbar-container">
        {/* Brand */}
        <div className="brand-row">
          <Navbar.Brand
            as={Link}
            to="/"
            className="brand-uw d-flex align-items-center"
            onClick={() => setOpen(false)}
          >
            <img src={logo} alt="AreaRED Logo" className="brand-logo" />
          </Navbar.Brand>
        </div>

        {/* Nav */}
        <Nav className="nav-row">
          <Nav.Link as={NavLink} to="/" end className="navlink-pill" onClick={() => setOpen(false)}>
            Home
          </Nav.Link>

          <Nav.Link as={NavLink} to="/calendar" className="navlink-pill" onClick={() => setOpen(false)}>
            Calendar
          </Nav.Link>

          <Nav.Link
            as={NavLink}
            to="/committees"
            className="navlink-pill"
            onClick={() => setOpen(false)}
          >
            Committees
          </Nav.Link>

          <Nav.Link
            as={NavLink}
            to="/get-involved"
            className="navlink-pill"
            onClick={() => setOpen(false)}
          >
            Get Involved
          </Nav.Link>

          <Nav.Link
            as={NavLink}
            to="/links"
            className="navlink-pill"
            onClick={() => setOpen(false)}
          >
            Links
          </Nav.Link>
        </Nav>
      </Container>
    </Navbar>
  );
}