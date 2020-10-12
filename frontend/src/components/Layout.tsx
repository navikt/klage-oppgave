import NavFrontendSpinner from "nav-frontend-spinner";
import React from "react";

interface LayoutType {
  children: JSX.Element;
  loading: boolean;
}

import PropTypes from "prop-types";

export default function Layout({ children, loading }: LayoutType) {
  return (
    <main className="container">
      <header className="main-head">
        <div>NAV Klage</div>
      </header>
      <nav className="main-nav" role="navigation" aria-label="Meny">
        <ul>
          <li>
            <a className="active" href="">
              Saker
            </a>
          </li>
          <li>
            <a href="">Mine&nbsp;Saker</a>
          </li>
          <li>
            <a href="">Innstillinger</a>
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
