import NavFrontendSpinner from "nav-frontend-spinner";
import React from "react";

interface LayoutType {
  children: JSX.Element;
  loading: boolean;
}

import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";

export default function Layout({ children, loading }: LayoutType) {
  return (
    <main className="container">
      <header className="main-head">
        <div>NAV Klage</div>
      </header>
      <nav className="main-nav" role="navigation" aria-label="Meny">
        <ul>
          <li>
            <NavLink className="link" to="/saker">
              Saker
            </NavLink>
          </li>
          <li>
            <NavLink className="link" to="/minesaker">
              Mine&nbsp;Saker
            </NavLink>
          </li>
          <li>
            <NavLink className="link" to="/innstillinger">
              Innstillinger
            </NavLink>
          </li>
        </ul>
      </nav>
      <article className="content">
        {loading ? <NavFrontendSpinner /> : children}
      </article>
      <footer className="main-footer">
        <div>Bunnlinje</div>
      </footer>
    </main>
  );
}

Layout.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element.isRequired,
  ]),
  loading: PropTypes.bool.isRequired,
};
