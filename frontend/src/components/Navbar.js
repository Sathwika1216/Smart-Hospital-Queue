import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

/**
 * Top navigation for all main flows: intake, monitoring, doctor desk, and lookup.
 */
function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar__inner">
        <NavLink to="/" className="navbar__brand" end>
          <span className="navbar__logo" aria-hidden>
            +
          </span>
          <span className="navbar__titles">
            <span className="navbar__title">Smart Hospital Queue</span>
            <span className="navbar__subtitle">Management System</span>
          </span>
        </NavLink>

        <nav className="navbar__links" aria-label="Primary">
          <NavLink className="navbar__link" to="/">
            Register
          </NavLink>
          <NavLink className="navbar__link" to="/queue">
            Queue
          </NavLink>
          <NavLink className="navbar__link" to="/doctor">
            Doctor
          </NavLink>
          <NavLink className="navbar__link" to="/status">
            Status
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
