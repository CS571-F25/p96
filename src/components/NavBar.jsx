import React, { useRef, useState } from "react";
import { Navbar, Nav, Container, Dropdown } from "react-bootstrap";
import { Link, NavLink } from "react-router-dom";
import { COMMITTEES } from "../data/committees";
import Avatar from "./Avatar";
import logo from "../assets/AreaREDLogo.png";

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const hoverTimer = useRef(null);

  const openNow = () => { if (hoverTimer.current) clearTimeout(hoverTimer.current); setOpen(true); };
  const closeSoon = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setOpen(false), 120);
  };
  const handleToggle = (nextOpen, e) => {
    if (e?.source === "click" || e?.source === "select") setOpen(nextOpen);
  };

  return (
    <Navbar className="navbar-uw navbar-elevated" variant="dark">
      <Container fluid className="navbar-container">
        <div className="brand-row">
          <Navbar.Brand as={Link} to="/" onClick={() => setOpen(false)}>
            <img src={logo} alt="AreaRED Logo" className="brand-logo" />
          </Navbar.Brand>
        </div>

        <Nav className="nav-row">
          <Nav.Link as={NavLink} to="/" end className="navlink-pill" onClick={() => setOpen(false)}>Home</Nav.Link>
          <Nav.Link as={NavLink} to="/calendar" className="navlink-pill" onClick={() => setOpen(false)}>Calendar</Nav.Link>
          <Nav.Link as={NavLink} to="/volunteer" className="navlink-pill" onClick={() => setOpen(false)}>Volunteer</Nav.Link>
          <Nav.Link as={NavLink} to="/get-involved" className="navlink-pill" onClick={() => setOpen(false)}>Get Involved</Nav.Link>

          <Dropdown
            className={`navlink-dropdown${open ? " show" : ""}`}
            onMouseEnter={openNow}
            onMouseLeave={closeSoon}
            onToggle={handleToggle}
            show={open}
          >
            <Dropdown.Toggle as="a" href="#" className="nav-link navlink-pill has-caret"
              onClick={(e) => e.preventDefault()}>
              Committees <span className="rb-caret" />
            </Dropdown.Toggle>

            <Dropdown.Menu
              className="dropdown-menu-uw p-2"
              align="end"
              flip
              renderOnMount
              popperConfig={{
                strategy: "fixed",
                modifiers: [{ name: "preventOverflow", options: { boundary: "viewport", padding: 8 } }]
              }}
            >
              <div className="dropdown-header-uw">
                <div className="dropdown-title">Committees</div>
                <Link to="/committees" className="dropdown-viewall" onClick={() => setOpen(false)}>
                  View all
                </Link>
              </div>

              <div className="dropdown-grid">
                {COMMITTEES.map((c) => (
                  <Link
                    key={c.slug}
                    to={`/committees/${c.slug}/info`}
                    className="dropdown-committee-item"
                    onClick={() => setOpen(false)}
                  >
                    <Avatar src={c.logo} alt={`${c.name} logo`} letter={c.icon || c.name[0]} size={28} />
                    <span className="committee-name">{c.name}</span>
                  </Link>
                ))}
              </div>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </Container>
    </Navbar>
  );
}