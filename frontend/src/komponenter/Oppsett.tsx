import React, { useEffect } from "react";
import { Header } from "./Header/Header";
import Alertstripe from "nav-frontend-alertstriper";

interface LayoutType {
  children: JSX.Element;
}

import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import { velgMeg } from "../tilstand/moduler/meg.velgere";
import { velgFeatureToggles } from "../tilstand/moduler/unleash.velgere";

import { Sok } from "./Header/Sok";
import { velgToaster, velgToasterMelding } from "../tilstand/moduler/toaster.velgere";
import { hentFeatureToggleHandling } from "../tilstand/moduler/unleash";

export default function Oppsett({ children }: LayoutType) {
  const person = useSelector(velgMeg);
  const visFeilmelding = useSelector(velgToaster);
  const feilmelding = useSelector(velgToasterMelding);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(hentFeatureToggleHandling("klage.generellTilgang"));
  }, []);

  return (
    <main className="container" data-testid="klagesiden">
      <Header tittel="Nav Klage" brukerinfo={{ navn: person.navn, ident: person.id }}>
        {/* <Sok onSok={() => Promise.resolve("test")} /> */}
      </Header>
      <nav className="main-nav" role="navigation" aria-label="Meny">
        <ul>
          <li>
            <NavLink className="link" to="/oppgaver">
              Oppgaver
            </NavLink>
          </li>
          <li>
            <NavLink className="link" to="/mineoppgaver">
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
