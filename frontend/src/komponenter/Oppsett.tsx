import NavFrontendSpinner from "nav-frontend-spinner";
import React from "react";
import { Header } from "./Header/Header";

interface LayoutType {
  children: JSX.Element;
}

import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { velgMeg } from "../tilstand/moduler/meg.velgere";
import { Sok } from "./Header/Sok";

export default function Oppsett({ children }: LayoutType) {
  const person = useSelector(velgMeg);
  return (
    <main className="container">
      <Header tittel="Nav Klage" brukerinfo={{ navn: person.navn, ident: person.id }}>
        <Sok onSok={() => Promise.resolve("test")} />
      </Header>
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
      <article className="content">{children}</article>
      <footer className="main-footer"></footer>
    </main>
  );
}

Oppsett.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element.isRequired,
  ]),
};
