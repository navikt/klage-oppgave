import NavFrontendSpinner from "nav-frontend-spinner";
import React from "react";
import "../Header.less";

interface LayoutType {
  children: JSX.Element;
  isFetching: boolean;
}

import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";

export default function Layout({ children, isFetching }: LayoutType) {
  return (
    <main className="container">
      <header className="main-head">
        <div className="left">
          <div className="logo">NAV Klage</div>
          <div className="search">Søk</div>
        </div>
        <div className="right">
          <div className="menu">SVG</div>
          <div className="name">Navn Navnesen</div>
        </div>
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
        {isFetching ? <NavFrontendSpinner /> : children}
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
  isFetching: PropTypes.bool.isRequired,
};
