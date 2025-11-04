import React, { useRef, useState } from "react";
import { Navbar, Nav, Container, Dropdown } from "react-bootstrap";
import { Link, NavLink } from "react-router-dom";
import { COMMITTEES } from "../data/committees";
import logo from "../assets/AreaREDLogo.png";

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const hoverTimer = useRef(null);

  const openNow = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setOpen(true);
  };
  const closeSoon = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setOpen(false), 140);
  };
  const handleToggle = (nextOpen, e) => {
    if (e?.source === "click" || e?.source === "select") setOpen(nextOpen);
  };

  return (
    <Navbar className="navbar-uw navbar-elevated" variant="dark">
      <Container fluid>
        {/* Brand logo only */}
        <Navbar.Brand as={Link} to="/" className="brand-uw d-flex align-items-center">
          <img src={logo} alt="AreaRED Logo" className="brand-logo" />
        </Navbar.Brand>

        {/* Inline, scrollable nav row */}
        <Nav className="flex-row flex-nowrap ms-auto nav-scroll">
          <Nav.Link as={NavLink} to="/" end className="navlink-pill">Home</Nav.Link>
          <Nav.Link as={NavLink} to="/calendar" className="navlink-pill">Calendar</Nav.Link>
          <Nav.Link as={NavLink} to="/volunteer" className="navlink-pill">Volunteer</Nav.Link>
          <Nav.Link as={NavLink} to="/get-involved" className="navlink-pill">Get Involved</Nav.Link>

          {/* Committees dropdown (controlled for reliable hover) */}
          <Dropdown
            className={`position-static navlink-dropdown${open ? " show" : ""}`}
            onMouseEnter={openNow}
            onMouseLeave={closeSoon}
            onToggle={handleToggle}
            show={open}
          >
            <Dropdown.Toggle as="a" className="nav-link navlink-pill has-caret" href="#">
              Committees <span className="rb-caret" aria-hidden="true"></span>
            </Dropdown.Toggle>

            <Dropdown.Menu className="dropdown-menu-uw p-2">
              <div className="dropdown-header-uw">
                <div className="dropdown-title">Committees</div>
                <Link to="/committees" className="dropdown-viewall">View all</Link>
              </div>

              {/* Two-column grid of committees */}
              <div className="dropdown-grid">
                {COMMITTEES.map(c => (
                  <Link
                    key={c.slug}
                    to={`/committees/${c.slug}/info`}
                    className="dropdown-committee-item"
                    onClick={() => setOpen(false)}
                  >
                    <span className="committee-dot" aria-hidden="true">
                      {(c.icon || c.name.charAt(0)).toUpperCase()}
                    </span>
                    <span className="committee-name">{c.name}</span>
                  </Link>
                ))}
              </div>

              <div className="dropdown-footer-uw">
                <span>Looking to help?</span>
                <Link to="/volunteer" onClick={() => setOpen(false)}>Open volunteer needs</Link>
              </div>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </Container>
    </Navbar>
  );
}