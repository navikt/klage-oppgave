import React from "react";
import { Header } from "./Header/Header";
import Alertstripe from "nav-frontend-alertstriper";

interface LayoutType {
  children: JSX.Element;
}

import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { velgMeg } from "../tilstand/moduler/meg.velgere";

import { Sok } from "./Header/Sok";
import { velgToaster, velgToasterMelding } from "../tilstand/moduler/toaster.velgere";

export default function Oppsett({ children }: LayoutType) {
  const person = useSelector(velgMeg);
  const visFeilmelding = useSelector(velgToaster);
  const feilmelding = useSelector(velgToasterMelding);
  return (
    <main className="container" data-testid="klagesiden">
      <Header tittel="Nav Klage" brukerinfo={{ navn: person.navn, ident: person.id }}>
        <Sok onSok={() => Promise.resolve("test")} />
      </Header>
      <nav className="main-nav" role="navigation" aria-label="Meny">
        <ul>
          <li>
            <NavLink className="link" to="/saker">
              Oppgaver
            </NavLink>
          </li>
          <li>
            <NavLink className="link" to="/minesaker">
              Mine&nbsp;Oppgaver
            </NavLink>
          </li>
          <li className={"skjult"}>
            <NavLink className="link" to="/innstillinger">
              Innstillinger
            </NavLink>
          </li>
        </ul>
      </nav>
      <div className="toaster">
        {visFeilmelding && (
          <Alertstripe type="feil">
            <span>{feilmelding}</span>
          </Alertstripe>
        )}
      </div>
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
